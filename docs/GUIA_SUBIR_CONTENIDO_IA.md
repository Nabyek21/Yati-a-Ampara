# 📚 Guía: Subir Contenido de Clases y Generar Resúmenes con IA

## 🎯 Flujo Completo

```
1. PROFESOR                2. SISTEMA                3. ESTUDIANTE
   │                          │                         │
   ├─ Crea contenido     ┌────┴────┐            ┌──────┴──────┐
   │  en markdown        │ Backend  │            │  Frontend   │
   │  (archivo .md)      │  (Node)  │            │  (Astro)    │
   │                     │          │            │             │
   ├─ Sube a plataforma  │          │            │             │
   │  mediante POST      ├─ Valida  │            │             │
   │  /api/contenido     │ archivo  │            │             │
   │                     │          │            │             │
   │                     ├─ Almacena├─ Evento ──>├─ Ve contenido
   │                     │ en BD    │            │             │
   │                     │          │            │             │
   └─────────────────────┤          │            │             │
                         │          │            │             │
                         ├─ IA     │            │             │
                         │ genera  │            │             │
                         │ resumen │            │             │
                         │         │            │             │
                         ├─ Genera ├─ Envío ──>├─ Resumen
                         │ audio   │           │  en PDF
                         │         │           │
                         └─────────┘           │
                                               └─ Descarga
```

## 📝 Paso 1: Crear el Contenido

### Formato Recomendado

El contenido debe ser un archivo markdown (`.md`) con esta estructura:

```markdown
# Título de la Clase

## Objetivos
- Objetivo 1
- Objetivo 2

## Contenido

### Tema 1
Explicación detallada...

### Tema 2
Más contenido...

## Práctica
Ejercicios...

## Recursos
Links útiles...
```

**Ubicación**: `/contenido-cursos/{curso}/{clase}/contenido.md`

### Cursos y Secciones Disponibles

```
01-programacion-web-avanzada/
├── clase-1-intro/contenido.md
├── clase-2-frontend/contenido.md
└── clase-3-backend/contenido.md

02-base-de-datos/
├── clase-1-sql/contenido.md
└── clase-2-normalizacion/contenido.md

03-finanzas/
├── clase-1-fundamentos/contenido.md
└── clase-2-analisis/contenido.md
```

## 🚀 Paso 2: Subir Contenido al Sistema

### Opción A: Mediante API (Recomendado)

```javascript
// Usando fetch en el navegador
const formData = new FormData();
formData.append('titulo', 'Clase 1: Introducción a SQL');
formData.append('descripcion', 'Aprende SQL desde cero');
formData.append('id_seccion', 1);  // ID de la sección
formData.append('contenido', file); // Archivo .md

const response = await fetch('/api/contenido', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + token
  },
  body: formData
});

const result = await response.json();
console.log('Contenido subido:', result);
```

### Opción B: Mediante CLI (Para desarrolladores)

```bash
# Usando curl
curl -X POST http://localhost:3000/api/contenido \
  -H "Authorization: Bearer TOKEN" \
  -F "titulo=Clase 1" \
  -F "descripcion=Contenido" \
  -F "id_seccion=1" \
  -F "contenido=@contenido.md"
```

## 🤖 Paso 3: IA Genera Resumen

### Flujo Automático

Cuando se sube contenido, el sistema automáticamente:

1. **Valida** el archivo markdown
2. **Almacena** en base de datos (tabla `modulo_contenido`)
3. **Dispara** evento para IA
4. **IA Procesa**:
   - Extrae puntos principales
   - Genera resumen (200-300 palabras)
   - Crea lista de conceptos clave
   - Genera preguntas de repaso

### Respuesta del Sistema

```json
{
  "id_contenido": 42,
  "titulo": "Clase 1: Introducción a SQL",
  "status": "procesando",
  "resumen": {
    "id": 42,
    "contenido_procesado": "Este contenido cubre...",
    "estado": "generando",
    "generado_por": "ia_claude_v1"
  }
}
```

### Resumen Generado (Ejemplo)

```
RESUMEN: Introducción a SQL

Conceptos Clave:
• Bases de datos relacionales
• Tablas y columnas
• Comandos CRUD (Create, Read, Update, Delete)
• Tipos de datos SQL

Puntos Principales:
Una base de datos relacional organiza datos en tablas 
relacionadas entre sí mediante claves. SQL es el lenguaje 
estándar para consultar estas bases de datos. Los cuatro 
comandos fundamentales son CREATE, READ, UPDATE y DELETE, 
que permiten realizar cualquier operación sobre los datos.

Preguntas de Repaso:
1. ¿Qué es una clave primaria?
2. ¿Cuál es la diferencia entre WHERE y HAVING?
3. ¿Cómo se usa el comando JOIN?
```

## 📊 Paso 4: Estudiante Visualiza y Descarga

### Frontend (Vista Estudiante)

```
┌─────────────────────────────────────────┐
│  Programación Web Avanzada              │
│  Sección 2120 - Clase 1                 │
├─────────────────────────────────────────┤
│                                         │
│  📖 CONTENIDO DE CLASE                  │
│  [Ver contenido completo] [Descargar]   │
│                                         │
│  ✏️ RESUMEN IA GENERADO                 │
│  [Ver resumen] [Descargar PDF]          │
│                                         │
│  🎧 AUDIO GENERADO                      │
│  [Escuchar] [Descargar MP3]             │
│                                         │
│  ❓ PREGUNTAS DE REPASO                 │
│  [Ver preguntas] [Tomar quiz]           │
│                                         │
└─────────────────────────────────────────┘
```

### Acciones Disponibles

1. **Ver Contenido Original**: Markdown renderizado
2. **Descargar PDF**: Contenido formateado
3. **Escuchar Resumen**: Audio generado por IA
4. **Responder Preguntas**: Quiz interactivo
5. **Comentar**: Foro de dudas

## 🔧 Endpoints Disponibles

### Crear Contenido
```
POST /api/contenido
Content-Type: multipart/form-data

Parámetros:
- titulo (string): Nombre de la clase
- descripcion (string): Breve descripción
- id_seccion (int): ID de la sección
- contenido (file): Archivo .md
```

### Obtener Contenido
```
GET /api/contenido/:id

Retorna:
{
  "id": 42,
  "titulo": "Clase 1",
  "contenido": "...",
  "resumen": {...},
  "archivo_pdf": "url",
  "archivo_audio": "url"
}
```

### Obtener Resumen
```
GET /api/contenido/:id/resumen

Retorna:
{
  "contenido_procesado": "...",
  "conceptos_clave": [...],
  "preguntas": [...]
}
```

### Generar Audio
```
POST /api/contenido/:id/audio

Retorna:
{
  "status": "generando",
  "url_audio": "..."
}
```

## 📁 Estructura de Base de Datos

### Tabla: modulo_contenido
```sql
CREATE TABLE modulo_contenido (
  id_contenido INT PRIMARY KEY,
  id_modulo INT,
  id_seccion INT,
  titulo VARCHAR(200),
  descripcion TEXT,
  contenido LONGTEXT,
  tipo_contenido ENUM('markdown', 'pdf', 'video'),
  archivo_original VARCHAR(255),
  fecha_creacion DATETIME,
  fecha_actualizacion DATETIME,
  id_profesor INT,
  estado ENUM('activo', 'inactivo'),
  FOREIGN KEY (id_modulo) REFERENCES modulos(id_modulo),
  FOREIGN KEY (id_seccion) REFERENCES secciones(id_seccion),
  FOREIGN KEY (id_profesor) REFERENCES usuarios(id)
);

CREATE TABLE resumen_ia (
  id_resumen INT PRIMARY KEY AUTO_INCREMENT,
  id_contenido INT,
  contenido_procesado TEXT,
  conceptos_clave JSON,
  preguntas JSON,
  estado ENUM('procesando', 'completado', 'error'),
  generado_por VARCHAR(50),
  fecha_generacion DATETIME,
  FOREIGN KEY (id_contenido) REFERENCES modulo_contenido(id_contenido)
);
```

## 🎬 Ejemplo Completo: Profesor Sube Clase

### 1. Profesor Prepara Contenido
```
Crea archivo: clase-sql-basico.md
Con estructura markdown completa
```

### 2. Sube mediante Frontend

```javascript
const file = document.querySelector('#file-input').files[0];
const formData = new FormData();
formData.append('titulo', 'Clase 1: SQL Básico');
formData.append('descripcion', 'Aprende comandos SELECT, INSERT, UPDATE');
formData.append('id_seccion', 3);
formData.append('contenido', file);

const response = await fetch('/api/contenido', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});

const data = await response.json();
console.log('✅ Contenido subido, ID:', data.id_contenido);
```

### 3. Backend Procesa
```javascript
// Backend recibe archivo
app.post('/api/contenido', authenticate, async (req, res) => {
  const { titulo, descripcion, id_seccion } = req.body;
  const archivo = req.files.contenido;
  
  // 1. Guardar archivo
  const nuevoContenido = await ModuloContenidoModel.create({
    titulo,
    descripcion,
    id_seccion,
    contenido: archivo.data.toString(),
    id_profesor: req.user.id
  });
  
  // 2. Dispara evento para IA
  emit('generarResumen', {
    id_contenido: nuevoContenido.id_contenido,
    contenido: archivo.data.toString()
  });
  
  res.json(nuevoContenido);
});
```

### 4. IA Genera Resumen
```javascript
// Event listener para IA
on('generarResumen', async (data) => {
  const { id_contenido, contenido } = data;
  
  // Llamar al agente IA
  const resumen = await ia.generarResumen(contenido);
  
  // Guardar resumen en BD
  await ResumenIAModel.create({
    id_contenido,
    contenido_procesado: resumen.texto,
    conceptos_clave: resumen.conceptos,
    preguntas: resumen.preguntas,
    estado: 'completado'
  });
  
  console.log('✅ Resumen generado para contenido', id_contenido);
});
```

### 5. Estudiante Visualiza
```javascript
// Frontend estudiante obtiene contenido
const response = await fetch(`/api/contenido/${id}`);
const { contenido, resumen, archivo_pdf, archivo_audio } = await response.json();

// Mostrar interfaz con todos los recursos
mostrarContenido(contenido);
mostrarResumen(resumen);
mostrarBotones({
  verPDF: archivo_pdf,
  escucharAudio: archivo_audio,
  hacerQuiz: resumen.preguntas
});
```

## 📋 Checklist: Subir tu Primera Clase

- [ ] Crear archivo markdown con contenido
- [ ] Verificar estructura (títulos, viñetas, código)
- [ ] Identificar ID de la sección
- [ ] Acceder a plataforma como profesor
- [ ] Ir a Contenidos → Subir Clase
- [ ] Seleccionar archivo
- [ ] Llenar título y descripción
- [ ] Hacer clic en "Subir"
- [ ] Esperar procesamiento (2-3 minutos)
- [ ] Verificar que resumen fue generado
- [ ] Compartir con estudiantes

## 🆘 Troubleshooting

### El archivo no sube
- Verificar que sea formato .md
- Verificar tamaño < 50MB
- Verificar conexión a internet

### Resumen no se genera
- Esperar 5 minutos más
- Verificar que contenido sea válido
- Revisar logs del sistema

### IA genera contenido incompleto
- Asegurar que el markdown tenga estructura clara
- Revisar que los títulos estén bien formateados
- Considerar acortar contenido muy largo

## 📞 Soporte

Para reportar problemas:
- Email: soporte@yati.edu
- Chat: help.yati.edu
- Teléfono: +593 2 XXXX XXXX

---

**Versión**: 1.0  
**Última actualización**: Diciembre 10, 2025  
**Estado**: ✅ Listo para producción
