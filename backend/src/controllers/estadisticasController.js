import { pool } from '../config/database.js';

class EstadisticasController {
  // Obtener tareas por calificar de una sección
  static async getTareasPorCalificarSeccion(req, res) {
    try {
      const { id_seccion } = req.params;

      if (!id_seccion) {
        return res.status(400).json({ 
          error: 'id_seccion es requerido' 
        });
      }

      // Obtener todas las actividades de la sección
      const queryActividades = `
        SELECT DISTINCT a.id_actividad
        FROM actividades a
        JOIN secciones s ON a.id_seccion = s.id_seccion
        WHERE s.id_seccion = ? AND a.tipo IN ('tarea', 'examen')
      `;

      const [actividades] = await pool.query(queryActividades, [id_seccion]);

      if (actividades.length === 0) {
        return res.status(200).json({ 
          tareas_por_calificar: 0,
          detalle: []
        });
      }

      // Para cada actividad, contar respuestas sin calificar
      let totalPorCalificar = 0;
      const detalle = [];

      for (const actividad of actividades) {
        const queryRespuestasNoCalificadas = `
          SELECT COUNT(*) as sin_calificar
          FROM respuestas_alumnos ra
          WHERE ra.id_actividad = ? 
            AND (ra.puntaje_obtenido IS NULL)
        `;

        const [result] = await pool.query(queryRespuestasNoCalificadas, [actividad.id_actividad]);
        const sinCalificar = result[0].sin_calificar || 0;

        if (sinCalificar > 0) {
          totalPorCalificar += sinCalificar;
          detalle.push({
            id_actividad: actividad.id_actividad,
            respuestas_sin_calificar: sinCalificar
          });
        }
      }

      return res.status(200).json({ 
        tareas_por_calificar: totalPorCalificar,
        detalle
      });

    } catch (error) {
      console.error('Error al obtener tareas por calificar:', error);
      res.status(500).json({ 
        error: 'Error al obtener tareas por calificar',
        details: error.message 
      });
    }
  }

  // Obtener estadísticas completas de un curso
  static async getEstadisticasCurso(req, res) {
    try {
      const { id_curso } = req.params;

      if (!id_curso) {
        return res.status(400).json({ 
          error: 'id_curso es requerido' 
        });
      }

      // Obtener todas las secciones del curso
      const querySecciones = `
        SELECT id_seccion 
        FROM secciones 
        WHERE id_curso = ?
      `;

      const [secciones] = await pool.query(querySecciones, [id_curso]);

      let totalEstudiantes = 0;
      let totalTareasPorCalificar = 0;

      const estadisticasSecciones = [];

      for (const seccion of secciones) {
        // Contar estudiantes en la sección
        const queryEstudiantes = `
          SELECT COUNT(*) as total
          FROM matriculas
          WHERE id_seccion = ?
        `;

        const [estudiantesResult] = await pool.query(queryEstudiantes, [seccion.id_seccion]);
        const numEstudiantes = estudiantesResult[0].total || 0;
        totalEstudiantes += numEstudiantes;

        // Obtener tareas por calificar
        const queryTareasPorCalificar = `
          SELECT COUNT(*) as sin_calificar
          FROM respuestas_alumnos ra
          JOIN actividades a ON ra.id_actividad = a.id_actividad
          WHERE a.id_seccion = ? 
            AND (ra.puntaje_obtenido IS NULL)
        `;

        const [tareasResult] = await pool.query(queryTareasPorCalificar, [seccion.id_seccion]);
        const tareasSinCalificar = tareasResult[0].sin_calificar || 0;
        totalTareasPorCalificar += tareasSinCalificar;

        estadisticasSecciones.push({
          id_seccion: seccion.id_seccion,
          estudiantes: numEstudiantes,
          tareas_por_calificar: tareasSinCalificar
        });
      }

      return res.status(200).json({ 
        id_curso,
        total_estudiantes: totalEstudiantes,
        total_tareas_por_calificar: totalTareasPorCalificar,
        por_seccion: estadisticasSecciones
      });

    } catch (error) {
      console.error('Error al obtener estadísticas del curso:', error);
      res.status(500).json({ 
        error: 'Error al obtener estadísticas',
        details: error.message 
      });
    }
  }

  // Obtener detalle de respuestas por calificar de una sección
  static async getDetalleRespuestasPorCalificar(req, res) {
    try {
      const { id_seccion } = req.params;

      if (!id_seccion) {
        return res.status(400).json({ 
          error: 'id_seccion es requerido' 
        });
      }

      const query = `
        SELECT 
          ra.id_respuesta,
          ra.id_actividad,
          ra.id_matricula,
          ra.id_pregunta,
          a.titulo as actividad_titulo,
          a.tipo,
          a.puntaje_max as puntaje_maximo_actividad,
          p.enunciado as pregunta_enunciado,
          p.tipo as tipo_pregunta,
          p.puntaje as puntaje_pregunta,
          u.nombres,
          u.apellidos,
          ra.respuesta_texto,
          ro.texto as opcion_texto,
          ro.es_correcta,
          ra.puntaje_obtenido,
          ra.fecha_respuesta
        FROM respuestas_alumnos ra
        JOIN actividades a ON ra.id_actividad = a.id_actividad
        JOIN preguntas p ON ra.id_pregunta = p.id_pregunta
        JOIN matriculas m ON ra.id_matricula = m.id_matricula
        JOIN usuarios u ON m.id_usuario = u.id_usuario
        LEFT JOIN respuestas_opciones ro ON ra.id_opcion = ro.id_opcion
        WHERE a.id_seccion = ? 
          AND ra.puntaje_obtenido IS NULL
        ORDER BY a.id_actividad, u.apellidos, u.nombres
      `;

      const [respuestas] = await pool.query(query, [id_seccion]);

      return res.status(200).json({ 
        total: respuestas.length,
        respuestas: respuestas
      });

    } catch (error) {
      console.error('Error al obtener detalle de respuestas:', error);
      res.status(500).json({ 
        error: 'Error al obtener respuestas por calificar',
        details: error.message 
      });
    }
  }
}

export default EstadisticasController;
