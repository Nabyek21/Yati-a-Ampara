/**
 * Auth Service Microservice
 * Puerto: 3001
 * Responsabilidad: Autenticación, autorización y gestión de usuarios
 * 
 * NOTA: Este es un ejemplo de demostración
 * En producción, usaría JWT tokens y MySQL para persistencia
 */

import express from 'express';
import crypto from 'crypto';

const app = express();
app.use(express.json());

// Base de datos simulada
const users = new Map();
const tokens = new Map();

// Middleware para logging
app.use((req, res, next) => {
  console.log(`[Auth Service] ${req.method} ${req.path}`);
  next();
});

/**
 * Inicializar usuarios de prueba
 */
function initializeTestUsers() {
  const testUsers = [
    {
      id_usuario: '1',
      nombre: 'Juan Docente',
      email: 'juan@example.com',
      password: hashPassword('password123'),
      rol: 'docente',
      estado: 'activo',
      fechaCreacion: new Date().toISOString()
    },
    {
      id_usuario: '2',
      nombre: 'María Estudiante',
      email: 'maria@example.com',
      password: hashPassword('password123'),
      rol: 'estudiante',
      estado: 'activo',
      fechaCreacion: new Date().toISOString()
    },
    {
      id_usuario: '3',
      nombre: 'Admin Sistema',
      email: 'admin@example.com',
      password: hashPassword('password123'),
      rol: 'admin',
      estado: 'activo',
      fechaCreacion: new Date().toISOString()
    }
  ];

  testUsers.forEach(user => {
    users.set(user.id_usuario, user);
  });
}

// Inicializar usuarios
initializeTestUsers();

/**
 * POST /auth/register
 * Registrar un nuevo usuario
 */
app.post('/auth/register', (req, res) => {
  try {
    const { nombre, email, password, rol = 'estudiante' } = req.body;

    if (!nombre || !email || !password) {
      return res.status(400).json({ 
        error: 'Nombre, email y password son requeridos' 
      });
    }

    // Verificar si el email ya existe
    const existingUser = Array.from(users.values())
      .find(u => u.email === email);

    if (existingUser) {
      return res.status(409).json({ error: 'El email ya está registrado' });
    }

    const newUser = {
      id_usuario: Date.now().toString(),
      nombre,
      email,
      password: hashPassword(password),
      rol,
      estado: 'activo',
      fechaCreacion: new Date().toISOString()
    };

    users.set(newUser.id_usuario, newUser);

    // Generar token
    const token = generateToken(newUser);

    res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente',
      user: {
        id_usuario: newUser.id_usuario,
        nombre: newUser.nombre,
        email: newUser.email,
        rol: newUser.rol
      },
      token: token
    });
  } catch (err) {
    console.error('Error en POST /auth/register:', err.message);
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /auth/login
 * Autenticar un usuario
 */
app.post('/auth/login', (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        error: 'Email y password son requeridos' 
      });
    }

    // Buscar usuario
    const user = Array.from(users.values())
      .find(u => u.email === email);

    if (!user) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Verificar contraseña
    if (!verifyPassword(password, user.password)) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    if (user.estado !== 'activo') {
      return res.status(403).json({ error: 'Usuario inactivo' });
    }

    // Generar token
    const token = generateToken(user);

    res.json({
      success: true,
      message: 'Login exitoso',
      user: {
        id_usuario: user.id_usuario,
        nombre: user.nombre,
        email: user.email,
        rol: user.rol
      },
      token: token
    });
  } catch (err) {
    console.error('Error en POST /auth/login:', err.message);
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /auth/verify
 * Verificar si un token es válido
 */
app.post('/auth/verify', (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: 'Token es requerido' });
    }

    const tokenData = tokens.get(token);

    if (!tokenData) {
      return res.status(401).json({ error: 'Token inválido o expirado' });
    }

    if (tokenData.expiresAt < Date.now()) {
      tokens.delete(token);
      return res.status(401).json({ error: 'Token expirado' });
    }

    const user = users.get(tokenData.userId);

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json({
      success: true,
      valid: true,
      user: {
        id_usuario: user.id_usuario,
        nombre: user.nombre,
        email: user.email,
        rol: user.rol
      }
    });
  } catch (err) {
    console.error('Error en POST /auth/verify:', err.message);
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /auth/logout
 * Cerrar sesión (invalidar token)
 */
app.post('/auth/logout', (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: 'Token es requerido' });
    }

    if (tokens.has(token)) {
      tokens.delete(token);
    }

    res.json({
      success: true,
      message: 'Logout exitoso'
    });
  } catch (err) {
    console.error('Error en POST /auth/logout:', err.message);
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /users/:id
 * Obtener información de un usuario
 */
app.get('/users/:id', (req, res) => {
  try {
    const { id } = req.params;
    const user = users.get(id);

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // No devolver password
    const { password, ...userWithoutPassword } = user;

    res.json({
      success: true,
      data: userWithoutPassword
    });
  } catch (err) {
    console.error('Error en GET /users/:id:', err.message);
    res.status(500).json({ error: err.message });
  }
});

/**
 * PUT /users/:id
 * Actualizar información del usuario
 */
app.put('/users/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, email } = req.body;

    let user = users.get(id);
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    if (nombre) user.nombre = nombre;
    if (email) {
      // Verificar que el email no esté usado
      const emailExists = Array.from(users.values())
        .find(u => u.email === email && u.id_usuario !== id);
      
      if (emailExists) {
        return res.status(409).json({ error: 'El email ya está en uso' });
      }
      user.email = email;
    }

    users.set(id, user);

    const { password, ...userWithoutPassword } = user;

    res.json({
      success: true,
      message: 'Usuario actualizado exitosamente',
      data: userWithoutPassword
    });
  } catch (err) {
    console.error('Error en PUT /users/:id:', err.message);
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /users/:id/change-password
 * Cambiar contraseña
 */
app.post('/users/:id/change-password', (req, res) => {
  try {
    const { id } = req.params;
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ 
        error: 'oldPassword y newPassword son requeridos' 
      });
    }

    let user = users.get(id);
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Verificar contraseña antigua
    if (!verifyPassword(oldPassword, user.password)) {
      return res.status(401).json({ error: 'Contraseña actual incorrecta' });
    }

    user.password = hashPassword(newPassword);
    users.set(id, user);

    res.json({
      success: true,
      message: 'Contraseña cambio exitosamente'
    });
  } catch (err) {
    console.error('Error en POST /users/:id/change-password:', err.message);
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /health
 * Health check del servicio
 */
app.get('/health', (req, res) => {
  res.json({
    service: 'Auth Service',
    status: 'UP',
    timestamp: new Date().toISOString(),
    usersLoaded: users.size,
    activeTokens: tokens.size
  });
});

/**
 * Funciones Auxiliares
 */

/**
 * Generar hash de contraseña
 * En producción, usar bcrypt
 */
function hashPassword(password) {
  return crypto
    .createHash('sha256')
    .update(password)
    .digest('hex');
}

/**
 * Verificar contraseña
 */
function verifyPassword(password, hash) {
  return hashPassword(password) === hash;
}

/**
 * Generar JWT token (simulado)
 * En producción, usar biblioteca jsonwebtoken
 */
function generateToken(user) {
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = Date.now() + (24 * 60 * 60 * 1000); // 24 horas

  tokens.set(token, {
    userId: user.id_usuario,
    email: user.email,
    rol: user.rol,
    createdAt: Date.now(),
    expiresAt: expiresAt
  });

  return token;
}

/**
 * Middleware para verificar token
 */
export function verificarToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ error: 'Token no proporcionado' });
    }

    const token = authHeader.replace('Bearer ', '');
    const tokenData = tokens.get(token);

    if (!tokenData) {
      return res.status(401).json({ error: 'Token inválido' });
    }

    if (tokenData.expiresAt < Date.now()) {
      tokens.delete(token);
      return res.status(401).json({ error: 'Token expirado' });
    }

    req.user = tokenData;
    next();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

/**
 * Manejo de errores
 */
app.use((err, req, res, next) => {
  console.error('Auth Service Error:', err);
  res.status(err.status || 500).json({
    error: err.message,
    service: 'Auth Service',
    timestamp: new Date().toISOString()
  });
});

// Iniciar servidor
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🔐 Auth Service running on port ${PORT}`);
  console.log('   Test users:');
  console.log('   - juan@example.com (docente)');
  console.log('   - maria@example.com (estudiante)');
  console.log('   - admin@example.com (admin)');
  console.log('   All passwords: password123');
});

export default app;
