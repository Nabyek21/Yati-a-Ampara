# 🔄 FLUJO COMPLETO: Cómo funciona la carga de contenido

## 📋 Resumen Visual

```
PROFESOR (FRONTEND)
    ↓
    Prepara contenido
    (MD, PDF, VIDEO, etc)
    ↓
    Accede a su curso
    ↓
    Click en "Cargar Contenido"
    ↓
    Selecciona archivo + info
    ↓
    Click "Subir"
         ↓
         ┌─────────────────────┐
         │   FRONTEND ENVÍA    │
         │ POST /api/...       │
         │ Content-Type:       │
         │ multipart/form-data │
         └─────────────────────┘
         ↓
    BACKEND RECIBE
    ↓
    uploadRoutes.js
    ├─ Middleware: captureModuloId
    │  └─ Captura id_modulo del query param
    ├─ Middleware: upload.single('archivo')
    │  └─ Multer procesa el archivo
    │     ├─ Genera nombre único
    │     ├─ Guarda en /uploads/contenidos/
    │     └─ Almacena en req.file
    └─ Handler de ruta
       ├─ Obtiene datos del formulario
       ├─ Llama ContenidoUploadController
       └─ Retorna respuesta JSON
           ↓
    ContenidoUploadController.cargarContenido()
    ├─ Extrae datos de req.body y req.file
    ├─ Valida:
    │  ├─ ¿Faltan datos requeridos?
    │  ├─ ¿Es docente (rol=3)?
    │  └─ ¿Es dueño del módulo?
    ├─ Determina si es archivo o URL
    ├─ Llama ContenidoUploadService
    └─ Retorna resultado
         ↓
    ContenidoUploadService
    ├─ validarTipoArchivo()
    │  └─ ¿Tipo permitido? (pdf, video, doc, etc)
    ├─ generarNombreArchivoUnico()
    │  └─ nombre-timestamp-random.ext
    ├─ cargarArchivo() [si hay archivo]
    │  ├─ Guarda buffer en disco
    │  └─ Retorna ruta
    ├─ crearContenidoConArchivo()
    │  ├─ Prepara datos para BD
    │  ├─ INSERT INTO modulo_contenido
    │  └─ Retorna registro creado
    └─ O: crearContenidoConURL()
       ├─ Prepara URL externa
       ├─ INSERT INTO modulo_contenido
       └─ Retorna registro creado
            ↓
    BASE DE DATOS
    ├─ modulo_contenido (nuevos registros)
    │  ├─ id_contenido (auto)
    │  ├─ id_modulo
    │  ├─ id_seccion
    │  ├─ tipo (pdf, video, etc)
    │  ├─ titulo
    │  ├─ descripcion
    │  ├─ url_contenido (NULL si archivo)
    │  ├─ ruta_archivo (NULL si URL)
    │  ├─ fecha_creacion
    │  └─ id_docente
    │
    └─ Disco duro
       ├─ /uploads/contenidos/
       │  └─ clase-01-intro-algebra-1734000000-abcd1234.pdf
       │  └─ video-algebra-1734000001-efgh5678.mp4
       └─ etc
            ↓
    BACKEND RESPONDE
    ├─ Status 201 (creado)
    └─ JSON:
       ├─ mensaje: "Contenido cargado exitosamente"
       └─ datos:
          ├─ id_contenido
          ├─ titulo
          ├─ tipo
          └─ fecha_creacion
            ↓
    FRONTEND MUESTRA
    ├─ ✅ "Contenido cargado"
    └─ Actualiza lista de contenidos
         ↓
    ESTUDIANTE VE
    ├─ Accede al módulo
    ├─ Ve contenidos listados
    ├─ Puede descargar/reproducir
    └─ Sistema generará resumen con IA
```

---

## 🔗 Endpoints disponibles

### 1. Cargar contenido
```
POST /api/upload/contenido?id_modulo=1
Content-Type: multipart/form-data

Body:
- archivo: [binary file]
- titulo: "Introducción al Álgebra"
- tipo: "pdf"
- descripcion: "Primera clase de álgebra"
- id_seccion: 1

Respuesta (201):
{
  "mensaje": "Archivo subido correctamente",
  "filename": "clase-01-intro-1734000000-abc123.pdf",
  "originalname": "clase-01-intro.pdf",
  "size": 2048000,
  "id_modulo": "1",
  "path": "uploads/contenidos/clase-01-intro-1734000000-abc123.pdf"
}
```

### 2. Cargar vía ContenidoUploadController (más completo)
```
POST /api/modulo-contenido
Content-Type: application/json o multipart/form-data

Body (JSON):
{
  "id_modulo": 1,
  "id_seccion": 1,
  "tipo": "pdf",
  "titulo": "Clase 1",
  "descripcion": "Introducción",
  "url_contenido": null   // o URL si es enlace externo
}

O Body (multipart):
- id_modulo: 1
- id_seccion: 1
- tipo: pdf
- titulo: Clase 1
- descripcion: Introducción
- archivo: [binary file]

Respuesta (201):
{
  "mensaje": "Contenido cargado exitosamente",
  "datos": {
    "id_contenido": 42,
    "id_modulo": 1,
    "id_seccion": 1,
    "tipo": "pdf",
    "titulo": "Clase 1",
    "descripcion": "Introducción",
    "ruta_archivo": "uploads/contenidos/clase-01-1734000000-abc123.pdf",
    "fecha_creacion": "2025-12-10 10:30:00",
    "id_docente": 5
  }
}
```

### 3. Obtener contenidos de un módulo
```
GET /api/modulo-contenido/modulo/1

Respuesta (200):
{
  "total": 2,
  "datos": [
    {
      "id_contenido": 41,
      "titulo": "Introducción al Álgebra",
      "tipo": "pdf",
      "descripcion": "Clase 1",
      "url_contenido": null,
      "ruta_archivo": "uploads/contenidos/clase-01-1734000000-abc123.pdf",
      "fecha_creacion": "2025-12-10 10:20:00"
    },
    {
      "id_contenido": 42,
      "titulo": "Video: Ecuaciones",
      "tipo": "video",
      "descripcion": "Explicación de ecuaciones",
      "url_contenido": "https://youtube.com/watch?v=xyz",
      "ruta_archivo": null,
      "fecha_creacion": "2025-12-10 10:30:00"
    }
  ]
}
```

### 4. Descargar contenido
```
GET /api/modulo-contenido/42/descargar

Respuesta: Descarga directa del archivo
```

---

## 🛡️ Validaciones en cada paso

### Frontend
- ✅ Usuario logueado
- ✅ Seleccionó archivo o URL
- ✅ Llenó campos requeridos (titulo, tipo)
- ✅ Archivo no mayor a 50MB

### Middleware (uploadRoutes)
- ✅ Multer valida tipo MIME
- ✅ Multer genera nombre único
- ✅ Multer guarda en disco

### Controller (ContenidoUploadController)
- ✅ Usuario tiene rol docente (3)
- ✅ Usuario es dueño del módulo
- ✅ Datos requeridos presentes
- ✅ Es archivo o URL válido

### Service (ContenidoUploadService)
- ✅ Tipo en lista permitida
- ✅ Extensión válida para tipo
- ✅ Archivo no está dañado
- ✅ Directorio de uploads existe

### Base de Datos
- ✅ id_modulo existe y es válido
- ✅ id_seccion existe y es válida
- ✅ id_docente existe
- ✅ Registra con timestamp

---

## 📊 Tabla de Tipos permitidos

| Tipo | Extensiones | Uso |
|------|------------|-----|
| pdf | .pdf | Documentos, ejercicios |
| video | .mp4, .webm, .avi | Videos educativos |
| documento | .docx, .doc, .txt, .rtf | Apuntes, guías |
| imagen | .jpg, .jpeg, .png, .gif | Diagramas, gráficos |
| presentacion | .ppt, .pptx | Diapositivas |
| url | (link) | YouTubes, Vimeo, enlaces externos |

---

## 🤖 Flujo de IA (Automático después de cargar)

```
Contenido cargado
    ↓
Sistema detiene que es nuevo
    ↓
¿Es PDF, DOCX o TXT?
├─ Sí: Extrae texto
│      ↓
│      Envía a IA (API externa)
│      ↓
│      IA genera resumen
│      ↓
│      Guarda en campo resumen_ia
│
├─ ¿Es VIDEO?
│  ├─ Sí: Extrae audio → Transcribe → Envía a IA
│  │      ↓
│  │      IA genera resumen
│  │      ↓
│  │      Guarda en resumen_ia
│  │
│  └─ No: (Imagen, URL, etc) - No genera resumen
│
└─ Resumen disponible para estudiantes
```

---

## 🔐 Permisos y seguridad

### Quién puede cargar
- ✅ Docentes (rol = 3)
- ❌ Estudiantes
- ❌ Administrador anónimo

### Quién puede ver
- ✅ Estudiantes de la sección
- ✅ Docente que cargó
- ✅ Administrador

### Quién puede editar/eliminar
- ✅ Docente que cargó (propietario)
- ✅ Administrador
- ❌ Otros docentes
- ❌ Estudiantes

### Rutas de archivos
- Protegidas: /uploads/contenidos/ (requiere autenticación para descargar)
- Públicas: /public/ (si aplica)

---

## 💾 Estructura de directorios

```
backend/
├── src/
│   ├── controllers/
│   │   ├── contenidoUploadController.js
│   │   └── moduloContenidoController.js
│   ├── services/
│   │   └── ContenidoUploadService.js
│   ├── routes/
│   │   ├── uploadRoutes.js
│   │   └── moduloContenidoRoutes.js
│   ├── middlewares/
│   │   └── uploadMiddleware.js
│   └── models/
│       ├── ModuloModel.js
│       └── ModuloContenidoModel.js
│
└── uploads/
    ├── contenidos/        ← Archivos subidos aquí
    │   ├── clase-01-1734000000-abc123.pdf
    │   ├── video-algebra-1734000001-def456.mp4
    │   └── ...
    └── modulos/           ← Otro formato (legacy)
```

---

## ❓ Preguntas comunes

**P: ¿Dónde se guardan los archivos?**  
R: En `/backend/uploads/contenidos/` con nombre único `original-timestamp-random.ext`

**P: ¿Se guarda también en BD?**  
R: Sí, en tabla `modulo_contenido` con metadatos (tipo, título, docente, fecha)

**P: ¿Qué pasa si el archivo es muy grande?**  
R: Multer rechaza con error 413 (Payload too large)

**P: ¿Puedo editar el contenido después?**  
R: Sí, hay endpoint PUT para actualizar metadatos

**P: ¿Puedo eliminar contenido?**  
R: Sí, hay endpoint DELETE (solo para propietario)

**P: ¿Los estudiantes ven inmediatamente?**  
R: Sí, aparece en lista del módulo al instante

**P: ¿Se genera resumen automáticamente?**  
R: Sí, si es PDF/DOCX/TXT (requiere IA configurada)

**P: ¿Puedo cargar URL en lugar de archivo?**  
R: Sí, selecciona tipo "url" y proporciona enlace

---

## 🚀 Para empezar

### Opción 1: Carga desde frontend
1. Inicia sesión como profesor
2. Navega a tu módulo
3. Click "Cargar Contenido"
4. Selecciona archivo o URL
5. Completa formulario
6. Click "Subir"

### Opción 2: Test con cURL
```bash
curl -X POST "http://localhost:3000/api/upload/contenido?id_modulo=1" \
  -H "Authorization: Bearer token_aqui" \
  -F "archivo=@clase-01.pdf" \
  -F "titulo=Clase 1: Introducción" \
  -F "tipo=pdf" \
  -F "id_seccion=1"
```

### Opción 3: Preparar archivos localmente
Copia contenido a `/contenido-cursos/` y carga cuando esté listo

---

**Última actualización:** Diciembre 10, 2025  
**Status:** ✅ Sistema operacional
