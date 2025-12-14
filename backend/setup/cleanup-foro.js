import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

async function cleanupForo() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    charset: 'utf8mb4',
    collation: 'utf8mb4_unicode_ci',
  });

  try {
    const connection = await pool.getConnection();
    
    console.log("🗑️  Eliminando todas las respuestas del foro...");
    const [deleteRespuestas] = await connection.query("DELETE FROM foro_respuestas");
    console.log(`✅ Se eliminaron ${deleteRespuestas.affectedRows} respuestas`);
    
    console.log("🗑️  Eliminando todos los temas del foro...");
    const [deleteTemasRes] = await connection.query("DELETE FROM foro_temas");
    console.log(`✅ Se eliminaron ${deleteTemasRes.affectedRows} temas`);
    
    console.log("🗑️  Reseteando auto_increment...");
    await connection.query("ALTER TABLE foro_temas AUTO_INCREMENT = 1");
    await connection.query("ALTER TABLE foro_respuestas AUTO_INCREMENT = 1");
    console.log("✅ Auto_increment reseteado");
    
    connection.release();
    pool.end();
    
    console.log("\n✨ ¡Limpieza completada exitosamente!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error durante la limpieza:", error.message);
    process.exit(1);
  }
}

cleanupForo();
