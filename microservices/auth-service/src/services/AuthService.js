import crypto from 'crypto';

class AuthService {
  constructor() {
    this.users = this.initializeUsers();
    this.tokens = new Map();
  }

  initializeUsers() {
    return new Map([
      ['1', {
        id_usuario: '1',
        nombre: 'Juan Docente',
        email: 'juan@example.com',
        password: this.hashPassword('password123'),
        rol: 'docente',
        estado: 'activo',
        fechaCreacion: new Date().toISOString()
      }],
      ['2', {
        id_usuario: '2',
        nombre: 'María Estudiante',
        email: 'maria@example.com',
        password: this.hashPassword('password123'),
        rol: 'estudiante',
        estado: 'activo',
        fechaCreacion: new Date().toISOString()
      }],
      ['3', {
        id_usuario: '3',
        nombre: 'Admin Sistema',
        email: 'admin@example.com',
        password: this.hashPassword('password123'),
        rol: 'admin',
        estado: 'activo',
        fechaCreacion: new Date().toISOString()
      }]
    ]);
  }

  hashPassword(password) {
    return crypto.createHash('sha256').update(password).digest('hex');
  }

  verifyPassword(password, hash) {
    return this.hashPassword(password) === hash;
  }

  generateToken(user) {
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = Date.now() + (24 * 60 * 60 * 1000); // 24 horas

    this.tokens.set(token, {
      userId: user.id_usuario,
      email: user.email,
      rol: user.rol,
      createdAt: Date.now(),
      expiresAt: expiresAt
    });

    return token;
  }

  login(email, password) {
    const user = Array.from(this.users.values()).find(u => u.email === email);

    if (!user) {
      throw new Error('Credenciales inválidas');
    }

    if (!this.verifyPassword(password, user.password)) {
      throw new Error('Credenciales inválidas');
    }

    if (user.estado !== 'activo') {
      throw new Error('Usuario inactivo');
    }

    const token = this.generateToken(user);

    return {
      user: {
        id_usuario: user.id_usuario,
        nombre: user.nombre,
        email: user.email,
        rol: user.rol
      },
      token
    };
  }

  register(nombre, email, password, rol = 'estudiante') {
    const emailExists = Array.from(this.users.values()).find(u => u.email === email);
    
    if (emailExists) {
      throw new Error('El email ya está registrado');
    }

    const newUser = {
      id_usuario: Date.now().toString(),
      nombre,
      email,
      password: this.hashPassword(password),
      rol,
      estado: 'activo',
      fechaCreacion: new Date().toISOString()
    };

    this.users.set(newUser.id_usuario, newUser);
    const token = this.generateToken(newUser);

    return {
      user: {
        id_usuario: newUser.id_usuario,
        nombre: newUser.nombre,
        email: newUser.email,
        rol: newUser.rol
      },
      token
    };
  }

  verifyToken(token) {
    const tokenData = this.tokens.get(token);

    if (!tokenData) {
      throw new Error('Token inválido o expirado');
    }

    if (tokenData.expiresAt < Date.now()) {
      this.tokens.delete(token);
      throw new Error('Token expirado');
    }

    const user = this.users.get(tokenData.userId);

    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    return {
      valid: true,
      user: {
        id_usuario: user.id_usuario,
        nombre: user.nombre,
        email: user.email,
        rol: user.rol
      }
    };
  }

  logout(token) {
    if (this.tokens.has(token)) {
      this.tokens.delete(token);
    }
    return { success: true };
  }

  getUser(userId) {
    const user = this.users.get(userId);

    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  updateUser(userId, updates) {
    const user = this.users.get(userId);

    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    if (updates.nombre) user.nombre = updates.nombre;
    if (updates.email) {
      const emailExists = Array.from(this.users.values())
        .find(u => u.email === updates.email && u.id_usuario !== userId);
      
      if (emailExists) {
        throw new Error('El email ya está en uso');
      }
      user.email = updates.email;
    }

    this.users.set(userId, user);
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  changePassword(userId, oldPassword, newPassword) {
    const user = this.users.get(userId);

    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    if (!this.verifyPassword(oldPassword, user.password)) {
      throw new Error('Contraseña actual incorrecta');
    }

    user.password = this.hashPassword(newPassword);
    this.users.set(userId, user);

    return { success: true };
  }
}

export default new AuthService();
