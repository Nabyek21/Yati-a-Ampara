const API_URL = import.meta.env.VITE_PUBLIC_API_URL || 'http://localhost:4000/api';

export async function generateClasesForSeccion(id_seccion, id_horas) {
  try {
    const response = await fetch(`${API_URL}/clases/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ id_seccion, id_horas })
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al generar clases');
    }
    return response.json();
  } catch (error) {
    console.error('Error en generateClasesForSeccion:', error);
    throw error;
  }
}

export async function getClases(filters = {}) {
  try {
    const queryParams = new URLSearchParams();
    if (filters.id_seccion) queryParams.append('id_seccion', filters.id_seccion);
    if (filters.id_modulo) queryParams.append('id_modulo', filters.id_modulo);

    console.log(`📝 Obteniendo clases con filtros:`, filters);
    const response = await fetch(`${API_URL}/clases?${queryParams.toString()}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ Error response:', errorData);
      throw new Error(errorData.message || 'Error al obtener clases');
    }
    const data = await response.json();
    console.log(`✅ Clases obtenidas: ${data.length} clases`);
    return data;
  } catch (error) {
    console.error('Error en getClases:', error);
    throw error;
  }
}

export async function updateClase(id_clase, claseData) {
  try {
    const response = await fetch(`${API_URL}/clases/${id_clase}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(claseData)
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al actualizar clase');
    }
    return response.json();
  } catch (error) {
    console.error('Error en updateClase:', error);
    throw error;
  }
}

export async function deleteClase(id_clase) {
  try {
    const response = await fetch(`${API_URL}/clases/${id_clase}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al eliminar clase');
    }
    return response.json();
  } catch (error) {
    console.error('Error en deleteClase:', error);
    throw error;
  }
}

export async function createClase(claseData) {
  try {
    const response = await fetch(`${API_URL}/clases`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(claseData)
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al crear clase');
    }
    return response.json();
  } catch (error) {
    console.error('Error en createClase:', error);
    throw error;
  }
}
