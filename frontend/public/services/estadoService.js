const API_URL = 'http://localhost:4000/api';

export async function getEstados() {
  try {
    const response = await fetch(`${API_URL}/estados`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al obtener estados');
    }
    return response.json();
  } catch (error) {
    console.error('Error en getEstados:', error);
    throw error;
  }
}
