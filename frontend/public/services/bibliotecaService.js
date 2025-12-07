const API_URL = 'http://localhost:4000/api/biblioteca';

// Obtener todos los recursos
export async function obtenerRecursos(filtros = {}) {
  try {
    let url = API_URL;
    const params = new URLSearchParams();
    
    if (filtros.tipo) params.append('tipo', filtros.tipo);
    if (filtros.busqueda) params.append('busqueda', filtros.busqueda);
    
    if (params.toString()) url += '?' + params.toString();
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Error al obtener recursos');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error en obtenerRecursos:', error);
    throw error;
  }
}

// Obtener un recurso específico
export async function obtenerRecurso(id_recurso) {
  try {
    const response = await fetch(`${API_URL}/${id_recurso}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Error al obtener recurso');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error en obtenerRecurso:', error);
    throw error;
  }
}

// Crear nuevo recurso (solo admin)
export async function crearRecurso(tipo, titulo, autor, descripcion, url_recurso) {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        tipo,
        titulo,
        autor,
        descripcion,
        url_recurso
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Error al crear recurso');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error en crearRecurso:', error);
    throw error;
  }
}

// Actualizar recurso
export async function actualizarRecurso(id_recurso, tipo, titulo, autor, descripcion, url_recurso) {
  try {
    const response = await fetch(`${API_URL}/${id_recurso}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        tipo,
        titulo,
        autor,
        descripcion,
        url_recurso
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Error al actualizar recurso');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error en actualizarRecurso:', error);
    throw error;
  }
}

// Eliminar recurso
export async function eliminarRecurso(id_recurso) {
  try {
    const response = await fetch(`${API_URL}/${id_recurso}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Error al eliminar recurso');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error en eliminarRecurso:', error);
    throw error;
  }
}

// Obtener tipos de recursos
export async function obtenerTipos() {
  try {
    const response = await fetch(`${API_URL}/tipos/lista`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Error al obtener tipos');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error en obtenerTipos:', error);
    throw error;
  }
}
