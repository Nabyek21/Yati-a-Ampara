const API_URL = 'http://localhost:4000/api';

/**
 * Chat interactivo con el agente IA
 * @param {string} sessionId - ID de sesión único
 * @param {string} mensaje - Mensaje del usuario
 * @param {object} contexto - Contexto { id_modulo, id_seccion, id_curso }
 */
export async function chatConIA(sessionId, mensaje, contexto = {}) {
  try {
    const response = await fetch(`${API_URL}/ia/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        sessionId,
        mensaje,
        ...contexto
      })
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error en chatConIA:', error);
    return {
      respuesta: 'Error al conectar con el asistente IA',
      tipo: 'error'
    };
  }
}

/**
 * Obtener resumen de un módulo
 */
export async function resumirModulo(id_modulo) {
  try {
    const response = await fetch(`${API_URL}/ia/resumir-modulo/${id_modulo}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error en resumirModulo:', error);
    return { error: error.message };
  }
}

/**
 * Generar plan de estudio personalizado
 */
export async function generarPlanEstudio(id_estudiante, id_curso) {
  try {
    const response = await fetch(`${API_URL}/ia/plan-estudio`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        id_estudiante,
        id_curso
      })
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error en generarPlanEstudio:', error);
    return { error: error.message };
  }
}

/**
 * Responder una pregunta sobre contenido
 */
export async function responderPregunta(pregunta, contexto = {}) {
  try {
    const response = await fetch(`${API_URL}/ia/responder-pregunta`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        pregunta,
        ...contexto
      })
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error en responderPregunta:', error);
    return { error: error.message };
  }
}

/**
 * Generar guía de estudio interactiva
 */
export async function generarGuiaEstudio(tema, contexto = {}, profundidad = 'intermedia') {
  try {
    const params = new URLSearchParams({
      profundidad,
      ...contexto
    });

    const response = await fetch(`${API_URL}/ia/guia-estudio/${encodeURIComponent(tema)}?${params.toString()}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error en generarGuiaEstudio:', error);
    return { error: error.message };
  }
}

/**
 * Resumir curso completo
 */
export async function resumirCurso(id_curso, id_seccion) {
  try {
    const params = id_seccion ? `?id_seccion=${id_seccion}` : '';
    const response = await fetch(`${API_URL}/ia/resumir-curso/${id_curso}${params}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error en resumirCurso:', error);
    return { error: error.message };
  }
}

/**
 * Resumir actividades del curso
 */
export async function resumirActividades(id_curso, id_seccion) {
  try {
    const params = id_seccion ? `?id_seccion=${id_seccion}` : '';
    const response = await fetch(`${API_URL}/ia/resumir-actividades/${id_curso}${params}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error en resumirActividades:', error);
    return { error: error.message };
  }
}

/**
 * Generar preguntas automáticas para estudio
 */
export async function generarPreguntasEstudio(id_curso, id_seccion, cantidad = 5) {
  try {
    const response = await fetch(`${API_URL}/ia/generar-preguntas`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        id_curso,
        id_seccion,
        cantidad
      })
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error en generarPreguntasEstudio:', error);
    return { error: error.message };
  }
}

/**
 * Analizar desempeño del estudiante
 */
export async function analizarDesempeño(id_estudiante, id_curso) {
  try {
    const response = await fetch(`${API_URL}/ia/analizar-desempeño/${id_estudiante}/${id_curso}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error en analizarDesempeño:', error);
    return { error: error.message };
  }
}

/**
 * Obtener recomendaciones personalizadas
 */
export async function obtenerRecomendaciones(id_estudiante, id_curso) {
  try {
    const response = await fetch(`${API_URL}/ia/recomendaciones/${id_estudiante}/${id_curso}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error en obtenerRecomendaciones:', error);
    return { error: error.message };
  }
}

export default {
  chatConIA,
  resumirModulo,
  generarPlanEstudio,
  responderPregunta,
  generarGuiaEstudio,
  resumirCurso,
  resumirActividades,
  generarPreguntasEstudio,
  analizarDesempeño,
  obtenerRecomendaciones
};
