import express from "express";
import cors from "cors";
import { pool } from "./config/database.js";
import path from 'path';
import { fileURLToPath } from 'url';
import { errorHandler, requestLogger } from "./middleware/errorHandler.js";
import logger from "./utils/logger.js";
import authRoutes from "./routes/authRoutes.js"; // ✅ Importa las rutas de login
import userRoutes from "./routes/userRoutes.js"; // ✅ Importa las rutas de usuarios
import estadoRoutes from "./routes/estadoRoutes.js"; // ✅ Importa las rutas de estados
import rolRoutes from "./routes/rolRoutes.js"; // ✅ Importa las rutas de roles
import docenteRoutes from "./routes/docenteRoutes.js"; // ✅ Importa las rutas de docentes
import especialidadRoutes from "./routes/especialidadRoutes.js"; // ✅ Importa las rutas de especialidades
import modalidadRoutes from "./routes/modalidadRoutes.js"; // ✅ Importa las rutas de modalidades
import cursoRoutes from "./routes/cursoRoutes.js"; // ✅ Importa las rutas de cursos
import seccionRoutes from "./routes/seccionRoutes.js"; // ✅ Importa las rutas de secciones
import horaClaseRoutes from "./routes/horaClaseRoutes.js"; // ✅ Importa las rutas de horas_clase
import claseRoutes from "./routes/claseRoutes.js"; // ✅ Importa las rutas de clases
import statsRoutes from "./routes/statsRoutes.js"; // ✅ Importa las rutas de estadísticas
import moduloRoutes from "./routes/moduloRoutes.js"; // ✅ Importa las rutas de módulos
import moduloContenidoRoutes from "./routes/moduloContenidoRoutes.js"; // ✅ Importa las rutas de contenido de módulos
import actividadRoutes from "./routes/actividadRoutes.js"; // ✅ Importa las rutas de actividades
import preguntaRoutes from "./routes/preguntaRoutes.js"; // ✅ Importa las rutas de preguntas
import respuestaOpcionRoutes from "./routes/respuestaOpcionRoutes.js"; // ✅ Importa las rutas de opciones de respuesta
import { router as actividadRespuestaRoutes } from "./routes/actividadRespuestaRoutes.js"; // ✅ Importa las rutas de respuestas de actividades
import respuestaAlumnoRoutes from "./routes/respuestaAlumnoRoutes.js"; // ✅ Importa las rutas de respuestas de alumnos
import ponderacionRoutes from "./routes/ponderacionRoutes.js"; // ✅ Importa las rutas de ponderaciones
import estadisticasRoutes from "./routes/estadisticasRoutes.js"; // ✅ Importa las rutas de estadísticas de calificación
import uploadRoutes from "./routes/uploadRoutes.js"; // ✅ Importa las rutas de upload

const app = express();

// ========== CORS CONFIG ==========
const corsOptions = {
  origin: ['http://localhost:4321', 'http://localhost:3000', 'http://localhost:5173', 'http://127.0.0.1:4321'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

// Middleware CORS universal ANTES de todo
app.use((req, res, next) => {
  console.log(`[CORS] ${req.method} ${req.path}`);
  const origin = req.headers.origin;
  if (corsOptions.origin.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  } else {
    res.header('Access-Control-Allow-Origin', corsOptions.origin[0]);
  }
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    console.log(`[CORS] Respondiendo OPTIONS con 200`);
    return res.sendStatus(200);
  }
  next();
});

app.use(cors(corsOptions));

// Parsers con UTF-8 explícito
app.use(express.json({ limit: '50mb', charset: 'utf-8' }));
app.use(express.urlencoded({ extended: true, limit: '50mb', charset: 'utf-8' }));

// Middleware para asegurar UTF-8 en respuestas
app.use((req, res, next) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  next();
});

// ✅ Middleware de logging
app.use(requestLogger);

// Servir archivos estáticos subidos (uploads)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, 'uploads');
app.use('/uploads', express.static(uploadsDir));

// Middleware de logging para debug
app.use((req, res, next) => {
  logger.debug(`${req.method} ${req.path}`);
  next();
});

// Ruta de prueba
app.get("/", (req, res) => {
  res.send("🚀 API de Yatiña funcionando correctamente");
});

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ✅ Rutas reales
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes); // ✅ Monta las rutas de usuarios
app.use("/api/estados", estadoRoutes); // ✅ Monta las rutas de estados
app.use("/api/roles", rolRoutes); // ✅ Monta las rutas de roles
app.use("/api/docentes", docenteRoutes); // ✅ Monta las rutas de docentes
app.use("/api/especialidades", especialidadRoutes); // ✅ Monta las rutas de especialidades
app.use("/api/modalidades", modalidadRoutes); // ✅ Monta las rutas de modalidades
app.use("/api/cursos", cursoRoutes); // ✅ Monta las rutas de cursos
import seccionEstadisticasRoutes from "./routes/seccionEstadisticasRoutes.js";
app.use("/api/secciones", seccionRoutes); // ✅ Monta las rutas de secciones
app.use("/api/secciones", seccionEstadisticasRoutes); // Analíticas de sección
app.use("/api/horas-clase", horaClaseRoutes); // ✅ Monta las rutas de horas_clase
app.use("/api/clases", claseRoutes); // ✅ Monta las rutas de clases
app.use("/api/stats", statsRoutes); // ✅ Monta las rutas de estadísticas
app.use("/api/modulos", moduloRoutes); // ✅ Monta las rutas de módulos
app.use("/api/modulo-contenido", moduloContenidoRoutes); // ✅ Monta las rutas de contenido de módulos
app.use("/api/actividades", actividadRoutes); // ✅ Monta las rutas de actividades
app.use("/api/preguntas", preguntaRoutes); // ✅ Monta las rutas de preguntas
app.use("/api/respuestas-opciones", respuestaOpcionRoutes); // ✅ Monta las rutas de opciones de respuesta
app.use("/api/actividades-respuestas", actividadRespuestaRoutes); // ✅ Monta las rutas de respuestas de actividades
app.use("/api/respuestas-alumnos", respuestaAlumnoRoutes); // ✅ Monta las rutas de respuestas de alumnos
app.use("/api/ponderaciones", ponderacionRoutes); // ✅ Monta las rutas de ponderaciones
app.use("/api/estadisticas", estadisticasRoutes); // ✅ Monta las rutas de estadísticas de calificación

import matriculaRoutes from "./routes/matriculaRoutes.js";
app.use("/api/matriculas", matriculaRoutes);

import notaRoutes from "./routes/notaRoutes.js";
app.use("/api/notas", notaRoutes);

import iaRoutes from "./routes/iaRoutes.js";
app.use("/api/ia", iaRoutes); // ✅ Monta las rutas del Agente IA

import foroRoutes from "./routes/foroRoutes.js";
app.use("/api/foro", foroRoutes); // ✅ Monta las rutas del foro

import configPesosRoutes from "./routes/configPesosRoutes.js";
app.use("/api/pesos", configPesosRoutes); // ✅ Monta las rutas de configuración de pesos

import bibliotecaRoutes from "./routes/bibliotecaRoutes.js";
app.use("/api/biblioteca", bibliotecaRoutes); // ✅ Monta las rutas de la biblioteca

// Upload routes
app.use("/api/upload", uploadRoutes); // ✅ Monta las rutas de upload

// Middleware de error 404
app.use((req, res) => {
  res.status(404).json({ 
    message: "Ruta no encontrada",
    ruta: req.path,
    metodo: req.method,
    timestamp: new Date().toISOString()
  });
});

// ✅ Middleware de manejo de errores global (DESPUÉS de todas las rutas)
app.use(errorHandler);

export default app;
