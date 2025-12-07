// Servicio para estadísticas y calificaciones
const API_BASE = 'http://localhost:4000/api';

// Obtener tareas por calificar de una sección
export async function getTareasPorCalificarSeccion(idSeccion) {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE}/estadisticas/seccion/${idSeccion}/tareas-por-calificar`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error al obtener tareas por calificar:', error);
    throw error;
  }
}

// Obtener estadísticas completas de un curso
export async function getEstadisticasCurso(idCurso) {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE}/estadisticas/curso/${idCurso}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error al obtener estadísticas del curso:', error);
    throw error;
  }
}

// Obtener detalle de respuestas por calificar de una sección
export async function getDetalleRespuestasPorCalificar(idSeccion) {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE}/estadisticas/seccion/${idSeccion}/respuestas-por-calificar`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error al obtener detalle de respuestas:', error);
    throw error;
  }
}
