import { pool } from '../config/database.js';

export class MatriculaModel {
  static async getById(id_matricula) {
    const [rows] = await pool.query('SELECT * FROM matriculas WHERE id_matricula = ?', [id_matricula]);
    return rows[0] || null;
  }
  // Agrega más métodos según necesidad
}

export default MatriculaModel;
