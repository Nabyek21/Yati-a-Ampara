import { PonderacionModel } from "../models/PonderacionModel.js";

/**
 * Obtener ponderaciones de una sección
 * GET /api/secciones/:idSeccion/ponderaciones
 */
export const obtenerPonderacionesSeccion = async (req, res) => {
  try {
    const { idSeccion } = req.params;

    if (!idSeccion) {
      return res.status(400).json({
        success: false,
        message: "Se requiere idSeccion"
      });
    }

    const ponderaciones = await PonderacionModel.obtenerPonderacionesSeccion(parseInt(idSeccion));

    res.json({
      success: true,
      data: ponderaciones
    });
  } catch (error) {
    console.error("ERROR obteniendo ponderaciones:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Error al obtener ponderaciones"
    });
  }
};

/**
 * Guardar ponderaciones de una sección
 * POST /api/secciones/:idSeccion/ponderaciones
 */
export const guardarPonderacionesSeccion = async (req, res) => {
  try {
    const { idSeccion } = req.params;
    const { ponderaciones } = req.body;

    if (!idSeccion) {
      return res.status(400).json({
        success: false,
        message: "Se requiere idSeccion"
      });
    }

    if (!Array.isArray(ponderaciones) || ponderaciones.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Se requiere array de ponderaciones"
      });
    }

    // Validar que suma = 100%
    const suma = ponderaciones.reduce((total, p) => total + parseFloat(p.peso_porcentaje || 0), 0);
    if (Math.abs(suma - 100) > 0.01) {
      return res.status(400).json({
        success: false,
        message: `Las ponderaciones deben sumar 100%. Total actual: ${suma}%`
      });
    }

    // Validar tipos
    const tiposValidos = ['práctica', 'examen', 'examen_final'];
    const todosValidos = ponderaciones.every(p => tiposValidos.includes(p.tipo_evaluacion));
    if (!todosValidos) {
      return res.status(400).json({
        success: false,
        message: `Tipos de evaluación válidos: ${tiposValidos.join(', ')}`
      });
    }

    await PonderacionModel.guardarPonderacionesSeccion(parseInt(idSeccion), ponderaciones);

    res.json({
      success: true,
      message: "Ponderaciones guardadas correctamente"
    });
  } catch (error) {
    console.error("ERROR guardando ponderaciones:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Error al guardar ponderaciones"
    });
  }
};

/**
 * Obtener resumen de pesos de una sección
 * GET /api/pesos/resumen/:id_seccion
 */
export const obtenerResumenPesos = async (req, res) => {
  try {
    const { id_seccion } = req.params;

    if (!id_seccion) {
      return res.status(400).json({
        success: false,
        message: "Se requiere id_seccion"
      });
    }

    const ponderaciones = await PonderacionModel.obtenerPonderacionesSeccion(parseInt(id_seccion));

    // Transformar datos para el frontend
    const tipos = {};
    ponderaciones.forEach(p => {
      const tipo = p.tipo_evaluacion.toLowerCase();
      tipos[tipo] = {
        peso_minimo: p.peso_porcentaje || 0,
        peso_maximo: p.peso_porcentaje || 0,
        peso_promedio: p.peso_porcentaje || 0,
        cantidad_maxima: null
      };
    });

    const resumen = {
      tipos: tipos,
      pesoTotal: ponderaciones.reduce((sum, p) => sum + (p.peso_porcentaje || 0), 0)
    };

    res.json({
      success: true,
      data: resumen
    });
  } catch (error) {
    console.error("ERROR obteniendo resumen de pesos:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Error al obtener resumen de pesos"
    });
  }
};

/**
 * Obtener tipos de actividad de una sección
 * GET /api/secciones/:idSeccion/tipos-actividad
 */
export const obtenerTiposActividad = async (req, res) => {
  try {
    const { idSeccion } = req.params;

    if (!idSeccion) {
      return res.status(400).json({
        success: false,
        message: "Se requiere idSeccion"
      });
    }

    const tipos = await PonderacionModel.obtenerTiposActividad(parseInt(idSeccion));

    res.json({
      success: true,
      data: tipos
    });
  } catch (error) {
    console.error("ERROR obteniendo tipos de actividad:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Error al obtener tipos de actividad"
    });
  }
};

/**
 * Crear nuevo tipo de actividad
 * POST /api/secciones/:idSeccion/tipos-actividad
 */
export const crearTipoActividad = async (req, res) => {
  try {
    const { idSeccion } = req.params;
    const { nombre, codigo, color, icono } = req.body;

    if (!idSeccion || !nombre || !codigo) {
      return res.status(400).json({
        success: false,
        message: "Se requieren: idSeccion, nombre, codigo"
      });
    }

    const id = await PonderacionModel.crearTipoActividad(
      parseInt(idSeccion),
      nombre,
      codigo,
      color || '#6b7280',
      icono || '📝'
    );

    res.status(201).json({
      success: true,
      message: "Tipo de actividad creado",
      id_tipo: id
    });
  } catch (error) {
    console.error("ERROR creando tipo de actividad:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Error al crear tipo de actividad"
    });
  }
};

// Exports antiguos para compatibilidad
export const createPonderacion = obtenerPonderacionesSeccion;
export const getAllPonderaciones = obtenerPonderacionesSeccion;
export const getPonderacionById = obtenerPonderacionesSeccion;
export const getPonderacionByCurso = obtenerPonderacionesSeccion;
export const updatePonderacion = guardarPonderacionesSeccion;
export const deletePonderacion = obtenerPonderacionesSeccion;
