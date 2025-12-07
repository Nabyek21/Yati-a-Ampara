import db from '../config/database.js';

class ForoPublicacionModel {
  // Crear nueva publicación
  static async crearPublicacion(id_seccion, id_usuario, titulo, contenido) {
    const query = `
      INSERT INTO foro_publicaciones (id_seccion, id_usuario, titulo, contenido, fecha_creacion)
      VALUES (?, ?, ?, ?, NOW())
    `;
    
    try {
      const [result] = await db.execute(query, [id_seccion, id_usuario, titulo, contenido]);
      return {
        id_publicacion: result.insertId,
        id_seccion,
        id_usuario,
        titulo,
        contenido,
        fecha_creacion: new Date()
      };
    } catch (error) {
      throw error;
    }
  }

  // Obtener publicaciones por sección
  static async obtenerPublicacionesPorSeccion(id_seccion) {
    const query = `
      SELECT 
        fp.id_publicacion,
        fp.id_seccion,
        fp.id_usuario,
        fp.titulo,
        fp.contenido,
        fp.fecha_creacion,
        u.nombres,
        u.apellidos,
        u.foto_perfil,
        COUNT(fr.id_respuesta) as total_respuestas
      FROM foro_publicaciones fp
      INNER JOIN usuarios u ON fp.id_usuario = u.id_usuario
      LEFT JOIN foro_respuestas fr ON fp.id_publicacion = fr.id_publicacion
      WHERE fp.id_seccion = ?
      GROUP BY fp.id_publicacion
      ORDER BY fp.fecha_creacion DESC
    `;
    
    try {
      const [rows] = await db.execute(query, [id_seccion]);
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Obtener detalles de una publicación específica
  static async obtenerPublicacionPorId(id_publicacion) {
    const query = `
      SELECT 
        fp.id_publicacion,
        fp.id_seccion,
        fp.id_usuario,
        fp.titulo,
        fp.contenido,
        fp.fecha_creacion,
        u.nombres,
        u.apellidos,
        u.foto_perfil
      FROM foro_publicaciones fp
      INNER JOIN usuarios u ON fp.id_usuario = u.id_usuario
      WHERE fp.id_publicacion = ?
    `;
    
    try {
      const [rows] = await db.execute(query, [id_publicacion]);
      return rows[0] || null;
    } catch (error) {
      throw error;
    }
  }

  // Obtener todas las publicaciones de un usuario
  static async obtenerPublicacionesPorUsuario(id_usuario, id_seccion = null) {
    let query = `
      SELECT 
        fp.id_publicacion,
        fp.id_seccion,
        fp.id_usuario,
        fp.titulo,
        fp.contenido,
        fp.fecha_creacion,
        u.nombres,
        u.apellidos,
        u.foto_perfil
      FROM foro_publicaciones fp
      INNER JOIN usuarios u ON fp.id_usuario = u.id_usuario
      WHERE fp.id_usuario = ?
    `;
    
    const params = [id_usuario];
    
    if (id_seccion) {
      query += ' AND fp.id_seccion = ?';
      params.push(id_seccion);
    }
    
    query += ' ORDER BY fp.fecha_creacion DESC';
    
    try {
      const [rows] = await db.execute(query, params);
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Actualizar publicación
  static async actualizarPublicacion(id_publicacion, titulo, contenido) {
    const query = `
      UPDATE foro_publicaciones 
      SET titulo = ?, contenido = ?
      WHERE id_publicacion = ?
    `;
    
    try {
      const [result] = await db.execute(query, [titulo, contenido, id_publicacion]);
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  // Eliminar publicación
  static async eliminarPublicacion(id_publicacion) {
    try {
      // Primero eliminar todas las respuestas
      const deleteRespuestas = `DELETE FROM foro_respuestas WHERE id_publicacion = ?`;
      await db.execute(deleteRespuestas, [id_publicacion]);
      
      // Luego eliminar la publicación
      const query = `DELETE FROM foro_publicaciones WHERE id_publicacion = ?`;
      const [result] = await db.execute(query, [id_publicacion]);
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  // Buscar publicaciones por título
  static async buscarPublicaciones(id_seccion, termino) {
    const query = `
      SELECT 
        fp.id_publicacion,
        fp.id_seccion,
        fp.id_usuario,
        fp.titulo,
        fp.contenido,
        fp.fecha_creacion,
        u.nombres,
        u.apellidos,
        u.foto_perfil,
        COUNT(fr.id_respuesta) as total_respuestas
      FROM foro_publicaciones fp
      INNER JOIN usuarios u ON fp.id_usuario = u.id_usuario
      LEFT JOIN foro_respuestas fr ON fp.id_publicacion = fr.id_publicacion
      WHERE fp.id_seccion = ? AND (fp.titulo LIKE ? OR fp.contenido LIKE ?)
      GROUP BY fp.id_publicacion
      ORDER BY fp.fecha_creacion DESC
    `;
    
    const termoBusqueda = `%${termino}%`;
    
    try {
      const [rows] = await db.execute(query, [id_seccion, termoBusqueda, termoBusqueda]);
      return rows;
    } catch (error) {
      throw error;
    }
  }
}

export default ForoPublicacionModel;
