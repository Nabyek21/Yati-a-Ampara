import { ForoTemaModel } from '../models/ForoTemaModel.js';
import ForoRespuestaModel from '../models/ForoRespuestaModel.js';

export class ForoController {
  // ============ TEMAS ============

  // Obtener todos los temas de una sección
  static async obtenerTemas(req, res) {
    try {
      const { id_seccion } = req.params;
      const { limit = 20, offset = 0 } = req.query;

      if (!id_seccion) {
        return res.status(400).json({ error: 'id_seccion es requerido' });
      }

      console.log(`[ForoController] Obteniendo temas de sección ${id_seccion}`);

      const temas = await ForoTemaModel.obtenerTemasPorSeccion(
        parseInt(id_seccion),
        parseInt(limit),
        parseInt(offset)
      );

      console.log(`[ForoController] Retornando ${temas.length} temas`);
      res.json(temas);
    } catch (error) {
      console.error('[ForoController] Error al obtener temas:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // Obtener detalles de un tema
  static async obtenerTemaPorId(req, res) {
    try {
      const { id_tema } = req.params;

      if (!id_tema) {
        return res.status(400).json({ error: 'id_tema es requerido' });
      }

      const tema = await ForoTemaModel.obtenerTemaPorId(parseInt(id_tema));

      if (!tema) {
        return res.status(404).json({ error: 'Tema no encontrado' });
      }

      res.json(tema);
    } catch (error) {
      console.error('Error al obtener tema:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // Crear nuevo tema
  static async crearTema(req, res) {
    try {
      const { id_seccion, titulo, descripcion } = req.body;
      const id_usuario = req.user.id_usuario;

      if (!id_seccion || !titulo) {
        return res.status(400).json({ error: 'id_seccion y titulo son requeridos' });
      }

      const tema = await ForoTemaModel.crearTema(
        parseInt(id_seccion),
        id_usuario,
        titulo,
        descripcion || ''
      );

      res.status(201).json(tema);
    } catch (error) {
      console.error('Error al crear tema:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // Actualizar tema
  static async actualizarTema(req, res) {
    try {
      const { id_tema } = req.params;
      const { titulo, descripcion } = req.body;
      const id_usuario = req.user.id_usuario;

      if (!id_tema) {
        return res.status(400).json({ error: 'id_tema es requerido' });
      }

      // Verificar que el usuario sea el creador
      const tema = await ForoTemaModel.obtenerTemaPorId(parseInt(id_tema));
      if (!tema || tema.id_usuario !== id_usuario) {
        return res.status(403).json({ error: 'No tienes permiso para editar este tema' });
      }

      const actualizado = await ForoTemaModel.actualizarTema(
        parseInt(id_tema),
        titulo,
        descripcion
      );

      if (actualizado) {
        res.json({ mensaje: 'Tema actualizado correctamente' });
      } else {
        res.status(404).json({ error: 'Tema no encontrado' });
      }
    } catch (error) {
      console.error('Error al actualizar tema:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // Eliminar tema
  static async eliminarTema(req, res) {
    try {
      const { id_tema } = req.params;
      const id_usuario = req.user.id_usuario;

      if (!id_tema) {
        return res.status(400).json({ error: 'id_tema es requerido' });
      }

      // Verificar que el usuario sea el creador
      const tema = await ForoTemaModel.obtenerTemaPorId(parseInt(id_tema));
      if (!tema || tema.id_usuario !== id_usuario) {
        return res.status(403).json({ error: 'No tienes permiso para eliminar este tema' });
      }

      const eliminado = await ForoTemaModel.eliminarTema(parseInt(id_tema));

      if (eliminado) {
        res.json({ mensaje: 'Tema eliminado correctamente' });
      } else {
        res.status(404).json({ error: 'Tema no encontrado' });
      }
    } catch (error) {
      console.error('Error al eliminar tema:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // ============ RESPUESTAS ============

  // Obtener respuestas de un tema
  static async obtenerRespuestas(req, res) {
    try {
      const { id_tema } = req.params;

      if (!id_tema) {
        return res.status(400).json({ error: 'id_tema es requerido' });
      }

      const respuestas = await ForoRespuestaModel.obtenerRespuestasPorTema(
        parseInt(id_tema)
      );

      res.json(respuestas);
    } catch (error) {
      console.error('Error al obtener respuestas:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // Crear respuesta en un tema
  static async crearRespuesta(req, res) {
    try {
      const { id_tema } = req.params;
      const { contenido } = req.body;
      const id_usuario = req.user.id_usuario;

      if (!id_tema || !contenido) {
        return res.status(400).json({ error: 'id_tema y contenido son requeridos' });
      }

      const respuesta = await ForoRespuestaModel.crearRespuesta(
        parseInt(id_tema),
        id_usuario,
        contenido
      );

      res.status(201).json(respuesta);
    } catch (error) {
      console.error('Error al crear respuesta:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // Actualizar respuesta
  static async actualizarRespuesta(req, res) {
    try {
      const { id_respuesta } = req.params;
      const { contenido } = req.body;
      const id_usuario = req.user.id_usuario;

      if (!id_respuesta) {
        return res.status(400).json({ error: 'id_respuesta es requerido' });
      }

      // Verificar que el usuario sea el creador
      const respuesta = await ForoRespuestaModel.obtenerRespuestaPorId(
        parseInt(id_respuesta)
      );
      if (!respuesta || respuesta.id_usuario !== id_usuario) {
        return res.status(403).json({ error: 'No tienes permiso para editar esta respuesta' });
      }

      const actualizado = await ForoRespuestaModel.actualizarRespuesta(
        parseInt(id_respuesta),
        contenido
      );

      if (actualizado) {
        res.json({ mensaje: 'Respuesta actualizada correctamente' });
      } else {
        res.status(404).json({ error: 'Respuesta no encontrada' });
      }
    } catch (error) {
      console.error('Error al actualizar respuesta:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // Eliminar respuesta
  static async eliminarRespuesta(req, res) {
    try {
      const { id_respuesta } = req.params;
      const id_usuario = req.user.id_usuario;

      if (!id_respuesta) {
        return res.status(400).json({ error: 'id_respuesta es requerido' });
      }

      // Verificar que el usuario sea el creador
      const respuesta = await ForoRespuestaModel.obtenerRespuestaPorId(
        parseInt(id_respuesta)
      );
      if (!respuesta || respuesta.id_usuario !== id_usuario) {
        return res.status(403).json({ error: 'No tienes permiso para eliminar esta respuesta' });
      }

      const eliminado = await ForoRespuestaModel.eliminarRespuesta(
        parseInt(id_respuesta)
      );

      if (eliminado) {
        res.json({ mensaje: 'Respuesta eliminada correctamente' });
      } else {
        res.status(404).json({ error: 'Respuesta no encontrada' });
      }
    } catch (error) {
      console.error('Error al eliminar respuesta:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // Obtener respuestas del usuario en una sección
  static async obtenerRespuestasUsuario(req, res) {
    try {
      const { id_seccion } = req.params;
      const id_usuario = req.user.id_usuario;

      if (!id_seccion) {
        return res.status(400).json({ error: 'id_seccion es requerido' });
      }

      const respuestas = await ForoRespuestaModel.obtenerRespuestasRecientes(
        parseInt(id_seccion),
        1440 // últimas 24 horas
      );

      res.json(respuestas);
    } catch (error) {
      console.error('Error al obtener respuestas del usuario:', error);
      res.status(500).json({ error: error.message });
    }
  }
}

export default ForoController;