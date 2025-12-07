const API_URL = 'http://localhost:4000/api';

export async function getContenidoByModulo(id_modulo, id_seccion = null) {
  try {
    const queryParams = new URLSearchParams();
    queryParams.append('id_modulo', id_modulo);
    if (id_seccion) queryParams.append('id_seccion', id_seccion);

    const response = await fetch(`${API_URL}/modulo-contenido?${queryParams.toString()}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al obtener contenido');
    }
    const data = await response.json();
    console.log(`getContenidoByModulo(${id_modulo}):`, data);
    // Asegurar que siempre devuelve un array
    return Array.isArray(data) ? data : (data?.data || []);
  } catch (error) {
    console.error('Error en getContenidoByModulo:', error);
    return [];
  }
}

export async function getContenidoBySeccion(id_seccion) {
  try {
    const response = await fetch(`${API_URL}/modulo-contenido?id_seccion=${id_seccion}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al obtener contenido');
    }
    return response.json();
  } catch (error) {
    console.error('Error en getContenidoBySeccion:', error);
    throw error;
  }
}

export async function getContenidoById(id_contenido) {
  try {
    const response = await fetch(`${API_URL}/modulo-contenido/${id_contenido}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al obtener contenido');
    }
    return response.json();
  } catch (error) {
    console.error('Error en getContenidoById:', error);
    throw error;
  }
}

export async function createContenido(contenidoData) {
  try {
    const response = await fetch(`${API_URL}/modulo-contenido`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(contenidoData)
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al crear contenido');
    }
    return response.json();
  } catch (error) {
    console.error('Error en createContenido:', error);
    throw error;
  }
}

export async function updateContenido(id_contenido, contenidoData) {
  try {
    const response = await fetch(`${API_URL}/modulo-contenido/${id_contenido}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(contenidoData)
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al actualizar contenido');
    }
    return response.json();
  } catch (error) {
    console.error('Error en updateContenido:', error);
    throw error;
  }
}

export async function deleteContenido(id_contenido) {
  try {
    const response = await fetch(`${API_URL}/modulo-contenido/${id_contenido}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al eliminar contenido');
    }
    return response.json();
  } catch (error) {
    console.error('Error en deleteContenido:', error);
    throw error;
  }
}
