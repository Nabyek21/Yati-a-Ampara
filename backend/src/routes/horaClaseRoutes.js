import express from "express";
import { getAllHorasClase, createHoraClase, updateHoraClase, deleteHoraClase } from "../controllers/horaClaseController.js";

const router = express.Router();

router.get("/", getAllHorasClase);
router.post("/", createHoraClase);
router.put("/:id_hora", updateHoraClase);
router.delete("/:id_hora", deleteHoraClase);

export default router;

