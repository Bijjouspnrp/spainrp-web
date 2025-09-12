// Script Node para activar/desactivar modo mantenimiento
const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'maintenance.lock');

const arg = process.argv[2];
if (arg === 'on') {
  fs.writeFileSync(file, 'maintenance');
  console.log('🔴 Modo mantenimiento ACTIVADO');
} else if (arg === 'off') {
  if (fs.existsSync(file)) fs.unlinkSync(file);
  console.log('🟢 Modo mantenimiento DESACTIVADO');
} else {
  console.log('Uso: node maintenance.js on|off');
}