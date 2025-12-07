import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

export const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  charset: 'utf8mb4',
});

try {
  const conn = await pool.getConnection();
  console.log("✅ Conectado correctamente a la base de datos YATI");
  conn.release();
} catch (err) {
  console.error("❌ Error de conexión a la base de datos:", err.message);
}
