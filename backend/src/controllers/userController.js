import { UsuarioModel } from "../models/UsuarioModel.js";

export const getAllUsers = async (req, res) => {
  try {
    const { rol, search, id_estado, id_curso } = req.query;

    const filters = {
      rol: rol ? parseInt(rol) : null,
      search: search || null,
      id_estado: id_estado ? parseInt(id_estado) : null,
      id_curso: id_curso ? parseInt(id_curso) : null,
    };

    // Solo queremos listar usuarias (rol 3) en esta vista, si no se especifica un rol diferente
    if (!filters.rol) {
      filters.rol = 3;
    }

    const users = await UsuarioModel.getAll(filters);
    res.json(users);
  } catch (err) {
    console.error("ERROR obteniendo usuarios:", err);
    res.status(500).json({ message: "Error interno al obtener usuarios" });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { id_usuario } = req.params; // Obtener id_usuario de los parámetros de la ruta
    const dataToUpdate = req.body; // Datos para la actualización parcial

    const result = await UsuarioModel.update(parseInt(id_usuario), dataToUpdate);

    if (result && result.affectedRows > 0) {
      res.json({ message: "Usuario actualizado correctamente" });
    } else {
      res.status(404).json({ message: "Usuario no encontrado o no hay cambios" });
    }
  } catch (err) {
    console.error("ERROR actualizando usuario:", err);
    res.status(500).json({ message: "Error interno al actualizar usuario" });
  }
};

export const deactivateUser = async (req, res) => {
  try {
    const { id_usuario } = req.params;

    const result = await UsuarioModel.deactivate(parseInt(id_usuario));

    if (result && result.affectedRows > 0) {
      res.json({ message: "Usuario desactivado correctamente" });
    } else {
      res.status(404).json({ message: "Usuario no encontrado" });
    }
  } catch (err) {
    console.error("ERROR desactivando usuario:", err);
    res.status(500).json({ message: "Error interno al desactivar usuario" });
  }
};
