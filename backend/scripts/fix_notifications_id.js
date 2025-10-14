#!/usr/bin/env node

/**
 * Script para reparar la columna ID de la tabla notifications
 */

const { getDatabase } = require('../db/database');

async function fixNotificationsId() {
  const db = getDatabase();
  
  console.log('🔧 Reparando columna ID de la tabla notifications...');
  
  try {
    // 1. Verificar estructura actual
    console.log('📋 Verificando estructura actual...');
    const columns = await new Promise((resolve, reject) => {
      db.all("PRAGMA table_info(notifications)", (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
    
    console.log('📋 Columnas actuales:', columns.map(col => `${col.name} (${col.type}) ${col.pk ? 'PRIMARY KEY' : ''} ${col.notnull ? 'NOT NULL' : 'NULL'}`));
    
    // 2. Verificar si la columna id está configurada correctamente
    const idColumn = columns.find(col => col.name === 'id');
    if (idColumn && idColumn.pk && idColumn.type === 'INTEGER') {
      console.log('✅ La columna ID ya está configurada correctamente');
      return { success: true, message: 'Columna ID ya está correcta' };
    }
    
    // 3. Crear tabla temporal con estructura correcta
    console.log('🔧 Creando tabla temporal con estructura correcta...');
    await new Promise((resolve, reject) => {
      db.run(`
        CREATE TABLE notifications_temp (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id TEXT,
          title TEXT NOT NULL,
          message TEXT NOT NULL,
          type TEXT DEFAULT 'info',
          priority TEXT DEFAULT 'normal',
          read INTEGER DEFAULT 0,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    
    console.log('✅ Tabla temporal creada');
    
    // 4. Copiar datos existentes
    console.log('📋 Copiando datos existentes...');
    const existingData = await new Promise((resolve, reject) => {
      db.all("SELECT * FROM notifications", (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
    
    console.log(`📊 Datos a copiar: ${existingData.length} registros`);
    
    for (const record of existingData) {
      await new Promise((resolve, reject) => {
        db.run(`
          INSERT INTO notifications_temp (user_id, title, message, type, priority, read, createdAt)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [
          record.user_id,
          record.title,
          record.message,
          record.type,
          record.priority || 'normal',
          record.read || 0,
          record.createdAt || new Date().toISOString()
        ], (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    }
    
    console.log('✅ Datos copiados');
    
    // 5. Eliminar tabla original
    console.log('🗑️ Eliminando tabla original...');
    await new Promise((resolve, reject) => {
      db.run("DROP TABLE notifications", (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    
    console.log('✅ Tabla original eliminada');
    
    // 6. Renombrar tabla temporal
    console.log('🔄 Renombrando tabla temporal...');
    await new Promise((resolve, reject) => {
      db.run("ALTER TABLE notifications_temp RENAME TO notifications", (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    
    console.log('✅ Tabla renombrada');
    
    // 7. Verificar estructura final
    console.log('🔍 Verificando estructura final...');
    const finalColumns = await new Promise((resolve, reject) => {
      db.all("PRAGMA table_info(notifications)", (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
    
    console.log('📋 Estructura final:', finalColumns.map(col => `${col.name} (${col.type}) ${col.pk ? 'PRIMARY KEY' : ''} ${col.notnull ? 'NOT NULL' : 'NULL'}`));
    
    // 8. Probar inserción
    console.log('🧪 Probando inserción...');
    const testResult = await new Promise((resolve, reject) => {
      db.run(`
        INSERT INTO notifications (user_id, title, message, type, priority, read, createdAt)
        VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      `, ['test-repair', 'Test Repair', 'Test message', 'info', 'normal', 0], function(err) {
        if (err) reject(err);
        else resolve({ id: this.lastID, changes: this.changes });
      });
    });
    
    console.log('✅ Inserción de prueba exitosa:', testResult);
    
    // 9. Leer el registro insertado
    const testRecord = await new Promise((resolve, reject) => {
      db.get("SELECT * FROM notifications WHERE id = ?", [testResult.id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    
    console.log('📖 Registro de prueba leído:', testRecord);
    
    // 10. Limpiar registro de prueba
    await new Promise((resolve, reject) => {
      db.run("DELETE FROM notifications WHERE user_id = 'test-repair'", (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    
    console.log('✅ Limpieza completada');
    
    if (testRecord && testRecord.id) {
      console.log('🎉 ¡Reparación de la columna ID completada exitosamente!');
      return { success: true, message: 'Columna ID reparada correctamente' };
    } else {
      console.log('❌ La reparación no funcionó correctamente');
      return { success: false, error: 'La reparación no funcionó' };
    }
    
  } catch (error) {
    console.error('❌ Error durante la reparación:', error);
    return { success: false, error: error.message };
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  fixNotificationsId()
    .then(result => {
      if (result.success) {
        console.log('✅ Reparación completada:', result.message);
        process.exit(0);
      } else {
        console.error('❌ Error en reparación:', result.error);
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('❌ Error:', error);
      process.exit(1);
    });
}

module.exports = { fixNotificationsId };
