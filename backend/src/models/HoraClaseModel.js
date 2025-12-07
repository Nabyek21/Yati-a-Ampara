import { pool } from "../config/database.js";

export class HoraClaseModel {
  static async getAll() {
    const [rows] = await pool.query("SELECT id_hora, dia_semana, hora_inicio, hora_fin FROM horas_clase ORDER BY dia_semana, hora_inicio");
    return rows;
  }

  static async create(data) {
    const { dia_semana, hora_inicio, hora_fin } = data;
    const [result] = await pool.query(
      "INSERT INTO horas_clase (dia_semana, hora_inicio, hora_fin) VALUES (?, ?, ?)",
      [dia_semana, hora_inicio, hora_fin]
    );
    return result;
  }

  static async findById(id_hora) {
    const [rows] = await pool.query("SELECT id_hora, dia_semana, hora_inicio, hora_fin FROM horas_clase WHERE id_hora = ? LIMIT 1", [id_hora]);
    return rows[0] || null;
  }

  static async update(id_hora, data) {
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

    params.push(id_hora);
    const query = `UPDATE horas_clase SET ${fields.join(', ')} WHERE id_hora = ?`;
    const [result] = await pool.query(query, params);
    return result;
  }

  static async delete(id_hora) {
    const [result] = await pool.query("DELETE FROM horas_clase WHERE id_hora = ?", [id_hora]);
    return result;
  }
}

