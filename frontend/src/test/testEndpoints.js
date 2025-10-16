// Script para probar endpoints del backend
// Ejecutar en la consola del navegador para verificar conectividad

console.log('🔍 Probando endpoints del backend...');

const API_BASE_URL = 'http://localhost:3000';

// Test 1: Verificar que el backend responde
async function testBackendHealth() {
  try {
    console.log('📡 Test 1: Verificando que el backend responde...');
    const response = await fetch(`${API_BASE_URL}/collections/public`);
    console.log('✅ Backend responde:', response.status, response.statusText);
    const data = await response.json();
    console.log('📦 Respuesta:', data);
    return true;
  } catch (error) {
    console.error('❌ Backend no responde:', error);
    return false;
  }
}

// Test 2: Verificar endpoint de mis colecciones (necesita auth)
async function testMyCollections() {
  try {
    console.log('📡 Test 2: Verificando mis colecciones...');
    const token = localStorage.getItem('authToken');
    if (!token) {
      console.log('⚠️ No hay token de autenticación');
      return false;
    }
    
    const response = await fetch(`${API_BASE_URL}/collections`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Mis colecciones:', response.status, response.statusText);
    const data = await response.json();
    console.log('📦 Respuesta:', data);
    return true;
  } catch (error) {
    console.error('❌ Error obteniendo mis colecciones:', error);
    return false;
  }
}

// Test 3: Crear una colección de prueba
async function testCreateCollection() {
  try {
    console.log('📡 Test 3: Creando colección de prueba...');
    const token = localStorage.getItem('authToken');
    if (!token) {
      console.log('⚠️ No hay token de autenticación');
      return false;
    }

    const testData = {
      title: "Test Collection - " + new Date().toISOString(),
      description: "Colección de prueba creada automáticamente",
      goalAmount: 1000,
      ruleType: "GOAL_ONLY",
      isPrivate: false
    };

    const response = await fetch(`${API_BASE_URL}/collections`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testData)
    });

    console.log('✅ Crear colección:', response.status, response.statusText);
    const data = await response.json();
    console.log('📦 Respuesta:', data);
    return data;
  } catch (error) {
    console.error('❌ Error creando colección:', error);
    return false;
  }
}

// Ejecutar todos los tests
async function runAllTests() {
  console.log('🚀 Iniciando tests de endpoints...\n');
  
  const health = await testBackendHealth();
  if (!health) {
    console.log('❌ Backend no disponible. Verifica que esté corriendo en puerto 3000');
    return;
  }
  
  await testMyCollections();
  const newCollection = await testCreateCollection();
  
  if (newCollection) {
    console.log('\n🎉 Tests completados. Nueva colección ID:', newCollection.id);
    console.log('🔄 Recarga la página para ver si aparece la nueva colección');
  }
}

// Ejecutar
runAllTests();