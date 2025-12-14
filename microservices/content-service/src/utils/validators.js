const validators = {
  validateContentTitle: (titulo) => {
    if (typeof titulo !== 'string' || titulo.trim().length === 0) {
      throw new Error('Título es requerido y debe ser texto');
    }
    return true;
  },

  validateContentType: (tipo) => {
    const validTypes = ['VIDEO', 'DOCUMENTO', 'ENLACE', 'ARCHIVO'];
    if (!validTypes.includes(tipo)) {
      throw new Error(`Tipo debe ser uno de: ${validTypes.join(', ')}`);
    }
    return true;
  },

  validateContentUrl: (url) => {
    try {
      new URL(url);
      return true;
    } catch (error) {
      throw new Error('URL inválida');
    }
  },

  validateContentOrder: (orden) => {
    if (typeof orden !== 'number' || orden < 1) {
      throw new Error('Orden debe ser un número positivo');
    }
    return true;
  }
};

export default validators;
