import express from "express";
import { upload } from "../middlewares/uploadMiddleware.js";

const router = express.Router();

// Middleware para capturar id_modulo ANTES de multer
const captureModuloId = (req, res, next) => {
  // Capturar id_modulo desde query parameter
  req.moduloInfo = {
    id_modulo: req.query?.id_modulo || 'general'
  };
  console.log(`🔍 captureModuloId - id_modulo: ${req.moduloInfo.id_modulo}`);
  next();
};

// Endpoint para subir archivos de contenido
// El flujo es:
// 1. captureModuloId() - guarda id_modulo en req.moduloInfo desde query params
// 2. upload.single('archivo') - multer procesa el archivo y lo guarda en /uploads/modulos/modulo_X/
// 3. La ruta maneja la respuesta
router.post("/contenido", captureModuloId, upload.single('archivo'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No se recibió archivo" });
    }

    // El id_modulo está guardado desde el query parameter
    const id_modulo = req.moduloInfo?.id_modulo || req.query?.id_modulo || 'general';
    console.log(`✅ Archivo guardado: ${req.file.filename}`);
    console.log(`   Módulo: ${id_modulo}`);
    console.log(`   Ruta: ${req.file.path}`);
    
    res.json({
      message: "Archivo subido correctamente",
      filename: req.file.filename,
      originalname: req.file.originalname,
      size: req.file.size,
      id_modulo: id_modulo,
      path: req.file.path
    });
  } catch (err) {
    console.error("ERROR subiendo archivo:", err);
    res.status(500).json({ message: "Error al subir archivo" });
  }
});

export default router;
