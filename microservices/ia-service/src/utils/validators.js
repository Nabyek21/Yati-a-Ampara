const validators = {
  validateDifficulty: (dificultad) => {
    const validDifficulties = ['BASICA', 'MEDIA', 'AVANZADA'];
    if (!validDifficulties.includes(dificultad)) {
      throw new Error(`Dificultad debe ser uno de: ${validDifficulties.join(', ')}`);
    }
    return true;
  },

  validateQuantity: (cantidad) => {
    if (typeof cantidad !== 'number' || cantidad < 1 || cantidad > 50) {
      throw new Error('Cantidad debe ser un número entre 1 y 50');
    }
    return true;
  },

  validateContentId: (contentId) => {
    if (!contentId || typeof contentId !== 'string') {
      throw new Error('Content ID es requerido y debe ser texto');
    }
    return true;
  },

  validateUserId: (userId) => {
    if (!userId || typeof userId !== 'string') {
      throw new Error('User ID es requerido y debe ser texto');
    }
    return true;
  }
};

export default validators;
