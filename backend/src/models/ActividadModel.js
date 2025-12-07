import { pool } from "../config/database.js";

export class ActividadModel {
  static async create(data) {
    const {
      id_modulo,
      id_seccion,
      id_docente_perfil,
      titulo,
      tipo,
      descripcion = null,
      fecha_entrega = null,
      puntaje_max = 20,
      id_estado = 1
    } = data;

    const [result] = await pool.query(
      `INSERT INTO actividades 
       (id_modulo, id_seccion, id_docente_perfil, tipo, titulo, descripcion, fecha_entrega, puntaje_max, id_estado) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id_modulo, id_seccion, id_docente_perfil, tipo, titulo, descripcion, fecha_entrega, puntaje_max, id_estado]
    );
    return result;
  }

  static async getAll(filters = {}) {
    let query = `
      SELECT 
        a.id_actividad,
        a.id_modulo,
        m.titulo AS nombre_modulo,
        a.id_seccion,
        s.nombre_seccion,
        a.id_docente_perfil,
        u.nombres AS nombres_docente,
        u.apellidos AS apellidos_docente,
        a.titulo,
        a.tipo,
        a.descripcion,
        a.fecha_publicacion,
        a.fecha_entrega,
        a.puntaje_max,
        a.id_estado,
        e.nombre AS nombre_estado
      FROM actividades a
      LEFT JOIN modulos m ON a.id_modulo = m.id_modulo
      LEFT JOIN secciones s ON a.id_seccion = s.id_seccion
      LEFT JOIN docentes_perfil dp ON a.id_docente_perfil = dp.id_docente_perfil
      LEFT JOIN usuarios u ON dp.id_usuario = u.id_usuario
      LEFT JOIN estados e ON a.id_estado = e.id_estado
      WHERE 1=1
    `;
    const params = [];

    if (filters.id_modulo) {
      query += ` AND a.id_modulo = ?`;
      params.push(parseInt(filters.id_modulo));
    }

    if (filters.id_seccion) {
      query += ` AND a.id_seccion = ?`;
      params.push(parseInt(filters.id_seccion));
    }

    if (filters.id_docente_perfil) {
      query += ` AND a.id_docente_perfil = ?`;
      params.push(parseInt(filters.id_docente_perfil));
    }

    if (filters.tipo) {
      query += ` AND a.tipo = ?`;
      params.push(filters.tipo);
    }

    if (filters.id_estado) {
      query += ` AND a.id_estado = ?`;
      params.push(parseInt(filters.id_estado));
    }

    if (filters.search) {
      query += ` AND (a.titulo LIKE ? OR a.descripcion LIKE ?)`;
      const searchTerm = `%${filters.search}%`;
      params.push(searchTerm, searchTerm);
    }

    query += ` ORDER BY a.fecha_publicacion DESC`;

    const [rows] = await pool.query(query, params);
    return rows;
  }

  static async findById(id_actividad) {
    const [rows] = await pool.query(
      `SELECT 
        a.id_actividad,
        a.id_modulo,
        m.titulo AS nombre_modulo,
        a.id_seccion,
        s.nombre_seccion,
        a.id_docente_perfil,
        u.nombres AS nombres_docente,
        u.apellidos AS apellidos_docente,
        a.titulo,
        a.tipo,
        a.descripcion,
        a.fecha_publicacion,
        a.fecha_entrega,
        a.puntaje_max,
        a.id_estado,
        e.nombre AS nombre_estado
      FROM actividades a
      LEFT JOIN modulos m ON a.id_modulo = m.id_modulo
      LEFT JOIN secciones s ON a.id_seccion = s.id_seccion
      LEFT JOIN docentes_perfil dp ON a.id_docente_perfil = dp.id_docente_perfil
      LEFT JOIN usuarios u ON dp.id_usuario = u.id_usuario
      LEFT JOIN estados e ON a.id_estado = e.id_estado
      WHERE a.id_actividad = ? LIMIT 1`,
      [id_actividad]
    );
    return rows[0] || null;
  }

  // Método para obtener el contenido relacionado de un módulo y sección
  static async getContenidoRelacionado(id_modulo, id_seccion) {
    const [rows] = await pool.query(
      `SELECT 
        id_contenido,
        tipo,
        titulo,
        descripcion,
        url_contenido,
        archivo,
        orden
      FROM modulo_contenido
      WHERE id_modulo = ? AND id_seccion = ?
      ORDER BY orden ASC`,
      [id_modulo, id_seccion]
    );
    return rows;
  }

  static async update(id_actividad, data) {
    const fields = [];
    const params = [];

    for (const key in data) {
      if (Object.hasOwnProperty.call(data, key)) {
        fields.push(`${key} = ?`);
        params.push(data[key]);
      }
    }

    if (fields.length === 0) {
      return null;
    }

    params.push(id_actividad);
    const query = `UPDATE actividades SET ${fields.join(', ')} WHERE id_actividad = ?`;
    const [result] = await pool.query(query, params);
    return result;
  }

  static async delete(id_actividad) {
    // Eliminación en cascada para mantener integridad referencial
    console.log(`[DELETE] Iniciando eliminación de actividad ${id_actividad}`);
    
    try {
      // 1. Paso 1: ELIMINAR TODAS LAS RESPUESTAS DE ALUMNOS DE ESTA ACTIVIDAD
      console.log(`[DELETE] Paso 1: Eliminando respuestas_alumnos...`);
      const [respuestasDeleted] = await pool.query(
        "DELETE FROM respuestas_alumnos WHERE id_actividad = ?",
        [id_actividad]
      );
      console.log(`[DELETE]   ✓ Eliminadas ${respuestasDeleted.affectedRows} respuestas`);

      // 2. Paso 2: OBTENER IDS DE PREGUNTAS
      console.log(`[DELETE] Paso 2: Obteniendo IDs de preguntas...`);
      const [preguntas] = await pool.query(
        "SELECT id_pregunta FROM preguntas WHERE id_actividad = ?",
        [id_actividad]
      );
      console.log(`[DELETE]   ✓ Encontradas ${preguntas.length} preguntas`);

      // 3. Paso 3: ELIMINAR OPCIONES DE RESPUESTA
      console.log(`[DELETE] Paso 3: Eliminando respuestas_opciones...`);
      const [opcionesDeleted] = await pool.query(
        "DELETE FROM respuestas_opciones WHERE id_pregunta IN (SELECT id_pregunta FROM preguntas WHERE id_actividad = ?)",
        [id_actividad]
      );
      console.log(`[DELETE]   ✓ Eliminadas ${opcionesDeleted.affectedRows} opciones`);

      // 4. Paso 4: ELIMINAR PREGUNTAS
      console.log(`[DELETE] Paso 4: Eliminando preguntas...`);
      const [preguntasDeleted] = await pool.query(
        "DELETE FROM preguntas WHERE id_actividad = ?",
        [id_actividad]
      );
      console.log(`[DELETE]   ✓ Eliminadas ${preguntasDeleted.affectedRows} preguntas`);

      // 5. Paso 5: ELIMINAR ACTIVIDAD
      console.log(`[DELETE] Paso 5: Eliminando actividad...`);
      const [result] = await pool.query(
        "DELETE FROM actividades WHERE id_actividad = ?",
        [id_actividad]
      );
      console.log(`[DELETE]   ✓ Actividad eliminada. Filas: ${result.affectedRows}`);
      console.log(`[DELETE] ✅ COMPLETADO EXITOSAMENTE`);
      
      return result;
    } catch (error) {
      console.error("[DELETE] ❌ ERROR:", error.message);
      throw error;
    }
  }
}

