import { pool as db } from './src/config/database.js';

async function insertarDatosPrueba() {
  const connection = await db.getConnection();
  
  try {
    console.log('Iniciando inserción de datos de prueba...');
    
    // Insertar temas
    const temasSQL = `
      INSERT INTO foro_temas (id_seccion, id_usuario, titulo, descripcion, fecha_creacion) VALUES
      (1, 1, '¿Cómo elaboraron el presupuesto mensual?', 'En este tema podemos discutir y compartir diferentes enfoques para elaborar un presupuesto mensual efectivo. ¿Qué metodologías utilizan?', NOW()),
      (1, 3, 'Ideas para el proyecto social grupal', 'Aquí podemos compartir ideas innovadoras para nuestro proyecto social grupal. Se aceptan todas las propuestas que cumplan con los criterios del curso.', DATE_SUB(NOW(), INTERVAL 30 MINUTE)),
      (1, 4, 'Recomendaciones para el examen de Contabilidad', 'En este hilo compilamos tips, recursos y recomendaciones de estudio para prepararse bien para el examen.', DATE_SUB(NOW(), INTERVAL 1 HOUR)),
      (2, 1, 'Guía de estudio para el Examen Final de Marketing', 'Documento con los temas más importantes y preguntas frecuentes para el examen final. Comparte tus apuntes aquí.', DATE_SUB(NOW(), INTERVAL 2 HOUR)),
      (2, 3, '¿Alguien sabe cómo usar BUSCARV en Excel?', 'Tengo dudas sobre cómo implementar BUSCARV en mis análisis de datos. ¿Quién puede ayudar con ejemplos prácticos?', DATE_SUB(NOW(), INTERVAL 4 HOUR))
    `;
    
    await connection.query(temasSQL);
    console.log('✅ 5 temas insertados');
    
    // Insertar respuestas
    const respuestasSQL = `
      INSERT INTO foro_respuestas (id_tema, id_usuario, contenido, fecha_creacion) VALUES
      (1, 3, 'Excelente pregunta. En mi experiencia, el presupuesto mensual debe comenzar con un análisis detallado de los ingresos esperados.', NOW()),
      (1, 4, 'Yo recomiendo usar la regla 50-30-20: 50% necesidades, 30% gustos, 20% ahorro. Ha funcionado bien para muchas personas.', DATE_SUB(NOW(), INTERVAL 15 MINUTE)),
      (2, 1, 'Me gustaría proponer un proyecto enfocado en educación ambiental. Podríamos crear talleres para comunidades sobre reciclaje.', DATE_SUB(NOW(), INTERVAL 20 MINUTE)),
      (2, 4, 'La idea de educación ambiental es genial. ¿Y si sumamos un componente de tecnología para hacer seguimiento de residuos?', DATE_SUB(NOW(), INTERVAL 10 MINUTE)),
      (3, 4, 'Recomiendo estudiar bien los asientos contables y hacer muchos ejercicios prácticos. El Prof. siempre pregunta sobre movimientos.', DATE_SUB(NOW(), INTERVAL 45 MINUTE)),
      (4, 1, 'He preparado un resumen con los temas principales. Mañana lo comparto con el grupo.', DATE_SUB(NOW(), INTERVAL 1 HOUR))
    `;
    
    await connection.query(respuestasSQL);
    console.log('✅ 6 respuestas insertadas');
    
    // Verificar datos
    const [temas] = await connection.query('SELECT COUNT(*) as total FROM foro_temas');
    const [respuestas] = await connection.query('SELECT COUNT(*) as total FROM foro_respuestas');
    
    console.log(`\n✅ Total de temas: ${temas[0].total}`);
    console.log(`✅ Total de respuestas: ${respuestas[0].total}`);
    console.log('\n✅ ¡Datos de prueba insertados correctamente!');
    
  } catch (error) {
    console.error('❌ Error al insertar datos:', error.message);
    throw error;
  } finally {
    connection.release();
    await db.end();
  }
}

insertarDatosPrueba().catch(err => {
  console.error('Error fatal:', err);
  process.exit(1);
});
