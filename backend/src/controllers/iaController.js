import {
  resumirContenidoCurso,
  resumirActividades,
  generarPreguntasEstudio,
  analizarDesempenoEstudiante,
  chatContenido,
  resumirModulo,
  generarPlanEstudio,
  responderPreguntaContenido,
  generarGuiaEstudio
} from '../services/iaService.js';
import { ModuloContenidoModel } from '../models/ModuloContenidoModel.js';
import { ActividadModel } from '../models/ActividadModel.js';
import RespuestaAlumnoModel from '../models/RespuestaAlumnoModel.js';
import { CursoModel } from '../models/CursoModel.js';
import { pool } from '../config/database.js';

/**
 * Generar resumen automático de contenido del curso
 * GET /api/ia/resumir-curso/:id_curso
 */
export const resumirCurso = async (req, res) => {
  try {
    const { id_curso } = req.params;
    const { id_seccion } = req.query;

    if (!id_curso) {
      return res.status(400).json({ message: 'Se requiere id_curso' });
    }

    // Obtener información del curso
    const cursos = await CursoModel.findAll();
    const curso = cursos.find(c => c.id_curso === parseInt(id_curso));

    if (!curso) {
      return res.status(404).json({ message: 'Curso no encontrado' });
    }

    // Obtener contenidos del curso
    let contenidos = [];
    if (id_seccion) {
      contenidos = await ModuloContenidoModel.getBySeccion(parseInt(id_seccion));
    } else {
      // Obtener contenidos de todas las secciones del curso
      
      const [rows] = await pool.query(`
        SELECT DISTINCT mc.*
        FROM modulo_contenido mc
        JOIN modulo m ON mc.id_modulo = m.id_modulo
        JOIN seccion s ON mc.id_seccion = s.id_seccion
        WHERE s.id_curso = ?
        ORDER BY m.orden, mc.orden
      `, [id_curso]);
      contenidos = rows;
    }

    if (contenidos.length === 0) {
      return res.status(400).json({
        message: 'No hay contenido disponible para resumir',
        resumen: {
          resumen: 'El curso aún no tiene contenido registrado',
          temas_principales: [],
          objetivos_aprendizaje: [],
          habilidades_desarrolladas: []
        }
      });
    }

    // Generar resumen usando IA
    const resumen = await resumirContenidoCurso(contenidos, {
      nombre: curso.nombre,
      descripcion: curso.descripcion,
      semanas: curso.semanas_duracion
    });

    res.json({
      message: 'Resumen generado exitosamente',
      id_curso,
      id_seccion: id_seccion || 'todas',
      cantidad_contenidos: contenidos.length,
      resumen
    });
  } catch (error) {
    console.error('Error al resumir curso:', error);
    res.status(500).json({
      message: 'Error al generar resumen',
      error: error.message
    });
  }
};

/**
 * Generar resumen de actividades
 * GET /api/ia/resumir-actividades/:id_curso
 */
export const resumirActividadesCurso = async (req, res) => {
  try {
    const { id_curso } = req.params;
    const { id_seccion } = req.query;

    if (!id_curso) {
      return res.status(400).json({ message: 'Se requiere id_curso' });
    }

    // Obtener actividades del curso
    
    let query = `
      SELECT a.*
      FROM actividad a
      JOIN modulo m ON a.id_modulo = m.id_modulo
      JOIN seccion s ON a.id_seccion = s.id_seccion
      WHERE s.id_curso = ?
    `;
    const params = [id_curso];

    if (id_seccion) {
      query += ' AND a.id_seccion = ?';
      params.push(parseInt(id_seccion));
    }

    const [actividades] = await pool.query(query, params);

    if (actividades.length === 0) {
      return res.json({
        message: 'No hay actividades registradas',
        id_curso,
        resumen: {
          resumenGeneral: 'No hay actividades de aprendizaje registradas en este curso',
          actividadesKey: [],
          sugerencias: []
        }
      });
    }

    // Obtener preguntas asociadas
    const preguntasMap = {};
    for (const actividad of actividades) {
      const [preguntas] = await pool.query(
        'SELECT * FROM pregunta WHERE id_actividad = ?',
        [actividad.id_actividad]
      );
      preguntasMap[actividad.id_actividad] = preguntas;
    }

    // Generar resumen
    const resumen = await resumirActividades(actividades, 
      actividades.flatMap(a => preguntasMap[a.id_actividad] || [])
    );

    res.json({
      message: 'Resumen de actividades generado',
      id_curso,
      cantidad_actividades: actividades.length,
      resumen
    });
  } catch (error) {
    console.error('Error al resumir actividades:', error);
    res.status(500).json({
      message: 'Error al generar resumen de actividades',
      error: error.message
    });
  }
};

/**
 * Generar preguntas de estudio automáticamente
 * POST /api/ia/generar-preguntas
 * Body: { id_curso, id_seccion?, cantidad: 5 }
 */
export const generarPreguntasAutomaticas = async (req, res) => {
  try {
    const { id_curso, id_seccion, cantidad = 5 } = req.body;

    if (!id_curso) {
      return res.status(400).json({ message: 'Se requiere id_curso' });
    }

    // Obtener contenidos
    
    let query = `
      SELECT mc.*
      FROM modulo_contenido mc
      JOIN modulo m ON mc.id_modulo = m.id_modulo
      JOIN seccion s ON mc.id_seccion = s.id_seccion
      WHERE s.id_curso = ? AND mc.tipo IN ('texto', 'pdf')
    `;
    const params = [id_curso];

    if (id_seccion) {
      query += ' AND mc.id_seccion = ?';
      params.push(parseInt(id_seccion));
    }

    const [contenidos] = await pool.query(query, params);

    if (contenidos.length === 0) {
      return res.status(400).json({
        message: 'No hay contenido de texto disponible para generar preguntas'
      });
    }

    const preguntas = await generarPreguntasEstudio(contenidos, parseInt(cantidad));

    res.json({
      message: 'Preguntas generadas exitosamente',
      cantidad_generadas: preguntas.preguntas?.length || 0,
      preguntas
    });
  } catch (error) {
    console.error('Error al generar preguntas:', error);
    res.status(500).json({
      message: 'Error al generar preguntas',
      error: error.message
    });
  }
};

/**
 * Analizar desempeño del estudiante
 * GET /api/ia/analizar-desempeño/:id_estudiante/:id_curso
 */
export const analizarDesempenoEstudianteCurso = async (req, res) => {
  try {
    const { id_estudiante, id_curso } = req.params;

    if (!id_estudiante || !id_curso) {
      return res.status(400).json({
        message: 'Se requieren id_estudiante e id_curso'
      });
    }

    

    // Obtener respuestas del estudiante en el curso
    const [respuestas] = await pool.query(`
      SELECT ra.*, a.titulo as pregunta, ra.puntuacion
      FROM respuesta_alumno ra
      JOIN pregunta p ON ra.id_pregunta = p.id_pregunta
      JOIN actividad a ON p.id_actividad = a.id_actividad
      JOIN modulo m ON a.id_modulo = m.id_modulo
      JOIN seccion s ON a.id_seccion = s.id_seccion
      WHERE s.id_curso = ? AND ra.id_usuario = ?
      ORDER BY ra.fecha_creacion DESC
    `, [id_curso, id_estudiante]);

    if (respuestas.length === 0) {
      return res.json({
        message: 'El estudiante aún no tiene respuestas registradas',
        id_estudiante,
        id_curso,
        analisis: {
          promedioGeneral: 0,
          fortalezas: [],
          areasDesarrollo: [],
          recomendaciones: ['Comenzar a completar actividades del curso']
        }
      });
    }

    // Obtener contenidos del curso para contexto
    const [contenidos] = await pool.query(`
      SELECT DISTINCT mc.*
      FROM modulo_contenido mc
      JOIN modulo m ON mc.id_modulo = m.id_modulo
      JOIN seccion s ON mc.id_seccion = s.id_seccion
      WHERE s.id_curso = ?
      LIMIT 10
    `, [id_curso]);

    // Generar análisis
    const analisis = await analizarDesempenoEstudiante(respuestas, contenidos);

    res.json({
      message: 'Análisis de desempeño generado',
      id_estudiante,
      id_curso,
      respuestas_totales: respuestas.length,
      analisis
    });
  } catch (error) {
    console.error('Error al analizar desempeño:', error);
    res.status(500).json({
      message: 'Error al analizar desempeño',
      error: error.message
    });
  }
};

/**
 * Obtener recomendaciones personalizadas para un estudiante
 * GET /api/ia/recomendaciones/:id_estudiante/:id_curso
 */
export const obtenerRecomendacionesEstudiante = async (req, res) => {
  try {
    const { id_estudiante, id_curso } = req.params;

    // Obtener análisis de desempeño
    
    
    const [respuestas] = await pool.query(`
      SELECT ra.puntuacion, p.id_actividad
      FROM respuesta_alumno ra
      JOIN pregunta p ON ra.id_pregunta = p.id_pregunta
      WHERE ra.id_usuario = ? 
      AND p.id_actividad IN (
        SELECT id_actividad FROM actividad 
        WHERE id_seccion IN (
          SELECT id_seccion FROM seccion WHERE id_curso = ?
        )
      )
    `, [id_estudiante, id_curso]);

    const promedio = respuestas.length > 0 
      ? respuestas.reduce((sum, r) => sum + r.puntuacion, 0) / respuestas.length
      : 0;

    const recomendaciones = [];

    if (promedio >= 90) {
      recomendaciones.push('¡Excelente desempeño! Considera asumir un rol de tutor para otros estudiantes');
      recomendaciones.push('Desafíate con contenido avanzado o certificaciones adicionales');
    } else if (promedio >= 75) {
      recomendaciones.push('Buen progreso. Sigue estudiando y reforzando los conceptos clave');
      recomendaciones.push('Participa en discusiones del curso para profundizar comprensión');
    } else if (promedio >= 60) {
      recomendaciones.push('Necesitas dedicar más tiempo al estudio de los temas');
      recomendaciones.push('Solicita ayuda al docente en los temas donde tienes dificultad');
      recomendaciones.push('Revisa nuevamente el material de estudio');
    } else {
      recomendaciones.push('Se recomienda que contactes al docente de inmediato');
      recomendaciones.push('Utiliza recursos adicionales de apoyo disponibles');
      recomendaciones.push('Forma grupos de estudio con compañeros');
    }

    res.json({
      message: 'Recomendaciones personalizadas generadas',
      id_estudiante,
      id_curso,
      promedioGeneral: Math.round(promedio),
      recomendaciones
    });
  } catch (error) {
    console.error('Error al generar recomendaciones:', error);
    res.status(500).json({
      message: 'Error al generar recomendaciones',
      error: error.message
    });
  }
};

/**
 * Generar reporte completo de análisis de curso
 * GET /api/ia/reporte-curso/:id_curso
 */
export const generarReporteCurso = async (req, res) => {
  try {
    const { id_curso } = req.params;
    const { id_seccion } = req.query;

    const resumenContenido = await resumirCurso(
      { params: { id_curso }, query: { id_seccion } },
      res
    );

    const resumenActividades = await resumirActividadesCurso(
      { params: { id_curso }, query: { id_seccion } },
      res
    );

    res.json({
      message: 'Reporte completo del curso generado',
      id_curso,
      timestamp: new Date().toISOString(),
      incluye: ['contenido', 'actividades', 'métricas'],
      data: {
        contenido: resumenContenido,
        actividades: resumenActividades
      }
    });
  } catch (error) {
    console.error('Error al generar reporte:', error);
    res.status(500).json({
      message: 'Error al generar reporte',
      error: error.message
    });
  }
};

/**
 * Chat interactivo con IA sobre contenido
 * POST /api/ia/chat
 * Body: { sessionId, mensaje, id_modulo?, id_seccion?, id_curso }
 */
export const chatConIA = async (req, res) => {
  try {
    const { sessionId, mensaje, id_modulo, id_seccion, id_curso } = req.body;
    const id_usuario = req.user?.id_usuario;

    if (!sessionId || !mensaje) {
      return res.status(400).json({
        message: 'Se requieren sessionId y mensaje'
      });
    }

    // ✅ DETECTAR SI ES UNA SOLICITUD DE RESUMEN
    const esResumen = /resumen\s+del?\s+m[oó]dulo\s+(\d+)/i.test(mensaje);
    
    if (esResumen) {
      // Extraer el ID del módulo del mensaje
      const match = mensaje.match(/resumen\s+del?\s+m[oó]dulo\s+(\d+)/i);
      const moduloIdFromMsg = match ? parseInt(match[1]) : id_modulo;

      console.log(`📚 Detectado resumen de módulo #${moduloIdFromMsg}`);

      // Si no hay id_curso en el body, devolver error
      if (!id_curso) {
        return res.status(400).json({
          success: false,
          message: 'Se requiere id_curso para generar resumen'
        });
      }

      // Importar el servicio de resumen
      const ModuleSummaryService = (await import('../services/moduleSummaryService.js')).default;
      const summaryService = new ModuleSummaryService(process.env.IA_API_KEY);

      // Generar resumen del módulo
      const result = await summaryService.generateModuleSummary(
        moduloIdFromMsg,
        parseInt(id_curso),
        id_usuario
      );

      if (!result.success) {
        return res.status(400).json({
          success: false,
          message: result.error || 'No se pudo generar el resumen'
        });
      }

      // Generar audio del resumen
      let audioUrl = null;
      try {
        const textContent = summaryService.convertStructuredToText(result.summary.contenido);
        const audioResult = await summaryService.generateAudio(textContent);
        
        if (audioResult && audioResult.success) {
          audioUrl = audioResult.url;
          console.log('🔊 Audio generado:', audioUrl);
        }
      } catch (audioError) {
        console.warn('⚠️ Advertencia al generar audio:', audioError.message);
        // Continuar sin audio si falla
      }

      return res.json({
        success: true,
        resumen: result.summary,
        audioUrl: audioUrl,
        modulo: result.moduleInfo,
        message: '✅ Resumen generado correctamente'
      });
    }

    // ✅ SI NO ES RESUMEN, USAR CHAT NORMAL CON CONTENIDO
    // Obtener contenido relevante (simplificado para evitar errores de tablas)
    let contenidos = [];
    try {
      let query = `SELECT * FROM modulo_contenido`;
      const params = [];

      if (id_seccion) {
        query += ` WHERE id_seccion = ?`;
        params.push(id_seccion);
      }

      query += ` LIMIT 10`;
      const [rows] = await pool.query(query, params);
      contenidos = rows || [];
    } catch (dbError) {
      console.error('Error al obtener contenidos:', dbError.message);
      // Continuar sin contenidos si hay error en BD
      contenidos = [];
    }

    // Obtener módulo actual si existe
    let moduloActual = null;
    if (id_modulo) {
      try {
        const [modulos] = await pool.query(
          'SELECT * FROM modulos WHERE id_modulo = ?',
          [id_modulo]
        );
        moduloActual = modulos?.[0];
      } catch (dbError) {
        console.error('Error al obtener módulo:', dbError.message);
      }
    }

    // Generar respuesta con AmparIA
    const respuesta = await chatContenido(
      sessionId,
      mensaje,
      contenidos,
      { 
        moduloActual,
        id_seccion: id_seccion,
        id_curso: id_curso
      }
    );

    res.json({
      message: 'Respuesta generada',
      sessionId,
      ...respuesta
    });
  } catch (error) {
    console.error('Error en chat IA:', error);
    res.status(500).json({
      message: 'Error al procesar la pregunta',
      error: error.message
    });
  }
};

/**
 * Resumir un módulo específico
 * GET /api/ia/resumir-modulo/:id_modulo
 */
export const resumirModuloEndpoint = async (req, res) => {
  try {
    const { id_modulo } = req.params;

    if (!id_modulo) {
      return res.status(400).json({ message: 'Se requiere id_modulo' });
    }

    

    // Obtener módulo
    const [modulos] = await pool.query(
      'SELECT * FROM modulos WHERE id_modulo = ?',
      [id_modulo]
    );

    if (modulos.length === 0) {
      return res.status(404).json({ message: 'Módulo no encontrado' });
    }

    const modulo = modulos[0];

    // Obtener contenido del módulo
    const [contenidos] = await pool.query(
      'SELECT * FROM modulo_contenido WHERE id_modulo = ? ORDER BY orden',
      [id_modulo]
    );

    const resumen = await resumirModulo(modulo, contenidos);

    res.json({
      message: 'Resumen del módulo generado',
      id_modulo,
      resumen
    });
  } catch (error) {
    console.error('Error resumiendo módulo:', error);
    res.status(500).json({
      message: 'Error al resumir módulo',
      error: error.message
    });
  }
};

/**
 * Generar plan de estudio personalizado
 * POST /api/ia/plan-estudio
 * Body: { id_estudiante, id_curso }
 */
export const generarPlanEstudioEndpoint = async (req, res) => {
  try {
    const { id_estudiante, id_curso } = req.body;

    if (!id_estudiante || !id_curso) {
      return res.status(400).json({
        message: 'Se requieren id_estudiante e id_curso'
      });
    }

    

    // Obtener información del estudiante
    const [usuarios] = await pool.query(
      'SELECT * FROM usuario WHERE id_usuario = ?',
      [id_estudiante]
    );

    if (usuarios.length === 0) {
      return res.status(404).json({ message: 'Estudiante no encontrado' });
    }

    const usuario = usuarios[0];

    // Obtener módulos del curso
    const [modulos] = await pool.query(`
      SELECT m.*
      FROM modulo m
      JOIN seccion s ON m.id_modulo = m.id_modulo
      WHERE s.id_curso = ?
      ORDER BY m.orden
    `, [id_curso]);

    // Calcular rendimiento
    const [respuestas] = await pool.query(`
      SELECT ra.puntuacion
      FROM respuesta_alumno ra
      JOIN pregunta p ON ra.id_pregunta = p.id_pregunta
      JOIN actividad a ON p.id_actividad = a.id_actividad
      WHERE a.id_seccion IN (
        SELECT id_seccion FROM seccion WHERE id_curso = ?
      ) AND ra.id_usuario = ?
    `, [id_curso, id_estudiante]);

    const promedio = respuestas.length > 0
      ? respuestas.reduce((sum, r) => sum + (r.puntuacion || 0), 0) / respuestas.length
      : 0;

    const rendimiento = {
      promedio: Math.round(promedio),
      fortalezas: promedio >= 75 ? ['Comprensión general', 'Participación'] : [],
      debilidades: promedio < 60 ? ['Revisión recomendada', 'Refuerzo necesario'] : []
    };

    const plan = await generarPlanEstudio(usuario, modulos, rendimiento);

    res.json({
      message: 'Plan de estudio generado',
      id_estudiante,
      id_curso,
      plan
    });
  } catch (error) {
    console.error('Error generando plan:', error);
    res.status(500).json({
      message: 'Error al generar plan de estudio',
      error: error.message
    });
  }
};

/**
 * Responder pregunta sobre contenido
 * POST /api/ia/responder-pregunta
 * Body: { pregunta, id_modulo?, id_seccion?, id_curso? }
 */
export const responderPreguntaEndpoint = async (req, res) => {
  try {
    const { pregunta, id_modulo, id_seccion, id_curso } = req.body;

    if (!pregunta) {
      return res.status(400).json({ message: 'Se requiere la pregunta' });
    }

    

    // Obtener contenido relevante
    let query = `SELECT DISTINCT mc.* FROM modulo_contenido mc JOIN modulo m ON mc.id_modulo = m.id_modulo`;
    const params = [];

    if (id_curso) {
      query += ` JOIN seccion s ON mc.id_seccion = s.id_seccion WHERE s.id_curso = ?`;
      params.push(id_curso);
    } else if (id_seccion) {
      query += ` WHERE mc.id_seccion = ?`;
      params.push(id_seccion);
    } else if (id_modulo) {
      query += ` WHERE mc.id_modulo = ?`;
      params.push(id_modulo);
    }

    query += ` LIMIT 15`;
    const [contenidos] = await pool.query(query, params);

    // Obtener módulo para contexto
    let moduloContexto = null;
    if (id_modulo) {
      const [modulos] = await pool.query(
        'SELECT * FROM modulo WHERE id_modulo = ?',
        [id_modulo]
      );
      moduloContexto = modulos[0];
    }

    const respuesta = await responderPreguntaContenido(
      pregunta,
      contenidos,
      moduloContexto
    );

    res.json({
      message: 'Respuesta generada',
      pregunta,
      respuesta
    });
  } catch (error) {
    console.error('Error respondiendo pregunta:', error);
    res.status(500).json({
      message: 'Error al responder pregunta',
      error: error.message
    });
  }
};

/**
 * Generar guía de estudio interactiva
 * GET /api/ia/guia-estudio/:tema
 * Query: { id_modulo?, id_seccion?, profundidad? }
 */
export const generarGuiaEstudioEndpoint = async (req, res) => {
  try {
    const { tema } = req.params;
    const { id_modulo, id_seccion, profundidad = 'intermedia' } = req.query;

    if (!tema) {
      return res.status(400).json({ message: 'Se requiere el tema' });
    }

    

    // Obtener contenido
    let query = `SELECT * FROM modulo_contenido WHERE 1=1`;
    const params = [];

    if (id_modulo) {
      query += ` AND id_modulo = ?`;
      params.push(id_modulo);
    }

    if (id_seccion) {
      query += ` AND id_seccion = ?`;
      params.push(id_seccion);
    }

    query += ` LIMIT 10`;
    const [contenidos] = await pool.query(query, params);

    if (contenidos.length === 0) {
      return res.status(400).json({
        message: 'No hay contenido disponible para esta guía'
      });
    }

    const guia = await generarGuiaEstudio(tema, contenidos, profundidad);

    res.json({
      message: 'Guía de estudio generada',
      tema,
      profundidad,
      guia
    });
  } catch (error) {
    console.error('Error generando guía:', error);
    res.status(500).json({
      message: 'Error al generar guía de estudio',
      error: error.message
    });
  }
};

export default {
  resumirCurso,
  resumirActividadesCurso,
  generarPreguntasAutomaticas,
  analizarDesempenoEstudianteCurso,
  obtenerRecomendacionesEstudiante,
  generarReporteCurso,
  chatConIA,
  resumirModuloEndpoint,
  generarPlanEstudioEndpoint,
  responderPreguntaEndpoint,
  generarGuiaEstudioEndpoint
};
