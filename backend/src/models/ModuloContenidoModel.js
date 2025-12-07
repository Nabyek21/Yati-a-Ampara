import { pool } from "../config/database.js";

export class ModuloContenidoModel {
  static async create(data) {
    const { id_modulo, id_seccion, tipo, titulo, descripcion, url_contenido, archivo, orden, id_estado } = data;
    const [result] = await pool.query(
      "INSERT INTO modulo_contenido (id_modulo, id_seccion, tipo, titulo, descripcion, url_contenido, archivo, orden, id_estado) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [id_modulo, id_seccion, tipo, titulo, descripcion, url_contenido, archivo, orden, id_estado || 1] // id_estado por defecto 1 (Activo)
    );
    return result;
  }

  static async getByModulo(id_modulo, id_seccion = null) {
    let query = `
      SELECT 
        id_contenido,
        id_modulo,
        id_seccion,
        tipo,
        titulo,
        descripcion,
        url_contenido,
        archivo,
        orden,
        fecha_creacion,
        id_estado
      FROM modulo_contenido
      WHERE id_modulo = ?
    `;
    const params = [id_modulo];
    
    if (id_seccion) {
      query += " AND id_seccion = ?";
      params.push(id_seccion);
    }
    
    query += " ORDER BY orden, fecha_creacion";
    
    const [rows] = await pool.query(query, params);
    return rows;
  }

  static async getBySeccion(id_seccion) {
    const [rows] = await pool.query(
      `SELECT 
        id_contenido,
        id_modulo,
        id_seccion,
        tipo,
        titulo,
        descripcion,
        url_contenido,
        archivo,
        orden,
        fecha_creacion,
        id_estado
      FROM modulo_contenido
      WHERE id_seccion = ?
      ORDER BY id_modulo, orden, fecha_creacion`,
      [id_seccion]
    );
    return rows;
  }

  static async update(id_contenido, data) {
    const fields = [];
    const params = [];

    for (const key in data) {
      if (Object.hasOwnProperty.call(data, key)) {
        const value = data[key];
        // Saltar undefined, null, y objetos vacíos
        if (value === undefined || value === null) {
          continue;
        }
        // Saltar objetos vacíos (como {})
        if (typeof value === 'object' && Object.keys(value).length === 0) {
          continue;
        }
        fields.push(`${key} = ?`);
        params.push(value);
      }
    }

    if (fields.length === 0) {
      return null;
    }

    params.push(id_contenido);
    const query = `UPDATE modulo_contenido SET ${fields.join(', ')} WHERE id_contenido = ?`;
    const [result] = await pool.query(query, params);
    return result;
  }

  static async delete(id_contenido) {
    const [result] = await pool.query("DELETE FROM modulo_contenido WHERE id_contenido = ?", [id_contenido]);
    return result;
  }

  static async findById(id_contenido) {
    const [rows] = await pool.query(
      "SELECT * FROM modulo_contenido WHERE id_contenido = ? LIMIT 1",
      [id_contenido]
    );
    return rows[0] || null;
  }
}
