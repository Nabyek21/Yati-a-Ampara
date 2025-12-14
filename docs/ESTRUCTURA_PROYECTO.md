# 📁 Estructura del Proyecto SoaYatinya

## Directorio Raíz

```
SoaYatinya/
├── backend/              # API Node.js/Express
├── frontend/             # Frontend Astro
├── README.md             # Documentación principal
├── REFERENCIA_RAPIDA_BD.md
├── REVISION_BD_COMPLETADA_FINAL.md
├── REVISION_COMPLETA_BD_Y_FLUJO.md
└── DIAGRAMA_FLUJO_DETALLADO.md
```

---

## 🚀 Backend (`/backend`)

### Estructura Principal

```
backend/
├── src/                          # Código fuente principal
│   ├── app.js                    # Configuración de Express
│   ├── server.js                 # Punto de entrada
│   ├── config/
│   │   └── database.js           # Conexión MySQL
│   ├── controllers/              # Lógica de negocio (30+ controllers)
│   ├── models/                   # Modelos de datos
│   ├── routes/                   # Rutas API
│   ├── services/                 # Servicios (CalificacionesService, etc)
│   ├── middleware/               # Middlewares (auth, error, etc)
│   ├── validators/               # Validaciones
│   └── utils/                    # Funciones utilitarias
│
├── database/                     # Scripts SQL
│   ├── CREAR_TABLAS_FORO.sql
│   └── INSERT_FORO_DATOS_PRUEBA.sql
│
├── scripts/                      # Scripts de mantenimiento
│   ├── verificar-bd-simple.js    # 🔍 Audit BD completo
│   ├── corregir-ponderaciones.js # ✏️ Corregir pesos
│   ├── recalcular-calificaciones.js # 🧮 Recalcular notas
│   └── test-ponderaciones-backend.js # ✅ Tests
│
├── setup/                        # Scripts de instalación/migración
│   ├── ejecutar-migracion.js
│   ├── insertarDatosPrueba.js
│   ├── fix-charset.js
│   └── cleanup-foro.js
│
├── servicioCuentas/              # Microservicio de cuentas
├── logs/                         # Archivos de log
├── node_modules/                 # Dependencias
├── .env                          # Variables de entorno (no versionar)
├── .env.example                  # Plantilla de .env
├── package.json                  # Dependencias y scripts
└── pnpm-lock.yaml               # Lock file
```

---

## 🎨 Frontend (`/frontend`)

```
frontend/
├── src/
│   ├── components/               # Componentes Astro
│   ├── pages/                    # Páginas (ruteo automático)
│   ├── layouts/                  # Layouts
│   ├── scripts/                  # Scripts JavaScript
│   ├── services/                 # Servicios API
│   ├── styles/                   # CSS/Tailwind
│   └── assets/                   # Imágenes, etc
│
├── public/                       # Archivos estáticos
├── astro.config.mjs             # Config Astro
├── vite.config.mjs              # Config Vite
├── tsconfig.json                # Config TypeScript
├── tailwind.config.cjs          # Config Tailwind
└── package.json
```

---

## 📊 Base de Datos

### Conexión
- **Host:** localhost
- **Port:** 3306
- **Database:** yati
- **Tablas:** 30 total

### Tablas Principales
- `usuarios` - Usuarios del sistema
- `matriculas` - Inscripciones
- `secciones` - Secciones de cursos
- `actividades` - Actividades/Tareas
- `notas` - Calificaciones de actividades
- `ponderaciones_seccion` - Pesos de evaluación (100%)
- `calificaciones_por_tipo` - Promedios por tipo
- `calificaciones_finales` - Notas finales calculadas

---

## 🔑 Variables de Entorno

### Backend (`.env`)
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=yati
DB_PORT=3306
NODE_ENV=development
PORT=3000
```

---

## 🚀 Comandos Principales

### Development
```bash
# Backend
cd backend
npm install        # Instalar dependencias
npm start          # Iniciar servidor
npm run dev        # Con nodemon (si está instalado)

# Frontend
cd frontend
npm install
npm run dev        # Servidor de desarrollo
npm run build      # Build para producción
```

### Scripts Útiles

#### Verificación
```bash
# Ver estructura completa de BD
node scripts/verificar-bd-simple.js
```

#### Mantenimiento
```bash
# Corregir ponderaciones (si están <100%)
node scripts/corregir-ponderaciones.js

# Recalcular calificaciones
node scripts/recalcular-calificaciones.js
```

#### Setup Inicial
```bash
# Ejecutar migraciones
node setup/ejecutar-migracion.js

# Insertar datos de prueba
node setup/insertarDatosPrueba.js
```

---

## ✅ Status del Sistema

### Base de Datos
- ✅ 30 tablas creadas
- ✅ Ponderaciones: 100% (12.5% + 37.5% + 50%)
- ✅ Auto-cálculo funcionando
- ✅ Integridad referencial validada

### Backend
- ✅ CalificacionesService (6 métodos)
- ✅ Auto-cálculo en notaController
- ✅ Endpoints para todas las entidades
- ✅ Autenticación y validación

### Frontend
- ⏳ En desarrollo
- ⏳ Astro + Tailwind configurado
- ⏳ Servicio API conectado

---

## 📚 Documentación

### Referencia Rápida
- **REFERENCIA_RAPIDA_BD.md** - Queries SQL y flujos
- **DIAGRAMA_FLUJO_DETALLADO.md** - Flujos y diagramas
- **REVISION_BD_COMPLETADA_FINAL.md** - Antes/después de correcciones

### Especificación
- **REVISION_COMPLETA_BD_Y_FLUJO.md** - Análisis completo
- **RESUMEN_REVISION_EJECUTIVO.md** - Resumen ejecutivo

### API
- **API_ENDPOINTS_QUICK_REF.md** - Endpoints disponibles
- **API_REFERENCE_CONTENIDOS_IA.md** - API de contenidos

---

## 🔄 Flujo de Calificaciones

```
POST /api/notas (crear nota)
    ↓
notaController.createNota()
    ├─ Inserta en tabla notas
    ├─ CalificacionesService.recalcularPromedioPorTipo()
    │  └─ Inserta en calificaciones_por_tipo
    ├─ CalificacionesService.recalcularNotaFinal()
    │  └─ Inserta en calificaciones_finales
    └─ Retorna nota final calculada
```

---

## 🛠️ Stack Tecnológico

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MySQL 8.0+
- **Package Manager:** npm/pnpm

### Frontend
- **Framework:** Astro
- **Styling:** Tailwind CSS
- **Build Tool:** Vite
- **Language:** JavaScript/TypeScript

---

## 📝 Limpieza Reciente (Dec 10, 2025)

### Eliminado
- ❌ 50+ archivos de documentación duplicados
- ❌ Scripts de prueba temporales
- ❌ Archivos de debug
- ❌ Logs antiguos
- ❌ Scripts PS1/BAT de utilidad

### Reorganizado
- ✅ Scripts de mantenimiento → `scripts/`
- ✅ Scripts de setup → `setup/`
- ✅ Documentación obsoleta → eliminada
- ✅ Estructura limpia y escalable

---

**Status:** ✅ Proyecto limpio y organizado  
**Última actualización:** Diciembre 10, 2025
