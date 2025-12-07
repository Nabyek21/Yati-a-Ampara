import jwt from 'jsonwebtoken';
import { promisify } from 'util';

// Verificar token de autenticación
export const verificarToken = async (req, res, next) => {
    try {
        // Obtener el token del header
        let token;
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'No estás autenticado. Por favor inicia sesión para continuar.'
            });
        }

        // Verificar el token
        const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

        // Asignar el usuario al request
        req.user = decoded;
        next();
    } catch (error) {
        console.error('Error en verificarToken:', error);
        return res.status(401).json({
            success: false,
            message: 'Token inválido o expirado. Por favor inicia sesión nuevamente.'
        });
    }
};

// Verificar roles de usuario
export const verificarRol = (rolesPermitidos = []) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'No estás autenticado'
            });
        }

        // Si no se especifican roles, se permite el acceso
        if (rolesPermitidos.length === 0) {
            return next();
        }

        // Verificar si el rol del usuario está en los permitidos
        if (!rolesPermitidos.includes(req.user.rol)) {
            return res.status(403).json({
                success: false,
                message: 'No tienes permiso para realizar esta acción'
            });
        }

        next();
    };
};

// Verificar si el usuario es el propietario del recurso
export const verificarPropietario = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: 'No estás autenticado'
        });
    }

    // Verificar si el usuario es administrador
    if (req.user.rol === 'administrador') {
        return next();
    }

    // Verificar si el usuario es el propietario del recurso
    if (req.user.id.toString() !== req.params.id) {
        return res.status(403).json({
            success: false,
            message: 'No tienes permiso para acceder a este recurso'
        });
    }

    next();
};

// Middleware para manejar errores
export const manejarErrores = (err, req, res, next) => {
    console.error('Error:', err.stack);
    
    // Error de validación
    if (err.name === 'ValidationError') {
        const mensajes = Object.values(err.errors).map(error => error.message);
        return res.status(400).json({
            success: false,
            message: 'Error de validación',
            errors: mensajes
        });
    }

    // Error de duplicado
    if (err.code === 11000) {
        return res.status(400).json({
            success: false,
            message: 'El registro ya existe',
            campo: Object.keys(err.keyPattern)[0]
        });
    }

    // Error de autenticación
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
            success: false,
            message: 'Token inválido'
        });
    }

    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
            success: false,
            message: 'Sesión expirada. Por favor inicia sesión nuevamente.'
        });
    }

    // Error general del servidor
    res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? err.message : 'Error interno'
    });
};

export default {
    verificarToken,
    verificarRol,
    verificarPropietario,
    manejarErrores
};
