import fetch from 'node-fetch';

const API_URL = 'http://localhost:4000/api';

async function testDelete() {
  try {
    console.log('Intentando eliminar actividad ID=2...');
    const response = await fetch(`${API_URL}/actividades/2`, {
      method: 'DELETE',
      headers: {
        'Authorization': 'Bearer test',
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testDelete();
