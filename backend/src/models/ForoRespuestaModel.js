import { pool as db } from '../config/database.js';

class ForoRespuestaModel {
  // Crear nueva respuesta en un tema
  static async crearRespuesta(id_tema, id_usuario, contenido) {
    const query = `
      INSERT INTO foro_respuestas (id_tema, id_usuario, contenido, fecha_creacion)
      VALUES (?, ?, ?, NOW())
    `;

    try {
      const result = await db.query(query, [id_tema, id_usuario, contenido]);
      return {
        id_respuesta: result[0].insertId,
        id_tema,
        id_usuario,
        contenido,
        fecha_creacion: new Date()
      };
    } catch (error) {
      throw new Error(`Error al crear respuesta del foro: ${error.message}`);
    }
  }

  // Obtener todas las respuestas de un tema
  static async obtenerRespuestasPorTema(id_tema) {
    const query = `
      SELECT 
        fr.id_respuesta,
        fr.id_tema,
        fr.id_usuario,
        fr.contenido,
        fr.fecha_creacion,
        u.nombres,
        u.apellidos,
        u.correo
      FROM foro_respuestas fr
      LEFT JOIN usuarios u ON fr.id_usuario = u.id_usuario
      WHERE fr.id_tema = ?
      ORDER BY fr.fecha_creacion ASC
    `;

    try {
      const [respuestas] = await db.query(query, [id_tema]);
      return respuestas;
    } catch (error) {
      throw new Error(`Error al obtener respuestas del foro: ${error.message}`);
    }
  }

  // Obtener una respuesta específica
  static async obtenerRespuestaPorId(id_respuesta) {
    const query = `
      SELECT 
        fr.id_respuesta,
        fr.id_tema,
        fr.id_usuario,
        fr.contenido,
        fr.fecha_creacion,
        u.nombres,
        u.apellidos,
        u.correo
      FROM foro_respuestas fr
      LEFT JOIN usuarios u ON fr.id_usuario = u.id_usuario
      WHERE fr.id_respuesta = ?
    `;

    try {
      const [respuestas] = await db.query(query, [id_respuesta]);
      return respuestas[0] || null;
    } catch (error) {
      throw new Error(`Error al obtener respuesta del foro: ${error.message}`);
    }
  }

  // Obtener todas las respuestas de un usuario
  static async obtenerRespuestasPorUsuario(id_usuario) {
    const query = `
      SELECT 
        fr.id_respuesta,
        fr.id_tema,
        fr.id_usuario,
        fr.contenido,
        fr.fecha_creacion,
        u.nombres,
        u.apellidos,
        ft.titulo as tema_titulo
      FROM foro_respuestas fr
      LEFT JOIN usuarios u ON fr.id_usuario = u.id_usuario
      LEFT JOIN foro_temas ft ON fr.id_tema = ft.id_tema
      WHERE fr.id_usuario = ?
      ORDER BY fr.fecha_creacion DESC
    `;

    try {
      const [respuestas] = await db.query(query, [id_usuario]);
      return respuestas;
    } catch (error) {
      throw new Error(`Error al obtener respuestas del usuario: ${error.message}`);
    }
  }

  // Actualizar respuesta
  static async actualizarRespuesta(id_respuesta, contenido) {
    const query = `
      UPDATE foro_respuestas 
      SET contenido = ?, fecha_actualizacion = NOW()
      WHERE id_respuesta = ?
    `;

    try {
      const result = await db.query(query, [contenido, id_respuesta]);
      return result[0].affectedRows > 0;
    } catch (error) {
      throw new Error(`Error al actualizar respuesta del foro: ${error.message}`);
    }
  }

  // Eliminar respuesta
  static async eliminarRespuesta(id_respuesta) {
    const query = `
      DELETE FROM foro_respuestas 
      WHERE id_respuesta = ?
    `;

    try {
      const result = await db.query(query, [id_respuesta]);
      return result[0].affectedRows > 0;
    } catch (error) {
      throw new Error(`Error al eliminar respuesta del foro: ${error.message}`);
    }
  }

  // Contar respuestas por tema
  static async contarRespuestas(id_tema) {
    const query = `
      SELECT COUNT(*) as total
      FROM foro_respuestas
      WHERE id_tema = ?
    `;

    try {
      const [result] = await db.query(query, [id_tema]);
      return result[0].total;
    } catch (error) {
      throw new Error(`Error al contar respuestas: ${error.message}`);
    }
  }

  // Obtener respuestas recientes de una sección
  static async obtenerRespuestasRecientes(id_seccion, minutos = 60) {
    const query = `
      SELECT 
        fr.id_respuesta,
        fr.id_tema,
        fr.id_usuario,
        fr.contenido,
        fr.fecha_creacion,
        u.nombres,
        u.apellidos,
        ft.titulo as tema_titulo,
        ft.id_seccion
      FROM foro_respuestas fr
      LEFT JOIN foro_temas ft ON fr.id_tema = ft.id_tema
      LEFT JOIN usuarios u ON fr.id_usuario = u.id_usuario
      WHERE ft.id_seccion = ?
        AND fr.fecha_creacion > DATE_SUB(NOW(), INTERVAL ? MINUTE)
      ORDER BY fr.fecha_creacion DESC
    `;

    try {
      const [respuestas] = await db.query(query, [id_seccion, minutos]);
      return respuestas;
    } catch (error) {
      throw new Error(`Error al obtener respuestas recientes: ${error.message}`);
    }
  }
}

export default ForoRespuestaModel;
