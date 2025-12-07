import { UsuarioModel } from "../models/UsuarioModel.js";
import { DocenteModel } from "../models/DocenteModel.js";

export const createDocente = async (req, res) => {
  try {
    const {
      dni,
      nombres,
      apellidos,
      celular,
      correo,
      contrasena,
      id_especialidad // Cambiado de 'especialidad'
    } = req.body;

    // 1. Crear el usuario (con rol de docente = 2)
    const newUserResult = await UsuarioModel.create({
      dni,
      nombres,
      apellidos,
      celular,
      correo,
      contrasena,
      id_rol: 2 // Rol de Docente
    });

    if (!newUserResult || !newUserResult.insertId) {
      return res.status(500).json({ message: "Error al crear el usuario docente" });
    }

    const newUserId = newUserResult.insertId;

    // 2. Crear el perfil de docente
    await DocenteModel.create(newUserId, id_especialidad);

    res.status(201).json({ message: "Docente creado correctamente", id_usuario: newUserId });

  } catch (err) {
    console.error("ERROR creando docente:", err);
    console.error("Detalles del error:", err.message, err.code);
    res.status(500).json({ 
      message: "Error interno al crear docente",
      details: err.message 
    });
  }
};

export const getAllDocentes = async (req, res) => {
  try {
    const { search, id_estado, id_perfil } = req.query;
    const filters = {
      search: search || null,
      id_estado: id_estado ? parseInt(id_estado) : null,
      id_perfil: id_perfil ? parseInt(id_perfil) : null,
    };

    const docentes = await DocenteModel.getAll(filters);
    
    // Si se especifica un id_perfil, devolver solo ese docente
    if (id_perfil) {
      const docente = docentes.find(d => d.id_docente_perfil === parseInt(id_perfil));
      return res.json(docente ? [docente] : []);
    }
    
    res.json(docentes);
  } catch (err) {
    console.error("ERROR obteniendo docentes:", err);
    res.status(500).json({ message: "Error interno al obtener docentes" });
  }
};

export const updateDocente = async (req, res) => {
  try {
    const { id_docente_perfil } = req.params;
    const { id_especialidad, ...userDataToUpdate } = req.body; // Cambiado de 'especialidad'

    // 1. Actualizar id_especialidad del docente (si se proporciona)
    if (id_especialidad !== undefined) {
      await DocenteModel.update(parseInt(id_docente_perfil), { id_especialidad: parseInt(id_especialidad) });
    }

    // 2. Obtener el id_usuario asociado para actualizar los datos de usuario (si se proporcionan)
    const docenteProfile = await DocenteModel.findById(parseInt(id_docente_perfil));
    if (!docenteProfile) {
      return res.status(404).json({ message: "Perfil de docente no encontrado" });
    }

    if (Object.keys(userDataToUpdate).length > 0) {
      await UsuarioModel.update(docenteProfile.id_usuario, userDataToUpdate);
    }

    res.json({ message: "Docente actualizado correctamente" });

  } catch (err) {
    console.error("ERROR actualizando docente:", err);
    res.status(500).json({ message: "Error interno al actualizar docente" });
  }
};

export const deactivateDocente = async (req, res) => {
  try {
    const { id_docente_perfil } = req.params;

    // 1. Obtener el id_usuario asociado al perfil de docente
    const docenteProfile = await DocenteModel.findById(parseInt(id_docente_perfil));
    if (!docenteProfile) {
      return res.status(404).json({ message: "Perfil de docente no encontrado" });
    }

    // 2. Desactivar el usuario asociado
    await UsuarioModel.deactivate(docenteProfile.id_usuario);

    res.json({ message: "Docente desactivado correctamente" });

  } catch (err) {
    console.error("ERROR desactivando docente:", err);
    res.status(500).json({ message: "Error interno al desactivar docente" });
  }
};
