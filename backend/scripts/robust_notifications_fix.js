#!/usr/bin/env node

/**
 * Script robusto para reparar el esquema de notificaciones
 * Maneja ejecuciones múltiples y condiciones de carrera
 */

const { getDatabase } = require('../db/database');

async function robustNotificationsFix() {
  const db = getDatabase();
  
  console.log('[ROBUST-FIX] 🔧 Iniciando reparación robusta del esquema de notificaciones...');
  
  try {
    // 1. Verificar si la tabla existe
    console.log('[ROBUST-FIX] 📋 Verificando existencia de la tabla...');
    const tableExists = await new Promise((resolve, reject) => {
      db.get(`
        SELECT name FROM sqlite_master 
        WHERE type='table' AND name='notifications'
      `, (err, row) => {
        if (err) reject(err);
        else resolve(!!row);
      });
    });
    
    if (!tableExists) {
      console.log('[ROBUST-FIX] ❌ La tabla notifications no existe');
      return { success: false, error: 'Tabla notifications no existe' };
    }
    
    console.log('[ROBUST-FIX] ✅ Tabla notifications existe');
    
    // 2. Verificar estructura actual
    console.log('[ROBUST-FIX] 📋 Verificando estructura actual...');
    const columns = await new Promise((resolve, reject) => {
      db.all("PRAGMA table_info(notifications)", (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
    
    console.log('[ROBUST-FIX] 📋 Columnas encontradas:', columns.map(col => col.name));
    
    // 3. Verificar columnas requeridas
    const hasPriority = columns.some(col => col.name === 'priority');
    const hasCreatedAt = columns.some(col => col.name === 'createdAt');
    const hasId = columns.some(col => col.name === 'id' && col.pk);
    
    console.log(`[ROBUST-FIX] 📊 Estado de columnas:
    - id (PRIMARY KEY): ${hasId ? '✅' : '❌'}
    - priority: ${hasPriority ? '✅' : '❌'}
    - createdAt: ${hasCreatedAt ? '✅' : '❌'}`);
    
    // 4. Agregar columnas faltantes de forma segura
    const fixes = [];
    
    if (!hasPriority) {
      console.log('[ROBUST-FIX] 🔧 Agregando columna priority...');
      try {
        await new Promise((resolve, reject) => {
          db.run(`ALTER TABLE notifications ADD COLUMN priority TEXT DEFAULT 'normal'`, (err) => {
            if (err) {
              if (err.message.includes('duplicate column name')) {
                console.log('[ROBUST-FIX] ✅ Columna priority ya existe (duplicate column error)');
                resolve();
              } else {
                reject(err);
              }
            } else {
              resolve();
            }
          });
        });
        console.log('[ROBUST-FIX] ✅ Columna priority agregada');
        fixes.push('priority');
      } catch (error) {
        if (error.message.includes('duplicate column name')) {
          console.log('[ROBUST-FIX] ✅ Columna priority ya existe (catch)');
        } else {
          console.error('[ROBUST-FIX] ❌ Error agregando priority:', error.message);
          throw error;
        }
      }
    } else {
      console.log('[ROBUST-FIX] ✅ Columna priority ya existe');
    }
    
    if (!hasCreatedAt) {
      console.log('[ROBUST-FIX] 🔧 Agregando columna createdAt...');
      try {
        await new Promise((resolve, reject) => {
          db.run(`ALTER TABLE notifications ADD COLUMN createdAt DATETIME DEFAULT CURRENT_TIMESTAMP`, (err) => {
            if (err) {
              if (err.message.includes('duplicate column name')) {
                console.log('[ROBUST-FIX] ✅ Columna createdAt ya existe (duplicate column error)');
                resolve();
              } else {
                reject(err);
              }
            } else {
              resolve();
            }
          });
        });
        console.log('[ROBUST-FIX] ✅ Columna createdAt agregada');
        fixes.push('createdAt');
      } catch (error) {
        if (error.message.includes('duplicate column name')) {
          console.log('[ROBUST-FIX] ✅ Columna createdAt ya existe (catch)');
        } else {
          console.error('[ROBUST-FIX] ❌ Error agregando createdAt:', error.message);
          throw error;
        }
      }
    } else {
      console.log('[ROBUST-FIX] ✅ Columna createdAt ya existe');
    }
    
    // 5. Verificar estructura final
    console.log('[ROBUST-FIX] 🔍 Verificando estructura final...');
    const finalColumns = await new Promise((resolve, reject) => {
      db.all("PRAGMA table_info(notifications)", (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
    
    const finalHasPriority = finalColumns.some(col => col.name === 'priority');
    const finalHasCreatedAt = finalColumns.some(col => col.name === 'createdAt');
    const finalHasId = finalColumns.some(col => col.name === 'id' && col.pk);
    
    console.log(`[ROBUST-FIX] 📊 Estado final:
    - id (PRIMARY KEY): ${finalHasId ? '✅' : '❌'}
    - priority: ${finalHasPriority ? '✅' : '❌'}
    - createdAt: ${finalHasCreatedAt ? '✅' : '❌'}`);
    
    // 6. Probar funcionalidad
    console.log('[ROBUST-FIX] 🧪 Probando funcionalidad...');
    const testId = 'test-robust-' + Date.now();
    
    try {
      // Insertar registro de prueba
      const insertResult = await new Promise((resolve, reject) => {
        db.run(`
          INSERT INTO notifications (user_id, title, message, type, priority, read, createdAt)
          VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        `, [testId, 'Test Robust', 'Test message', 'info', 'normal', 0], function(err) {
          if (err) reject(err);
          else resolve({ id: this.lastID, changes: this.changes });
        });
      });
      
      console.log('[ROBUST-FIX] ✅ Inserción de prueba exitosa:', insertResult);
      
      // Leer registro insertado
      const testRecord = await new Promise((resolve, reject) => {
        db.get("SELECT * FROM notifications WHERE user_id = ?", [testId], (err, row) => {
          if (err) reject(err);
          else resolve(row);
        });
      });
      
      console.log('[ROBUST-FIX] 📖 Registro de prueba leído:', testRecord);
      
      // Limpiar registro de prueba
      await new Promise((resolve, reject) => {
        db.run("DELETE FROM notifications WHERE user_id = ?", [testId], (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
      
      console.log('[ROBUST-FIX] ✅ Limpieza completada');
      
    } catch (testError) {
      console.error('[ROBUST-FIX] ❌ Error en prueba de funcionalidad:', testError.message);
      throw testError;
    }
    
    // 7. Resumen
    const allColumnsPresent = finalHasId && finalHasPriority && finalHasCreatedAt;
    
    if (allColumnsPresent) {
      console.log('[ROBUST-FIX] 🎉 ¡Reparación robusta completada exitosamente!');
      console.log(`[ROBUST-FIX] 📊 Columnas agregadas: ${fixes.length > 0 ? fixes.join(', ') : 'Ninguna (ya existían)'}`);
      return { 
        success: true, 
        message: 'Esquema de notificaciones reparado correctamente',
        fixes: fixes
      };
    } else {
      console.log('[ROBUST-FIX] ❌ La reparación no fue completamente exitosa');
      return { 
        success: false, 
        error: 'Algunas columnas no se pudieron agregar correctamente' 
      };
    }
    
  } catch (error) {
    console.error('[ROBUST-FIX] ❌ Error durante la reparación robusta:', error);
    return { success: false, error: error.message };
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  robustNotificationsFix()
    .then(result => {
      if (result.success) {
        console.log('[ROBUST-FIX] ✅ Reparación completada:', result.message);
        process.exit(0);
      } else {
        console.error('[ROBUST-FIX] ❌ Error en reparación:', result.error);
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('[ROBUST-FIX] ❌ Error:', error);
      process.exit(1);
    });
}

module.exports = { robustNotificationsFix };
