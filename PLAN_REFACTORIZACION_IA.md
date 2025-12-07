# Plan de Refactorización del Agente IA

## 🚀 Fases de Implementación

### FASE 1: Limpieza (30 minutos)

#### Paso 1.1: Eliminar Archivos Obsoletos

**A Eliminar:**
```
Frontend:
- /frontend/src/components/N8NChatWidget.astro
- /frontend/src/components/ResumenCursoIA.astro (no usado)
- /frontend/src/components/AnalisisActividadesIA.astro (no usado)
- /frontend/src/components/DesempenoEstudianteIA.astro (no usado)
- /frontend/src/components/BotonFlotanteIA.astro (no usado)
- /frontend/src/components/IAChat.astro (usar solo IAHeaderButton)
- /frontend/src/components/ChatStyles.astro (estilos inline)
- /frontend/public/services/iaService.js (duplicado)
- /frontend/public/validate-chatbot.js
```

#### Paso 1.2: Consolidar
- Mantener: `IAHeaderButton.astro` como componente principal

---

### FASE 2: Refactorización Backend (1 hora)

#### Paso 2.1: Crear Estructura de Módulos

**Crear archivos:**
```
/backend/src/services/ia/
├── contextBuilder.js          ← Constructor de contexto
├── promptTemplates.js         ← Templates de prompts
├── providers/
│   ├── openaiProvider.js      ← OpenAI integration
│   ├── anthropicProvider.js   ← Anthropic integration
│   └── geminiProvider.js      ← Google Gemini integration
└── conversationManager.js     ← Gestión de sesiones
```

#### Paso 2.2: Context Builder (Nuevo)
**`contextBuilder.js`** - Construir contexto rich para IA

```javascript
export class GradeContextBuilder {
  constructor(studentId, courseId) {
    this.studentId = studentId;
    this.courseId = courseId;
  }

  async buildContext() {
    // 1. Obtener calificaciones del estudiante
    // 2. Obtener configuración de pesos
    // 3. Calcular desempeño
    // 4. Identificar áreas débiles
    // 5. Generar recomendaciones
    return {
      student: {...},
      grades: {...},
      weights: {...},
      performance: {...},
      weakAreas: [...]
    }
  }
}
```

#### Paso 2.3: Prompt Templates (Nuevo)
**`promptTemplates.js`** - Templates reutilizables

```javascript
export const PROMPTS = {
  CHAT: `Eres AmparIA, asistente educativo...`,
  ANALYZE_PERFORMANCE: `Analiza el desempeño del estudiante...`,
  RECOMMEND_STUDY: `Recomienda áreas de estudio...`,
  EXPLAIN_CONCEPT: `Explica el concepto...`
}
```

#### Paso 2.4: Reestructurar iaService.js

**Cambios:**
```
Antes: 1 archivo gigante (1320 líneas)
Después: 
- iaService.js (orquestador)
- contextBuilder.js (contexto)
- promptTemplates.js (prompts)
- providers/*.js (APIs)
- conversationManager.js (sesiones)
```

---

### FASE 3: Integración con Pesos (45 minutos)

#### Paso 3.1: Enriquecer Contexto

En `contextBuilder.js`, integrar:

```javascript
async getStudentPerformanceAnalysis() {
  // 1. Obtener todas las actividades del estudiante
  const actividades = await this.getActividades();
  
  // 2. Obtener configuración de pesos
  const config = await this.getConfiguracionPesos();
  
  // 3. Calcular promedio ponderado ACTUAL
  const promedioActual = calcularPromedioPonderado(actividades, config);
  
  // 4. Análisis por tipo de actividad
  const analisisPorTipo = {
    practicas: { calificacion, peso, deficit },
    examen: { calificacion, peso, deficit },
    tareas: { calificacion, peso, deficit }
  };
  
  return {
    promedioActual,
    analisisPorTipo,
    recomendaciones: this.generarRecomendaciones(analisisPorTipo)
  };
}
```

#### Paso 3.2: Nuevas Rutas Contextualizadas

**Agregar a `iaRoutes.js`:**

```javascript
// Chat con contexto de calificaciones
router.post('/chat-grades', verificarToken, chatConIAWithGrades);

// Análisis de desempeño basado en pesos
router.get('/analyze-performance/:id_matricula', verificarToken, analyzePerformanceWithWeights);

// Recomendaciones de estudio personalizadas
router.get('/study-recommendations/:id_matricula', verificarToken, getStudyRecommendations);

// Plan de mejora
router.get('/improvement-plan/:id_matricula', verificarToken, getImprovementPlan);
```

---

### FASE 4: Refactorización Frontend (45 minutos)

#### Paso 4.1: Unificar Services

**`/frontend/src/services/iaService.js`** (autoridad única)

```javascript
// Chat con contexto de calificaciones
export async function chatConIAWithGrades(message, studentContext) { }

// Análisis de desempeño
export async function analyzePerformanceWithWeights(matriculaId) { }

// Recomendaciones
export async function getStudyRecommendations(matriculaId) { }

// Plan de mejora
export async function getImprovementPlan(matriculaId) { }
```

#### Paso 4.2: Mejorar IAHeaderButton.astro

**Cambios:**
1. Agregar contexto de usuario actual
2. Cargar automáticamente datos del estudiante
3. Mostrar análisis de desempeño si es estudiante
4. Mejorar UI/UX

---

### FASE 5: Nuevas Funcionalidades (1 hora)

#### Paso 5.1: Chatbot Inteligente

**Capacidades nuevas:**
- ✅ Entiende contexto de calificaciones
- ✅ Sugiere áreas de mejora basadas en pesos
- ✅ Recomienda acciones específicas
- ✅ Analiza tendencias de desempeño

#### Paso 5.2: Performance Insights

**Widget nuevo en dashboard del estudiante:**
- 📊 Gráfico de tendencias
- 📈 Predicción de calificación final
- 🎯 Metas por actividad
- 💡 Recomendaciones personalizadas

#### Paso 5.3: Study Planner

**Para estudiantes:**
- Plan de estudio generado por IA
- Basado en áreas débiles
- Considerando pesos configurables

---

## 📅 Timeline de Implementación

| Fase | Tiempo | Prioridad | Estado |
|------|--------|-----------|--------|
| 1: Limpieza | 30 min | 🔴 Alta | ⏳ Pendiente |
| 2: Refactor Backend | 1h | 🔴 Alta | ⏳ Pendiente |
| 3: Integración Pesos | 45 min | 🔴 Alta | ⏳ Pendiente |
| 4: Refactor Frontend | 45 min | 🟡 Media | ⏳ Pendiente |
| 5: Nuevas Features | 1h | 🟡 Media | ⏳ Pendiente |

**Total: ~4 horas de trabajo**

---

## ✅ Checklist de Implementación

### Fase 1: Limpieza
- [ ] Eliminar `N8NChatWidget.astro`
- [ ] Eliminar `ResumenCursoIA.astro`
- [ ] Eliminar `AnalisisActividadesIA.astro`
- [ ] Eliminar `DesempenoEstudianteIA.astro`
- [ ] Eliminar `BotonFlotanteIA.astro`
- [ ] Eliminar `IAChat.astro`
- [ ] Eliminar `ChatStyles.astro`
- [ ] Eliminar `/frontend/public/services/iaService.js`
- [ ] Eliminar `/frontend/public/validate-chatbot.js`
- [ ] Commit: "Limpiar componentes IA obsoletos"

### Fase 2: Refactor Backend
- [ ] Crear `/backend/src/services/ia/` directorio
- [ ] Crear `contextBuilder.js`
- [ ] Crear `promptTemplates.js`
- [ ] Crear `/backend/src/services/ia/providers/` directorio
- [ ] Crear `openaiProvider.js`
- [ ] Crear `anthropicProvider.js`
- [ ] Crear `geminiProvider.js`
- [ ] Refactorizar `iaService.js`
- [ ] Actualizar imports en `iaController.js`
- [ ] Commit: "Refactorizar servicio IA con módulos"

### Fase 3: Integración Pesos
- [ ] Enriquecer `GradeContextBuilder`
- [ ] Agregar integración con `configPesosService`
- [ ] Crear rutas nuevas en `iaRoutes.js`
- [ ] Crear controladores para nuevas rutas
- [ ] Tests de contexto
- [ ] Commit: "Integrar pesos en contexto IA"

### Fase 4: Refactor Frontend
- [ ] Consolidar `/frontend/src/services/iaService.js`
- [ ] Agregar nuevas funciones de servicio
- [ ] Mejorar `IAHeaderButton.astro`
- [ ] Cargar contexto del usuario
- [ ] Tests de componentes
- [ ] Commit: "Refactorizar servicios frontend IA"

### Fase 5: Nuevas Features
- [ ] Crear Widget de Performance Insights
- [ ] Crear Study Planner
- [ ] Integrar gráficos de tendencias
- [ ] Tests de nuevas features
- [ ] Commit: "Agregar Performance Insights y Study Planner"

---

## 🎯 Resultado Final

```
Backend Limpio:
✅ Modular
✅ Mantenible
✅ Integrado con pesos
✅ Fácil de extender

Frontend Limpio:
✅ Un servicio único
✅ Componentes consolidados
✅ Mejor UX
✅ Context-aware

Sistema IA Nuevo:
✅ Chatbot inteligente con contexto
✅ Análisis de desempeño mejorado
✅ Recomendaciones personalizadas
✅ Study planner automático
```

---

## 💡 Notas Importantes

1. **Mantener compatibilidad**: Las rutas antiguas deben seguir funcionando
2. **Datos existentes**: No afecta datos en BD
3. **Entorno**: Requiere variables de entorno correctas
4. **Testing**: Crear tests para nuevas funciones
5. **Documentación**: Actualizar README con nuevas capacidades
