import authService from '../services/AuthService.js';

export const getUser = (req, res, next) => {
  try {
    const { id } = req.params;
    const user = authService.getUser(id);

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(404).json({
      error: error.message
    });
  }
};

export const updateUser = (req, res, next) => {
  try {
    const { id } = req.params;
    const { nombre, email } = req.body;

    const user = authService.updateUser(id, { nombre, email });

    res.json({
      success: true,
      message: 'Usuario actualizado exitosamente',
      data: user
    });
  } catch (error) {
    res.status(400).json({
      error: error.message
    });
  }
};

export const changePassword = (req, res, next) => {
  try {
    const { id } = req.params;
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        error: 'oldPassword y newPassword son requeridos'
      });
    }

    authService.changePassword(id, oldPassword, newPassword);

    res.json({
      success: true,
      message: 'Contraseña cambiada exitosamente'
    });
  } catch (error) {
    res.status(400).json({
      error: error.message
    });
  }
};
