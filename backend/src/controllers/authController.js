import jwt from "jsonwebtoken";
import { UsuarioModel } from "../models/UsuarioModel.js";

export const register = async (req, res) => {
  try {
    const {
      dni,
      nombres,
      apellidos,
      celular,
      correo,
      contrasena,
    } = req.body;

    // Validación básica
    if (!correo || !contrasena || !nombres || !apellidos) {
      return res.status(400).json({ message: "Faltan datos obligatorios" });
    }

    // Verificar si correo ya existe
    const existeCorreo = await UsuarioModel.findByCorreo(correo);
    if (existeCorreo) {
      return res.status(409).json({ message: "El correo ya está registrado" });
    }

    // Crear usuario (id_rol = 2 por defecto = estudiante)
    const nuevoUsuario = await UsuarioModel.create({
      dni,
      nombres,
      apellidos,
      celular,
      correo,
      contrasena,
      id_rol: 3, // << Rol por defecto (Usuaria)
    });

    res.status(201).json({
      message: "Usuario registrado correctamente",
      usuario: {
        id_usuario: nuevoUsuario.insertId,
        nombres,
        apellidos,
        correo,
      },
    });

  } catch (err) {
    console.error("ERROR registro:", err);
    res.status(500).json({ message: "Error interno en registro" });
  }
};



export const login = async (req, res) => {
  const { correo, contrasena } = req.body;

  try {
    const usuario = await UsuarioModel.findByCorreo(correo);

    if (!usuario)
      return res.status(404).json({ message: "Correo no encontrado" });

    const passwordOk = await UsuarioModel.verificarPassword(
      contrasena,
      usuario.contrasena
    );

    if (!passwordOk)
      return res.status(401).json({ message: "Contraseña incorrecta" });

    const token = jwt.sign(
      {
        id_usuario: usuario.id_usuario,
        id_rol: usuario.id_rol,
      },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    res.json({
      message: "Login exitoso",
      token,
      usuario: {
        id_usuario: usuario.id_usuario,
        nombres: usuario.nombres,
        apellidos: usuario.apellidos,
        rol: usuario.id_rol,
      },
    });
  } catch (err) {
    console.error("ERROR login:", err);
    res.status(500).json({ message: "Error interno" });
  }
};
