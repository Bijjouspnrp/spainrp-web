#!/usr/bin/env node

/**
 * Script de prueba para la API del Banco
 * Uso: node test-banco-api.js
 */

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

// Configuración
const EXTERNAL_API = process.env.ECONOMIA_API_URL || 'http://37.27.21.91:5021';
const INTERNAL_API = process.env.INTERNAL_API_URL || 'https://spainrp-web-pqog.onrender.com';
const TEST_USER_ID = '710112055985963090'; // Cambia esto por un ID válido

// Colores para la consola
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Función para probar un endpoint
async function testEndpoint(name, url, options = {}) {
  log(`\n🧪 Probando: ${name}`, 'cyan');
  log(`📍 URL: ${url}`, 'blue');
  
  try {
    const startTime = Date.now();
    const response = await fetch(url, options);
    const responseTime = Date.now() - startTime;
    
    const contentType = response.headers.get('content-type') || '';
    const isJson = contentType.includes('application/json');
    
    let data;
    if (isJson) {
      data = await response.json();
    } else {
      const text = await response.text();
      data = { raw: text.substring(0, 200) };
    }
    
    if (response.ok) {
      log(`✅ Éxito (${response.status}) - ${responseTime}ms`, 'green');
      console.log('📦 Respuesta:', JSON.stringify(data, null, 2));
      return { success: true, data, responseTime };
    } else {
      log(`❌ Error (${response.status}) - ${responseTime}ms`, 'red');
      console.log('📦 Respuesta:', JSON.stringify(data, null, 2));
      return { success: false, status: response.status, data, responseTime };
    }
  } catch (error) {
    log(`❌ Excepción: ${error.message}`, 'red');
    return { success: false, error: error.message };
  }
}

// Tests
async function runTests() {
  log('\n═══════════════════════════════════════', 'cyan');
  log('   TEST API BANCO - SPAINRP', 'cyan');
  log('═══════════════════════════════════════\n', 'cyan');
  
  log(`🔧 Configuración:`, 'yellow');
  log(`   API Externa: ${EXTERNAL_API}`, 'blue');
  log(`   API Interna: ${INTERNAL_API}`, 'blue');
  log(`   User ID de prueba: ${TEST_USER_ID}\n`, 'blue');
  
  const results = [];
  
  // Test 1: API Externa - Consultar Saldo
  results.push(await testEndpoint(
    'API Externa - Consultar Saldo',
    `${EXTERNAL_API}/api/proxy/admin/balance/${TEST_USER_ID}`
  ));
  
  // Test 2: API Externa - Alternativa
  results.push(await testEndpoint(
    'API Externa - Consultar Saldo (Alternativa)',
    `${EXTERNAL_API}/api/admin/balance/${TEST_USER_ID}`
  ));
  
  // Test 3: API Interna - GET
  results.push(await testEndpoint(
    'API Interna - Consultar Saldo (GET)',
    `${INTERNAL_API}/api/proxy/balance/${TEST_USER_ID}`
  ));
  
  // Test 4: API Interna - POST
  results.push(await testEndpoint(
    'API Interna - Consultar Saldo (POST)',
    `${INTERNAL_API}/api/proxy/balance`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: TEST_USER_ID })
    }
  ));
  
  // Test 5: API Interna - Admin Proxy
  results.push(await testEndpoint(
    'API Interna - Admin Proxy',
    `${INTERNAL_API}/api/proxy/admin/balance/${TEST_USER_ID}`
  ));
  
  // Resumen
  log('\n═══════════════════════════════════════', 'cyan');
  log('   RESUMEN DE PRUEBAS', 'cyan');
  log('═══════════════════════════════════════\n', 'cyan');
  
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  
  log(`✅ Exitosas: ${successful}`, 'green');
  log(`❌ Fallidas: ${failed}`, failed > 0 ? 'red' : 'green');
  
  results.forEach((result, index) => {
    if (result.success) {
      log(`   ${index + 1}. ✅ - ${result.responseTime}ms`, 'green');
    } else {
      log(`   ${index + 1}. ❌ - ${result.status || result.error}`, 'red');
    }
  });
  
  log('\n💡 Tip: Si la API externa falla, la interna usará datos de fallback', 'yellow');
}

// Ejecutar tests
runTests().catch(console.error);

