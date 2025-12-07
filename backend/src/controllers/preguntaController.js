import { PreguntaModel } from "../models/PreguntaModel.js";
import { RespuestaOpcionModel } from "../models/RespuestaOpcionModel.js";
import { ActividadModel } from "../models/ActividadModel.js";
import { pool } from "../config/database.js";

export const createPregunta = async (req, res) => {
  try {
    const { id_actividad, tipo, enunciado, puntaje, opciones } = req.body;
    
    if (!id_actividad || !tipo || !enunciado) {
      return res.status(400).json({ 
        message: "Se requieren id_actividad, tipo y enunciado" 
      });
    }

    // Validar que el tipo sea uno de los valores permitidos
    const tiposPermitidos = ['opcion', 'texto'];
    if (!tiposPermitidos.includes(tipo)) {
      return res.status(400).json({ 
        message: `El tipo debe ser uno de: ${tiposPermitidos.join(', ')}` 
      });
    }

    // Verificar que la actividad existe y es tipo "examen"
    const actividad = await ActividadModel.findById(id_actividad);
    if (!actividad) {
      return res.status(404).json({ message: "Actividad no encontrada" });
    }
    if (actividad.tipo !== 'examen') {
      return res.status(400).json({ 
        message: "Solo se pueden agregar preguntas a actividades tipo 'examen'" 
      });
    }

    // Crear la pregunta
    const result = await PreguntaModel.create({
      id_actividad: parseInt(id_actividad),
      tipo,
      enunciado,
      puntaje: puntaje ? parseInt(puntaje) : 1
    });

    const id_pregunta = result.insertId;

    // Si es tipo "opcion", crear las opciones de respuesta
    if (tipo === 'opcion' && opciones && Array.isArray(opciones) && opciones.length > 0) {
      for (const opcion of opciones) {
        await RespuestaOpcionModel.create({
          id_pregunta,
          texto: opcion.texto,
          es_correcta: opcion.es_correcta || false
        });
      }
    }

    res.status(201).json({ 
      message: "Pregunta creada correctamente", 
      id_pregunta: id_pregunta 
    });
  } catch (err) {
    console.error("ERROR creando pregunta:", err);
    res.status(500).json({ message: "Error interno al crear pregunta" });
  }
};

export const getAllPreguntas = async (req, res) => {
  try {
    const filters = req.query;
    const preguntas = await PreguntaModel.getAll(filters);
    
    // Si se solicita, incluir las opciones para preguntas tipo "opcion"
    if (filters.include_opciones === 'true') {
      const preguntasConOpciones = await Promise.all(
        preguntas.map(async (pregunta) => {
          if (pregunta.tipo === 'opcion') {
            const opciones = await RespuestaOpcionModel.getAll({ id_pregunta: pregunta.id_pregunta });
            return { ...pregunta, opciones };
          }
          return pregunta;
        })
      );
      return res.json(preguntasConOpciones);
    }
    
    res.json(preguntas);
  } catch (err) {
    console.error("ERROR obteniendo preguntas:", err);
    res.status(500).json({ message: "Error interno al obtener preguntas" });
  }
};

export const getPreguntaById = async (req, res) => {
  try {
    const { id_pregunta } = req.params;
    const pregunta = await PreguntaModel.findById(parseInt(id_pregunta));
    if (!pregunta) {
      return res.status(404).json({ message: "Pregunta no encontrada" });
    }
    
    // Si es tipo "opcion", incluir las opciones
    if (pregunta.tipo === 'opcion') {
      const opciones = await RespuestaOpcionModel.getAll({ id_pregunta: pregunta.id_pregunta });
      pregunta.opciones = opciones;
    }
    
    res.json(pregunta);
  } catch (err) {
    console.error("ERROR obteniendo pregunta:", err);
    res.status(500).json({ message: "Error interno al obtener pregunta" });
  }
};

export const updatePregunta = async (req, res) => {
  try {
    const { id_pregunta } = req.params;
    const data = req.body;

    // Si se está actualizando el tipo, validarlo
    if (data.tipo) {
      const tiposPermitidos = ['opcion', 'texto'];
      if (!tiposPermitidos.includes(data.tipo)) {
        return res.status(400).json({ 
          message: `El tipo debe ser uno de: ${tiposPermitidos.join(', ')}` 
        });
      }
    }

    // Convertir campos numéricos si están presentes
    if (data.puntaje) data.puntaje = parseInt(data.puntaje);

    // Extraer opciones si vienen en el body (para actualizar)
    const { opciones, ...preguntaData } = data;

    const updated = await PreguntaModel.update(parseInt(id_pregunta), preguntaData);
    if (updated.affectedRows === 0) {
      return res.status(404).json({ message: "Pregunta no encontrada o sin cambios" });
    }

    // Si se están actualizando las opciones y la pregunta es tipo "opcion"
    if (opciones && Array.isArray(opciones)) {
      const pregunta = await PreguntaModel.findById(parseInt(id_pregunta));
      if (pregunta && pregunta.tipo === 'opcion') {
        // Eliminar opciones existentes
        await RespuestaOpcionModel.deleteByPregunta(parseInt(id_pregunta));
        
        // Crear nuevas opciones
        for (const opcion of opciones) {
          await RespuestaOpcionModel.create({
            id_pregunta: parseInt(id_pregunta),
            texto: opcion.texto,
            es_correcta: opcion.es_correcta || false
          });
        }
      }
    }

    res.json({ message: "Pregunta actualizada correctamente" });
  } catch (err) {
    console.error("ERROR actualizando pregunta:", err);
    res.status(500).json({ message: "Error interno al actualizar pregunta" });
  }
};

export const deletePregunta = async (req, res) => {
  try {
    const { id_pregunta } = req.params;
    const id = parseInt(id_pregunta);
    
    // 1. Obtener todas las opciones de respuesta de la pregunta
    const [opciones] = await pool.query(
      "SELECT id_opcion FROM respuestas_opciones WHERE id_pregunta = ?",
      [id]
    );
    
    // 2. Eliminar respuestas de alumnos que referencian estas opciones
    if (opciones && opciones.length > 0) {
      for (const opcion of opciones) {
        await pool.query(
          "DELETE FROM respuestas_alumnos WHERE id_opcion = ?",
          [opcion.id_opcion]
        );
      }
    }
    
    // 3. Eliminar respuestas de texto de la pregunta
    await pool.query(
      "DELETE FROM respuestas_alumnos WHERE id_pregunta = ? AND id_opcion IS NULL",
      [id]
    );
    
    // 4. Eliminar opciones de respuesta
    await pool.query(
      "DELETE FROM respuestas_opciones WHERE id_pregunta = ?",
      [id]
    );
    
    // 5. Finalmente eliminar la pregunta
    const deleted = await PreguntaModel.delete(id);
    if (deleted.affectedRows === 0) {
      return res.status(404).json({ message: "Pregunta no encontrada" });
    }
    res.json({ message: "Pregunta eliminada correctamente" });
  } catch (err) {
    console.error("ERROR eliminando pregunta:", err);
    res.status(500).json({ message: "Error interno al eliminar pregunta" });
  }
};

