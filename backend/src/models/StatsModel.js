import { pool } from "../config/database.js";

export class StatsModel {
  // Obtener estadísticas generales
  static async getGeneralStats() {
    // Total de usuarios (solo estudiantes, id_rol = 3)
    const [usuariosResult] = await pool.query(
      "SELECT COUNT(*) as total FROM usuarios WHERE id_rol = 3"
    );
    const totalUsuarios = usuariosResult[0]?.total || 0;

    // Total de docentes
    const [docentesResult] = await pool.query(
      "SELECT COUNT(*) as total FROM docentes_perfil"
    );
    const totalDocentes = docentesResult[0]?.total || 0;

    // Total de cursos
    const [cursosResult] = await pool.query(
      "SELECT COUNT(*) as total FROM cursos"
    );
    const totalCursos = cursosResult[0]?.total || 0;

    // Total de secciones
    const [seccionesResult] = await pool.query(
      "SELECT COUNT(*) as total FROM secciones"
    );
    const totalSecciones = seccionesResult[0]?.total || 0;

    // Usuarios activos
    const [usuariosActivosResult] = await pool.query(
      "SELECT COUNT(*) as total FROM usuarios WHERE id_rol = 3 AND id_estado = 1"
    );
    const usuariosActivos = usuariosActivosResult[0]?.total || 0;

    // Cursos activos
    const [cursosActivosResult] = await pool.query(
      "SELECT COUNT(*) as total FROM cursos WHERE id_estado = 1"
    );
    const cursosActivos = cursosActivosResult[0]?.total || 0;

    return {
      totalUsuarios,
      totalDocentes,
      totalCursos,
      totalSecciones,
      usuariosActivos,
      cursosActivos
    };
  }

  // Obtener distribución de usuarios por estado
  static async getUsuariosByEstado() {
    const [rows] = await pool.query(`
      SELECT 
        e.nombre as estado,
        COUNT(u.id_usuario) as cantidad
      FROM usuarios u
      INNER JOIN estados e ON u.id_estado = e.id_estado
      WHERE u.id_rol = 3
      GROUP BY e.id_estado, e.nombre
      ORDER BY cantidad DESC
    `);
    return rows;
  }

  // Obtener distribución de cursos por estado
  static async getCursosByEstado() {
    const [rows] = await pool.query(`
      SELECT 
        e.nombre as estado,
        COUNT(c.id_curso) as cantidad
      FROM cursos c
      INNER JOIN estados e ON c.id_estado = e.id_estado
      GROUP BY e.id_estado, e.nombre
      ORDER BY cantidad DESC
    `);
    return rows;
  }

  // Obtener distribución de cursos por especialidad
  static async getCursosByEspecialidad() {
    const [rows] = await pool.query(`
      SELECT 
        esp.nombre as especialidad,
        COUNT(c.id_curso) as cantidad
      FROM cursos c
      INNER JOIN especialidades esp ON c.id_especialidad = esp.id_especialidad
      GROUP BY esp.id_especialidad, esp.nombre
      ORDER BY cantidad DESC
      LIMIT 10
    `);
    return rows;
  }

  // Obtener usuarios registrados por mes (últimos 6 meses)
  static async getUsuariosByMonth() {
    const [rows] = await pool.query(`
      SELECT 
        DATE_FORMAT(fecha_registro, '%Y-%m') as mes,
        COUNT(*) as cantidad
      FROM usuarios
      WHERE id_rol = 3 
        AND fecha_registro >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
      GROUP BY DATE_FORMAT(fecha_registro, '%Y-%m')
      ORDER BY mes ASC
    `);
    return rows;
  }

  // Obtener cursos creados por mes (últimos 6 meses)
  static async getCursosByMonth() {
    // Asumiendo que hay un campo fecha_creacion o similar, si no, usar fecha_registro de otra tabla
    // Por ahora, retornamos datos de ejemplo o necesitamos agregar fecha_creacion a cursos
    const [rows] = await pool.query(`
      SELECT 
        DATE_FORMAT(NOW(), '%Y-%m') as mes,
        COUNT(*) as cantidad
      FROM cursos
      GROUP BY DATE_FORMAT(NOW(), '%Y-%m')
    `);
    return rows;
  }
}

