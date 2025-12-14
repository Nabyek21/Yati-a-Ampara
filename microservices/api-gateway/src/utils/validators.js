const validators = {
  validateServiceUrl: (url) => {
    try {
      new URL(url);
      return true;
    } catch (error) {
      throw new Error('URL de servicio inválida');
    }
  },

  validateTimeout: (timeout) => {
    if (typeof timeout !== 'number' || timeout < 1000) {
      throw new Error('Timeout debe ser un número mayor a 1000ms');
    }
    return true;
  }
};

export default validators;
