const API_URL = 'http://localhost:4000/api';

export async function getEspecialidades() {
  try {
    const response = await fetch(`${API_URL}/especialidades`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al obtener especialidades');
    }
    return response.json();
  } catch (error) {
    console.error('Error en getEspecialidades:', error);
    throw error;
  }
}

export async function createEspecialidad(nombre) {
  try {
    const response = await fetch(`${API_URL}/especialidades`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ nombre })
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al crear especialidad');
    }
    return response.json();
  } catch (error) {
    console.error('Error en createEspecialidad:', error);
    throw error;
  }
}

export async function updateEspecialidad(id_especialidad, nombre) {
  try {
    const response = await fetch(`${API_URL}/especialidades/${id_especialidad}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ nombre })
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al actualizar especialidad');
    }
    return response.json();
  } catch (error) {
    console.error('Error en updateEspecialidad:', error);
    throw error;
  }
}

export async function deleteEspecialidad(id_especialidad) {
  try {
    const response = await fetch(`${API_URL}/especialidades/${id_especialidad}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al eliminar especialidad');
    }
    return response.json();
  } catch (error) {
    console.error('Error en deleteEspecialidad:', error);
    throw error;
  }
}
