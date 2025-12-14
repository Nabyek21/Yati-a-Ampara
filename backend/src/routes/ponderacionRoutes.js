import express from 'express';
import {
  createPonderacion,
  getAllPonderaciones,
  getPonderacionById,
  getPonderacionByCurso,
  updatePonderacion,
  deletePonderacion,
  obtenerResumenPesos
} from '../controllers/ponderacionController.js';

const router = express.Router();

// Obtener resumen de pesos de una sección
router.get('/resumen/:id_seccion', obtenerResumenPesos);

// Obtener todas las ponderaciones
router.get('/', getAllPonderaciones);

// Obtener ponderación por curso
router.get('/curso/:id_curso', getPonderacionByCurso);

// Obtener ponderación por ID
router.get('/:id_ponderacion', getPonderacionById);

// Crear nueva ponderación
router.post('/', createPonderacion);

// Actualizar ponderación
router.put('/:id_ponderacion', updatePonderacion);

// Eliminar ponderación
router.delete('/:id_ponderacion', deletePonderacion);

export default router;
