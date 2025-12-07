const API_URL = import.meta.env.VITE_PUBLIC_API_URL || 'http://localhost:4000/api';

export async function getTareasPendientes(id_usuario) {
  try {
    const response = await fetch(`${API_URL}/actividades?usuario=${id_usuario}&pendientes=true`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al obtener tareas pendientes');
    }
    return response.json();
  } catch (error) {
    console.error('Error en getTareasPendientes:', error);
    throw error;
  }
}

export async function getProximaEntrega(id_usuario) {
  try {
    const response = await fetch(`${API_URL}/actividades?usuario=${id_usuario}&proxima=true`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al obtener próxima entrega');
    }
    const data = await response.json();
    return data ? new Date(data).toLocaleDateString('es-ES', { weekday: 'long' }) : '-';
  } catch (error) {
    console.error('Error en getProximaEntrega:', error);
    throw error;
  }
}

export async function getActividades(filters = {}) {
  try {
    const queryParams = new URLSearchParams();
    if (filters.search) queryParams.append('search', filters.search);
    if (filters.id_modulo) queryParams.append('id_modulo', filters.id_modulo);
    if (filters.id_seccion) queryParams.append('id_seccion', filters.id_seccion);
    if (filters.id_docente_perfil) queryParams.append('id_docente_perfil', filters.id_docente_perfil);
    if (filters.tipo) queryParams.append('tipo', filters.tipo);

    const response = await fetch(`${API_URL}/actividades?${queryParams.toString()}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al obtener actividades');
    }
    return response.json();
  } catch (error) {
    console.error('Error en getActividades:', error);
    throw error;
  }
}

export async function createActividad(actividadData) {
  try {
    const response = await fetch(`${API_URL}/actividades`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(actividadData)
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al crear actividad');
    }
    return response.json();
  } catch (error) {
    console.error('Error en createActividad:', error);
    throw error;
  }
}

export async function updateActividad(id_actividad, actividadData) {
  try {
    const response = await fetch(`${API_URL}/actividades/${id_actividad}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(actividadData)
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al actualizar actividad');
    }
    return response.json();
  } catch (error) {
    console.error('Error en updateActividad:', error);
    throw error;
  }
}

export async function deleteActividad(id_actividad) {
  try {
    const response = await fetch(`${API_URL}/actividades/${id_actividad}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al eliminar actividad');
    }
    return response.json();
  } catch (error) {
    console.error('Error en deleteActividad:', error);
    throw error;
  }
}

export async function getContenidoRelacionado(id_actividad) {
  try {
    const response = await fetch(`${API_URL}/actividades/${id_actividad}/contenido`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al obtener contenido relacionado');
    }
    return response.json();
  } catch (error) {
    console.error('Error en getContenidoRelacionado:', error);
    throw error;
  }
}
