/**
 * Rutas para generar PDF extendido del resumen
 */

import { Router } from 'express';
import path from 'path';
import fs from 'fs';
import { PDFGeneratorService } from '../services/pdfGeneratorService.js';
import { ModuleSummaryService } from '../services/moduleSummaryService.js';

const router = Router();

/**
 * POST /api/pdf/extended-summary
 * Generar PDF extendido del resumen del módulo
 */
router.post('/extended-summary', async (req, res) => {
  try {
    const { moduleId, courseId, userId } = req.body;

    if (!moduleId || !courseId) {
      return res.status(400).json({
        success: false,
        message: 'Se requiere moduleId y courseId',
      });
    }

    const pdfService = new PDFGeneratorService(process.env.IA_API_KEY);
    const summaryService = new ModuleSummaryService(process.env.IA_API_KEY);

    // 1. Obtener contenido del módulo con los temas reales
    const moduleContent = await summaryService.getModuleContent(moduleId);
    
    if (!moduleContent) {
      return res.status(400).json({
        success: false,
        message: 'Módulo no encontrado',
      });
    }

    // 2. Generar resumen
    const summaryResult = await summaryService.generateModuleSummary(moduleId, courseId, userId);

    if (!summaryResult.success) {
      return res.status(400).json(summaryResult);
    }

    // 3. Expandir resumen con más detalles
    console.log('📖 Expandiendo resumen...');
    const expandedSummary = await pdfService.expandSummary(
      summaryResult.summary.contenido,
      summaryResult.moduleInfo.descripcion
    );

    // 4. Generar PDF con información de temas
    console.log('📄 Generando PDF...');
    const pdfResult = await pdfService.generateExtendedPDF(
      summaryResult.moduleInfo,
      expandedSummary,
      moduleContent, // 👈 Pasar los temas del módulo
      summaryResult.studentInfo || null
    );

    if (!pdfResult.success) {
      return res.status(500).json(pdfResult);
    }

    res.json({
      success: true,
      message: '✅ PDF generado exitosamente',
      pdfUrl: pdfResult.url,
      fileName: pdfResult.fileName,
      summary: expandedSummary,
    });
  } catch (error) {
    console.error('Error en /extended-summary:', error);
    res.status(500).json({
      success: false,
      message: 'Error al generar PDF',
      error: error.message,
    });
  }
});

/**
 * POST /api/pdf/download
 * Descargar PDF generado
 */
router.get('/download/:filename', (req, res) => {
  try {
    const filePath = path.join(process.cwd(), 'src', 'uploads', 'pdfs', req.params.filename);

    // Validar que el archivo existe
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'PDF no encontrado' });
    }

    res.download(filePath);
  } catch (error) {
    res.status(500).json({
      error: 'Error al descargar PDF',
      message: error.message,
    });
  }
});

export default router;
