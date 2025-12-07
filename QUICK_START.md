# ⚡ Quick Start - Sistema de Pesos Configurables

## 🎯 En 5 Minutos

### **1️⃣ Ejecutar Scripts BD (2 min)**

```powershell
# Conectar a MySQL y ejecutar
mysql -u root -p soa_yatinnya < backend\database\CREAR_TABLA_PESOS.sql
mysql -u root -p soa_yatinnya < backend\database\INSERTAR_CONFIG_PESOS.sql

# Verificar
mysql -u root -p soa_yatinnya -e "SELECT COUNT(*) FROM configuracion_pesos_actividades;"
```

---

### **2️⃣ Reiniciar Backend (2 min)**

```bash
cd backend
# Ctrl+C si está corriendo

npm start
# o
pnpm start

# Esperar logs: "✅ Servidor Express funcionando"
```

---

### **3️⃣ Reiniciar Frontend (1 min)**

```bash
cd frontend
# Ctrl+C si está corriendo

# Limpiar caché
rm -r node_modules
rm pnpm-lock.yaml

# Reinstalar
pnpm install

# Correr
pnpm run dev

# Esperar logs: "✅ Astro Server está corriendo"
```

---

## ✅ Verificar Que Funciona

### **Test 1: Crear Actividad PC**

```bash
# En Postman o curl:
POST http://localhost:4000/api/actividades
{
  "id_modulo": 1,
  "id_seccion": 1,
  "id_docente_perfil": 1,
  "titulo": "PC Test",
  "tipo": "pc",
  "puntaje_max": 20
}

# ✅ Debe responder: 201 Created
```

---

### **Test 2: Abrir Historial de Calificaciones**

```
1. Abre: http://localhost:4321/docente/calificaciones-estudiante/1
2. Abre DevTools (F12)
3. Va a Consola
4. Busca: "✅ Configuración de pesos obtenida"
5. Promedio General debe ser número entre 0-20 (NO 680 ❌)
```

---

### **Test 3: Cambiar Pesos (Opcional)**

```bash
PUT http://localhost:4000/api/pesos/1/examen
{
  "peso_minimo": 35,
  "peso_maximo": 35
}

# ✅ Promedio futuro = con examen a 35% (era 40%)
```

---

## 🎓 Resumen Arquitectura

```
┌─────────────────┐
│  BD (MySQL)     │
│  Nueva tabla    │
│  config_pesos   │
└────────┬────────┘
         │
         ↓
┌─────────────────────┐
│ Backend (Express)   │
│ GET /api/pesos      │
│ PUT /api/pesos      │
└────────┬────────────┘
         │
         ↓
┌─────────────────────┐
│ Frontend (Astro)    │
│ Calcula promedio    │
│ Muestra resultado   │
└─────────────────────┘
```

---

## 📝 Tipos Disponibles

```javascript
Crear actividad:
• tipo: "pc"         → Práctica Calificada (10% cada una, máx 3)
• tipo: "examen"     → Examen Final (40%)
• tipo: "tarea"      → Tarea (15-30%)
• tipo: "quiz"       → Quiz (10-20%)
• tipo: "evaluacion" → Otra (flexible)
• tipo: "trabajo"    → Trabajo (flexible)
```

---

## 🐛 Si Algo Falla

| Error | Solución |
|-------|----------|
| 404 en `/api/pesos` | Reiniciar backend |
| Promedio sigue siendo 680 | Limpiar caché: Ctrl+Shift+R |
| "Cannot find module" | `rm -r node_modules && pnpm install` |
| Tipo "pc" rechazado | Actualizar backend, reiniciar |
| Tabla no existe | Ejecutar scripts SQL |

---

## 📚 Documentación Completa

- **SISTEMA_PESOS_CONFIGURABLES.md** ← Guía detallada
- **DEPLOYMENT_GUIA_PESOS.md** ← Pasos de instalación
- **RESUMEN_IMPLEMENTACION_PESOS.md** ← Resumen técnico
- **VISUAL_SUMMARY.txt** ← Diagrama ASCII

---

## ⚡ Lo Más Importante

```
ANTES:  Promedio = 680.0 ❌
AHORA:  Promedio = 17.5 ✅

ANTES:  Pesos hardcodeados
AHORA:  Pesos en BD (cambiables sin código)

ANTES:  3 tipos de actividades
AHORA:  6 tipos + extensible
```

---

**Estado: LISTO PARA USAR ✅**
