import express from "express";
import { getAllRoles } from "../controllers/rolController.js";

const router = express.Router();

router.get("/", getAllRoles);

export default router;
