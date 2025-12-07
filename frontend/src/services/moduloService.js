const API_URL = import.meta.env.VITE_PUBLIC_API_URL || 'http://localhost:4000/api';

export async function getModulosByCurso(id_curso) {
  const response = await fetch(`${API_URL}/modulos/curso/${id_curso}`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Error al obtener los módulos');
  }
  
  return response.json();
}

export async function getModulosBySeccion(id_seccion) {
  const response = await fetch(`${API_URL}/modulos/seccion/${id_seccion}`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Error al obtener los módulos de la sección');
  }
  
  return response.json();
}
