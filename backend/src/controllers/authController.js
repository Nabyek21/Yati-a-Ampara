import jwt from "jsonwebtoken";
import logger from "../utils/logger.js";
import { UsuarioModel } from "../models/UsuarioModel.js";
import { asyncHandler, ConflictError, NotFoundError, AuthenticationError } from "../middleware/errorHandler.js";

export const register = asyncHandler(async (req, res) => {
  const { dni, nombres, apellidos, celular, correo, contrasena } = req.validatedBody;

  logger.info('Intento de registro', { correo });

  // Verificar si correo ya existe
  const existeCorreo = await UsuarioModel.findByCorreo(correo);
  if (existeCorreo) {
    logger.warn('Intento de registro con correo duplicado', { correo });
    throw new ConflictError("El correo ya está registrado");
  }

  // Crear usuario (id_rol = 3 por defecto = estudiante)
  const nuevoUsuario = await UsuarioModel.create({
    dni,
    nombres,
    apellidos,
    celular,
    correo,
    contrasena,
    id_rol: 3,
  });

  logger.info('Usuario registrado exitosamente', { 
    id_usuario: nuevoUsuario.insertId,
    correo 
  });

  res.status(201).json({
    success: true,
    message: "Usuario registrado correctamente",
    usuario: {
      id_usuario: nuevoUsuario.insertId,
      nombres,
      apellidos,
      correo,
    },
  });
});



export const login = asyncHandler(async (req, res) => {
  const { correo, contrasena } = req.validatedBody;

  logger.info('Intento de login', { correo });

  const usuario = await UsuarioModel.findByCorreo(correo);

  if (!usuario) {
    logger.warn('Intento de login con correo no encontrado', { correo });
    throw new NotFoundError("Usuario no encontrado");
  }

  const passwordOk = await UsuarioModel.verificarPassword(
    contrasena,
    usuario.contrasena
  );

  if (!passwordOk) {
    logger.warn('Intento de login con contraseña incorrecta', { correo });
    throw new AuthenticationError("Contraseña incorrecta");
  }

  // Obtener id_docente_perfil si existe
  let id_docente_perfil = null;
  if (usuario.id_rol === 2) { // Si es docente
    try {
      const { pool } = await import("../config/database.js");
      const [docentes] = await pool.query(
        "SELECT id_docente_perfil FROM docentes_perfil WHERE id_usuario = ? LIMIT 1",
        [usuario.id_usuario]
      );
      if (docentes.length > 0) {
        id_docente_perfil = docentes[0].id_docente_perfil;
      }
    } catch (err) {
      logger.error("Error obteniendo id_docente_perfil", { 
        id_usuario: usuario.id_usuario,
        error: err.message 
      });
    }
  }

  const token = jwt.sign(
    {
      id_usuario: usuario.id_usuario,
      id_rol: usuario.id_rol,
      correo: usuario.correo,
    },
    process.env.JWT_SECRET || "tu_clave_secreta",
    { expiresIn: "24h" }
  );

  logger.info('Login exitoso', { 
    id_usuario: usuario.id_usuario,
    correo,
    id_rol: usuario.id_rol
  });

  res.status(200).json({
    success: true,
    message: "Login exitoso",
    token,
    usuario: {
      id_usuario: usuario.id_usuario,
      nombres: usuario.nombres,
      apellidos: usuario.apellidos,
      correo: usuario.correo,
      rol: usuario.id_rol,
      id_docente_perfil: id_docente_perfil,
    },
  });
});
