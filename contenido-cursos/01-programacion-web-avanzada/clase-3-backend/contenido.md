# Clase 3: Backend con Express.js y Node.js

## Objetivos
- Comprender la arquitectura de un servidor Express
- Crear APIs REST funcionales
- Aprender sobre middlewares y rutas

## Contenido

### 1. Node.js y Express

**Node.js**: Runtime JavaScript que permite ejecutar JavaScript en el servidor.

**Express.js**: Framework web minimalista para construir servidores HTTP.

### 2. Estructura de un Servidor Express

```javascript
import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// Rutas
app.get('/api/usuarios', (req, res) => {
  res.json({ message: 'Lista de usuarios' });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`✅ Servidor en http://localhost:${PORT}`);
});
```

### 3. Rutas y Verbos HTTP

| Verbo | Uso | Ejemplo |
|-------|-----|---------|
| GET | Obtener datos | GET /api/usuarios |
| POST | Crear datos | POST /api/usuarios |
| PUT | Actualizar completamente | PUT /api/usuarios/1 |
| PATCH | Actualizar parcialmente | PATCH /api/usuarios/1 |
| DELETE | Eliminar datos | DELETE /api/usuarios/1 |

### 4. Estructura de un Proyecto Express

```
backend/
├── src/
│   ├── app.js              # Configuración Express
│   ├── server.js           # Punto de entrada
│   ├── config/
│   │   └── database.js     # Conexión BD
│   ├── controllers/        # Lógica de negocio
│   ├── models/             # Acceso a datos
│   ├── routes/             # Definición de rutas
│   ├── middleware/         # Middlewares
│   └── utils/              # Funciones utilitarias
├── .env                    # Variables de entorno
├── package.json
└── .gitignore
```

### 5. Ejemplo: CRUD Completo

#### Modelo (UserModel.js)
```javascript
import { pool } from '../config/database.js';

export class UserModel {
  static async getAll() {
    const [rows] = await pool.query('SELECT * FROM usuarios');
    return rows;
  }

  static async getById(id) {
    const [rows] = await pool.query('SELECT * FROM usuarios WHERE id = ?', [id]);
    return rows[0];
  }

  static async create(data) {
    const [result] = await pool.query(
      'INSERT INTO usuarios (nombre, email) VALUES (?, ?)',
      [data.nombre, data.email]
    );
    return result;
  }

  static async update(id, data) {
    const [result] = await pool.query(
      'UPDATE usuarios SET nombre = ?, email = ? WHERE id = ?',
      [data.nombre, data.email, id]
    );
    return result;
  }

  static async delete(id) {
    const [result] = await pool.query('DELETE FROM usuarios WHERE id = ?', [id]);
    return result;
  }
}
```

#### Controlador (userController.js)
```javascript
import { UserModel } from '../models/UserModel.js';

export const getAllUsers = async (req, res) => {
  try {
    const users = await UserModel.getAll();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getUserById = async (req, res) => {
  try {
    const user = await UserModel.getById(req.params.id);
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createUser = async (req, res) => {
  try {
    const result = await UserModel.create(req.body);
    res.status(201).json({ id: result.insertId, ...req.body });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateUser = async (req, res) => {
  try {
    await UserModel.update(req.params.id, req.body);
    res.json({ id: req.params.id, ...req.body });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    await UserModel.delete(req.params.id);
    res.json({ message: 'Usuario eliminado' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
```

#### Rutas (routes/users.js)
```javascript
import express from 'express';
import * as userController from '../controllers/userController.js';

const router = express.Router();

router.get('/', userController.getAllUsers);
router.get('/:id', userController.getUserById);
router.post('/', userController.createUser);
router.put('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);

export default router;
```

### 6. Middlewares

Los middlewares son funciones que se ejecutan antes de llegar a la ruta.

```javascript
// Middleware de autenticación
const authenticate = (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).json({ error: 'Token requerido' });
  }
  // Validar token...
  next();
};

// Usarlo en una ruta
app.get('/api/protegido', authenticate, (req, res) => {
  res.json({ message: 'Ruta protegida' });
});
```

## Práctica

### Actividad 1: Crear un Endpoint GET

```bash
# Hacer una petición
curl http://localhost:3000/api/usuarios
```

### Actividad 2: Crear un Endpoint POST

```javascript
// Usar Postman o:
curl -X POST http://localhost:3000/api/usuarios \
  -H "Content-Type: application/json" \
  -d '{"nombre": "Juan", "email": "juan@example.com"}'
```

### Actividad 3: Middleware de Logging

Crea un middleware que registre todas las peticiones:

```javascript
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});
```

## Testing de APIs

### Con Postman
1. Crear una nueva solicitud
2. Seleccionar método (GET, POST, etc)
3. Ingresar URL
4. Agregar datos en Body (para POST/PUT)
5. Enviar

### Con cURL
```bash
# GET
curl http://localhost:3000/api/usuarios

# POST
curl -X POST http://localhost:3000/api/usuarios \
  -H "Content-Type: application/json" \
  -d '{"nombre": "Juan"}'

# PUT
curl -X PUT http://localhost:3000/api/usuarios/1 \
  -H "Content-Type: application/json" \
  -d '{"nombre": "Juan Actualizado"}'

# DELETE
curl -X DELETE http://localhost:3000/api/usuarios/1
```

## Recursos

- [Express.js Docs](https://expressjs.com)
- [Node.js Docs](https://nodejs.org/docs)
- [RESTful API Design](https://restfulapi.net)
- [Postman](https://www.postman.com)

## Resumen

✅ Creamos un servidor Express funcional
✅ Entendimos la arquitectura MVC
✅ Implementamos un CRUD completo
✅ Aprendimos sobre middlewares

## Próxima Clase

Clase 4: Base de Datos y Queries SQL
