import authService from '../services/AuthService.js';

const authMiddleware = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        error: 'Token no proporcionado'
      });
    }

    const user = authService.verifyToken(token);

    if (!user) {
      return res.status(401).json({
        error: 'Token inválido o expirado'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({
      error: 'Token inválido'
    });
  }
};

export default authMiddleware;
