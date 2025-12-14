import { pool } from "../config/database.js";

/**
 * Servicio para manejar cálculos automáticos de calificaciones
 */
export class CalificacionesService {
  /**
   * Recalcula promedio por tipo de evaluación para un estudiante
   * Se ejecuta después de guardar/actualizar una nota
   */
  static async recalcularPromedioPorTipo(idMatricula, idSeccion) {
    try {
      const query = `
        INSERT INTO calificaciones_por_tipo 
          (id_matricula, id_seccion, tipo_evaluacion, promedio, cantidad_actividades)
        SELECT 
          ? as id_matricula,
          a.id_seccion,
          a.tipo,
          AVG((n.puntaje_obtenido / COALESCE(n.puntaje_max, a.puntaje_max, 100)) * 100) as promedio,
          COUNT(*) as cantidad
        FROM notas n
        JOIN actividades a ON n.id_actividad = a.id_actividad
        WHERE n.id_matricula = ? 
          AND a.id_seccion = ?
          AND a.tipo IN ('práctica', 'examen', 'examen_final')
        GROUP BY a.tipo
        ON DUPLICATE KEY UPDATE 
          promedio = VALUES(promedio),
          cantidad_actividades = VALUES(cantidad_actividades),
          fecha_calculo = NOW()
      `;
      
      await pool.query(query, [idMatricula, idMatricula, idSeccion]);
      console.log(`✅ Promedio por tipo recalculado para matricula ${idMatricula}, sección ${idSeccion}`);
    } catch (error) {
      console.error(`❌ Error recalculando promedio por tipo:`, error);
      throw error;
    }
  }

  /**
   * Recalcula nota final ponderada para un estudiante
   */
  static async recalcularNotaFinal(idMatricula, idSeccion) {
    try {
      const query = `
        INSERT INTO calificaciones_finales 
          (id_matricula, id_seccion, 
           promedio_practicas, promedio_examenes, promedio_examenes_finales,
           nota_final_ponderada, nota_final_en_20, total_actividades)
        SELECT
          ?,
          ?,
          MAX(CASE WHEN tipo_evaluacion = 'práctica' THEN promedio ELSE 0 END) as prom_practica,
          MAX(CASE WHEN tipo_evaluacion = 'examen' THEN promedio ELSE 0 END) as prom_examen,
          MAX(CASE WHEN tipo_evaluacion = 'examen_final' THEN promedio ELSE 0 END) as prom_final,
          (
            COALESCE(MAX(CASE WHEN tipo_evaluacion = 'práctica' THEN promedio END), 0) * 
              COALESCE((SELECT peso_porcentaje FROM ponderaciones_seccion 
                       WHERE id_seccion = ? AND tipo_evaluacion = 'práctica'), 10) / 100
            +
            COALESCE(MAX(CASE WHEN tipo_evaluacion = 'examen' THEN promedio END), 0) *
              COALESCE((SELECT peso_porcentaje FROM ponderaciones_seccion 
                       WHERE id_seccion = ? AND tipo_evaluacion = 'examen'), 30) / 100
            +
            COALESCE(MAX(CASE WHEN tipo_evaluacion = 'examen_final' THEN promedio END), 0) *
              COALESCE((SELECT peso_porcentaje FROM ponderaciones_seccion 
                       WHERE id_seccion = ? AND tipo_evaluacion = 'examen_final'), 40) / 100
          ) as nota_ponderada,
          (
            (
              COALESCE(MAX(CASE WHEN tipo_evaluacion = 'práctica' THEN promedio END), 0) * 
                COALESCE((SELECT peso_porcentaje FROM ponderaciones_seccion 
                         WHERE id_seccion = ? AND tipo_evaluacion = 'práctica'), 10) / 100
              +
              COALESCE(MAX(CASE WHEN tipo_evaluacion = 'examen' THEN promedio END), 0) *
                COALESCE((SELECT peso_porcentaje FROM ponderaciones_seccion 
                         WHERE id_seccion = ? AND tipo_evaluacion = 'examen'), 30) / 100
              +
              COALESCE(MAX(CASE WHEN tipo_evaluacion = 'examen_final' THEN promedio END), 0) *
                COALESCE((SELECT peso_porcentaje FROM ponderaciones_seccion 
                         WHERE id_seccion = ? AND tipo_evaluacion = 'examen_final'), 40) / 100
            ) * 20 / 100
          ) as nota_en_20,
          SUM(cantidad_actividades)
        FROM calificaciones_por_tipo
        WHERE id_matricula = ? AND id_seccion = ?
        GROUP BY id_matricula, id_seccion
        ON DUPLICATE KEY UPDATE
          promedio_practicas = VALUES(promedio_practicas),
          promedio_examenes = VALUES(promedio_examenes),
          promedio_examenes_finales = VALUES(promedio_examenes_finales),
          nota_final_ponderada = VALUES(nota_final_ponderada),
          nota_final_en_20 = VALUES(nota_final_en_20),
          total_actividades = VALUES(total_actividades),
          fecha_calculo = NOW()
      `;
      
      const params = [idMatricula, idSeccion, idSeccion, idSeccion, idSeccion, idSeccion, idSeccion, idSeccion, idMatricula, idSeccion];
      await pool.query(query, params);
      console.log(`✅ Nota final recalculada para matricula ${idMatricula}, sección ${idSeccion}`);
    } catch (error) {
      console.error(`❌ Error recalculando nota final:`, error);
      throw error;
    }
  }

  /**
   * Registra cambio en auditoría
   */
  static async registrarCambioNota(idNota, idMatricula, idActividad, puntajeAnterior, puntajeNuevo, razonCambio, idDocenteRealizo) {
    try {
      const query = `
        INSERT INTO historial_calificaciones 
          (id_nota, id_matricula, id_actividad, 
           puntaje_anterior, puntaje_nuevo, 
           razon_cambio, id_docente_realizo)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;
      
      await pool.query(query, [
        idNota, idMatricula, idActividad,
        puntajeAnterior, puntajeNuevo,
        razonCambio || null, idDocenteRealizo || null
      ]);
      console.log(`✅ Cambio de nota registrado en auditoría`);
    } catch (error) {
      console.error(`❌ Error registrando cambio de nota:`, error);
      throw error;
    }
  }

  /**
   * Obtener nota final ponderada de un estudiante
   */
  static async obtenerNotaFinal(idMatricula, idSeccion) {
    try {
      const query = `
        SELECT 
          cf.id_calif_final,
          cf.promedio_practicas,
          cf.promedio_examenes,
          cf.promedio_examenes_finales,
          cf.nota_final_ponderada,
          cf.nota_final_en_20,
          cf.total_actividades,
          cf.fecha_calculo
        FROM calificaciones_finales cf
        WHERE cf.id_matricula = ? AND cf.id_seccion = ?
        LIMIT 1
      `;
      
      const [results] = await pool.query(query, [idMatricula, idSeccion]);
      return results[0] || null;
    } catch (error) {
      console.error(`❌ Error obteniendo nota final:`, error);
      throw error;
    }
  }

  /**
   * Obtener estadísticas de una sección
   */
  static async obtenerEstadisticasSeccion(idSeccion, tipoEvaluacion = null) {
    try {
      let query = `
        SELECT 
          es.id_estadistica,
          es.tipo_evaluacion,
          es.cantidad_estudiantes,
          es.cantidad_evaluaciones,
          es.promedio_general,
          es.nota_minima,
          es.nota_maxima,
          es.desviacion_estandar,
          es.mediana,
          es.cantidad_aprobados,
          es.cantidad_desaprobados,
          es.porcentaje_aprobacion,
          es.fecha_actualizacion
        FROM estadisticas_secciones es
        WHERE es.id_seccion = ?
      `;
      
      const params = [idSeccion];
      
      if (tipoEvaluacion) {
        query += ` AND es.tipo_evaluacion = ?`;
        params.push(tipoEvaluacion);
      }
      
      const [results] = await pool.query(query, params);
      return results;
    } catch (error) {
      console.error(`❌ Error obteniendo estadísticas:`, error);
      throw error;
    }
  }

  /**
   * Actualizar estadísticas de una sección (caché)
   */
  static async actualizarEstadisticasSeccion(idSeccion) {
    try {
      // Para cada tipo de evaluación, calcular estadísticas
      const tiposEvaluacion = ['práctica', 'examen', 'examen_final'];
      
      for (const tipo of tiposEvaluacion) {
        const query = `
          INSERT INTO estadisticas_secciones 
            (id_seccion, tipo_evaluacion, 
             cantidad_estudiantes, cantidad_evaluaciones,
             promedio_general, nota_minima, nota_maxima,
             cantidad_aprobados, cantidad_desaprobados, porcentaje_aprobacion)
          SELECT
            ?,
            ?,
            COUNT(DISTINCT cf.id_matricula),
            SUM(cf.total_actividades),
            AVG(cf.nota_final_en_20),
            MIN(cf.nota_final_en_20),
            MAX(cf.nota_final_en_20),
            SUM(CASE WHEN cf.nota_final_en_20 >= 11 THEN 1 ELSE 0 END),
            SUM(CASE WHEN cf.nota_final_en_20 < 11 THEN 1 ELSE 0 END),
            (SUM(CASE WHEN cf.nota_final_en_20 >= 11 THEN 1 ELSE 0 END) / COUNT(DISTINCT cf.id_matricula) * 100)
          FROM calificaciones_finales cf
          WHERE cf.id_seccion = ?
          ON DUPLICATE KEY UPDATE
            cantidad_estudiantes = VALUES(cantidad_estudiantes),
            cantidad_evaluaciones = VALUES(cantidad_evaluaciones),
            promedio_general = VALUES(promedio_general),
            nota_minima = VALUES(nota_minima),
            nota_maxima = VALUES(nota_maxima),
            cantidad_aprobados = VALUES(cantidad_aprobados),
            cantidad_desaprobados = VALUES(cantidad_desaprobados),
            porcentaje_aprobacion = VALUES(porcentaje_aprobacion),
            fecha_actualizacion = NOW()
        `;
        
        await pool.query(query, [idSeccion, tipo, idSeccion]);
      }
      
      console.log(`✅ Estadísticas actualizadas para sección ${idSeccion}`);
    } catch (error) {
      console.error(`❌ Error actualizando estadísticas:`, error);
      throw error;
    }
  }
}

export default CalificacionesService;
