import express from "express";
const router = express.Router();
import RespuestaAlumnoController from "../controllers/respuestaAlumnoController.js";
import { verificarToken } from "../middlewares/authMiddleware.js";

// POST - Enviar respuesta
router.post("/enviar", 
    verificarToken,
    RespuestaAlumnoController.enviarRespuesta
);

// GET - Respuestas por actividad y matricula
router.get("/actividad/:id_actividad/:id_matricula", 
    verificarToken,
    RespuestaAlumnoController.getRespuestasPorActividad
);

// GET - Calificacion total de actividad
router.get("/calificacion/:id_actividad/:id_matricula",
    verificarToken,
    RespuestaAlumnoController.getCalificacionActividad
);

// POST - Calificar pregunta automaticamente
router.post("/calificar/:id_respuesta",
    verificarToken,
    RespuestaAlumnoController.calificarPregunta
);

// GET - Respuestas por pregunta
router.get("/pregunta/:id_pregunta", 
    verificarToken,
    RespuestaAlumnoController.getRespuestasPorPregunta
);

// GET - Estadisticas de pregunta
router.get("/estadisticas/pregunta/:id_pregunta", 
    verificarToken,
    RespuestaAlumnoController.getEstadisticasPregunta
);

// DELETE - Eliminar respuesta
router.delete("/:id", 
    verificarToken,
    RespuestaAlumnoController.eliminarRespuesta
);

// PUT - Actualizar respuesta (SOLO VERIFICAR TOKEN, SIN VERIFICAR ROL)
router.put("/:id_respuesta",
    verificarToken,
    RespuestaAlumnoController.actualizarRespuesta
);

export default router;
