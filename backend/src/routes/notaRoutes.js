import express from "express";
import { getNotasByMatricula, updateNota, createNota } from "../controllers/notaController.js";

const router = express.Router();

// GET /api/notas?matricula=ID&actividad=ID
router.get("/", getNotasByMatricula);
// POST /api/notas - Crear nueva nota
router.post("/", createNota);
// PUT /api/notas/:id_nota
router.put("/:id_nota", updateNota);

export default router;
