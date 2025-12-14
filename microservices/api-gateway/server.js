/**
 * API Gateway - Punto de entrada central para microservicios
 * Puerto: 3000
 * 
 */

import express from 'express';
import axios from 'axios';
import jwt from 'jsonwebtoken';

const app = express();
app.use(express.json());

// URLs de los microservicios
const SERVICES = {
  AUTH: process.env.AUTH_SERVICE_URL || 'http://localhost:3001',
  COURSE: process.env.COURSE_SERVICE_URL || 'http://localhost:3002',
  CONTENT: process.env.CONTENT_SERVICE_URL || 'http://localhost:3003',
  IA: process.env.IA_SERVICE_URL || 'http://localhost:3004',
  EVALUATION: process.env.EVALUATION_SERVICE_URL || 'http://localhost:3005',
  STUDENT: process.env.STUDENT_SERVICE_URL || 'http://localhost:3006',
  NOTIFICATION: process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3007',
};

// Middleware para logging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Middleware para verificar token
const verificarToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Token requerido' });
  }
  
  // En producción, verificar con Auth Service
  try {
    const decoded = jwt.decode(token);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Token inválido' });
  }
};

/**
 * ===================
 * RUTAS DE AUTH
 * ===================
 */
app.post('/api/auth/login', async (req, res) => {
  try {
    const response = await axios.post(`${SERVICES.AUTH}/login`, req.body);
    res.json(response.data);
  } catch (err) {
    res.status(err.response?.status || 500).json({ error: err.message });
  }
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const response = await axios.post(`${SERVICES.AUTH}/register`, req.body);
    res.json(response.data);
  } catch (err) {
    res.status(err.response?.status || 500).json({ error: err.message });
  }
});

/**
 * ===================
 * RUTAS DE CURSOS
 * ===================
 */
app.get('/api/courses', verificarToken, async (req, res) => {
  try {
    const response = await axios.get(`${SERVICES.COURSE}/courses`, {
      headers: { Authorization: req.headers.authorization }
    });
    res.json(response.data);
  } catch (err) {
    res.status(err.response?.status || 500).json({ error: err.message });
  }
});

app.get('/api/courses/:id', verificarToken, async (req, res) => {
  try {
    const response = await axios.get(`${SERVICES.COURSE}/courses/${req.params.id}`, {
      headers: { Authorization: req.headers.authorization }
    });
    res.json(response.data);
  } catch (err) {
    res.status(err.response?.status || 500).json({ error: err.message });
  }
});

app.get('/api/courses/:id/modules', verificarToken, async (req, res) => {
  try {
    const response = await axios.get(`${SERVICES.COURSE}/courses/${req.params.id}/modules`, {
      headers: { Authorization: req.headers.authorization }
    });
    res.json(response.data);
  } catch (err) {
    res.status(err.response?.status || 500).json({ error: err.message });
  }
});

/**
 * ===================
 * RUTAS DE CONTENIDO
 * ===================
 */
app.get('/api/modules/:id/content', verificarToken, async (req, res) => {
  try {
    const response = await axios.get(`${SERVICES.CONTENT}/modules/${req.params.id}/content`, {
      headers: { Authorization: req.headers.authorization }
    });
    res.json(response.data);
  } catch (err) {
    res.status(err.response?.status || 500).json({ error: err.message });
  }
});

app.post('/api/modules/:id/content', verificarToken, async (req, res) => {
  try {
    const response = await axios.post(`${SERVICES.CONTENT}/modules/${req.params.id}/content`, req.body, {
      headers: { Authorization: req.headers.authorization }
    });
    res.json(response.data);
  } catch (err) {
    res.status(err.response?.status || 500).json({ error: err.message });
  }
});

/**
 * ===================
 * RUTAS DE IA
 * ===================
 */
app.get('/api/ia/modules/:id/summary', verificarToken, async (req, res) => {
  try {
    const response = await axios.get(`${SERVICES.IA}/modules/${req.params.id}/summary`, {
      params: req.query,
      headers: { Authorization: req.headers.authorization }
    });
    res.json(response.data);
  } catch (err) {
    res.status(err.response?.status || 500).json({ error: err.message });
  }
});

app.post('/api/ia/modules/:id/summary-audio', verificarToken, async (req, res) => {
  try {
    const response = await axios.post(`${SERVICES.IA}/modules/${req.params.id}/summary-audio`, req.body, {
      headers: { Authorization: req.headers.authorization }
    });
    res.json(response.data);
  } catch (err) {
    res.status(err.response?.status || 500).json({ error: err.message });
  }
});

app.post('/api/ia/modules/summary-chat', verificarToken, async (req, res) => {
  try {
    const response = await axios.post(`${SERVICES.IA}/modules/summary-chat`, req.body, {
      headers: { Authorization: req.headers.authorization }
    });
    res.json(response.data);
  } catch (err) {
    res.status(err.response?.status || 500).json({ error: err.message });
  }
});

/**
 * ===================
 * RUTAS DE EVALUACIÓN
 * ===================
 */
app.get('/api/evaluations/:id/grades', verificarToken, async (req, res) => {
  try {
    const response = await axios.get(`${SERVICES.EVALUATION}/evaluations/${req.params.id}/grades`, {
      headers: { Authorization: req.headers.authorization }
    });
    res.json(response.data);
  } catch (err) {
    res.status(err.response?.status || 500).json({ error: err.message });
  }
});

app.post('/api/evaluations/:id/grade', verificarToken, async (req, res) => {
  try {
    const response = await axios.post(`${SERVICES.EVALUATION}/evaluations/${req.params.id}/grade`, req.body, {
      headers: { Authorization: req.headers.authorization }
    });
    res.json(response.data);
  } catch (err) {
    res.status(err.response?.status || 500).json({ error: err.message });
  }
});

/**
 * ===================
 * RUTAS DE ESTUDIANTES
 * ===================
 */
app.get('/api/students/:id', verificarToken, async (req, res) => {
  try {
    const response = await axios.get(`${SERVICES.STUDENT}/students/${req.params.id}`, {
      headers: { Authorization: req.headers.authorization }
    });
    res.json(response.data);
  } catch (err) {
    res.status(err.response?.status || 500).json({ error: err.message });
  }
});

app.get('/api/students/:id/progress', verificarToken, async (req, res) => {
  try {
    const response = await axios.get(`${SERVICES.STUDENT}/students/${req.params.id}/progress`, {
      headers: { Authorization: req.headers.authorization }
    });
    res.json(response.data);
  } catch (err) {
    res.status(err.response?.status || 500).json({ error: err.message });
  }
});

/**
 * ===================
 * RUTAS DE NOTIFICACIONES
 * ===================
 */
app.post('/api/notifications/notify', verificarToken, async (req, res) => {
  try {
    const response = await axios.post(`${SERVICES.NOTIFICATION}/notify`, req.body, {
      headers: { Authorization: req.headers.authorization }
    });
    res.json(response.data);
  } catch (err) {
    res.status(err.response?.status || 500).json({ error: err.message });
  }
});

app.get('/api/notifications/:id', verificarToken, async (req, res) => {
  try {
    const response = await axios.get(`${SERVICES.NOTIFICATION}/notifications/${req.params.id}`, {
      headers: { Authorization: req.headers.authorization }
    });
    res.json(response.data);
  } catch (err) {
    res.status(err.response?.status || 500).json({ error: err.message });
  }
});

/**
 * ===================
 * HEALTH CHECK
 * ===================
 */
app.get('/health', async (req, res) => {
  const health = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    services: {}
  };

  // Verificar salud de cada servicio
  for (const [name, url] of Object.entries(SERVICES)) {
    try {
      await axios.get(`${url}/health`, { timeout: 2000 });
      health.services[name] = 'UP';
    } catch (err) {
      health.services[name] = 'DOWN';
    }
  }

  res.json(health);
});

/**
 * ===================
 * MANEJO DE ERRORES
 * ===================
 */
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message,
    timestamp: new Date().toISOString()
  });
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 API Gateway running on port ${PORT}`);
  console.log(`Connected services:`);
  for (const [name, url] of Object.entries(SERVICES)) {
    console.log(`  - ${name}: ${url}`);
  }
});

export default app;
