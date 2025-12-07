const API_URL = 'http://localhost:4000/api';

export async function getStats(filters = {}) {
  try {
    const queryParams = new URLSearchParams();
    if (filters.id_seccion) queryParams.append('id_seccion', filters.id_seccion);

    const response = await fetch(`${API_URL}/stats?${queryParams.toString()}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al obtener estadísticas');
    }
    return response.json();
  } catch (error) {
    console.error('Error en getStats:', error);
    throw error;
  }
}

export async function getStatById(id_stat) {
  try {
    const response = await fetch(`${API_URL}/stats/${id_stat}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al obtener estadística');
    }
    return response.json();
  } catch (error) {
    console.error('Error en getStatById:', error);
    throw error;
  }
}

export async function getSeccionStats(id_seccion) {
  try {
    const response = await fetch(`${API_URL}/stats?id_seccion=${id_seccion}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al obtener estadísticas de sección');
    }
    return response.json();
  } catch (error) {
    console.error('Error en getSeccionStats:', error);
    throw error;
  }
}

export async function getGeneralStats() {
  try {
    const response = await fetch(`${API_URL}/stats/general`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al obtener estadísticas generales');
    }
    return response.json();
  } catch (error) {
    console.error('Error en getGeneralStats:', error);
    throw error;
  }
}

export async function getUsuariosByEstado() {
  try {
    const response = await fetch(`${API_URL}/stats/usuarios/estado`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al obtener usuarios por estado');
    }
    return response.json();
  } catch (error) {
    console.error('Error en getUsuariosByEstado:', error);
    throw error;
  }
}

export async function getCursosByEstado() {
  try {
    const response = await fetch(`${API_URL}/stats/cursos/estado`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al obtener cursos por estado');
    }
    return response.json();
  } catch (error) {
    console.error('Error en getCursosByEstado:', error);
    throw error;
  }
}

export async function getCursosByEspecialidad() {
  try {
    const response = await fetch(`${API_URL}/stats/cursos/especialidad`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al obtener cursos por especialidad');
    }
    return response.json();
  } catch (error) {
    console.error('Error en getCursosByEspecialidad:', error);
    throw error;
  }
}

export async function getUsuariosByMonth() {
  try {
    const response = await fetch(`${API_URL}/stats/usuarios/mes`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al obtener usuarios por mes');
    }
    return response.json();
  } catch (error) {
    console.error('Error en getUsuariosByMonth:', error);
    throw error;
  }
}
