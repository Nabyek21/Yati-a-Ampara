class ModuleService {
  constructor() {
    this.modules = new Map([
      ['1', {
        id: '1',
        course_id: '1',
        nombre: 'Introducción a HTML',
        orden: 1,
        estado: 'DISPONIBLE',
        fecha_creacion: new Date()
      }],
      ['2', {
        id: '2',
        course_id: '1',
        nombre: 'CSS y Estilos',
        orden: 2,
        estado: 'DISPONIBLE',
        fecha_creacion: new Date()
      }],
      ['3', {
        id: '3',
        course_id: '1',
        nombre: 'JavaScript Avanzado',
        orden: 3,
        estado: 'DISPONIBLE',
        fecha_creacion: new Date()
      }]
    ]);

    this.nextModuleId = 4;
  }

  getAllModules() {
    return Array.from(this.modules.values());
  }

  getModuleById(id) {
    const module = this.modules.get(id);
    if (!module) {
      throw new Error(`Módulo con ID ${id} no encontrado`);
    }
    return module;
  }

  getModulesByCourse(courseId) {
    return Array.from(this.modules.values())
      .filter(module => module.course_id === courseId)
      .sort((a, b) => a.orden - b.orden);
  }

  createModule(data) {
    if (!data.course_id || !data.nombre) {
      throw new Error('course_id y nombre son requeridos');
    }

    const newModule = {
      id: String(this.nextModuleId++),
      course_id: data.course_id,
      nombre: data.nombre,
      orden: data.orden || 1,
      estado: 'DISPONIBLE',
      fecha_creacion: new Date()
    };

    this.modules.set(newModule.id, newModule);
    return newModule;
  }

  updateModule(id, data) {
    const module = this.getModuleById(id);
    
    const updatedModule = {
      ...module,
      ...data,
      id: module.id,
      fecha_creacion: module.fecha_creacion
    };

    this.modules.set(id, updatedModule);
    return updatedModule;
  }

  deleteModule(id) {
    if (!this.modules.has(id)) {
      throw new Error(`Módulo con ID ${id} no encontrado`);
    }
    this.modules.delete(id);
    return { message: 'Módulo eliminado exitosamente' };
  }

  reorderModules(courseId, moduleIds) {
    moduleIds.forEach((moduleId, index) => {
      const module = this.getModuleById(moduleId);
      if (module.course_id === courseId) {
        module.orden = index + 1;
      }
    });
    return this.getModulesByCourse(courseId);
  }
}

export default new ModuleService();
