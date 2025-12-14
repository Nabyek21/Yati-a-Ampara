/**
 * Controller para Resumen de Módulos
 * Maneja solicitudes de resumen estructurado y generación de audio
 */

import ModuleSummaryService from '../services/moduleSummaryService.js';

const summaryService = new ModuleSummaryService(process.env.IA_API_KEY);

/**
 * GET /api/modulos/:id_modulo/resumen
 * Generar resumen estructurado de un módulo
 */
export const getModuleSummary = async (req, res) => {
  try {
    const { id_modulo } = req.params;
    const { id_curso } = req.query;
    const id_usuario = req.user?.id_usuario; // Del middleware de autenticación

    if (!id_modulo || !id_curso) {
      return res.status(400).json({
        success: false,
        message: 'Se requieren id_modulo e id_curso',
      });
    }

    const result = await summaryService.generateModuleSummary(
      parseInt(id_modulo),
      parseInt(id_curso),
      id_usuario
    );

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: result.error,
      });
    }

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Error in getModuleSummary:', error);
    res.status(500).json({
      success: false,
      message: 'Error al generar resumen',
      error: error.message,
    });
  }
};

/**
 * POST /api/modulos/:id_modulo/resumen-audio
 * Generar resumen y convertir a audio
 */
export const getModuleSummaryWithAudio = async (req, res) => {
  try {
    const { id_modulo } = req.params;
    const { id_curso, incluirAudio = true } = req.body;
    const id_usuario = req.user?.id_usuario;

    if (!id_modulo || !id_curso) {
      return res.status(400).json({
        success: false,
        message: 'Se requieren id_modulo e id_curso',
      });
    }

    // 1. Generar resumen
    const summaryResult = await summaryService.generateModuleSummary(
      parseInt(id_modulo),
      parseInt(id_curso),
      id_usuario
    );

    if (!summaryResult.success) {
      return res.status(500).json({
        success: false,
        message: summaryResult.error,
      });
    }

    let audioData = null;

    // 2. Generar audio si se solicita
    if (incluirAudio) {
      // Convertir el resumen a texto plano para el audio
      const textForAudio = summaryResult.summary.tipo === 'estructurado'
        ? generateTextFromStructured(summaryResult.summary.contenido)
        : summaryResult.summary.contenido;

      audioData = await summaryService.generateAudio(textForAudio);
    }

    res.json({
      success: true,
      data: {
        ...summaryResult,
        audio: audioData,
      },
    });
  } catch (error) {
    console.error('Error in getModuleSummaryWithAudio:', error);
    res.status(500).json({
      success: false,
      message: 'Error al generar resumen con audio',
      error: error.message,
    });
  }
};

/**
 * POST /api/modulos/resumen-chat
 * Chat interactivo para resúmenes de módulos
 * Permite al estudiante pedir resúmenes de módulos específicos
 */
export const resumeModuleChat = async (req, res) => {
  try {
    const { mensaje, id_curso, id_modulo } = req.body;
    const id_usuario = req.user?.id_usuario;

    if (!mensaje || !id_curso) {
      return res.status(400).json({
        success: false,
        message: 'Se requieren mensaje e id_curso',
      });
    }

    // Si se especifica un módulo, generar resumen de ese módulo
    if (id_modulo) {
      const result = await summaryService.generateModuleSummary(
        parseInt(id_modulo),
        parseInt(id_curso),
        id_usuario
      );

      if (!result.success) {
        return res.status(500).json({
          success: false,
          message: result.error,
        });
      }

      // Generar audio del resumen
      let audioUrl = null;
      try {
        const textContent = summaryService.convertStructuredToText(result.summary.contenido);
        const audioResult = await summaryService.generateAudio(textContent);
        
        if (audioResult.success) {
          audioUrl = audioResult.url;
        }
      } catch (audioError) {
        console.warn('Audio generation warning:', audioError.message);
        // No fallar si el audio falla, solo continuar sin audio
      }

      return res.json({
        success: true,
        resumen: result.summary,
        audioUrl: audioUrl,
        modulo: result.moduleInfo,
        message: '✅ Resumen generado correctamente',
      });
    }

    // Si no se especifica módulo, buscar módulos del curso
    res.status(400).json({
      success: false,
      message: 'Por favor especifica el id_modulo para el cual deseas un resumen',
    });
  } catch (error) {
    console.error('Error in resumeModuleChat:', error);
    res.status(500).json({
      success: false,
      message: 'Error al procesar resumen',
      error: error.message,
    });
  }
};

/**
 * GET /api/modulos/:id_modulo/descargar-audio-resumen
 * Descargar audio del resumen del módulo
 */
export const downloadModuleSummaryAudio = async (req, res) => {
  try {
    const { id_modulo } = req.params;
    const { id_curso } = req.query;
    const id_usuario = req.user?.id_usuario;

    if (!id_modulo || !id_curso) {
      return res.status(400).json({
        success: false,
        message: 'Se requieren id_modulo e id_curso',
      });
    }

    // Generar resumen
    const summaryResult = await summaryService.generateModuleSummary(
      parseInt(id_modulo),
      parseInt(id_curso),
      id_usuario
    );

    if (!summaryResult.success) {
      return res.status(500).json({
        success: false,
        message: summaryResult.error,
      });
    }

    // Generar audio
    const textForAudio = summaryResult.summary.tipo === 'estructurado'
      ? generateTextFromStructured(summaryResult.summary.contenido)
      : summaryResult.summary.contenido;

    const audioResult = await summaryService.generateAudio(textForAudio);

    if (!audioResult.success) {
      return res.status(500).json({
        success: false,
        message: 'Error al generar audio',
      });
    }

    // Descargar el archivo
    res.download(
      audioResult.audioPath,
      `resumen_modulo_${id_modulo}.mp3`,
      (err) => {
        if (err) {
          console.error('Error downloading file:', err);
        }
      }
    );
  } catch (error) {
    console.error('Error in downloadModuleSummaryAudio:', error);
    res.status(500).json({
      success: false,
      message: 'Error al descargar audio',
      error: error.message,
    });
  }
};

/**
 * Función auxiliar: Convertir resumen estructurado a texto plano
 */
function generateTextFromStructured(contenido) {
  let text = `Resumen del Módulo\n\n`;

  text += `Resumen Ejecutivo:\n${contenido.resumenEjecutivo}\n\n`;

  text += `Conceptos Clave:\n${contenido.conceptosClave?.join(', ') || 'N/A'}\n\n`;

  text += `Temas Principales:\n`;
  contenido.temasPrincipales?.forEach(tema => {
    text += `${tema.tema}. ${tema.explicacion}. Puntos importantes: ${tema.puntosImportantes?.join(', ')}\n`;
  });
  text += '\n';

  text += `Aplicaciones Prácticas:\n${contenido.aplicacionesPracticas?.join('. ') || 'N/A'}\n\n`;

  text += `Términos Clave:\n`;
  Object.entries(contenido.terminosClave || {}).forEach(([termino, def]) => {
    text += `${termino}: ${def}\n`;
  });
  text += '\n';

  text += `Recomendaciones de Estudio:\n${contenido.recomendacionesEstudio?.join('. ') || 'N/A'}`;

  return text;
}

export default {
  getModuleSummary,
  getModuleSummaryWithAudio,
  resumeModuleChat,
  downloadModuleSummaryAudio,
};
