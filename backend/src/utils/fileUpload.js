const path = require('path');
const fs = require('fs');

// Función para subir un archivo
exports.uploadFile = async (file, uploadDir) => {
    try {
        // Crear directorio si no existe
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        // Generar nombre único para el archivo
        const fileExt = path.extname(file.name);
        const fileName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${fileExt}`;
        const filePath = path.join(uploadDir, fileName);
        const relativePath = path.relative(path.join(__dirname, '../../'), filePath);

        // Mover el archivo al directorio de uploads
        await file.mv(filePath);

        return {
            success: true,
            filePath: relativePath,
            fileName: fileName
        };
    } catch (error) {
        console.error('Error en uploadFile:', error);
        return {
            success: false,
            error: error.message
        };
    }
};

// Función para eliminar un archivo
exports.deleteFile = async (filePath) => {
    try {
        const fullPath = path.join(__dirname, '../../', filePath);
        
        if (fs.existsSync(fullPath)) {
            await fs.promises.unlink(fullPath);
            return { success: true };
        }
        
        return { success: false, error: 'El archivo no existe' };
    } catch (error) {
        console.error('Error al eliminar archivo:', error);
        return { success: false, error: error.message };
    }
};

// Función para validar el tipo de archivo
exports.validateFileType = (file, allowedTypes) => {
    if (!file) return { isValid: false, error: 'No se ha proporcionado ningún archivo' };
    
    if (!allowedTypes.includes(file.mimetype)) {
        return {
            isValid: false,
            error: `Tipo de archivo no permitido. Solo se permiten: ${allowedTypes.join(', ')}`
        };
    }
    
    return { isValid: true };
};
