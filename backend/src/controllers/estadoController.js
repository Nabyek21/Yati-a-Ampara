import { EstadoModel } from "../models/EstadoModel.js";

export const getAllEstados = async (req, res) => {
  try {
    const estados = await EstadoModel.getAll();
    res.json(estados);
  } catch (err) {
    console.error("ERROR obteniendo estados:", err);
    res.status(500).json({ message: "Error interno al obtener estados" });
  }
};
