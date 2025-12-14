import express from "express";
import { createSeccion, getAllSecciones, getSeccionById, updateSeccion, deactivateSeccion, getSeccionesDocente } from "../controllers/seccionController.js";
import { verificarToken } from "../middlewares/authMiddleware.js";
import PonderacionSectionController from "../controllers/ponderacionSectionController.js";

const router = express.Router();

router.post("/", createSeccion);
router.get("/docente/mis-secciones", verificarToken, getSeccionesDocente);
router.get("/", getAllSecciones);
router.get("/:id_seccion", getSeccionById);
router.put("/:id_seccion", updateSeccion);
router.patch("/deactivate/:id_seccion", deactivateSeccion);

// Rutas para ponderaciones por sección
router.get("/:id_seccion/ponderaciones", verificarToken, PonderacionSectionController.getPonderaciones);
router.post("/:id_seccion/ponderaciones", verificarToken, PonderacionSectionController.guardarPonderaciones);
router.get("/:id_seccion/tipos-actividad", verificarToken, PonderacionSectionController.getTiposActividad);
router.post("/:id_seccion/tipos-actividad", verificarToken, PonderacionSectionController.crearTipoActividad);

export default router;
