// backend/start-shop-simulator.js
const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Iniciando Simulador de Tienda...');

const shopProcess = spawn('node', ['shop-simulator.js'], {
  cwd: __dirname,
  stdio: 'inherit'
});

shopProcess.on('error', (err) => {
  console.error('❌ Error al iniciar Simulador de Tienda:', err);
});

shopProcess.on('close', (code) => {
  console.log(`📦 Simulador de Tienda terminado con código ${code}`);
});

// Manejar cierre del proceso
process.on('SIGINT', () => {
  console.log('\n🛑 Cerrando Simulador de Tienda...');
  shopProcess.kill('SIGINT');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Cerrando Simulador de Tienda...');
  shopProcess.kill('SIGTERM');
  process.exit(0);
});
