import express from "express";
import { getAllEstados } from "../controllers/estadoController.js";

const router = express.Router();

router.get("/", getAllEstados);

export default router;
