// Debug script para verificar por qué las colecciones no aparecen
// Agregar este código en la consola del navegador

console.log('🔍 Debuggeando colecciones...');

// 1. Verificar localStorage
function checkLocalStorage() {
  console.log('📦 Verificando localStorage...');
  const token = localStorage.getItem('authToken');
  const refreshToken = localStorage.getItem('refreshToken');
  const user = localStorage.getItem('user');
  
  console.log('Token:', token ? '✅ Presente' : '❌ Ausente');
  console.log('Refresh Token:', refreshToken ? '✅ Presente' : '❌ Ausente');
  console.log('User:', user ? '✅ Presente' : '❌ Ausente');
  
  if (user) {
    try {
      const userData = JSON.parse(user);
      console.log('User data:', userData);
    } catch (e) {
      console.log('❌ Error parsing user data');
    }
  }
}

// 2. Verificar llamadas de red
function checkNetworkRequests() {
  console.log('🌐 Monitoreando llamadas de red...');
  
  // Override fetch para loggear todas las llamadas
  const originalFetch = window.fetch;
  window.fetch = function(...args) {
    console.log('📡 Fetch call:', args[0], args[1]);
    return originalFetch.apply(this, args)
      .then(response => {
        console.log('📡 Response:', response.status, response.url);
        return response;
      })
      .catch(error => {
        console.log('📡 Fetch error:', error);
        throw error;
      });
  };
  
  console.log('✅ Fetch interceptor activado. Ahora intenta crear una colección.');
}

// 3. Verificar estado de React
function checkReactState() {
  console.log('⚛️ Para verificar estado de React:');
  console.log('1. Abre React DevTools');
  console.log('2. Busca el componente que lista las colecciones');
  console.log('3. Verifica si el estado contiene las colecciones');
  console.log('4. Verifica si useQuery está ejecutándose');
}

// 4. Test directo de API
async function testAPI() {
  console.log('🧪 Testeando API directamente...');
  
  const token = localStorage.getItem('authToken');
  if (!token) {
    console.log('❌ No hay token de autenticación');
    return;
  }

  try {
    // Test crear colección
    console.log('📝 Creando colección de prueba...');
    const createResponse = await fetch('http://localhost:3000/collections', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title: 'Test Debug Collection',
        description: 'Colección creada para debug',
        goalAmount: 500,
        ruleType: 'GOAL_ONLY',
        isPrivate: false
      })
    });

    if (createResponse.ok) {
      const newCollection = await createResponse.json();
      console.log('✅ Colección creada:', newCollection);
      
      // Test obtener colecciones
      console.log('📋 Obteniendo lista de colecciones...');
      const listResponse = await fetch('http://localhost:3000/collections', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (listResponse.ok) {
        const collections = await listResponse.json();
        console.log('✅ Colecciones obtenidas:', collections);
        
        if (collections.data && collections.data.length > 0) {
          console.log('🎉 ¡El backend SÍ tiene colecciones!');
          console.log('🤔 El problema está en el frontend - no está mostrando los datos');
        } else {
          console.log('🤔 El backend no devuelve colecciones');
        }
      } else {
        console.log('❌ Error obteniendo colecciones:', listResponse.status);
      }
    } else {
      console.log('❌ Error creando colección:', createResponse.status);
      const error = await createResponse.text();
      console.log('Error details:', error);
    }
  } catch (error) {
    console.log('❌ Error de red:', error);
  }
}

// Ejecutar todos los checks
async function runDebug() {
  console.log('🚀 Iniciando debug de colecciones...\n');
  
  checkLocalStorage();
  console.log('\n');
  
  await testAPI();
  console.log('\n');
  
  checkNetworkRequests();
  console.log('\n');
  
  checkReactState();
  
  console.log('\n🔧 Si las colecciones se crean pero no aparecen:');
  console.log('1. Verifica que el componente use useQuery o similar');
  console.log('2. Verifica que se esté llamando al endpoint correcto');
  console.log('3. Verifica que los datos se estén mapeando correctamente');
  console.log('4. Verifica que no haya errores en la consola de React');
}

// Ejecutar
runDebug();