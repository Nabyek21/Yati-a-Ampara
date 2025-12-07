import { pool } from "../config/database.js";

export class SeccionModel {
  static async create(data) {
    const { id_curso, id_docente_perfil, id_modalidad, nombre_seccion, fecha_inicio, fecha_fin, horario, id_estado } = data;
    const [result] = await pool.query(
      "INSERT INTO secciones (id_curso, id_docente_perfil, id_modalidad, nombre_seccion, fecha_inicio, fecha_fin, horario, id_estado) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [id_curso, id_docente_perfil, id_modalidad, nombre_seccion, fecha_inicio, fecha_fin, horario, id_estado || 1] // id_estado por defecto 1 (Activo)
    );
    return result;
  }

  static async getAll(filters = {}) {
    let query = `
      SELECT 
        s.id_seccion,
        s.id_curso,
        c.nombre AS nombre_curso,
        c.descripcion AS descripcion_curso,
        s.id_docente_perfil,
        u.nombres AS nombres_docente,
        u.apellidos AS apellidos_docente,
        s.id_modalidad,
        m.nombre AS nombre_modalidad,
        s.nombre_seccion,
        s.fecha_inicio,
        s.fecha_fin,
        s.horario,
        s.id_estado,
        e.nombre AS nombre_estado,
        COUNT(DISTINCT mat.id_matricula) AS total_estudiantes
      FROM 
        secciones s
      LEFT JOIN 
        cursos c ON s.id_curso = c.id_curso
      LEFT JOIN 
        docentes_perfil dp ON s.id_docente_perfil = dp.id_docente_perfil
      LEFT JOIN 
        usuarios u ON dp.id_usuario = u.id_usuario
      LEFT JOIN 
        modalidades m ON s.id_modalidad = m.id_modalidad
      LEFT JOIN 
        estados e ON s.id_estado = e.id_estado
      LEFT JOIN
        matriculas mat ON s.id_seccion = mat.id_seccion
    `;
    const params = [];
    const conditions = [];

    if (filters.search) {
      const searchTerm = `%${filters.search}%`;
      conditions.push("(s.nombre_seccion LIKE ? OR c.nombre LIKE ? OR u.nombres LIKE ? OR u.apellidos LIKE ?)");
      params.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }

    if (filters.id_curso) {
      conditions.push("s.id_curso = ?");
      params.push(parseInt(filters.id_curso));
    }

    if (filters.id_docente_perfil) {
      conditions.push("s.id_docente_perfil = ?");
      params.push(parseInt(filters.id_docente_perfil));
    }

    if (filters.id_modalidad) {
      conditions.push("s.id_modalidad = ?");
      params.push(parseInt(filters.id_modalidad));
    }

    if (filters.id_estado) {
      conditions.push("s.id_estado = ?");
      params.push(parseInt(filters.id_estado));
    }

    if (conditions.length > 0) {
      query += " WHERE " + conditions.join(" AND ");
    }

    query += " GROUP BY s.id_seccion, s.id_curso, c.nombre, c.descripcion, s.id_docente_perfil, u.nombres, u.apellidos, s.id_modalidad, m.nombre, s.nombre_seccion, s.fecha_inicio, s.fecha_fin, s.horario, s.id_estado, e.nombre";

    const [rows] = await pool.query(query, params);
    return rows;
  }

  static async update(id_seccion, data) {
    const fields = [];
    const params = [];

    for (const key in data) {
      if (Object.hasOwnProperty.call(data, key)) {
        fields.push(`${key} = ?`);
        params.push(data[key]);
      }
    }

    if (fields.length === 0) {
      return null; // No hay nada que actualizar
    }

    params.push(id_seccion);
    const query = `UPDATE secciones SET ${fields.join(', ')} WHERE id_seccion = ?`;
    const [result] = await pool.query(query, params);
    return result;
  }

  static async deactivate(id_seccion) {
    // Asumiendo id_estado 2 para 'Inactivo' para secciones
    const [result] = await pool.query(
      "UPDATE secciones SET id_estado = 2 WHERE id_seccion = ?", 
      [id_seccion]
    );
    return result;
  }

  static async findById(id_seccion) {
    let query = `
      SELECT 
        s.id_seccion,
        s.id_curso,
        c.nombre AS nombre_curso,
        s.id_docente_perfil,
        u.nombres AS nombres_docente,
        u.apellidos AS apellidos_docente,
        s.id_modalidad,
        m.nombre AS nombre_modalidad,
        s.nombre_seccion,
        s.fecha_inicio,
        s.fecha_fin,
        s.horario,
        s.id_estado,
        e.nombre AS nombre_estado
      FROM 
        secciones s
      LEFT JOIN 
        cursos c ON s.id_curso = c.id_curso
      LEFT JOIN 
        docentes_perfil dp ON s.id_docente_perfil = dp.id_docente_perfil
      LEFT JOIN 
        usuarios u ON dp.id_usuario = u.id_usuario
      LEFT JOIN 
        modalidades m ON s.id_modalidad = m.id_modalidad
      LEFT JOIN 
        estados e ON s.id_estado = e.id_estado
      WHERE 
        s.id_seccion = ? LIMIT 1
    `;
    const [rows] = await pool.query(query, [id_seccion]);
    return rows[0] || null;
  }

  static async getSeccionesByDocente(id_usuario) {
    const query = `
      SELECT 
        s.id_seccion,
        s.id_curso,
        c.nombre AS nombre_curso,
        c.descripcion AS descripcion_curso,
        s.id_docente_perfil,
        u.nombres AS nombres_docente,
        u.apellidos AS apellidos_docente,
        s.id_modalidad,
        m.nombre AS nombre_modalidad,
        s.nombre_seccion,
        s.fecha_inicio,
        s.fecha_fin,
        s.horario,
        s.id_estado,
        COUNT(DISTINCT mat.id_matricula) AS total_estudiantes
      FROM 
        secciones s
      INNER JOIN 
        cursos c ON s.id_curso = c.id_curso
      INNER JOIN 
        docentes_perfil dp ON s.id_docente_perfil = dp.id_docente_perfil
      INNER JOIN 
        usuarios u ON dp.id_usuario = u.id_usuario
      LEFT JOIN 
        modalidades m ON s.id_modalidad = m.id_modalidad
      LEFT JOIN
        matriculas mat ON s.id_seccion = mat.id_seccion
      WHERE 
        u.id_usuario = ?
      GROUP BY
        s.id_seccion,
        s.id_curso,
        c.nombre,
        c.descripcion,
        s.id_docente_perfil,
        u.nombres,
        u.apellidos,
        s.id_modalidad,
        m.nombre,
        s.nombre_seccion,
        s.fecha_inicio,
        s.fecha_fin,
        s.horario,
        s.id_estado
      ORDER BY 
        s.id_seccion ASC
    `;
    const [rows] = await pool.query(query, [id_usuario]);
    return rows || [];
  }
}
