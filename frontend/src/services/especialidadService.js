const API_URL = import.meta.env.VITE_PUBLIC_API_URL || 'http://localhost:4000/api';

export async function getEspecialidades() {
  const response = await fetch(`${API_URL}/especialidades`);
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Error al obtener especialidades');
  }
  return response.json();
}

export async function createEspecialidad(nombre) {
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
}

export async function updateEspecialidad(id_especialidad, nombre) {
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
}

export async function deleteEspecialidad(id_especialidad) {
  const response = await fetch(`${API_URL}/especialidades/${id_especialidad}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Error al eliminar especialidad');
  }
  return response.json();
}
