import express from "express";
import { getAllUsers, updateUser, deactivateUser } from "../controllers/userController.js";

const router = express.Router();

router.get("/", getAllUsers);
router.put("/:id_usuario", updateUser); // Ruta para actualizar usuario
router.patch("/deactivate/:id_usuario", deactivateUser); // Ruta para desactivar usuario

export default router;
