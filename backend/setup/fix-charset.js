import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

async function fixCharset() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    charset: 'utf8mb4',
  });

  try {
    const connection = await pool.getConnection();
    
    console.log("🔧 Configurando charset UTF-8 en tablas del foro...\n");
    
    // Alterar tabla foro_temas
    console.log("📝 Alterando tabla foro_temas...");
    await connection.query(
      "ALTER TABLE foro_temas CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci"
    );
    console.log("✅ foro_temas configurada correctamente\n");
    
    // Alterar tabla foro_respuestas
    console.log("📝 Alterando tabla foro_respuestas...");
    await connection.query(
      "ALTER TABLE foro_respuestas CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci"
    );
    console.log("✅ foro_respuestas configurada correctamente\n");
    
    // Alterar tabla usuarios
    console.log("📝 Alterando tabla usuarios...");
    await connection.query(
      "ALTER TABLE usuarios CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci"
    );
    console.log("✅ usuarios configurada correctamente\n");
    
    connection.release();
    pool.end();
    
    console.log("✨ ¡Configuración UTF-8 completada!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error al configurar charset:", error.message);
    process.exit(1);
  }
}
