# Análisis del Sistema IA Actual

## 📋 Inventario Completo de Archivos IA

### Backend

#### Controllers
- **`/backend/src/controllers/iaController.js`** (720 líneas)
  - `resumirCurso` - GET resumen del curso
  - `resumirActividadesCurso` - GET resumen de actividades
  - `generarPreguntasAutomaticas` - GET generar preguntas
  - `analizarDesempenoEstudianteCurso` - GET analizar desempeño
  - `obtenerRecomendacionesEstudiante` - GET recomendaciones
  - `generarReporteCurso` - GET generar reporte
  - `chatConIA` - POST chat interactivo
  - `resumirModuloEndpoint` - Resumen de módulo
  - `generarPlanEstudioEndpoint` - Plan de estudio
  - `responderPreguntaEndpoint` - Responder pregunta
  - `generarGuiaEstudioEndpoint` - Guía de estudio

#### Services
- **`/backend/src/services/iaService.js`** (1320 líneas)
  - Funciones de resumen (local)
  - Funciones de análisis (local)
  - Chat con IA (`consultarAnthropicChat`, `consultarGeminiChat`, `consultarOpenAI`)
  - Construcción de prompts (`construirPromptChat`, etc.)
  - Gestión de contexto de conversación

#### Routes
- **`/backend/src/routes/iaRoutes.js`**
  - 12 rutas GET/POST para IA
  - Requieren autenticación con `verificarToken`

### Frontend

#### Componentes
- **`/frontend/src/components/IAHeaderButton.astro`** (450+ líneas)
  - Botón flotante en esquina superior derecha
  - Panel de chat integrado
  - Estilos completos
  - Script de interactividad

- **`/frontend/src/components/IAChat.astro`** (550+ líneas)
  - Chat interactivo (alternativa IAHeaderButton)
  - Mensajes de usuario/bot
  - Sugerencias
  - Estilos y animaciones

- **`/frontend/src/components/BotonFlotanteIA.astro`** (300+ líneas)
  - Menú flotante con opciones
  - Botones para: Resumen, Análisis, Desempeño, Preguntas
  - Estilos y animaciones

- **`/frontend/src/components/ResumenCursoIA.astro`**
  - Widget para resumen del curso

- **`/frontend/src/components/AnalisisActividadesIA.astro`**
  - Widget para análisis de actividades

- **`/frontend/src/components/DesempenoEstudianteIA.astro`**
  - Widget para análisis de desempeño

#### Services
- **`/frontend/src/services/iaService.js`**
  - `chatConIA` - Chat interactivo
  - `resumirCurso` - Resumen curso
  - `resumirActividades` - Resumen actividades
  - `generarPreguntas` - Generar preguntas
  - `analizarDesempenoEstudiante` - Análisis de desempeño
  - `obtenerRecomendaciones` - Recomendaciones
  - `generarReporteCurso` - Reporte del curso

- **`/frontend/public/services/iaService.js`** (Mirror/duplicado)
  - Mismas funciones que `/src/services/iaService.js`

#### Scripts
- **`/frontend/public/validate-chatbot.js`**
  - Script de validación del chatbot N8N

### Configuration
- **`/frontend/src/config/api.js`**
  - Define `IA_API` endpoint

---

## 🔧 Integraciones Actuales

### Proveedores de IA
El código soporta múltiples proveedores:
1. **OpenAI** - GPT models
2. **Anthropic** - Claude models
3. **Google Gemini** - Palm/Gemini models
4. **Hugging Face** - Modelos open source

### Variables de Entorno Requeridas
```
IA_PROVIDER=openai|anthropic|gemini|huggingface
IA_API_KEY=tu_clave_api
IA_MODEL=gpt-3.5-turbo|claude-3-sonnet|gemini-pro|etc
```

---

## 🐛 Problemas Actuales Identificados

### Código Muerto/Obsoleto
- ❌ `N8NChatWidget.astro` - Widget de N8N chatbot
- ❌ `/frontend/public/validate-chatbot.js` - Script de validación N8N
- ❌ Duplicación: `/frontend/public/services/iaService.js` vs `/frontend/src/services/iaService.js`

### Componentes Mal Utilizados
- ❌ `IAChat.astro` - Componente chat alternativo sin usar
- ❌ `BotonFlotanteIA.astro` - Menú flotante sin usar
- ❌ `ResumenCursoIA.astro` - Widget sin usar
- ❌ `AnalisisActividadesIA.astro` - Widget sin usar
- ❌ `DesempenoEstudianteIA.astro` - Widget sin usar

### Problemas de Integración
- ❌ Falta integración con sistema de **pesos configurables** (recién creado)
- ❌ No hay contexto de calificaciones en las respuestas de IA
- ❌ Chat no considera datos reales del estudiante

---

## ✨ Nueva Arquitectura Propuesta

### Fase 1: Eliminar
1. Eliminar `N8NChatWidget.astro`
2. Eliminar `/frontend/public/validate-chatbot.js`
3. Eliminar `/frontend/public/services/iaService.js` (duplicado)
4. Eliminar widgets sin usar:
   - `ResumenCursoIA.astro`
   - `AnalisisActividadesIA.astro`
   - `DesempenoEstudianteIA.astro`
   - `BotonFlotanteIA.astro` (o consolidar con IAHeaderButton)
5. Eliminar `IAChat.astro` (usar solo IAHeaderButton)

### Fase 2: Refactorizar
1. **Backend**
   - Reestructurar `iaService.js` para usar clases/módulos
   - Agregar contexto de pesos configurables
   - Separar lógica de prompts
   - Crear clase `GradeContextBuilder` para contexto de calificaciones

2. **Frontend**
   - Unificar servicio en `/src/services/iaService.js` (autoridad única)
   - Refactorizar `IAHeaderButton.astro` para mejor UX
   - Agregar contexto de calificaciones del estudiante
   - Mejorar manejo de errores

### Fase 3: Nuevas Funcionalidades
1. **Context-Aware Chat**
   - Incluir datos reales de calificaciones
   - Considerar pesos configurables
   - Análisis basado en desempeño real

2. **Study Recommendations**
   - Recomendaciones basadas en actividades débiles
   - Prácticas personalizadas según pesos

3. **Performance Analytics**
   - Análisis de tendencias
   - Predicción de desempeño

4. **Admin Dashboard** (opcional)
   - Análisis de uso de IA
   - Métricas de efectividad

---

## 📊 Estadísticas Actuales

- **Backend LOC**: ~2,000 líneas
- **Frontend LOC**: ~2,500 líneas
- **Archivos sin usar**: 8 archivos
- **Duplicación**: 1 service duplicado
- **Componentes sin usar**: 5 componentes

---

## 🎯 Beneficios de la Refactorización

✅ Código más limpio
✅ Mejor mantenibilidad
✅ Integración con pesos
✅ Mejor contexto para IA
✅ UX mejorada
✅ Fácil extensión futura
