#!/usr/bin/env node
/**
 * Script para recalcular calificaciones finales
 * Ejecutar después de corregir las ponderaciones
 */

import { pool } from './src/config/database.js';
import CalificacionesService from './src/services/CalificacionesService.js';

async function recalcularCalificaciones() {
  const conn = await pool.getConnection();
  try {
    console.log('\n📊 RECALCULANDO CALIFICACIONES FINALES\n');

    // Obtener todas las matrículas con notas
    const [matriculas] = await conn.query(`
      SELECT DISTINCT n.id_matricula, a.id_seccion
      FROM notas n
      JOIN actividades a ON n.id_actividad = a.id_actividad
      ORDER BY n.id_matricula, a.id_seccion
    `);

    console.log(`Encontradas ${matriculas.length} matrículas con notas\n`);

    if (matriculas.length === 0) {
      console.log('ℹ️  No hay notas para recalcular\n');
      process.exit(0);
    }

    // Recalcular para cada matricula-sección
    for (const m of matriculas) {
      try {
        console.log(`Procesando: Matricula ${m.id_matricula}, Sección ${m.id_seccion}...`);

        // Recalcular promedio por tipo
        await CalificacionesService.recalcularPromedioPorTipo(m.id_matricula, m.id_seccion);
        console.log(`  ✓ Promedio por tipo calculado`);

        // Recalcular nota final
        await CalificacionesService.recalcularNotaFinal(m.id_matricula, m.id_seccion);
        console.log(`  ✓ Nota final calculada`);

        // Obtener resultado
        const notaFinal = await CalificacionesService.obtenerNotaFinal(m.id_matricula, m.id_seccion);
        if (notaFinal) {
          console.log(`  ✓ Nota final en escala 0-20: ${notaFinal.nota_final_en_20}`);
        }
      } catch (err) {
        console.error(`  ❌ Error: ${err.message}`);
      }
      console.log('');
    }

    // Verificar resultados
    console.log('\n📈 VERIFICANDO RESULTADOS:\n');
    const [stats] = await conn.query(`
      SELECT 
        COUNT(*) as total_calificaciones,
        COUNT(DISTINCT id_matricula) as estudiantes,
        COUNT(DISTINCT id_seccion) as secciones,
        ROUND(AVG(nota_final_en_20), 2) as promedio,
        MIN(nota_final_en_20) as minima,
        MAX(nota_final_en_20) as maxima
      FROM calificaciones_finales
    `);

    console.log(`  Total calificaciones finales: ${stats[0].total_calificaciones}`);
    console.log(`  Estudiantes procesados: ${stats[0].estudiantes}`);
    console.log(`  Secciones: ${stats[0].secciones}`);
    console.log(`  Promedio general: ${stats[0].promedio}`);
    console.log(`  Nota mínima: ${stats[0].minima}`);
    console.log(`  Nota máxima: ${stats[0].maxima}`);

    console.log('\n✅ RECALCULACIÓN COMPLETADA\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    conn.release();
  }
}

recalcularCalificaciones();
