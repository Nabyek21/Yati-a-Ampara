# 📚 Contenido de Cursos - SoaYatinya

Esta carpeta contiene el contenido de los cursos que los profesores desean subir al sistema.

## 📁 Estructura

```
contenido-cursos/
├── Matemáticas-Básicas/
│   ├── Módulo-1-Álgebra/
│   │   ├── clase-01-introduccion-algebra.md
│   │   ├── clase-02-ecuaciones-lineales.md
│   │   └── recursos/
│   │       ├── diagrama-ecuaciones.pdf
│   │       └── ejercicios.xlsx
│   │
│   └── Módulo-2-Trigonometría/
│       ├── clase-01-funciones-trigonometricas.md
│       └── recursos/
│           └── graficos-seno-coseno.pdf
│
├── Física-I/
├── Química-General/
└── ...
```

## 🔄 Flujo de Carga de Contenido

### 1. **Profesor prepara el contenido** (LOCAL)
   - Crea archivos `.md` o `.txt` con el contenido de la clase
   - Prepara PDF, imágenes, videos, documentos
   - Los organiza por módulo

### 2. **Profesor accede al sistema** (FRONTEND)
   - Inicia sesión como docente
   - Navega a su curso → módulo → sección
   - Usa el formulario "Cargar Contenido"

### 3. **Frontend envía a Backend** (API)
   ```
   POST /api/modulo-contenido
   o
   POST /api/upload/contenido?id_modulo=X
   
   Datos:
   - id_modulo: ID del módulo
   - id_seccion: ID de la sección
   - tipo: 'pdf' | 'video' | 'documento' | 'imagen' | 'presentacion'
   - titulo: Título del contenido
   - descripcion: Descripción (opcional)
   - archivo: Archivo (multipart/form-data)
   o
   - url_contenido: URL (si es enlace externo)
   ```

### 4. **Backend procesa** (CONTROLLER + SERVICE)

   **ContenidoUploadController:**
   - Valida que sea docente
   - Verifica permisos (es dueño del módulo)
   - Procesa archivo o URL

   **ContenidoUploadService:**
   - Valida tipo de archivo
   - Genera nombre único
   - Guarda en `/uploads/contenidos/`
   - Registra en BD (tabla `modulo_contenido`)

### 5. **BD registra** (DATABASE)
   ```sql
   INSERT INTO modulo_contenido (
     id_modulo, id_seccion, tipo, titulo, descripcion, 
     url_contenido, ruta_archivo, fecha_creacion, id_docente
   ) VALUES (...)
   ```

### 6. **Estudiante ve contenido** (FRONTEND)
   - Accede al módulo
   - Ve lista de contenidos
   - Puede descargar o reproducir
   - Sistema genera resumen con IA

---

## 📝 Cómo organizar tu contenido

### Ejemplo: Matemáticas-Básicas / Módulo-1-Álgebra

**Archivos recomendados:**

```
Módulo-1-Álgebra/
├── LEEME.md                 ← Instrucciones del módulo
├── clase-01.md              ← Clase 1 (Introducción)
├── clase-02.md              ← Clase 2 (Ecuaciones)
├── clase-03.md              ← Clase 3 (Sistemas)
├── actividades/
│   ├── ejercicios-01.pdf
│   ├── ejercicios-02.pdf
│   └── respuestas.pdf
├── recursos/
│   ├── video-introduccion.mp4
│   ├── graficos-ecuaciones.png
│   └── tabla-referencia.xlsx
└── evaluacion/
    ├── quiz-01.pdf
    └── prueba-final.pdf
```

---

## 🚀 Pasos para cargar contenido

### Opción A: Upload directo desde frontend
1. Inicia sesión como profesor
2. Ve a tu curso → módulo
3. Click en "Cargar Contenido"
4. Selecciona archivo (PDF, DOCX, MP4, etc.)
5. Llena: Tipo, Título, Descripción
6. Click "Subir"
7. ✅ Guardado en BD y sistema IA generará resumen

### Opción B: Preparar archivos localmente (esta carpeta)
1. Crea carpeta para tu curso
2. Organiza como el ejemplo anterior
3. Cuando esté listo, carga usando opción A
4. Sistema procesa cada archivo automáticamente

---

## ✅ Validaciones del sistema

### Tipos de archivo permitidos
- **PDF:** `.pdf`
- **Video:** `.mp4`, `.webm`, `.avi`
- **Documento:** `.docx`, `.doc`, `.txt`, `.rtf`
- **Imagen:** `.jpg`, `.jpeg`, `.png`, `.gif`
- **Presentación:** `.ppt`, `.pptx`
- **URL:** Enlaces externos (YouTube, Vimeo, etc.)

### Límites
- Tamaño máximo: 50 MB (configurable)
- Extensiones solo de la lista permitida
- Solo docentes pueden cargar
- Solo en módulos que posee

---

## 🤖 Proceso de IA (automático)

Una vez cargado, el sistema:

1. **Procesa el contenido**
   - Lee texto de PDF
   - Extrae audio de video
   - Lee documentos

2. **Genera resumen**
   - Con IA (API externa)
   - Resume puntos clave
   - Extrae conceptos principales

3. **Guarda resumen**
   - En tabla `modulo_contenido`
   - Campo `resumen_ia`
   - Disponible para estudiantes

---

## 📊 Ejemplo de contenido (Markdown)

### Clase-01.md
```markdown
# Clase 1: Introducción al Álgebra

## Objetivos
- Entender qué es el álgebra
- Aprender notación algebraica
- Resolver ecuaciones simples

## Contenido

### 1. ¿Qué es el álgebra?
El álgebra es...

### 2. Notación
- Variables: x, y, z
- Operadores: +, -, ×, ÷

### 3. Ejemplo
La ecuación 2x + 3 = 7...

## Ejercicios
Resuelve las siguientes ecuaciones...

## Recursos
- [Video: Intro Álgebra](https://youtube.com/...)
- Descargar: ejercicios-01.pdf
```

---

## 🔗 Endpoints disponibles

### Cargar contenido
```
POST /api/modulo-contenido
```

### Obtener contenidos
```
GET /api/modulo-contenido/modulo/:id_modulo
GET /api/modulo-contenido/seccion/:id_seccion
```

### Descargar contenido
```
GET /api/modulo-contenido/:id_contenido/descargar
```

---

## ❓ FAQs

**P: ¿Qué pasa si cargo un PDF?**  
R: Se guarda en BD, y el IA genera resumen automáticamente.

**P: ¿Puedo editar/eliminar contenido?**  
R: Sí, tiene endpoints PUT y DELETE si eres el propietario.

**P: ¿Los estudiantes ven el contenido inmediatamente?**  
R: Sí, una vez cargado aparece en el módulo.

**P: ¿Se puede cargar URL externa?**  
R: Sí, selecciona "URL" en tipo y proporciona el enlace.

---

**Status:** ✅ Sistema listo para cargar contenido  
**Última actualización:** Diciembre 10, 2025
