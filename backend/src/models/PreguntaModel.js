import { pool } from "../config/database.js";

export class PreguntaModel {
  static async create(data) {
    const { id_actividad, tipo, enunciado, puntaje = 1 } = data;
    const [result] = await pool.query(
      `INSERT INTO preguntas (id_actividad, tipo, enunciado, puntaje) VALUES (?, ?, ?, ?)`,
      [id_actividad, tipo, enunciado, puntaje]
    );
    return result;
  }

  static async getAll(filters = {}) {
    let query = `
      SELECT 
        p.id_pregunta,
        p.id_actividad,
        a.titulo AS titulo_actividad,
        a.tipo AS tipo_actividad,
        p.tipo,
        p.enunciado,
        p.puntaje
      FROM preguntas p
      LEFT JOIN actividades a ON p.id_actividad = a.id_actividad
      WHERE 1=1
    `;
    const params = [];

    if (filters.id_actividad) {
      query += ` AND p.id_actividad = ?`;
      params.push(parseInt(filters.id_actividad));
    }

    if (filters.tipo) {
      query += ` AND p.tipo = ?`;
      params.push(filters.tipo);
    }

    query += ` ORDER BY p.id_pregunta ASC`;

    const [rows] = await pool.query(query, params);
    return rows;
  }

  static async findById(id_pregunta) {
    const [rows] = await pool.query(
      `SELECT 
        p.id_pregunta,
        p.id_actividad,
        a.titulo AS titulo_actividad,
        a.tipo AS tipo_actividad,
        p.tipo,
        p.enunciado,
        p.puntaje
      FROM preguntas p
      LEFT JOIN actividades a ON p.id_actividad = a.id_actividad
      WHERE p.id_pregunta = ? LIMIT 1`,
      [id_pregunta]
    );
    return rows[0] || null;
  }

  static async update(id_pregunta, data) {
    const fields = [];
    const params = [];

    for (const key in data) {
      if (Object.hasOwnProperty.call(data, key)) {
        fields.push(`${key} = ?`);
        params.push(data[key]);
      }
    }

    if (fields.length === 0) {
      return null;
    }

    params.push(id_pregunta);
    const query = `UPDATE preguntas SET ${fields.join(', ')} WHERE id_pregunta = ?`;
    const [result] = await pool.query(query, params);
    return result;
  }

  static async delete(id_pregunta) {
    const [result] = await pool.query("DELETE FROM preguntas WHERE id_pregunta = ?", [id_pregunta]);
    return result;
  }
}

