const API_URL = 'http://localhost:4000/api';

export async function getRespuestasOpciones(filters = {}) {
  try {
    const queryParams = new URLSearchParams();
    if (filters.id_pregunta) queryParams.append('id_pregunta', filters.id_pregunta);
    if (filters.search) queryParams.append('search', filters.search);

    const response = await fetch(`${API_URL}/respuestas-opciones?${queryParams.toString()}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al obtener opciones de respuesta');
    }
    return response.json();
  } catch (error) {
    console.error('Error en getRespuestasOpciones:', error);
    throw error;
  }
}

export async function getRespuestaOpcion(id_respuesta) {
  try {
    const response = await fetch(`${API_URL}/respuestas-opciones/${id_respuesta}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al obtener opción de respuesta');
    }
    return response.json();
  } catch (error) {
    console.error('Error en getRespuestaOpcion:', error);
    throw error;
  }
}

export async function createRespuestaOpcion(respuestaData) {
  try {
    const response = await fetch(`${API_URL}/respuestas-opciones`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(respuestaData)
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al crear opción de respuesta');
    }
    return response.json();
  } catch (error) {
    console.error('Error en createRespuestaOpcion:', error);
    throw error;
  }
}

export async function updateRespuestaOpcion(id_respuesta, respuestaData) {
  try {
    const response = await fetch(`${API_URL}/respuestas-opciones/${id_respuesta}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(respuestaData)
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al actualizar opción de respuesta');
    }
    return response.json();
  } catch (error) {
    console.error('Error en updateRespuestaOpcion:', error);
    throw error;
  }
}

export async function deleteRespuestaOpcion(id_respuesta) {
  try {
    const response = await fetch(`${API_URL}/respuestas-opciones/${id_respuesta}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al eliminar opción de respuesta');
    }
    return response.json();
  } catch (error) {
    console.error('Error en deleteRespuestaOpcion:', error);
    throw error;
  }
}
