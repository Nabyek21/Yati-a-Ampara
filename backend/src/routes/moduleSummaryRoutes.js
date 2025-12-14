/**
 * Rutas para Resumen de Módulos
 * Endpoints para generar resúmenes estructurados y audio
 */

import express from 'express';
import {
  getModuleSummary,
  getModuleSummaryWithAudio,
  resumeModuleChat,
  downloadModuleSummaryAudio,
} from '../controllers/moduleSummaryController.js';
import { verificarToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

/**
 * GET /api/modulos/:id_modulo/resumen
 * Obtener resumen estructurado de un módulo
 * Query: id_curso (requerido)
 */
router.get('/:id_modulo/resumen', verificarToken, getModuleSummary);

/**
 * POST /api/modulos/:id_modulo/resumen-audio
 * Obtener resumen y generar audio
 * Body: { id_curso, incluirAudio: boolean }
 */
router.post('/:id_modulo/resumen-audio', verificarToken, getModuleSummaryWithAudio);

/**
 * POST /api/modulos/resumen-chat
 * Chat interactivo para pedir resúmenes
 * Body: { mensaje, id_curso, id_modulo }
 */
router.post('/resumen-chat', verificarToken, resumeModuleChat);

/**
 * GET /api/modulos/:id_modulo/descargar-audio-resumen
 * Descargar audio del resumen
 * Query: id_curso (requerido)
 */
router.get('/:id_modulo/descargar-audio-resumen', verificarToken, downloadModuleSummaryAudio);

export default router;
