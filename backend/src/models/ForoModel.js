const mysql = require('mysql2/promise');

class ForoModel {
  static async crearTema(id_seccion, titulo, descripcion, id_usuario) {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });

    try {
      const query = `
        INSERT INTO foros_temas (id_seccion, titulo, descripcion, id_usuario, fecha_creacion)
        VALUES (?, ?, ?, ?, NOW())
      `;
      
      const [result] = await connection.execute(query, [
        id_seccion,
        titulo,
        descripcion,
        id_usuario
      ]);

      return result.insertId;
    } finally {
      await connection.end();
    }
  }

  static async obtenerTemasPorSeccion(id_seccion) {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });

    try {
      const query = `
        SELECT 
          ft.id_tema,
          ft.titulo,
          ft.descripcion,
          ft.fecha_creacion,
          u.nombres as nombres_usuario,
          u.apellidos,
          COUNT(fr.id_respuesta) as total_respuestas
        FROM foros_temas ft
        JOIN usuarios u ON ft.id_usuario = u.id_usuario
        LEFT JOIN foros_respuestas fr ON ft.id_tema = fr.id_tema
        WHERE ft.id_seccion = ?
        GROUP BY ft.id_tema
        ORDER BY ft.fecha_creacion DESC
      `;
      
      const [results] = await connection.execute(query, [id_seccion]);
      return results;
    } finally {
      await connection.end();
    }
  }

  static async obtenerDetalleTema(id_tema) {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });

    try {
      const query = `
        SELECT 
          ft.id_tema,
          ft.titulo,
          ft.descripcion,
          ft.fecha_creacion,
          ft.id_seccion,
          u.nombres as nombres_usuario,
          u.apellidos,
          COUNT(fr.id_respuesta) as total_respuestas
        FROM foros_temas ft
        JOIN usuarios u ON ft.id_usuario = u.id_usuario
        LEFT JOIN foros_respuestas fr ON ft.id_tema = fr.id_tema
        WHERE ft.id_tema = ?
        GROUP BY ft.id_tema
      `;
      
      const [results] = await connection.execute(query, [id_tema]);
      return results[0] || null;
    } finally {
      await connection.end();
    }
  }

  static async crearRespuesta(id_tema, contenido_respuesta, id_usuario) {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });

    try {
      const query = `
        INSERT INTO foros_respuestas (id_tema, contenido_respuesta, id_usuario, fecha_respuesta)
        VALUES (?, ?, ?, NOW())
      `;
      
      const [result] = await connection.execute(query, [
        id_tema,
        contenido_respuesta,
        id_usuario
      ]);

      return result.insertId;
    } finally {
      await connection.end();
    }
  }

  static async obtenerRespuestasPorTema(id_tema) {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });

    try {
      const query = `
        SELECT 
          fr.id_respuesta,
          fr.contenido_respuesta,
          fr.fecha_respuesta,
          u.nombres as nombres_usuario,
          u.apellidos,
          u.id_usuario
        FROM foros_respuestas fr
        JOIN usuarios u ON fr.id_usuario = u.id_usuario
        WHERE fr.id_tema = ?
        ORDER BY fr.fecha_respuesta ASC
      `;
      
      const [results] = await connection.execute(query, [id_tema]);
      return results;
    } finally {
      await connection.end();
    }
  }

  static async eliminarTema(id_tema) {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });

    try {
      // Primero eliminar respuestas
      await connection.execute('DELETE FROM foros_respuestas WHERE id_tema = ?', [id_tema]);
      
      // Luego eliminar tema
      const [result] = await connection.execute('DELETE FROM foros_temas WHERE id_tema = ?', [id_tema]);
      
      return result.affectedRows > 0;
    } finally {
      await connection.end();
    }
  }

  static async eliminarRespuesta(id_respuesta) {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });

    try {
      const [result] = await connection.execute('DELETE FROM foros_respuestas WHERE id_respuesta = ?', [id_respuesta]);
      return result.affectedRows > 0;
    } finally {
      await connection.end();
    }
  }
}

module.exports = ForoModel;
