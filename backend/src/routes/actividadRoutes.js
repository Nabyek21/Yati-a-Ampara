import express from "express";
import { 
  createActividad, 
  getAllActividades, 
  getActividadById, 
  updateActividad, 
  deleteActividad,
  getContenidoRelacionado,
  getTareasPendientes,
  getProximaEntrega
} from "../controllers/actividadController.js";
import { verificarToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/", createActividad);
router.get("/", (req, res) => {
  // Las rutas pendientes y proxima requieren autenticación
  if (req.query.pendientes || req.query.proxima) {
    return verificarToken(req, res, () => {
      if (req.query.pendientes) {
        return getTareasPendientes(req, res);
      } else if (req.query.proxima) {
        return getProximaEntrega(req, res);
      }
    });
  }
  // La ruta de getAllActividades no requiere autenticación
  return getAllActividades(req, res);
});
router.get("/:id_actividad", getActividadById);
router.get("/:id_actividad/contenido", getContenidoRelacionado);
router.put("/:id_actividad", updateActividad);
router.delete("/:id_actividad", deleteActividad);

export default router;

