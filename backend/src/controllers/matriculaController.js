import { pool } from '../config/database.js';

export async function deleteMatricula(req, res) {
  try {
    const { id_matricula } = req.params;
    const id_usuario = req.user && (req.user.id_usuario || req.user.id);

    if (!id_matricula) {
      return res.status(400).json({ message: 'Se requiere id_matricula' });
    }

    // Verificar que la matrícula existe y pertenece al usuario
    const [matriculaRows] = await pool.query(
      'SELECT * FROM matriculas WHERE id_matricula = ?',
      [id_matricula]
    );

    if (matriculaRows.length === 0) {
      return res.status(404).json({ message: 'Matrícula no encontrada' });
    }

    const matricula = matriculaRows[0];

    // Validar que el usuario solo pueda eliminar sus propias matrículas
    if (matricula.id_usuario !== id_usuario) {
      return res.status(403).json({ message: 'No tienes permiso para eliminar esta matrícula' });
    }

    // Eliminar la matrícula
    await pool.query('DELETE FROM matriculas WHERE id_matricula = ?', [id_matricula]);

    console.log(`✅ Matrícula ${id_matricula} eliminada para usuario ${id_usuario}`);
    res.json({ message: 'Matrícula eliminada correctamente' });
  } catch (error) {
    console.error('❌ Error en deleteMatricula:', error.message);
    res.status(500).json({ message: 'Error al eliminar matrícula', error: error.message });
  }
}

export async function getMatriculasByUsuario(req, res) {
  try {
    let { usuario } = req.query;
    
    // Si no se pasa usuario en query, intentar obtenerlo del token JWT
    if (!usuario && req.user && req.user.id_usuario) {
      usuario = req.user.id_usuario;
    }
    
    if (!usuario) {
      return res.status(400).json({ message: 'Se requiere usuario (id_usuario)' });
    }
    
    console.log('🔍 Buscando matrículas para usuario:', usuario);
    
    // Consulta mejorada que trae datos del curso, sección, especialidad y modalidad
    const [rows] = await pool.query(`
      SELECT 
        m.id_matricula,
        m.id_usuario,
        m.id_seccion,
        m.progreso,
        m.asistencia_porcentaje,
        m.estado_academico,
        m.nota_final,
        c.id_curso,
        c.nombre as nombre_curso,
        c.descripcion as descripcion_curso,
        c.id_especialidad,
        e.nombre as nombre_especialidad,
        s.nombre_seccion,
        s.id_modalidad,
        m_modal.nombre as nombre_modalidad,
        s.horario,
        s.fecha_inicio,
        s.fecha_fin,
  u_docente.nombres as nombres_docente,
  u_docente.apellidos as apellidos_docente,
  c.id_curso as codigo_curso
      FROM matriculas m
      JOIN secciones s ON m.id_seccion = s.id_seccion
  JOIN cursos c ON s.id_curso = c.id_curso
  LEFT JOIN especialidades e ON c.id_especialidad = e.id_especialidad
      LEFT JOIN modalidades m_modal ON s.id_modalidad = m_modal.id_modalidad
      LEFT JOIN docentes_perfil dp ON s.id_docente_perfil = dp.id_docente_perfil
      LEFT JOIN usuarios u_docente ON dp.id_usuario = u_docente.id_usuario
      WHERE m.id_usuario = ?
      ORDER BY m.id_matricula DESC
    `, [usuario]);
    
    console.log('✅ Matrículas encontradas:', rows.length);
    res.json(rows);
  } catch (error) {
    console.error('❌ Error en getMatriculasByUsuario:', error.message);
    console.error('Stack:', error.stack);
    res.status(500).json({ message: 'Error al obtener matrículas', error: error.message });
  }
}

export async function getAlumnosBySeccion(req, res) {
  try {
    const { seccion } = req.query;
    if (!seccion) {
      return res.status(400).json({ message: 'Se requiere id_seccion' });
    }
    const [rows] = await pool.query(`
      SELECT 
        m.id_matricula, 
        m.id_usuario, 
        u.nombres, 
        u.apellidos, 
        u.correo,
        m.progreso, 
        m.nota_final, 
        m.asistencia_porcentaje, 
        m.estado_academico
      FROM matriculas m
      JOIN usuarios u ON m.id_usuario = u.id_usuario
      WHERE m.id_seccion = ?
      ORDER BY u.apellidos, u.nombres
    `, [seccion]);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener alumnos', error: error.message });
  }
}

export async function createMatricula(req, res) {
  try {
    // Obtener id_usuario desde el token (middleware verificarToken debe haberlo puesto en req.user)
    const id_usuario = req.user && (req.user.id_usuario || req.user.id);
    const { id_seccion } = req.body;
    if (!id_usuario) {
      return res.status(401).json({ message: 'Usuario no autenticado' });
    }
    if (!id_seccion) {
      return res.status(400).json({ message: 'Se requiere id_seccion' });
    }

    // Verificar si ya existe la matrícula
    const [exists] = await pool.query(
      'SELECT id_matricula FROM matriculas WHERE id_usuario = ? AND id_seccion = ?',
      [id_usuario, id_seccion]
    );
    if (exists.length > 0) {
      return res.status(409).json({ message: 'El usuario ya está matriculado en esta sección' });
    }

    try {
      const [result] = await pool.query(
        `INSERT INTO matriculas (id_usuario, id_seccion, progreso, asistencia_porcentaje, estado_academico) VALUES (?, ?, 0.00, 0.00, 'matriculado')`,
        [id_usuario, id_seccion]
      );

      const insertId = result.insertId;
      const [rows] = await pool.query('SELECT * FROM matriculas WHERE id_matricula = ?', [insertId]);
      return res.status(201).json(rows[0]);
    } catch (dbError) {
      // Manejar error de clave única si se aplica la constraint en la BD
      console.error('DB error en createMatricula:', dbError.code, dbError.message);
      if (dbError.code === 'ER_DUP_ENTRY' || dbError.errno === 1062) {
        return res.status(409).json({ message: 'El usuario ya está matriculado en esta sección (conflicto en BD)' });
      }
      throw dbError;
    }
  } catch (error) {
    console.error('❌ Error en createMatricula:', error.message);
    console.error('Stack:', error.stack);
    res.status(500).json({ message: 'Error al crear matrícula', error: error.message });
  }
}
