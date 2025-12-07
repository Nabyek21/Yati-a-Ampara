import { ModuloContenidoModel } from "../models/ModuloContenidoModel.js";

export const getContenidoByModulo = async (req, res) => {
  try {
    const { id_modulo } = req.params;
    const { id_seccion } = req.query;
    
    if (!id_modulo) {
      return res.status(400).json({ message: "Se requiere id_modulo" });
    }

    const contenido = await ModuloContenidoModel.getByModulo(
      parseInt(id_modulo),
      id_seccion ? parseInt(id_seccion) : null
    );
    res.json(contenido);
  } catch (err) {
    console.error("ERROR obteniendo contenido:", err);
    res.status(500).json({ message: "Error interno al obtener contenido" });
  }
};

export const getContenidoBySeccion = async (req, res) => {
  try {
    const { id_seccion } = req.params;
    
    if (!id_seccion) {
      return res.status(400).json({ message: "Se requiere id_seccion" });
    }

    const contenido = await ModuloContenidoModel.getBySeccion(parseInt(id_seccion));
    res.json(contenido);
  } catch (err) {
    console.error("ERROR obteniendo contenido:", err);
    res.status(500).json({ message: "Error interno al obtener contenido" });
  }
};

export const getContenidoById = async (req, res) => {
  try {
    const { id_contenido } = req.params;
    
    if (!id_contenido) {
      return res.status(400).json({ message: "Se requiere id_contenido" });
    }

    const contenido = await ModuloContenidoModel.findById(parseInt(id_contenido));
    
    if (!contenido) {
      return res.status(404).json({ message: "Contenido no encontrado" });
    }
    
    res.json(contenido);
  } catch (err) {
    console.error("ERROR obteniendo contenido:", err);
    res.status(500).json({ message: "Error interno al obtener contenido" });
  }
};

export const createContenido = async (req, res) => {
  try {
    // Manejar tanto JSON como FormData
    let { id_modulo, id_seccion, tipo, titulo, descripcion, url_contenido, archivo, orden, id_estado } = req.body;
    
    console.log("=== CREATE CONTENIDO ===");
    console.log("Body:", req.body);
    
    // Si viene como string (desde FormData), parsear
    if (typeof id_modulo === 'string') {
      id_modulo = parseInt(id_modulo);
    }
    if (typeof id_seccion === 'string') {
      id_seccion = parseInt(id_seccion);
    }
    if (typeof orden === 'string') {
      orden = parseInt(orden) || 1;
    }
    
    // Procesar archivo
    let nombreArchivo = null;
    
    // Si archivo viene como string (nombre real del archivo)
    if (archivo && typeof archivo === 'string' && archivo !== 'null') {
      nombreArchivo = archivo;
      console.log("✅ Nombre de archivo recibido:", nombreArchivo);
    }
    
    if (!id_modulo || !id_seccion || !tipo || !titulo) {
      return res.status(400).json({ message: "Se requieren id_modulo, id_seccion, tipo y titulo" });
    }

    const result = await ModuloContenidoModel.create({
      id_modulo: parseInt(id_modulo),
      id_seccion: parseInt(id_seccion),
      tipo,
      titulo,
      descripcion: descripcion || null,
      url_contenido: url_contenido || null,
      archivo: nombreArchivo,
      orden: orden || 1,
      id_estado: id_estado || 1
    });

    console.log("✅ Contenido creado:", result);

    res.status(201).json({ 
      message: "Contenido creado correctamente", 
      id_contenido: result.insertId 
    });
  } catch (err) {
    console.error("ERROR creando contenido:", err);
    res.status(500).json({ message: "Error interno al crear contenido" });
  }
};

export const updateContenido = async (req, res) => {
  try {
    const { id_contenido } = req.params;
    let data = req.body;
    
    if (!id_contenido) {
      return res.status(400).json({ message: "Se requiere id_contenido" });
    }

    // Si viene como FormData, parsear valores que sean string
    if (data.id_modulo && typeof data.id_modulo === 'string') {
      data.id_modulo = parseInt(data.id_modulo);
    }
    if (data.id_seccion && typeof data.id_seccion === 'string') {
      data.id_seccion = parseInt(data.id_seccion);
    }
    if (data.orden && typeof data.orden === 'string') {
      data.orden = parseInt(data.orden);
    }

    // Si hay un archivo, guardar solo el nombre por ahora
    if (req.file) {
      data.archivo = req.file.filename;
    } else if (data.archivo === 'null' || data.archivo === null) {
      // No incluir 'archivo' en el update si es null
      delete data.archivo;
    } else if (typeof data.archivo === 'object' && Object.keys(data.archivo).length === 0) {
      // No incluir 'archivo' si es un objeto vacío {}
      delete data.archivo;
    }

    console.log(`Actualizando contenido ${id_contenido} con datos:`, data);
    await ModuloContenidoModel.update(parseInt(id_contenido), data);
    res.json({ message: "Contenido actualizado correctamente" });
  } catch (err) {
    console.error("ERROR actualizando contenido:", err);
    console.error("Detalles:", err.message, err.code);
    res.status(500).json({ 
      message: "Error interno al actualizar contenido",
      details: err.message 
    });
  }
};

export const deleteContenido = async (req, res) => {
  try {
    const { id_contenido } = req.params;
    
    if (!id_contenido) {
      return res.status(400).json({ message: "Se requiere id_contenido" });
    }

    await ModuloContenidoModel.delete(parseInt(id_contenido));
    res.json({ message: "Contenido eliminado correctamente" });
  } catch (err) {
    console.error("ERROR eliminando contenido:", err);
    res.status(500).json({ message: "Error interno al eliminar contenido" });
  }
};

