import { ModalidadModel } from "../models/ModalidadModel.js";

export const getAllModalidades = async (req, res) => {
  try {
    const modalidades = await ModalidadModel.getAll();
    res.json(modalidades);
  } catch (err) {
    console.error("ERROR obteniendo modalidades:", err);
    res.status(500).json({ message: "Error interno al obtener modalidades" });
  }
}; 