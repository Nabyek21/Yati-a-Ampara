const API_URL = `${import.meta.env.VITE_PUBLIC_API_URL || 'http://localhost:4000/api'}/preguntas`;

/**
 * Obtener todas las preguntas (con filtros opcionales)
 */
export async function getPreguntas(filtros = {}) {
  try {
    const params = new URLSearchParams();
    
    if (filtros.id_actividad) params.append('id_actividad', filtros.id_actividad);
    if (filtros.include_opciones) params.append('include_opciones', 'true');
    
    const url = `${API_URL}${params.toString() ? `?${params.toString()}` : ''}`;
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Error al obtener preguntas');
    }
    
    return response.json();
  } catch (error) {
    console.error('Error en getPreguntas:', error);
    throw error;
  }
}

/**
 * Obtener preguntas de una actividad específica
 */
export async function getPreguntasPorActividad(id_actividad) {
  try {
    return await getPreguntas({ 
      id_actividad, 
      include_opciones: true 
    });
  } catch (error) {
    console.error('Error en getPreguntasPorActividad:', error);
    throw error;
  }
}

/**
 * Obtener una pregunta por ID
 */
export async function getPreguntaById(id_pregunta) {
  try {
    const response = await fetch(`${API_URL}/${id_pregunta}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Pregunta no encontrada');
    }
    
    return response.json();
  } catch (error) {
    console.error('Error en getPreguntaById:', error);
    throw error;
  }
}

/**
 * Crear una nueva pregunta
 */
export async function createPregunta(preguntaData) {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(preguntaData)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al crear pregunta');
    }
    
    return response.json();
  } catch (error) {
    console.error('Error en createPregunta:', error);
    throw error;
  }
}

/**
 * Actualizar una pregunta
 */
export async function updatePregunta(id_pregunta, preguntaData) {
  try {
    const response = await fetch(`${API_URL}/${id_pregunta}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(preguntaData)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al actualizar pregunta');
    }
    
    return response.json();
  } catch (error) {
    console.error('Error en updatePregunta:', error);
    throw error;
  }
}

/**
 * Eliminar una pregunta
 */
export async function deletePregunta(id_pregunta) {
  try {
    const response = await fetch(`${API_URL}/${id_pregunta}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al eliminar pregunta');
    }
    
    return response.json();
  } catch (error) {
    console.error('Error en deletePregunta:', error);
    throw error;
  }
}

/**
 * Crear opción de respuesta para una pregunta
 */
export async function createOpcionRespuesta(id_pregunta, opcionData) {
  try {
    const response = await fetch(`${import.meta.env.VITE_PUBLIC_API_URL || 'http://localhost:4000/api'}/respuestas-opciones`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        id_pregunta,
        ...opcionData
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al crear opción');
    }
    
    return response.json();
  } catch (error) {
    console.error('Error en createOpcionRespuesta:', error);
    throw error;
  }
}

/**
 * Eliminar opción de respuesta
 */
export async function deleteOpcionRespuesta(id_opcion) {
  try {
    const response = await fetch(`${import.meta.env.VITE_PUBLIC_API_URL || 'http://localhost:4000/api'}/respuestas-opciones/${id_opcion}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al eliminar opción');
    }
    
    return response.json();
  } catch (error) {
    console.error('Error en deleteOpcionRespuesta:', error);
    throw error;
  }
}
