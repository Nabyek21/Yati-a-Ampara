// Funciones para interactuar con la API del foro

const API_URL = 'http://localhost:4000/api/foro';

// ============ TEMAS ============

export async function obtenerTemasPorSeccion(idSeccion, limit = 20, offset = 0) {
  try {
    const response = await fetch(
      `${API_URL}/seccion/${idSeccion}?limit=${limit}&offset=${offset}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      }
    );
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Error al obtener temas');
    }
    return await response.json();
  } catch (error) {
    console.error('Error en obtenerTemasPorSeccion:', error);
    throw error;
  }
}

export async function obtenerTemaPorId(idTema) {
  try {
    const response = await fetch(`${API_URL}/tema/${idTema}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Error al obtener tema');
    }
    return await response.json();
  } catch (error) {
    console.error('Error en obtenerTemaPorId:', error);
    throw error;
  }
}

export async function crearTema(idSeccion, titulo, descripcion) {
  try {
    const response = await fetch(`${API_URL}/tema`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        id_seccion: idSeccion,
        titulo,
        descripcion
      })
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Error al crear tema');
    }
    return await response.json();
  } catch (error) {
    console.error('Error en crearTema:', error);
    throw error;
  }
}

export async function actualizarTema(idTema, titulo, descripcion) {
  try {
    const response = await fetch(`${API_URL}/tema/${idTema}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        titulo,
        descripcion
      })
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Error al actualizar tema');
    }
    return await response.json();
  } catch (error) {
    console.error('Error en actualizarTema:', error);
    throw error;
  }
}

export async function eliminarTema(idTema) {
  try {
    const response = await fetch(`${API_URL}/tema/${idTema}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Error al eliminar tema');
    }
    return await response.json();
  } catch (error) {
    console.error('Error en eliminarTema:', error);
    throw error;
  }
}

// ============ RESPUESTAS ============

export async function obtenerRespuestasPorTema(idTema) {
  try {
    const response = await fetch(`${API_URL}/tema/${idTema}/respuestas`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Error al obtener respuestas');
    }
    return await response.json();
  } catch (error) {
    console.error('Error en obtenerRespuestasPorTema:', error);
    throw error;
  }
}

export async function crearRespuesta(idTema, contenido) {
  try {
    const response = await fetch(`${API_URL}/tema/${idTema}/respuesta`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ contenido })
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Error al crear respuesta');
    }
    return await response.json();
  } catch (error) {
    console.error('Error en crearRespuesta:', error);
    throw error;
  }
}

export async function actualizarRespuesta(idRespuesta, contenido) {
  try {
    const response = await fetch(`${API_URL}/respuesta/${idRespuesta}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ contenido })
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Error al actualizar respuesta');
    }
    return await response.json();
  } catch (error) {
    console.error('Error en actualizarRespuesta:', error);
    throw error;
  }
}

export async function eliminarRespuesta(idRespuesta) {
  try {
    const response = await fetch(`${API_URL}/respuesta/${idRespuesta}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Error al eliminar respuesta');
    }
    return await response.json();
  } catch (error) {
    console.error('Error en eliminarRespuesta:', error);
    throw error;
  }
}

export async function obtenerRespuestasRecientes(idSeccion) {
  try {
    const response = await fetch(`${API_URL}/seccion/${idSeccion}/respuestas-usuario`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Error al obtener respuestas recientes');
    }
    return await response.json();
  } catch (error) {
    console.error('Error en obtenerRespuestasRecientes:', error);
    throw error;
  }
}
