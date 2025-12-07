import fetch from 'node-fetch';

const API_URL = 'http://localhost:4000/api';

// Mock token (replace with real one for testing)
const TOKEN = 'your-token-here';

async function testCalificacionesService() {
  console.log('🧪 Testing Calificaciones Service Integration...\n');

  // Test 1: Get grades for a student
  console.log('📋 Test 1: obtenerCalificacionesEstudiante');
  try {
    const response = await fetch(`${API_URL}/notas?id_matricula=1`, {
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ SUCCESS: Retrieved grades:', data.length, 'grades found');
      if (data.length > 0) {
        console.log('   Sample grade:', JSON.stringify(data[0], null, 2));
      }
    } else {
      console.log(`❌ FAILED: Status ${response.status}`);
      const error = await response.text();
      console.log('   Error:', error);
    }
  } catch (error) {
    console.log('❌ FAILED:', error.message);
  }

  // Test 2: Get activities
  console.log('\n📋 Test 2: obtenerActividades');
  try {
    const response = await fetch(`${API_URL}/actividades?id_seccion=1`, {
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ SUCCESS: Retrieved activities:', data.length, 'activities found');
      if (data.length > 0) {
        console.log('   Sample activity:', JSON.stringify(data[0], null, 2));
      }
    } else {
      console.log(`❌ FAILED: Status ${response.status}`);
      const error = await response.text();
      console.log('   Error:', error);
    }
  } catch (error) {
    console.log('❌ FAILED:', error.message);
  }

  console.log('\n✅ Service integration test complete!');
}

testCalificacionesService();
