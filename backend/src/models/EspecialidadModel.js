import { pool } from "../config/database.js";

export class EspecialidadModel {
  static async getAll() {
    const [rows] = await pool.query("SELECT id_especialidad, nombre FROM especialidades ORDER BY nombre");
    return rows;
  }

  static async create(nombre) {
    const [result] = await pool.query("INSERT INTO especialidades (nombre) VALUES (?)", [nombre]);
    return result;
  }

  static async update(id_especialidad, nombre) {
    const [result] = await pool.query("UPDATE especialidades SET nombre = ? WHERE id_especialidad = ?", [nombre, id_especialidad]);
    return result;
  }

  static async delete(id_especialidad) {
    const [result] = await pool.query("DELETE FROM especialidades WHERE id_especialidad = ?", [id_especialidad]);
    return result;
  }

  static async findById(id_especialidad) {
    const [rows] = await pool.query("SELECT id_especialidad, nombre FROM especialidades WHERE id_especialidad = ? LIMIT 1", [id_especialidad]);
    return rows[0] || null;
  }
}
