class CourseService {
  constructor() {
    this.courses = new Map([
      ['1', {
        id: '1',
        nombre: 'Programación Web',
        descripcion: 'Aprende a desarrollar aplicaciones web',
        creditos: 4,
        docente_id: '1',
        estado: 'ACTIVO',
        fecha_creacion: new Date()
      }],
      ['2', {
        id: '2',
        nombre: 'Base de Datos',
        descripcion: 'Diseño y gestión de bases de datos',
        creditos: 3,
        docente_id: '2',
        estado: 'ACTIVO',
        fecha_creacion: new Date()
      }],
      ['3', {
        id: '3',
        nombre: 'Estructuras de Datos',
        descripcion: 'Fundamentos de estructuras de datos',
        creditos: 3,
        docente_id: '1',
        estado: 'ACTIVO',
        fecha_creacion: new Date()
      }]
    ]);

    this.nextCourseId = 4;
  }

  getAllCourses() {
    return Array.from(this.courses.values());
  }

  getCourseById(id) {
    const course = this.courses.get(id);
    if (!course) {
      throw new Error(`Curso con ID ${id} no encontrado`);
    }
    return course;
  }

  createCourse(data) {
    if (!data.nombre || !data.descripcion) {
      throw new Error('Nombre y descripción son requeridos');
    }

    const newCourse = {
      id: String(this.nextCourseId++),
      nombre: data.nombre,
      descripcion: data.descripcion,
      creditos: data.creditos || 3,
      docente_id: data.docente_id,
      estado: 'ACTIVO',
      fecha_creacion: new Date()
    };

    this.courses.set(newCourse.id, newCourse);
    return newCourse;
  }

  updateCourse(id, data) {
    const course = this.getCourseById(id);
    
    const updatedCourse = {
      ...course,
      ...data,
      id: course.id,
      fecha_creacion: course.fecha_creacion
    };

    this.courses.set(id, updatedCourse);
    return updatedCourse;
  }

  deleteCourse(id) {
    if (!this.courses.has(id)) {
      throw new Error(`Curso con ID ${id} no encontrado`);
    }
    this.courses.delete(id);
    return { message: 'Curso eliminado exitosamente' };
  }

  getCoursesByDocente(docenteId) {
    return Array.from(this.courses.values()).filter(
      course => course.docente_id === docenteId
    );
  }

  getActiveCourses() {
    return Array.from(this.courses.values()).filter(
      course => course.estado === 'ACTIVO'
    );
  }
}

export default new CourseService();
