import express from 'express';
import {
  getConfiguracionPesos,
  getTodosPesos,
  actualizarConfiguracionPeso,
  crearConfiguracionPeso,
  getResumenConfiguracion
} from '../controllers/configPesosController.js';

const router = express.Router();

/**
 * @route GET /api/pesos
 * @desc Obtener todas las configuraciones de pesos
 */
router.get('/', getTodosPesos);

/**
 * @route GET /api/pesos/seccion/:id_seccion
 * @desc Obtener configuración de pesos para una sección
 */
router.get('/seccion/:id_seccion', getConfiguracionPesos);

/**
 * @route GET /api/pesos/resumen/:id_seccion
 * @desc Obtener resumen de configuración para cálculos en frontend
 */
router.get('/resumen/:id_seccion', getResumenConfiguracion);

/**
 * @route POST /api/pesos
 * @desc Crear nueva configuración de peso
 */
router.post('/', crearConfiguracionPeso);

/**
 * @route PUT /api/pesos/:id_seccion/:tipo_actividad
 * @desc Actualizar configuración de peso
 */
router.put('/:id_seccion/:tipo_actividad', actualizarConfiguracionPeso);

export default router;
