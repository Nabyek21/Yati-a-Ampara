const API_URL = 'http://localhost:4000/api';

export async function getSecciones(filters = {}) {
  try {
    const queryParams = new URLSearchParams();
    if (filters.search) queryParams.append('search', filters.search);
    if (filters.id_curso) queryParams.append('id_curso', filters.id_curso);
    if (filters.id_docente_perfil) queryParams.append('id_docente_perfil', filters.id_docente_perfil);
    if (filters.id_modalidad) queryParams.append('id_modalidad', filters.id_modalidad);
    if (filters.id_estado) queryParams.append('id_estado', filters.id_estado);

    const response = await fetch(`${API_URL}/secciones?${queryParams.toString()}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al obtener secciones');
    }
    return response.json();
  } catch (error) {
    console.error('Error en getSecciones:', error);
    throw error;
  }
}

export async function getSeccionesDocente() {
  try {
    const response = await fetch(`${API_URL}/secciones/docente/mis-secciones`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al obtener secciones del docente');
    }
    return response.json();
  } catch (error) {
    console.error('Error en getSeccionesDocente:', error);
    throw error;
  }
}

export async function getSeccionById(id_seccion) {
  try {
    const response = await fetch(`${API_URL}/secciones/${id_seccion}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al obtener sección');
    }
    return response.json();
  } catch (error) {
    console.error('Error en getSeccionById:', error);
    throw error;
  }
}

export async function createSeccion(seccionData) {
  try {
    const response = await fetch(`${API_URL}/secciones`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(seccionData)
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al crear sección');
    }
    return response.json();
  } catch (error) {
    console.error('Error en createSeccion:', error);
    throw error;
  }
}

export async function updateSeccion(id_seccion, seccionData) {
  try {
    const response = await fetch(`${API_URL}/secciones/${id_seccion}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(seccionData)
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al actualizar sección');
    }
    return response.json();
  } catch (error) {
    console.error('Error en updateSeccion:', error);
    throw error;
  }
}

export async function deleteSeccion(id_seccion) {
  try {
    const response = await fetch(`${API_URL}/secciones/${id_seccion}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al eliminar sección');
    }
    return response.json();
  } catch (error) {
    console.error('Error en deleteSeccion:', error);
    throw error;
  }
}

export async function deactivateSeccion(id_seccion) {
  try {
    const response = await fetch(`${API_URL}/secciones/deactivate/${id_seccion}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al desactivar sección');
    }
    return response.json();
  } catch (error) {
    console.error('Error en deactivateSeccion:', error);
    throw error;
  }
}
