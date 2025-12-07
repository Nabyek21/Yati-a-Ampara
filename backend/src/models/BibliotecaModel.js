import { pool as db } from '../config/database.js';

export class BibliotecaModel {
  // Obtener todos los recursos de la biblioteca
  static async obtenerRecursos(filtros = {}) {
    let query = `
      SELECT 
        b.id_recurso,
        b.tipo,
        b.titulo,
        b.autor,
        b.descripcion,
        b.url_recurso,
        b.fecha_publicacion,
        b.id_usuario,
        b.id_estado,
        u.nombres,
        u.apellidos
      FROM biblioteca b
      LEFT JOIN usuarios u ON b.id_usuario = u.id_usuario
      WHERE b.id_estado = 1
    `;
    
    const params = [];
    
    if (filtros.tipo) {
      query += ` AND b.tipo = ?`;
      params.push(filtros.tipo);
    }
    
    if (filtros.busqueda) {
      query += ` AND (b.titulo LIKE ? OR b.autor LIKE ? OR b.descripcion LIKE ?)`;
      const busqueda = `%${filtros.busqueda}%`;
      params.push(busqueda, busqueda, busqueda);
    }
    
    query += ` ORDER BY b.fecha_publicacion DESC LIMIT 50`;
    
    try {
      const [rows] = await db.execute(query, params);
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Obtener un recurso específico
  static async obtenerRecursoPorId(id_recurso) {
    const query = `
      SELECT 
        b.id_recurso,
        b.tipo,
        b.titulo,
        b.autor,
        b.descripcion,
        b.url_recurso,
        b.fecha_publicacion,
        b.id_usuario,
        u.nombres,
        u.apellidos
      FROM biblioteca b
      LEFT JOIN usuarios u ON b.id_usuario = u.id_usuario
      WHERE b.id_recurso = ? AND b.id_estado = 1
    `;
    
    try {
      const [rows] = await db.execute(query, [id_recurso]);
      return rows[0] || null;
    } catch (error) {
      throw error;
    }
  }

  // Crear nuevo recurso
  static async crearRecurso(tipo, titulo, autor, descripcion, url_recurso, id_usuario) {
    const query = `
      INSERT INTO biblioteca (tipo, titulo, autor, descripcion, url_recurso, id_usuario, id_estado, fecha_publicacion)
      VALUES (?, ?, ?, ?, ?, ?, 1, NOW())
    `;
    
    try {
      const [result] = await db.execute(query, [tipo, titulo, autor, descripcion, url_recurso, id_usuario]);
      return {
        id_recurso: result.insertId,
        tipo,
        titulo,
        autor,
        descripcion,
        url_recurso,
        id_usuario,
        id_estado: 1,
        fecha_publicacion: new Date()
      };
    } catch (error) {
      throw error;
    }
  }

  // Actualizar recurso
  static async actualizarRecurso(id_recurso, tipo, titulo, autor, descripcion, url_recurso) {
    const query = `
      UPDATE biblioteca 
      SET tipo = ?, titulo = ?, autor = ?, descripcion = ?, url_recurso = ?
      WHERE id_recurso = ?
    `;
    
    try {
      const [result] = await db.execute(query, [tipo, titulo, autor, descripcion, url_recurso, id_recurso]);
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  // Eliminar recurso (soft delete)
  static async eliminarRecurso(id_recurso) {
    const query = `
      UPDATE biblioteca 
      SET id_estado = 0
      WHERE id_recurso = ?
    `;
    
    try {
      const [result] = await db.execute(query, [id_recurso]);
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  // Obtener tipos de recursos disponibles
  static async obtenerTipos() {
    const query = `
      SELECT DISTINCT tipo FROM biblioteca WHERE id_estado = 1 ORDER BY tipo
    `;
    
    try {
      const [rows] = await db.execute(query);
      return rows.map(row => row.tipo);
    } catch (error) {
      throw error;
    }
  }
}
