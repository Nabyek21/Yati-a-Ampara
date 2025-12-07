import express from "express";
import { register, login } from "../controllers/authController.js";
import { validateRequest } from "../validators/authValidators.js";
import { registerSchema, loginSchema } from "../validators/authValidators.js";

const router = express.Router();

// Temporalmente sin limitadores para debug de CORS
router.post("/register", validateRequest(registerSchema), register);
router.post("/login", validateRequest(loginSchema), login);

export default router;
