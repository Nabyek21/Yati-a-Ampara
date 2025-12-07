import express from "express";
import { createCurso, getAllCursos, getCursoById, updateCurso, deactivateCurso } from "../controllers/cursoController.js";

const router = express.Router();

router.post("/", createCurso);
router.get("/", getAllCursos);
router.get("/:id_curso", getCursoById);
router.put("/:id_curso", updateCurso);
router.patch("/deactivate/:id_curso", deactivateCurso);

export default router;
