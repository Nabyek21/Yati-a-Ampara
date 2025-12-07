import { pool } from '../config/database.js';

export async function getNotasByMatricula(req, res) {
  try {
    const { matricula, actividad } = req.query;
    
    if (!matricula) {
      return res.status(400).json({ message: 'Se requiere id_matricula' });
    }

    let query = `
      SELECT n.*, a.titulo as nombre_actividad, a.tipo
      FROM notas n
      JOIN actividades a ON n.id_actividad = a.id_actividad
      WHERE n.id_matricula = ?
    `;
    let params = [matricula];

    if (actividad) {
      query += ' AND n.id_actividad = ?';
      params.push(actividad);
    }

    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener notas', error: error.message });
  }
}

export async function updateNota(req, res) {
  try {
    const { id_nota } = req.params;
    const { puntaje_obtenido } = req.body;
    if (!id_nota || puntaje_obtenido === undefined) {
      return res.status(400).json({ message: 'Faltan parámetros' });
    }
    await pool.query('UPDATE notas SET puntaje_obtenido = ? WHERE id_nota = ?', [puntaje_obtenido, id_nota]);
    res.json({ message: 'Nota actualizada' });
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar nota', error: error.message });
  }
}

export async function createNota(req, res) {
  try {
    const { id_matricula, id_actividad, puntaje_obtenido } = req.body;
    
    if (!id_matricula || !id_actividad || puntaje_obtenido === undefined) {
      return res.status(400).json({ message: 'Faltan parámetros requeridos' });
    }

    // Obtener puntaje_max de la actividad
    const [actividad] = await pool.query(
      'SELECT puntaje_max FROM actividades WHERE id_actividad = ?',
      [id_actividad]
    );

    if (!actividad || actividad.length === 0) {
      return res.status(404).json({ message: 'Actividad no encontrada' });
    }

    const puntaje_max = actividad[0].puntaje_max;

    // Insertar nueva nota
    const [result] = await pool.query(
      'INSERT INTO notas (id_matricula, id_actividad, puntaje_obtenido, puntaje_max) VALUES (?, ?, ?, ?)',
      [id_matricula, id_actividad, puntaje_obtenido, puntaje_max]
    );

    res.status(201).json({
      id_nota: result.insertId,
      message: 'Nota creada exitosamente'
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al crear nota', error: error.message });
  }
}
