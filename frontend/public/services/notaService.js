const API_URL = 'http://localhost:4000/api';

export async function getActividades(filters = {}) {
  try {
    const queryParams = new URLSearchParams();
    if (filters.id_seccion) queryParams.append('id_seccion', filters.id_seccion);
    if (filters.id_modulo) queryParams.append('id_modulo', filters.id_modulo);
    if (filters.tipo) queryParams.append('tipo', filters.tipo);

    const response = await fetch(`${API_URL}/actividades?${queryParams.toString()}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    if (!response.ok) {
      throw new Error('Error al obtener actividades');
    }
    return response.json();
  } catch (error) {
    console.error('Error en getActividades:', error);
    throw error;
  }
}

export async function getActividadById(id_actividad) {
  try {
    const response = await fetch(`${API_URL}/actividades/${id_actividad}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    if (!response.ok) {
      throw new Error('Error al obtener actividad');
    }
    return response.json();
  } catch (error) {
    console.error('Error en getActividadById:', error);
    throw error;
  }
}

export async function getRespuestasActividad(id_actividad) {
  try {
    const response = await fetch(`${API_URL}/actividades-respuestas?id_actividad=${id_actividad}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    if (!response.ok) {
      throw new Error('Error al obtener respuestas');
    }
    return response.json();
  } catch (error) {
    console.error('Error en getRespuestasActividad:', error);
    throw error;
  }
}

export async function getNota(id_matricula, id_actividad) {
  try {
    const response = await fetch(`${API_URL}/notas?matricula=${id_matricula}&actividad=${id_actividad}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    if (!response.ok) {
      throw new Error('Error al obtener nota');
    }
    const data = await response.json();
    return Array.isArray(data) ? data[0] : data;
  } catch (error) {
    console.error('Error en getNota:', error);
    throw error;
  }
}

export async function updateNota(id_nota, puntaje_obtenido) {
  try {
    const response = await fetch(`${API_URL}/notas/${id_nota}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ puntaje_obtenido })
    });
    if (!response.ok) {
      throw new Error('Error al actualizar nota');
    }
    return response.json();
  } catch (error) {
    console.error('Error en updateNota:', error);
    throw error;
  }
}

export async function createNota(id_matricula, id_actividad, puntaje_obtenido) {
  try {
    const response = await fetch(`${API_URL}/notas`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ id_matricula, id_actividad, puntaje_obtenido })
    });
    if (!response.ok) {
      throw new Error('Error al crear nota');
    }
    return response.json();
  } catch (error) {
    console.error('Error en createNota:', error);
    throw error;
  }
}
