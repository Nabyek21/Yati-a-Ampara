import express from "express";
import {
  createDocente,
  getAllDocentes,
  updateDocente,
  deactivateDocente
} from "../controllers/docenteController.js";

const router = express.Router();

router.post("/", createDocente);
router.get("/", getAllDocentes);
router.put("/:id_docente_perfil", updateDocente);
router.patch("/deactivate/:id_docente_perfil", deactivateDocente);

export default router;
