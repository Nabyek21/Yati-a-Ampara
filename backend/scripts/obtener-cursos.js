#!/usr/bin/env node
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  charset: 'utf8mb4',
});

async function obtenerCursos() {
  const conn = await pool.getConnection();
  try {
    const [cursos] = await conn.query(`
      SELECT id_curso, nombre, descripcion, duracion_semanas
      FROM cursos
      ORDER BY id_curso
    `);

    console.log('\n📚 CURSOS DISPONIBLES:\n');
    cursos.forEach(c => {
      console.log(`  ID: ${c.id_curso}`);
      console.log(`  Nombre: ${c.nombre}`);
      console.log(`  Descripción: ${c.descripcion || 'N/A'}`);
      console.log(`  Duración: ${c.duracion_semanas} semanas`);
      console.log('  ---');
    });

    const [secciones] = await conn.query(`
      SELECT s.id_seccion, s.nombre_seccion, c.nombre
      FROM secciones s
      JOIN cursos c ON s.id_curso = c.id_curso
      ORDER BY s.id_curso, s.id_seccion
    `);

    console.log('\n📖 SECCIONES:\n');
    secciones.forEach(s => {
      console.log(`  ${s.nombre_seccion} (ID: ${s.id_seccion}) - Curso: ${s.nombre}`);
    });

    conn.release();
    pool.end();
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

obtenerCursos();
