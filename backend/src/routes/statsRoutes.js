import express from "express";
import {
  getGeneralStats,
  getUsuariosByEstado,
  getCursosByEstado,
  getCursosByEspecialidad,
  getUsuariosByMonth,
  getCursosByMonth
} from "../controllers/statsController.js";

const router = express.Router();

router.get("/general", getGeneralStats);
router.get("/usuarios/estado", getUsuariosByEstado);
router.get("/cursos/estado", getCursosByEstado);
router.get("/cursos/especialidad", getCursosByEspecialidad);
router.get("/usuarios/mes", getUsuariosByMonth);
router.get("/cursos/mes", getCursosByMonth);

export default router;

