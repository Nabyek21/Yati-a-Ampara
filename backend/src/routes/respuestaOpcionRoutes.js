import express from "express";
import { 
  createRespuestaOpcion, 
  getAllRespuestaOpciones, 
  getRespuestaOpcionById, 
  updateRespuestaOpcion, 
  deleteRespuestaOpcion 
} from "../controllers/respuestaOpcionController.js";

const router = express.Router();

router.post("/", createRespuestaOpcion);
router.get("/", getAllRespuestaOpciones);
router.get("/:id_opcion", getRespuestaOpcionById);
router.put("/:id_opcion", updateRespuestaOpcion);
router.delete("/:id_opcion", deleteRespuestaOpcion);

export default router;

