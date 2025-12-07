import { pool } from "../config/database.js";

/**
 * Obtener configuración de pesos para una sección
 */
export const getConfiguracionPesos = async (req, res) => {
  try {
    const { id_seccion } = req.params;

    if (!id_seccion) {
      return res.status(400).json({ message: "Se requiere id_seccion" });
    }

    const [rows] = await pool.query(
      `SELECT 
        id_configuracion,
        id_seccion,
        tipo_actividad,
        peso_minimo,
        peso_maximo,
        cantidad_maxima,
        orden
       FROM configuracion_pesos_actividades
       WHERE id_seccion = ? AND activo = TRUE
       ORDER BY orden ASC`,
      [parseInt(id_seccion)]
    );

    if (rows.length === 0) {
      return res.status(404).json({ 
        message: "No hay configuración de pesos para esta sección" 
      });
    }

    res.json(rows);
  } catch (err) {
    console.error("ERROR obteniendo configuración de pesos:", err);
    res.status(500).json({ message: "Error interno al obtener configuración" });
  }
};

/**
 * Obtener toda la configuración de pesos (todos los tipos disponibles)
 */
export const getTodosPesos = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT 
        id_configuracion,
        id_seccion,
        tipo_actividad,
        peso_minimo,
        peso_maximo,
        cantidad_maxima,
        orden
       FROM configuracion_pesos_actividades
       WHERE activo = TRUE
       ORDER BY id_seccion, orden ASC`
    );

    res.json(rows);
  } catch (err) {
    console.error("ERROR obteniendo todos los pesos:", err);
    res.status(500).json({ message: "Error interno al obtener pesos" });
  }
};

/**
 * Actualizar configuración de peso para un tipo de actividad en una sección
 */
export const actualizarConfiguracionPeso = async (req, res) => {
  try {
    const { id_seccion, tipo_actividad } = req.params;
    const { peso_minimo, peso_maximo, cantidad_maxima } = req.body;

    if (!id_seccion || !tipo_actividad) {
      return res.status(400).json({ 
        message: "Se requiere id_seccion y tipo_actividad" 
      });
    }

    if (peso_minimo === undefined || peso_maximo === undefined) {
      return res.status(400).json({ 
        message: "Se requiere peso_minimo y peso_maximo" 
      });
    }

    // Validar que los pesos sean válidos
    const pesoMin = parseFloat(peso_minimo);
    const pesoMax = parseFloat(peso_maximo);

    if (isNaN(pesoMin) || isNaN(pesoMax) || pesoMin < 0 || pesoMax > 100 || pesoMin > pesoMax) {
      return res.status(400).json({ 
        message: "Los pesos deben estar entre 0 y 100, y peso_minimo no puede ser mayor que peso_maximo" 
      });
    }

    const [result] = await pool.query(
      `UPDATE configuracion_pesos_actividades
       SET peso_minimo = ?, peso_maximo = ?, cantidad_maxima = ?
       WHERE id_seccion = ? AND tipo_actividad = ?`,
      [pesoMin, pesoMax, cantidad_maxima || null, parseInt(id_seccion), tipo_actividad.toLowerCase()]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ 
        message: "Configuración no encontrada" 
      });
    }

    res.json({ 
      message: "Configuración actualizada correctamente",
      id_seccion,
      tipo_actividad,
      peso_minimo: pesoMin,
      peso_maximo: pesoMax,
      cantidad_maxima: cantidad_maxima || null
    });
  } catch (err) {
    console.error("ERROR actualizando configuración:", err);
    res.status(500).json({ message: "Error interno al actualizar configuración" });
  }
};

/**
 * Crear nueva configuración de peso
 */
export const crearConfiguracionPeso = async (req, res) => {
  try {
    const { id_seccion, tipo_actividad, peso_minimo, peso_maximo, cantidad_maxima, orden } = req.body;

    if (!id_seccion || !tipo_actividad || peso_minimo === undefined || peso_maximo === undefined) {
      return res.status(400).json({ 
        message: "Se requiere id_seccion, tipo_actividad, peso_minimo y peso_maximo" 
      });
    }

    const pesoMin = parseFloat(peso_minimo);
    const pesoMax = parseFloat(peso_maximo);

    if (isNaN(pesoMin) || isNaN(pesoMax) || pesoMin < 0 || pesoMax > 100 || pesoMin > pesoMax) {
      return res.status(400).json({ 
        message: "Los pesos deben estar entre 0 y 100, y peso_minimo no puede ser mayor que peso_maximo" 
      });
    }

    const [result] = await pool.query(
      `INSERT INTO configuracion_pesos_actividades 
       (id_seccion, tipo_actividad, peso_minimo, peso_maximo, cantidad_maxima, orden)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [parseInt(id_seccion), tipo_actividad.toLowerCase(), pesoMin, pesoMax, cantidad_maxima || null, orden || 0]
    );

    res.status(201).json({ 
      message: "Configuración creada correctamente",
      id_configuracion: result.insertId
    });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ 
        message: "Ya existe una configuración para este tipo de actividad en esta sección" 
      });
    }
    console.error("ERROR creando configuración:", err);
    res.status(500).json({ message: "Error interno al crear configuración" });
  }
};

/**
 * Obtener el resumen de configuración (para cálculo de promedios)
 * Retorna un objeto con los tipos y sus pesos para ser usado en frontend
 */
export const getResumenConfiguracion = async (req, res) => {
  try {
    const { id_seccion } = req.params;

    if (!id_seccion) {
      return res.status(400).json({ message: "Se requiere id_seccion" });
    }

    const [rows] = await pool.query(
      `SELECT 
        tipo_actividad,
        peso_minimo,
        peso_maximo,
        cantidad_maxima,
        (peso_minimo + peso_maximo) / 2 AS peso_promedio
       FROM configuracion_pesos_actividades
       WHERE id_seccion = ? AND activo = TRUE
       ORDER BY orden ASC`,
      [parseInt(id_seccion)]
    );

    if (rows.length === 0) {
      return res.status(404).json({ 
        message: "No hay configuración para esta sección" 
      });
    }

    // Crear objeto con estructura para frontend
    const config = {
      id_seccion: parseInt(id_seccion),
      tipos: {},
      pesoTotal: 0
    };

    rows.forEach(row => {
      config.tipos[row.tipo_actividad] = {
        peso_minimo: parseFloat(row.peso_minimo),
        peso_maximo: parseFloat(row.peso_maximo),
        peso_promedio: parseFloat(row.peso_promedio),
        cantidad_maxima: row.cantidad_maxima
      };
      config.pesoTotal += parseFloat(row.peso_promedio);
    });

    res.json(config);
  } catch (err) {
    console.error("ERROR obteniendo resumen:", err);
    res.status(500).json({ message: "Error interno" });
  }
};
