import RespuestaAlumno from '../models/RespuestaAlumnoModel.js';
import { pool } from '../config/database.js';

class RespuestaAlumnoController {
    // Enviar respuesta a una pregunta (o múltiples respuestas para examen)
    static async enviarRespuesta(req, res) {
        try {
            const { id_actividad, id_usuario, respuestas, respuesta_texto } = req.body;
            let id_matricula = req.body.id_matricula;

            // Si se proporciona id_usuario en lugar de id_matricula, obtener la matrícula
            if (!id_matricula && id_usuario) {
                const [matriculas] = await pool.query(
                    `SELECT id_matricula FROM matriculas WHERE id_usuario = ? LIMIT 1`,
                    [id_usuario]
                );
                
                if (!matriculas || matriculas.length === 0) {
                    return res.status(400).json({
                        success: false,
                        message: 'No se encontró matrícula para este usuario'
                    });
                }
                id_matricula = matriculas[0].id_matricula;
            }

            if (!id_matricula) {
                return res.status(400).json({
                    success: false,
                    message: 'Se requiere id_matricula o id_usuario'
                });
            }

            // Caso 1: Múltiples respuestas (examen con preguntas)
            if (respuestas && Array.isArray(respuestas) && respuestas.length > 0) {
                for (const respuesta of respuestas) {
                    const { id_pregunta, tipo, id_opcion, texto } = respuesta;

                    if (!id_pregunta) {
                        return res.status(400).json({
                            success: false,
                            message: 'Cada respuesta debe incluir id_pregunta'
                        });
                    }

                    // Preparar datos según el tipo
                    let respuestaData = {
                        id_actividad,
                        id_pregunta,
                        id_matricula,
                        respuesta_texto: null,
                        id_opcion: null,
                        puntaje_obtenido: null
                    };

                    if (tipo === 'opcion' && id_opcion) {
                        respuestaData.id_opcion = id_opcion;
                        
                        // Para preguntas de opción múltiple, calcular automáticamente el puntaje
                        const [opciones] = await pool.query(
                            'SELECT es_correcta FROM respuestas_opciones WHERE id_opcion = ?',
                            [id_opcion]
                        );
                        
                        if (opciones && opciones.length > 0) {
                            const esCorrecta = opciones[0].es_correcta;
                            
                            // Obtener el puntaje de la pregunta
                            const [preguntas] = await pool.query(
                                'SELECT puntaje FROM preguntas WHERE id_pregunta = ?',
                                [id_pregunta]
                            );
                            
                            if (preguntas && preguntas.length > 0) {
                                respuestaData.puntaje_obtenido = esCorrecta ? preguntas[0].puntaje : 0;
                            }
                        }
                    } else if (tipo === 'texto' && texto) {
                        respuestaData.respuesta_texto = texto;
                        respuestaData.puntaje_obtenido = null;
                    } else {
                        continue;
                    }

                    // Verificar si ya existe respuesta
                    const respuestaExistente = await RespuestaAlumno.matriculaYaRespondioPregunta(
                        id_actividad,
                        id_pregunta,
                        id_matricula
                    );

                    if (respuestaExistente) {
                        await RespuestaAlumno.update(respuestaExistente, {
                            respuesta_texto: respuestaData.respuesta_texto,
                            id_opcion: respuestaData.id_opcion,
                            puntaje_obtenido: respuestaData.puntaje_obtenido
                        });
                    } else {
                        await RespuestaAlumno.create(respuestaData);
                    }
                }

                return res.json({
                    success: true,
                    message: 'Respuestas guardadas correctamente'
                });
            }

            // Caso 2: Respuesta única de texto (tarea)
            if (respuesta_texto) {
                const respuestaData = {
                    id_actividad,
                    id_matricula,
                    respuesta_texto
                };

                await RespuestaAlumno.create(respuestaData);

                return res.json({
                    success: true,
                    message: 'Respuesta guardada correctamente'
                });
            }

            return res.status(400).json({
                success: false,
                message: 'Debe proporcionar respuestas o respuesta_texto'
            });
            
        } catch (error) {
            console.error('Error al guardar respuesta:', error);
            res.status(500).json({
                success: false,
                message: 'Error al procesar la respuesta',
                error: error.message
            });
        }
    }

    // Obtener respuestas de una matrícula a una actividad
    static async getRespuestasPorActividad(req, res) {
        try {
            const { id_actividad, id_matricula } = req.params;

            if (!id_matricula) {
                return res.status(400).json({
                    success: false,
                    message: 'Se requiere id_matricula'
                });
            }

            const respuestas = await RespuestaAlumno.getByActividadYMatricula(id_actividad, id_matricula);
            
            res.json({
                success: true,
                data: respuestas
            });
            
        } catch (error) {
            console.error('Error al obtener respuestas:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener las respuestas',
                error: error.message
            });
        }
    }

    // Obtener calificación total de una actividad
    static async getCalificacionActividad(req, res) {
        try {
            const { id_actividad, id_matricula } = req.params;

            if (!id_actividad || !id_matricula) {
                return res.status(400).json({
                    success: false,
                    message: 'Se requieren id_actividad e id_matricula'
                });
            }

            const calificacion = await RespuestaAlumno.getCalificacionActividad(id_actividad, id_matricula);
            
            res.json({
                success: true,
                data: calificacion
            });
            
        } catch (error) {
            console.error('Error al obtener calificación:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener la calificación',
                error: error.message
            });
        }
    }

    // Calificar pregunta de opción múltiple automáticamente
    static async calificarPregunta(req, res) {
        try {
            const { id_respuesta } = req.params;

            if (!id_respuesta) {
                return res.status(400).json({
                    success: false,
                    message: 'Se requiere id_respuesta'
                });
            }

            const resultado = await RespuestaAlumno.calificarPreguntaOpcion(id_respuesta);
            
            if (resultado) {
                res.json({
                    success: true,
                    message: 'Pregunta calificada correctamente'
                });
            } else {
                res.status(400).json({
                    success: false,
                    message: 'No se pudo calificar la pregunta'
                });
            }
            
        } catch (error) {
            console.error('Error al calificar pregunta:', error);
            res.status(500).json({
                success: false,
                message: 'Error al calificar la pregunta',
                error: error.message
            });
        }
    }

    // Obtener estadísticas de respuestas (para docentes)
    static async getEstadisticasPregunta(req, res) {
        try {
            const { id_pregunta } = req.params;
            
            const estadisticas = await RespuestaAlumno.getEstadisticasPregunta(id_pregunta);
            
            res.json({
                success: true,
                data: estadisticas
            });
            
        } catch (error) {
            console.error('Error al obtener estadísticas:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener las estadísticas',
                error: error.message
            });
        }
    }

    // Obtener todas las respuestas a una pregunta (para docentes)
    static async getRespuestasPorPregunta(req, res) {
        try {
            const { id_pregunta } = req.params;
            
            const respuestas = await RespuestaAlumno.getByPregunta(id_pregunta);
            
            res.json({
                success: true,
                data: respuestas
            });
            
        } catch (error) {
            console.error('Error al obtener respuestas:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener las respuestas',
                error: error.message
            });
        }
    }

    // Eliminar respuesta (para administradores o el mismo usuario)
    static async eliminarRespuesta(req, res) {
        try {
            const { id } = req.params;
            const id_usuario = req.user.id;
            
            const eliminado = await RespuestaAlumno.delete(id);
            
            if (eliminado) {
                res.json({
                    success: true,
                    message: 'Respuesta eliminada correctamente'
                });
            } else {
                res.status(404).json({
                    success: false,
                    message: 'No se encontró la respuesta especificada'
                });
            }
            
        } catch (error) {
            console.error('Error al eliminar respuesta:', error);
            res.status(500).json({
                success: false,
                message: 'Error al eliminar la respuesta',
                error: error.message
            });
        }
    }

    // Actualizar respuesta (calificar manualmente - para docentes)
    static async actualizarRespuesta(req, res) {
        try {
            const { id_respuesta } = req.params;
            const { puntaje_obtenido } = req.body;

            if (!id_respuesta) {
                return res.status(400).json({
                    success: false,
                    message: 'Se requiere id_respuesta'
                });
            }

            if (puntaje_obtenido === undefined) {
                return res.status(400).json({
                    success: false,
                    message: 'Se requiere puntaje_obtenido'
                });
            }

            // Obtener datos de la respuesta
            const [respuestas] = await pool.query(
                'SELECT id_actividad, id_matricula FROM respuestas_alumnos WHERE id_respuesta = ?',
                [id_respuesta]
            );

            if (!respuestas || respuestas.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Respuesta no encontrada'
                });
            }

            const { id_actividad, id_matricula } = respuestas[0];

            // Actualizar el puntaje en respuestas_alumnos
            await RespuestaAlumno.update(id_respuesta, {
                puntaje_obtenido
            });

            // Recalcular calificación total de la actividad
            const calificacion = await RespuestaAlumno.getCalificacionActividad(id_actividad, id_matricula);

            res.json({
                success: true,
                message: 'Respuesta actualizada correctamente',
                data: {
                    id_respuesta,
                    puntaje_obtenido,
                    calificacion
                }
            });

        } catch (error) {
            console.error('Error al actualizar respuesta:', error);
            res.status(500).json({
                success: false,
                message: 'Error al actualizar la respuesta',
                error: error.message
            });
        }
    }

    // Calificar actividad completa (docente)
    static async calificarActividad(req, res) {
        try {
            const { id_actividad, id_matricula, puntaje_obtenido } = req.body;

            if (!id_actividad || !id_matricula || puntaje_obtenido === undefined) {
                return res.status(400).json({
                    success: false,
                    message: 'Se requieren id_actividad, id_matricula y puntaje_obtenido'
                });
            }

            // Validar que el puntaje sea numérico y positivo
            if (isNaN(puntaje_obtenido) || puntaje_obtenido < 0) {
                return res.status(400).json({
                    success: false,
                    message: 'El puntaje debe ser un número positivo'
                });
            }

            // Obtener todas las respuestas de esta actividad para esta matrícula
            const respuestas = await RespuestaAlumno.getByActividadYMatricula(id_actividad, id_matricula);

            if (!respuestas || respuestas.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'No hay respuestas para esta actividad'
                });
            }

            // Actualizar todas las respuestas con el nuevo puntaje
            let actualizadas = 0;
            for (const respuesta of respuestas) {
                const actualizado = await RespuestaAlumno.update(respuesta.id_respuesta, {
                    puntaje_obtenido: puntaje_obtenido
                });
                if (actualizado) actualizadas++;
            }

            // Obtener la calificación actualizada
            const calificacion = await RespuestaAlumno.getCalificacionActividad(id_actividad, id_matricula);

            console.log(`✅ Actividad ${id_actividad} calificada para matrícula ${id_matricula}. Puntaje: ${puntaje_obtenido}`);

            res.json({
                success: true,
                message: `Actividad calificada correctamente (${actualizadas} respuestas actualizadas)`,
                calificacion: calificacion
            });

        } catch (error) {
            console.error('Error al calificar actividad:', error);
            res.status(500).json({
                success: false,
                message: 'Error al calificar actividad',
                error: error.message
            });
        }
    }
}

export default RespuestaAlumnoController;
