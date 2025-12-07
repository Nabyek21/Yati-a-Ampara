import { pool } from "../config/database.js";

export class ModalidadModel {
  static async getAll() {
    const [rows] = await pool.query("SELECT id_modalidad, nombre, descripcion FROM modalidades ORDER BY nombre");
    return rows;
  }
}
