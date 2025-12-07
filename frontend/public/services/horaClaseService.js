const API_URL = 'http://localhost:4000/api';

export async function getHorasClase() {
  try {
    const response = await fetch(`${API_URL}/horas-clase`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al obtener horas de clase');
    }
    return response.json();
  } catch (error) {
    console.error('Error en getHorasClase:', error);
    throw error;
  }
}

export async function createHoraClase(horaData) {
  try {
    const response = await fetch(`${API_URL}/horas-clase`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(horaData)
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al crear hora de clase');
    }
    return response.json();
  } catch (error) {
    console.error('Error en createHoraClase:', error);
    throw error;
  }
}

export async function updateHoraClase(id_hora, horaData) {
  try {
    const response = await fetch(`${API_URL}/horas-clase/${id_hora}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(horaData)
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al actualizar hora de clase');
    }
    return response.json();
  } catch (error) {
    console.error('Error en updateHoraClase:', error);
    throw error;
  }
}

export async function deleteHoraClase(id_hora) {
  try {
    const response = await fetch(`${API_URL}/horas-clase/${id_hora}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al eliminar hora de clase');
    }
    return response.json();
  } catch (error) {
    console.error('Error en deleteHoraClase:', error);
    throw error;
  }
}
