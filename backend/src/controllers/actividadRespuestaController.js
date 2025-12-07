import ActividadRespuestaModel from '../models/ActividadRespuestaModel.js';
import { unlink } from 'fs/promises';

// Controlador para actividades_respuestas
export async function create(req, res) {
  try {
    const id_usuario = req.user.id;
    const { id_actividad, respuesta_texto } = req.body;
    let archivo = null;
    if (req.files && req.files.archivo && req.files.archivo[0]) {
      archivo = req.files.archivo[0].filename;
    }
    const result = await ActividadRespuestaModel.create({
      id_actividad,
      id_usuario,
      respuesta_texto: respuesta_texto || null,
      archivo,
      puntaje_obtenido: null,
      retroalimentacion: null,
      id_estado: 1
    });
    res.status(201).json({ message: 'Respuesta entregada', id_respuesta: result });
  } catch (error) {
    res.status(500).json({ message: 'Error entregando respuesta', error: error.message });
  }
}

export async function update(req, res) {
  try {
    const { id } = req.params;
    const { respuesta_texto } = req.body;
    let archivo = null;
    if (req.files && req.files.archivo && req.files.archivo[0]) {
      archivo = req.files.archivo[0].filename;
    }
    const updated = await ActividadRespuestaModel.update(id, {
      respuesta_texto: respuesta_texto || null,
      archivo
    });
    if (!updated) {
      return res.status(404).json({ message: 'Respuesta no encontrada' });
    }
    res.json({ message: 'Respuesta actualizada' });
  } catch (error) {
    res.status(500).json({ message: 'Error actualizando respuesta', error: error.message });
  }
}

export async function getByUsuario(req, res) {
  try {
    const id_usuario = req.user.id;
    const respuestas = await ActividadRespuestaModel.getByUsuario(id_usuario);
    res.json(respuestas);
  } catch (error) {
    res.status(500).json({ message: 'Error obteniendo respuestas', error: error.message });
  }
}

export async function getById(req, res) {
  try {
    const { id } = req.params;
    const respuesta = await ActividadRespuestaModel.getById(id);
    if (!respuesta) {
      return res.status(404).json({ message: 'Respuesta no encontrada' });
    }
    res.json(respuesta);
  } catch (error) {
    res.status(500).json({ message: 'Error obteniendo respuesta', error: error.message });
  }
}

export async function getByActividad(req, res) {
  try {
    const { id_actividad } = req.params;
    const respuestas = await ActividadRespuestaModel.getByActividad(id_actividad);
    res.json(respuestas);
  } catch (error) {
    res.status(500).json({ message: 'Error obteniendo respuestas', error: error.message });
  }
}

export async function calificar(req, res) {
  try {
    const { id } = req.params;
    const { puntaje_obtenido, retroalimentacion } = req.body;
    const actualizado = await ActividadRespuestaModel.calificar(id, { puntaje_obtenido, retroalimentacion });
    if (!actualizado) {
      return res.status(404).json({ message: 'Respuesta no encontrada' });
    }
    res.json({ message: 'Respuesta calificada' });
  } catch (error) {
    res.status(500).json({ message: 'Error al calificar respuesta', error: error.message });
  }
}

export async function delete_(req, res) {
  try {
    const { id } = req.params;
    const respuesta = await ActividadRespuestaModel.getById(id);
    if (!respuesta) {
      return res.status(404).json({ message: 'Respuesta no encontrada' });
    }
    if (respuesta.archivo) {
      try { await unlink(`uploads/${respuesta.archivo}`); } catch {}
    }
    const eliminado = await ActividadRespuestaModel.delete(id);
    if (!eliminado) {
      return res.status(404).json({ message: 'No se pudo eliminar la respuesta' });
    }
    res.json({ message: 'Respuesta eliminada' });
  } catch (error) {
    res.status(500).json({ message: 'Error eliminando respuesta', error: error.message });
  }
}
