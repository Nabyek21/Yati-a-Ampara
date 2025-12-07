import { RespuestaOpcionModel } from "../models/RespuestaOpcionModel.js";
import { PreguntaModel } from "../models/PreguntaModel.js";

export const createRespuestaOpcion = async (req, res) => {
  try {
    const { id_pregunta, texto, es_correcta } = req.body;
    
    if (!id_pregunta || !texto) {
      return res.status(400).json({ 
        message: "Se requieren id_pregunta y texto" 
      });
    }

    // Verificar que la pregunta existe y es tipo "opcion"
    const pregunta = await PreguntaModel.findById(parseInt(id_pregunta));
    if (!pregunta) {
      return res.status(404).json({ message: "Pregunta no encontrada" });
    }
    if (pregunta.tipo !== 'opcion') {
      return res.status(400).json({ 
        message: "Solo se pueden agregar opciones a preguntas tipo 'opcion'" 
      });
    }

    const result = await RespuestaOpcionModel.create({
      id_pregunta: parseInt(id_pregunta),
      texto,
      es_correcta: es_correcta || false
    });

    res.status(201).json({ 
      message: "Opción creada correctamente", 
      id_opcion: result.insertId 
    });
  } catch (err) {
    console.error("ERROR creando opción:", err);
    res.status(500).json({ message: "Error interno al crear opción" });
  }
};

export const getAllRespuestaOpciones = async (req, res) => {
  try {
    const filters = req.query;
    const opciones = await RespuestaOpcionModel.getAll(filters);
    res.json(opciones);
  } catch (err) {
    console.error("ERROR obteniendo opciones:", err);
    res.status(500).json({ message: "Error interno al obtener opciones" });
  }
};

export const getRespuestaOpcionById = async (req, res) => {
  try {
    const { id_opcion } = req.params;
    const opcion = await RespuestaOpcionModel.findById(parseInt(id_opcion));
    if (!opcion) {
      return res.status(404).json({ message: "Opción no encontrada" });
    }
    res.json(opcion);
  } catch (err) {
    console.error("ERROR obteniendo opción:", err);
    res.status(500).json({ message: "Error interno al obtener opción" });
  }
};

export const updateRespuestaOpcion = async (req, res) => {
  try {
    const { id_opcion } = req.params;
    const data = req.body;

    // Convertir es_correcta a boolean si está presente
    if (data.hasOwnProperty('es_correcta')) {
      data.es_correcta = data.es_correcta ? 1 : 0;
    }

    const updated = await RespuestaOpcionModel.update(parseInt(id_opcion), data);
    if (updated.affectedRows === 0) {
      return res.status(404).json({ message: "Opción no encontrada o sin cambios" });
    }
    res.json({ message: "Opción actualizada correctamente" });
  } catch (err) {
    console.error("ERROR actualizando opción:", err);
    res.status(500).json({ message: "Error interno al actualizar opción" });
  }
};

export const deleteRespuestaOpcion = async (req, res) => {
  try {
    const { id_opcion } = req.params;
    const deleted = await RespuestaOpcionModel.delete(parseInt(id_opcion));
    if (deleted.affectedRows === 0) {
      return res.status(404).json({ message: "Opción no encontrada" });
    }
    res.json({ message: "Opción eliminada correctamente" });
  } catch (err) {
    console.error("ERROR eliminando opción:", err);
    res.status(500).json({ message: "Error interno al eliminar opción" });
  }
};

