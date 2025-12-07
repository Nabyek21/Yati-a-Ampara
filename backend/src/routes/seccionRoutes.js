import express from "express";
import { createSeccion, getAllSecciones, getSeccionById, updateSeccion, deactivateSeccion, getSeccionesDocente } from "../controllers/seccionController.js";
import { verificarToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/", createSeccion);
router.get("/docente/mis-secciones", verificarToken, getSeccionesDocente);
router.get("/", getAllSecciones);
router.get("/:id_seccion", getSeccionById);
router.put("/:id_seccion", updateSeccion);
router.patch("/deactivate/:id_seccion", deactivateSeccion);

export default router;
