import { SeccionModel } from "../models/SeccionModel.js";

export const createSeccion = async (req, res) => {
  try {
    const newSeccion = await SeccionModel.create(req.body);
    res.status(201).json({ message: "Sección creada correctamente", id_seccion: newSeccion.insertId });
  } catch (err) {
    console.error("ERROR creando sección:", err);
    res.status(500).json({ message: "Error interno al crear sección" });
  }
};

export const getAllSecciones = async (req, res) => {
  try {
    const filters = req.query;
    const secciones = await SeccionModel.getAll(filters);
    res.json(secciones);
  } catch (err) {
    console.error("ERROR obteniendo secciones:", err);
    res.status(500).json({ message: "Error interno al obtener secciones" });
  }
};

export const getSeccionById = async (req, res) => {
  try {
    const { id_seccion } = req.params;
    const seccion = await SeccionModel.findById(parseInt(id_seccion));
    if (!seccion) {
      return res.status(404).json({ message: "Sección no encontrada" });
    }
    res.json(seccion);
  } catch (err) {
    console.error("ERROR obteniendo sección:", err);
    res.status(500).json({ message: "Error interno al obtener sección" });
  }
};

export const updateSeccion = async (req, res) => {
  try {
    const { id_seccion } = req.params;
    const updated = await SeccionModel.update(parseInt(id_seccion), req.body);
    if (updated.affectedRows === 0) {
      return res.status(404).json({ message: "Sección no encontrada o sin cambios" });
    }
    res.json({ message: "Sección actualizada correctamente" });
  } catch (err) {
    console.error("ERROR actualizando sección:", err);
    res.status(500).json({ message: "Error interno al actualizar sección" });
  }
};

export const deactivateSeccion = async (req, res) => {
  try {
    const { id_seccion } = req.params;
    const deactivated = await SeccionModel.deactivate(parseInt(id_seccion));
    if (deactivated.affectedRows === 0) {
      return res.status(404).json({ message: "Sección no encontrada o ya inactiva" });
    }
    res.json({ message: "Sección desactivada correctamente" });
  } catch (err) {
    console.error("ERROR desactivando sección:", err);
    res.status(500).json({ message: "Error interno al desactivar sección" });
  }
};

export const getSeccionesDocente = async (req, res) => {
  try {
    console.log('=== DEBUG getSeccionesDocente ===');
    console.log('req.user:', req.user);
    console.log('req.headers.authorization:', req.headers.authorization?.substring(0, 30) + '...');
    
    const id_usuario = req.user?.id_usuario;
    
    if (!id_usuario) {
      console.error('No hay id_usuario en req.user');
      return res.status(401).json({ message: "Usuario no autenticado", debug: { user: req.user } });
    }
    
    console.log('Buscando secciones para usuario:', id_usuario);
    const secciones = await SeccionModel.getSeccionesByDocente(id_usuario);
    console.log('Secciones encontradas:', secciones.length);
    res.json(secciones);
  } catch (err) {
    console.error("ERROR obteniendo secciones del docente:", err.message);
    console.error("Stack:", err.stack);
    res.status(500).json({ 
      message: "Error interno al obtener secciones", 
      error: err.message,
      details: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
};
