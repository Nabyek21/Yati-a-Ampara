import courseService from '../services/CourseService.js';

export const getAllCourses = (req, res, next) => {
  try {
    const courses = courseService.getAllCourses();
    res.json({
      success: true,
      data: courses
    });
  } catch (error) {
    next(error);
  }
};

export const getCourse = (req, res, next) => {
  try {
    const { id } = req.params;
    const course = courseService.getCourseById(id);
    res.json({
      success: true,
      data: course
    });
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
};

export const createCourse = (req, res, next) => {
  try {
    const { nombre, descripcion, creditos, docente_id } = req.body;
    const course = courseService.createCourse({
      nombre,
      descripcion,
      creditos,
      docente_id
    });
    res.status(201).json({
      success: true,
      message: 'Curso creado exitosamente',
      data: course
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const updateCourse = (req, res, next) => {
  try {
    const { id } = req.params;
    const course = courseService.updateCourse(id, req.body);
    res.json({
      success: true,
      message: 'Curso actualizado exitosamente',
      data: course
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const deleteCourse = (req, res, next) => {
  try {
    const { id } = req.params;
    courseService.deleteCourse(id);
    res.json({
      success: true,
      message: 'Curso eliminado exitosamente'
    });
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
};

export const getDocenteCourses = (req, res, next) => {
  try {
    const { docenteId } = req.params;
    const courses = courseService.getCoursesByDocente(docenteId);
    res.json({
      success: true,
      data: courses
    });
  } catch (error) {
    next(error);
  }
};

export const getActiveCourses = (req, res, next) => {
  try {
    const courses = courseService.getActiveCourses();
    res.json({
      success: true,
      data: courses
    });
  } catch (error) {
    next(error);
  }
};
