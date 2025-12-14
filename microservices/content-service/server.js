/**
 * Content Service Microservice
 * Puerto: 3003
 * Responsabilidad: Gestión de contenido de módulos (archivos, recursos, etc.)
 * 
 * NOTA: Este es un ejemplo de demostración
 * En producción, usaría MySQL para persistencia
 */

import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const app = express();
app.use(express.json());

// Configuración de upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(process.cwd(), 'uploads'));
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ storage });

// Base de datos simulada
const moduleContents = new Map();

// Middleware para logging
app.use((req, res, next) => {
  console.log(`[Content Service] ${req.method} ${req.path}`);
  next();
});

/**
 * GET /modules/:id/content
 * Obtener todo el contenido de un módulo
 */
app.get('/modules/:id/content', (req, res) => {
  try {
    const { id } = req.params;

    // Simulación: obtener contenido del mapa
    const content = moduleContents.get(id) || {
      id_modulo: id,
      titulo: `Módulo ${id}`,
      descripcion: 'Descripción del módulo',
      archivos: [],
      enlaces: []
    };

    res.json({
      success: true,
      data: content
    });
  } catch (err) {
    console.error('Error en GET /modules/:id/content:', err.message);
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /modules/:id/content/files
 * Obtener solo los archivos de un módulo
 */
app.get('/modules/:id/content/files', (req, res) => {
  try {
    const { id } = req.params;
    const content = moduleContents.get(id);

    if (!content) {
      return res.status(404).json({ error: 'Módulo no encontrado' });
    }

    res.json({
      success: true,
      moduleId: id,
      files: content.archivos || [],
      count: (content.archivos || []).length
    });
  } catch (err) {
    console.error('Error en GET /modules/:id/content/files:', err.message);
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /modules/:id/content/links
 * Obtener solo los enlaces de un módulo
 */
app.get('/modules/:id/content/links', (req, res) => {
  try {
    const { id } = req.params;
    const content = moduleContents.get(id);

    if (!content) {
      return res.status(404).json({ error: 'Módulo no encontrado' });
    }

    res.json({
      success: true,
      moduleId: id,
      links: content.enlaces || [],
      count: (content.enlaces || []).length
    });
  } catch (err) {
    console.error('Error en GET /modules/:id/content/links:', err.message);
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /modules/:id/content/file
 * Subir un archivo a un módulo
 */
app.post('/modules/:id/content/file', upload.single('archivo'), (req, res) => {
  try {
    const { id } = req.params;
    const { descripcion } = req.body;

    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    // Obtener o crear contenido
    let content = moduleContents.get(id);
    if (!content) {
      content = {
        id_modulo: id,
        titulo: `Módulo ${id}`,
        descripcion: 'Descripción del módulo',
        archivos: [],
        enlaces: []
      };
    }

    // Agregar archivo
    const newFile = {
      id_archivo: Date.now(),
      nombre: req.file.filename,
      nombreOriginal: req.file.originalname,
      tamaño: req.file.size,
      tipo: req.file.mimetype,
      descripcion: descripcion || '',
      ruta: `/uploads/${req.file.filename}`,
      fechaSubida: new Date().toISOString()
    };

    content.archivos.push(newFile);
    moduleContents.set(id, content);

    res.json({
      success: true,
      file: newFile
    });
  } catch (err) {
    console.error('Error en POST /modules/:id/content/file:', err.message);
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /modules/:id/content/link
 * Agregar un enlace externo a un módulo
 */
app.post('/modules/:id/content/link', (req, res) => {
  try {
    const { id } = req.params;
    const { url, titulo, descripcion } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    // Obtener o crear contenido
    let content = moduleContents.get(id);
    if (!content) {
      content = {
        id_modulo: id,
        titulo: `Módulo ${id}`,
        descripcion: 'Descripción del módulo',
        archivos: [],
        enlaces: []
      };
    }

    // Agregar enlace
    const newLink = {
      id_enlace: Date.now(),
      url: url,
      titulo: titulo || 'Sin título',
      descripcion: descripcion || '',
      tipo: detectarTipoEnlace(url),
      fechaAgregada: new Date().toISOString()
    };

    content.enlaces.push(newLink);
    moduleContents.set(id, content);

    res.json({
      success: true,
      link: newLink
    });
  } catch (err) {
    console.error('Error en POST /modules/:id/content/link:', err.message);
    res.status(500).json({ error: err.message });
  }
});

/**
 * DELETE /modules/:id/content/file/:fileId
 * Eliminar un archivo del módulo
 */
app.delete('/modules/:id/content/file/:fileId', (req, res) => {
  try {
    const { id, fileId } = req.params;

    const content = moduleContents.get(id);
    if (!content) {
      return res.status(404).json({ error: 'Módulo no encontrado' });
    }

    // Encontrar y eliminar archivo
    const fileIndex = content.archivos.findIndex(f => f.id_archivo == fileId);
    if (fileIndex === -1) {
      return res.status(404).json({ error: 'Archivo no encontrado' });
    }

    const deletedFile = content.archivos.splice(fileIndex, 1)[0];

    // Eliminar archivo físico
    try {
      const filePath = path.join(process.cwd(), 'uploads', deletedFile.nombre);
      fs.unlinkSync(filePath);
    } catch (err) {
      console.warn('Could not delete physical file:', err.message);
    }

    moduleContents.set(id, content);

    res.json({
      success: true,
      message: 'Archivo eliminado',
      deletedFile: deletedFile
    });
  } catch (err) {
    console.error('Error en DELETE /modules/:id/content/file/:fileId:', err.message);
    res.status(500).json({ error: err.message });
  }
});

/**
 * DELETE /modules/:id/content/link/:linkId
 * Eliminar un enlace del módulo
 */
app.delete('/modules/:id/content/link/:linkId', (req, res) => {
  try {
    const { id, linkId } = req.params;

    const content = moduleContents.get(id);
    if (!content) {
      return res.status(404).json({ error: 'Módulo no encontrado' });
    }

    // Encontrar y eliminar enlace
    const linkIndex = content.enlaces.findIndex(l => l.id_enlace == linkId);
    if (linkIndex === -1) {
      return res.status(404).json({ error: 'Enlace no encontrado' });
    }

    const deletedLink = content.enlaces.splice(linkIndex, 1)[0];
    moduleContents.set(id, content);

    res.json({
      success: true,
      message: 'Enlace eliminado',
      deletedLink: deletedLink
    });
  } catch (err) {
    console.error('Error en DELETE /modules/:id/content/link/:linkId:', err.message);
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /modules/:id/content/size
 * Obtener el tamaño total del contenido
 */
app.get('/modules/:id/content/size', (req, res) => {
  try {
    const { id } = req.params;
    const content = moduleContents.get(id);

    if (!content) {
      return res.status(404).json({ error: 'Módulo no encontrado' });
    }

    const totalSize = content.archivos.reduce((sum, f) => sum + (f.tamaño || 0), 0);

    res.json({
      success: true,
      moduleId: id,
      totalSize: totalSize,
      totalFiles: content.archivos.length,
      totalLinks: content.enlaces.length,
      formattedSize: formatBytes(totalSize)
    });
  } catch (err) {
    console.error('Error en GET /modules/:id/content/size:', err.message);
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /health
 * Health check del servicio
 */
app.get('/health', (req, res) => {
  res.json({
    service: 'Content Service',
    status: 'UP',
    timestamp: new Date().toISOString(),
    modulesLoaded: moduleContents.size
  });
});

/**
 * Funciones Auxiliares
 */

function detectarTipoEnlace(url) {
  const urlLower = url.toLowerCase();
  if (urlLower.includes('youtube.com') || urlLower.includes('youtu.be')) return 'youtube';
  if (urlLower.includes('vimeo.com')) return 'vimeo';
  if (urlLower.includes('github.com')) return 'github';
  if (urlLower.includes('stackoverflow.com')) return 'stackoverflow';
  return 'external';
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Manejo de errores
 */
app.use((err, req, res, next) => {
  console.error('Content Service Error:', err);
  res.status(err.status || 500).json({
    error: err.message,
    service: 'Content Service',
    timestamp: new Date().toISOString()
  });
});

// Iniciar servidor
const PORT = process.env.PORT || 3003;
app.listen(PORT, () => {
  console.log(`📁 Content Service running on port ${PORT}`);
});

export default app;
