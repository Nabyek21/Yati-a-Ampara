const API_URL = 'http://localhost:4000/api';

export async function getRoles(filters = {}) {
  try {
    const queryParams = new URLSearchParams();
    if (filters.search) queryParams.append('search', filters.search);

    const response = await fetch(`${API_URL}/roles?${queryParams.toString()}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al obtener roles');
    }
    return response.json();
  } catch (error) {
    console.error('Error en getRoles:', error);
    throw error;
  }
}

export async function getRol(id_rol) {
  try {
    const response = await fetch(`${API_URL}/roles/${id_rol}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al obtener rol');
    }
    return response.json();
  } catch (error) {
    console.error('Error en getRol:', error);
    throw error;
  }
}

export async function createRol(rolData) {
  try {
    const response = await fetch(`${API_URL}/roles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(rolData)
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al crear rol');
    }
    return response.json();
  } catch (error) {
    console.error('Error en createRol:', error);
    throw error;
  }
}

export async function updateRol(id_rol, rolData) {
  try {
    const response = await fetch(`${API_URL}/roles/${id_rol}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(rolData)
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al actualizar rol');
    }
    return response.json();
  } catch (error) {
    console.error('Error en updateRol:', error);
    throw error;
  }
}

export async function deleteRol(id_rol) {
  try {
    const response = await fetch(`${API_URL}/roles/${id_rol}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al eliminar rol');
    }
    return response.json();
  } catch (error) {
    console.error('Error en deleteRol:', error);
    throw error;
  }
}
