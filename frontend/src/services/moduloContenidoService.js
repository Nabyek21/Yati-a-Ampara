const API_URL = import.meta.env.VITE_PUBLIC_API_URL || 'http://localhost:4000/api';

export async function getContenidoByModulo(id_modulo, id_seccion = null) {
  let url = `${API_URL}/modulo-contenido/modulo/${id_modulo}`;
  if (id_seccion) {
    url += `?id_seccion=${id_seccion}`;
  }
  
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Error al obtener el contenido');
  }
  
  return response.json();
}

export async function getContenidoBySeccion(id_seccion) {
  const response = await fetch(`${API_URL}/modulo-contenido/seccion/${id_seccion}`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Error al obtener el contenido');
  }
  
  return response.json();
}

export async function createContenido(contenidoData) {
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
    throw new Error(errorData.message || 'Error al crear el contenido');
  }
  
  return response.json();
}

export async function updateContenido(id_contenido, contenidoData) {
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
    throw new Error(errorData.message || 'Error al actualizar el contenido');
  }
  
  return response.json();
}

export async function deleteContenido(id_contenido) {
  const response = await fetch(`${API_URL}/modulo-contenido/${id_contenido}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Error al eliminar el contenido');
  }
  
  return response.json();
}
