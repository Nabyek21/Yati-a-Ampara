# YATIÑA AMPARA - LMS con IA

Backend + Frontend en desarrollo local.

## 🚀 Inicio Rápido

### Requisitos
- Node.js 18+
- MySQL corriendo (localhost:3306)

### Opción 1: Script automático (recomendado)
```powershell
cd C:\Proyectos\SoaYatinya
.\start-services-dev.ps1 -Mode all
```
Se abrirán 2 ventanas: Backend (4000) + Frontend (4321)

### Opción 2: Manual (lo que hace el script)
Terminal 1:
```powershell
cd C:\Proyectos\SoaYatinya\backend
pnpm run dev
```

Terminal 2:
```powershell
cd C:\Proyectos\SoaYatinya\frontend
pnpm run dev
```

## 📍 URLs

- Frontend: http://localhost:4321
- Backend API: http://localhost:4000/api

## 📁 Estructura

```
backend/
  ├── src/
  │   ├── controllers/        ← Aquí están todos los controladores
  │   ├── routes/             ← Todas las rutas
  │   ├── models/
  │   ├── middleware/
  │   ├── app.js
  │   └── server.js
  ├── package.json
  └── .env

frontend/
  ├── src/
  ├── package.json
  └── .env
```

## 🔧 Configuración

**backend/.env**
```env
DB_HOST=localhost
DB_USER=root
DB_PASS=
DB_NAME=yati
PORT=4000
JWT_SECRET=supersecreto123
```

**frontend/.env**
```env
VITE_PUBLIC_API_URL=http://localhost:4000/api
```

## 📚 Módulos Principales

### Biblioteca (Sistema de Subida de Archivos)
Ubicación: Admin → Biblioteca

**Características:**
- Subida de archivos hasta 50MB
- Tipos soportados: PDF, Word, PowerPoint, Audio, Video, Imágenes
- Drag-and-drop o selección manual
- Preview modal para visualización
- Solo accesible por administradores

**Documentación completa:**
Ver `BIBLIOTECA_FILE_UPLOAD_GUIDE.md`

**Pruebas:**
```powershell
.\verify-biblioteca-infrastructure.ps1
```

## 🛑 Parar servicios

Ctrl+C en cada ventana

---

**Nota:** El script `.ps1` simplemente abre 2 ventanas y ejecuta `pnpm run dev` en cada una. Equivale a hacerlo manualmente en 2 terminales.

