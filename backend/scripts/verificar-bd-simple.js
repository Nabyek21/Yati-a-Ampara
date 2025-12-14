#!/usr/bin/env node
/**
 * Script simplificado para verificar estructura de BD
 */

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

async function verificar() {
  const conn = await pool.getConnection();
  try {
    console.log('\n🔍 VERIFICANDO ESTRUCTURA DE BD...\n');

    // 1. Obtener todas las tablas
    const [tables] = await conn.query(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = ?
      ORDER BY TABLE_NAME
    `, [process.env.DB_NAME]);

    console.log(`✅ Total de tablas: ${tables.length}\n`);

    // 2. Para cada tabla, mostrar estructura
    for (const table of tables) {
      console.log(`📋 TABLA: ${table.TABLE_NAME}`);
      
      const [cols] = await conn.query(`
        SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE, COLUMN_KEY, EXTRA
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?
        ORDER BY ORDINAL_POSITION
      `, [process.env.DB_NAME, table.TABLE_NAME]);

      const [rows] = await conn.query(`SELECT COUNT(*) as cnt FROM ${table.TABLE_NAME}`);
      console.log(`  Registros: ${rows[0].cnt}`);
      console.log(`  Columnas:`);
      
      cols.forEach(col => {
        const pk = col.COLUMN_KEY === 'PRI' ? '[PK]' : '';
        const fk = col.COLUMN_KEY === 'MUL' ? '[FK]' : '';
        const nullable = col.IS_NULLABLE === 'YES' ? 'NULL' : '';
        console.log(`    - ${col.COLUMN_NAME} (${col.COLUMN_TYPE}) ${pk}${fk} ${nullable}`);
      });

      // Foreign keys
      const [fks] = await conn.query(`
        SELECT COLUMN_NAME, REFERENCED_TABLE_NAME, REFERENCED_COLUMN_NAME
        FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
        WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND REFERENCED_TABLE_NAME IS NOT NULL
      `, [process.env.DB_NAME, table.TABLE_NAME]);

      if (fks.length > 0) {
        console.log(`  Relaciones:`);
        fks.forEach(fk => {
          console.log(`    - ${fk.COLUMN_NAME} → ${fk.REFERENCED_TABLE_NAME}.${fk.REFERENCED_COLUMN_NAME}`);
        });
      }

      console.log('');
    }

    // 3. Análisis de flujo de ponderaciones
    console.log('\n' + '='.repeat(70));
    console.log('🔄 ANÁLISIS DE FLUJO DE PONDERACIONES');
    console.log('='.repeat(70) + '\n');

    // Verificar ponderaciones por sección
    const [ponder] = await conn.query(`
      SELECT ps.id_seccion, ps.tipo_evaluacion, ps.peso_porcentaje
      FROM ponderaciones_seccion ps
      ORDER BY ps.id_seccion, FIELD(ps.tipo_evaluacion, 'práctica', 'examen', 'examen_final')
    `);

    if (ponder.length > 0) {
      console.log('Ponderaciones configuradas:');
      let currentSeccion = null;
      let total = 0;

      ponder.forEach(row => {
        if (currentSeccion !== row.id_seccion) {
          if (currentSeccion !== null) {
            console.log(`  Total sección ${currentSeccion}: ${total}% ${total === 100 ? '✅' : '❌'}`);
          }
          currentSeccion = row.id_seccion;
          total = 0;
          console.log(`\n  Sección ${row.id_seccion}:`);
        }
        total += row.peso_porcentaje;
        console.log(`    - ${row.tipo_evaluacion}: ${row.peso_porcentaje}%`);
      });
      console.log(`  Total sección ${currentSeccion}: ${total}% ${total === 100 ? '✅' : '❌'}`);
    } else {
      console.log('⚠️  No hay ponderaciones configuradas');
    }

    // Verificar nota final flow
    console.log('\n\nFlujo de Calificaciones:');
    const [flow] = await conn.query(`
      SELECT 
        COUNT(DISTINCT n.id_matricula) as estudiantes,
        COUNT(DISTINCT a.id_seccion) as secciones,
        COUNT(n.id_nota) as notas_total
      FROM notas n
      JOIN actividades a ON n.id_actividad = a.id_actividad
    `);

    console.log(`  - Estudiantes con notas: ${flow[0].estudiantes}`);
    console.log(`  - Secciones con notas: ${flow[0].secciones}`);
    console.log(`  - Total de notas: ${flow[0].notas_total}`);

    const [calculos] = await conn.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(DISTINCT id_matricula) as estudiantes
      FROM calificaciones_finales
    `);

    console.log(`\n  - Calificaciones finales procesadas: ${calculos[0].total}`);
    console.log(`  - Estudiantes con calificación final: ${calculos[0].estudiantes}`);

    // Validar integridad
    console.log('\n\n' + '='.repeat(70));
    console.log('✅ VALIDACIÓN DE INTEGRIDAD');
    console.log('='.repeat(70) + '\n');

    // Verificar que no hay notas sin calificación final
    const [noMatch] = await conn.query(`
      SELECT COUNT(*) as cnt FROM notas n
      WHERE NOT EXISTS (
        SELECT 1 FROM calificaciones_finales cf
        WHERE cf.id_matricula = n.id_matricula
      )
    `);

    if (noMatch[0].cnt === 0) {
      console.log('✅ Todas las notas tienen calificación final asociada');
    } else {
      console.log(`⚠️  ${noMatch[0].cnt} notas sin calificación final`);
    }

    // Verificar ponderaciones válidas
    const [invalidPonder] = await conn.query(`
      SELECT id_seccion, SUM(peso_porcentaje) as total
      FROM ponderaciones_seccion
      GROUP BY id_seccion
      HAVING total != 100
    `);

    if (invalidPonder.length === 0) {
      console.log('✅ Todas las ponderaciones suman 100%');
    } else {
      console.log(`⚠️  ${invalidPonder.length} secciones con ponderación incorrecta:`);
      invalidPonder.forEach(row => {
        console.log(`   - Sección ${row.id_seccion}: ${row.total}%`);
      });
    }

    console.log('\n✅ VERIFICACIÓN COMPLETADA\n');

  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    conn.release();
    process.exit(0);
  }
}

verificar();
