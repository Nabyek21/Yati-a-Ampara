/**
 * Servicio centralizado para el sistema de calificaciones
 * Maneja: actividades, calificaciones, preguntas y respuestas
 */

// Detectar URL de API
const getAPIURL = () => {
  // Intentar obtener de window si está disponible
  if (window && window.VITE_PUBLIC_API_URL) {
    return window.VITE_PUBLIC_API_URL;
  }
  // Por defecto, usar localhost en desarrollo
  return 'http://localhost:4000/api';
};

const API_URL = getAPIURL();

const getAuthHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${localStorage.getItem('token')}`
});

// ============ CALIFICACIONES / NOTAS ============

export async function obtenerCalificacionesEstudiante(id_matricula) {
  try {
    if (!id_matricula) throw new Error('ID de matrícula requerido');
    
    const response = await fetch(`${API_URL}/notas?matricula=${id_matricula}`, {
      headers: getAuthHeaders()
    });
    
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Error en obtenerCalificacionesEstudiante:', error);
    throw error;
  }
}

export async function obtenerCalificacionPorActividad(id_matricula, id_actividad) {
  try {
    if (!id_matricula || !id_actividad) {
      throw new Error('ID de matrícula e ID de actividad requeridos');
    }
    
    const response = await fetch(
      `${API_URL}/notas?matricula=${id_matricula}&actividad=${id_actividad}`,
      { headers: getAuthHeaders() }
    );
    
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    return Array.isArray(data) ? data[0] : data;
  } catch (error) {
    console.error('Error en obtenerCalificacionPorActividad:', error);
    throw error;
  }
}

export async function crearCalificacion(id_matricula, id_actividad, puntaje_obtenido) {
  try {
    if (!id_matricula || !id_actividad || puntaje_obtenido === undefined) {
      throw new Error('Parámetros requeridos faltantes');
    }
    
    const response = await fetch(`${API_URL}/notas`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ id_matricula, id_actividad, puntaje_obtenido })
    });
    
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error en crearCalificacion:', error);
    throw error;
  }
}

export async function actualizarCalificacion(id_nota, puntaje_obtenido) {
  try {
    if (!id_nota || puntaje_obtenido === undefined) {
      throw new Error('ID de nota y puntaje requeridos');
    }
    
    const response = await fetch(`${API_URL}/notas/${id_nota}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ puntaje_obtenido })
    });
    
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error en actualizarCalificacion:', error);
    throw error;
  }
}

// ============ ACTIVIDADES ============

export async function obtenerActividades(filters = {}) {
  try {
    const params = new URLSearchParams();
    if (filters.id_seccion) params.append('id_seccion', filters.id_seccion);
    if (filters.id_modulo) params.append('id_modulo', filters.id_modulo);
    if (filters.tipo) params.append('tipo', filters.tipo);
    
    const queryString = params.toString();
    const url = queryString ? `${API_URL}/actividades?${queryString}` : `${API_URL}/actividades`;
    
    const response = await fetch(url, { headers: getAuthHeaders() });
    
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Error en obtenerActividades:', error);
    throw error;
  }
}

export async function obtenerActividadPorId(id_actividad) {
  try {
    if (!id_actividad) throw new Error('ID de actividad requerido');
    
    const response = await fetch(`${API_URL}/actividades/${id_actividad}`, {
      headers: getAuthHeaders()
    });
    
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error en obtenerActividadPorId:', error);
    throw error;
  }
}

export async function crearActividad(datosActividad) {
  try {
    if (!datosActividad || !datosActividad.titulo) {
      throw new Error('Datos de actividad inválidos');
    }
    
    const response = await fetch(`${API_URL}/actividades`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(datosActividad)
    });
    
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error en crearActividad:', error);
    throw error;
  }
}

export async function actualizarActividad(id_actividad, datosActividad) {
  try {
    if (!id_actividad || !datosActividad) {
      throw new Error('ID de actividad y datos requeridos');
    }
    
    const response = await fetch(`${API_URL}/actividades/${id_actividad}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(datosActividad)
    });
    
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error en actualizarActividad:', error);
    throw error;
  }
}

// ============ PREGUNTAS ============

export async function obtenerPreguntasPorActividad(id_actividad) {
  try {
    if (!id_actividad) throw new Error('ID de actividad requerido');
    
    const response = await fetch(`${API_URL}/preguntas?id_actividad=${id_actividad}`, {
      headers: getAuthHeaders()
    });
    
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Error en obtenerPreguntasPorActividad:', error);
    throw error;
  }
}

export async function crearPregunta(datosPregunta) {
  try {
    if (!datosPregunta || !datosPregunta.titulo) {
      throw new Error('Datos de pregunta inválidos');
    }
    
    const response = await fetch(`${API_URL}/preguntas`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(datosPregunta)
    });
    
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error en crearPregunta:', error);
    throw error;
  }
}

// ============ RESPUESTAS ============

export async function obtenerRespuestasActividad(id_actividad) {
  try {
    if (!id_actividad) throw new Error('ID de actividad requerido');
    
    const response = await fetch(`${API_URL}/actividades-respuestas?id_actividad=${id_actividad}`, {
      headers: getAuthHeaders()
    });
    
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Error en obtenerRespuestasActividad:', error);
    throw error;
  }
}

export async function crearRespuesta(datosRespuesta) {
  try {
    if (!datosRespuesta || !datosRespuesta.id_matricula || !datosRespuesta.id_actividad) {
      throw new Error('Datos de respuesta inválidos');
    }
    
    const response = await fetch(`${API_URL}/actividades-respuestas`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(datosRespuesta)
    });
    
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error en crearRespuesta:', error);
    throw error;
  }
}

export async function actualizarRespuesta(id_respuesta, datosRespuesta) {
  try {
    if (!id_respuesta || !datosRespuesta) {
      throw new Error('ID de respuesta y datos requeridos');
    }
    
    const response = await fetch(`${API_URL}/actividades-respuestas/${id_respuesta}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(datosRespuesta)
    });
    
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error en actualizarRespuesta:', error);
    throw error;
  }
}

// ============ UTILIDADES ============

export function calcularPromedioNotas(notas) {
  if (!Array.isArray(notas) || notas.length === 0) return 0;
  
  const suma = notas.reduce((total, nota) => {
    return total + (parseFloat(nota.puntaje_obtenido) || 0);
  }, 0);
  
  return parseFloat((suma / notas.length).toFixed(2));
}

export function obtenerEtiquetaCalificacion(puntajeObtenido, puntajeMaximo) {
  const puntaje = parseFloat(puntajeObtenido) || 0;
  const maximo = parseFloat(puntajeMaximo) || 1;
  
  if (puntaje === 0 || puntajeObtenido === null || puntajeObtenido === undefined) {
    return 'Pendiente';
  }
  
  const porcentaje = (puntaje / maximo) * 100;
  
  if (porcentaje >= 90) return 'Excelente';
  if (porcentaje >= 80) return 'Buena';
  if (porcentaje >= 70) return 'Satisfactoria';
  if (porcentaje >= 60) return 'Regular';
  return 'Baja';
}

export function obtenerClaseCalificacion(puntajeObtenido, puntajeMaximo) {
  const puntaje = parseFloat(puntajeObtenido) || 0;
  const maximo = parseFloat(puntajeMaximo) || 1;
  
  if (puntaje === 0 || puntajeObtenido === null || puntajeObtenido === undefined) {
    return 'calificacion-pendiente';
  }
  
  const porcentaje = (puntaje / maximo) * 100;
  
  if (porcentaje >= 90) return 'calificacion-excelente';
  if (porcentaje >= 80) return 'calificacion-buena';
  if (porcentaje >= 70) return 'calificacion-satisfactoria';
  if (porcentaje >= 60) return 'calificacion-regular';
  return 'calificacion-baja';
}

export function calcularPorcentaje(puntajeObtenido, puntajeMaximo) {
  const puntaje = parseFloat(puntajeObtenido) || 0;
  const maximo = parseFloat(puntajeMaximo) || 1;
  if (!puntaje || !maximo) return 0;
  return parseFloat(((puntaje / maximo) * 100).toFixed(1));
}

// ============ CÁLCULO PONDERADO DE CALIFICACIONES ============

/**
 * Calcula el promedio ponderado basado en tipos de actividad:
 * - 3 Prácticas Calificadas (PC): 30% cada una (10% del total)
 * - 1 Examen Final (EF): 40%
 * 
 * Fórmula: Promedio = (PC1*0.10 + PC2*0.10 + PC3*0.10 + EF*0.40 + Otras*0.20)
 */
export function calcularPromedioPonderado(notas) {
  if (!Array.isArray(notas) || notas.length === 0) return 0;

  const actividades = {
    pc: [],        // Prácticas Calificadas
    ef: null,      // Examen Final
    otras: []      // Otras actividades
  };

  // Clasificar notas por tipo
  notas.forEach(nota => {
    const tipo = (nota.tipo || '').toLowerCase().trim();
    const puntaje = parseFloat(nota.puntaje_obtenido) || 0;
    const maximo = parseFloat(nota.puntaje_maximo) || 1;
    const porcentaje = (puntaje / maximo) * 100;

    if (tipo.includes('pc') || tipo.includes('práctica')) {
      actividades.pc.push(porcentaje);
    } else if (tipo.includes('examen') || tipo.includes('final') || tipo.includes('ef')) {
      actividades.ef = porcentaje;
    } else {
      actividades.otras.push(porcentaje);
    }
  });

  let promedioPonderado = 0;
  let contadores = 0;

  // Calcular promedio de PCs (máximo 3)
  if (actividades.pc.length > 0) {
    const pcPromedio = actividades.pc.slice(0, 3).reduce((a, b) => a + b, 0) / Math.min(3, actividades.pc.length);
    const pcCount = Math.min(3, actividades.pc.length);
    promedioPonderado += pcPromedio * (pcCount * 0.10); // 10% cada una
  }

  // Examen final (40%)
  if (actividades.ef !== null) {
    promedioPonderado += actividades.ef * 0.40;
  }

  // Otras actividades (20%)
  if (actividades.otras.length > 0) {
    const otrasPromedio = actividades.otras.reduce((a, b) => a + b, 0) / actividades.otras.length;
    promedioPonderado += otrasPromedio * 0.20;
  }

  return parseFloat(promedioPonderado.toFixed(1));
}

/**
 * Obtiene desglose de calificaciones por tipo
 */
export function obtenerDesglosePorTipo(notas) {
  const desglose = {
    practicas: {
      notas: [],
      promedio: 0,
      peso: 0.30 // 3 PCs x 10% cada una
    },
    examenFinal: {
      nota: null,
      peso: 0.40
    },
    otras: {
      notas: [],
      promedio: 0,
      peso: 0.30
    }
  };

  if (!Array.isArray(notas)) return desglose;

  notas.forEach(nota => {
    const tipo = (nota.tipo || '').toLowerCase().trim();
    const puntaje = parseFloat(nota.puntaje_obtenido) || 0;
    const maximo = parseFloat(nota.puntaje_maximo) || 1;
    const porcentaje = (puntaje / maximo) * 100;

    if (tipo.includes('pc') || tipo.includes('práctica')) {
      if (desglose.practicas.notas.length < 3) {
        desglose.practicas.notas.push({
          nombre: nota.nombre_actividad || 'PC',
          valor: porcentaje
        });
      }
    } else if (tipo.includes('examen') || tipo.includes('final') || tipo.includes('ef')) {
      desglose.examenFinal.nota = {
        nombre: nota.nombre_actividad || 'Examen Final',
        valor: porcentaje
      };
    } else {
      desglose.otras.notas.push({
        nombre: nota.nombre_actividad || 'Otra',
        valor: porcentaje
      });
    }
  });

  // Calcular promedios
  if (desglose.practicas.notas.length > 0) {
    desglose.practicas.promedio = parseFloat(
      (desglose.practicas.notas.reduce((sum, n) => sum + n.valor, 0) / desglose.practicas.notas.length).toFixed(1)
    );
  }

  if (desglose.otras.notas.length > 0) {
    desglose.otras.promedio = parseFloat(
      (desglose.otras.notas.reduce((sum, n) => sum + n.valor, 0) / desglose.otras.notas.length).toFixed(1)
    );
  }

  return desglose;
}

// ============ CONFIGURACIÓN DE PESOS ============

/**
 * Obtiene la configuración de pesos desde la BD
 */
export async function obtenerConfiguracionPesos(id_seccion) {
  try {
    if (!id_seccion) {
      console.warn('⚠️ ID de sección no proporcionado, usando valores por defecto');
      return getConfiguracionPesosDefault();
    }

    const response = await fetch(`${API_URL}/pesos/resumen/${id_seccion}`, {
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      console.warn(`⚠️ No se pudo obtener configuración (${response.status}), usando valores por defecto`);
      return getConfiguracionPesosDefault();
    }

    const config = await response.json();
    console.log('✅ Configuración de pesos obtenida:', config);
    return config;
  } catch (error) {
    console.warn('⚠️ Error obteniendo configuración de pesos:', error);
    return getConfiguracionPesosDefault();
  }
}

/**
 * Retorna configuración de pesos por defecto
 */
export function getConfiguracionPesosDefault() {
  return {
    tipos: {
      pc: {
        peso_minimo: 10,
        peso_maximo: 10,
        peso_promedio: 10,
        cantidad_maxima: 3
      },
      examen: {
        peso_minimo: 40,
        peso_maximo: 40,
        peso_promedio: 40,
        cantidad_maxima: 1
      },
      tarea: {
        peso_minimo: 15,
        peso_maximo: 30,
        peso_promedio: 22.5,
        cantidad_maxima: null
      },
      quiz: {
        peso_minimo: 10,
        peso_maximo: 20,
        peso_promedio: 15,
        cantidad_maxima: null
      }
    },
    pesoTotal: 100
  };
}

/**
 * Calcula promedio ponderado usando configuración dinámica
 * @param {Array} notas - Array de objetos con notas
 * @param {Object} config - Configuración de pesos (si no se proporciona, usa default)
 * @returns {number} Promedio ponderado
 */
export function calcularPromedioPonderadoDinamico(notas, config = null) {
  if (!config) {
    config = getConfiguracionPesosDefault();
  }

  if (!Array.isArray(notas) || notas.length === 0) {
    return 0;
  }

  const actividades = {
    pc: [],
    examen: [],
    tarea: [],
    quiz: [],
    otras: []
  };

  // Clasificar actividades y convertir a porcentajes
  notas.forEach(nota => {
    if (!nota) return;

    let puntajeObt = parseFloat(nota.puntaje_obtenido) || 0;
    let puntajeMax = parseFloat(nota.puntaje_maximo) || 0;

    // Arreglar datos invertidos
    if (puntajeMax === 0 && puntajeObt > 0) {
      [puntajeObt, puntajeMax] = [puntajeMax, puntajeObt];
      console.warn('⚠️ Datos invertidos detectados y corregidos en:', nota.nombre_actividad);
    }

    if (puntajeMax === 0) puntajeMax = 1; // Evitar división por cero

    const porcentaje = (puntajeObt / puntajeMax) * 100;
    const tipo = (nota.tipo || '').toLowerCase().trim();

    if (tipo.includes('pc') || tipo.includes('práctica')) {
      actividades.pc.push(porcentaje);
    } else if (tipo.includes('examen') || tipo.includes('final') || tipo.includes('ef')) {
      actividades.examen.push(porcentaje);
    } else if (tipo.includes('tarea')) {
      actividades.tarea.push(porcentaje);
    } else if (tipo.includes('quiz')) {
      actividades.quiz.push(porcentaje);
    } else {
      actividades.otras.push(porcentaje);
    }
  });

  let promedioPonderado = 0;

  // Procesar cada tipo según configuración
  if (actividades.pc.length > 0) {
    const pcConfig = config.tipos.pc;
    const maxPC = pcConfig.cantidad_maxima || actividades.pc.length;
    const pcUsadas = actividades.pc.slice(0, maxPC);
    const pcPromedio = pcUsadas.reduce((a, b) => a + b, 0) / pcUsadas.length;
    const pesoPC = pcConfig.peso_promedio * (pcUsadas.length / maxPC);
    promedioPonderado += (pcPromedio * pesoPC) / 100;
  }

  if (actividades.examen.length > 0) {
    const examenConfig = config.tipos.examen;
    const examenPromedio = actividades.examen.reduce((a, b) => a + b, 0) / actividades.examen.length;
    promedioPonderado += (examenPromedio * examenConfig.peso_promedio) / 100;
  }

  if (actividades.tarea.length > 0) {
    const tareaConfig = config.tipos.tarea;
    const tareaPromedio = actividades.tarea.reduce((a, b) => a + b, 0) / actividades.tarea.length;
    promedioPonderado += (tareaPromedio * tareaConfig.peso_promedio) / 100;
  }

  if (actividades.quiz.length > 0) {
    const quizConfig = config.tipos.quiz;
    const quizPromedio = actividades.quiz.reduce((a, b) => a + b, 0) / actividades.quiz.length;
    promedioPonderado += (quizPromedio * quizConfig.peso_promedio) / 100;
  }

  if (actividades.otras.length > 0) {
    const otrasPromedio = actividades.otras.reduce((a, b) => a + b, 0) / actividades.otras.length;
    // Las "otras" se distribuyen entre el peso restante
    promedioPonderado += (otrasPromedio * 10) / 100; // 10% por defecto
  }

  return parseFloat(promedioPonderado.toFixed(1));
}

