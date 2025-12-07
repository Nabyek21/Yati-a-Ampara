import rateLimit from 'express-rate-limit';

// Limiter para login - Muy restrictivo (5 intentos cada 15 min)
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // 5 intentos
  message: 'Demasiados intentos de inicio de sesión. Intente después de 15 minutos.',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.method === 'OPTIONS' || process.env.NODE_ENV !== 'production',
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: 'Demasiados intentos. Por favor, intente más tarde.',
      retryAfter: req.rateLimit.resetTime
    });
  }
});

// Limiter para registro - Moderado (10 intentos cada 1 hora)
export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 10,
  message: 'Demasiadas cuentas creadas desde esta IP. Intente después de 1 hora.',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.method === 'OPTIONS' || process.env.NODE_ENV !== 'production'
});

// Limiter general para API - Moderado (100 intentos cada 1 min)
export const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    if (req.method === 'OPTIONS') return true;
    if (process.env.NODE_ENV !== 'production') return true;
    if (req.user?.id_rol === 1) return true; // Admin
    return false;
  }
});

// Limiter para IA - Muy restrictivo (10 intentos cada 1 min)
export const iaLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: 'Ha alcanzado el límite de consultas de IA. Intente después.',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.method === 'OPTIONS' || process.env.NODE_ENV !== 'production'
});

// Limiter para archivos - Moderado (20 uploads cada 1 hora)
export const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  message: 'Demasiadas descargas. Intente después de 1 hora.',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.method === 'OPTIONS' || process.env.NODE_ENV !== 'production'
});
