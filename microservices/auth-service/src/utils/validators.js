const validators = {
  validateEmail: (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('Email inválido');
    }
    return true;
  },

  validatePassword: (password) => {
    if (password.length < 6) {
      throw new Error('La contraseña debe tener al menos 6 caracteres');
    }
    return true;
  },

  validateNombre: (nombre) => {
    if (typeof nombre !== 'string' || nombre.trim().length === 0) {
      throw new Error('Nombre es requerido y debe ser texto');
    }
    return true;
  },

  validateRol: (rol) => {
    const validRoles = ['ADMIN', 'DOCENTE', 'ALUMNO'];
    if (!validRoles.includes(rol)) {
      throw new Error(`Rol debe ser uno de: ${validRoles.join(', ')}`);
    }
    return true;
  }
};

export default validators;
