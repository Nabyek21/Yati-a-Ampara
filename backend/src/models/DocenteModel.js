import { pool } from "../config/database.js";

export class DocenteModel {

  static async create(id_usuario, id_especialidad) {
    const [result] = await pool.query(
      "INSERT INTO docentes_perfil (id_usuario, id_especialidad) VALUES (?, ?)",
      [id_usuario, id_especialidad]
    );
    return result;
  }

  static async getAll(filters = {}) {
    let query = `
      SELECT 
        dp.id_docente_perfil, 
        u.id_usuario, 
        u.nombres, 
        u.apellidos, 
        u.dni, 
        u.correo, 
        u.celular, 
        dp.id_especialidad,
        e.nombre AS nombre_especialidad, -- Nuevo: nombre de la especialidad
        u.id_rol,
        u.id_estado
      FROM 
        docentes_perfil dp
      JOIN 
        usuarios u ON dp.id_usuario = u.id_usuario
      LEFT JOIN 
        especialidades e ON dp.id_especialidad = e.id_especialidad -- Nuevo JOIN
      WHERE 
        u.id_rol = 2 -- Solo docentes
    `;
    const params = [];
    const conditions = [];

    if (filters.search) {
      const searchTerm = `%${filters.search}%`;
      conditions.push("(u.nombres LIKE ? OR u.apellidos LIKE ? OR u.dni LIKE ? OR u.celular LIKE ? OR e.nombre LIKE ?)"); // Buscar por nombre de especialidad
      params.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
    }

    if (filters.id_estado) {
      conditions.push("u.id_estado = ?");
      params.push(filters.id_estado);
    }

    if (filters.id_especialidad) { // Nuevo filtro por especialidad
      conditions.push("dp.id_especialidad = ?");
      params.push(filters.id_especialidad);
    }

    if (conditions.length > 0) {
      query += " AND " + conditions.join(" AND ");
    }
    
    const [rows] = await pool.query(query, params);
    return rows;
  }

  static async update(id_docente_perfil, data) {
    const fields = [];
    const params = [];

    for (const key in data) {
      // Asegurarse de que solo se actualizan campos de docentes_perfil aquí (id_especialidad)
      if (Object.hasOwnProperty.call(data, key) && key === 'id_especialidad') {
        fields.push(`${key} = ?`);
        params.push(data[key]);
      }
    }

    if (fields.length === 0) {
      return null; // No hay nada que actualizar en docentes_perfil
    }

    params.push(id_docente_perfil);
    const query = `UPDATE docentes_perfil SET ${fields.join(', ')} WHERE id_docente_perfil = ?`;
    const [result] = await pool.query(query, params);
    return result;
  }

  static async findById(id_docente_perfil) {
    const [rows] = await pool.query(
      "SELECT id_docente_perfil, id_usuario, id_especialidad FROM docentes_perfil WHERE id_docente_perfil = ? LIMIT 1",
      [id_docente_perfil]
    );
    return rows[0] || null;
  }

  static async findByUsuarioId(id_usuario) {
    const [rows] = await pool.query(
      "SELECT id_docente_perfil, id_usuario, id_especialidad FROM docentes_perfil WHERE id_usuario = ? LIMIT 1",
      [id_usuario]
    );
    return rows[0] || null;
  }
}
