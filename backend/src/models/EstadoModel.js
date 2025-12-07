import { pool } from "../config/database.js";

export class EstadoModel {
  static async getAll() {
    const [rows] = await pool.query("SELECT id_estado, nombre FROM estados");
    return rows;
  }
}
