import { PonderacionModel } from "../models/PonderacionModel.js";

// Crear nueva ponderación
export const createPonderacion = async (req, res) => {
  try {
    const { id_curso, peso_tareas, peso_examenes, peso_quices } = req.body;

    if (!id_curso) {
      return res.status(400).json({
        success: false,
        message: "Se requiere id_curso"
      });
    }

    const result = await PonderacionModel.create({
      id_curso: parseInt(id_curso),
      peso_tareas: peso_tareas !== undefined ? parseFloat(peso_tareas) : 40.00,
      peso_examenes: peso_examenes !== undefined ? parseFloat(peso_examenes) : 50.00,
      peso_quices: peso_quices !== undefined ? parseFloat(peso_quices) : 10.00
    });

    res.status(201).json({
      success: true,
      message: "Ponderación creada correctamente",
      id_ponderacion: result.insertId
    });
  } catch (error) {
    console.error("ERROR creando ponderación:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Error interno al crear ponderación"
    });
  }
};

// Obtener todas las ponderaciones
export const getAllPonderaciones = async (req, res) => {
  try {
    const filters = req.query;
    const ponderaciones = await PonderacionModel.getAll(filters);

    res.json({
      success: true,
      data: ponderaciones
    });
  } catch (error) {
    console.error("ERROR obteniendo ponderaciones:", error);
    res.status(500).json({
      success: false,
      message: "Error interno al obtener ponderaciones"
    });
  }
};

// Obtener ponderación por ID
export const getPonderacionById = async (req, res) => {
  try {
    const { id_ponderacion } = req.params;
    const ponderacion = await PonderacionModel.findById(parseInt(id_ponderacion));

    if (!ponderacion) {
      return res.status(404).json({
        success: false,
        message: "Ponderación no encontrada"
      });
    }

    res.json({
      success: true,
      data: ponderacion
    });
  } catch (error) {
    console.error("ERROR obteniendo ponderación:", error);
    res.status(500).json({
      success: false,
      message: "Error interno al obtener ponderación"
    });
  }
};

// Obtener ponderación por curso
export const getPonderacionByCurso = async (req, res) => {
  try {
    const { id_curso } = req.params;
    const ponderacion = await PonderacionModel.getByCurso(parseInt(id_curso));

    if (!ponderacion) {
      // Retornar pesos por defecto si no existe ponderación
      const pesosDefault = await PonderacionModel.getPesosDefault();
      return res.json({
        success: true,
        data: {
          id_ponderacion: null,
          id_curso: parseInt(id_curso),
          nombre_curso: null,
          ...pesosDefault
        }
      });
    }

    res.json({
      success: true,
      data: ponderacion
    });
  } catch (error) {
    console.error("ERROR obteniendo ponderación por curso:", error);
    res.status(500).json({
      success: false,
      message: "Error interno al obtener ponderación"
    });
  }
};

// Actualizar ponderación
export const updatePonderacion = async (req, res) => {
  try {
    const { id_ponderacion } = req.params;
    const { peso_tareas, peso_examenes, peso_quices } = req.body;

    // Validar que al menos un peso se esté actualizando
    if (
      peso_tareas === undefined &&
      peso_examenes === undefined &&
      peso_quices === undefined
    ) {
      return res.status(400).json({
        success: false,
        message: "Se debe proporcionar al menos un peso a actualizar"
      });
    }

    // Convertir a números si se proporcionan
    const updateData = {};
    if (peso_tareas !== undefined) updateData.peso_tareas = parseFloat(peso_tareas);
    if (peso_examenes !== undefined) updateData.peso_examenes = parseFloat(peso_examenes);
    if (peso_quices !== undefined) updateData.peso_quices = parseFloat(peso_quices);

    const result = await PonderacionModel.update(parseInt(id_ponderacion), updateData);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Ponderación no encontrada o sin cambios"
      });
    }

    res.json({
      success: true,
      message: "Ponderación actualizada correctamente"
    });
  } catch (error) {
    console.error("ERROR actualizando ponderación:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Error interno al actualizar ponderación"
    });
  }
};

// Eliminar ponderación
export const deletePonderacion = async (req, res) => {
  try {
    const { id_ponderacion } = req.params;
    const result = await PonderacionModel.delete(parseInt(id_ponderacion));

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Ponderación no encontrada"
      });
    }

    res.json({
      success: true,
      message: "Ponderación eliminada correctamente"
    });
  } catch (error) {
    console.error("ERROR eliminando ponderación:", error);
    res.status(500).json({
      success: false,
      message: "Error interno al eliminar ponderación"
    });
  }
};
