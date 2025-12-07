import { pool } from './src/config/database.js';

const [respuestas] = await pool.query('SELECT id_respuesta, id_matricula, id_actividad, puntaje_obtenido FROM respuestas_alumnos LIMIT 1');
if (respuestas.length > 0) {
    console.log('Respuesta encontrada:', JSON.stringify(respuestas[0], null, 2));
} else {
    console.log('No hay respuestas');
}
process.exit(0);
