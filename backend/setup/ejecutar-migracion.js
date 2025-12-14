import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';

async function ejecutarMigracion() {
  try {
    console.log('\n🔄 Conectando a base de datos yati...\n');

    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'yati'
    });

    console.log('✅ Conectado a base de datos\n');
    console.log('🔄 Ejecutando migración SQL...\n');

    // Leer archivo SQL
    const sqlPath = path.join(process.cwd(), 'database', 'MIGRACION_SISTEMA_PONDERACIONES.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');

    // Dividir por ; pero respetando comentarios
    let statements = sqlContent
      .split(';')
      .map(s => {
        // Remover líneas de comentarios
        return s
          .split('\n')
          .filter(line => !line.trim().startsWith('--'))
          .join('\n')
          .trim();
      })
      .filter(s => s.length > 0);

    let successCount = 0;
    let errorCount = 0;

    // Ejecutar cada statement
    for (const statement of statements) {
      try {
        await connection.query(statement);
        successCount++;
        
        // Mostrar progreso
        if (statement.includes('ALTER TABLE')) {
          console.log(`  ✅ ${statement.substring(0, 60)}...`);
        } else if (statement.includes('CREATE TABLE')) {
          const tableName = statement.match(/CREATE TABLE.*?(\w+)\s*\(/)?.[1] || 'tabla';
          console.log(`  ✅ Tabla creada: ${tableName}`);
        } else if (statement.includes('INSERT')) {
          const tipo = statement.match(/tipo_evaluacion.*?'(\w+)'/)?.[1] || 'tipo';
          console.log(`  ✅ Insertados registros para: ${tipo}`);
        }
      } catch (e) {
        if (e.code === 'ER_DUP_FIELDNAME' || e.code === 'ER_DUP_KEYNAME') {
          console.log(`  ℹ️  Campo/Índice ya existe: ${e.message.substring(0, 40)}...`);
        } else {
          console.error(`  ❌ Error: ${e.message}`);
          errorCount++;
        }
      }
    }

    // Verificación
    console.log('\n═══════════════════════════════════════════════════════════════');
    console.log('🔍 VERIFICACIÓN DE TABLAS CREADAS');
    console.log('═══════════════════════════════════════════════════════════════\n');

    const tables = [
      'tipos_actividad',
      'ponderaciones_seccion',
      'calificaciones_por_tipo',
      'calificaciones_finales',
      'estadisticas_secciones',
      'historial_calificaciones'
    ];

    for (const tableName of tables) {
      try {
        const [result] = await connection.query(`SELECT COUNT(*) as total FROM ${tableName}`);
        console.log(`  ✅ ${tableName}: ${result[0].total} registros`);
      } catch (e) {
        console.log(`  ❌ ${tableName}: No existe`);
      }
    }

    // Verificar modificación en actividades
    try {
      const [columns] = await connection.query(`
        SELECT COLUMN_TYPE FROM information_schema.COLUMNS 
        WHERE TABLE_NAME = 'actividades' AND COLUMN_NAME = 'tipo'
      `);
      if (columns[0]?.COLUMN_TYPE.includes('práctica')) {
        console.log(`  ✅ actividades.tipo: Modificado correctamente`);
      }
    } catch (e) {
      console.log(`  ℹ️  No se pudo verificar actividades.tipo`);
    }

    console.log('\n═══════════════════════════════════════════════════════════════');
    console.log('✅ ¡MIGRACIÓN COMPLETADA!');
    console.log('═══════════════════════════════════════════════════════════════\n');
    
    console.log('📊 Resumen:\n');
    console.log(`  • Statements ejecutados: ${successCount}`);
    if (errorCount > 0) console.log(`  • Errores esperados: ${errorCount}`);
    console.log(`\n🚀 Próximos pasos:\n`);
    console.log(`  1. Reinicia el backend: npm start`);
    console.log(`  2. Prueba las nuevas funcionalidades\n`);

    await connection.end();
    process.exit(0);

  } catch (error) {
    console.error('❌ Error crítico:', error.message);
    console.error('\nDetalles:', error);
    process.exit(1);
  }
}

ejecutarMigracion();
