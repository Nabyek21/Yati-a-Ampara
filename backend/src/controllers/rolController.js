import { RolModel } from "../models/RolModel.js";

export const getAllRoles = async (req, res) => {
  try {
    const roles = await RolModel.getAll();
    res.json(roles);
  } catch (err) {
    console.error("ERROR obteniendo roles:", err);
    res.status(500).json({ message: "Error interno al obtener roles" });
  }
};
