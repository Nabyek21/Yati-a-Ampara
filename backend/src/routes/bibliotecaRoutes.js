import express from 'express';
import { BibliotecaController } from '../controllers/BibliotecaController.js';
import { verificarToken } from '../middlewares/authMiddleware.js';
import { uploadMultiple } from '../middlewares/uploadMiddleware.js';

const router = express.Router();

// Middleware de autenticación requerido
router.use(verificarToken);

// GET: Obtener todos los recursos (público)
router.get('/', BibliotecaController.obtenerRecursos);

// GET: Obtener tipos de recursos
router.get('/tipos/lista', BibliotecaController.obtenerTipos);

// GET: Obtener recurso específico
router.get('/:id_recurso', BibliotecaController.obtenerRecursoPorId);

// POST: Crear nuevo recurso (admin) - con soporte para archivo
router.post('/', uploadMultiple.single('archivo'), BibliotecaController.crearRecurso);

// PUT: Actualizar recurso (admin o creador)
router.put('/:id_recurso', BibliotecaController.actualizarRecurso);

// DELETE: Eliminar recurso (admin o creador)
router.delete('/:id_recurso', BibliotecaController.eliminarRecurso);

export default router;
