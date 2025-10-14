#!/usr/bin/env node

/**
 * Script para verificar la integridad de la base de datos
 */

const { getDatabase } = require('../db/database');

async function checkDatabase() {
  const db = getDatabase();
  
  console.log('🔍 Verificando integridad de la base de datos...');
  
  try {
    // 1. Verificar todas las tablas
    console.log('📋 Listando todas las tablas...');
    const tables = await new Promise((resolve, reject) => {
      db.all("SELECT name FROM sqlite_master WHERE type='table'", (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
    
    console.log('📋 Tablas encontradas:', tables.map(t => t.name));
    
    // 2. Verificar tabla notifications específicamente
    console.log('📋 Verificando tabla notifications...');
    const notificationsInfo = await new Promise((resolve, reject) => {
      db.all("PRAGMA table_info(notifications)", (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
    
    console.log('📋 Estructura de notifications:');
    notificationsInfo.forEach(col => {
      console.log(`  - ${col.name}: ${col.type} ${col.notnull ? 'NOT NULL' : 'NULL'} ${col.dflt_value ? `DEFAULT ${col.dflt_value}` : ''}`);
    });
    
    // 3. Contar registros en notifications
    console.log('📊 Contando registros en notifications...');
    const count = await new Promise((resolve, reject) => {
      db.get("SELECT COUNT(*) as count FROM notifications", (err, row) => {
        if (err) reject(err);
        else resolve(row.count);
      });
    });
    
    console.log(`📊 Total de registros: ${count}`);
    
    // 4. Mostrar todos los registros
    if (count > 0) {
      console.log('📖 Mostrando todos los registros...');
      const records = await new Promise((resolve, reject) => {
        db.all("SELECT * FROM notifications", (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        });
      });
      
      records.forEach((record, index) => {
        console.log(`📖 Registro ${index + 1}:`, record);
      });
    }
    
    // 5. Probar inserción y lectura
    console.log('🧪 Probando inserción y lectura...');
    
    const testId = 'test-' + Date.now();
    
    // Insertar
    const insertResult = await new Promise((resolve, reject) => {
      db.run(`
        INSERT INTO notifications (user_id, title, message, type, priority, read, createdAt)
        VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      `, [testId, 'Test Title', 'Test Message', 'info', 'normal', 0], function(err) {
        if (err) reject(err);
        else resolve({ id: this.lastID, changes: this.changes });
      });
    });
    
    console.log('✅ Inserción exitosa:', insertResult);
    
    // Leer usando diferentes métodos
    console.log('📖 Probando lectura con diferentes métodos...');
    
    // Método 1: SELECT con WHERE id
    const record1 = await new Promise((resolve, reject) => {
      db.get("SELECT * FROM notifications WHERE id = ?", [insertResult.id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    
    console.log('📖 Método 1 (WHERE id):', record1);
    
    // Método 2: SELECT con WHERE user_id
    const record2 = await new Promise((resolve, reject) => {
      db.get("SELECT * FROM notifications WHERE user_id = ?", [testId], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    
    console.log('📖 Método 2 (WHERE user_id):', record2);
    
    // Método 3: SELECT todos y filtrar
    const allRecords = await new Promise((resolve, reject) => {
      db.all("SELECT * FROM notifications ORDER BY id DESC LIMIT 5", (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
    
    console.log('📖 Últimos 5 registros:', allRecords);
    
    // Limpiar
    console.log('🧹 Limpiando registro de prueba...');
    await new Promise((resolve, reject) => {
      db.run("DELETE FROM notifications WHERE user_id = ?", [testId], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    
    console.log('✅ Limpieza completada');
    
    console.log('🎉 Verificación completada');
    
  } catch (error) {
    console.error('❌ Error durante la verificación:', error);
  }
}

checkDatabase();
