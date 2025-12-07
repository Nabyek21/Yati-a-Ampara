const API_URL = 'http://localhost:4000/api';

// ==================== MÓDULOS ====================
export async function getModulosByCurso(id_curso) {
  try {
    const response = await fetch(`${API_URL}/modulos/curso/${id_curso}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al obtener módulos');
    }
    const data = await response.json();
    console.log(`getModulosByCurso(${id_curso}):`, data);
    return Array.isArray(data) ? data : (data?.data || []);
  } catch (error) {
    console.error('Error en getModulosByCurso:', error);
    return [];
  }
}

export async function getModulosBySeccion(id_seccion) {
  try {
    const response = await fetch(`${API_URL}/modulos/seccion/${id_seccion}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al obtener módulos de la sección');
    }
    const data = await response.json();
    console.log(`getModulosBySeccion(${id_seccion}):`, data);
    return Array.isArray(data) ? data : (data?.data || []);
  } catch (error) {
    console.error('Error en getModulosBySeccion:', error);
    return [];
  }
}

export async function getContenidoByModulo(id_modulo, id_seccion = null) {
  try {
    let url = `${API_URL}/modulo-contenido/modulo/${id_modulo}`;
    if (id_seccion) {
      url += `?id_seccion=${id_seccion}`;
    }
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al obtener contenido');
    }
    return response.json();
  } catch (error) {
    console.error('Error en getContenidoByModulo:', error);
    throw error;
  }
}

// ==================== ACTIVIDADES ====================
export async function getActividadesByCurso(id_curso) {
  try {
    const response = await fetch(`${API_URL}/actividades?id_curso=${id_curso}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    if (!response.ok) {
      throw new Error('Error al obtener actividades');
    }
    return response.json();
  } catch (error) {
    console.error('Error en getActividadesByCurso:', error);
    throw error;
  }
}

export async function getActividadesBySeccion(id_seccion) {
  try {
    const response = await fetch(`${API_URL}/actividades?id_seccion=${id_seccion}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    if (!response.ok) {
      throw new Error('Error al obtener actividades');
    }
    return response.json();
  } catch (error) {
    console.error('Error en getActividadesBySeccion:', error);
    throw error;
  }
}

export async function getActividadById(id_actividad) {
  try {
    const response = await fetch(`${API_URL}/actividades/${id_actividad}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    if (!response.ok) {
      throw new Error('Error al obtener actividad');
    }
    return response.json();
  } catch (error) {
    console.error('Error en getActividadById:', error);
    throw error;
  }
}

export async function createActividad(actividadData) {
  try {
    const response = await fetch(`${API_URL}/actividades`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(actividadData)
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al crear actividad');
    }
    return response.json();
  } catch (error) {
    console.error('Error en createActividad:', error);
    throw error;
  }
}

export async function updateActividad(id_actividad, actividadData) {
  try {
    const response = await fetch(`${API_URL}/actividades/${id_actividad}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(actividadData)
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al actualizar actividad');
    }
    return response.json();
  } catch (error) {
    console.error('Error en updateActividad:', error);
    throw error;
  }
}

export async function deleteActividad(id_actividad) {
  try {
    const response = await fetch(`${API_URL}/actividades/${id_actividad}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    if (!response.ok) {
      throw new Error('Error al eliminar actividad');
    }
    return response.json();
  } catch (error) {
    console.error('Error en deleteActividad:', error);
    throw error;
  }
}

// ==================== PREGUNTAS ====================
export async function getPreguntasByActividad(id_actividad) {
  try {
    const response = await fetch(`${API_URL}/preguntas?id_actividad=${id_actividad}&include_opciones=true`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    if (!response.ok) {
      throw new Error('Error al obtener preguntas');
    }
    return response.json();
  } catch (error) {
    console.error('Error en getPreguntasByActividad:', error);
    throw error;
  }
}

export async function getPreguntaById(id_pregunta) {
  try {
    const response = await fetch(`${API_URL}/preguntas/${id_pregunta}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    if (!response.ok) {
      throw new Error('Error al obtener pregunta');
    }
    return response.json();
  } catch (error) {
    console.error('Error en getPreguntaById:', error);
    throw error;
  }
}

export async function createPregunta(preguntaData) {
  try {
    const response = await fetch(`${API_URL}/preguntas`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(preguntaData)
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al crear pregunta');
    }
    return response.json();
  } catch (error) {
    console.error('Error en createPregunta:', error);
    throw error;
  }
}

export async function updatePregunta(id_pregunta, preguntaData) {
  try {
    const response = await fetch(`${API_URL}/preguntas/${id_pregunta}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(preguntaData)
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al actualizar pregunta');
    }
    return response.json();
  } catch (error) {
    console.error('Error en updatePregunta:', error);
    throw error;
  }
}

export async function deletePregunta(id_pregunta) {
  try {
    const response = await fetch(`${API_URL}/preguntas/${id_pregunta}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    if (!response.ok) {
      throw new Error('Error al eliminar pregunta');
    }
    return response.json();
  } catch (error) {
    console.error('Error en deletePregunta:', error);
    throw error;
  }
}

// ==================== RESPUESTAS DE OPCIONES ====================
export async function getRespuestaOpcionesByPregunta(id_pregunta) {
  try {
    const response = await fetch(`${API_URL}/respuestas-opciones?id_pregunta=${id_pregunta}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    if (!response.ok) {
      throw new Error('Error al obtener opciones');
    }
    return response.json();
  } catch (error) {
    console.error('Error en getRespuestaOpcionesByPregunta:', error);
    throw error;
  }
}

export async function createRespuestaOpcion(opcionData) {
  try {
    const response = await fetch(`${API_URL}/respuestas-opciones`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(opcionData)
    });
    if (!response.ok) {
      throw new Error('Error al crear opción');
    }
    return response.json();
  } catch (error) {
    console.error('Error en createRespuestaOpcion:', error);
    throw error;
  }
}

export async function updateRespuestaOpcion(id_opcion, opcionData) {
  try {
    const response = await fetch(`${API_URL}/respuestas-opciones/${id_opcion}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(opcionData)
    });
    if (!response.ok) {
      throw new Error('Error al actualizar opción');
    }
    return response.json();
  } catch (error) {
    console.error('Error en updateRespuestaOpcion:', error);
    throw error;
  }
}

export async function deleteRespuestaOpcion(id_opcion) {
  try {
    const response = await fetch(`${API_URL}/respuestas-opciones/${id_opcion}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    if (!response.ok) {
      throw new Error('Error al eliminar opción');
    }
    return response.json();
  } catch (error) {
    console.error('Error en deleteRespuestaOpcion:', error);
    throw error;
  }
}

// ==================== RESPUESTAS DE ALUMNOS ====================
export async function enviarRespuesta(respuestaData) {
  try {
    const response = await fetch(`${API_URL}/respuestas-alumnos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(respuestaData)
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al enviar respuesta');
    }
    return response.json();
  } catch (error) {
    console.error('Error en enviarRespuesta:', error);
    throw error;
  }
}

export async function getRespuestasAlumnoActividad(id_actividad, id_matricula) {
  try {
    const response = await fetch(`${API_URL}/respuestas-alumnos/actividad/${id_actividad}/${id_matricula}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    if (!response.ok) {
      throw new Error('Error al obtener respuestas');
    }
    return response.json();
  } catch (error) {
    console.error('Error en getRespuestasAlumnoActividad:', error);
    throw error;
  }
}

// ==================== PONDERACIONES ====================
export async function getPonderacionByCurso(id_curso) {
  try {
    const response = await fetch(`${API_URL}/ponderaciones/curso/${id_curso}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    if (!response.ok) {
      throw new Error('Error al obtener ponderación');
    }
    return response.json();
  } catch (error) {
    console.error('Error en getPonderacionByCurso:', error);
    throw error;
  }
}

export async function getPonderacionById(id_ponderacion) {
  try {
    const response = await fetch(`${API_URL}/ponderaciones/${id_ponderacion}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    if (!response.ok) {
      throw new Error('Error al obtener ponderación');
    }
    return response.json();
  } catch (error) {
    console.error('Error en getPonderacionById:', error);
    throw error;
  }
}

export async function createPonderacion(ponderacionData) {
  try {
    const response = await fetch(`${API_URL}/ponderaciones`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(ponderacionData)
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al crear ponderación');
    }
    return response.json();
  } catch (error) {
    console.error('Error en createPonderacion:', error);
    throw error;
  }
}

export async function updatePonderacion(id_ponderacion, ponderacionData) {
  try {
    const response = await fetch(`${API_URL}/ponderaciones/${id_ponderacion}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(ponderacionData)
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al actualizar ponderación');
    }
    return response.json();
  } catch (error) {
    console.error('Error en updatePonderacion:', error);
    throw error;
  }
}
