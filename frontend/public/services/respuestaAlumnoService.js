// Servicio para manejo de respuestas de alumnos
const API_BASE = 'http://localhost:4000/api';

// Obtener respuestas de alumno por actividad y matrícula
export async function getRespuestasAlumnoActividad(idActividad, idMatricula) {
  try {
    const token = localStorage.getItem('token');
    const params = new URLSearchParams({
      id_actividad: idActividad,
      id_matricula: idMatricula
    });

    const response = await fetch(`${API_BASE}/respuestas-alumnos?${params}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) throw new Error(`Error: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Error al obtener respuestas de alumno:', error);
    throw error;
  }
}

// Enviar respuesta de alumno
export async function enviarRespuestaAlumno(respuestaData) {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE}/respuestas-alumnos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(respuestaData)
    });

    if (!response.ok) throw new Error(`Error: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Error al enviar respuesta:', error);
    throw error;
  }
}

// Actualizar respuesta de alumno (para calificar)
export async function updateRespuestaAlumno(idRespuesta, updateData) {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE}/respuestas-alumnos/${idRespuesta}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(updateData)
    });

    if (!response.ok) throw new Error(`Error: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Error al actualizar respuesta:', error);
    throw error;
  }
}

// Eliminar respuesta de alumno
export async function deleteRespuestaAlumno(idRespuesta) {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE}/respuestas-alumnos/${idRespuesta}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) throw new Error(`Error: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Error al eliminar respuesta:', error);
    throw error;
  }
}

// Obtener estadísticas de una actividad
export async function getEstadisticasActividad(idActividad) {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE}/respuestas-alumnos/actividad/${idActividad}/estadisticas`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) throw new Error(`Error: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    throw error;
  }
}
