import express from "express";
import { 
  createPregunta, 
  getAllPreguntas, 
  getPreguntaById, 
  updatePregunta, 
  deletePregunta 
} from "../controllers/preguntaController.js";

const router = express.Router();

router.post("/", createPregunta);
router.get("/", getAllPreguntas);
router.get("/:id_pregunta", getPreguntaById);
router.put("/:id_pregunta", updatePregunta);
router.delete("/:id_pregunta", deletePregunta);

export default router;

