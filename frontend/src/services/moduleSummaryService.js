/**
 * Servicio Frontend para Resumen de Módulos
 * Interactúa con backend para generar resúmenes y audio
 */

const API_BASE = 'http://localhost:4000/api';

export async function getModuleSummary(moduleId, courseId) {
  try {
    const response = await fetch(
      `${API_BASE}/modulos/${moduleId}/resumen?id_curso=${courseId}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error getting module summary:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

export async function getModuleSummaryWithAudio(moduleId, courseId, incluirAudio = true) {
  try {
    const response = await fetch(
      `${API_BASE}/modulos/${moduleId}/resumen-audio`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id_curso: courseId,
          incluirAudio,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error getting module summary with audio:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

export async function downloadModuleSummaryAudio(moduleId, courseId) {
  try {
    const response = await fetch(
      `${API_BASE}/modulos/${moduleId}/descargar-audio-resumen?id_curso=${courseId}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    // Obtener el blob del archivo
    const blob = await response.blob();
    
    // Crear URL temporal
    const url = window.URL.createObjectURL(blob);
    
    // Crear elemento <a> para descargar
    const link = document.createElement('a');
    link.href = url;
    link.download = `resumen_modulo_${moduleId}.mp3`;
    document.body.appendChild(link);
    link.click();
    
    // Limpiar
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    return { success: true };
  } catch (error) {
    console.error('Error downloading audio:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

export async function resumeModuleInChat(moduleId, courseId, mensaje = null) {
  try {
    const response = await fetch(
      `${API_BASE}/modulos/resumen-chat`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mensaje: mensaje || `Resumen del módulo ${moduleId}`,
          id_curso: courseId,
          id_modulo: moduleId,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error in resume module chat:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Reproducir audio en el navegador
 */
export function playAudioFromURL(audioUrl) {
  const audio = new Audio(audioUrl);
  audio.play().catch(err => {
    console.error('Error playing audio:', err);
  });
  return audio;
}

/**
 * Mostrar resumen en formato HTML en el chat
 */
export function renderSummaryInChat(summaryData) {
  if (summaryData.tipo === 'resumen_estructurado') {
    return summaryData.contenido; // Ya es HTML
  }

  // Si es texto plano, envolver en párrafos
  return `<div class="resumen-chat-contenido"><p>${summaryData}</p></div>`;
}

export default {
  getModuleSummary,
  getModuleSummaryWithAudio,
  downloadModuleSummaryAudio,
  resumeModuleInChat,
  playAudioFromURL,
  renderSummaryInChat,
};
