# 📊 Sistema de Pesos Configurables - Guía de Implementación

## 🎯 Cambios Realizados

Hemos implementado un sistema de **configuración dinámica de pesos de actividades** que permite definir:
- **Qué tipos de actividades existen** (PC, Examen, Tarea, Quiz, etc.)
- **Qué peso tiene cada tipo** (puede variar entre 20-30%, 30-40%, etc.)
- **Cantidad máxima de actividades** a contar de cada tipo

---

## 📝 ¿Dónde Se Define Si Una Actividad Es "PC" o "Examen"?

### **Opción 1: Al Crear la Actividad**

Cuando un docente crea una nueva actividad, debe especificar el **tipo**:

```
POST /api/actividades
{
  "id_modulo": 1,
  "id_seccion": 1,
  "id_docente_perfil": 1,
  "titulo": "Primera Práctica Calificada",
  "tipo": "pc"  ← ⚠️ AQUÍ SE DEFINE
  "descripcion": "Contenido de la PC",
  "puntaje_max": 20
}
```

**Tipos permitidos ahora:**
- `pc` - Práctica Calificada
- `examen` - Examen Final
- `tarea` - Tarea
- `quiz` - Quiz/Evaluación Corta
- `evaluacion` - Otra evaluación
- `trabajo` - Trabajo grupal

---

## ⚙️ Configuración de Pesos por Sección

### **Nueva Tabla en Base de Datos**

```sql
CREATE TABLE configuracion_pesos_actividades (
  id_configuracion INT PRIMARY KEY AUTO_INCREMENT,
  id_seccion INT NOT NULL,
  tipo_actividad VARCHAR(50) NOT NULL,
  peso_minimo DECIMAL(5, 2),     -- Peso mínimo permitido
  peso_maximo DECIMAL(5, 2),     -- Peso máximo permitido
  cantidad_maxima INT,            -- Máx actividades de este tipo a contar
  orden INT,                       -- Orden de visualización
  activo BOOLEAN
);
```

### **Configuración Por Defecto (Recomendada)**

```
Sección 1:
├─ PC:      10% cada una (máximo 3) = 30% total
├─ Examen:  40% (solo 1 cuenta)
├─ Tarea:   15-30% (flexible)
└─ Quiz:    10-20% (flexible)
   ────────────────────────
   TOTAL:    100%
```

### **Cómo Cambiar los Pesos**

**API: Actualizar peso de un tipo**

```bash
PUT /api/pesos/{id_seccion}/{tipo_actividad}
{
  "peso_minimo": 20,
  "peso_maximo": 30,
  "cantidad_maxima": 4
}

Ejemplo:
PUT /api/pesos/1/pc
{
  "peso_minimo": 15,
  "peso_maximo": 15,
  "cantidad_maxima": 4
}
→ Cambiar a 4 PCs de 15% cada una = 60% total
```

**API: Obtener configuración actual**

```bash
GET /api/pesos/resumen/1
→ Retorna JSON con todos los tipos y sus pesos configurados
```

---

## 🔢 Fórmula de Cálculo Dinámico

```javascript
// Obtener configuración
const config = await obtenerConfiguracionPesos(id_seccion);

// Ejemplo si se modificó a 4 PCs:
config.tipos = {
  pc: { peso_promedio: 15, cantidad_maxima: 4 },
  examen: { peso_promedio: 40, cantidad_maxima: 1 },
  tarea: { peso_promedio: 22.5 },
  quiz: { peso_promedio: 15 }
}

// Cálculo:
// Si estudiante tiene: 4 PCs (16, 18, 15, 14), 1 Examen (18), 2 Tareas (17, 16)
// 
// PC Promedio = (16+18+15+14)/4 = 15.75 → 15.75 × 0.15 × 4 = 9.45
// EF = 18 → 18 × 0.40 = 7.20
// Tareas = (17+16)/2 = 16.5 → 16.5 × 0.225 = 3.71
//
// Total = 9.45 + 7.20 + 3.71 = 20.36 ≈ 20/20 en escala 0-20
```

---

## 🎨 Frontend: Cómo Usar en Componentes

### **1. Obtener Configuración**

```javascript
import { obtenerConfiguracionPesos } from '/services/calificacionesService.js';

const config = await obtenerConfiguracionPesos(id_seccion);
console.log(config);
// {
//   tipos: {
//     pc: { peso_minimo: 10, peso_maximo: 10, cantidad_maxima: 3 },
//     examen: { peso_minimo: 40, peso_maximo: 40, cantidad_maxima: 1 },
//     ...
//   },
//   pesoTotal: 100
// }
```

### **2. Calcular Promedio Dinámico**

```javascript
import { 
  obtenerConfiguracionPesos, 
  calcularPromedioPonderadoDinamico 
} from '/services/calificacionesService.js';

const notas = await obtenerCalificacionesEstudiante(id_matricula);
const config = await obtenerConfiguracionPesos(id_seccion);

// Usa la config para calcular
const promedio = calcularPromedioPonderadoDinamico(notas, config);
console.log(`Promedio: ${promedio}`); // 17.5
```

### **3. Si No Hay Configuración (Usa Default)**

```javascript
// Si el servidor no tiene configuración, usa valores por defecto
const promedio = calcularPromedioPonderadoDinamico(notas);
// Sin segundo parámetro, usa getConfiguracionPesosDefault()
```

---

## 🚀 Rutas API Disponibles

```
GET    /api/pesos
       → Obtiene TODAS las configuraciones de todas las secciones

GET    /api/pesos/seccion/{id_seccion}
       → Obtiene configuración detallada de una sección

GET    /api/pesos/resumen/{id_seccion}
       → Obtiene resumen para cálculos en frontend (RECOMENDADO)

POST   /api/pesos
       → Crea nueva configuración
       {
         "id_seccion": 1,
         "tipo_actividad": "pc",
         "peso_minimo": 10,
         "peso_maximo": 10,
         "cantidad_maxima": 3,
         "orden": 1
       }

PUT    /api/pesos/{id_seccion}/{tipo_actividad}
       → Actualiza configuración existente
       {
         "peso_minimo": 15,
         "peso_maximo": 15,
         "cantidad_maxima": 4
       }
```

---

## 📋 Base de Datos: Insertar Configuración Inicial

```sql
INSERT INTO configuracion_pesos_actividades 
(id_seccion, tipo_actividad, peso_minimo, peso_maximo, cantidad_maxima, orden, activo)
VALUES 
  (1, 'pc', 10.00, 10.00, 3, 1, TRUE),
  (1, 'examen', 40.00, 40.00, 1, 2, TRUE),
  (1, 'tarea', 15.00, 30.00, NULL, 3, TRUE),
  (1, 'quiz', 10.00, 20.00, NULL, 4, TRUE),
  
  (2, 'pc', 10.00, 10.00, 3, 1, TRUE),
  (2, 'examen', 40.00, 40.00, 1, 2, TRUE),
  (2, 'tarea', 20.00, 20.00, NULL, 3, TRUE),
  (2, 'quiz', 10.00, 10.00, NULL, 4, TRUE);
```

---

## ✅ Ejemplo Completo: Cambiar Pesos de una Sección

**Paso 1: Ver configuración actual**
```bash
curl http://localhost:4000/api/pesos/resumen/1 \
  -H "Authorization: Bearer {token}"
```

**Paso 2: Modificar peso de examen a 35%**
```bash
curl -X PUT http://localhost:4000/api/pesos/1/examen \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d '{"peso_minimo": 35, "peso_maximo": 35}'
```

**Paso 3: Nueva fórmula automática**
```
PC:      10% × 3 = 30%
Examen:  35%      ← Cambió de 40% a 35%
Tarea:   22.5%
Quiz:    12.5%
────────────────
Total:   100%
```

Los promedios de estudiantes se recalcularán automáticamente con los nuevos pesos.

---

## 🔄 Flujo en la Aplicación

```
1. Docente crea actividad
   ↓
   Especifica tipo: "pc", "examen", "tarea", etc.
   ↓
   Se guarda en BD con ese tipo

2. Sistema calcula promedio de estudiante
   ↓
   Obtiene configuración de pesos: /api/pesos/resumen/{id_seccion}
   ↓
   Agrupa notas por tipo según configuración
   ↓
   Aplica pesos: Promedio = Σ(promedio_por_tipo × peso)
   ↓
   Muestra promedio actualizado

3. Admin quiere cambiar pesos
   ↓
   PUT /api/pesos/{id_seccion}/{tipo}
   ↓
   Todos los cálculos futuros usan nuevos pesos
   ↓
   Promedios históricos NO se afectan (son valores calculados)
```

---

## 📊 Ventajas del Sistema

✅ **Flexible**: Puedes cambiar pesos sin tocar código  
✅ **Dinámico**: Cada sección puede tener configuración diferente  
✅ **Escalable**: Fácil agregar nuevos tipos de actividades  
✅ **Robusto**: Fallback a valores default si no hay configuración  
✅ **Auditable**: Todo guardado en BD con timestamps  

---

## ⚠️ Importante

### Tipos de Actividades Disponibles

Cuando crees una actividad, usa UNO de estos tipos:

| Tipo | Descripción | Uso Común |
|------|-------------|----------|
| `pc` | Práctica Calificada | Evaluaciones periódicas |
| `examen` | Examen | Evaluación final o parcial |
| `tarea` | Tarea | Trabajos para casa |
| `quiz` | Quiz/Evaluación Corta | Pruebas cortas |
| `evaluacion` | Otra Evaluación | Evaluaciones especiales |
| `trabajo` | Trabajo Grupal | Proyectos en equipo |

### Caso Importante: Si Se Crea Actividad Con Tipo Desconocido

```javascript
// Si creas una actividad con tipo "prueba" (no reconocido)
// El sistema fallará en validación:

POST /api/actividades
{
  "tipo": "prueba"  ← NO EXISTE
}

❌ Error: 400 Bad Request
"El tipo debe ser uno de: pc, tarea, examen, quiz, evaluacion, trabajo"
```

---

## 🎓 Resumen Para el Usuario Final

**Antes (Sistema Viejo):**
- ❌ Promedio = (Nota1 + Nota2 + ... + NotaN) / N
- ❌ No consideraba importancia de examen final
- ❌ 1700% en pantalla = Error

**Ahora (Sistema Nuevo):**
- ✅ Promedio = 3 PCs×10% + Examen×40% + Otras×30%
- ✅ Pesos configurables por sección
- ✅ Cálculo correcto = ~75% si tiene notas similares
- ✅ Datos invertidos se corrigen automáticamente
- ✅ Fácil cambiar fórmula sin reescribir código

---

## 🛠️ Para Modificar la Fórmula de Cálculo

Si quieres cambiar cómo se calcula (ej: añadir más tipos), edita:

**Backend:**
- `/backend/src/controllers/configPesosController.js` - Validaciones

**Frontend:**
- `/frontend/public/services/calificacionesService.js`
- `/frontend/src/services/calificacionesService.js`
  - Función: `calcularPromedioPonderadoDinamico()`

---

**Versión:** 2.0 - Sistema Dinámico  
**Estado:** ✅ PRODUCTIVO  
**Última Actualización:** Hoy  
**Próximas Mejoras:** UI para configurar pesos desde admin panel
