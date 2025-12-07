import { pool } from "../config/database.js";

export class RespuestaOpcionModel {
  static async create(data) {
    const { id_pregunta, texto, es_correcta = 0 } = data;
    const [result] = await pool.query(
      `INSERT INTO respuestas_opciones (id_pregunta, texto, es_correcta) VALUES (?, ?, ?)`,
      [id_pregunta, texto, es_correcta ? 1 : 0]
    );
    return result;
  }

  static async getAll(filters = {}) {
    let query = `
      SELECT 
        r.id_opcion,
        r.id_pregunta,
        p.enunciado AS enunciado_pregunta,
        r.texto,
        r.es_correcta
      FROM respuestas_opciones r
      LEFT JOIN preguntas p ON r.id_pregunta = p.id_pregunta
      WHERE 1=1
    `;
    const params = [];

    if (filters.id_pregunta) {
      query += ` AND r.id_pregunta = ?`;
      params.push(parseInt(filters.id_pregunta));
    }

    query += ` ORDER BY r.id_opcion ASC`;

    const [rows] = await pool.query(query, params);
    return rows;
  }

  static async findById(id_opcion) {
    const [rows] = await pool.query(
      `SELECT 
        r.id_opcion,
        r.id_pregunta,
        p.enunciado AS enunciado_pregunta,
        r.texto,
        r.es_correcta
      FROM respuestas_opciones r
      LEFT JOIN preguntas p ON r.id_pregunta = p.id_pregunta
      WHERE r.id_opcion = ? LIMIT 1`,
      [id_opcion]
    );
    return rows[0] || null;
  }

  static async update(id_opcion, data) {
    const fields = [];
    const params = [];

    for (const key in data) {
      if (Object.hasOwnProperty.call(data, key)) {
        if (key === 'es_correcta') {
          fields.push(`${key} = ?`);
          params.push(data[key] ? 1 : 0);
        } else {
          fields.push(`${key} = ?`);
          params.push(data[key]);
        }
      }
    }

    if (fields.length === 0) {
      return null;
    }

    params.push(id_opcion);
    const query = `UPDATE respuestas_opciones SET ${fields.join(', ')} WHERE id_opcion = ?`;
    const [result] = await pool.query(query, params);
    return result;
  }

  static async delete(id_opcion) {
    const [result] = await pool.query("DELETE FROM respuestas_opciones WHERE id_opcion = ?", [id_opcion]);
    return result;
  }

  static async deleteByPregunta(id_pregunta) {
    const [result] = await pool.query("DELETE FROM respuestas_opciones WHERE id_pregunta = ?", [id_pregunta]);
    return result;
  }
}

