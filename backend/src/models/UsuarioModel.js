import { pool } from "../config/database.js";
import bcrypt from "bcrypt";

export class UsuarioModel {
  
  // Buscar usuario por correo
  static async findByCorreo(correo) {
    const [rows] = await pool.query(
      "SELECT * FROM usuarios WHERE correo = ? LIMIT 1",
      [correo]
    );
    return rows[0] || null;
  }

  // Crear un usuario nuevo
  static async create(data) {
    const {
      dni,
      nombres,
      apellidos,
      celular,
      correo,
      contrasena,
      id_rol
    } = data;

    const hashedPassword = await bcrypt.hash(contrasena, 10);

    const [result] = await pool.query(
      `INSERT INTO usuarios 
       (dni, nombres, apellidos, celular, correo, contrasena, id_rol, id_estado) 
       VALUES (?, ?, ?, ?, ?, ?, ?, 1)`,
      [
        dni,
        nombres,
        apellidos,
        celular,
        correo,
        hashedPassword,
        id_rol
      ]
    );

    return result;
  }

  // Comparar contraseñas
  static async verificarPassword(password, passwordHashed) {
    return bcrypt.compare(password, passwordHashed);
  }
}
