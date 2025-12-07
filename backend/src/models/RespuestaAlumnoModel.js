import { pool } from '../config/database.js';

class RespuestaAlumnoModel {
    // Crear una nueva respuesta de alumno
    static async create(respuestaData) {
        const { id_actividad, id_pregunta, id_matricula, respuesta_texto, id_opcion, puntaje_obtenido } = respuestaData;
        
        const query = `
            INSERT INTO respuestas_alumnos 
            (id_actividad, id_pregunta, id_matricula, respuesta_texto, id_opcion, puntaje_obtenido) 
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        
        try {
            const [result] = await pool.query(query, [
                id_actividad, 
                id_pregunta,
                id_matricula, 
                respuesta_texto || null,
                id_opcion || null,
                puntaje_obtenido || null
            ]);
            return result.insertId;
        } catch (error) {
            console.error('Error al crear respuesta de alumno:', error);
            throw error;
        }
    }

    // Obtener respuestas por actividad y matrícula
    static async getByActividadYMatricula(id_actividad, id_matricula) {
        const query = `
            SELECT ra.*, p.enunciado as pregunta_texto, 
                   ro.texto as opcion_texto, ro.es_correcta
            FROM respuestas_alumnos ra
            LEFT JOIN preguntas p ON ra.id_pregunta = p.id_pregunta
            LEFT JOIN respuestas_opciones ro ON ra.id_opcion = ro.id_opcion
            WHERE ra.id_actividad = ? AND ra.id_matricula = ?
        `;
        const [rows] = await pool.query(query, [id_actividad, id_matricula]);
        return rows;
    }

    // Obtener respuestas por pregunta (para análisis)
    static async getByPregunta(id_pregunta) {
        const query = `
            SELECT ra.*, u.nombres, u.apellidos, ro.texto as opcion_elegida, ro.es_correcta
            FROM respuestas_alumnos ra
            JOIN matriculas m ON ra.id_matricula = m.id_matricula
            JOIN usuarios u ON m.id_usuario = u.id_usuario
            LEFT JOIN respuestas_opciones ro ON ra.id_opcion = ro.id_opcion
            WHERE ra.id_pregunta = ?
        `;
        const [rows] = await pool.query(query, [id_pregunta]);
        return rows;
    }

    // Actualizar respuesta de alumno
    static async update(id_respuesta, updateData) {
        const { respuesta_texto, id_opcion, puntaje_obtenido } = updateData;
        
        const query = `
            UPDATE respuestas_alumnos 
            SET 
                respuesta_texto = ?,
                id_opcion = ?,
                puntaje_obtenido = ?
            WHERE id_respuesta = ?
        `;
        
        try {
            const [result] = await pool.query(query, [
                respuesta_texto,
                id_opcion,
                puntaje_obtenido || null,
                id_respuesta
            ]);
            return result.affectedRows > 0;
        } catch (error) {
            console.error('Error al actualizar respuesta de alumno:', error);
            throw error;
        }
    }

    // Eliminar respuesta de alumno
    static async delete(id_respuesta) {
        const query = 'DELETE FROM respuestas_alumnos WHERE id_respuesta = ?';
        const [result] = await pool.query(query, [id_respuesta]);
        return result.affectedRows > 0;
    }

    // Obtener estadísticas de respuestas por pregunta
    static async getEstadisticasPregunta(id_pregunta) {
        const query = `
            SELECT 
                COUNT(*) as total_respuestas,
                SUM(CASE WHEN ro.es_correcta = 1 THEN 1 ELSE 0 END) as respuestas_correctas,
                SUM(CASE WHEN ro.es_correcta = 0 OR ro.es_correcta IS NULL THEN 1 ELSE 0 END) as respuestas_incorrectas
            FROM respuestas_alumnos ra
            LEFT JOIN respuestas_opciones ro ON ra.id_opcion = ro.id_opcion
            WHERE ra.id_pregunta = ?
        `;
        
        const [stats] = await pool.query(query, [id_pregunta]);
        return stats[0];
    }

    // Verificar si una matrícula ya respondió una pregunta específica
    static async matriculaYaRespondioPregunta(id_actividad, id_pregunta, id_matricula) {
        const query = `
            SELECT id_respuesta 
            FROM respuestas_alumnos 
            WHERE id_actividad = ? AND id_pregunta = ? AND id_matricula = ?
        `;
        const [rows] = await pool.query(query, [id_actividad, id_pregunta, id_matricula]);
        return rows.length > 0 ? rows[0].id_respuesta : null;
    }

    // Obtener calificación total de una actividad para un alumno
    static async getCalificacionActividad(id_actividad, id_matricula) {
        const query = `
            SELECT 
                ra.id_matricula,
                ra.id_actividad,
                a.puntaje_max as puntaje_maximo_actividad,
                COUNT(DISTINCT ra.id_pregunta) as total_preguntas,
                SUM(p.puntaje) as puntaje_total_preguntas,
                COALESCE(SUM(ra.puntaje_obtenido), 0) as puntaje_obtenido_total,
                COUNT(CASE WHEN ra.puntaje_obtenido IS NOT NULL THEN 1 END) as preguntas_calificadas,
                COUNT(CASE WHEN ra.puntaje_obtenido IS NULL THEN 1 END) as preguntas_sin_calificar
            FROM respuestas_alumnos ra
            LEFT JOIN preguntas p ON ra.id_pregunta = p.id_pregunta
            LEFT JOIN actividades a ON ra.id_actividad = a.id_actividad
            WHERE ra.id_actividad = ? AND ra.id_matricula = ?
            GROUP BY ra.id_actividad, ra.id_matricula
        `;
        const [rows] = await pool.query(query, [id_actividad, id_matricula]);
        return rows[0] || null;
    }

    // Calificar pregunta de opción múltiple automáticamente
    static async calificarPreguntaOpcion(id_respuesta) {
        // Obtener la respuesta con sus datos
        const getQuery = `
            SELECT ra.id_opcion, ra.id_pregunta, p.puntaje
            FROM respuestas_alumnos ra
            LEFT JOIN preguntas p ON ra.id_pregunta = p.id_pregunta
            WHERE ra.id_respuesta = ?
        `;
        const [respuestas] = await pool.query(getQuery, [id_respuesta]);
        
        if (!respuestas || respuestas.length === 0) {
            return false;
        }

        const respuesta = respuestas[0];
        
        // Verificar si la opción seleccionada es correcta
        const opcionQuery = `
            SELECT es_correcta FROM respuestas_opciones WHERE id_opcion = ?
        `;
        const [opciones] = await pool.query(opcionQuery, [respuesta.id_opcion]);
        
        if (!opciones || opciones.length === 0) {
            return false;
        }

        const esCorrecta = opciones[0].es_correcta;
        const puntajeObtenido = esCorrecta ? respuesta.puntaje : 0;

        // Actualizar el puntaje en la respuesta
        const updateQuery = `
            UPDATE respuestas_alumnos 
            SET puntaje_obtenido = ?
            WHERE id_respuesta = ?
        `;
        const [result] = await pool.query(updateQuery, [puntajeObtenido, id_respuesta]);
        return result.affectedRows > 0;
    }
}

export default RespuestaAlumnoModel;
