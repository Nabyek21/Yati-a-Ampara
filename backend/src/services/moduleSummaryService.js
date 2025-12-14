/**
 * Servicio de Resumen de Módulos con Texto Estructurado y Audio
 * Genera resúmenes del contenido del módulo con opción de audio
 */

import { OpenAIProvider } from './ia/providers/openaiProvider.js';
import { GradeContextBuilder } from './ia/contextBuilder.js';
import { PROMPTS, buildChatPrompt } from './ia/promptTemplates.js';
import { pool } from '../config/database.js';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs';

const execAsync = promisify(exec);

export class ModuleSummaryService {
  constructor(apiKey) {
    this.provider = new OpenAIProvider(apiKey, 'gpt-3.5-turbo');
    this.uploadsDir = path.join(process.cwd(), 'src', 'uploads');
  }

  /**
   * Generar resumen estructurado de un módulo
   */
  async generateModuleSummary(moduleId, courseId, studentId = null) {
    try {
      // 1. Obtener contenido del módulo
      const moduleContent = await this.getModuleContent(moduleId);

      if (!moduleContent) {
        return {
          success: false,
          error: 'Módulo no encontrado',
        };
      }

      // 2. Obtener contexto del estudiante si existe
      let studentContext = null;
      if (studentId) {
        const builder = new GradeContextBuilder(studentId, courseId);
        studentContext = await builder.getChatContext();
      }

      // 3. Generar resumen estructurado
      const summary = await this.generateStructuredSummary(
        moduleContent,
        studentContext
      );

      if (!summary) {
        return {
          success: false,
          error: 'No se pudo generar el resumen',
        };
      }

      return {
        success: true,
        summary: summary,
        moduleInfo: {
          id: moduleId,
          name: moduleContent.nombre,
          description: moduleContent.descripcion,
        },
      };
    } catch (error) {
      console.error('Error generating module summary:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Generar resumen estructurado con formato HTML
   */
  async generateStructuredSummary(moduleContent, studentContext = null) {
    // Convertir temas a texto formateado
    let temasFormateado = '';
    
    if (moduleContent.contenidos && Array.isArray(moduleContent.contenidos)) {
      moduleContent.contenidos.forEach((seccion, idx) => {
        temasFormateado += `\n### ${seccion.seccion}\n`;
        seccion.items.forEach((tema, temIdx) => {
          temasFormateado += `\n${temIdx + 1}. **${tema.titulo}**`;
          if (tema.descripcion) {
            temasFormateado += `\n   ${tema.descripcion}`;
          }
          if (tema.tipo) {
            temasFormateado += `\n   Tipo: ${tema.tipo}`;
          }
          temasFormateado += '\n';
        });
      });
    }

    const prompt = `Tu tarea es crear un RESUMEN EDUCATIVO ESTRUCTURADO basado en los TEMAS REALES del módulo.

MÓDULO: ${moduleContent.nombre}
DESCRIPCIÓN: ${moduleContent.descripcion}

TEMAS DEL MÓDULO (Estos son los temas reales que los estudiantes estudian):
${temasFormateado || 'Sin temas registrados aún.'}

CONTENIDO DE ARCHIVOS DEL MÓDULO:
${moduleContent.contenidos && moduleContent.contenidos.length > 0 
  ? moduleContent.contenidos.map(seccion => 
      seccion.items.map(tema => 
        tema.contenidoArchivo 
          ? `\n--- ${tema.titulo} ---\n${tema.contenidoArchivo}\n` 
          : ''
      ).join('')
    ).join('')
  : '(No hay archivos de contenido)'}

INSTRUCCIONES CRÍTICAS:
1. Crea un resumen basado ÚNICAMENTE en los temas listados arriba.
2. Si hay pocos temas, sé creativo pero mantén conexión con lo que está ahí.
3. Extrae conceptos clave de CADA TEMA.
4. Organiza en la estructura solicitada.
5. Responde en ESPAÑOL.

DEBES CREAR UN RESUMEN DETALLADO CON ESTA ESTRUCTURA EXACTA (en texto plano ordenado):

=== RESUMEN EJECUTIVO ===
[Párrafo de 3-4 líneas con una descripción completa del módulo y su importancia]

=== CONCEPTOS CLAVE ===
- Concepto 1 (basado en los temas) con breve explicación
- Concepto 2 con breve explicación
- Concepto 3 con breve explicación
- Concepto 4 con breve explicación
- Concepto 5 con breve explicación

=== TEMAS PRINCIPALES ===
• Tema 1: [Explicación detallada de 3-4 líneas]
  - Punto importante 1 con contexto
  - Punto importante 2 con contexto
  - Punto importante 3
  
• Tema 2: [Explicación detallada de 3-4 líneas]
  - Punto importante 1 con contexto
  - Punto importante 2 con contexto
  - Punto importante 3

• Tema 3: [Explicación detallada de 3-4 líneas]
  - Punto importante 1
  - Punto importante 2
  - Punto importante 3

=== APLICACIONES PRÁCTICAS ===
- Aplicación práctica 1 (con ejemplo específico)
- Aplicación práctica 2 (con ejemplo específico)
- Aplicación práctica 3 (con ejemplo específico)
- Aplicación práctica 4 (si es relevante)

=== TÉRMINOS CLAVE ===
• Término 1: Definición detallada (2-3 líneas)
• Término 2: Definición detallada (2-3 líneas)
• Término 3: Definición detallada (2-3 líneas)
• Término 4: Definición detallada

=== RECOMENDACIONES DE ESTUDIO ===
1. Recomendación 1 con detalles
2. Recomendación 2 con detalles
3. Recomendación 3 con detalles
4. Recomendación 4 con detalles

AHORA, crea el resumen DETALLADO Y EXTENSO siguiendo EXACTAMENTE esta estructura. Usa el contenido de los archivos del módulo para hacer el resumen más rico y específico:`;

    try {
      const response = await this.provider.generateText(prompt, {
        temperature: 0.6,
        maxTokens: 4000,
      });

      if (!response.success) {
        throw new Error(response.error);
      }

      // Parsear el resumen estructurado en texto plano
      const summary = this.parseTextSummary(response.text);

      return {
        tipo: 'estructurado',
        contenido: summary,
        texto: response.text,
      };
    } catch (error) {
      console.error('Error generating structured summary:', error);
      return null;
    }
  }

  /**
   * Parsear resumen en texto plano a objeto estructurado
   */
  parseTextSummary(text) {
    const sections = {
      resumenEjecutivo: '',
      conceptosClave: [],
      temasPrincipales: [],
      aplicacionesPracticas: [],
      terminosClave: {},
      recomendacionesEstudio: [],
    };

    // Dividir por secciones
    const lines = text.split('\n');
    let currentSection = null;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      if (line.includes('RESUMEN EJECUTIVO')) {
        currentSection = 'resumenEjecutivo';
        continue;
      }
      if (line.includes('CONCEPTOS CLAVE')) {
        currentSection = 'conceptosClave';
        continue;
      }
      if (line.includes('TEMAS PRINCIPALES')) {
        currentSection = 'temasPrincipales';
        continue;
      }
      if (line.includes('APLICACIONES PRÁCTICAS')) {
        currentSection = 'aplicacionesPracticas';
        continue;
      }
      if (line.includes('TÉRMINOS CLAVE')) {
        currentSection = 'terminosClave';
        continue;
      }
      if (line.includes('RECOMENDACIONES DE ESTUDIO')) {
        currentSection = 'recomendacionesEstudio';
        continue;
      }

      // Procesar según la sección actual
      if (currentSection === 'resumenEjecutivo' && line && !line.startsWith('===')) {
        sections.resumenEjecutivo += (sections.resumenEjecutivo ? ' ' : '') + line;
      }
      
      if (currentSection === 'conceptosClave' && (line.startsWith('-') || line.startsWith('•'))) {
        const concepto = line.replace(/^[-•]\s*/, '').trim();
        if (concepto) sections.conceptosClave.push(concepto);
      }

      if (currentSection === 'temasPrincipales' && (line.startsWith('•') || line.startsWith('-'))) {
        if (line.startsWith('•')) {
          // Nuevo tema
          const partes = line.replace(/^•\s*/, '').split(':');
          if (partes.length >= 1) {
            sections.temasPrincipales.push({
              tema: partes[0].trim(),
              explicacion: partes[1] ? partes[1].trim() : '',
              puntosImportantes: [],
            });
          }
        } else if (line.startsWith('-') && sections.temasPrincipales.length > 0) {
          // Punto importante del tema actual
          const punto = line.replace(/^-\s*/, '').trim();
          if (punto) {
            sections.temasPrincipales[sections.temasPrincipales.length - 1].puntosImportantes.push(punto);
          }
        }
      }

      if (currentSection === 'aplicacionesPracticas' && (line.startsWith('-') || line.startsWith('•'))) {
        const aplicacion = line.replace(/^[-•]\s*/, '').trim();
        if (aplicacion) sections.aplicacionesPracticas.push(aplicacion);
      }

      if (currentSection === 'terminosClave' && (line.startsWith('•') || line.includes(':'))) {
        const partes = line.replace(/^•\s*/, '').split(':');
        if (partes.length === 2) {
          const termino = partes[0].trim();
          const definicion = partes[1].trim();
          if (termino && definicion) {
            sections.terminosClave[termino] = definicion;
          }
        }
      }

      if (currentSection === 'recomendacionesEstudio' && (line.match(/^\d+\./) || line.startsWith('-') || line.startsWith('•'))) {
        const recomendacion = line.replace(/^[\d+\.\-•]\s*/, '').trim();
        if (recomendacion) sections.recomendacionesEstudio.push(recomendacion);
      }
    }

    return sections;
  }

  /**
   * Generar audio del resumen usando Text-to-Speech
   */
  async generateAudio(text, outputPath = null) {
    try {
      const fileName = `audio_${Date.now()}.mp3`;
      const audioPath = outputPath || path.join(this.uploadsDir, 'audios', fileName);

      // Crear directorio si no existe
      const audioDir = path.dirname(audioPath);
      if (!fs.existsSync(audioDir)) {
        fs.mkdirSync(audioDir, { recursive: true });
      }

      // Usar OpenAI TTS (si está disponible)
      const audioBuffer = await this.generateOpenAIAudio(text);

      if (audioBuffer) {
        fs.writeFileSync(audioPath, audioBuffer);

        return {
          success: true,
          audioPath: audioPath,
          fileName: fileName,
          url: `http://localhost:4000/uploads/audios/${fileName}`,
          duration: await this.getAudioDuration(audioPath),
        };
      }

      return {
        success: false,
        error: 'No se pudo generar el audio',
      };
    } catch (error) {
      console.error('Error generating audio:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Generar audio con OpenAI TTS
   */
  async generateOpenAIAudio(text) {
    try {
      const response = await fetch('https://api.openai.com/v1/audio/speech', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.IA_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'tts-1-hd', // tts-1 para rápido, tts-1-hd para calidad
          input: text,
          voice: 'nova', // voces: alloy, echo, fable, onyx, nova, shimmer
          speed: 1.0,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI TTS Error: ${response.statusText}`);
      }

      const buffer = await response.arrayBuffer();
      return Buffer.from(buffer);
    } catch (error) {
      console.error('Error with OpenAI TTS:', error);
      return null;
    }
  }

  /**
   * Obtener duración del audio (estimado basado en tamaño)
   */
  async getAudioDuration(audioPath) {
    try {
      // Usar tamaño del archivo para estimar duración
      // MP3 típicamente: ~128 kbps = 16 KB/s
      const stats = fs.statSync(audioPath);
      const fileSizeInBytes = stats.size;
      const estimatedDurationSeconds = Math.ceil(fileSizeInBytes / 16000); // 16KB/s aproximadamente
      return estimatedDurationSeconds;
    } catch (error) {
      console.warn('Could not get audio duration:', error);
      return null;
    }
  }

  /**
   * Obtener contenido del módulo
   */
  async getModuleContent(moduleId) {
    try {
      const [modulos] = await pool.query(
        `SELECT id_modulo, titulo as nombre, descripcion FROM modulos WHERE id_modulo = ?`,
        [moduleId]
      );

      if (modulos.length === 0) {
        return null;
      }

      const modulo = modulos[0];

      // Obtener temas/contenidos del módulo desde la tabla modulo_contenido
      const contenidos = await this.getModuleTopics(moduleId);

      return {
        id: modulo.id_modulo,
        nombre: modulo.nombre,
        descripcion: modulo.descripcion,
        contenidos: contenidos, // 👈 Temas reales del módulo
      };
    } catch (error) {
      console.error('Error getting module content:', error);
      return null;
    }
  }

  /**
   * Obtener temas/contenidos del módulo desde la BD
   */
  async getModuleTopics(moduleId) {
    try {
      const [contenidos] = await pool.query(
        `SELECT 
          id_contenido,
          id_seccion,
          tipo,
          titulo,
          descripcion,
          url_contenido,
          archivo,
          orden
        FROM modulo_contenido
        WHERE id_modulo = ?
        ORDER BY id_seccion, orden, fecha_creacion`,
        [moduleId]
      );

      // Agrupar por sección
      const temasPorSeccion = {};
      
      for (const contenido of contenidos) {
        const seccion = contenido.id_seccion || 'Sin Sección';
        if (!temasPorSeccion[seccion]) {
          temasPorSeccion[seccion] = [];
        }
        
        // Intentar leer contenido del archivo si existe
        let contenidoArchivo = '';
        if (contenido.archivo) {
          try {
            const archivoPath = path.join(this.uploadsDir, 'modulos', `modulo_${moduleId}`, contenido.archivo);
            if (fs.existsSync(archivoPath)) {
              const ext = path.extname(archivoPath).toLowerCase();
              // Leer solo archivos de texto
              if (['.txt', '.md'].includes(ext)) {
                contenidoArchivo = fs.readFileSync(archivoPath, 'utf-8');
              }
            }
          } catch (e) {
            console.warn(`No se pudo leer archivo: ${contenido.archivo}`);
          }
        }
        
        temasPorSeccion[seccion].push({
          titulo: contenido.titulo,
          descripcion: contenido.descripcion || '',
          tipo: contenido.tipo,
          url: contenido.url_contenido,
          archivo: contenido.archivo,
          contenidoArchivo: contenidoArchivo,  // ← Contenido del archivo
          orden: contenido.orden,
        });
      }

      // Convertir a array para mantener orden
      const temas = [];
      for (const [seccion, items] of Object.entries(temasPorSeccion)) {
        temas.push({
          seccion,
          items,
        });
      }

      console.log(`✅ Total temas obtenidos del módulo ${moduleId}: ${contenidos.length}`);
      return temas;
    } catch (error) {
      console.error('Error getting module topics:', error);
      return [];
    }
  }

  /**
   * Convertir resumen estructurado a texto plano para audio
   */
  convertStructuredToText(structured) {
    if (!structured || typeof structured !== 'object') {
      return typeof structured === 'string' ? structured : JSON.stringify(structured);
    }

    const contenido = structured.contenido || structured;
    let text = '';

    // Resumen Ejecutivo
    if (contenido.resumenEjecutivo && contenido.resumenEjecutivo.trim()) {
      text += `Resumen Ejecutivo. ${contenido.resumenEjecutivo.trim()}\n\n`;
    }

    // Conceptos Clave
    if (contenido.conceptosClave && Array.isArray(contenido.conceptosClave) && contenido.conceptosClave.length > 0) {
      text += `Conceptos clave: ${contenido.conceptosClave.join(', ')}.\n\n`;
    }

    // Temas Principales
    if (contenido.temasPrincipales && Array.isArray(contenido.temasPrincipales) && contenido.temasPrincipales.length > 0) {
      text += 'Temas Principales.\n';
      contenido.temasPrincipales.forEach((tema, idx) => {
        text += `${idx + 1}. ${tema.tema || 'Tema'}. `;
        if (tema.explicacion) {
          text += `${tema.explicacion} `;
        }
        if (tema.puntosImportantes && Array.isArray(tema.puntosImportantes) && tema.puntosImportantes.length > 0) {
          text += `Puntos importantes: ${tema.puntosImportantes.join(', ')}.`;
        }
        text += '\n';
      });
      text += '\n';
    }

    // Aplicaciones Prácticas
    if (contenido.aplicacionesPracticas && Array.isArray(contenido.aplicacionesPracticas) && contenido.aplicacionesPracticas.length > 0) {
      text += `Aplicaciones prácticas: ${contenido.aplicacionesPracticas.join(', ')}.\n\n`;
    }

    // Términos Clave
    if (contenido.terminosClave && typeof contenido.terminosClave === 'object' && Object.keys(contenido.terminosClave).length > 0) {
      text += 'Términos clave. ';
      const terminos = [];
      for (const [termino, definicion] of Object.entries(contenido.terminosClave)) {
        terminos.push(`${termino}: ${definicion}`);
      }
      text += `${terminos.join('. ')}.\n\n`;
    }

    // Recomendaciones de Estudio
    if (contenido.recomendacionesEstudio && Array.isArray(contenido.recomendacionesEstudio) && contenido.recomendacionesEstudio.length > 0) {
      text += `Recomendaciones de estudio: ${contenido.recomendacionesEstudio.join(', ')}.`;
    }

    return text.trim();
  }

  /**
   * Convertir resumen estructurado a HTML para mostrar en chat
   */
  convertToHTML(summary) {
    if (!summary || summary.tipo !== 'estructurado') {
      return `<p>${summary?.contenido || 'No se pudo generar el resumen'}</p>`;
    }

    const { contenido } = summary;

    return `
<div class="resumen-modulo-estructurado">
  <div class="resumen-seccion">
    <h3>📋 Resumen Ejecutivo</h3>
    <p>${contenido.resumenEjecutivo}</p>
  </div>

  <div class="resumen-seccion">
    <h3>🎯 Conceptos Clave</h3>
    <ul class="conceptos-lista">
      ${contenido.conceptosClave?.map(c => `<li>${c}</li>`).join('') || ''}
    </ul>
  </div>

  <div class="resumen-seccion">
    <h3>📚 Temas Principales</h3>
    ${contenido.temasPrincipales?.map(tema => `
      <div class="tema-item">
        <h4>${tema.tema}</h4>
        <p><strong>Explicación:</strong> ${tema.explicacion}</p>
        <p><strong>Puntos importantes:</strong></p>
        <ul>
          ${tema.puntosImportantes?.map(p => `<li>${p}</li>`).join('') || ''}
        </ul>
      </div>
    `).join('') || ''}
  </div>

  <div class="resumen-seccion">
    <h3>💡 Aplicaciones Prácticas</h3>
    <ul>
      ${contenido.aplicacionesPracticas?.map(a => `<li>${a}</li>`).join('') || ''}
    </ul>
  </div>

  <div class="resumen-seccion">
    <h3>📖 Términos Clave</h3>
    <dl class="terminos-lista">
      ${Object.entries(contenido.terminosClave || {}).map(([termino, def]) => `
        <div class="termino-item">
          <dt><strong>${termino}</strong></dt>
          <dd>${def}</dd>
        </div>
      `).join('') || ''}
    </dl>
  </div>

  <div class="resumen-seccion">
    <h3>✏️ Recomendaciones de Estudio</h3>
    <ol>
      ${contenido.recomendacionesEstudio?.map(r => `<li>${r}</li>`).join('') || ''}
    </ol>
  </div>
</div>

<style>
  .resumen-modulo-estructurado {
    background: #f9fafb;
    border-radius: 8px;
    padding: 16px;
    margin: 12px 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto;
  }

  .resumen-seccion {
    margin-bottom: 20px;
    padding-bottom: 16px;
    border-bottom: 1px solid #e5e7eb;
  }

  .resumen-seccion:last-child {
    border-bottom: none;
  }

  .resumen-seccion h3 {
    margin: 0 0 12px 0;
    color: #1f2937;
    font-size: 14px;
    font-weight: 600;
  }

  .resumen-seccion h4 {
    margin: 12px 0 8px 0;
    color: #374151;
    font-size: 13px;
  }

  .conceptos-lista, .resumen-seccion ul {
    margin: 8px 0;
    padding-left: 20px;
    list-style: disc;
  }

  .terminos-lista {
    margin: 8px 0;
  }

  .termino-item {
    margin: 8px 0;
  }

  .termino-item dt {
    color: #1f2937;
    margin-bottom: 4px;
  }

  .termino-item dd {
    margin: 0 0 8px 16px;
    color: #6b7280;
    font-size: 13px;
  }
</style>
    `;
  }
}

export default ModuleSummaryService;
