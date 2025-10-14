#!/usr/bin/env node

/**
 * Script para probar el sistema de notificaciones
 * Ejecutar: node scripts/test_notifications.js
 */

const { getDatabase } = require('../db/database');

async function testNotifications() {
  const db = getDatabase();
  
  console.log('🧪 Iniciando pruebas del sistema de notificaciones...');
  
  try {
    // 1. Verificar estructura de la tabla
    console.log('📋 Verificando estructura de la tabla...');
    const columns = await new Promise((resolve, reject) => {
      db.all("PRAGMA table_info(notifications)", (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
    
    console.log('📋 Columnas disponibles:', columns.map(col => col.name));
    
    // 2. Insertar una notificación de prueba
    console.log('📝 Insertando notificación de prueba...');
    const testNotification = {
      userId: 'test-user-123',
      title: 'Notificación de Prueba',
      message: 'Esta es una notificación de prueba del sistema',
      type: 'info',
      priority: 'normal'
    };
    
    const insertResult = await new Promise((resolve, reject) => {
      db.run(`
        INSERT INTO notifications (user_id, title, message, type, priority, read, createdAt)
        VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      `, [
        testNotification.userId,
        testNotification.title,
        testNotification.message,
        testNotification.type,
        testNotification.priority,
        0
      ], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id: this.lastID, changes: this.changes });
        }
      });
    });
    
    console.log('✅ Notificación insertada:', insertResult);
    
    // 3. Leer la notificación insertada
    console.log('📖 Leyendo notificación insertada...');
    const notification = await new Promise((resolve, reject) => {
      db.get(`
        SELECT * FROM notifications WHERE id = ?
      `, [insertResult.id], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
    
    console.log('📖 Notificación leída:', notification);
    
    if (!notification) {
      throw new Error('No se pudo leer la notificación insertada');
    }
    
    // 4. Verificar que todos los campos están presentes
    const requiredFields = ['id', 'user_id', 'title', 'message', 'type', 'priority', 'read', 'createdAt'];
    const missingFields = requiredFields.filter(field => !(field in notification));
    
    if (missingFields.length === 0) {
      console.log('✅ Todos los campos requeridos están presentes');
    } else {
      console.log('❌ Campos faltantes:', missingFields);
    }
    
    // 5. Probar diferentes tipos de notificaciones
    console.log('🔄 Probando diferentes tipos de notificaciones...');
    
    const testNotifications = [
      {
        userId: 'test-user-456',
        title: 'Notificación de Error',
        message: 'Esta es una notificación de error',
        type: 'error',
        priority: 'high'
      },
      {
        userId: 'test-user-789',
        title: 'Notificación de Advertencia',
        message: 'Esta es una notificación de advertencia',
        type: 'warning',
        priority: 'medium'
      },
      {
        userId: 'test-user-101',
        title: 'Notificación de Éxito',
        message: 'Esta es una notificación de éxito',
        type: 'success',
        priority: 'low'
      }
    ];
    
    for (const notif of testNotifications) {
      const result = await new Promise((resolve, reject) => {
        db.run(`
          INSERT INTO notifications (user_id, title, message, type, priority, read, createdAt)
          VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        `, [
          notif.userId,
          notif.title,
          notif.message,
          notif.type,
          notif.priority,
          0
        ], function(err) {
          if (err) {
            reject(err);
          } else {
            resolve({ id: this.lastID, changes: this.changes });
          }
        });
      });
      
      console.log(`✅ ${notif.type} notification inserted:`, result);
    }
    
    // 6. Contar total de notificaciones
    const totalCount = await new Promise((resolve, reject) => {
      db.get("SELECT COUNT(*) as count FROM notifications", (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row.count);
        }
      });
    });
    
    console.log(`📊 Total de notificaciones en la base de datos: ${totalCount}`);
    
    // 7. Limpiar notificaciones de prueba
    console.log('🧹 Limpiando notificaciones de prueba...');
    await new Promise((resolve, reject) => {
      db.run("DELETE FROM notifications WHERE user_id LIKE 'test-user-%'", (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
    
    console.log('✅ Notificaciones de prueba eliminadas');
    
    console.log('🎉 ¡Todas las pruebas del sistema de notificaciones pasaron exitosamente!');
    
  } catch (error) {
    console.error('❌ Error durante las pruebas:', error);
    process.exit(1);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  testNotifications()
    .then(() => {
      console.log('✅ Pruebas completadas');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Error:', error);
      process.exit(1);
    });
}

module.exports = { testNotifications };
