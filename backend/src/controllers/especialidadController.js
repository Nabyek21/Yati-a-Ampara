import { EspecialidadModel } from "../models/EspecialidadModel.js";

export const getAllEspecialidades = async (req, res) => {
  try {
    const especialidades = await EspecialidadModel.getAll();
    res.json(especialidades);
  } catch (err) {
    console.error("ERROR obteniendo especialidades:", err);
    res.status(500).json({ message: "Error interno al obtener especialidades" });
  }
};

export const createEspecialidad = async (req, res) => {
  try {
    const { nombre } = req.body;
    if (!nombre) {
      return res.status(400).json({ message: "El nombre de la especialidad es requerido" });
    }
    const result = await EspecialidadModel.create(nombre);
    res.status(201).json({ message: "Especialidad creada correctamente", id_especialidad: result.insertId });
  } catch (err) {
    console.error("ERROR creando especialidad:", err);
    res.status(500).json({ message: "Error interno al crear especialidad" });
  }
};

export const updateEspecialidad = async (req, res) => {
  try {
    const { id_especialidad } = req.params;
    const { nombre } = req.body;
    if (!nombre) {
      return res.status(400).json({ message: "El nombre de la especialidad es requerido" });
    }
    const result = await EspecialidadModel.update(parseInt(id_especialidad), nombre);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Especialidad no encontrada" });
    }
    res.json({ message: "Especialidad actualizada correctamente" });
  } catch (err) {
    console.error("ERROR actualizando especialidad:", err);
    res.status(500).json({ message: "Error interno al actualizar especialidad" });
  }
};

export const deleteEspecialidad = async (req, res) => {
  try {
    const { id_especialidad } = req.params;
    const result = await EspecialidadModel.delete(parseInt(id_especialidad));
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Especialidad no encontrada" });
    }
    res.json({ message: "Especialidad eliminada correctamente" });
  } catch (err) {
    console.error("ERROR eliminando especialidad:", err);
    res.status(500).json({ message: "Error interno al eliminar especialidad" });
  }
};
