#!/usr/bin/env node

/**
 * Script para verificar que no hay archivos de base de datos en el repositorio
 * Ejecutar antes de cada commit para asegurar seguridad
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔍 Verificando archivos de base de datos en el repositorio...\n');

// Patrones de archivos de base de datos que NO deben estar en Git
const dbPatterns = [
  '*.db',
  '*.sqlite',
  '*.sqlite3',
  '*.db-journal',
  '*.db-wal',
  '*.db-shm'
];

let hasDbFiles = false;
const foundFiles = [];

try {
  // Verificar archivos tracked por Git
  console.log('📋 Verificando archivos tracked por Git...');
  
  for (const pattern of dbPatterns) {
    try {
      const result = execSync(`git ls-files | grep -E "\\.${pattern.replace('*', '')}$"`, { 
        encoding: 'utf8',
        stdio: 'pipe'
      });
      
      if (result.trim()) {
        const files = result.trim().split('\n').filter(f => f);
        foundFiles.push(...files);
        hasDbFiles = true;
      }
    } catch (error) {
      // No hay archivos con este patrón, continuar
    }
  }

  // Verificar archivos en staging area
  console.log('📋 Verificando archivos en staging area...');
  
  try {
    const stagedFiles = execSync('git diff --cached --name-only', { encoding: 'utf8' });
    const stagedList = stagedFiles.trim().split('\n').filter(f => f);
    
    for (const file of stagedList) {
      if (dbPatterns.some(pattern => file.match(pattern.replace('*', '.*')))) {
        foundFiles.push(`(staged) ${file}`);
        hasDbFiles = true;
      }
    }
  } catch (error) {
    // No hay archivos en staging
  }

  // Verificar archivos modificados
  console.log('📋 Verificando archivos modificados...');
  
  try {
    const modifiedFiles = execSync('git diff --name-only', { encoding: 'utf8' });
    const modifiedList = modifiedFiles.trim().split('\n').filter(f => f);
    
    for (const file of modifiedList) {
      if (dbPatterns.some(pattern => file.match(pattern.replace('*', '.*')))) {
        foundFiles.push(`(modified) ${file}`);
        hasDbFiles = true;
      }
    }
  } catch (error) {
    // No hay archivos modificados
  }

  // Resultado
  if (hasDbFiles) {
    console.log('❌ ERROR: Se encontraron archivos de base de datos en el repositorio:');
    foundFiles.forEach(file => console.log(`   - ${file}`));
    console.log('\n🚨 ACCIÓN REQUERIDA:');
    console.log('   1. Elimina estos archivos del repositorio:');
    console.log('      git rm --cached <archivo>');
    console.log('   2. Añádelos al .gitignore si no están');
    console.log('   3. Verifica que estén en .gitignore');
    console.log('\n⚠️  NUNCA subas archivos de base de datos a GitHub o Render');
    process.exit(1);
  } else {
    console.log('✅ OK: No se encontraron archivos de base de datos en el repositorio');
    console.log('✅ El repositorio está seguro para commit');
  }

} catch (error) {
  console.error('❌ Error ejecutando verificación:', error.message);
  process.exit(1);
}
