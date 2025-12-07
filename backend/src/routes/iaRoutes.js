import express from 'express';
import {
  resumirCurso,
  resumirActividadesCurso,
  generarPreguntasAutomaticas,
  analizarDesempenoEstudianteCurso,
  obtenerRecomendacionesEstudiante,
  generarReporteCurso,
  chatConIA,
  resumirModuloEndpoint,
  generarPlanEstudioEndpoint,
  responderPreguntaEndpoint,
  generarGuiaEstudioEndpoint
} from '../controllers/iaController.js';
import { verificarToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

/**
 * Rutas del Agente IA
 * Todas requieren autenticación
 */

// === RUTAS ORIGINALES ===

// Resumen de contenido del curso
router.get('/resumir-curso/:id_curso', verificarToken, resumirCurso);

// Resumen de actividades
router.get('/resumir-actividades/:id_curso', verificarToken, resumirActividadesCurso);

// Generar preguntas automáticas
router.post('/generar-preguntas', verificarToken, generarPreguntasAutomaticas);

// Analizar desempeño del estudiante
router.get(
  '/analizar-desempeño/:id_estudiante/:id_curso',
  verificarToken,
  analizarDesempenoEstudianteCurso
);

// Recomendaciones personalizadas
router.get(
  '/recomendaciones/:id_estudiante/:id_curso',
  verificarToken,
  obtenerRecomendacionesEstudiante
);

// Reporte completo del curso
router.get('/reporte-curso/:id_curso', verificarToken, generarReporteCurso);

// === NUEVAS RUTAS ===

// Chat interactivo con IA
router.post('/chat', verificarToken, chatConIA);

// Resumir módulo específico
router.get('/resumir-modulo/:id_modulo', verificarToken, resumirModuloEndpoint);

// Generar plan de estudio personalizado
router.post('/plan-estudio', verificarToken, generarPlanEstudioEndpoint);

// Responder preguntas sobre contenido
router.post('/responder-pregunta', verificarToken, responderPreguntaEndpoint);

// Generar guía de estudio
router.get('/guia-estudio/:tema', verificarToken, generarGuiaEstudioEndpoint);

export default router;
