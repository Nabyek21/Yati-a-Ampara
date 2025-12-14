# ✅ Corrección: Error de descarga "No se puede conectar localhost:5678"

## 🐛 Problema

Al intentar descargar contenido desde módulos, Firefox mostraba:
```
No se puede conectar

Firefox no puede establecer una conexión con el servidor en localhost:5678.
```

## 🔍 Causa

El frontend estaba apuntando a `localhost:5678` en lugar del backend real en `localhost:3000`.

## ✅ Solución aplicada

Se corrigieron todos los puertos en los siguientes archivos:

### 1. **frontend/src/pages/estudiante/curso/[id].astro**
```javascript
// ANTES:
const API_URL = 'http://localhost:5678/api';

// AHORA:
const API_URL = 'http://localhost:3000/api';
```

### 2. **frontend/src/pages/usuario-con-chat.astro**
```jsx
// ANTES:
webhookUrl="http://localhost:5678/webhook/713a62c3-cfa4-4df7-af75-05c877ccf605/chat"

// AHORA:
webhookUrl="http://localhost:3000/webhook/713a62c3-cfa4-4df7-af75-05c877ccf605/chat"
```

### 3. **frontend/src/pages/docente/curso/[id].astro**
```javascript
// ANTES:
const fileUrl = `http://localhost:5678/uploads/actividades/${item.archivo}`;

// AHORA:
const fileUrl = `http://localhost:3000/uploads/actividades/${item.archivo}`;
```

### 4. **frontend/src/pages/curso/[id].astro**
```javascript
// ANTES:
candidates.push(`http://localhost:5678/uploads/actividades/${filename}`);
candidates.push(`http://localhost:5678/uploads/${filename}`);

// AHORA:
candidates.push(`http://localhost:3000/uploads/actividades/${filename}`);
candidates.push(`http://localhost:3000/uploads/${filename}`);
```

## 🚀 Cómo probar

1. **Asegúrate que el backend esté corriendo:**
   ```bash
   cd backend
   npm start
   # Debe estar escuchando en puerto 3000
   ```

2. **Inicia el frontend:**
   ```bash
   cd frontend
   npm run dev
   ```

3. **Prueba descargar contenido:**
   - Accede a tu curso como profesor o estudiante
   - Ve a "Módulos del Curso"
   - Intenta descargar un contenido
   - ✅ Ahora debe funcionar

## 📊 Puertos configurados

| Servicio | Puerto | URL |
|----------|--------|-----|
| Backend (Node.js) | 3000 | http://localhost:3000 |
| Frontend (Astro) | 3000+ | http://localhost:3000 (o asignado) |
| Base de Datos | 3306 | localhost:3306 |

## ✅ Verificación

Todas las referencias a `5678` han sido eliminadas:
- ✅ 0 referencias en archivos `.astro`
- ✅ 0 referencias en archivos `.js`
- ✅ Todos los puertos apuntan a `3000`

---

**Status:** ✅ Corregido  
**Fecha:** Diciembre 11, 2025
