import { CursoModel } from "../models/CursoModel.js";

export const createCurso = async (req, res) => {
  try {
    const newCurso = await CursoModel.create(req.body);
    res.status(201).json({ message: "Curso creado correctamente", id_curso: newCurso.insertId });
  } catch (err) {
    console.error("ERROR creando curso:", err);
    res.status(500).json({ message: "Error interno al crear curso" });
  }
};

export const getAllCursos = async (req, res) => {
  try {
    const filters = req.query;
    const cursos = await CursoModel.getAll(filters);
    res.json(cursos);
  } catch (err) {
    console.error("ERROR obteniendo cursos:", err);
    res.status(500).json({ message: "Error interno al obtener cursos" });
  }
};

export const getCursoById = async (req, res) => {
  try {
    const { id_curso } = req.params;
    const curso = await CursoModel.findById(parseInt(id_curso));
    if (!curso) {
      return res.status(404).json({ message: 'Curso no encontrado' });
    }
    res.json(curso);
  } catch (err) {
    console.error('ERROR obteniendo curso por id:', err);
    res.status(500).json({ message: 'Error interno al obtener curso' });
  }
};

export const updateCurso = async (req, res) => {
  try {
    const { id_curso } = req.params;
    const updated = await CursoModel.update(parseInt(id_curso), req.body);
    if (updated.affectedRows === 0) {
      return res.status(404).json({ message: "Curso no encontrado o sin cambios" });
    }
    res.json({ message: "Curso actualizado correctamente" });
  } catch (err) {
    console.error("ERROR actualizando curso:", err);
    res.status(500).json({ message: "Error interno al actualizar curso" });
  }
};

export const deactivateCurso = async (req, res) => {
  try {
    const { id_curso } = req.params;
    const deactivated = await CursoModel.deactivate(parseInt(id_curso));
    if (deactivated.affectedRows === 0) {
      return res.status(404).json({ message: "Curso no encontrado o ya inactivo" });
    }
    res.json({ message: "Curso desactivado (estado finalizado) correctamente" });
  } catch (err) {
    console.error("ERROR desactivando curso:", err);
    res.status(500).json({ message: "Error interno al desactivar curso" });
  }
};
