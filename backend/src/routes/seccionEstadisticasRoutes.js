import express from "express";
import { getEstadisticasPorSeccion } from "../controllers/seccionEstadisticasController.js";

const router = express.Router();

// Endpoint para analíticas de sección (API REST)
router.get("/:id_seccion/estadisticas", getEstadisticasPorSeccion);

export default router;
