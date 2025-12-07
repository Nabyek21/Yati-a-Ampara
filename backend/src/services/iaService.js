import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { pool } from '../config/database.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Servicio para integrar con APIs de IA (OpenAI, Anthropic, etc)
 * Para usar este servicio necesitas configurar:
 * - IA_PROVIDER: 'openai', 'anthropic', 'huggingface', etc.
 * - IA_API_KEY: Tu clave API
 * - IA_MODEL: El modelo a usar (ej: gpt-3.5-turbo, claude-3-sonnet)
 */

const IA_PROVIDER = process.env.IA_PROVIDER || 'openai';
const IA_API_KEY = process.env.IA_API_KEY;
const IA_MODEL = process.env.IA_MODEL || 'gpt-3.5-turbo';
const MAX_RETRIES = 3;

// Rutas de uploads - la principal está en src/uploads
const UPLOADS_DIR = path.join(__dirname, '../uploads');
const UPLOADS_RAIZ = path.join(__dirname, '../../uploads');

// Sistema de almacenamiento de contexto de conversación (en producción usar Redis/BD)
const conversationContexts = new Map();

/**
 * Leer contenido de documentos en las carpetas uploads
 * Soporta: txt, md, pdf, docx, doc
 * Busca en: src/uploads/modulos/modulo_X/
 */
function obtenerContenidoDeUploads(id_modulo = null) {
  try {
    const documentos = [];
    
    // Si no hay módulo especificado, buscar en ambas
    const carpetasABuscar = [];
    
    if (id_modulo) {
      // Buscar específicamente en carpeta del módulo
      carpetasABuscar.push(path.join(UPLOADS_DIR, 'modulos', `modulo_${id_modulo}`));
    } else {
      // Buscar en todos los módulos
      const modulosDir = path.join(UPLOADS_DIR, 'modulos');
      if (fs.existsSync(modulosDir)) {
        const modulos = fs.readdirSync(modulosDir);
        modulos.forEach(modulo => {
          carpetasABuscar.push(path.join(modulosDir, modulo));
        });
      }
    }
    
    // También buscar en carpeta genérica (uploads/actividades) para compatibilidad
    carpetasABuscar.push(path.join(UPLOADS_DIR, 'actividades'));

    for (const carpeta of carpetasABuscar) {
      if (!fs.existsSync(carpeta)) {
        continue;
      }

      try {
        const archivos = fs.readdirSync(carpeta);

        for (const archivo of archivos) {
          const rutaArchivo = path.join(carpeta, archivo);
          
          try {
            const stats = fs.statSync(rutaArchivo);
            
            // Saltar carpetas
            if (stats.isDirectory()) continue;

            const ext = path.parse(archivo).ext.toLowerCase();

            if (ext === '.pdf') {
              // Para PDFs, creamos una referencia
              documentos.push({
                tipo: 'documento-pdf',
                titulo: archivo,
                descripcion: `DOCUMENTO PDF SUBIDO: "${archivo}". Este archivo contiene material importante del curso.`,
                ruta: rutaArchivo,
                formato: 'pdf',
                tamano: stats.size,
                carpeta: carpeta.includes('modulos') ? 'módulo' : 'general'
              });
            } else if (['.txt', '.md', '.docx', '.doc'].includes(ext)) {
              // Leer archivos de texto
              try {
                const contenido = fs.readFileSync(rutaArchivo, 'utf-8');
                
                // Tomar hasta 3000 caracteres
                const contenidoTruncado = contenido.length > 3000 
                  ? contenido.substring(0, 3000) + '\n\n[... más contenido disponible]'
                  : contenido;

                documentos.push({
                  tipo: 'documento-texto',
                  titulo: archivo,
                  descripcion: contenidoTruncado,
                  contenido: contenidoTruncado,
                  ruta: rutaArchivo,
                  formato: ext.substring(1),
                  tamano: stats.size,
                  carpeta: carpeta.includes('modulos') ? 'módulo' : 'general'
                });
              } catch (readErr) {
                console.error(`Error al leer ${archivo}:`, readErr.message);
              }
            }
          } catch (err) {
            console.error(`Error al leer archivo ${archivo}:`, err.message);
          }
        }
      } catch (err) {
        // Silencioso si la carpeta no existe o hay error
      }
    }

    console.log(`✓ Documentos cargados: ${documentos.length} archivos encontrados`);
    documentos.forEach(d => console.log(`  - [${d.carpeta}] ${d.tipo}: ${d.titulo}`));
    return documentos;
  } catch (error) {
    console.error('Error al obtener contenidos de uploads:', error.message);
    return [];
  }
}

/**
 * Procesar PDFs - Por ahora solo referenciamos los PDFs
 * En el futuro se podría usar una librería mejor configurada
 */
async function procesarPDFs(documentos) {
  // Para PDFs, mantenemos las referencias tal cual
  // Los documentos de texto ya tienen el contenido extraído
  return documentos.map(doc => {
    // Limpiar el buffer si existe (no lo necesitamos en el prompt)
    if (doc.contenidoBuffer) {
      return { ...doc, contenidoBuffer: undefined };
    }
    return doc;
  });
}

/**
 * Resumir contenido de curso usando IA
 * @param {Array} contenidos - Array de objetos contenido { tipo, titulo, descripcion, url_contenido }
 * @param {Object} cursoInfo - Información del curso { nombre, descripcion }
 * @returns {Promise<Object>} - { resumen, puntosClave, tiempoEstimado, sugerencias }
 */
export async function resumirContenidoCurso(contenidos, cursoInfo = {}) {
  if (!IA_API_KEY) {
    return generateLocalResumen(contenidos, cursoInfo);
  }

  const prompt = construirPrompt(contenidos, cursoInfo);
  
  try {
    if (IA_PROVIDER === 'openai') {
      return await consultarOpenAI(prompt);
    } else if (IA_PROVIDER === 'anthropic') {
      return await consultarAnthropic(prompt);
    } else if (IA_PROVIDER === 'huggingface') {
      return await consultarHuggingFace(prompt);
    } else {
      return generateLocalResumen(contenidos, cursoInfo);
    }
  } catch (error) {
    console.error('Error en servicio IA:', error);
    // Fallback a generación local
    return generateLocalResumen(contenidos, cursoInfo);
  }
}

/**
 * Generar resumen de actividades y preguntas
 */
export async function resumirActividades(actividades, preguntasData = []) {
  const prompt = `
Analiza las siguientes actividades educativas y genera un resumen estructurado:

ACTIVIDADES:
${actividades.map((a, i) => `
${i + 1}. ${a.titulo}
   - Descripción: ${a.descripcion || 'No especificada'}
   - Tipo: ${a.tipo || 'General'}
   - Fecha Entrega: ${a.fecha_entrega || 'No especificada'}
`).join('\n')}

PREGUNTAS ASOCIADAS:
${preguntasData.length > 0 ? preguntasData.map((p, i) => `
${i + 1}. ${p.pregunta}
   - Tipo: ${p.tipo_pregunta || 'Abierta'}
   - Puntos: ${p.puntos || 0}
`).join('\n') : 'No hay preguntas específicas'}

Genera un resumen JSON con esta estructura:
{
  "resumenGeneral": "descripción breve del conjunto de actividades",
  "actividadesKey": ["punto clave 1", "punto clave 2", ...],
  "dificultadEstimada": "baja|media|alta",
  "tiempoTotalEstimado": "X horas",
  "sugerencias": ["sugerencia 1", "sugerencia 2", ...],
  "skillsDesarrollados": ["skill1", "skill2", ...]
}
  `;

  try {
    if (!IA_API_KEY) return generateLocalActivitiesResumen(actividades);
    
    if (IA_PROVIDER === 'openai') {
      return await consultarOpenAI(prompt);
    } else if (IA_PROVIDER === 'anthropic') {
      return await consultarAnthropic(prompt);
    }
  } catch (error) {
    console.error('Error resumiendo actividades:', error);
    return generateLocalActivitiesResumen(actividades);
  }
}

/**
 * Generar preguntas de estudio automáticas basadas en contenido
 */
export async function generarPreguntasEstudio(contenidos, cantidadPreguntas = 5) {
  const contenidoTexto = contenidos
    .filter(c => c.tipo === 'texto' || c.tipo === 'pdf')
    .map(c => `${c.titulo}: ${c.descripcion}`)
    .join('\n');

  if (!contenidoTexto) {
    return { preguntas: [], error: 'No hay contenido de texto para generar preguntas' };
  }

  const prompt = `
Basándote en el siguiente contenido educativo, genera ${cantidadPreguntas} preguntas de estudio bien formuladas.

CONTENIDO:
${contenidoTexto}

Responde en formato JSON:
{
  "preguntas": [
    {
      "pregunta": "pregunta aquí",
      "tipo": "abierta|multiple|verdadero-falso",
      "dificultad": "baja|media|alta",
      "palabrasClave": ["palabra1", "palabra2"]
    }
  ]
}
  `;

  try {
    if (!IA_API_KEY) return { preguntas: [], info: 'IA no configurada' };
    
    if (IA_PROVIDER === 'openai') {
      return await consultarOpenAI(prompt);
    }
  } catch (error) {
    console.error('Error generando preguntas:', error);
    return { preguntas: [], error: error.message };
  }
}

/**
 * Analizar desempeño del estudiante
 */
export async function analizarDesempenoEstudiante(respuestas, contenidosCurso) {
  const prompt = `
Analiza el desempeño de un estudiante basado en sus respuestas:

RESPUESTAS ENVIADAS:
${respuestas.map(r => `- Pregunta: ${r.pregunta}\n  Respuesta: ${r.respuesta}\n  Puntuación: ${r.puntuacion}%`).join('\n')}

CONTENIDO DEL CURSO:
${contenidosCurso.map(c => `- ${c.titulo}: ${c.descripcion}`).join('\n')}

Genera un análisis JSON:
{
  "promedioGeneral": 85,
  "fortalezas": ["tema1", "tema2"],
  "areasDesarrollo": ["tema3", "tema4"],
  "recomendaciones": ["recomendación1", "recomendación2"],
  "proximosPasos": ["paso1", "paso2"]
}
  `;

  try {
    if (!IA_API_KEY) return generateLocalPerformanceAnalysis(respuestas);
    
    if (IA_PROVIDER === 'openai') {
      return await consultarOpenAI(prompt);
    }
  } catch (error) {
    console.error('Error analizando desempeño:', error);
    return generateLocalPerformanceAnalysis(respuestas);
  }
}

// ============ FUNCIONES AUXILIARES ============

function construirPrompt(contenidos, cursoInfo) {
  return `
Por favor, genera un resumen académico estructurado del siguiente contenido de curso.

INFORMACIÓN DEL CURSO:
- Nombre: ${cursoInfo.nombre || 'Curso Sin Nombre'}
- Descripción: ${cursoInfo.descripcion || 'No especificada'}
- Semanas: ${cursoInfo.semanas || 'No especificado'}

CONTENIDO DEL CURSO:
${contenidos.map((c, i) => `
${i + 1}. [${c.tipo.toUpperCase()}] ${c.titulo}
   ${c.descripcion ? `Descripción: ${c.descripcion}` : ''}
   ${c.url_contenido ? `URL: ${c.url_contenido}` : ''}
`).join('\n')}

Proporciona la respuesta en formato JSON con la siguiente estructura:
{
  "resumen": "Un párrafo conciso (100-150 palabras) que resuma el contenido general del curso",
  "temas_principales": ["tema1", "tema2", "tema3", "tema4"],
  "objetivos_aprendizaje": [
    "Objetivo 1",
    "Objetivo 2",
    "Objetivo 3"
  ],
  "requisitos_previos": ["requisito1", "requisito2"],
  "habilidades_desarrolladas": ["habilidad1", "habilidad2", "habilidad3"],
  "tiempo_estimado": "X horas",
  "nivel_dificultad": "básico|intermedio|avanzado",
  "recursos_recomendados": ["recurso1", "recurso2"],
  "sugerencias_estudio": ["sugerencia1", "sugerencia2"],
  "palabras_clave": ["palabra1", "palabra2", "palabra3"]
}
  `;
}

async function consultarOpenAI(prompt) {
  const url = 'https://api.openai.com/v1/chat/completions';
  
  for (let intento = 0; intento < MAX_RETRIES; intento++) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${IA_API_KEY}`
        },
        body: JSON.stringify({
          model: IA_MODEL,
          messages: [
            {
              role: 'system',
              content: 'Eres un experto en educación y análisis de contenido académico. Responde siempre en formato JSON válido.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 2000
        })
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`OpenAI API Error: ${response.status} - ${error}`);
      }

      const data = await response.json();
      const content = data.choices[0].message.content;
      
      // Intentar parsear como JSON
      try {
        return JSON.parse(content);
      } catch {
        return { resumen: content, raw: true };
      }
    } catch (error) {
      if (intento === MAX_RETRIES - 1) throw error;
      await delay(1000 * (intento + 1)); // Backoff exponencial
    }
  }
}

async function consultarAnthropic(prompt) {
  const url = 'https://api.anthropic.com/v1/messages';
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': IA_API_KEY,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: IA_MODEL || 'claude-3-sonnet-20240229',
      max_tokens: 2000,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Anthropic API Error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  const content = data.content[0].text;
  
  try {
    return JSON.parse(content);
  } catch {
    return { resumen: content, raw: true };
  }
}

async function consultarHuggingFace(prompt) {
  const url = `https://api-inference.huggingface.co/models/${IA_MODEL}`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${IA_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ inputs: prompt })
  });

  if (!response.ok) {
    throw new Error(`HuggingFace API Error: ${response.status}`);
  }

  const data = await response.json();
  return { resumen: data[0]?.generated_text || data };
}

function generateLocalResumen(contenidos, cursoInfo) {
  const tipos = {};
  let totalRecursos = 0;

  contenidos.forEach(c => {
    tipos[c.tipo] = (tipos[c.tipo] || 0) + 1;
    totalRecursos++;
  });

  const tiempoEstimado = Math.ceil(totalRecursos * 1.5);

  return {
    resumen: `Este curso contiene ${totalRecursos} recursos educativos distribuidos en varios formatos. ${cursoInfo.nombre ? `El curso "${cursoInfo.nombre}" proporciona` : 'Se incluye'} contenido variado para una experiencia de aprendizaje completa.`,
    temas_principales: contenidos
      .slice(0, 5)
      .map(c => c.titulo)
      .filter((v, i, a) => a.indexOf(v) === i),
    objetivos_aprendizaje: [
      'Comprender los conceptos fundamentales del curso',
      'Aplicar los conocimientos adquiridos en ejercicios prácticos',
      'Desarrollar habilidades críticas en el tema'
    ],
    requisitos_previos: ['Conocimientos básicos del tema', 'Acceso a recursos'],
    habilidades_desarrolladas: ['Comprensión conceptual', 'Pensamiento crítico', 'Aplicación práctica'],
    tiempo_estimado: `${tiempoEstimado} horas`,
    nivel_dificultad: 'intermedio',
    recursos_recomendados: Object.entries(tipos).map(([tipo, count]) => `${count} ${tipo}(s)`),
    sugerencias_estudio: [
      'Revisar el contenido en el orden presentado',
      'Tomar notas durante el estudio',
      'Completar todas las actividades propuestas'
    ],
    palabras_clave: contenidos
      .filter(c => c.descripcion)
      .map(c => c.descripcion.split(' ').slice(0, 2))
      .flat()
      .slice(0, 5)
  };
}

function generateLocalActivitiesResumen(actividades) {
  const totalActividades = actividades.length;
  const tiempoPromedio = totalActividades * 30; // 30 minutos por actividad

  return {
    resumenGeneral: `Se han identificado ${totalActividades} actividades de aprendizaje. Estas están diseñadas para reforzar los conceptos clave del curso.`,
    actividadesKey: actividades.slice(0, 3).map(a => a.titulo || `Actividad ${a.id_actividad}`),
    dificultadEstimada: 'media',
    tiempoTotalEstimado: `${Math.ceil(tiempoPromedio / 60)} horas`,
    sugerencias: [
      'Completar las actividades en orden secuencial',
      'Revisar la retroalimentación después de cada actividad',
      'Consultar con el docente si hay dudas'
    ],
    skillsDesarrollados: ['Aplicación práctica', 'Resolución de problemas', 'Pensamiento crítico']
  };
}

function generateLocalPerformanceAnalysis(respuestas) {
  const totalRespuestas = respuestas.length;
  const promedio = respuestas.reduce((sum, r) => sum + (r.puntuacion || 0), 0) / totalRespuestas;

  return {
    promedioGeneral: Math.round(promedio),
    fortalezas: ['Comprensión general del contenido', 'Participación activa'],
    areasDesarrollo: ['Profundización en conceptos específicos', 'Práctica adicional recomendada'],
    recomendaciones: [
      'Revisar los temas con puntuaciones más bajas',
      'Practicar con ejercicios adicionales',
      'Consultar tutorías disponibles'
    ],
    proximosPasos: [
      'Completar la retroalimentación',
      'Planificar sesiones de estudio',
      'Participar en grupos de apoyo'
    ]
  };
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Chat interactivo con el agente IA sobre contenido del curso
 * @param {string} sessionId - ID único de la sesión de conversación
 * @param {string} mensaje - Pregunta/mensaje del usuario
 * @param {Array} contenido - Contexto de módulos y contenido
 * @param {Object} opciones - Opciones adicionales
 * @returns {Promise<Object>} - { respuesta, tipo, sugerencias }
 */
/**
 * Detectar si el mensaje es una solicitud de resumen de módulo
 * Ej: "Resumen del módulo 1", "Dime sobre el módulo de Introducción"
 * Retorna: { esResumen: bool, nombreModulo: string, idModulo: number }
 */
function detectarSolicitudResumenModulo(mensaje) {
  const patronesResumen = [
    /resumen\s+d(?:el|e)\s+(?:módulo|modulo|m)\s+(?:"?([^"]+)"?|(\d+))/i,
    /cuéntame\s+(?:del|de)\s+(?:módulo|modulo|m)\s+(?:"?([^"]+)"?|(\d+))/i,
    /háblame\s+(?:del|de)\s+(?:módulo|modulo|m)\s+(?:"?([^"]+)"?|(\d+))/i,
    /(?:módulo|modulo)\s+(?:"?([^"]+)"?|(\d+))\s+(?:resumen|explicación|contenido)/i,
    /¿cuál\s+es\s+el\s+contenido\s+del\s+(?:módulo|modulo)\s+(?:"?([^"]+)"?|(\d+))/i
  ];

  for (const patron of patronesResumen) {
    const match = mensaje.match(patron);
    if (match) {
      const nombreONumero = match[1] || match[2];
      return {
        esResumen: true,
        referencia: nombreONumero,
        esNumero: /^\d+$/.test(nombreONumero)
      };
    }
  }

  return { esResumen: false };
}

/**
 * Buscar módulo en la BD por número o nombre
 */
async function buscarModuloPorReferencia(referencia, id_curso = null, id_seccion = null) {
  try {
    let query = 'SELECT * FROM modulos WHERE ';
    const params = [];

    // Si es un número, buscar por orden o id
    if (/^\d+$/.test(referencia)) {
      query += '(id_modulo = ? OR orden = ?) ';
      params.push(parseInt(referencia), parseInt(referencia));
    } else {
      // Si es texto, buscar por nombre/título
      query += '(titulo LIKE ? OR nombre LIKE ?)';
      params.push(`%${referencia}%`, `%${referencia}%`);
    }

    // Filtrar por curso si se proporciona
    if (id_curso) {
      query += ' AND id_curso = ?';
      params.push(id_curso);
    }

    query += ' LIMIT 1';

    try {
      const [modulos] = await pool.query(query, params);
      console.log(`✓ Búsqueda de módulo: ${modulos?.length > 0 ? 'ENCONTRADO' : 'NO ENCONTRADO'}`);
      return modulos?.[0] || null;
    } catch (dbError) {
      if (dbError.code === 'ER_NO_SUCH_TABLE' || dbError.sqlState === '42S02') {
        console.log('⚠️  Tabla "modulos" no encontrada');
      }
      throw dbError;
    }
  } catch (error) {
    console.error('Error buscando módulo:', error.message);
    return null;
  }
}

/**
 * Obtener contenido de un módulo específico
 * Combina: BD (modulo_contenido) + Archivos subidos
 */
async function obtenerContenidoDeModulo(id_modulo) {
  try {
    const contenidosFinales = [];

    // 1. Obtener contenido de la BD
    try {
      const [contenidosBD] = await pool.query(
        'SELECT * FROM modulo_contenido WHERE id_modulo = ? ORDER BY orden',
        [id_modulo]
      );
      
      if (contenidosBD && contenidosBD.length > 0) {
        console.log(`✓ Contenido de BD: ${contenidosBD.length} items`);
        
        // Convertir contenido de BD al formato del sistema
        contenidosBD.forEach(item => {
          contenidosFinales.push({
            tipo: 'contenido-bd',
            titulo: item.titulo,
            descripcion: item.descripcion || `Contenido tipo: ${item.tipo}`,
            contenido: item.descripcion || item.url_contenido || 'Contenido disponible',
            url: item.url_contenido,
            archivo: item.archivo,
            tipoContenido: item.tipo,
            orden: item.orden
          });
        });
      }
    } catch (dbError) {
      console.log('⚠️  No se encontró contenido en BD para módulo:', id_modulo);
    }

    // 2. Obtener archivos subidos específicamente para este módulo
    try {
      const archivosUploads = obtenerContenidoDeUploads(id_modulo);
      if (archivosUploads && archivosUploads.length > 0) {
        console.log(`✓ Archivos de uploads para módulo ${id_modulo}: ${archivosUploads.length} archivos`);
        contenidosFinales.push(...archivosUploads);
      }
    } catch (uploadError) {
      console.log('⚠️  Error al obtener archivos:', uploadError.message);
    }

    console.log(`✓ Total de contenido para módulo ${id_modulo}: ${contenidosFinales.length} items`);
    return contenidosFinales;
  } catch (error) {
    console.error('Error obteniendo contenido del módulo:', error.message);
    return [];
  }
}

export async function chatContenido(sessionId, mensaje, contenido, opciones = {}) {
  try {
    // Detectar si es solicitud de resumen de módulo
    const deteccion = detectarSolicitudResumenModulo(mensaje);
    
    let contenidoFinal = [...(contenido || [])];
    let instruccionEspecial = '';

    if (deteccion.esResumen) {
      console.log(`📚 Solicitud de resumen detectada: ${deteccion.referencia}`);
      
      // Buscar el módulo
      const modulo = await buscarModuloPorReferencia(
        deteccion.referencia,
        opciones.id_curso,
        opciones.id_seccion
      );

      if (modulo) {
        console.log(`✓ Módulo encontrado en BD: ${modulo.titulo || modulo.nombre}`);
        
        // Obtener contenido del módulo
        const contenidoModulo = await obtenerContenidoDeModulo(modulo.id_modulo);
        console.log(`✓ Contenido del módulo: ${contenidoModulo.length} items`);
        
        // Usar solo el contenido del módulo solicitado
        contenidoFinal = contenidoModulo;
        
        // Contar tipos de contenido
        const contadores = {
          bd: contenidoModulo.filter(c => c.tipo === 'contenido-bd').length,
          pdf: contenidoModulo.filter(c => c.tipo === 'documento-pdf').length,
          texto: contenidoModulo.filter(c => c.tipo === 'documento-texto').length
        };
        
        instruccionEspecial = `\n\n⭐ INSTRUCCIÓN ESPECIAL: El usuario pidió un RESUMEN DEL MÓDULO "${modulo.titulo || modulo.nombre}".

RECURSOS DISPONIBLES:
- Contenido de la BD: ${contadores.bd} items
- Archivos PDF: ${contadores.pdf} documentos
- Archivos de Texto (TXT/MD): ${contadores.texto} documentos

Proporciona un resumen ESTRUCTURADO que incluya:
1. Descripción general del módulo
2. Temas principales cubiertos (basados en los contenidos disponibles)
3. Conceptos clave
4. Objetivos de aprendizaje
5. Recursos disponibles
6. Duración estimada

Sé detallado pero mantén brevedad (máx 4 párrafos). Asegúrate de incluir referencias a los materiales disponibles.`;
      } else {
        console.log(`⚠️  No se encontró módulo en BD, pero continuaremos con contenido de archivos subidos`);
        
        // El módulo no existe en BD, pero podemos responder con los documentos disponibles
        instruccionEspecial = `\n\n⭐ NOTA: El usuario pidió un resumen del módulo "${deteccion.referencia}". 
        No tenemos información en la base de datos sobre este módulo, pero te proporciono el contenido disponible 
        (archivos subidos por el docente). Responde basándote en lo que tenemos disponible.
        Si no hay contenido suficiente, sugiere que el docente suba los materiales del módulo.`;
      }
    }

    // Obtener contexto de conversación anterior
    let contextoConversacion = conversationContexts.get(sessionId) || [];
    
    // Limitar a últimos 10 mensajes para no sobrecargar
    if (contextoConversacion.length > 10) {
      contextoConversacion = contextoConversacion.slice(-10);
    }

    // Agregar documentos de uploads al contenido
    let documentosUploads = obtenerContenidoDeUploads(opciones.id_seccion);
    
    // Procesar PDFs de forma asincrónica
    documentosUploads = await procesarPDFs(documentosUploads);
    
    const contenidoCompleto = [...contenidoFinal, ...documentosUploads];

    const prompt = construirPromptChat(mensaje, contenidoCompleto, contextoConversacion, opciones) + instruccionEspecial;
    
    let respuesta;
    try {
      if (IA_API_KEY && IA_PROVIDER === 'openai') {
        respuesta = await consultarOpenAIChat(prompt, contextoConversacion);
      } else if (IA_API_KEY && IA_PROVIDER === 'anthropic') {
        respuesta = await consultarAnthropicChat(prompt, contextoConversacion);
      } else if (IA_API_KEY && IA_PROVIDER === 'gemini') {
        console.log('📡 Consultando Gemini...');
        respuesta = await consultarGeminiChat(prompt, contextoConversacion);
        console.log('✅ Respuesta de Gemini recibida');
      } else {
        respuesta = generarRespuestaLocal(mensaje, contenidoCompleto);
      }
    } catch (apiError) {
      console.error('❌ Error en API IA:', apiError.message);
      console.log('📝 Usando respuesta local como fallback');
      // Fallback a respuesta local si la API falla
      respuesta = generarRespuestaLocal(mensaje, contenidoCompleto);
    }

    // Guardar en contexto
    contextoConversacion.push({ role: 'user', content: mensaje });
    contextoConversacion.push({ role: 'assistant', content: respuesta.texto });
    conversationContexts.set(sessionId, contextoConversacion);

    return {
      respuesta: respuesta.texto,
      tipo: respuesta.tipo || 'respuesta',
      sugerencias: respuesta.sugerencias || [],
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('❌ Error crítico en chat:', error);
    return {
      respuesta: 'Lo siento, no pude procesar tu pregunta. Intenta nuevamente.',
      tipo: 'error',
      error: error.message
    };
  }
}

/**
 * Generar resumen de un módulo específico
 */
export async function resumirModulo(modulo, contenidos) {
  // Obtener documentos de uploads
  let documentos = obtenerContenidoDeUploads();
  
  // Procesar PDFs
  documentos = await procesarPDFs(documentos);
  
  // Combinar contenido de BD con documentos
  const contenidoCompleto = [...contenidos, ...documentos];
  
  const contenidoTexto = contenidoCompleto.map((c, i) => `
${i + 1}. [${c.tipo}] ${c.titulo}
   ${c.descripcion ? `Descripción: ${c.descripcion.substring(0, 250)}...` : ''}
`).join('\n');

  const prompt = `
Genera un resumen BREVE del siguiente módulo educativo:

MÓDULO: ${modulo.titulo}
DESCRIPCIÓN: ${modulo.descripcion || 'No especificada'}

CONTENIDO Y DOCUMENTOS:
${contenidoTexto}

Responde en JSON con:
{
  "titulo_modulo": "${modulo.titulo}",
  "resumen": "resumen de 2-3 párrafos",
  "conceptos_clave": ["concepto1", "concepto2", "concepto3"],
  "objetivos": ["objetivo1", "objetivo2"],
  "tiempo_estimado": "X horas",
  "dificultad": "básica|intermedia|avanzada"
}
  `;

  try {
    if (IA_API_KEY && IA_PROVIDER === 'gemini') {
      return await consultarGeminiChat(prompt);
    } else if (IA_API_KEY && IA_PROVIDER === 'openai') {
      return await consultarOpenAI(prompt);
    } else {
      return generateLocalModuleResumen(modulo, contenidoCompleto);
    }
  } catch (error) {
    console.error('Error resumiendo módulo:', error);
    return generateLocalModuleResumen(modulo, contenidoCompleto);
  }
}

/**
 * Generar plan de estudio personalizado
 */
export async function generarPlanEstudio(usuario, modulosCurso, rendimiento) {
  const prompt = `
Genera un plan de estudio personalizado para un estudiante:

INFORMACIÓN DEL ESTUDIANTE:
- Promedio: ${rendimiento.promedio}%
- Fortalezas: ${rendimiento.fortalezas.join(', ') || 'No identificadas'}
- Áreas débiles: ${rendimiento.debilidades.join(', ') || 'No identificadas'}
- Tiempo disponible: ${usuario.horas_estudio_semanal || '5'} horas/semana

MÓDULOS DEL CURSO:
${modulosCurso.map((m, i) => `${i + 1}. ${m.titulo} (${m.descripcion})`).join('\n')}

Crea un plan JSON:
{
  "titulo": "Plan Personalizado para ${usuario.nombre}",
  "duracion_total": "X semanas",
  "semanal": [
    {
      "semana": 1,
      "focos": ["foco1", "foco2"],
      "modulos": [1, 2],
      "actividades": ["actividad1", "actividad2"],
      "tiempo_horas": 5
    }
  ],
  "recursos_adicionales": ["recurso1", "recurso2"],
  "hitos_importantes": ["hito1", "hito2"],
  "recomendaciones": ["rec1", "rec2"]
}
  `;

  try {
    if (IA_API_KEY && IA_PROVIDER === 'openai') {
      return await consultarOpenAI(prompt);
    } else {
      return generateLocalStudyPlan(usuario, modulosCurso, rendimiento);
    }
  } catch (error) {
    console.error('Error generando plan:', error);
    return generateLocalStudyPlan(usuario, modulosCurso, rendimiento);
  }
}

/**
 * Responder pregunta específica sobre contenido
 */
export async function responderPreguntaContenido(pregunta, contenidos, moduloContexto) {
  const prompt = `
Un estudiante hace la siguiente pregunta sobre el contenido del curso:

PREGUNTA: "${pregunta}"

MÓDULO RELACIONADO: ${moduloContexto?.titulo || 'General'}

CONTENIDO DISPONIBLE:
${contenidos.map(c => `
- [${c.tipo}] ${c.titulo}: ${c.descripcion || 'Sin descripción'}
`).join('\n')}

Proporciona una respuesta clara, educativa y en JSON:
{
  "respuesta": "respuesta detallada",
  "fuentes": ["módulo1", "módulo2"],
  "conceptos_relacionados": ["concepto1", "concepto2"],
  "sugerencias_profundizacion": ["sugerencia1", "sugerencia2"],
  "nivel_dificultad_respuesta": "básica|intermedia|avanzada"
}
  `;

  try {
    if (IA_API_KEY && IA_PROVIDER === 'openai') {
      return await consultarOpenAI(prompt);
    } else {
      return generarRespuestaLocalPregunta(pregunta, contenidos);
    }
  } catch (error) {
    console.error('Error respondiendo pregunta:', error);
    return generarRespuestaLocalPregunta(pregunta, contenidos);
  }
}

/**
 * Generar guía de estudio interactiva
 */
export async function generarGuiaEstudio(tema, contenidos, profundidad = 'intermedia') {
  const prompt = `
Crea una guía de estudio interactiva sobre: "${tema}"

NIVEL DE PROFUNDIDAD: ${profundidad}

CONTENIDO DISPONIBLE:
${contenidos.slice(0, 5).map(c => `- ${c.titulo}: ${c.descripcion}`).join('\n')}

Responde en JSON:
{
  "titulo": "Guía de Estudio: ${tema}",
  "introduccion": "texto introductorio",
  "secciones": [
    {
      "numero": 1,
      "titulo": "Conceptos Básicos",
      "contenido": "explicación detallada",
      "ejemplos": ["ejemplo1", "ejemplo2"],
      "preguntas_reflexion": ["pregunta1", "pregunta2"],
      "recursos": ["recurso1"]
    }
  ],
  "ejercicios_practicos": [
    {
      "numero": 1,
      "enunciado": "enunciado del ejercicio",
      "dificultad": "fácil|medio|difícil",
      "pista": "pista para resolver"
    }
  ],
  "resumen_clave": ["punto1", "punto2"],
  "proximos_temas": ["tema1", "tema2"]
}
  `;

  try {
    if (IA_API_KEY && IA_PROVIDER === 'openai') {
      return await consultarOpenAI(prompt);
    } else {
      return generateLocalStudyGuide(tema, contenidos, profundidad);
    }
  } catch (error) {
    console.error('Error generando guía:', error);
    return generateLocalStudyGuide(tema, contenidos, profundidad);
  }
}

// ============ FUNCIONES AUXILIARES PARA CHAT ============

function construirPromptChat(mensaje, contenido, historial = [], opciones = {}) {
  let documentosTexto = '';
  let otroContenido = '';
  
  if (contenido && Array.isArray(contenido) && contenido.length > 0) {
    // Separar documentos del contenido regular
    const documentos = contenido.filter(c => c.tipo && c.tipo.includes('documento'));
    const contenidoRegular = contenido.filter(c => !c.tipo || !c.tipo.includes('documento'));
    
    // Procesar documentos subidos PRIMERO (mayor importancia)
    if (documentos.length > 0) {
      documentosTexto = '📚 MATERIALES DEL CURSO DISPONIBLES:\n' + 
        documentos
          .map((d, i) => {
            if (d.tipo === 'documento-texto' || d.tipo === 'documento') {
              // Texto completo para documentos de texto
              const contenidoDocumento = d.contenido || d.descripcion || 'Sin contenido legible';
              return `\n[DOCUMENTO ${i+1}: ${d.titulo}]\n${contenidoDocumento}`;
            } else if (d.tipo === 'documento-pdf') {
              // Referencia para PDFs
              return `\n[DOCUMENTO ${i+1}: ${d.titulo} - PDF]\nEste es un material importante del curso que los estudiantes deben revisar.`;
            } else {
              return `\n[DOCUMENTO ${i+1}: ${d.titulo}]\n${d.descripcion}`;
            }
          })
          .join('\n');
    }
    
    // Procesar contenido regular
    if (contenidoRegular.length > 0) {
      otroContenido = '\n\nOTRO CONTENIDO:\n' + 
        contenidoRegular
          .slice(0, 3)
          .map(c => {
            const tipo = c.tipo || 'contenido';
            const titulo = c.titulo || 'Sin título';
            const descripcion = (c.descripcion || 'Sin descripción').substring(0, 150);
            return `- [${tipo}] ${titulo}: ${descripcion}`;
          })
          .join('\n');
    }
  }

  let prompt = `Eres AmparIA, asistente educativo inteligente de la plataforma Yatiña. Tu objetivo es ayudar a las estudiantes a aprender.

INSTRUCCIONES:
1. Responde de forma BREVE y clara en máximo 2-3 párrafos
2. Usa los materiales disponibles como referencia principal
3. Si hay documentos subidos, léelos y úsalos como base para tu respuesta
4. Sé empático, paciente y motivador
5. Responde siempre en español

${documentosTexto}${otroContenido}

🎯 PREGUNTA: "${mensaje}"

RESPONDE AQUÍ:`;

  if (opciones.moduloActual && opciones.moduloActual.titulo) {
    prompt = prompt.replace('RESPONDE AQUÍ:', `MÓDULO ACTUAL: ${opciones.moduloActual.titulo}\n\nRESPONDE AQUÍ:`);
  }

  return prompt;
}

async function consultarOpenAIChat(prompt, historial = []) {
  const url = 'https://api.openai.com/v1/chat/completions';
  
  const messages = [
    {
      role: 'system',
      content: 'Eres AmparIA, asistente educativo de la plataforma Yatiña. Eres experto, paciente, motivador y empático. Tu objetivo es ayudar a las estudiantes a comprender mejor el contenido del curso. Siempre proporciona respuestas claras, con ejemplos cuando sea posible. Responde en español de manera conversacional y amigable.'
    },
    ...historial.slice(-5), // Últimos 5 mensajes
    {
      role: 'user',
      content: prompt
    }
  ];

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${IA_API_KEY}`
      },
      body: JSON.stringify({
        model: IA_MODEL,
        messages: messages,
        temperature: 0.7,
        max_tokens: 1500
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('OpenAI Error Response:', errorData);
      throw new Error(`OpenAI Error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    const respuesta = data.choices[0].message.content;

    return {
      texto: respuesta,
      tipo: 'respuesta'
    };
  } catch (error) {
    console.error('Error OpenAI Chat:', error);
    throw error;
  }
}

async function consultarAnthropicChat(prompt, historial = []) {
  const url = 'https://api.anthropic.com/v1/messages';
  
  const messages = historial.slice(-5).map(m => ({
    role: m.role,
    content: m.content
  }));
  
  messages.push({
    role: 'user',
    content: prompt
  });

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': IA_API_KEY,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: IA_MODEL || 'claude-3-sonnet-20240229',
      max_tokens: 1500,
      messages: messages
    })
  });

  if (!response.ok) {
    throw new Error(`Anthropic Error: ${response.status}`);
  }

  const data = await response.json();
  return {
    texto: data.content[0].text,
    tipo: 'respuesta'
  };
}

function generarRespuestaLocal(mensaje, contenido) {
  const palabrasClave = ['resumen', 'explicar', 'qué es', 'cómo', 'por qué', 'definir'];
  const tipo = palabrasClave.some(p => mensaje.toLowerCase().includes(p)) ? 'explicacion' : 'respuesta';

  let respuesta = 'Basándome en el contenido del curso: ';
  
  if (contenido.length > 0) {
    const temaAleatorio = contenido[Math.floor(Math.random() * contenido.length)];
    respuesta += `La información que buscas podría estar relacionada con "${temaAleatorio.titulo}". `;
    respuesta += `${temaAleatorio.descripcion || 'Consulta el módulo correspondiente para más detalles.'}`;
  }

  return {
    texto: respuesta,
    tipo: tipo,
    sugerencias: contenido.slice(0, 3).map(c => c.titulo)
  };
}

function generarRespuestaLocalPregunta(pregunta, contenidos) {
  return {
    respuesta: `Para responder tu pregunta sobre "${pregunta}", consulta estos módulos: ${contenidos.slice(0, 3).map(c => c.titulo).join(', ')}`,
    fuentes: contenidos.slice(0, 2).map(c => c.titulo),
    conceptos_relacionados: contenidos.map(c => c.titulo).slice(0, 3),
    sugerencias_profundizacion: ['Revisa los ejemplos disponibles', 'Consulta con tu docente'],
    nivel_dificultad_respuesta: 'intermedia'
  };
}

function generateLocalModuleResumen(modulo, contenidos) {
  return {
    titulo_modulo: modulo.titulo,
    resumen: `${modulo.descripcion || 'Módulo'} contiene ${contenidos.length} elementos de contenido diseñados para desarrollar competencias clave.`,
    conceptos_clave: contenidos.slice(0, 3).map(c => c.titulo),
    objetivos: ['Comprender los conceptos principales', 'Aplicar en ejercicios prácticos'],
    tiempo_estimado: `${contenidos.length * 1.5} horas`,
    dificultad: 'intermedia',
    proximos_pasos: ['Revisar el contenido', 'Completar actividades', 'Autoevaluarse']
  };
}

function generateLocalStudyPlan(usuario, modulos, rendimiento) {
  const semanas = Math.ceil(modulos.length / 2);
  return {
    titulo: `Plan Personalizado para ${usuario.nombre}`,
    duracion_total: `${semanas} semanas`,
    semanal: modulos.slice(0, 2).map((m, i) => ({
      semana: i + 1,
      focos: [m.titulo],
      modulos: [m.id_modulo],
      actividades: ['Lectura', 'Ejercicios'],
      tiempo_horas: 5
    })),
    recursos_adicionales: ['Materiales complementarios disponibles'],
    hitos_importantes: [`Completar Módulo ${modulos[0].titulo}`],
    recomendaciones: ['Estudia en bloques de 1-2 horas', 'Toma descansos regulares']
  };
}

function generateLocalStudyGuide(tema, contenidos, profundidad) {
  return {
    titulo: `Guía de Estudio: ${tema}`,
    introduccion: `Esta guía te ayudará a comprender a fondo el tema de ${tema}.`,
    secciones: [
      {
        numero: 1,
        titulo: 'Conceptos Fundamentales',
        contenido: contenidos.slice(0, 2).map(c => c.descripcion).join('\n'),
        ejemplos: ['Ejemplo 1', 'Ejemplo 2'],
        preguntas_reflexion: ['¿Qué entiendes por esto?', '¿Cómo se aplica?'],
        recursos: contenidos.slice(0, 1).map(c => c.titulo)
      }
    ],
    ejercicios_practicos: [
      {
        numero: 1,
        enunciado: `Ejercicio sobre ${tema}`,
        dificultad: 'medio',
        pista: 'Recuerda revisar el contenido anterior'
      }
    ],
    resumen_clave: contenidos.slice(0, 3).map(c => c.titulo),
    proximos_temas: ['Tema avanzado siguiente']
  };
}

async function consultarGeminiChat(prompt, historial = []) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${IA_MODEL}:generateContent?key=${IA_API_KEY}`;
  
  console.log(`🔗 URL Gemini: ${url.substring(0, 80)}...`);
  console.log(`📊 Modelo: ${IA_MODEL}`);
  console.log(`📝 Prompt length: ${prompt.length} caracteres`);
  
  try {
    const body = {
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: prompt
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2000
      },
      safetySettings: [
        {
          category: 'HARM_CATEGORY_HARASSMENT',
          threshold: 'BLOCK_NONE'
        },
        {
          category: 'HARM_CATEGORY_HATE_SPEECH',
          threshold: 'BLOCK_NONE'
        },
        {
          category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
          threshold: 'BLOCK_NONE'
        },
        {
          category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
          threshold: 'BLOCK_NONE'
        }
      ]
    };

    console.log('📤 Enviando solicitud a Gemini...');
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    console.log(`📥 Respuesta HTTP: ${response.status}`);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('❌ Gemini Error Response:', JSON.stringify(errorData, null, 2));
      throw new Error(`Gemini HTTP ${response.status}: ${errorData.error?.message || JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    console.log('📦 Data recibida de Gemini:', JSON.stringify(data, null, 2).substring(0, 500));
    
    // Validar estructura de respuesta
    if (!data.candidates || data.candidates.length === 0) {
      console.error('❌ No hay candidatos en respuesta Gemini');
      throw new Error('Gemini: No candidates in response');
    }

    if (!data.candidates[0].content || !data.candidates[0].content.parts) {
      console.error('❌ Estructura inválida en respuesta Gemini');
      throw new Error('Gemini: Invalid response structure');
    }

    const respuesta = data.candidates[0].content.parts[0].text;
    
    if (!respuesta) {
      console.error('❌ Respuesta vacía de Gemini');
      throw new Error('Gemini: Empty response');
    }

    console.log(`✅ Respuesta de Gemini: ${respuesta.substring(0, 100)}...`);

    return {
      texto: respuesta,
      tipo: 'respuesta'
    };
  } catch (error) {
    console.error('❌ Error en consultarGeminiChat:', error.message);
    console.error('Stack:', error.stack);
    throw error;
  }
}

export default {
  resumirContenidoCurso,
  resumirActividades,
  generarPreguntasEstudio,
  analizarDesempenoEstudiante,
  chatContenido,
  resumirModulo,
  generarPlanEstudio,
  responderPreguntaContenido,
  generarGuiaEstudio
};
