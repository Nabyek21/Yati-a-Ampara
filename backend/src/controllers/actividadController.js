import { ActividadModel } from "../models/ActividadModel.js";
import { pool } from "../config/database.js";

export const createActividad = async (req, res) => {
  try {
    const {
      id_modulo,
      id_seccion,
      id_docente_perfil,
      titulo,
      tipo,
      descripcion,
      fecha_entrega,
      puntaje_max,
      id_estado
    } = req.body;

    if (!id_modulo || !id_seccion || !id_docente_perfil || !titulo || !tipo) {
      return res.status(400).json({ 
        message: "Se requieren id_modulo, id_seccion, id_docente_perfil, titulo y tipo" 
      });
    }

    // Validar que el tipo sea uno de los valores permitidos
    const tiposPermitidos = ['pc', 'tarea', 'examen', 'quiz', 'evaluacion', 'trabajo'];
    if (!tiposPermitidos.includes(tipo.toLowerCase())) {
      return res.status(400).json({ 
        message: `El tipo debe ser uno de: ${tiposPermitidos.join(', ')}` 
      });
    }

    const result = await ActividadModel.create({
      id_modulo: parseInt(id_modulo),
      id_seccion: parseInt(id_seccion),
      id_docente_perfil: parseInt(id_docente_perfil),
      titulo,
      tipo,
      descripcion: descripcion || null,
      fecha_entrega: fecha_entrega || null,
      puntaje_max: puntaje_max ? parseInt(puntaje_max) : 20,
      id_estado: id_estado ? parseInt(id_estado) : 1
    });

    res.status(201).json({ 
      message: "Actividad creada correctamente", 
      id_actividad: result.insertId 
    });
  } catch (err) {
    console.error("ERROR creando actividad:", err);
    res.status(500).json({ message: "Error interno al crear actividad" });
  }
};

export const getAllActividades = async (req, res) => {
  try {
    const filters = req.query;
    console.log("📍 getAllActividades - Query params recibidos:", filters);
    const actividades = await ActividadModel.getAll(filters);
    console.log(`📍 getAllActividades - Retornando ${actividades.length} actividades para filtros:`, filters);
    res.json(actividades);
  } catch (err) {
    console.error("ERROR obteniendo actividades:", err);
    res.status(500).json({ message: "Error interno al obtener actividades" });
  }
};

export const getActividadById = async (req, res) => {
  try {
    const { id_actividad } = req.params;
    const actividad = await ActividadModel.findById(parseInt(id_actividad));
    if (!actividad) {
      return res.status(404).json({ message: "Actividad no encontrada" });
    }
    res.json(actividad);
  } catch (err) {
    console.error("ERROR obteniendo actividad:", err);
    res.status(500).json({ message: "Error interno al obtener actividad" });
  }
};

export const updateActividad = async (req, res) => {
  try {
    const { id_actividad } = req.params;
    const data = req.body;

    // Si se está actualizando el tipo, validarlo
    if (data.tipo) {
      const tiposPermitidos = ['pc', 'tarea', 'examen', 'quiz', 'evaluacion', 'trabajo'];
      if (!tiposPermitidos.includes(data.tipo.toLowerCase())) {
        return res.status(400).json({ 
          message: `El tipo debe ser uno de: ${tiposPermitidos.join(', ')}` 
        });
      }
    }

    // Convertir campos numéricos si están presentes
    if (data.id_modulo) data.id_modulo = parseInt(data.id_modulo);
    if (data.id_seccion) data.id_seccion = parseInt(data.id_seccion);
    if (data.id_docente_perfil) data.id_docente_perfil = parseInt(data.id_docente_perfil);
    if (data.puntaje_max) data.puntaje_max = parseInt(data.puntaje_max);
    if (data.id_estado) data.id_estado = parseInt(data.id_estado);

    const updated = await ActividadModel.update(parseInt(id_actividad), data);
    if (updated.affectedRows === 0) {
      return res.status(404).json({ message: "Actividad no encontrada o sin cambios" });
    }
    res.json({ message: "Actividad actualizada correctamente" });
  } catch (err) {
    console.error("ERROR actualizando actividad:", err);
    res.status(500).json({ message: "Error interno al actualizar actividad" });
  }
};

export const deleteActividad = async (req, res) => {
  try {
    const { id_actividad } = req.params;
    const deleted = await ActividadModel.delete(parseInt(id_actividad));
    if (deleted.affectedRows === 0) {
      return res.status(404).json({ message: "Actividad no encontrada" });
    }
    res.json({ 
      message: "Actividad eliminada correctamente",
      deleted: deleted.affectedRows
    });
  } catch (err) {
    console.error("ERROR eliminando actividad:", err);
    res.status(500).json({ 
      message: "Error interno al eliminar actividad",
      details: err.message 
    });
  }
};

// Endpoint para obtener el contenido relacionado de una actividad
export const getTareasPendientes = async (req, res) => {
  try {
    const id_usuario = req.user?.id_usuario;
    if (!id_usuario) {
      return res.status(400).json({ message: 'Se requiere autenticación' });
    }
    const [rows] = await pool.query(`
      SELECT COUNT(*) as total
      FROM actividades a
      JOIN matriculas m ON a.id_seccion = m.id_seccion
      LEFT JOIN notas n ON a.id_actividad = n.id_actividad AND m.id_matricula = n.id_matricula
      WHERE m.id_usuario = ? AND n.id_nota IS NULL AND a.fecha_entrega >= CURDATE()
    `, [id_usuario]);
    res.json(rows[0]?.total || 0);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener tareas pendientes', error: error.message });
  }
};

export const getProximaEntrega = async (req, res) => {
  try {
    const id_usuario = req.user?.id_usuario;
    if (!id_usuario) {
      return res.status(400).json({ message: 'Se requiere autenticación' });
    }
    const [rows] = await pool.query(`
      SELECT MIN(a.fecha_entrega) as proxima_entrega
      FROM actividades a
      JOIN matriculas m ON a.id_seccion = m.id_seccion
      LEFT JOIN notas n ON a.id_actividad = n.id_actividad AND m.id_matricula = n.id_matricula
      WHERE m.id_usuario = ? AND n.id_nota IS NULL AND a.fecha_entrega >= CURDATE()
    `, [id_usuario]);
    res.json(rows[0]?.proxima_entrega || '-');
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener próxima entrega', error: error.message });
  }
};

export const getContenidoRelacionado = async (req, res) => {
  try {
    const { id_actividad } = req.params;
    const actividad = await ActividadModel.findById(parseInt(id_actividad));
    
    if (!actividad) {
      return res.status(404).json({ message: "Actividad no encontrada" });
    }

    const contenido = await ActividadModel.getContenidoRelacionado(
      actividad.id_modulo,
      actividad.id_seccion
    );

    res.json(contenido);
  } catch (err) {
    console.error("ERROR obteniendo contenido relacionado:", err);
    res.status(500).json({ message: "Error interno al obtener contenido relacionado" });
  }
};

