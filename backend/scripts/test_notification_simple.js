#!/usr/bin/env node

/**
 * Script simple para probar notificaciones
 */

const { getDatabase } = require('../db/database');

async function testNotification() {
  const db = getDatabase();
  
  console.log('🧪 Prueba simple de notificaciones...');
  
  try {
    // Insertar
    console.log('📝 Insertando...');
    const result = await new Promise((resolve, reject) => {
      db.run(`
        INSERT INTO notifications (user_id, title, message, type, priority, read, createdAt)
        VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      `, ['test-123', 'Test', 'Message', 'info', 'normal', 0], function(err) {
        if (err) reject(err);
        else resolve({ id: this.lastID, changes: this.changes });
      });
    });
    
    console.log('✅ Insertado:', result);
    
    // Leer
    console.log('📖 Leyendo...');
    const record = await new Promise((resolve, reject) => {
      db.get("SELECT * FROM notifications WHERE id = ?", [result.id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    
    console.log('📖 Leído:', record);
    
    // Limpiar
    console.log('🧹 Limpiando...');
    await new Promise((resolve, reject) => {
      db.run("DELETE FROM notifications WHERE user_id = 'test-123'", (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    
    console.log('✅ Completado');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testNotification();
