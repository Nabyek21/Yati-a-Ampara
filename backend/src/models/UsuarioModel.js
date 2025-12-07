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

  // Buscar usuario por ID
  static async findById(id_usuario) {
    const [rows] = await pool.query(
      "SELECT id_usuario, dni, nombres, apellidos, correo, celular, id_rol, id_estado FROM usuarios WHERE id_usuario = ? LIMIT 1",
      [id_usuario]
    );
    return rows[0] || null;
  }

  // Comparar contraseñas
  static async verificarPassword(password, passwordHashed) {
    return bcrypt.compare(password, passwordHashed);
  }

  // Actualizar un usuario (actualización parcial)
  static async update(id_usuario, data) {
    const fields = [];
    const params = [];

    for (const key in data) {
      if (Object.hasOwnProperty.call(data, key)) {
        fields.push(`${key} = ?`);
        params.push(data[key]);
      }
    }

    if (fields.length === 0) {
      return null; // No hay nada que actualizar
    }

    params.push(id_usuario);
    const query = `UPDATE usuarios SET ${fields.join(', ')} WHERE id_usuario = ?`;
    const [result] = await pool.query(query, params);
    return result;
  }

  // Desactivar un usuario (cambiar id_estado a 2 - Inactivo)
  static async deactivate(id_usuario) {
    const [result] = await pool.query(
      "UPDATE usuarios SET id_estado = 2 WHERE id_usuario = ?",
      [id_usuario]
    );
    return result;
  }

  // Obtener todos los usuarios con opciones de búsqueda y filtrado
  static async getAll(filters = {}) {
    let query = "SELECT id_usuario, dni, nombres, apellidos, correo, celular, id_rol, id_estado FROM usuarios";
    const params = [];
    const conditions = [];

    if (filters.rol) {
      conditions.push("id_rol = ?");
      params.push(filters.rol);
    }

    if (filters.search) {
      const searchTerm = `%${filters.search}%`;
      conditions.push("(nombres LIKE ? OR apellidos LIKE ? OR dni LIKE ? OR celular LIKE ?)");
      params.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }

    if (filters.id_estado) {
      conditions.push("id_estado = ?");
      params.push(filters.id_estado);
    }

    // NOTA: Para el filtro de 'cursos', necesitaríamos un JOIN con la tabla de matriculas
    // y cursos. Por ahora, si no tienes la estructura de unión definida, lo omitiré.
    // Si quieres implementar el filtro por curso, necesitaríamos definir la lógica de JOIN aquí.
    // Ejemplo (requiere JOINs):
    /*
    if (filters.id_curso) {
      query += " JOIN matriculas ON usuarios.id_usuario = matriculas.id_usuario WHERE matriculas.id_curso = ?";
      conditions.push("matriculas.id_curso = ?");
      params.push(filters.id_curso);
    }
    */

    if (conditions.length > 0) {
      query += " WHERE " + conditions.join(" AND ");
    }

    const [rows] = await pool.query(query, params);
    return rows;
  }
}
