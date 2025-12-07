import { HoraClaseModel } from "../models/HoraClaseModel.js";

export const getAllHorasClase = async (req, res) => {
  try {
    const horas = await HoraClaseModel.getAll();
    res.json(horas);
  } catch (err) {
    console.error("ERROR obteniendo horas de clase:", err);
    res.status(500).json({ message: "Error interno al obtener horas de clase" });
  }
};

export const createHoraClase = async (req, res) => {
  try {
    const newHora = await HoraClaseModel.create(req.body);
    res.status(201).json({ message: "Hora de clase creada correctamente", id_hora: newHora.insertId });
  } catch (err) {
    console.error("ERROR creando hora de clase:", err);
    res.status(500).json({ message: "Error interno al crear hora de clase" });
  }
};

export const updateHoraClase = async (req, res) => {
  try {
    const { id_hora } = req.params;
    const updated = await HoraClaseModel.update(parseInt(id_hora), req.body);
    if (updated.affectedRows === 0) {
      return res.status(404).json({ message: "Hora de clase no encontrada o sin cambios" });
    }
    res.json({ message: "Hora de clase actualizada correctamente" });
  } catch (err) {
    console.error("ERROR actualizando hora de clase:", err);
    res.status(500).json({ message: "Error interno al actualizar hora de clase" });
  }
};

export const deleteHoraClase = async (req, res) => {
  try {
    const { id_hora } = req.params;
    const deleted = await HoraClaseModel.delete(parseInt(id_hora));
    if (deleted.affectedRows === 0) {
      return res.status(404).json({ message: "Hora de clase no encontrada" });
    }
    res.json({ message: "Hora de clase eliminada correctamente" });
  } catch (err) {
    console.error("ERROR eliminando hora de clase:", err);
    res.status(500).json({ message: "Error interno al eliminar hora de clase" });
  }
};

