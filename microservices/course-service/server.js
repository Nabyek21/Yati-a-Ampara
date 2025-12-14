/**
 * Course Service Microservice
 * Puerto: 3002
 * Responsabilidad: Gestión de cursos, módulos y estructura académica
 * 
 * NOTA: Este es un ejemplo de demostración
 * En producción, usaría MySQL para persistencia
 */

import express from 'express';

const app = express();
app.use(express.json());

// Base de datos simulada
const courses = new Map();
const modules = new Map();

// Middleware para logging
app.use((req, res, next) => {
  console.log(`[Course Service] ${req.method} ${req.path}`);
  next();
});

/**
 * Inicializar con datos de prueba
 */
function initializeTestData() {
  // Cursos de prueba
  courses.set('1', {
    id_curso: '1',
    nombre: 'Introducción a JavaScript',
    descripcion: 'Aprende los fundamentos de JavaScript',
    id_docente: '101',
    estado: 'activo',
    fechaCreacion: new Date().toISOString()
  });

  courses.set('2', {
    id_curso: '2',
    nombre: 'React Avanzado',
    descripcion: 'Profundiza en React y sus patrones',
    id_docente: '102',
    estado: 'activo',
    fechaCreacion: new Date().toISOString()
  });

  // Módulos de prueba
  modules.set('1', {
    id_modulo: '1',
    id_curso: '1',
    titulo: 'Variables y Tipos de Datos',
    descripcion: 'Conceptos fundamentales de variables',
    orden: 1,
    estado: 'activo'
  });

  modules.set('2', {
    id_modulo: '2',
    id_curso: '1',
    titulo: 'Funciones y Scope',
    descripcion: 'Funciones, scope y closures',
    orden: 2,
    estado: 'activo'
  });

  modules.set('3', {
    id_modulo: '3',
    id_curso: '2',
    titulo: 'Componentes Funcionales',
    descripcion: 'Componentes y hooks en React',
    orden: 1,
    estado: 'activo'
  });
}

// Inicializar datos
initializeTestData();

/**
 * GET /courses
 * Listar todos los cursos
 */
app.get('/courses', (req, res) => {
  try {
    const courseList = Array.from(courses.values());
    res.json({
      success: true,
      count: courseList.length,
      data: courseList
    });
  } catch (err) {
    console.error('Error en GET /courses:', err.message);
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /courses/:id
 * Obtener un curso específico
 */
app.get('/courses/:id', (req, res) => {
  try {
    const { id } = req.params;
    const course = courses.get(id);

    if (!course) {
      return res.status(404).json({ error: 'Curso no encontrado' });
    }

    res.json({
      success: true,
      data: course
    });
  } catch (err) {
    console.error('Error en GET /courses/:id:', err.message);
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /courses
 * Crear un nuevo curso
 */
app.post('/courses', (req, res) => {
  try {
    const { nombre, descripcion, id_docente } = req.body;

    if (!nombre || !id_docente) {
      return res.status(400).json({ error: 'Nombre e id_docente son requeridos' });
    }

    const newCourse = {
      id_curso: Date.now().toString(),
      nombre,
      descripcion,
      id_docente,
      estado: 'activo',
      fechaCreacion: new Date().toISOString()
    };

    courses.set(newCourse.id_curso, newCourse);

    res.status(201).json({
      success: true,
      message: 'Curso creado exitosamente',
      data: newCourse
    });
  } catch (err) {
    console.error('Error en POST /courses:', err.message);
    res.status(500).json({ error: err.message });
  }
});

/**
 * PUT /courses/:id
 * Actualizar un curso
 */
app.put('/courses/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion, estado } = req.body;

    let course = courses.get(id);
    if (!course) {
      return res.status(404).json({ error: 'Curso no encontrado' });
    }

    // Actualizar campos
    if (nombre) course.nombre = nombre;
    if (descripcion) course.descripcion = descripcion;
    if (estado) course.estado = estado;

    courses.set(id, course);

    res.json({
      success: true,
      message: 'Curso actualizado exitosamente',
      data: course
    });
  } catch (err) {
    console.error('Error en PUT /courses/:id:', err.message);
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /courses/:id/modules
 * Obtener todos los módulos de un curso
 */
app.get('/courses/:id/modules', (req, res) => {
  try {
    const { id } = req.params;

    // Verificar que el curso existe
    if (!courses.has(id)) {
      return res.status(404).json({ error: 'Curso no encontrado' });
    }

    // Obtener módulos del curso
    const courseModules = Array.from(modules.values())
      .filter(m => m.id_curso === id)
      .sort((a, b) => a.orden - b.orden);

    res.json({
      success: true,
      courseId: id,
      count: courseModules.length,
      data: courseModules
    });
  } catch (err) {
    console.error('Error en GET /courses/:id/modules:', err.message);
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /modules/:id
 * Obtener un módulo específico
 */
app.get('/modules/:id', (req, res) => {
  try {
    const { id } = req.params;
    const module = modules.get(id);

    if (!module) {
      return res.status(404).json({ error: 'Módulo no encontrado' });
    }

    res.json({
      success: true,
      data: module
    });
  } catch (err) {
    console.error('Error en GET /modules/:id:', err.message);
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /courses/:id/modules
 * Crear un nuevo módulo en un curso
 */
app.post('/courses/:id/modules', (req, res) => {
  try {
    const { id } = req.params;
    const { titulo, descripcion, orden } = req.body;

    // Verificar que el curso existe
    if (!courses.has(id)) {
      return res.status(404).json({ error: 'Curso no encontrado' });
    }

    if (!titulo) {
      return res.status(400).json({ error: 'Título es requerido' });
    }

    const newModule = {
      id_modulo: Date.now().toString(),
      id_curso: id,
      titulo,
      descripcion,
      orden: orden || 1,
      estado: 'activo',
      fechaCreacion: new Date().toISOString()
    };

    modules.set(newModule.id_modulo, newModule);

    res.status(201).json({
      success: true,
      message: 'Módulo creado exitosamente',
      data: newModule
    });
  } catch (err) {
    console.error('Error en POST /courses/:id/modules:', err.message);
    res.status(500).json({ error: err.message });
  }
});

/**
 * PUT /modules/:id
 * Actualizar un módulo
 */
app.put('/modules/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { titulo, descripcion, orden, estado } = req.body;

    let module = modules.get(id);
    if (!module) {
      return res.status(404).json({ error: 'Módulo no encontrado' });
    }

    // Actualizar campos
    if (titulo) module.titulo = titulo;
    if (descripcion) module.descripcion = descripcion;
    if (orden) module.orden = orden;
    if (estado) module.estado = estado;

    modules.set(id, module);

    res.json({
      success: true,
      message: 'Módulo actualizado exitosamente',
      data: module
    });
  } catch (err) {
    console.error('Error en PUT /modules/:id:', err.message);
    res.status(500).json({ error: err.message });
  }
});

/**
 * DELETE /courses/:id
 * Eliminar un curso
 */
app.delete('/courses/:id', (req, res) => {
  try {
    const { id } = req.params;

    if (!courses.has(id)) {
      return res.status(404).json({ error: 'Curso no encontrado' });
    }

    // Eliminar módulos asociados
    const modulesToDelete = Array.from(modules.entries())
      .filter(([, m]) => m.id_curso === id)
      .map(([moduleId]) => moduleId);

    modulesToDelete.forEach(moduleId => modules.delete(moduleId));

    courses.delete(id);

    res.json({
      success: true,
      message: 'Curso y sus módulos eliminados exitosamente',
      deletedModules: modulesToDelete.length
    });
  } catch (err) {
    console.error('Error en DELETE /courses/:id:', err.message);
    res.status(500).json({ error: err.message });
  }
});

/**
 * DELETE /modules/:id
 * Eliminar un módulo
 */
app.delete('/modules/:id', (req, res) => {
  try {
    const { id } = req.params;

    if (!modules.has(id)) {
      return res.status(404).json({ error: 'Módulo no encontrado' });
    }

    modules.delete(id);

    res.json({
      success: true,
      message: 'Módulo eliminado exitosamente'
    });
  } catch (err) {
    console.error('Error en DELETE /modules/:id:', err.message);
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /statistics
 * Obtener estadísticas del servicio
 */
app.get('/statistics', (req, res) => {
  try {
    res.json({
      success: true,
      statistics: {
        totalCourses: courses.size,
        totalModules: modules.size,
        avgModulesPerCourse: courses.size > 0 
          ? (modules.size / courses.size).toFixed(2) 
          : 0
      }
    });
  } catch (err) {
    console.error('Error en GET /statistics:', err.message);
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /health
 * Health check del servicio
 */
app.get('/health', (req, res) => {
  res.json({
    service: 'Course Service',
    status: 'UP',
    timestamp: new Date().toISOString(),
    coursesLoaded: courses.size,
    modulesLoaded: modules.size
  });
});

/**
 * Manejo de errores
 */
app.use((err, req, res, next) => {
  console.error('Course Service Error:', err);
  res.status(err.status || 500).json({
    error: err.message,
    service: 'Course Service',
    timestamp: new Date().toISOString()
  });
});

// Iniciar servidor
const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`📚 Course Service running on port ${PORT}`);
});

export default app;
