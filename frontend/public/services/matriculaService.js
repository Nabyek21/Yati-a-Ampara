const API_URL = 'http://localhost:4000/api';

export async function deleteMatricula(id_matricula) {
  try {
    console.log('🗑️ Eliminando matrícula:', id_matricula);
    const response = await fetch(`${API_URL}/matriculas/${id_matricula}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al eliminar matrícula');
    }
    const data = await response.json();
    console.log('✅ Matrícula eliminada:', data);
    return data;
  } catch (error) {
    console.error('❌ Error en deleteMatricula:', error);
    throw error;
  }
}

export async function getMatriculasByUsuario(id_usuario) {
  try {
    // Si no se proporciona id_usuario, obtenemos las matrículas del usuario actual desde el token
    let url = `${API_URL}/matriculas`;
    if (id_usuario) {
      url += `?usuario=${id_usuario}`;
    }
    
    console.log('🔗 Llamando a:', url);
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
    const data = await response.json();
    console.log('✅ Respuesta de matrículas:', data);
    return data;
  } catch (error) {
    console.error('❌ Error en getMatriculasByUsuario:', error);
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

export async function createMatricula(id_seccion) {
  try {
    const response = await fetch(`${API_URL}/matriculas`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ id_seccion })
    });
    return response;
  } catch (error) {
    console.error('Error en createMatricula:', error);
    throw error;
  }
}
