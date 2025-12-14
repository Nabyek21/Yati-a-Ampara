import { pool } from '../config/database.js';

/**
 * Obtener configuración de ponderación de una sección
 * Si no existe, retorna valores por defecto
 */
async function obtenerPonderacionesSeccion(id_seccion) {
  try {
    const [ponderaciones] = await pool.query(
      `SELECT tipo_evaluacion, peso_porcentaje
       FROM ponderaciones
       WHERE id_seccion = ? AND activo = TRUE`,
      [id_seccion]
    );

    if (!ponderaciones || ponderaciones.length === 0) {
      // Valores por defecto
      return {
        'práctica': 10,
        'examen': 30,
        'examen_final': 40
      };
    }

    // Convertir array a objeto
    const pesos = {};
    ponderaciones.forEach(p => {
      pesos[p.tipo_evaluacion] = parseFloat(p.peso_porcentaje);
    });

    return pesos;
  } catch (error) {
    console.error('Error obteniendo ponderaciones:', error);
    // Si hay error, retornar valores por defecto
    return {
      'práctica': 10,
      'examen': 30,
      'examen_final': 40
    };
  }
}

/**
 * Calcular promedio ponderado según tipos de actividad y configuración de la sección
 * - Prácticas Calificadas (PC): peso configurable (por defecto 10% cada una, máx 3 = 30% total)
 * - Examen Final (EF): peso configurable (por defecto 40%)
 * - Exámenes normales: peso configurable (por defecto 30% conjunto)
 */
function calcularPromedioPonderado(respuestas, pesos = null) {
  if (!respuestas || respuestas.length === 0) return 0;

  // Usar valores por defecto si no se especifican pesos
  if (!pesos) {
    pesos = {
      'práctica': 10,
      'examen': 30,
      'examen_final': 40
    };
  }

  const actividades = {
    practicas: [],      // Prácticas Calificadas
    examenFinal: null,  // Examen Final
    examenes: [],       // Exámenes normales
    otras: []           // Otras actividades
  };

  // Clasificar respuestas por tipo
  respuestas.forEach(resp => {
    const tipo = (resp.tipo || '').toLowerCase().trim();
    const puntaje = parseFloat(resp.puntaje_obtenido) || 0;
    const maximo = parseFloat(resp.puntaje_max) || 20; // Por defecto 20
    const porcentaje = (puntaje / maximo) * 20; // Escala a 20 puntos

    if (tipo.includes('pc') || tipo.includes('práctica')) {
      actividades.practicas.push(porcentaje);
    } else if (tipo.includes('final') || tipo.includes('examen final')) {
      actividades.examenFinal = porcentaje;
    } else if (tipo.includes('examen')) {
      actividades.examenes.push(porcentaje);
    } else {
      actividades.otras.push(porcentaje);
    }
  });

  let promedioPonderado = 0;
  const pesoPractica = pesos['práctica'] || 10;
  const pesoExamen = pesos['examen'] || 30;
  const pesoExamenFinal = pesos['examen_final'] || 40;

  // Prácticas: peso configurable cada una (máximo 3)
  if (actividades.practicas.length > 0) {
    const practicasPromedio = actividades.practicas.slice(0, 3)
      .reduce((a, b) => a + b, 0) / Math.min(3, actividades.practicas.length);
    const pcCount = Math.min(3, actividades.practicas.length);
    // Distribuir el peso entre las prácticas (ej: si peso=30 y hay 3, cada una vale 10%)
    const pesoUnitario = pesoPractica / 3;
    promedioPonderado += (practicasPromedio * pcCount * pesoUnitario / 100);
  }

  // Examen Final: peso configurable
  if (actividades.examenFinal !== null) {
    promedioPonderado += actividades.examenFinal * (pesoExamenFinal / 100);
  }

  // Exámenes normales: peso configurable
  if (actividades.examenes.length > 0) {
    const examenesPromedio = actividades.examenes.reduce((a, b) => a + b, 0) / actividades.examenes.length;
    promedioPonderado += examenesPromedio * (pesoExamen / 100);
  }

  return parseFloat(promedioPonderado.toFixed(2));
}

export class SeccionEstadisticasModel {
  // Obtiene métricas para todos los alumnos de una sección
  static async getEstadisticasPorSeccion(id_seccion) {
    try {
      // 0. Obtener configuración de ponderación de la sección
      const pesos = await obtenerPonderacionesSeccion(id_seccion);
      console.log(`📊 Usando pesos para sección ${id_seccion}:`, pesos);

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
        // Obtener TODAS las respuestas con tipo de actividad para cálculo ponderado
        const [respuestasDetalladas] = await pool.query(
          `SELECT ra.puntaje_obtenido, a.tipo, a.puntaje_max
           FROM respuestas_alumnos ra
           JOIN actividades a ON ra.id_actividad = a.id_actividad
           WHERE ra.id_matricula = ? AND ra.puntaje_obtenido IS NOT NULL`,
          [m.id_matricula]
        );

        // Calcular promedio ponderado usando pesos de la sección
        const promedio = calcularPromedioPonderado(respuestasDetalladas, pesos);

        // Exámenes aprobados
        const [examenes] = await pool.query(
          `SELECT COUNT(DISTINCT ra.id_actividad) as total, SUM(CASE WHEN ra.puntaje_obtenido >= 12 THEN 1 ELSE 0 END) as aprobados
           FROM respuestas_alumnos ra
           JOIN actividades a ON ra.id_actividad = a.id_actividad
           WHERE ra.id_matricula = ? AND a.tipo = 'examen'`,
          [m.id_matricula]
        );

        // Tareas enviadas
        const [tareas] = await pool.query(
          `SELECT COUNT(DISTINCT ra.id_actividad) as enviadas
           FROM respuestas_alumnos ra
           JOIN actividades a ON ra.id_actividad = a.id_actividad
           WHERE ra.id_matricula = ? AND a.tipo = 'tarea'`,
          [m.id_matricula]
        );

        // Progreso general (basado en promedio de notas como porcentaje)
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
          nota_final: promedio > 0 ? parseFloat(promedio.toFixed(2)) : null,
          promedio_actividades: promedio > 0 ? parseFloat(promedio.toFixed(2)) : null,
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
