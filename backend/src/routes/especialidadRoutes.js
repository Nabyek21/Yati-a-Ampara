import express from "express";
import { getAllEspecialidades, createEspecialidad, updateEspecialidad, deleteEspecialidad } from "../controllers/especialidadController.js";

const router = express.Router();

router.get("/", getAllEspecialidades);
router.post("/", createEspecialidad);
router.put("/:id_especialidad", updateEspecialidad);
router.delete("/:id_especialidad", deleteEspecialidad);

export default router;
