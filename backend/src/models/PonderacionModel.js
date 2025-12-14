import { pool } from "../config/database.js";

export class PonderacionModel {
  /**
   * Obtener ponderaciones de una sección
   */
  static async obtenerPonderacionesSeccion(idSeccion) {
    const query = `
      SELECT 
        id_ponderacion_seccion,
        tipo_evaluacion,
        peso_porcentaje,
        descripcion,
        activo
      FROM ponderaciones_seccion
      WHERE id_seccion = ?
      ORDER BY tipo_evaluacion
    `;
    
    const [results] = await pool.query(query, [idSeccion]);
    return results;
  }

  /**
   * Actualizar una ponderación
   */
  static async actualizarPonderacion(idPonderacionSeccion, peso, descripcion) {
    const query = `
      UPDATE ponderaciones_seccion
      SET peso_porcentaje = ?,
          descripcion = ?,
          fecha_actualizacion = NOW()
      WHERE id_ponderacion_seccion = ?
    `;
    
    const [result] = await pool.query(query, [peso, descripcion, idPonderacionSeccion]);
    return result;
  }

  /**
   * Guardar múltiples ponderaciones
   */
  static async guardarPonderacionesSeccion(idSeccion, ponderaciones) {
    for (const pond of ponderaciones) {
      const query = `
        INSERT INTO ponderaciones_seccion 
          (id_seccion, tipo_evaluacion, peso_porcentaje, descripcion)
        VALUES (?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          peso_porcentaje = VALUES(peso_porcentaje),
          descripcion = VALUES(descripcion),
          fecha_actualizacion = NOW()
      `;
      
      await pool.query(query, [
        idSeccion,
        pond.tipo_evaluacion,
        pond.peso_porcentaje,
        pond.descripcion || null
      ]);
    }
  }

  /**
   * Obtener tipos de actividad de una sección
   */
  static async obtenerTiposActividad(idSeccion) {
    const query = `
      SELECT 
        id_tipo,
        nombre,
        codigo,
        color,
        icono,
        activo
      FROM tipos_actividad
      WHERE id_seccion = ? AND activo = TRUE
      ORDER BY nombre
    `;
    
    const [results] = await pool.query(query, [idSeccion]);
    return results;
  }

  /**
   * Crear nuevo tipo de actividad
   */
  static async crearTipoActividad(idSeccion, nombre, codigo, color, icono) {
    const query = `
      INSERT INTO tipos_actividad 
        (id_seccion, nombre, codigo, color, icono)
      VALUES (?, ?, ?, ?, ?)
    `;
    
    const [result] = await pool.query(query, [idSeccion, nombre, codigo, color, icono]);
    return result.insertId;
  }

  /**
   * Obtener pesos por defecto (para compatibilidad)
   */
  static async getPesosDefault() {
    return {
      practica: 10.00,
      examen: 30.00,
      examen_final: 40.00
    };
  }
}
