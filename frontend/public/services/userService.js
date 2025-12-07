const API_URL = 'http://localhost:4000/api';

export async function getUsers(filters = {}) {
  try {
    const queryParams = new URLSearchParams();
    if (filters.search) queryParams.append('search', filters.search);
    if (filters.id_estado) queryParams.append('id_estado', filters.id_estado);
    if (filters.id_rol) queryParams.append('id_rol', filters.id_rol);

    const response = await fetch(`${API_URL}/users?${queryParams.toString()}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al obtener usuarios');
    }
    return response.json();
  } catch (error) {
    console.error('Error en getUsers:', error);
    throw error;
  }
}

export async function updateUser(id_usuario, userData) {
  try {
    const response = await fetch(`${API_URL}/users/${id_usuario}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(userData)
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al actualizar usuario');
    }
    return response.json();
  } catch (error) {
    console.error('Error en updateUser:', error);
    throw error;
  }
}

export async function deactivateUser(id_usuario) {
  try {
    const response = await fetch(`${API_URL}/users/deactivate/${id_usuario}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al desactivar usuario');
    }
    return response.json();
  } catch (error) {
    console.error('Error en deactivateUser:', error);
    throw error;
  }
}
