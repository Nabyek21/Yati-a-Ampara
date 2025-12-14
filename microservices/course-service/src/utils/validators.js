const validators = {
  validateCourseName: (nombre) => {
    if (typeof nombre !== 'string' || nombre.trim().length === 0) {
      throw new Error('Nombre es requerido y debe ser texto');
    }
    return true;
  },

  validateCourseDescription: (descripcion) => {
    if (typeof descripcion !== 'string' || descripcion.trim().length === 0) {
      throw new Error('Descripción es requerida y debe ser texto');
    }
    return true;
  },

  validateCredits: (creditos) => {
    if (typeof creditos !== 'number' || creditos <= 0) {
      throw new Error('Créditos debe ser un número positivo');
    }
    return true;
  },

  validateModuleName: (nombre) => {
    if (typeof nombre !== 'string' || nombre.trim().length === 0) {
      throw new Error('Nombre del módulo es requerido');
    }
    return true;
  },

  validateModuleOrder: (orden) => {
    if (typeof orden !== 'number' || orden < 1) {
      throw new Error('Orden debe ser un número positivo');
    }
    return true;
  }
};

export default validators;
