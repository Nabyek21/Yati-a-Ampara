import express from 'express';
import EstadisticasController from '../controllers/estadisticasController.js';
import { verificarToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(verificarToken);

// Obtener tareas por calificar de una sección
router.get('/seccion/:id_seccion/tareas-por-calificar', EstadisticasController.getTareasPorCalificarSeccion);

// Obtener estadísticas completas de un curso
router.get('/curso/:id_curso', EstadisticasController.getEstadisticasCurso);

// Obtener detalle de respuestas por calificar de una sección
router.get('/seccion/:id_seccion/respuestas-por-calificar', EstadisticasController.getDetalleRespuestasPorCalificar);

export default router;
