const API_URL = 'http://localhost:4000/api/notas';

// Obtener notas de un usuario (por su matricula en cursos)
export async function obtenerNotasUsuario(id_usuario) {
  try {
    const response = await fetch(`${API_URL}/usuario/${id_usuario}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Error al obtener notas');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error en obtenerNotasUsuario:', error);
    throw error;
  }
}

// Obtener notas por seccion/curso
export async function obtenerNotasPorSeccion(id_seccion) {
  try {
    const response = await fetch(`${API_URL}/seccion/${id_seccion}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Error al obtener notas');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error en obtenerNotasPorSeccion:', error);
    throw error;
  }
}

// Obtener promedio general del usuario
export async function obtenerPromedioGeneral(id_usuario) {
  try {
    const response = await fetch(`${API_URL}/usuario/${id_usuario}/promedio`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Error al obtener promedio');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error en obtenerPromedioGeneral:', error);
    throw error;
  }
}
