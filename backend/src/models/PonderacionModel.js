import { pool } from "../config/database.js";

export class PonderacionModel {
  // Crear una nueva ponderación
  static async create(data) {
    const { id_curso, peso_tareas = 40.00, peso_examenes = 50.00, peso_quices = 10.00 } = data;
    
    // Validar que los pesos sumen 100
    const totalPesos = parseFloat(peso_tareas) + parseFloat(peso_examenes) + parseFloat(peso_quices);
    if (Math.abs(totalPesos - 100) > 0.01) {
      throw new Error('Los pesos deben sumar 100%');
    }

    const [result] = await pool.query(
      `INSERT INTO ponderaciones_actividades (id_curso, peso_tareas, peso_examenes, peso_quices) 
       VALUES (?, ?, ?, ?)`,
      [id_curso, peso_tareas, peso_examenes, peso_quices]
    );
    return result;
  }

  // Obtener todas las ponderaciones
  static async getAll(filters = {}) {
    let query = `
      SELECT 
        p.id_ponderacion,
        p.id_curso,
        c.nombre AS nombre_curso,
        p.peso_tareas,
        p.peso_examenes,
        p.peso_quices
      FROM ponderaciones_actividades p
      LEFT JOIN cursos c ON p.id_curso = c.id_curso
      WHERE 1=1
    `;
    const params = [];

    if (filters.id_curso) {
      query += ` AND p.id_curso = ?`;
      params.push(parseInt(filters.id_curso));
    }

    query += ` ORDER BY p.id_ponderacion DESC`;

    const [rows] = await pool.query(query, params);
    return rows;
  }

  // Obtener ponderación por ID
  static async findById(id_ponderacion) {
    const [rows] = await pool.query(
      `SELECT 
        p.id_ponderacion,
        p.id_curso,
        c.nombre AS nombre_curso,
        p.peso_tareas,
        p.peso_examenes,
        p.peso_quices
      FROM ponderaciones_actividades p
      LEFT JOIN cursos c ON p.id_curso = c.id_curso
      WHERE p.id_ponderacion = ? LIMIT 1`,
      [id_ponderacion]
    );
    return rows[0] || null;
  }

  // Obtener ponderación por curso (la más reciente)
  static async getByCurso(id_curso) {
    const [rows] = await pool.query(
      `SELECT 
        p.id_ponderacion,
        p.id_curso,
        c.nombre AS nombre_curso,
        p.peso_tareas,
        p.peso_examenes,
        p.peso_quices
      FROM ponderaciones_actividades p
      LEFT JOIN cursos c ON p.id_curso = c.id_curso
      WHERE p.id_curso = ?
      ORDER BY p.id_ponderacion DESC
      LIMIT 1`,
      [id_curso]
    );
    return rows[0] || null;
  }

  // Actualizar ponderación
  static async update(id_ponderacion, data) {
    const { peso_tareas, peso_examenes, peso_quices } = data;

    // Validar que los pesos sumen 100 si se están actualizando
    if (peso_tareas !== undefined && peso_examenes !== undefined && peso_quices !== undefined) {
      const totalPesos = parseFloat(peso_tareas) + parseFloat(peso_examenes) + parseFloat(peso_quices);
      if (Math.abs(totalPesos - 100) > 0.01) {
        throw new Error('Los pesos deben sumar 100%');
      }
    }

    const fields = [];
    const params = [];

    if (peso_tareas !== undefined) {
      fields.push('peso_tareas = ?');
      params.push(peso_tareas);
    }
    if (peso_examenes !== undefined) {
      fields.push('peso_examenes = ?');
      params.push(peso_examenes);
    }
    if (peso_quices !== undefined) {
      fields.push('peso_quices = ?');
      params.push(peso_quices);
    }

    if (fields.length === 0) {
      return null;
    }

    params.push(id_ponderacion);
    const query = `UPDATE ponderaciones_actividades SET ${fields.join(', ')} WHERE id_ponderacion = ?`;
    const [result] = await pool.query(query, params);
    return result;
  }

  // Eliminar ponderación
  static async delete(id_ponderacion) {
    const [result] = await pool.query(
      "DELETE FROM ponderaciones_actividades WHERE id_ponderacion = ?",
      [id_ponderacion]
    );
    return result;
  }

  // Obtener pesos por defecto (para nuevos cursos)
  static async getPesosDefault() {
    return {
      peso_tareas: 40.00,
      peso_examenes: 50.00,
      peso_quices: 10.00
    };
  }
}
