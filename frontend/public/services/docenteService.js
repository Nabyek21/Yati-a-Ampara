const API_URL = 'http://localhost:4000/api';

export async function getDocentes(filters = {}) {
  const params = new URLSearchParams();
  if (filters.search) params.append('search', filters.search);
  if (filters.id_estado) params.append('id_estado', filters.id_estado);
  if (filters.id_especialidad) params.append('id_especialidad', filters.id_especialidad);

  const response = await fetch(`${API_URL}/docentes?${params.toString()}`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Error al obtener docentes');
  }
  return response.json();
}

export async function createDocente(docenteData) {
  const response = await fetch(`${API_URL}/docentes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
    body: JSON.stringify(docenteData)
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Error al crear docente');
  }
  return response.json();
}

export async function updateDocente(id_docente_perfil, id_usuario_asociado, userData, docenteProfileData) {
  const response = await fetch(`${API_URL}/docentes/${id_docente_perfil}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
    body: JSON.stringify(docenteProfileData)
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Error al actualizar el perfil del docente');
  }
  return response.json();
}

export async function deactivateDocente(id_docente_perfil) {
  const response = await fetch(`${API_URL}/docentes/deactivate/${id_docente_perfil}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Error al desactivar docente');
  }
  return response.json();
}
