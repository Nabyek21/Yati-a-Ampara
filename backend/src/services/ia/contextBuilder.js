/**
 * Context Builder para el Agente IA
 * Construye contexto rich con datos del estudiante, calificaciones y pesos
 */

import { pool } from '../../config/database.js';
import { CursoModel } from '../../models/CursoModel.js';
import { ActividadModel } from '../../models/ActividadModel.js';
import RespuestaAlumnoModel from '../../models/RespuestaAlumnoModel.js';

export class GradeContextBuilder {
  constructor(studentId, courseId, matriculaId = null) {
    this.studentId = studentId;
    this.courseId = courseId;
    this.matriculaId = matriculaId;
    this.cache = {};
  }

  /**
   * Construir contexto completo del estudiante
   */
  async buildFullContext() {
    try {
      const student = await this.getStudentInfo();
      const course = await this.getCourseInfo();
      const grades = await this.getStudentGrades();
      const weights = await this.getWeightsConfiguration();
      const performance = await this.analyzePerformance(grades, weights);
      const weakAreas = this.identifyWeakAreas(performance);
      const recommendations = this.generateRecommendations(performance, weakAreas);

      return {
        student,
        course,
        grades,
        weights,
        performance,
        weakAreas,
        recommendations,
        timestamp: new Date(),
      };
    } catch (error) {
      console.error('Error building context:', error);
      return null;
    }
  }

  /**
   * Obtener información del estudiante
   */
  async getStudentInfo() {
    if (this.cache.student) return this.cache.student;

    try {
      const [usuarios] = await pool.query(
        `SELECT id_usuario, nombre, apellido, email FROM usuario WHERE id_usuario = ?`,
        [this.studentId]
      );

      if (usuarios.length === 0) {
        throw new Error(`Student ${this.studentId} not found`);
      }

      const user = usuarios[0];
      this.cache.student = {
        id: user.id_usuario,
        name: `${user.nombre} ${user.apellido}`,
        email: user.email,
      };

      return this.cache.student;
    } catch (error) {
      console.error('Error getting student info:', error);
      return null;
    }
  }

  /**
   * Obtener información del curso
   */
  async getCourseInfo() {
    if (this.cache.course) return this.cache.course;

    try {
      const curso = await CursoModel.findById(this.courseId);

      if (!curso) {
        throw new Error(`Course ${this.courseId} not found`);
      }

      this.cache.course = {
        id: curso.id_curso,
        name: curso.nombre_curso,
        code: curso.codigo_curso,
        description: curso.descripcion,
        credits: curso.creditos,
      };

      return this.cache.course;
    } catch (error) {
      console.error('Error getting course info:', error);
      return null;
    }
  }

  /**
   * Obtener todas las calificaciones del estudiante en el curso
   */
  async getStudentGrades() {
    if (this.cache.grades) return this.cache.grades;

    try {
      // Obtener todas las actividades del curso
      const [actividades] = await pool.query(
        `SELECT a.id_actividad, a.nombre, a.descripcion, a.tipo, a.valor_maximo
         FROM actividad a
         JOIN seccion s ON a.id_seccion = s.id_seccion
         WHERE s.id_curso = ?
         ORDER BY a.fecha_creacion ASC`,
        [this.courseId]
      );

      const grades = [];

      // Para cada actividad, obtener la calificación del estudiante
      for (const actividad of actividades) {
        const [respuestas] = await pool.query(
          `SELECT calificacion FROM respuesta_alumno
           WHERE id_usuario = ? AND id_actividad = ?
           ORDER BY fecha_envio DESC LIMIT 1`,
          [this.studentId, actividad.id_actividad]
        );

        grades.push({
          id: actividad.id_actividad,
          name: actividad.nombre,
          type: actividad.tipo,
          maxValue: actividad.valor_maximo,
          grade: respuestas.length > 0 ? respuestas[0].calificacion : 0,
          submitted: respuestas.length > 0,
        });
      }

      this.cache.grades = grades;
      return grades;
    } catch (error) {
      console.error('Error getting student grades:', error);
      return [];
    }
  }

  /**
   * Obtener configuración de pesos del curso
   */
  async getWeightsConfiguration() {
    if (this.cache.weights) return this.cache.weights;

    try {
      const [configs] = await pool.query(
        `SELECT tipo_actividad, peso_minimo, peso_maximo, cantidad_maxima
         FROM configuracion_pesos_actividades
         WHERE id_seccion IN (
           SELECT id_seccion FROM seccion WHERE id_curso = ?
         )`,
        [this.courseId]
      );

      const weights = {};
      configs.forEach(config => {
        weights[config.tipo_actividad] = {
          min: config.peso_minimo,
          max: config.peso_maximo,
          max_quantity: config.cantidad_maxima,
        };
      });

      // Defaults si no hay configuración
      if (Object.keys(weights).length === 0) {
        weights.default = {
          pc: { weight: 30 },         // 3 PCs × 10%
          examen: { weight: 40 },     // Examen final
          tarea: { weight: 15 },      // Tareas
          evaluacion: { weight: 15 }, // Evaluaciones
        };
      }

      this.cache.weights = weights;
      return weights;
    } catch (error) {
      console.error('Error getting weights:', error);
      return {};
    }
  }

  /**
   * Analizar desempeño basado en pesos
   */
  async analyzePerformance(grades, weights) {
    const performance = {
      byType: {},
      overall: 0,
      completion: 0,
    };

    // Agrupar por tipo
    const gradesByType = {};
    grades.forEach(grade => {
      if (!gradesByType[grade.type]) {
        gradesByType[grade.type] = [];
      }
      gradesByType[grade.type].push(grade);
    });

    // Calcular promedio por tipo
    for (const [type, typeGrades] of Object.entries(gradesByType)) {
      const submitted = typeGrades.filter(g => g.submitted);
      const average =
        submitted.length > 0
          ? submitted.reduce((sum, g) => sum + g.grade, 0) / submitted.length
          : 0;

      performance.byType[type] = {
        average,
        submitted: submitted.length,
        total: typeGrades.length,
        completion: (submitted.length / typeGrades.length) * 100,
      };
    }

    // Calcular promedio ponderado (usando pesos si existen)
    let overallWeighted = 0;
    let totalWeight = 0;

    for (const [type, typeData] of Object.entries(performance.byType)) {
      const weight = weights[type]?.weight || weights[type]?.max || 0;
      overallWeighted += typeData.average * (weight / 100);
      totalWeight += weight;
    }

    performance.overall = totalWeight > 0 ? (overallWeighted / totalWeight) * 100 : 0;
    performance.completion = (grades.filter(g => g.submitted).length / grades.length) * 100;

    return performance;
  }

  /**
   * Identificar áreas débiles
   */
  identifyWeakAreas(performance) {
    const weakAreas = [];

    for (const [type, data] of Object.entries(performance.byType)) {
      if (data.average < 70) {
        weakAreas.push({
          type,
          average: data.average,
          severity: data.average < 50 ? 'critical' : data.average < 60 ? 'high' : 'medium',
          submitted: data.submitted,
          total: data.total,
        });
      }
    }

    // Ordenar por severidad
    weakAreas.sort((a, b) => {
      const severityOrder = { critical: 0, high: 1, medium: 2 };
      return severityOrder[a.severity] - severityOrder[b.severity];
    });

    return weakAreas;
  }

  /**
   * Generar recomendaciones personalizadas
   */
  generateRecommendations(performance, weakAreas) {
    const recommendations = [];

    // 1. Completar actividades faltantes
    const incompleteTypes = Object.entries(performance.byType)
      .filter(([_, data]) => data.completion < 100)
      .map(([type, _]) => type);

    if (incompleteTypes.length > 0) {
      recommendations.push({
        priority: 'high',
        action: 'COMPLETE_MISSING',
        message: `Completa las actividades faltantes: ${incompleteTypes.join(', ')}`,
        impact: 'Aumentará tu promedio inmediatamente',
      });
    }

    // 2. Mejorar áreas débiles
    weakAreas.forEach(area => {
      const deficit = 100 - area.average;
      recommendations.push({
        priority: area.severity === 'critical' ? 'urgent' : 'high',
        action: 'IMPROVE_WEAK_AREA',
        type: area.type,
        message: `Mejora en ${area.type}: promedio actual ${area.average.toFixed(1)}%`,
        target: 70,
        deficit: deficit.toFixed(1),
      });
    });

    // 3. Mantener fortalezas
    const strongTypes = Object.entries(performance.byType)
      .filter(([_, data]) => data.average >= 80)
      .map(([type, _]) => type);

    if (strongTypes.length > 0) {
      recommendations.push({
        priority: 'medium',
        action: 'MAINTAIN_STRENGTH',
        message: `Mantén tu desempeño en: ${strongTypes.join(', ')}`,
      });
    }

    // 4. Proyección de calificación final
    recommendations.push({
      priority: 'info',
      action: 'PROJECTION',
      current: performance.overall,
      projected: this.projectFinalGrade(performance),
    });

    return recommendations;
  }

  /**
   * Proyectar calificación final
   */
  projectFinalGrade(performance) {
    // Asumir que el estudiante mantiene su desempeño actual
    // o mejorar ligeramente si hay áreas débiles
    const improvement = 0.1; // 10% de mejora esperada
    const projected = performance.overall * (1 + improvement);
    return Math.min(projected, 100);
  }

  /**
   * Obtener contexto para prompt del chat
   */
  async getChatContext() {
    const fullContext = await this.buildFullContext();

    if (!fullContext) return null;

    const weakAreasText =
      fullContext.weakAreas.length > 0
        ? fullContext.weakAreas.map(w => `${w.type} (${w.average.toFixed(1)}%)`).join(', ')
        : 'Ninguna';

    const recsText = fullContext.recommendations
      .filter(r => r.priority === 'high' || r.priority === 'urgent')
      .map(r => `- ${r.message}`)
      .join('\n');

    return {
      student: fullContext.student,
      course: fullContext.course,
      currentGrade: fullContext.performance.overall.toFixed(1),
      completion: fullContext.performance.completion.toFixed(0),
      weakAreas: weakAreasText,
      recommendations: recsText,
      summary: `Eres estudiante de ${fullContext.course.name}. Tu promedio es ${fullContext.performance.overall.toFixed(1)}%. Áreas a mejorar: ${weakAreasText}.`,
    };
  }
}

export default GradeContextBuilder;
