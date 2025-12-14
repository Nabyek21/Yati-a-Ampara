import authService from '../services/AuthService.js';

export const register = (req, res, next) => {
  try {
    const { nombre, email, password, rol } = req.body;

    if (!nombre || !email || !password) {
      return res.status(400).json({
        error: 'Nombre, email y password son requeridos'
      });
    }

    const result = authService.register(nombre, email, password, rol);

    res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente',
      ...result
    });
  } catch (error) {
    next(error);
  }
};

export const login = (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: 'Email y password son requeridos'
      });
    }

    const result = authService.login(email, password);

    res.json({
      success: true,
      message: 'Login exitoso',
      ...result
    });
  } catch (error) {
    res.status(401).json({
      error: error.message
    });
  }
};

export const verify = (req, res, next) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        error: 'Token es requerido'
      });
    }

    const result = authService.verifyToken(token);

    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    res.status(401).json({
      error: error.message
    });
  }
};

export const logout = (req, res, next) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        error: 'Token es requerido'
      });
    }

    authService.logout(token);

    res.json({
      success: true,
      message: 'Logout exitoso'
    });
  } catch (error) {
    next(error);
  }
};
