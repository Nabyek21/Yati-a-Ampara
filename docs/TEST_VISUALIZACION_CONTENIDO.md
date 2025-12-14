# Guía de Prueba - Visualización de Contenido

## Cambios Realizados

### 1. Modal Mejorado (línea 320-365)
- **Mejora**: Agregado título dinámico al modal
- **Elemento**: `#preview-title`
- **Función**: Muestra el nombre del contenido siendo visualizado

### 2. Función `renderContenido()` (línea 678-749)
- **Mejora**: Renderiza botones de visualización (ojo) para:
  - Archivos PDF
  - Imágenes (JPG, PNG, GIF)
  - URLs externas (YouTube, Vimeo, enlaces)
- **Botones adicionales**: Editar y Eliminar
- **Información mejorada**: Muestra descripción, nombre del archivo e indicador de enlace

### 3. Función `viewContent()` (línea 1480-1568)
- **Propósito**: Visualizar contenido en modal
- **Parámetros**:
  - `idContenido`: ID del item en BD
  - `tipo`: 'archivo' o 'url'
  - `url`: URL/ruta del contenido
  - `titulo`: Nombre del contenido para mostrar en modal

#### Tipos de Contenido Soportados:

**Archivos (tipo='archivo')**:
- ✅ PDF: Previsualización en iframe
- ✅ Imágenes (.jpg, .jpeg, .png, .gif): Previsualización con imagen
- ✅ Otros: Botón de descarga

**URLs Externas (tipo='url')**:
- ✅ YouTube: Reproductor embebido
- ✅ Vimeo: Reproductor embebido
- ✅ Otros enlaces: Botón para abrir en nueva pestaña

---

## Cómo Probar

### Test 1: Visualizar PDF
1. En la página de módulos del docente, agregar contenido con:
   - Tipo: PDF
   - Archivo: Cualquier PDF
2. Haz clic en el icono de ojo
3. **Esperado**: Modal se abre mostrando el PDF en iframe

### Test 2: Visualizar Imagen
1. Agregar contenido con:
   - Tipo: Imagen
   - Archivo: JPG/PNG/GIF
2. Haz clic en el icono de ojo
3. **Esperado**: Modal se abre mostrando la imagen

### Test 3: Visualizar Video YouTube
1. Agregar contenido con:
   - Tipo: URL
   - URL: https://www.youtube.com/watch?v=VIDEO_ID
2. Haz clic en el icono de ojo
3. **Esperado**: Modal se abre con video reproduciéndose

### Test 4: Visualizar Video Vimeo
1. Agregar contenido con:
   - Tipo: URL
   - URL: https://vimeo.com/VIDEO_ID
2. Haz clic en el icono de ojo
3. **Esperado**: Modal se abre con video reproduciéndose

### Test 5: Visualizar Enlace Externo
1. Agregar contenido con:
   - Tipo: URL
   - URL: https://ejemplo.com
2. Haz clic en el icono de ojo
3. **Esperado**: Modal muestra botón "Abrir en nueva pestaña"

### Test 6: Descargar Archivo No Soportado
1. Agregar contenido con:
   - Tipo: Archivo
   - Archivo: .docx, .xlsx, .txt, etc.
2. Haz clic en icono de descarga (no ojo)
3. **Esperado**: Se descarga el archivo

---

## Comportamiento Observable

### Modal
- Título: Muestra nombre del contenido (actualizado dinámicamente)
- Tamaño: máximo 4xl, responsivo
- Cierre: Botón X en esquina superior derecha
- Contenedores: Se muestran/ocultan según tipo

### Visualización
- **PDF**: iframe con altura 600px
- **Imágenes**: Imagen con max-width: full, max-height: 600px
- **Videos**: iframe embebido 100% width, 600px height
- **Enlaces**: Botón azul con icono de enlace externo

---

## Archivos Modificados

1. **frontend/src/pages/docente/curso/[id].astro**
   - Modal mejorado (línea 320-365)
   - Función renderContenido (línea 678-749)
   - Función viewContent (línea 1480-1568)

---

## Notas Técnicas

### Puerto Backend
- Confirmado: localhost:4000
- Todas las URLs de archivos: http://localhost:4000/uploads/actividades/

### Detección de Tipos
- **PDF**: Extensión .pdf
- **Imágenes**: .jpg, .jpeg, .png, .gif
- **YouTube**: hostname contiene 'youtube.com' o 'youtu.be'
- **Vimeo**: hostname contiene 'vimeo.com'

### Rutas de Archivos
```
http://localhost:4000/uploads/actividades/{nombre_archivo}
```

---

## Posibles Mejoras Futuras

1. Soporte para archivos de audio
2. Soporte para documentos Word/PDF editables
3. Previsualización de código con syntax highlighting
4. Integración con Google Drive/OneDrive
5. Editor de contenido integrado
6. Historial de versiones de archivos

