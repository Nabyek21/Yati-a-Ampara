import express from 'express';
import { ForoController } from '../controllers/foroController.js';
import { verificarToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Middleware de autenticación requerido
router.use(verificarToken);

// ============ RUTAS PARA TEMAS ============

// GET: Obtener todos los temas de una sección
router.get('/seccion/:id_seccion', ForoController.obtenerTemas);

// GET: Obtener detalles de un tema específico
router.get('/tema/:id_tema', ForoController.obtenerTemaPorId);

// POST: Crear nuevo tema
router.post('/tema', ForoController.crearTema);

// PUT: Actualizar tema
router.put('/tema/:id_tema', ForoController.actualizarTema);

// DELETE: Eliminar tema
router.delete('/tema/:id_tema', ForoController.eliminarTema);

// ============ RUTAS PARA RESPUESTAS ============

// GET: Obtener respuestas de un tema
router.get('/tema/:id_tema/respuestas', ForoController.obtenerRespuestas);

// POST: Crear respuesta en un tema
router.post('/tema/:id_tema/respuesta', ForoController.crearRespuesta);

// PUT: Actualizar respuesta
router.put('/respuesta/:id_respuesta', ForoController.actualizarRespuesta);

// DELETE: Eliminar respuesta
router.delete('/respuesta/:id_respuesta', ForoController.eliminarRespuesta);

// GET: Obtener respuestas recientes del usuario
router.get('/seccion/:id_seccion/respuestas-usuario', ForoController.obtenerRespuestasUsuario);

export default router;
