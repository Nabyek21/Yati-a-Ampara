import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Crear directorio de uploads si no existe
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configuración de almacenamiento
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Obtener id_modulo desde:
        // 1. Query parameter (primero - más confiable)
        // 2. req.moduloInfo (pasado por middleware)
        // 3. Por defecto: 'general'
        let id_modulo = req.query?.id_modulo || req.moduloInfo?.id_modulo || 'general';
        
        console.log(`📁 id_modulo detectado: ${id_modulo} (desde: ${req.query?.id_modulo ? 'query' : 'moduloInfo'})`);
        
        // Crear directorio para módulo específico
        // Estructura: /uploads/modulos/modulo_1/, /uploads/modulos/modulo_2/, etc.
        const moduloDir = path.join(uploadDir, 'modulos', `modulo_${id_modulo}`);
        
        if (!fs.existsSync(moduloDir)) {
            fs.mkdirSync(moduloDir, { recursive: true });
            console.log(`✅ Carpeta creada: ${moduloDir}`);
        }
        
        console.log(`📁 Upload dirigido a: ${moduloDir}`);
        cb(null, moduloDir);
    },
    filename: function (req, file, cb) {
        // Nombre del archivo: timestamp-originalname
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const filename = uniqueSuffix + path.extname(file.originalname);
        console.log(`📄 Archivo: ${filename}`);
        cb(null, filename);
    }
});

// Filtro de archivos
const fileFilter = (req, file, cb) => {
    // Tipos de archivo permitidos
    const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
        'text/plain', // .txt
        'text/markdown', // .md
        'application/octet-stream' // Fallback para archivos sin MIME type específico
    ];
    
    // También validar por extensión de archivo
    const fileExtension = path.extname(file.originalname).toLowerCase();
    const allowedExtensions = ['.pdf', '.doc', '.docx', '.txt', '.md'];
    
    if (allowedTypes.includes(file.mimetype) || allowedExtensions.includes(fileExtension)) {
        cb(null, true);
    } else {
        cb(new Error('Tipo de archivo no permitido. Se aceptan: PDF, Word (.doc, .docx), TXT, MD.'), false);
    }
};

// Configuración de multer
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024, // Límite de 10MB
        files: 1 // Máximo 1 archivo
    }
});

// Configuración específica para Biblioteca (50MB)
const storageBiblioteca = multer.diskStorage({
    destination: function (req, file, cb) {
        const bibliotecaDir = path.join(uploadDir, 'biblioteca');
        if (!fs.existsSync(bibliotecaDir)) {
            fs.mkdirSync(bibliotecaDir, { recursive: true });
        }
        cb(null, bibliotecaDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const filename = uniqueSuffix + path.extname(file.originalname);
        cb(null, filename);
    }
});

const fileFilterBiblioteca = (req, file, cb) => {
    // Tipos permitidos: PDF, documentos, presentaciones, audio, video, imágenes
    const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'audio/mpeg',
        'audio/wav',
        'audio/ogg',
        'video/mp4',
        'video/webm',
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
        'application/zip'
    ];

    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error(`Tipo de archivo no permitido: ${file.mimetype}`), false);
    }
};

const uploadMultiple = multer({
    storage: storageBiblioteca,
    fileFilter: fileFilterBiblioteca,
    limits: {
        fileSize: 50 * 1024 * 1024, // Límite de 50MB para biblioteca
        files: 1
    }
});

// Función para manejar la subida de archivos
const uploadFile = (file, uploadPath) => {
    return new Promise((resolve, reject) => {
        // Crear directorio si no existe
        const dir = path.dirname(uploadPath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        // Mover el archivo temporal al destino final
        file.mv(uploadPath, (err) => {
            if (err) {
                console.error('Error al mover el archivo:', err);
                reject({ success: false, error: err });
            } else {
                resolve({ 
                    success: true, 
                    filePath: uploadPath,
                    fileName: path.basename(uploadPath)
                });
            }
        });
    });
};

export { upload, uploadFile, uploadMultiple };

