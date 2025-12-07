const API_URL = import.meta.env.VITE_PUBLIC_API_URL || 'http://localhost:4000/api';

export async function getModalidades() {
  try {
    const response = await fetch(`${API_URL}/modalidades`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al obtener modalidades');
    }
    return response.json();
  } catch (error) {
    console.error('Error en getModalidades:', error);
    throw error;
  }
}
