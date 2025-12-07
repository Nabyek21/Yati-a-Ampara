import { pool } from '../config/database.js';

export class NotaModel {
    // Guardar o actualizar una nota en la tabla notas
    static async guardarNota({ id_matricula, id_actividad, puntaje_obtenido, puntaje_maximo }) {
        try {
            // Calcular porcentaje
            const porcentaje = puntaje_maximo > 0 
                ? Math.round((puntaje_obtenido / puntaje_maximo) * 100) 
                : 0;

            // Verificar si ya existe una nota para esta matricula y actividad
            const [notasExistentes] = await pool.query(
                'SELECT id_nota FROM notas WHERE id_matricula = ? AND id_actividad = ?',
                [id_matricula, id_actividad]
            );

            if (notasExistentes && notasExistentes.length > 0) {
                // Actualizar nota existente
                const id_nota = notasExistentes[0].id_nota;
                await pool.query(
                    'UPDATE notas SET puntaje_obtenido = ?, puntaje_maximo = ?, porcentaje = ?, fecha_calificacion = NOW() WHERE id_nota = ?',
                    [puntaje_obtenido, puntaje_maximo, porcentaje, id_nota]
                );
                return { id_nota, puntaje_obtenido, puntaje_maximo, porcentaje };
            } else {
                // Insertar nueva nota
                const [result] = await pool.query(
                    'INSERT INTO notas (id_matricula, id_actividad, puntaje_obtenido, puntaje_maximo, porcentaje, fecha_calificacion) VALUES (?, ?, ?, ?, ?, NOW())',
                    [id_matricula, id_actividad, puntaje_obtenido, puntaje_maximo, porcentaje]
                );
                return { id_nota: result.insertId, puntaje_obtenido, puntaje_maximo, porcentaje };
            }
        } catch (error) {
            console.error('Error al guardar nota:', error);
            throw error;
        }
    }

    // Obtener una nota específica
    static async obtenerNota(id_nota) {
        try {
            const [notas] = await pool.query(
                SELECT n.*, a.nombre as nombre_actividad, a.tipo, u.nombre as nombre_alumno
                 FROM notas n
                 JOIN actividades a ON n.id_actividad = a.id_actividad
                 JOIN matriculas m ON n.id_matricula = m.id_matricula
                 JOIN usuarios u ON m.id_usuario = u.id_usuario
                 WHERE n.id_nota = ?,
                [id_nota]
            );
            return notas.length > 0 ? notas[0] : null;
        } catch (error) {
            console.error('Error al obtener nota:', error);
            throw error;
        }
    }

    // Obtener todas las notas de un estudiante
    static async obtenerNotasEstudiante(id_matricula) {
        try {
            const [notas] = await pool.query(
                SELECT n.*, a.nombre as nombre_actividad, a.tipo
                 FROM notas n
                 JOIN actividades a ON n.id_actividad = a.id_actividad
                 WHERE n.id_matricula = ?
                 ORDER BY n.fecha_calificacion DESC,
                [id_matricula]
            );
            return notas;
        } catch (error) {
            console.error('Error al obtener notas del estudiante:', error);
            throw error;
        }
    }

    // Obtener todas las notas de un curso
    static async obtenerNotasCurso(id_curso) {
        try {
            const [notas] = await pool.query(
                SELECT n.*, a.nombre as nombre_actividad, a.tipo, u.nombre as nombre_alumno, m.id_matricula
                 FROM notas n
                 JOIN actividades a ON n.id_actividad = a.id_actividad
                 JOIN matriculas m ON n.id_matricula = m.id_matricula
                 JOIN usuarios u ON m.id_usuario = u.id_usuario
                 WHERE m.id_curso = ?
                 ORDER BY u.nombre, n.fecha_calificacion,
                [id_curso]
            );
            return notas;
        } catch (error) {
            console.error('Error al obtener notas del curso:', error);
            throw error;
        }
    }

    // Obtener nota por actividad y matricula (para mostrar al docente)
    static async obtenerNotaPorActividad(id_actividad, id_matricula) {
        try {
            const [notas] = await pool.query(
                SELECT n.*, a.nombre as nombre_actividad, a.tipo, u.nombre as nombre_alumno
                 FROM notas n
                 JOIN actividades a ON n.id_actividad = a.id_actividad
                 JOIN matriculas m ON n.id_matricula = m.id_matricula
                 JOIN usuarios u ON m.id_usuario = u.id_usuario
                 WHERE n.id_actividad = ? AND n.id_matricula = ?,
                [id_actividad, id_matricula]
            );
            return notas.length > 0 ? notas[0] : null;
        } catch (error) {
            console.error('Error al obtener nota por actividad:', error);
            throw error;
        }
    }

    // Calcular promedios por tipo de actividad (tareas, exámenes, quices)
    static async calcularPromediosPorTipo(id_matricula) {
        try {
            const [promedios] = await pool.query(
                SELECT a.tipo, AVG(n.porcentaje) as promedio, COUNT(n.id_nota) as cantidad
                 FROM notas n
                 JOIN actividades a ON n.id_actividad = a.id_actividad
                 WHERE n.id_matricula = ?
                 GROUP BY a.tipo,
                [id_matricula]
            );
            return promedios;
        } catch (error) {
            console.error('Error al calcular promedios:', error);
            throw error;
        }
    }

    // Calcular nota final aplicando ponderaciones
    static async calcularNotaFinal(id_matricula, id_curso) {
        try {
            // Obtener ponderaciones del curso
            const [ponderaciones] = await pool.query(
                'SELECT peso_tareas, peso_examenes, peso_quices FROM ponderaciones_actividades WHERE id_curso = ?',
                [id_curso]
            );

            if (!ponderaciones || ponderaciones.length === 0) {
                return null; // Si no hay ponderaciones definidas
            }

            const { peso_tareas, peso_examenes, peso_quices } = ponderaciones[0];

            // Calcular promedios por tipo
            const promedios = await this.calcularPromediosPorTipo(id_matricula);
            
            let notaFinal = 0;
            for (const promedio of promedios) {
                if (promedio.tipo === 'tarea') {
                    notaFinal += (promedio.promedio * peso_tareas) / 100;
                } else if (promedio.tipo === 'examen') {
                    notaFinal += (promedio.promedio * peso_examenes) / 100;
                } else if (promedio.tipo === 'quiz') {
                    notaFinal += (promedio.promedio * peso_quices) / 100;
                }
            }

            return Math.round(notaFinal);
        } catch (error) {
            console.error('Error al calcular nota final:', error);
            throw error;
        }
    }
}
