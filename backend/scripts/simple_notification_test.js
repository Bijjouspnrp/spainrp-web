#!/usr/bin/env node

/**
 * Script simple para probar el sistema de notificaciones
 */

const { getDatabase } = require('../db/database');

async function simpleNotificationTest() {
  const db = getDatabase();
  
  console.log('🧪 Prueba simple del sistema de notificaciones...');
  
  try {
    // 1. Verificar estructura
    console.log('📋 Verificando estructura...');
    const columns = await new Promise((resolve, reject) => {
      db.all("PRAGMA table_info(notifications)", (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
    
    console.log('📋 Columnas:', columns.map(col => col.name));
    
    // 2. Insertar notificación simple
    console.log('📝 Insertando notificación...');
    const result = await new Promise((resolve, reject) => {
      db.run(`
        INSERT INTO notifications (user_id, title, message, type, priority, read, createdAt)
        VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      `, ['test-123', 'Test', 'Test message', 'info', 'normal', 0], function(err) {
        if (err) reject(err);
        else resolve({ id: this.lastID, changes: this.changes });
      });
    });
    
    console.log('✅ Insertado:', result);
    
    // 3. Leer notificación
    console.log('📖 Leyendo notificación...');
    const notification = await new Promise((resolve, reject) => {
      db.get("SELECT * FROM notifications WHERE id = ?", [result.id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    
    console.log('📖 Leído:', notification);
    
    // 4. Verificar campos
    const hasPriority = notification && notification.priority !== undefined;
    const hasCreatedAt = notification && notification.createdAt !== undefined;
    
    console.log(`📊 Campos:
    - priority: ${hasPriority ? '✅' : '❌'}
    - createdAt: ${hasCreatedAt ? '✅' : '❌'}`);
    
    // 5. Limpiar
    console.log('🧹 Limpiando...');
    await new Promise((resolve, reject) => {
      db.run("DELETE FROM notifications WHERE user_id = 'test-123'", (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    
    console.log('✅ Limpieza completada');
    
    if (hasPriority && hasCreatedAt) {
      console.log('🎉 ¡Sistema de notificaciones funcionando correctamente!');
    } else {
      console.log('❌ Problemas detectados en el sistema');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

simpleNotificationTest();
