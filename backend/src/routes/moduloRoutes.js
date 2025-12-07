import express from "express";
import { getModulosByCurso, getModulosBySeccion } from "../controllers/moduloController.js";

const router = express.Router();

router.get("/curso/:id_curso", getModulosByCurso);
router.get("/seccion/:id_seccion", getModulosBySeccion);

export default router;

