import { pool } from "../config/database.js";
import { ModuloModel } from "./ModuloModel.js"; // Importar ModuloModel

export class CursoModel {
  static async create(data) {
    const { nombre, descripcion, id_especialidad, duracion_semanas, id_estado } = data;
    const [result] = await pool.query(
      "INSERT INTO cursos (nombre, descripcion, id_especialidad, duracion_semanas, id_estado) VALUES (?, ?, ?, ?, ?)",
      [nombre, descripcion, id_especialidad, duracion_semanas, id_estado || 1] // id_estado por defecto 1 (Activo/Publicado)
    );

    const newCursoId = result.insertId;

    // Crear módulos automáticamente basados en duracion_semanas
    for (let i = 1; i <= duracion_semanas; i++) {
      await ModuloModel.create(
        newCursoId,
        `Módulo ${i}: ${nombre}`,
        `Descripción del Módulo ${i} para el curso ${nombre}`,
        i
      );
    }

    return result;
  }

  static async getAll(filters = {}) {
    let query = `
      SELECT 
        c.id_curso,
        c.nombre,
        c.descripcion,
        c.id_especialidad,
        e.nombre AS nombre_especialidad,
        c.duracion_semanas,
        c.id_estado,
        s.nombre AS nombre_estado
      FROM 
        cursos c
      LEFT JOIN 
        especialidades e ON c.id_especialidad = e.id_especialidad
      LEFT JOIN 
        estados s ON c.id_estado = s.id_estado
    `;
    const params = [];
    const conditions = [];

    if (filters.search) {
      const searchTerm = `%${filters.search}%`;
      conditions.push("(c.nombre LIKE ? OR c.descripcion LIKE ? OR e.nombre LIKE ?)");
      params.push(searchTerm, searchTerm, searchTerm);
    }

    if (filters.id_especialidad) {
      conditions.push("c.id_especialidad = ?");
      params.push(filters.id_especialidad);
    }

    if (filters.id_estado) {
      conditions.push("c.id_estado = ?");
      params.push(filters.id_estado);
    }

    if (conditions.length > 0) {
      query += " WHERE " + conditions.join(" AND ");
    }

    const [rows] = await pool.query(query, params);
    return rows;
  }

  static async update(id_curso, data) {
    const fields = [];
    const params = [];

    for (const key in data) {
      if (Object.hasOwnProperty.call(data, key)) {
        fields.push(`${key} = ?`);
        params.push(data[key]);
      }
    }

    if (fields.length === 0) {
      return null; // No hay nada que actualizar
    }

    params.push(id_curso);
    const query = `UPDATE cursos SET ${fields.join(', ')} WHERE id_curso = ?`;
    const [result] = await pool.query(query, params);
    return result;
  }

  static async deactivate(id_curso) {
    // Asumiendo id_estado 4 para 'Finalizado' o inactivo para cursos
    const [result] = await pool.query(
      "UPDATE cursos SET id_estado = 4 WHERE id_curso = ?", 
      [id_curso]
    );
    return result;
  }

  static async findById(id_curso) {
    let query = `
      SELECT 
        c.id_curso,
        c.nombre,
        c.descripcion,
        c.id_especialidad,
        e.nombre AS nombre_especialidad,
        c.duracion_semanas,
        c.id_estado,
        s.nombre AS nombre_estado
      FROM 
        cursos c
      LEFT JOIN 
        especialidades e ON c.id_especialidad = e.id_especialidad
      LEFT JOIN 
        estados s ON c.id_estado = s.id_estado
      WHERE 
        c.id_curso = ? LIMIT 1
    `;
    const [rows] = await pool.query(query, [id_curso]);
    return rows[0] || null;
  }
}
