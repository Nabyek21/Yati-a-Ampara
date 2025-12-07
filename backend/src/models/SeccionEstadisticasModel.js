import { pool } from '../config/database.js';

export class SeccionEstadisticasModel {
  // Obtiene métricas para todos los alumnos de una sección
  static async getEstadisticasPorSeccion(id_seccion) {
    try {
      // 1. Obtener todas las matrículas de la sección
      const [matriculas] = await pool.query(
        `SELECT m.id_matricula, u.nombres, u.apellidos, m.id_usuario
         FROM matriculas m
         JOIN usuarios u ON m.id_usuario = u.id_usuario
         WHERE m.id_seccion = ?`,
        [id_seccion]
      );

      if (!matriculas || matriculas.length === 0) {
        return [];
      }

      // 2. Para cada matrícula, calcular métricas
      const resultados = [];
      for (const m of matriculas) {
        // Promedio de notas (de actividades_respuestas)
        const [notas] = await pool.query(
          `SELECT AVG(puntaje_obtenido) as promedio, COUNT(*) as total
           FROM actividades_respuestas
           WHERE id_matricula = ? AND puntaje_obtenido IS NOT NULL`,
          [m.id_matricula]
        );

        // Exámenes aprobados
        const [examenes] = await pool.query(
          `SELECT COUNT(*) as total, SUM(CASE WHEN puntaje_obtenido >= 12 THEN 1 ELSE 0 END) as aprobados
           FROM actividades_respuestas ar
           JOIN actividades a ON ar.id_actividad = a.id_actividad
           WHERE ar.id_matricula = ? AND a.tipo = 'examen'`,
          [m.id_matricula]
        );

        // Tareas enviadas
        const [tareas] = await pool.query(
          `SELECT COUNT(*) as enviadas
           FROM actividades_respuestas ar
           JOIN actividades a ON ar.id_actividad = a.id_actividad
           WHERE ar.id_matricula = ? AND a.tipo = 'tarea' AND ar.id_estado = 1`,
          [m.id_matricula]
        );

        // Progreso general (basado en promedio de notas como porcentaje)
        const promedio = parseFloat(notas[0]?.promedio) || 0;
        const progreso = Math.min(100, Math.round((promedio / 20) * 100)); // Escala 0-20

        // Obtener estado académico manual basado en desempeño
        // Escala: 0-20, Mínimo para aprobar: 12
        let estadoAcademico = 'En Proceso';
        if (promedio >= 12) {
          estadoAcademico = 'Aprobado';
        } else if (promedio >= 1) {
          estadoAcademico = 'En Riesgo';
        } else {
          estadoAcademico = 'Sin Calificación';
        }

        resultados.push({
          id_matricula: m.id_matricula,
          id_usuario: m.id_usuario,
          nombres: m.nombres || 'N/A',
          apellidos: m.apellidos || 'N/A',
          progreso: progreso,
          nota_final: promedio > 0 ? promedio.toFixed(2) : null,
          promedio_actividades: promedio > 0 ? promedio.toFixed(2) : null,
          examenes_aprobados: parseInt(examenes[0]?.aprobados) || 0,
          examenes_totales: parseInt(examenes[0]?.total) || 0,
          tareas_enviadas: parseInt(tareas[0]?.enviadas) || 0,
          asistencia: 100, // TODO: Calcular desde tabla de asistencia si existe
          estado_academico: estadoAcademico
        });
      }

      return resultados;
    } catch (error) {
      console.error('Error en getEstadisticasPorSeccion:', error);
      throw error;
    }
  }
}

export default SeccionEstadisticasModel;
