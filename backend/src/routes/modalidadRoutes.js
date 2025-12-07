import express from "express";
import { getAllModalidades } from "../controllers/modalidadController.js";

const router = express.Router();

router.get("/", getAllModalidades);

export default router;
