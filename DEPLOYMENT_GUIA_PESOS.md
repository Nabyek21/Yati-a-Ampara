# 🚀 Guía de Deployment - Sistema de Pesos Configurables

## 📋 Checklist de Implementación

### **Paso 1: Base de Datos (5 minutos)**

```bash
# 1. Conectar a MySQL
mysql -u root -p

# 2. Seleccionar BD
USE soa_yatinnya;  # (reemplaza con tu nombre de BD)

# 3. Ejecutar scripts de creación y población
SOURCE C:\Proyectos\SoaYatinya\backend\database\CREAR_TABLA_PESOS.sql;
SOURCE C:\Proyectos\SoaYatinya\backend\database\INSERTAR_CONFIG_PESOS.sql;

# 4. Verificar
SELECT COUNT(*) FROM configuracion_pesos_actividades;
# Debería mostrar: 4 × (número de secciones)
```

**Ejemplo salida:**
```sql
MySQL> SELECT COUNT(*) FROM configuracion_pesos_actividades;
+----------+
| COUNT(*) |
+----------+
|       20 |
+----------+
# Si tienes 5 secciones: 5 × 4 tipos = 20 ✅
```

---

### **Paso 2: Backend (10 minutos)**

#### 2a. Verificar archivos

```powershell
# Verificar que existan los archivos nuevos
ls C:\Proyectos\SoaYatinya\backend\src\controllers\configPesosController.js
ls C:\Proyectos\SoaYatinya\backend\src\routes\configPesosRoutes.js

# Resultado esperado:
# configPesosController.js  ✅
# configPesosRoutes.js      ✅
```

#### 2b. Verificar que se montaron las rutas

```bash
# Abrir archivo app.js y verificar (línea ~140):
# import configPesosRoutes from "./routes/configPesosRoutes.js";
# app.use("/api/pesos", configPesosRoutes);
```

#### 2c. Reiniciar servidor

```bash
# En terminal backend
Ctrl+C  # Detener servidor

# Reiniciar
npm start
# o
pnpm start

# Esperado en logs:
# ✅ Servidor Express funcionando en http://localhost:4000
```

---

### **Paso 3: Frontend (5 minutos)**

#### 3a. Verificar archivos

```bash
# Archivos modificados:
ls C:\Proyectos\SoaYatinya\frontend\public\services\calificacionesService.js
ls C:\Proyectos\SoaYatinya\frontend\src\services\calificacionesService.js

# Verificar que contienen nuevas funciones
grep -n "calcularPromedioPonderadoDinamico" \
  C:\Proyectos\SoaYatinya\frontend\public\services\calificacionesService.js

# Resultado: función debe existir
```

#### 3b. Limpiar caché (importante!)

```bash
# Eliminar node_modules y reinstalar
cd frontend
rm -r node_modules
rm pnpm-lock.yaml

# Reinstalar
pnpm install

# Limpiar build cache
rm -r .astro
```

#### 3c. Reiniciar frontend

```bash
# Si ya estaba corriendo
Ctrl+C

# Reiniciar dev server
pnpm run dev

# Esperado:
# ✅ Astro Server está corriendo en http://localhost:4321
```

---

## ✅ Verificación Post-Deployment

### **Test 1: API de Pesos Funciona**

```bash
# Terminal: Verificar que la API responde

curl -X GET http://localhost:4000/api/pesos/resumen/1 \
  -H "Authorization: Bearer {tu_token_aqui}"

# Resultado esperado (JSON):
{
  "id_seccion": 1,
  "tipos": {
    "pc": {
      "peso_minimo": 10,
      "peso_maximo": 10,
      "peso_promedio": 10,
      "cantidad_maxima": 3
    },
    "examen": {
      "peso_minimo": 40,
      "peso_maximo": 40,
      "peso_promedio": 40,
      "cantidad_maxima": 1
    },
    ...
  },
  "pesoTotal": 100
}
```

### **Test 2: Crear Actividad con Tipo PC**

```bash
curl -X POST http://localhost:4000/api/actividades \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d '{
    "id_modulo": 1,
    "id_seccion": 1,
    "id_docente_perfil": 1,
    "titulo": "PC Test",
    "tipo": "pc",
    "puntaje_max": 20
  }'

# Resultado esperado:
{
  "message": "Actividad creada correctamente",
  "id_actividad": 123
}
```

### **Test 3: Página de Calificaciones**

```
1. Abre navegador
2. Ve a: http://localhost:4321/docente/calificaciones-estudiante/1
3. Abre DevTools (F12)
4. Ve a Consola
5. Busca mensajes como:
   - "✅ Configuración de pesos obtenida:"
   - "📊 Promedio Ponderado Dinámico calculado:"
   - "⚙️ Config usada:"
6. Verifica que el Promedio General sea un número razonable (15-20 en escala 0-20)
```

---

## 🔧 Troubleshooting

### **Problema: "404 Not Found en /api/pesos"**

```
Causa: Las rutas no se montaron correctamente
Solución:
1. Verificar que app.js tenga:
   import configPesosRoutes from "./routes/configPesosRoutes.js";
   app.use("/api/pesos", configPesosRoutes);
2. Reiniciar servidor
3. Verificar logs: debe decir "✅ Servidor funcionando"
```

### **Problema: "Error: ENOENT: no such file or directory"**

```
Causa: Archivos no existen o están en ruta incorrecta
Solución:
1. Verificar que existen:
   - backend/src/controllers/configPesosController.js
   - backend/src/routes/configPesosRoutes.js
2. Verificar rutas de importación en app.js
3. Reiniciar IDE si es necesario
```

### **Problema: "Configuración de pesos obtenida pero promedio sigue siendo 680"**

```
Causa: Datos invertidos en BD
Solución:
1. El sistema detecta y corrige automáticamente
2. Verificar en consola: buscar "⚠️ Datos invertidos detectados"
3. Si no aparece, los datos no están invertidos
4. Verificar que la DB tiene notas correctas:
   SELECT * FROM notas WHERE id_matricula = 1;
```

### **Problema: "TypeError: calcularPromedioPonderadoDinamico is not a function"**

```
Causa: Función no se importó correctamente
Solución:
1. Verificar que calificacionesService.js tiene la función exportada:
   export function calcularPromedioPonderadoDinamico(...)
2. Verificar que el archivo está en /public/services/
3. Limpiar caché: Ctrl+Shift+R en navegador
4. Reiniciar dev server: pnpm run dev
```

---

## 🎯 Puntos Clave de Validación

### **En BD**

- ✅ Tabla `configuracion_pesos_actividades` existe
- ✅ Tiene 4+ registros (por lo menos 1 sección con 4 tipos)
- ✅ `peso_minimo` y `peso_maximo` tienen valores razonables (0-100)
- ✅ `cantidad_maxima` es NULL o número positivo

### **En Backend**

- ✅ Archivo `configPesosController.js` existe
- ✅ Archivo `configPesosRoutes.js` existe
- ✅ `app.js` importa y monta las rutas
- ✅ Servidor inicia sin errores
- ✅ API responde en `/api/pesos/*`

### **En Frontend**

- ✅ `calificacionesService.js` (en `/public/` y `/src/`) tienen nuevas funciones
- ✅ Página `[id_matricula].astro` importa nuevas funciones
- ✅ Dev server inicia sin errores
- ✅ Página carga configuración de pesos
- ✅ Promedio se calcula correctamente

---

## 📊 Estadísticas de Cambio

```
Backend:
├─ Nuevos archivos: 2
├─ Archivos modificados: 1
├─ Nuevas rutas: 5
└─ Nuevas funciones: 5

Frontend:
├─ Nuevos archivos: 0
├─ Archivos modificados: 3
├─ Nuevas funciones: 4
└─ Componentes actualizados: 1

Base de Datos:
├─ Nuevas tablas: 1
├─ Nuevas vistas: 1
├─ Nuevos registros: ~20 (4 tipos × N secciones)
└─ Índices: 3

Total de cambios: ~45 modificaciones
Tiempo de implementación: ~30 minutos
```

---

## 🚀 Go-Live Checklist

- [ ] BD: Tabla creada e inicializada
- [ ] BD: Hay configuración para todas las secciones activas
- [ ] Backend: Archivos copiados en lugar correcto
- [ ] Backend: Rutas montadas en app.js
- [ ] Backend: Servidor reiniciado y corriendo
- [ ] Backend: API `/api/pesos` responde correctamente
- [ ] Frontend: Archivos sincronizados (/public y /src)
- [ ] Frontend: Página carga configuración
- [ ] Frontend: Promedio se calcula dinámicamente
- [ ] Frontend: Console logs muestran configuración
- [ ] Testing: Crear actividad tipo "pc" funciona
- [ ] Testing: Cambiar peso de examen funciona
- [ ] Testing: Promedio se recalcula con nuevos pesos
- [ ] Documentación: Usuarios saben cómo usar

---

## 📞 Soporte Rápido

| Problema | Solución Rápida |
|----------|-----------------|
| API retorna 404 | Reiniciar backend |
| Promedio no actualiza | Actualizar página Ctrl+Shift+R |
| Datos invertidos | Automático (se corrigen en frontend) |
| Error de conexión BD | Verificar BD está corriendo |
| Tipo "pc" rechazado | Actualizar backend, reiniciar |

---

## 📝 Comandos Útiles

```powershell
# Verificar tabla BD
Get-Command mysql; mysql -u root -p -e "SELECT * FROM configuracion_pesos_actividades LIMIT 5;"

# Test API
Invoke-WebRequest -Uri "http://localhost:4000/api/pesos/resumen/1" -Headers @{"Authorization"="Bearer {token}"}

# Limpiar y reinstalar frontend
cd frontend; rm -r node_modules; rm pnpm-lock.yaml; pnpm install; pnpm run dev

# Ver logs backend
# En terminal donde corre node server, buscar: "Configuración de pesos"
```

---

## 🎓 Resumen Ejecutivo

**Para ejecutar la implementación:**

1. **5 min**: Ejecutar scripts SQL en BD ✅
2. **2 min**: Verificar archivos backend están en lugar ✅
3. **2 min**: Reiniciar backend ✅
4. **2 min**: Sincronizar archivos frontend ✅
5. **2 min**: Reinstalar dependencias frontend ✅
6. **2 min**: Reiniciar frontend ✅
7. **5 min**: Ejecutar tests de validación ✅

**Total: ~20 minutos de implementación + testing**

---

**Última actualización:** Hoy  
**Estado:** ✅ LISTO PARA DEPLOYMENT  
**Versión:** 2.0
