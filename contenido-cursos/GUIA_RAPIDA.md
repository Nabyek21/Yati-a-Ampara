# 📖 GUÍA RÁPIDA: Cómo usar esta carpeta

## ¿Qué es `contenido-cursos/`?

Esta carpeta es el **espacio para preparar y organizar el contenido** que los profesores desean subir al sistema LMS.

---

## 🎯 Para profesores

### Paso 1: Crea tu carpeta de curso
```
Matemáticas-Básicas/
Física-I/
Química-General/
Historia-Universal/
etc.
```

### Paso 2: Organiza por módulos
```
Matemáticas-Básicas/
├── Módulo-1-Álgebra/
│   ├── clase-01.md
│   ├── clase-02.md
│   └── recursos/
│       ├── ejercicios.pdf
│       └── videos/
│
├── Módulo-2-Trigonometría/
│   ├── clase-01.md
│   └── recursos/
│
└── Módulo-3-Cálculo/
    └── ...
```

### Paso 3: Prepara tu contenido

**Archivos recomendados:**
- `.md` - Texto principal (Markdown)
- `.pdf` - Documentos, ejercicios
- `.mp4` - Videos educativos
- `.jpg/.png` - Imágenes, diagramas
- `.xlsx` - Tablas de datos

**Ejemplo:**
```markdown
# Clase 1: Introducción

## Objetivos
- Entender el concepto X
- Aplicar en casos reales

## Contenido
[Tu contenido aquí]

## Ejercicios
[Ejercicios propuestos]
```

### Paso 4: Accede al sistema y carga

1. Inicia sesión como **Profesor**
2. Ve a tu **Curso → Módulo → Sección**
3. Click en **"Cargar Contenido"**
4. Selecciona archivo + completa datos
5. Click **"Subir"**

✅ **¡Listo! El contenido está disponible para estudiantes**

---

## 📊 Estructura recomendada

```
TuCurso/
├── LEEME.txt                  ← Descripción general
├── Módulo-1-Tema/
│   ├── clase-01-subtema.md
│   ├── clase-02-subtema.md
│   ├── clase-03-subtema.md
│   ├── recursos/
│   │   ├── video-01.mp4
│   │   ├── diagrama.png
│   │   └── tabla-referencia.xlsx
│   ├── actividades/
│   │   ├── ejercicios-01.pdf
│   │   └── actividad-practica.md
│   └── evaluacion/
│       ├── quiz-01.pdf
│       └── prueba-final.docx
└── Módulo-2-Tema/
    └── ...
```

---

## 🚀 Flujo de carga

```
1. PREPARAS CONTENIDO (local)
   ├─ Escribes clase en MD
   ├─ Preparas PDF/videos
   └─ Organizas por módulo

2. ACCEDES AL SISTEMA
   ├─ Login como profesor
   └─ Navegas a tu módulo

3. CARGAS CONTENIDO
   ├─ Click "Cargar Contenido"
   ├─ Seleccionas archivo
   ├─ Completas titulo + descripcion
   └─ Click "Subir"

4. SISTEMA PROCESA
   ├─ Valida tipo de archivo
   ├─ Guarda en servidor
   ├─ Registra en BD
   └─ ✅ Disponible para estudiantes

5. ESTUDIANTES ACCEDEN
   ├─ Ven contenido listado
   ├─ Pueden descargar/reproducir
   ├─ Sistema genera resumen IA
   └─ Pueden ver resumen en clase
```

---

## 📝 Ejemplo: Crear tu primera clase

### 1. Crea archivo `clase-01.md`

```markdown
# Clase 1: Introducción al Tema

## Objetivos de aprendizaje
- Objetivo 1
- Objetivo 2
- Objetivo 3

## Introducción
[Texto introductorio]

## Concepto 1: Título
[Explicación con ejemplos]

### Ejemplo
[Caso concreto]

## Concepto 2: Título
[Continuación]

## Resumen
[Puntos clave]

## Próxima clase
- Tema a cubrir
- Preparación necesaria
```

### 2. Prepara recursos
- `diagrama-01.png` - Visualización
- `ejercicios.pdf` - Prácticas
- `video.mp4` - Explicación

### 3. Carga al sistema
- Click "Cargar Contenido"
- Selecciona `clase-01.md`
- Tipo: "documento"
- Título: "Clase 1: Introducción al Tema"
- Subir

✅ **¡Hecho!** Ahora el IA generará resumen automáticamente

---

## ✅ Validaciones del sistema

### Se permite
- ✓ PDF, DOCX, TXT (documentos)
- ✓ MP4, WEBM, AVI (videos)
- ✓ PNG, JPG, GIF (imágenes)
- ✓ PPTX (presentaciones)
- ✓ URLs externas (YouTube, etc)
- ✓ Máximo 50MB por archivo

### No se permite
- ✗ Ejecutables (.exe)
- ✗ Archivos comprimidos (.zip)
- ✗ Scripts (.bat, .ps1)
- ✗ Archivos corrompidos

---

## 🤖 Qué hace el IA automáticamente

Una vez que subes contenido:

1. **Detecta tipo**
   - ¿Es PDF, DOCX, TXT?
   - ¿Es video?

2. **Procesa contenido**
   - Extrae texto de PDF
   - Extrae audio de video
   - Transcribe audio

3. **Genera resumen**
   - Identifica conceptos clave
   - Resume puntos principales
   - Crea lista de aprendizajes

4. **Guarda resumen**
   - En la BD (tabla modulo_contenido)
   - Disponible para estudiantes
   - Aparece en panel de lectura

---

## 💡 Tips y mejores prácticas

### ✓ Haz esto
- Organiza por módulos y temas
- Usa títulos descriptivos
- Incluye objetivos de aprendizaje
- Proporciona ejemplos prácticos
- Enlaza recursos complementarios
- Indica duración estimada
- Numera tus clases

### ✗ Evita
- Archivos muy grandes (>50MB)
- Contenido desorganizado
- Títulos genéricos ("Clase 1")
- Sin contexto o introducción
- Demasiado texto sin formato
- Imágenes de baja calidad
- Enlaces rotos

---

## 🆘 Problemas comunes

| Problema | Solución |
|----------|----------|
| "Tipo de archivo no permitido" | Usa extensiones válidas (.pdf, .mp4, .txt, etc) |
| "Archivo muy grande" | Comprime video o divide PDF |
| "No veo mi contenido" | Recarga página o contacta admin |
| "Error al subir" | Intenta con otro navegador |

---

## 📚 Ejemplos disponibles

En esta carpeta encontrarás:

- `Matemáticas-Básicas/Módulo-1-Álgebra/`
  - `clase-01-introduccion-algebra.md` - Ejemplo de clase completa
  - `clase-02-ecuaciones-cuadrticas.md` - Otro ejemplo
  - `RESUMEN_IA_EJEMPLO.md` - Ejemplo del resumen generado

Úsalos como **referencia** para crear tu contenido.

---

## 🔗 Recursos útiles

### Documentación
- Lee: `FLUJO_COMPLETO_CARGA_CONTENIDO.md` para detalles técnicos
- Lee: `../README.md` para descripción general

### Herramientas recomendadas
- **Escritura MD:** VS Code, Typora, StackEdit
- **PDF:** PDFtk, ILovePDF
- **Video:** OBS Studio, FFmpeg
- **Diagramas:** Draw.io, Lucidchart

### Formatos recomendados
- Clase teórica → PDF o MD
- Explicación visual → Video MP4
- Diagrama/gráfico → PNG o JPG
- Presentación → PPTX
- Recursos externos → URLs

---

## 🎯 Checklist para tu primer contenido

- [ ] Creaste carpeta de tu curso
- [ ] Creaste carpeta de módulo
- [ ] Escribiste clase en markdown
- [ ] Preparaste recursos (PDF, video, etc)
- [ ] Organizaste en estructura recomendada
- [ ] Iniciaste sesión en sistema
- [ ] Subiste contenido
- [ ] Verificas que aparece para estudiantes
- [ ] Estudiantes ven resumen IA

---

## 🚀 Siguientes pasos

1. **Crea tu primer módulo** - Copia Matemáticas-Básicas como referencia
2. **Prepara 2-3 clases** - Sigue el formato de ejemplo
3. **Carga al sistema** - Usa botón "Cargar Contenido"
4. **Verifica con estudiante** - Abre sesión como estudiante y ve el contenido
5. **Ajusta si es necesario** - Edita títulos, descripciones, etc

---

**¿Preguntas?** Lee: [FLUJO_COMPLETO_CARGA_CONTENIDO.md](FLUJO_COMPLETO_CARGA_CONTENIDO.md)

**Última actualización:** Diciembre 10, 2025  
**Status:** ✅ Listo para usar
