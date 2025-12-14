import contentService from '../services/ContentService.js';

export const getAllContents = (req, res, next) => {
  try {
    const contents = contentService.getAllContents();
    res.json({
      success: true,
      data: contents
    });
  } catch (error) {
    next(error);
  }
};

export const getContent = (req, res, next) => {
  try {
    const { id } = req.params;
    const content = contentService.getContentById(id);
    res.json({
      success: true,
      data: content
    });
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
};

export const getContentsByModule = (req, res, next) => {
  try {
    const { moduleId } = req.params;
    const contents = contentService.getContentsByModule(moduleId);
    res.json({
      success: true,
      data: contents
    });
  } catch (error) {
    next(error);
  }
};

export const createContent = (req, res, next) => {
  try {
    const { module_id, titulo, tipo, url, descripcion, orden } = req.body;
    const content = contentService.createContent({
      module_id,
      titulo,
      tipo,
      url,
      descripcion,
      orden
    });
    res.status(201).json({
      success: true,
      message: 'Contenido creado exitosamente',
      data: content
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const updateContent = (req, res, next) => {
  try {
    const { id } = req.params;
    const content = contentService.updateContent(id, req.body);
    res.json({
      success: true,
      message: 'Contenido actualizado exitosamente',
      data: content
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const deleteContent = (req, res, next) => {
  try {
    const { id } = req.params;
    contentService.deleteContent(id);
    res.json({
      success: true,
      message: 'Contenido eliminado exitosamente'
    });
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
};

export const getContentsByType = (req, res, next) => {
  try {
    const { tipo } = req.params;
    const contents = contentService.getContentsByType(tipo);
    res.json({
      success: true,
      data: contents
    });
  } catch (error) {
    next(error);
  }
};

export const reorderContents = (req, res, next) => {
  try {
    const { moduleId } = req.params;
    const { contentIds } = req.body;
    const contents = contentService.reorderContents(moduleId, contentIds);
    res.json({
      success: true,
      message: 'Contenidos reordenados exitosamente',
      data: contents
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
