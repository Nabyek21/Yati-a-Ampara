import { pool } from "../config/database.js";

export class ModuloModel {
  static async create(id_curso, titulo, descripcion, orden, fecha_inicio = null, fecha_fin = null) {
    const [result] = await pool.query(
      "INSERT INTO modulos (id_curso, titulo, descripcion, orden, fecha_inicio, fecha_fin) VALUES (?, ?, ?, ?, ?, ?)",
      [id_curso, titulo, descripcion, orden, fecha_inicio, fecha_fin]
    );
    return result;
  }

  static async getByCurso(id_curso) {
    const [rows] = await pool.query(
      "SELECT id_modulo, id_curso, titulo, descripcion, orden, fecha_inicio, fecha_fin FROM modulos WHERE id_curso = ? ORDER BY orden",
      [id_curso]
    );
    return rows;
  }

  static async getBySeccion(id_seccion) {
    const [rows] = await pool.query(
      `SELECT DISTINCT m.id_modulo, m.id_curso, m.titulo, m.descripcion, m.orden, m.fecha_inicio, m.fecha_fin 
       FROM modulos m 
       INNER JOIN secciones s ON m.id_curso = s.id_curso
       WHERE s.id_seccion = ? 
       ORDER BY m.orden`,
      [id_seccion]
    );
    return rows;
  }
}
