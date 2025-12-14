import ContenidoUploadService from '../services/ContenidoUploadService.js';
import { ModuloModel } from '../models/ModuloModel.js';

/**
 * Controller para gestión de carga de contenido en módulos
 * Endpoints para que profesores suban contenido
 */
export class ContenidoUploadController {
  /**
   * Cargar archivo de contenido en un módulo
   * POST /api/contenido/cargar
   */
  static async cargarContenido(req, res) {
    try {
      const { id_modulo, id_seccion, tipo, titulo, descripcion } = req.body;
      const id_docente = req.usuario.id_usuario; // Del middleware de autenticación

      // Validar datos requeridos
      if (!id_modulo || !tipo || !titulo) {
        return res.status(400).json({
          error: 'Faltan datos requeridos: id_modulo, tipo, titulo'
        });
      }

      // Validar que sea docente
      if (req.usuario.id_rol !== 3) { // Rol 3 = Docente
        return res.status(403).json({
          error: 'Solo los docentes pueden cargar contenido'
        });
      }

      // Validar que el docente sea propietario del módulo
      const [modulos] = await ModuloModel.getById(id_modulo);
      if (!modulos || modulos.id_docente !== id_docente) {
        return res.status(403).json({
          error: 'No tienes permiso para cargar contenido en este módulo'
        });
      }

      // Si hay archivo, cargarlo
      if (req.file) {
        const resultado = await ContenidoUploadService.crearContenidoConArchivo(
          { id_modulo, id_seccion, tipo, titulo, descripcion, id_docente },
          req.file.buffer,
          req.file.originalname
        );

        return res.status(201).json({
          mensaje: 'Contenido cargado exitosamente',
          datos: resultado
        });
      }

      // Si no hay archivo, debe ser una URL
      const { url_contenido } = req.body;
      if (!url_contenido) {
        return res.status(400).json({
          error: 'Debe proporcionar un archivo o una URL'
        });
      }

      const resultado = await ContenidoUploadService.crearContenidoConURL(
        { id_modulo, id_seccion, tipo, titulo, descripcion, url_contenido },
        id_docente
      );

      return res.status(201).json({
        mensaje: 'Contenido creado exitosamente',
        datos: resultado
      });
    } catch (error) {
      console.error('Error cargando contenido:', error);
      res.status(500).json({
        error: error.message || 'Error al cargar contenido'
      });
    }
  }

  /**
   * Obtener contenido de un módulo
   * GET /api/contenido/modulo/:id_modulo
   */
  static async obtenerContenidoModulo(req, res) {
    try {
      const { id_modulo } = req.params;
      const { id_seccion } = req.query;

      const contenidos = await ContenidoUploadService.obtenerContenidoModulo(
        id_modulo,
        id_seccion
      );

      res.json({
        total: contenidos.length,
        datos: contenidos
      });
    } catch (error) {
      console.error('Error obteniendo contenido:', error);
      res.status(500).json({
        error: error.message || 'Error al obtener contenido'
      });
    }
  }

  /**
   * Actualizar contenido
   * PUT /api/contenido/:id_contenido
   */
  static async actualizarContenido(req, res) {
    try {
      const { id_contenido } = req.params;
      const { titulo, descripcion, orden } = req.body;
      const id_docente = req.usuario.id_usuario;

      // Validar que sea docente
      if (req.usuario.id_rol !== 3) {
        return res.status(403).json({
          error: 'Solo los docentes pueden actualizar contenido'
        });
      }

      // TODO: Validar que el docente sea propietario del contenido

      await ContenidoUploadService.actualizarContenido(
        id_contenido,
        { titulo, descripcion, orden },
        id_docente
      );

      res.json({
        mensaje: 'Contenido actualizado exitosamente'
      });
    } catch (error) {
      console.error('Error actualizando contenido:', error);
      res.status(500).json({
        error: error.message || 'Error al actualizar contenido'
      });
    }
  }

  /**
   * Eliminar contenido
   * DELETE /api/contenido/:id_contenido
   */
  static async eliminarContenido(req, res) {
    try {
      const { id_contenido } = req.params;
      const id_docente = req.usuario.id_usuario;

      // Validar que sea docente
      if (req.usuario.id_rol !== 3) {
        return res.status(403).json({
          error: 'Solo los docentes pueden eliminar contenido'
        });
      }

      // TODO: Validar que el docente sea propietario del contenido

      await ContenidoUploadService.eliminarContenido(id_contenido, id_docente);

      res.json({
        mensaje: 'Contenido eliminado exitosamente'
      });
    } catch (error) {
      console.error('Error eliminando contenido:', error);
      res.status(500).json({
        error: error.message || 'Error al eliminar contenido'
      });
    }
  }

  /**
   * Descargar archivo de contenido
   * GET /api/contenido/descargar/:id_contenido
   */
  static async descargarContenido(req, res) {
    try {
      const { id_contenido } = req.params;

      const { rutaCompleta, nombreDescarga } = await ContenidoUploadService.descargarContenido(
        id_contenido
      );

      res.download(rutaCompleta, nombreDescarga, (error) => {
        if (error) {
          console.error('Error descargando archivo:', error);
        }
      });
    } catch (error) {
      console.error('Error descargando contenido:', error);
      res.status(404).json({
        error: error.message || 'Archivo no encontrado'
      });
    }
  }

  /**
   * Obtener estadísticas de contenido
   * GET /api/contenido/estadisticas/:id_modulo
   */
  static async obtenerEstadisticasContenido(req, res) {
    try {
      const { id_modulo } = req.params;
      const { id_seccion } = req.query;

      const estadisticas = await ContenidoUploadService.obtenerEstadisticasContenido(
        id_modulo,
        id_seccion
      );

      res.json({
        datos: estadisticas
      });
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
      res.status(500).json({
        error: error.message || 'Error al obtener estadísticas'
      });
    }
  }

  /**
   * Obtener tipos de contenido permitidos
   * GET /api/contenido/tipos
   */
  static async obtenerTiposPermitidos(req, res) {
    try {
      const tipos = Object.entries(ContenidoUploadService.TIPOS_PERMITIDOS).map(
        ([clave, valor]) => ({
          tipo: clave,
          nombre: ContenidoUploadService.obtenerNombreTipo(clave),
          extensiones: Array.isArray(valor.ext) 
            ? valor.ext.join(', ') 
            : valor.ext,
          mime: valor.mime
        })
      );

      res.json({
        tipos
      });
    } catch (error) {
      console.error('Error obteniendo tipos:', error);
      res.status(500).json({
        error: error.message || 'Error al obtener tipos'
      });
    }
  }
}

export default ContenidoUploadController;
