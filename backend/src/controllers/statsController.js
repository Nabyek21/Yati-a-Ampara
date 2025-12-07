import { StatsModel } from "../models/StatsModel.js";

export const getGeneralStats = async (req, res) => {
  try {
    const stats = await StatsModel.getGeneralStats();
    res.json(stats);
  } catch (err) {
    console.error("ERROR obteniendo estadísticas generales:", err);
    res.status(500).json({ message: "Error interno al obtener estadísticas" });
  }
};

export const getUsuariosByEstado = async (req, res) => {
  try {
    const data = await StatsModel.getUsuariosByEstado();
    res.json(data);
  } catch (err) {
    console.error("ERROR obteniendo usuarios por estado:", err);
    res.status(500).json({ message: "Error interno al obtener datos" });
  }
};

export const getCursosByEstado = async (req, res) => {
  try {
    const data = await StatsModel.getCursosByEstado();
    res.json(data);
  } catch (err) {
    console.error("ERROR obteniendo cursos por estado:", err);
    res.status(500).json({ message: "Error interno al obtener datos" });
  }
};

export const getCursosByEspecialidad = async (req, res) => {
  try {
    const data = await StatsModel.getCursosByEspecialidad();
    res.json(data);
  } catch (err) {
    console.error("ERROR obteniendo cursos por especialidad:", err);
    res.status(500).json({ message: "Error interno al obtener datos" });
  }
};

export const getUsuariosByMonth = async (req, res) => {
  try {
    const data = await StatsModel.getUsuariosByMonth();
    res.json(data);
  } catch (err) {
    console.error("ERROR obteniendo usuarios por mes:", err);
    res.status(500).json({ message: "Error interno al obtener datos" });
  }
};

export const getCursosByMonth = async (req, res) => {
  try {
    const data = await StatsModel.getCursosByMonth();
    res.json(data);
  } catch (err) {
    console.error("ERROR obteniendo cursos por mes:", err);
    res.status(500).json({ message: "Error interno al obtener datos" });
  }
};

