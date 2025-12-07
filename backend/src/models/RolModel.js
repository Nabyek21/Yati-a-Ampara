import { pool } from "../config/database.js";

export class RolModel {
  static async getAll() {
    const [rows] = await pool.query("SELECT id_rol, nombre FROM roles");
    return rows;
  }
}
