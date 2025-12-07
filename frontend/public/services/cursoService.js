const API_URL = 'http://localhost:4000/api';

export async function getCursos(filters = {}) {
  try {
    const queryParams = new URLSearchParams();
    if (filters.search) queryParams.append('search', filters.search);
    if (filters.id_especialidad) queryParams.append('id_especialidad', filters.id_especialidad);
    if (filters.id_modalidad) queryParams.append('id_modalidad', filters.id_modalidad);
    if (filters.id_estado) queryParams.append('id_estado', filters.id_estado);

    const response = await fetch(`${API_URL}/cursos?${queryParams.toString()}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al obtener cursos');
    }
    return response.json();
  } catch (error) {
    console.error('Error en getCursos:', error);
    throw error;
  }
}

export async function createCurso(cursoData) {
  try {
    const response = await fetch(`${API_URL}/cursos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(cursoData)
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al crear curso');
    }
    return response.json();
  } catch (error) {
    console.error('Error en createCurso:', error);
    throw error;
  }
}

export async function updateCurso(id_curso, cursoData) {
  try {
    const response = await fetch(`${API_URL}/cursos/${id_curso}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(cursoData)
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al actualizar curso');
    }
    return response.json();
  } catch (error) {
    console.error('Error en updateCurso:', error);
    throw error;
  }
}

export async function deactivateCurso(id_curso) {
  try {
    const response = await fetch(`${API_URL}/cursos/deactivate/${id_curso}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al desactivar curso');
    }
    return response.json();
  } catch (error) {
    console.error('Error en deactivateCurso:', error);
    throw error;
  }
}

export async function getCursoById(id_curso) {
  try {
    const response = await fetch(`${API_URL}/cursos/${id_curso}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Error al obtener curso');
    }
    return response.json();
  } catch (error) {
    console.error('Error en getCursoById:', error);
    throw error;
  }
}
