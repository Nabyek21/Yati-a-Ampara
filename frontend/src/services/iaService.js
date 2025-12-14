/**
 * Servicio para comunicación con el Agente IA del backend
 */

const API_BASE = 'http://localhost:4000/api/ia';

// Importar función de resumen de módulos para detectar y redirigir
import { resumeModuleInChat } from './moduleSummaryService.js';

export async function chatConIA(mensaje, sessionId = null, contexto = null, idModulo = null) {
  try {
    // Generar sessionId si no existe
    const finalSessionId = sessionId || `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Detectar si es una solicitud de resumen de módulo
    const esResumen = /resumen\s+del?\s+m[oó]dulo\s+(\d+)/i.test(mensaje);
    
    // Si es resumen, usar el endpoint especializado que genera audio
    if (esResumen) {
      console.log('📚 Detectado resumen de módulo, usando endpoint especializado...');
      const match = mensaje.match(/resumen\s+del?\s+m[oó]dulo\s+(\d+)/i);
      const moduloId = match ? match[1] : idModulo;
      
      // Llamar a resumeModuleInChat que genera audio
      return resumeModuleInChat(moduloId, contexto?.id_curso);
    }
    
    // Else: chat normal
    const body = {
      sessionId: finalSessionId,
      mensaje,
      contexto
    };
    
    // Incluir id_modulo si está disponible
    if (idModulo) {
      body.id_modulo = idModulo;
    }
    
    const response = await fetch(`${API_BASE}/chat`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMsg = errorData.message || errorData.error || `Error: ${response.status}`;
      throw new Error(errorMsg);
    }

    const result = await response.json();
    // Retornar también el sessionId para mantenerlo en el frontend
    return {
      ...result,
      sessionId: finalSessionId
    };
  } catch (error) {
    console.error('Error en chat con IA:', error);
    throw error;
  }
}

export async function resumirCurso(idCurso, idSeccion = null) {
  try {
    const url = new URL(`${API_BASE}/resumir-curso/${idCurso}`);
    if (idSeccion) {
      url.searchParams.append('id_seccion', idSeccion);
    }

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error resumiendo curso:', error);
    throw error;
  }
}

export async function resumirActividades(idCurso, idSeccion = null) {
  try {
    const url = new URL(`${API_BASE}/resumir-actividades/${idCurso}`);
    if (idSeccion) {
      url.searchParams.append('id_seccion', idSeccion);
    }

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error resumiendo actividades:', error);
    throw error;
  }
}

export async function generarPreguntas(idCurso, cantidad = 5, idSeccion = null) {
  try {
    const response = await fetch(`${API_BASE}/generar-preguntas`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        id_curso: idCurso,
        cantidad,
        id_seccion: idSeccion
      })
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error generando preguntas:', error);
    throw error;
  }
}

export async function analizarDesempenoEstudiante(idEstudiante, idCurso) {
  try {
    const response = await fetch(
      `${API_BASE}/analizar-desempeño/${idEstudiante}/${idCurso}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error analizando desempeño:', error);
    throw error;
  }
}

export async function obtenerRecomendaciones(idEstudiante, idCurso) {
  try {
    const response = await fetch(
      `${API_BASE}/recomendaciones/${idEstudiante}/${idCurso}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error obteniendo recomendaciones:', error);
    throw error;
  }
}

export async function generarReporteCurso(idCurso, idSeccion = null) {
  try {
    const url = new URL(`${API_BASE}/reporte-curso/${idCurso}`);
    if (idSeccion) {
      url.searchParams.append('id_seccion', idSeccion);
    }

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error generando reporte:', error);
    throw error;
  }
}

export default {
  chatConIA,
  resumirCurso,
  resumirActividades,
  generarPreguntas,
  analizarDesempenoEstudiante,
  obtenerRecomendaciones,
  generarReporteCurso
};
