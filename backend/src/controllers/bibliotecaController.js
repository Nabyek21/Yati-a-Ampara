import { BibliotecaModel } from '../models/BibliotecaModel.js';

export class BibliotecaController {
  // Obtener todos los recursos
  static async obtenerRecursos(req, res) {
    try {
      const { tipo, busqueda } = req.query;
      
      const recursos = await BibliotecaModel.obtenerRecursos({
        tipo,
        busqueda
      });
      
      res.json(recursos);
    } catch (error) {
      console.error('Error al obtener recursos:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // Obtener un recurso específico
  static async obtenerRecursoPorId(req, res) {
    try {
      const { id_recurso } = req.params;
      
      if (!id_recurso) {
        return res.status(400).json({ error: 'id_recurso es requerido' });
      }
      
      const recurso = await BibliotecaModel.obtenerRecursoPorId(parseInt(id_recurso));
      
      if (!recurso) {
        return res.status(404).json({ error: 'Recurso no encontrado' });
      }
      
      res.json(recurso);
    } catch (error) {
      console.error('Error al obtener recurso:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // Crear nuevo recurso (solo admin)
  static async crearRecurso(req, res) {
    try {
      const { tipo, titulo, autor, descripcion, url_recurso } = req.body;
      const id_usuario = req.user.id_usuario;
      const archivo = req.file; // Multer con single() devuelve req.file
      
      if (!tipo || !titulo) {
        return res.status(400).json({ error: 'tipo y titulo son requeridos' });
      }
      
      // Validar que sea admin
      const rol = req.user.id_rol;
      if (rol !== 1) { // Asumiendo que 1 es admin
        return res.status(403).json({ error: 'No tienes permiso para crear recursos' });
      }

      // Validar que haya URL o archivo
      let url_final = url_recurso || null;
      if (archivo) {
        // Construir URL del archivo subido
        url_final = `/uploads/biblioteca/${archivo.filename}`;
      } else if (!url_recurso) {
        return res.status(400).json({ error: 'Debes proporcionar una URL o subir un archivo' });
      }
      
      const recurso = await BibliotecaModel.crearRecurso(
        tipo,
        titulo,
        autor || null,
        descripcion || null,
        url_final,
        id_usuario
      );
      
      res.status(201).json(recurso);
    } catch (error) {
      console.error('Error al crear recurso:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // Actualizar recurso (solo admin o creador)
  static async actualizarRecurso(req, res) {
    try {
      const { id_recurso } = req.params;
      const { tipo, titulo, autor, descripcion, url_recurso } = req.body;
      const id_usuario = req.user.id_usuario;
      const rol = req.user.id_rol;
      
      if (!id_recurso) {
        return res.status(400).json({ error: 'id_recurso es requerido' });
      }
      
      const recurso = await BibliotecaModel.obtenerRecursoPorId(parseInt(id_recurso));
      
      if (!recurso) {
        return res.status(404).json({ error: 'Recurso no encontrado' });
      }
      
      // Validar permiso (admin o creador)
      if (rol !== 1 && recurso.id_usuario !== id_usuario) {
        return res.status(403).json({ error: 'No tienes permiso para editar este recurso' });
      }
      
      const actualizado = await BibliotecaModel.actualizarRecurso(
        parseInt(id_recurso),
        tipo,
        titulo,
        autor,
        descripcion,
        url_recurso
      );
      
      if (actualizado) {
        res.json({ message: 'Recurso actualizado correctamente' });
      } else {
        res.status(500).json({ error: 'No se pudo actualizar el recurso' });
      }
    } catch (error) {
      console.error('Error al actualizar recurso:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // Eliminar recurso (solo admin o creador)
  static async eliminarRecurso(req, res) {
    try {
      const { id_recurso } = req.params;
      const id_usuario = req.user.id_usuario;
      const rol = req.user.id_rol;
      
      if (!id_recurso) {
        return res.status(400).json({ error: 'id_recurso es requerido' });
      }
      
      const recurso = await BibliotecaModel.obtenerRecursoPorId(parseInt(id_recurso));
      
      if (!recurso) {
        return res.status(404).json({ error: 'Recurso no encontrado' });
      }
      
      // Validar permiso (admin o creador)
      if (rol !== 1 && recurso.id_usuario !== id_usuario) {
        return res.status(403).json({ error: 'No tienes permiso para eliminar este recurso' });
      }
      
      const eliminado = await BibliotecaModel.eliminarRecurso(parseInt(id_recurso));
      
      if (eliminado) {
        res.json({ message: 'Recurso eliminado correctamente' });
      } else {
        res.status(500).json({ error: 'No se pudo eliminar el recurso' });
      }
    } catch (error) {
      console.error('Error al eliminar recurso:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // Obtener tipos de recursos
  static async obtenerTipos(req, res) {
    try {
      const tipos = await BibliotecaModel.obtenerTipos();
      res.json(tipos);
    } catch (error) {
      console.error('Error al obtener tipos:', error);
      res.status(500).json({ error: error.message });
    }
  }
}
