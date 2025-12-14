/**
 * IA Service Microservice
 * Puerto: 3004
 * Responsabilidad: Resúmenes y generación de IA
 * 
 * NOTA: Este es un ejemplo de demostración
 * En producción, usaría el código de moduleSummaryService.js del backend actual
 */

import express from 'express';
import axios from 'axios';

const app = express();
app.use(express.json());

// URLs de otros servicios
const CONTENT_SERVICE = process.env.CONTENT_SERVICE_URL || 'http://localhost:3003';
const COURSE_SERVICE = process.env.COURSE_SERVICE_URL || 'http://localhost:3002';

// Middleware para logging
app.use((req, res, next) => {
  console.log(`[IA Service] ${req.method} ${req.path}`);
  next();
});

/**
 * GET /modules/:id/summary
 * Generar resumen estructurado de un módulo
 */
app.get('/modules/:id/summary', async (req, res) => {
  try {
    const { id } = req.params;
    const { id_curso } = req.query;

    if (!id_curso) {
      return res.status(400).json({ error: 'Se requiere id_curso' });
    }

    // 1. Obtener contenido del módulo desde Content Service
    const contentResponse = await axios.get(
      `${CONTENT_SERVICE}/modules/${id}/content`,
      { headers: { Authorization: req.headers.authorization } }
    );
    const moduleContent = contentResponse.data;

    // 2. Obtener info del curso desde Course Service
    const courseResponse = await axios.get(
      `${COURSE_SERVICE}/courses/${id_curso}`,
      { headers: { Authorization: req.headers.authorization } }
    );
    const courseInfo = courseResponse.data;

    // 3. Generar resumen usando IA (OpenAI)
    const summary = await generateSummaryWithAI(
      moduleContent,
      courseInfo
    );

    res.json({
      success: true,
      moduleId: id,
      courseId: id_curso,
      summary: summary,
      generatedAt: new Date().toISOString()
    });
  } catch (err) {
    console.error('Error en /modules/:id/summary:', err.message);
    res.status(err.response?.status || 500).json({ 
      error: err.message 
    });
  }
});

/**
 * POST /modules/:id/summary-audio
 * Generar resumen y convertir a audio
 */
app.post('/modules/:id/summary-audio', async (req, res) => {
  try {
    const { id } = req.params;
    const { id_curso, incluirAudio = true } = req.body;

    if (!id_curso) {
      return res.status(400).json({ error: 'Se requiere id_curso' });
    }

    // 1. Generar resumen
    const contentResponse = await axios.get(
      `${CONTENT_SERVICE}/modules/${id}/content`,
      { headers: { Authorization: req.headers.authorization } }
    );
    const moduleContent = contentResponse.data;

    const courseResponse = await axios.get(
      `${COURSE_SERVICE}/courses/${id_curso}`,
      { headers: { Authorization: req.headers.authorization } }
    );
    const courseInfo = courseResponse.data;

    const summary = await generateSummaryWithAI(
      moduleContent,
      courseInfo
    );

    let audioUrl = null;

    // 2. Generar audio si se solicita
    if (incluirAudio) {
      const textForAudio = summary.resumenEjecutivo;
      audioUrl = await generateAudioWithTTS(textForAudio);
    }

    res.json({
      success: true,
      moduleId: id,
      courseId: id_curso,
      summary: summary,
      audioUrl: audioUrl,
      generatedAt: new Date().toISOString()
    });
  } catch (err) {
    console.error('Error en /modules/:id/summary-audio:', err.message);
    res.status(err.response?.status || 500).json({ 
      error: err.message 
    });
  }
});

/**
 * POST /modules/summary-chat
 * Chat interactivo para pedir resúmenes
 */
app.post('/modules/summary-chat', async (req, res) => {
  try {
    const { id_modulo, id_curso, mensaje } = req.body;

    if (!id_modulo || !id_curso || !mensaje) {
      return res.status(400).json({ 
        error: 'Se requiere id_modulo, id_curso y mensaje' 
      });
    }

    // 1. Obtener contenido del módulo
    const contentResponse = await axios.get(
      `${CONTENT_SERVICE}/modules/${id_modulo}/content`,
      { headers: { Authorization: req.headers.authorization } }
    );
    const moduleContent = contentResponse.data;

    // 2. Generar respuesta basada en contenido
    const response = await generateChatResponse(
      moduleContent,
      mensaje
    );

    res.json({
      success: true,
      moduleId: id_modulo,
      userMessage: mensaje,
      iaResponse: response,
      respondedAt: new Date().toISOString()
    });
  } catch (err) {
    console.error('Error en /modules/summary-chat:', err.message);
    res.status(err.response?.status || 500).json({ 
      error: err.message 
    });
  }
});

/**
 * GET /health
 * Health check del servicio
 */
app.get('/health', (req, res) => {
  res.json({
    service: 'IA Service',
    status: 'UP',
    timestamp: new Date().toISOString()
  });
});

/**
 * Funciones Auxiliares
 */

/**
 * Generar resumen usando IA
 * En producción, usaría OpenAI API
 */
async function generateSummaryWithAI(moduleContent, courseInfo) {
  // SIMULACIÓN: En producción, llamaría a OpenAI
  
  return {
    resumenEjecutivo: `Este módulo trata sobre ${moduleContent.titulo}. ${moduleContent.descripcion}`,
    conceptosClave: [
      'Concepto 1: Explicación breve',
      'Concepto 2: Explicación breve',
      'Concepto 3: Explicación breve'
    ],
    temasPrincipales: [
      {
        tema: 'Tema 1',
        explicacion: 'Explicación detallada del tema',
        puntosImportantes: ['Punto 1', 'Punto 2', 'Punto 3']
      },
      {
        tema: 'Tema 2',
        explicacion: 'Explicación detallada del tema',
        puntosImportantes: ['Punto 1', 'Punto 2']
      }
    ],
    aplicacionesPracticas: [
      'Aplicación 1 con ejemplo',
      'Aplicación 2 con ejemplo',
      'Aplicación 3 con ejemplo'
    ],
    recomendacionesEstudio: [
      'Recomendación 1',
      'Recomendación 2',
      'Recomendación 3'
    ]
  };
}

/**
 * Generar audio usando TTS
 * En producción, usaría OpenAI TTS API
 */
async function generateAudioWithTTS(text) {
  // SIMULACIÓN: En producción, llamaría a OpenAI TTS
  
  // Retornar URL simulada
  return `https://api.example.com/audio/${Date.now()}.mp3`;
}

/**
 * Generar respuesta de chat basada en contenido del módulo
 * En producción, usaría OpenAI Chat API
 */
async function generateChatResponse(moduleContent, userMessage) {
  // SIMULACIÓN: En producción, llamaría a OpenAI Chat

  // Lógica básica para responder
  const responses = {
    'resumen': `Resumen de ${moduleContent.titulo}: ${moduleContent.descripcion}`,
    'contenido': `El módulo incluye: ${moduleContent.tipo || 'contenido variado'}`,
    'ayuda': 'Puedo ayudarte con resúmenes, conceptos clave, aplicaciones prácticas y más.'
  };

  // Buscar palabra clave en mensaje
  for (const [key, response] of Object.entries(responses)) {
    if (userMessage.toLowerCase().includes(key)) {
      return response;
    }
  }

  // Respuesta por defecto
  return `Pregunta sobre ${moduleContent.titulo}: ${userMessage}. Basándome en el contenido del módulo...`;
}

/**
 * Manejo de errores
 */
app.use((err, req, res, next) => {
  console.error('IA Service Error:', err);
  res.status(err.status || 500).json({
    error: err.message,
    service: 'IA Service',
    timestamp: new Date().toISOString()
  });
});

// Iniciar servidor
const PORT = process.env.PORT || 3004;
app.listen(PORT, () => {
  console.log(`🤖 IA Service running on port ${PORT}`);
  console.log(`  Content Service: ${CONTENT_SERVICE}`);
  console.log(`  Course Service: ${COURSE_SERVICE}`);
});

export default app;
