import { pool as db } from '../config/database.js';

export class ForoTemaModel {
  // Crear nuevo tema en el foro
  static async crearTema(id_seccion, id_usuario, titulo, descripcion) {
    const query = `
      INSERT INTO foro_temas (id_seccion, id_usuario, titulo, descripcion, fecha_creacion)
      VALUES (?, ?, ?, ?, NOW())
    `;
    
    try {
      const result = await db.query(query, [id_seccion, id_usuario, titulo, descripcion]);
      return {
        id_tema: result[0].insertId,
        id_seccion,
        id_usuario,
        titulo,
        descripcion,
        fecha_creacion: new Date()
      };
    } catch (error) {
      throw new Error(`Error al crear tema del foro: ${error.message}`);
    }
  }

  // Obtener todos los temas de una sección
  static async obtenerTemasPorSeccion(id_seccion, limit = 20, offset = 0) {
    const query = `
      SELECT 
        ft.id_tema,
        ft.id_seccion,
        ft.id_usuario,
        ft.titulo,
        ft.descripcion,
        ft.fecha_creacion,
        u.nombres,
        u.apellidos,
        COUNT(fr.id_respuesta) as total_respuestas
      FROM foro_temas ft
      LEFT JOIN usuarios u ON ft.id_usuario = u.id_usuario
      LEFT JOIN foro_respuestas fr ON ft.id_tema = fr.id_tema
      WHERE ft.id_seccion = ? AND ft.activo = TRUE
      GROUP BY ft.id_tema
      ORDER BY ft.fecha_creacion DESC
      LIMIT ? OFFSET ?
    `;

    try {
      console.log(`[ForoTemaModel] Obteniendo temas de sección ${id_seccion}, limit=${limit}, offset=${offset}`);
      const [temas] = await db.query(query, [id_seccion, limit, offset]);
      console.log(`[ForoTemaModel] Se encontraron ${temas.length} temas`);
      return temas || [];
    } catch (error) {
      console.error(`[ForoTemaModel] Error en obtenerTemasPorSeccion:`, error);
      throw new Error(`Error al obtener temas del foro: ${error.message}`);
    }
  }

  // Obtener detalles de un tema específico
  static async obtenerTemaPorId(id_tema) {
    const query = `
      SELECT 
        ft.id_tema,
        ft.id_seccion,
        ft.id_usuario,
        ft.titulo,
        ft.descripcion,
        ft.fecha_creacion,
        u.nombres,
        u.apellidos,
        u.correo,
        COUNT(fr.id_respuesta) as total_respuestas
      FROM foro_temas ft
      LEFT JOIN usuarios u ON ft.id_usuario = u.id_usuario
      LEFT JOIN foro_respuestas fr ON ft.id_tema = fr.id_tema
      WHERE ft.id_tema = ?
      GROUP BY ft.id_tema
    `;

    try {
      const [temas] = await db.query(query, [id_tema]);
      return temas[0] || null;
    } catch (error) {
      throw new Error(`Error al obtener tema del foro: ${error.message}`);
    }
  }

  // Actualizar tema
  static async actualizarTema(id_tema, titulo, descripcion) {
    const query = `
      UPDATE foro_temas 
      SET titulo = ?, descripcion = ?
      WHERE id_tema = ?
    `;

    try {
      const result = await db.query(query, [titulo, descripcion, id_tema]);
      return result[0].affectedRows > 0;
    } catch (error) {
      throw new Error(`Error al actualizar tema del foro: ${error.message}`);
    }
  }

  // Eliminar tema (con cascade de respuestas)
  static async eliminarTema(id_tema) {
    const connection = await db.getConnection();
    
    try {
      await connection.beginTransaction();
      
      // Primero eliminar respuestas
      await connection.query('DELETE FROM foro_respuestas WHERE id_tema = ?', [id_tema]);
      
      // Luego eliminar tema
      const result = await connection.query('DELETE FROM foro_temas WHERE id_tema = ?', [id_tema]);
      
      await connection.commit();
      return result[0].affectedRows > 0;
    } catch (error) {
      await connection.rollback();
      throw new Error(`Error al eliminar tema del foro: ${error.message}`);
    } finally {
      connection.release();
    }
  }

  // Obtener temas donde el usuario participa (creó o respondió)
  static async obtenerTemasParticipados(id_usuario, id_seccion) {
    const query = `
      SELECT DISTINCT
        ft.id_tema,
        ft.id_seccion,
        ft.id_usuario,
        ft.titulo,
        ft.descripcion,
        ft.fecha_creacion,
        u.nombres,
        u.apellidos,
        COUNT(fr.id_respuesta) as total_respuestas
      FROM foro_temas ft
      LEFT JOIN usuarios u ON ft.id_usuario = u.id_usuario
      LEFT JOIN foro_respuestas fr ON ft.id_tema = fr.id_tema
      WHERE ft.id_seccion = ? 
        AND (ft.id_usuario = ? OR fr.id_usuario = ?)
      GROUP BY ft.id_tema
      ORDER BY ft.fecha_creacion DESC
    `;

    try {
      const [temas] = await db.query(query, [id_seccion, id_usuario, id_usuario]);
      return temas;
    } catch (error) {
      throw new Error(`Error al obtener temas participados: ${error.message}`);
    }
  }
}

export default ForoTemaModel;
