import { pool } from '../config/database.js';
import CalificacionesService from '../services/CalificacionesService.js';

export async function getNotasByMatricula(req, res) {
  try {
    const { matricula, actividad } = req.query;
    
    if (!matricula) {
      return res.status(400).json({ message: 'Se requiere id_matricula' });
    }

    let query = `
      SELECT n.*, a.titulo as nombre_actividad, a.tipo, a.id_seccion
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
    const { puntaje_obtenido, razonCambio } = req.body;
    if (!id_nota || puntaje_obtenido === undefined) {
      return res.status(400).json({ message: 'Faltan parámetros' });
    }

    // Obtener nota actual y datos de matricula/actividad
    const [notaActual] = await pool.query(
      `SELECT n.id_matricula, n.puntaje_obtenido, a.id_seccion 
       FROM notas n 
       JOIN actividades a ON n.id_actividad = a.id_actividad 
       WHERE n.id_nota = ?`,
      [id_nota]
    );

    if (!notaActual || notaActual.length === 0) {
      return res.status(404).json({ message: 'Nota no encontrada' });
    }

    const { id_matricula, puntaje_obtenido: puntajeAnterior, id_seccion } = notaActual[0];

    // Actualizar nota
    await pool.query('UPDATE notas SET puntaje_obtenido = ? WHERE id_nota = ?', [puntaje_obtenido, id_nota]);

    // Registrar cambio en auditoría
    try {
      await CalificacionesService.registrarCambioNota(
        id_nota, id_matricula, null, puntajeAnterior, puntaje_obtenido, razonCambio, req.user?.id
      );
    } catch (auditError) {
      console.error('Aviso: No se registró el cambio en auditoría:', auditError.message);
      // No fallar por auditoría
    }

    // Recalcular promedios
    try {
      await CalificacionesService.recalcularPromedioPorTipo(id_matricula, id_seccion);
      await CalificacionesService.recalcularNotaFinal(id_matricula, id_seccion);
    } catch (calcError) {
      console.error('Aviso: Error recalculando calificaciones:', calcError.message);
      // No fallar por recálculo, pero informar
    }

    res.json({ 
      message: 'Nota actualizada',
      notaFinal: await CalificacionesService.obtenerNotaFinal(id_matricula, id_seccion)
    });
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

    // Obtener puntaje_max de la actividad e id_seccion
    const [actividad] = await pool.query(
      'SELECT puntaje_max, id_seccion FROM actividades WHERE id_actividad = ?',
      [id_actividad]
    );

    if (!actividad || actividad.length === 0) {
      return res.status(404).json({ message: 'Actividad no encontrada' });
    }

    const { puntaje_max, id_seccion } = actividad[0];

    // Insertar nueva nota
    const [result] = await pool.query(
      'INSERT INTO notas (id_matricula, id_actividad, puntaje_obtenido, puntaje_max) VALUES (?, ?, ?, ?)',
      [id_matricula, id_actividad, puntaje_obtenido, puntaje_max]
    );

    // Recalcular promedios automáticamente
    try {
      await CalificacionesService.recalcularPromedioPorTipo(id_matricula, id_seccion);
      await CalificacionesService.recalcularNotaFinal(id_matricula, id_seccion);
    } catch (calcError) {
      console.error('Aviso: Error recalculando calificaciones:', calcError.message);
      // No fallar por recálculo, pero informar
    }

    res.status(201).json({
      id_nota: result.insertId,
      message: 'Nota creada exitosamente',
      notaFinal: await CalificacionesService.obtenerNotaFinal(id_matricula, id_seccion)
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al crear nota', error: error.message });
  }
}
