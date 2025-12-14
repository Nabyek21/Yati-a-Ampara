# 📚 Índice de Documentación - SoaYatinya

## 🎯 Comienza Aquí

1. **[ESTRUCTURA_PROYECTO.md](ESTRUCTURA_PROYECTO.md)** - Mapa del proyecto
   - Estructura de carpetas
   - Tecnologías utilizadas
   - Comandos principales

2. **[README.md](README.md)** - Descripción general del proyecto

---

## 🚀 Inicio Rápido

**Backend:**
```bash
cd backend
npm install
npm start
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

---

## 📊 Base de Datos

### Referencia Principal
- **[REFERENCIA_RAPIDA_BD.md](REFERENCIA_RAPIDA_BD.md)** ⭐ **COMIENZA AQUÍ**
  - Queries SQL útiles
  - Flujo de cálculo de notas
  - Problemas comunes y soluciones
  - Ponderaciones actuales (100%)

### Análisis Completo
- **[REVISION_BD_COMPLETADA_FINAL.md](REVISION_BD_COMPLETADA_FINAL.md)**
  - Antes/después de correcciones
  - Todas las 30 tablas documentadas
  - Estado de cada tabla

- **[REVISION_COMPLETA_BD_Y_FLUJO.md](REVISION_COMPLETA_BD_Y_FLUJO.md)**
  - Análisis técnico profundo
  - Problemas encontrados
  - Soluciones implementadas

### Diagramas y Flujos
- **[DIAGRAMA_FLUJO_DETALLADO.md](DIAGRAMA_FLUJO_DETALLADO.md)**
  - Diagramas de flujo
  - Diagramas ER
  - Flujos de calificación

---

## 🛠️ Sistemas

### Ponderaciones y Calificaciones
- **[SISTEMA_PONDERACIONES_COMPLETO.md](SISTEMA_PONDERACIONES_COMPLETO.md)**
  - Sistema completo de ponderaciones
  - Tabla de configuración

- **[SISTEMA_PONDERACION_CALIFICACIONES.md](SISTEMA_PONDERACION_CALIFICACIONES.md)**
  - Integración con calificaciones
  - Flujo de cálculo

### Otros Sistemas
- **[SISTEMA_FILTRADO_ACADEMICO.md](SISTEMA_FILTRADO_ACADEMICO.md)**
  - Filtrado académico
  - Reportes

---

## 📡 API

- **[API_ENDPOINTS_QUICK_REF.md](API_ENDPOINTS_QUICK_REF.md)**
  - Endpoints disponibles
  - Parámetros
  - Respuestas

- **[API_REFERENCE_CONTENIDOS_IA.md](API_REFERENCE_CONTENIDOS_IA.md)**
  - API de contenidos
  - Integración con IA

---

## 🔍 Resúmenes Ejecutivos

- **[RESUMEN_REVISION_EJECUTIVO.md](RESUMEN_REVISION_EJECUTIVO.md)**
  - Resumen de cambios
  - Status actual
  - Próximos pasos

---

## 🛠️ Scripts Disponibles

### En `backend/scripts/`
```bash
# Verificar BD completa
node scripts/verificar-bd-simple.js

# Corregir ponderaciones (si es necesario)
node scripts/corregir-ponderaciones.js

# Recalcular todas las calificaciones
node scripts/recalcular-calificaciones.js

# Ejecutar tests
node scripts/test-ponderaciones-backend.js
```

### En `backend/setup/`
```bash
# Migraciones iniciales
node setup/ejecutar-migracion.js

# Insertar datos de prueba
node setup/insertarDatosPrueba.js
```

---

## 📈 Status Actual

### Base de Datos ✅
- 30 tablas implementadas
- Ponderaciones: 100% (12.5% + 37.5% + 50%)
- Auto-cálculo funcionando
- Integridad validada

### Backend ✅
- CalificacionesService: 6 métodos
- Endpoints: 30+ controllers
- Validación y error handling
- Auto-cálculo en notas

### Frontend ⏳
- Astro + Tailwind configurado
- Servicio API conectado
- En desarrollo

---

## 📝 Última Limpieza

**Fecha:** Diciembre 10, 2025

### Eliminado
- 50+ archivos de documentación duplicados
- Scripts de prueba temporales
- Archivos de debug
- Logs antiguos

### Organizado
- Scripts → `backend/scripts/`
- Setup → `backend/setup/`
- Documentación principal en raíz
- Estructura clara y escalable

---

## 🚨 Problemas Solucionados

| Problema | Status | Solución |
|----------|--------|----------|
| Ponderaciones <100% | ✅ Resuelto | Redistribuidas a 12.5% + 37.5% + 50% |
| Calificaciones vacías | ✅ Resuelto | CalificacionesService ejecutado |
| Auto-cálculo no se disparaba | ✅ Resuelto | Hooks en notaController |
| Falta documentación | ✅ Resuelto | 7 documentos principales |
| Proyecto desordenado | ✅ Resuelto | Scripts en carpetas, docs limpios |

---

## 🔗 Recursos Útiles

- **BD MySQL:** localhost:3306 (yati)
- **Backend API:** localhost:3000
- **Frontend (dev):** localhost:3000
- **Node.js:** v16+ recomendado

---

## 📞 Contacto

- **Repositorio:** github.com/Nabyek21/Yati-a-Ampara
- **Rama:** master

---

**Versión:** 1.0  
**Estado:** ✅ Producción Lista  
**Última actualización:** Diciembre 10, 2025
