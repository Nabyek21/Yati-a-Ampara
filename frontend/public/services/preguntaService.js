const API_URL = 'http://localhost:4000/api';

export async function getPreguntas(filters = {}) {
  try {
    const queryParams = new URLSearchParams();
    if (filters.id_actividad) queryParams.append('id_actividad', filters.id_actividad);
    if (filters.search) queryParams.append('search', filters.search);
    if (filters.include_opciones) queryParams.append('include_opciones', filters.include_opciones);

    const response = await fetch(`${API_URL}/preguntas?${queryParams.toString()}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al obtener preguntas');
    }
    return response.json();
  } catch (error) {
    console.error('Error en getPreguntas:', error);
    throw error;
  }
}

export async function getPreguntaById(id_pregunta) {
  try {
    const response = await fetch(`${API_URL}/preguntas/${id_pregunta}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al obtener pregunta');
    }
    return response.json();
  } catch (error) {
    console.error('Error en getPreguntaById:', error);
    throw error;
  }
}

export async function createPregunta(preguntaData) {
  try {
    const response = await fetch(`${API_URL}/preguntas`, {
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

export async function updatePregunta(id_pregunta, preguntaData) {
  try {
    const response = await fetch(`${API_URL}/preguntas/${id_pregunta}`, {
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

export async function deletePregunta(id_pregunta) {
  try {
    const response = await fetch(`${API_URL}/preguntas/${id_pregunta}`, {
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
