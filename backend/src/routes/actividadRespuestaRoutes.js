import express from 'express';
import { 
    create, 
    getByUsuario, 
    update, 
    getById, 
    getByActividad, 
    calificar, 
    delete_ as deleteRespuesta 
} from '../controllers/actividadRespuestaController.js';
import { verificarToken, verificarRol } from '../middlewares/authMiddleware.js';
import { upload } from '../middlewares/uploadMiddleware.js';

const router = express.Router();

// Configuración de multer para manejar la subida de archivos
const fileUpload = upload.fields([
    { name: 'archivo', maxCount: 1 }
]);

// Rutas para estudiantes
router.post('/', 
    verificarToken,
    fileUpload,
    create
);

router.get('/usuario', 
    verificarToken,
    getByUsuario
);

router.put('/:id', 
    verificarToken,
    fileUpload,
    update
);

// Ruta para obtener una respuesta específica
router.get('/:id', 
    verificarToken,
    getById
);

// Rutas para docentes/administradores
router.get('/actividad/:id_actividad', 
    verificarToken,
    verificarRol(['docente', 'administrador']),
    getByActividad
);

router.post('/:id/calificar', 
    verificarToken,
    verificarRol(['docente', 'administrador']),
    calificar
);

// Ruta para administradores
router.delete('/:id', 
    verificarToken,
    verificarRol(['administrador']),
    deleteRespuesta
);

export { router };
