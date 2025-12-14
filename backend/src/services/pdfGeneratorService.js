/**
 * Servicio para generar PDFs de resúmenes extendidos
 */

import PDFDocument from 'pdfkit';
import { OpenAIProvider } from './ia/providers/openaiProvider.js';
import fs from 'fs';
import path from 'path';

export class PDFGeneratorService {
  constructor(apiKey) {
    this.provider = new OpenAIProvider(apiKey, 'gpt-3.5-turbo');
    this.uploadsDir = path.join(process.cwd(), 'src', 'uploads');
  }

  /**
   * Generar PDF extendido del resumen
   */
  async generateExtendedPDF(moduleInfo, summary, moduleContent = null, studentInfo = null) {
    return new Promise((resolve, reject) => {
      try {
        const fileName = `resumen_modulo_${moduleInfo.id || 1}_${Date.now()}.pdf`;
        const pdfPath = path.join(this.uploadsDir, 'pdfs', fileName);

        const pdfDir = path.dirname(pdfPath);
        if (!fs.existsSync(pdfDir)) {
          fs.mkdirSync(pdfDir, { recursive: true });
        }

        const doc = new PDFDocument({ margin: 50 });
        const writeStream = fs.createWriteStream(pdfPath);

        // Manejar errores antes de piping
        writeStream.on('error', (err) => {
          console.error('WriteStream error:', err);
          reject(err);
        });

        doc.on('error', (err) => {
          console.error('PDFDocument error:', err);
          reject(err);
        });

        doc.on('end', () => {
          console.log('PDF generation completed:', pdfPath);
        });

        // Pipe debe ser llamado DESPUÉS de configurar errores
        doc.pipe(writeStream);

        // ===== TÍTULO Y DESCRIPCIÓN =====
        doc.fontSize(20).text(moduleInfo.nombre || moduleInfo.titulo || 'Resumen', { align: 'center' });
        doc.moveDown(0.3);
        doc.fontSize(10).text(moduleInfo.descripcion || '', { align: 'center' });
        doc.moveDown();

        // ===== NOTA: Temas del módulo se omiten para mostrar resumen completo =====

        // ===== RESUMEN EJECUTIVO =====
        doc.fontSize(14).font('Helvetica-Bold').text('1. Resumen Ejecutivo');
        doc.font('Helvetica').fontSize(11);
        doc.text(summary.resumenEjecutivo || 'N/A');
        doc.moveDown();

        // ===== CONCEPTOS CLAVE =====
        doc.fontSize(14).font('Helvetica-Bold').text('2. Conceptos Clave');
        doc.font('Helvetica').fontSize(11);
        if (Array.isArray(summary.conceptosClave)) {
          summary.conceptosClave.forEach((c) => {
            const term = typeof c === 'string' ? c : (c.termino || '');
            const def = typeof c === 'string' ? '' : (c.definicion || '');
            if (term) {
              doc.text(`• ${term}`);
              if (def) doc.fontSize(10).text(`  ${def}`).fontSize(11);
            }
          });
        }
        doc.moveDown();

        // ===== TEMAS PRINCIPALES =====
        doc.fontSize(14).font('Helvetica-Bold').text('3. Temas Principales');
        doc.font('Helvetica').fontSize(11);
        if (Array.isArray(summary.temasPrincipales)) {
          summary.temasPrincipales.forEach((t, i) => {
            const title = typeof t === 'string' ? t : (t.titulo || t.tema || `Tema ${i + 1}`);
            const desc = typeof t === 'string' ? '' : (t.descripcion || t.explicacion || '');
            const puntos = typeof t === 'object' ? (t.puntosImportantes || []) : [];
            
            doc.text(`${i + 1}. ${title}`);
            if (desc) {
              doc.fontSize(10).text(`   ${desc}`).fontSize(11);
            }
            
            if (Array.isArray(puntos) && puntos.length > 0) {
              puntos.forEach((punto) => {
                doc.fontSize(10).text(`   • ${punto}`);
              });
              doc.fontSize(11);
            }
          });
        }
        doc.moveDown();

        // ===== APLICACIONES PRÁCTICAS =====
        doc.fontSize(14).font('Helvetica-Bold').text('4. Aplicaciones Prácticas');
        doc.font('Helvetica').fontSize(11);
        if (Array.isArray(summary.aplicacionesPracticas)) {
          summary.aplicacionesPracticas.forEach((app) => {
            const text = typeof app === 'string' ? app : (app.aplicacion || '');
            if (text) doc.text(`• ${text}`);
          });
        } else if (typeof summary.aplicacionesPracticas === 'string') {
          doc.text(summary.aplicacionesPracticas);
        }
        doc.moveDown();

        // ===== TÉRMINOS CLAVE =====
        doc.fontSize(14).font('Helvetica-Bold').text('5. Términos Clave');
        doc.font('Helvetica').fontSize(11);
        if (summary.terminosClave && typeof summary.terminosClave === 'object') {
          Object.entries(summary.terminosClave).forEach(([term, def]) => {
            if (term) {
              doc.text(`• ${term}:`, { continued: true });
              doc.fontSize(10).text(` ${def}`).fontSize(11);
            }
          });
        }
        doc.moveDown();

        // ===== RECOMENDACIONES DE ESTUDIO =====
        if (summary.recomendacionesEstudio && summary.recomendacionesEstudio.length > 0) {
          doc.fontSize(14).font('Helvetica-Bold').text('6. Recomendaciones de Estudio');
          doc.font('Helvetica').fontSize(11);
          summary.recomendacionesEstudio.forEach((rec, idx) => {
            const text = typeof rec === 'string' ? rec : (rec.recomendacion || '');
            if (text) doc.text(`${idx + 1}. ${text}`);
          });
          doc.moveDown(2);
        }

        // ===== PIE DE PÁGINA =====
        doc.fontSize(8).text('Generado por AmparIA - Asistente Educativo', { align: 'center', color: '999999' });

        // Finalizar y esperar a que se escriba
        doc.end();

        // Resolver cuando el stream termine
        writeStream.on('close', () => {
          resolve({
            success: true,
            fileName,
            pdfPath,
            url: `http://localhost:4000/uploads/pdfs/${fileName}`,
          });
        });

      } catch (error) {
        console.error('PDF generation error:', error);
        reject(error);
      }
    });
  }

  /**
   * Expandir resumen usando OpenAI
   */
  async expandSummary(summary, context = '') {
    try {
      // Crear un prompt más detallado para expandir el resumen
      const prompt = `Expande Y DETALLA SIGNIFICATIVAMENTE este resumen educativo. 
Necesito que el resumen sea mucho más largo y con más ejemplos:

${JSON.stringify(summary, null, 2)}

Contexto: ${context}

INSTRUCCIONES CRÍTICAS:
1. Cada sección debe ser 2-3 veces más detallada que lo original
2. Añade ejemplos específicos y contextos prácticos
3. Expande las explicaciones con más profundidad académica
4. Mantén la estructura JSON exacta pero con contenido mucho más rico
5. Las listas deben tener descripciones más largas (2-3 líneas cada una)
6. Añade más puntos importantes en temasPrincipales (incluye 3-4 puntos por tema mínimo)
7. Proporciona definiciones más completas en terminosClave

Responde ÚNICAMENTE en formato JSON válido con la misma estructura pero contenido expandido.`;

      const response = await this.provider.chat([{ role: 'user', content: prompt }]);

      // Validar estructura de respuesta
      if (!response || !response.choices || !response.choices[0] || !response.choices[0].message) {
        console.warn('Invalid OpenAI response structure, returning original summary');
        return summary;
      }

      const content = response.choices[0].message.content;
      if (!content) {
        console.warn('Empty content in response, returning original summary');
        return summary;
      }

      try {
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const expandedSummary = JSON.parse(jsonMatch[0]);
          console.log('✅ Resumen expandido exitosamente');
          return expandedSummary;
        }
      } catch (parseError) {
        console.warn('Error parsing expanded summary:', parseError);
        return summary;
      }
      
      return summary;
    } catch (error) {
      console.error('Error expanding summary:', error);
      return summary;
    }
  }
}
