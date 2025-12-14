# 🎓 YATIÑA AMPARA - LMS con IA

**Learning Management System con integración de inteligencia artificial para generar resúmenes automáticos de contenido**

Backend + Frontend en desarrollo local.

---

## 📚 Documentación

- **[ESTRUCTURA_PROYECTO.md](ESTRUCTURA_PROYECTO.md)** - Mapa completo del proyecto
- **[INDICE_COMPLETO.md](INDICE_COMPLETO.md)** - Índice navegable
- **[contenido-cursos/](contenido-cursos/)** - Carpeta para contenido de profesores
- **[contenido-cursos/FLUJO_COMPLETO_CARGA_CONTENIDO.md](contenido-cursos/FLUJO_COMPLETO_CARGA_CONTENIDO.md)** - ⭐ Flujo de carga

---

## 🚀 Inicio Rápido

### Requisitos
- Node.js 18+
- MySQL corriendo (localhost:3306)
- Base de datos `yati` configurada

### Instalación

**Backend:**
```powershell
cd backend
npm install        # o pnpm install
npm start          # Inicia en puerto 3000
```

**Frontend:**
```powershell
cd frontend
npm install        # o pnpm install
npm run dev        # Inicia en puerto 3000 (o asignado)
```

### URLs Locales
- **Backend API:** http://localhost:3000/api
- **Frontend:** http://localhost:3000 (o puesto asignado)

---

## 📁 Estructura Principal

```
SoaYatinya/
├── 📄 README.md                    ← Estás aquí
├── 📄 ESTRUCTURA_PROYECTO.md       ← Mapa del proyecto
├── 📄 INDICE_COMPLETO.md          ← Índice navegable
│
├── 📁 backend/
│   ├── src/
│   │   ├── controllers/            ← 30+ controladores
│   │   ├── routes/                 ← Todas las rutas API
│   │   ├── services/               ← CalificacionesService, ContenidoUploadService, etc
│   │   ├── models/                 ← Modelos de datos
│   │   ├── middleware/             ← Auth, upload, error handling
│   │   └── config/
│   ├── scripts/                    ← Verificación y mantenimiento
│   ├── setup/                      ← Migraciones y datos de prueba
│   └── database/                   ← Scripts SQL
│
├── 📁 frontend/
│   ├── src/
│   │   ├── components/             ← Componentes Astro
│   │   ├── pages/                  ← Páginas (ruteo automático)
│   │   ├── services/               ← Llamadas a API
│   │   └── styles/                 ← Tailwind CSS
│   └── public/
│
└── 📁 contenido-cursos/            ⭐ NUEVO - Carpeta para profesores
    ├── 📄 README.md                ← Guía de uso
    ├── 📄 FLUJO_COMPLETO_CARGA_CONTENIDO.md
    └── 📁 Matemáticas-Básicas/
        ├── 📁 Módulo-1-Álgebra/
        │   ├── clase-01-introduccion-algebra.md
        │   ├── clase-02-ecuaciones-cuadrticas.md
        │   └── RESUMEN_IA_EJEMPLO.md
        └── 📁 Módulo-2-Trigonometría/
            └── ...
```
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

