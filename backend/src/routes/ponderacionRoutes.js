import express from 'express';
import {
  createPonderacion,
  getAllPonderaciones,
  getPonderacionById,
  getPonderacionByCurso,
  updatePonderacion,
  deletePonderacion
} from '../controllers/ponderacionController.js';

const router = express.Router();

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
