import { ModuloModel } from "../models/ModuloModel.js";

export const getModulosByCurso = async (req, res) => {
  try {
    const { id_curso } = req.params;
    
    if (!id_curso) {
      return res.status(400).json({ message: "Se requiere id_curso" });
    }

    const modulos = await ModuloModel.getByCurso(parseInt(id_curso));
    res.json(modulos);
  } catch (err) {
    console.error("ERROR obteniendo módulos:", err);
    res.status(500).json({ message: "Error interno al obtener módulos" });
  }
};

export const getModulosBySeccion = async (req, res) => {
  try {
    const { id_seccion } = req.params;
    
    if (!id_seccion) {
      return res.status(400).json({ message: "Se requiere id_seccion" });
    }

    const modulos = await ModuloModel.getBySeccion(parseInt(id_seccion));
    res.json(modulos);
  } catch (err) {
    console.error("ERROR obteniendo módulos por sección:", err);
    res.status(500).json({ message: "Error interno al obtener módulos" });
  }
};

