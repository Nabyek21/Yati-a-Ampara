#!/usr/bin/env node
/**
 * Script para actualizar ponderaciones a 100%
 * Opción B: Redistribuir los pesos existentes
 * 
 * De: 10% + 30% + 40% = 80%
 * A:  12.5% + 37.5% + 50% = 100%
 */

import { pool } from './src/config/database.js';

async function corregirPonderaciones() {
  const conn = await pool.getConnection();
  try {
    console.log('\n🔧 CORRIGIENDO PONDERACIONES\n');
    console.log('De: Práctica 10% + Examen 30% + Final 40% = 80%');
    console.log('A:  Práctica 12.5% + Examen 37.5% + Final 50% = 100%\n');

    // Actualizar práctica a 12.5%
    const [result1] = await conn.query(`
      UPDATE ponderaciones_seccion 
      SET peso_porcentaje = 12.5,
          fecha_actualizacion = NOW()
      WHERE tipo_evaluacion = 'práctica'
    `);
    console.log(`✅ Práctica actualizado a 12.5% (${result1.affectedRows} secciones)`);

    // Actualizar examen a 37.5%
    const [result2] = await conn.query(`
      UPDATE ponderaciones_seccion 
      SET peso_porcentaje = 37.5,
          fecha_actualizacion = NOW()
      WHERE tipo_evaluacion = 'examen'
    `);
    console.log(`✅ Examen actualizado a 37.5% (${result2.affectedRows} secciones)`);

    // Actualizar examen final a 50%
    const [result3] = await conn.query(`
      UPDATE ponderaciones_seccion 
      SET peso_porcentaje = 50,
          fecha_actualizacion = NOW()
      WHERE tipo_evaluacion = 'examen_final'
    `);
    console.log(`✅ Examen Final actualizado a 50% (${result3.affectedRows} secciones)`);

    // Verificar que las ponderaciones ahora suman 100%
    console.log('\n📊 Verificando sumas:\n');
    const [sumas] = await conn.query(`
      SELECT id_seccion, SUM(peso_porcentaje) as total
      FROM ponderaciones_seccion
      GROUP BY id_seccion
      ORDER BY id_seccion
    `);

    let todasValidas = true;
    sumas.forEach(row => {
      // Comparar con tolerancia de 0.01 (debido a decimales)
      const status = Math.abs(row.total - 100) < 0.01 ? '✅' : '❌';
      console.log(`  ${status} Sección ${row.id_seccion}: ${row.total}%`);
      if (Math.abs(row.total - 100) >= 0.01) todasValidas = false;
    });

    if (todasValidas) {
      console.log('\n✅ PONDERACIONES CORREGIDAS CORRECTAMENTE\n');
      console.log('Próximo paso: Recalcular calificaciones finales');
      console.log('Ejecutar: node recalcular-calificaciones.js\n');
    } else {
      console.log('\n❌ ALGUNAS PONDERACIONES NO SUMAN 100%\n');
      process.exit(1);
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    conn.release();
  }
}

corregirPonderaciones();
