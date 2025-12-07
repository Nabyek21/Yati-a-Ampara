import { pool } from '../config/database.js';

class ActividadRespuestaModel {
    // Crear una nueva respuesta a actividad
    static async create(respuestaData) {
        const { id_actividad, id_matricula, respuesta_texto, archivo, puntaje_obtenido, retroalimentacion, id_estado } = respuestaData;
        
        const query = `
            INSERT INTO actividades_respuestas 
            (id_actividad, id_matricula, respuesta_texto, archivo, puntaje_obtenido, retroalimentacion, id_estado) 
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        
        try {
            const [result] = await pool.query(query, [
                id_actividad, 
                id_matricula, 
                respuesta_texto, 
                archivo, 
                puntaje_obtenido, 
                retroalimentacion, 
                id_estado || 1 // Estado por defecto: 1 (entregado)
            ]);
            return result.insertId;
        } catch (error) {
            console.error('Error al crear respuesta de actividad:', error);
            throw error;
        }
    }

    // Obtener respuesta por ID
    static async getById(id_respuesta) {
        const query = 'SELECT * FROM actividades_respuestas WHERE id_respuesta = ?';
        const [rows] = await pool.query(query, [id_respuesta]);
        return rows[0];
    }

    // Obtener respuestas por actividad
    static async getByActividad(id_actividad) {
        const query = `
            SELECT ar.*, u.nombre, u.apellido, u.email 
            FROM actividades_respuestas ar
            JOIN usuarios u ON ar.id_usuario = u.id_usuario
            WHERE ar.id_actividad = ?
        `;
        const [rows] = await pool.query(query, [id_actividad]);
        return rows;
    }

    // Obtener respuestas por usuario
    static async getByUsuario(id_usuario) {
        const query = `
            SELECT ar.*, a.titulo as titulo_actividad
            FROM actividades_respuestas ar
            JOIN actividades a ON ar.id_actividad = a.id_actividad
            WHERE ar.id_usuario = ?
            ORDER BY ar.fecha_entrega DESC
        `;
        const [rows] = await pool.query(query, [id_usuario]);
        return rows;
    }

    // Actualizar respuesta
    static async update(id_respuesta, updateData) {
        const { respuesta_texto, archivo, puntaje_obtenido, retroalimentacion, id_estado } = updateData;
        
        const query = `
            UPDATE actividades_respuestas 
            SET 
                respuesta_texto = COALESCE(?, respuesta_texto),
                archivo = COALESCE(?, archivo),
                puntaje_obtenido = COALESCE(?, puntaje_obtenido),
                retroalimentacion = COALESCE(?, retroalimentacion),
                id_estado = COALESCE(?, id_estado)
            WHERE id_respuesta = ?
        `;
        
        try {
            const [result] = await pool.query(query, [
                respuesta_texto,
                archivo,
                puntaje_obtenido,
                retroalimentacion,
                id_estado,
                id_respuesta
            ]);
            return result.affectedRows > 0;
        } catch (error) {
            console.error('Error al actualizar respuesta de actividad:', error);
            throw error;
        }
    }

    // Eliminar respuesta
    static async delete(id_respuesta) {
        const query = 'DELETE FROM actividades_respuestas WHERE id_respuesta = ?';
        const [result] = await pool.query(query, [id_respuesta]);
        return result.affectedRows > 0;
    }

    // Calificar respuesta
    static async calificar(id_respuesta, { puntaje_obtenido, retroalimentacion }) {
        const query = `
            UPDATE actividades_respuestas 
            SET 
                puntaje_obtenido = ?,
                retroalimentacion = ?,
                id_estado = 2 -- Estado: Calificado
            WHERE id_respuesta = ?
        `;
        
        const [result] = await pool.query(query, [puntaje_obtenido, retroalimentacion, id_respuesta]);
        return result.affectedRows > 0;
    }

    // Verificar si un usuario ya respondió una actividad
    static async usuarioYaRespondio(id_actividad, id_usuario) {
        const query = 'SELECT id_respuesta FROM actividades_respuestas WHERE id_actividad = ? AND id_usuario = ?';
        const [rows] = await pool.query(query, [id_actividad, id_usuario]);
        return rows.length > 0 ? rows[0].id_respuesta : null;
    }
}

export default ActividadRespuestaModel;
