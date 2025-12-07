import { pool } from "../config/database.js";

export class ClaseModel {
  static async create(data) {
    const { id_modulo, id_seccion, id_docente_perfil, id_hora, fecha_clase } = data;
    const [result] = await pool.query(
      "INSERT INTO clases (id_modulo, id_seccion, id_docente_perfil, id_hora, fecha_clase) VALUES (?, ?, ?, ?, ?)",
      [id_modulo, id_seccion, id_docente_perfil, id_hora, fecha_clase]
    );
    return result;
  }

  static async getAll(filters = {}) {
    try {
      let query = `SELECT c.id_clase, c.id_modulo, m.titulo AS nombre_modulo, m.orden, c.id_seccion, s.nombre_seccion, cur.nombre AS nombre_curso, cur.id_curso, c.id_docente_perfil, u.nombres AS nombres_docente, u.apellidos AS apellidos_docente, c.id_hora, h.dia_semana, h.hora_inicio, h.hora_fin, c.fecha_clase, modals.nombre AS nombre_modalidad FROM clases c LEFT JOIN modulos m ON c.id_modulo = m.id_modulo LEFT JOIN secciones s ON c.id_seccion = s.id_seccion LEFT JOIN cursos cur ON s.id_curso = cur.id_curso LEFT JOIN modalidades modals ON s.id_modalidad = modals.id_modalidad LEFT JOIN docentes_perfil dp ON c.id_docente_perfil = dp.id_docente_perfil LEFT JOIN usuarios u ON dp.id_usuario = u.id_usuario LEFT JOIN horas_clase h ON c.id_hora = h.id_hora`;
      
      const params = [];
      const conditions = [];

      if (filters.id_seccion) {
        conditions.push("c.id_seccion = ?");
        params.push(filters.id_seccion);
      }

      if (filters.id_modulo) {
        conditions.push("c.id_modulo = ?");
        params.push(filters.id_modulo);
      }

      if (conditions.length > 0) {
        query += " WHERE " + conditions.join(" AND ");
      }

      query += " ORDER BY c.fecha_clase ASC, h.hora_inicio ASC";

      console.log('📝 Ejecutando query para clases');
      if (params.length > 0) {
        console.log('📦 Parámetros:', params);
      }
      
      const [rows] = await pool.query(query, params);
      console.log('✅ Filas devueltas:', rows.length);
      return rows;
    } catch (error) {
      console.error('❌ Error en ClaseModel.getAll:', error.message);
      console.error('Stack:', error.stack);
      throw error;
    }
  }

  static async deleteBySeccion(id_seccion) {
    const [result] = await pool.query("DELETE FROM clases WHERE id_seccion = ?", [id_seccion]);
    return result;
  }

  static async update(id_clase, data) {
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

    params.push(id_clase);
    const query = `UPDATE clases SET ${fields.join(', ')} WHERE id_clase = ?`;
    const [result] = await pool.query(query, params);
    return result;
  }

  static async delete(id_clase) {
    const [result] = await pool.query("DELETE FROM clases WHERE id_clase = ?", [id_clase]);
    return result;
  }

  static async findById(id_clase) {
    const [rows] = await pool.query(
      `SELECT c.id_clase, c.id_modulo, m.titulo AS nombre_modulo, m.orden, c.id_seccion, s.nombre_seccion, cur.nombre AS nombre_curso, cur.id_curso, c.id_docente_perfil, u.nombres AS nombres_docente, u.apellidos AS apellidos_docente, c.id_hora, h.dia_semana, h.hora_inicio, h.hora_fin, c.fecha_clase, modals.nombre AS nombre_modalidad FROM clases c LEFT JOIN modulos m ON c.id_modulo = m.id_modulo LEFT JOIN secciones s ON c.id_seccion = s.id_seccion LEFT JOIN cursos cur ON s.id_curso = cur.id_curso LEFT JOIN modalidades modals ON s.id_modalidad = modals.id_modalidad LEFT JOIN docentes_perfil dp ON c.id_docente_perfil = dp.id_docente_perfil LEFT JOIN usuarios u ON dp.id_usuario = u.id_usuario LEFT JOIN horas_clase h ON c.id_hora = h.id_hora WHERE c.id_clase = ? LIMIT 1`,
      [id_clase]
    );
    return rows[0] || null;
  }
}

