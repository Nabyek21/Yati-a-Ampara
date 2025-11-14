import express from "express";
import cors from "cors";
import { pool } from "./config/database.js";
import authRoutes from "./routes/authRoutes.js"; // ✅ Importa las rutas de login

const app = express();

app.use(cors());
app.use(express.json());

// Ruta de prueba
app.get("/", (req, res) => {
  res.send("🚀 API de Yatiña funcionando correctamente");
});

// ✅ Rutas reales
app.use("/api/auth", authRoutes);

export default app;
