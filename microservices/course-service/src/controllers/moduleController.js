import moduleService from '../services/ModuleService.js';

export const getAllModules = (req, res, next) => {
  try {
    const modules = moduleService.getAllModules();
    res.json({
      success: true,
      data: modules
    });
  } catch (error) {
    next(error);
  }
};

export const getModule = (req, res, next) => {
  try {
    const { id } = req.params;
    const module = moduleService.getModuleById(id);
    res.json({
      success: true,
      data: module
    });
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
};

export const getModulesByCourse = (req, res, next) => {
  try {
    const { courseId } = req.params;
    const modules = moduleService.getModulesByCourse(courseId);
    res.json({
      success: true,
      data: modules
    });
  } catch (error) {
    next(error);
  }
};

export const createModule = (req, res, next) => {
  try {
    const { course_id, nombre, orden } = req.body;
    const module = moduleService.createModule({
      course_id,
      nombre,
      orden
    });
    res.status(201).json({
      success: true,
      message: 'Módulo creado exitosamente',
      data: module
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const updateModule = (req, res, next) => {
  try {
    const { id } = req.params;
    const module = moduleService.updateModule(id, req.body);
    res.json({
      success: true,
      message: 'Módulo actualizado exitosamente',
      data: module
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const deleteModule = (req, res, next) => {
  try {
    const { id } = req.params;
    moduleService.deleteModule(id);
    res.json({
      success: true,
      message: 'Módulo eliminado exitosamente'
    });
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
};

export const reorderModules = (req, res, next) => {
  try {
    const { courseId } = req.params;
    const { moduleIds } = req.body;
    const modules = moduleService.reorderModules(courseId, moduleIds);
    res.json({
      success: true,
      message: 'Módulos reordenados exitosamente',
      data: modules
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
