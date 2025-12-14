# Checklist de Testing - Visualización de Contenido

## Pre-Testing
- [ ] Frontend corriendo en puerto 5173 (o asignado)
- [ ] Backend corriendo en puerto 4000
- [ ] Estar logueado como docente
- [ ] Tener acceso a página de módulos de un curso

## Test 1: Visualizar PDF
**Preparación**:
1. Ir a un módulo
2. Hacer clic en "Agregar Contenido"
3. Llenar:
   - Tipo: archivo
   - Título: "Manual de Prueba"
   - Descripción: "Un manual en PDF"
   - Archivo: Cargar un PDF
   - Orden: 1
4. Guardar

**Acción**:
- Hacer clic en icono de ojo (👁️) del contenido

**Resultado Esperado**:
- [ ] Modal se abre
- [ ] Título del modal muestra "Manual de Prueba"
- [ ] PDF se visualiza en el modal
- [ ] Botón X cierra el modal

**Resultado Actual**:
- Funcionó: ___
- Error: ___

---

## Test 2: Visualizar Imagen
**Preparación**:
1. Agregar nuevo contenido con:
   - Tipo: archivo
   - Título: "Diagrama Importante"
   - Descripción: "Diagrama en PNG"
   - Archivo: Cargar una imagen (JPG, PNG, GIF)
   - Orden: 2
2. Guardar

**Acción**:
- Hacer clic en icono de ojo

**Resultado Esperado**:
- [ ] Modal se abre
- [ ] Título muestra "Diagrama Importante"
- [ ] Imagen se visualiza correctamente
- [ ] Imagen se ve a tamaño apropiado

**Resultado Actual**:
- Funcionó: ___
- Error: ___

---

## Test 3: Visualizar Video YouTube
**Preparación**:
1. Agregar nuevo contenido con:
   - Tipo: url
   - Título: "Tutorial en YouTube"
   - Descripción: "Video educativo"
   - URL: `https://www.youtube.com/watch?v=dQw4w9WgXcQ`
   - Orden: 3
2. Guardar

**Acción**:
- Hacer clic en icono de ojo

**Resultado Esperado**:
- [ ] Modal se abre
- [ ] Título muestra "Tutorial en YouTube"
- [ ] Reproductor de YouTube aparece embebido
- [ ] Video puede reproducirse

**Resultado Actual**:
- Funcionó: ___
- Error: ___

---

## Test 4: Visualizar Video Vimeo
**Preparación**:
1. Agregar nuevo contenido con:
   - Tipo: url
   - Título: "Video en Vimeo"
   - Descripción: "Video profesional"
   - URL: `https://vimeo.com/76979871`
   - Orden: 4
2. Guardar

**Acción**:
- Hacer clic en icono de ojo

**Resultado Esperado**:
- [ ] Modal se abre
- [ ] Título muestra "Video en Vimeo"
- [ ] Reproductor de Vimeo aparece embebido
- [ ] Video puede reproducirse

**Resultado Actual**:
- Funcionó: ___
- Error: ___

---

## Test 5: Visualizar Enlace Externo
**Preparación**:
1. Agregar nuevo contenido con:
   - Tipo: url
   - Título: "Recurso en Internet"
   - Descripción: "Página externa"
   - URL: `https://www.wikipedia.org/`
   - Orden: 5
2. Guardar

**Acción**:
- Hacer clic en icono de ojo

**Resultado Esperado**:
- [ ] Modal se abre
- [ ] Título muestra "Recurso en Internet"
- [ ] Se muestra icono de enlace externo
- [ ] Botón "Abrir en nueva pestaña" está disponible
- [ ] Al hacer clic, abre en nueva pestaña

**Resultado Actual**:
- Funcionó: ___
- Error: ___

---

## Test 6: Descargar Archivo No Soportado
**Preparación**:
1. Agregar nuevo contenido con:
   - Tipo: archivo
   - Título: "Documento Word"
   - Descripción: "Documento en Word"
   - Archivo: Cargar un .docx
   - Orden: 6
2. Guardar

**Acción**:
- Hacer clic en icono de descarga (si hay para PDF/imagen) O
- Hacer clic en icono de ojo (si aparece)

**Resultado Esperado**:
- [ ] Modal se abre
- [ ] Título muestra "Documento Word"
- [ ] Se muestra mensaje "No se puede previsualizar este tipo de archivo"
- [ ] Botón "Descargar" está disponible
- [ ] Al hacer clic, descarga el archivo

**Resultado Actual**:
- Funcionó: ___
- Error: ___

---

## Test 7: Editar Contenido
**Preparación**:
- Cualquier contenido existente

**Acción**:
- Hacer clic en icono de editar (lápiz)

**Resultado Esperado**:
- [ ] Modal de edición se abre
- [ ] Campos pre-rellenados con datos actuales
- [ ] Puedo cambiar información
- [ ] Botón guardar funciona

**Resultado Actual**:
- Funcionó: ___
- Error: ___

---

## Test 8: Eliminar Contenido
**Preparación**:
- Contenido de prueba (que podamos borrar)

**Acción**:
- Hacer clic en icono de eliminar (papelera)

**Resultado Esperado**:
- [ ] Confirmación (si la hay)
- [ ] Contenido se elimina de lista
- [ ] Modal se cierra si estaba abierto

**Resultado Actual**:
- Funcionó: ___
- Error: ___

---

## Test 9: Información Mejorada
**Preparación**:
- Agregar contenido con:
  - Descripción: "Una descripción"
  - Archivo o URL

**Acción**:
- Visualizar lista de contenido

**Resultado Esperado**:
- [ ] Se ve el título
- [ ] Se ve el tipo y orden
- [ ] Se ve la descripción (en gris)
- [ ] Se ve nombre del archivo (📄) si existe
- [ ] Se ve indicador de enlace (🔗) si existe

**Resultado Actual**:
- Funcionó: ___
- Error: ___

---

## Test 10: Responsividad
**Preparación**:
- Tener contenido visualizable

**Acción**:
- Cambiar tamaño de ventana del navegador
- Visualizar contenido en diferentes tamaños

**Resultado Esperado**:
- [ ] Modal se ve bien en pantallas grandes (desktop)
- [ ] Modal se ve bien en pantallas medianas (tablet)
- [ ] Modal se ve bien en pantallas pequeñas (móvil)
- [ ] Contenido se adapta al tamaño

**Resultado Actual**:
- Funcionó: ___
- Error: ___

---

## Resumen de Testing

**Total de Tests**: 10
- Pasados: ___/10
- Fallidos: ___/10

### Issues Encontrados
```
1. _________________________________
2. _________________________________
3. _________________________________
```

### Notas Adicionales
```
_________________________________
_________________________________
_________________________________
```

### Conclusión
- [ ] Listo para producción
- [ ] Necesita ajustes
- [ ] Necesita debugging

**Testeado por**: _______________  
**Fecha**: _______________  
**Hora**: _______________

