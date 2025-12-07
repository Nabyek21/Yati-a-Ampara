import express from "express";
import { generateClasesForSeccion, getAllClases, createClase, updateClase, deleteClase } from "../controllers/claseController.js";

const router = express.Router();

router.post("/generate", generateClasesForSeccion);
router.post("/", createClase);
router.get("/", getAllClases);
router.put("/:id_clase", updateClase);
router.delete("/:id_clase", deleteClase);

export default router;

