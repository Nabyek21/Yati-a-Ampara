const API_URL = import.meta.env.VITE_PUBLIC_API_URL || 'http://localhost:4000/api';

export async function getMatriculasByUsuario(id_usuario) {
  try {
    let url = `${API_URL}/matriculas`;
    
    // Si se proporciona id_usuario, agregarlo como parámetro
    if (id_usuario) {
      url += `?usuario=${id_usuario}`;
    }
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al obtener matrículas');
    }
    return response.json();
  } catch (error) {
    console.error('Error en getMatriculasByUsuario:', error);
    throw error;
  }
}

export async function getAlumnosBySeccion(id_seccion) {
  try {
    const response = await fetch(`${API_URL}/matriculas?seccion=${id_seccion}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al obtener alumnos');
    }
    return response.json();
  } catch (error) {
    console.error('Error en getAlumnosBySeccion:', error);
    throw error;
  }
}
