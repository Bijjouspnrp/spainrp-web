#!/usr/bin/env node

/**
 * Script para arreglar el esquema de la tabla notifications
 * Ejecutar: node scripts/fix_notifications_schema.js
 */

const { getDatabase } = require('../db/database');

async function fixNotificationsSchema() {
  const db = getDatabase();
  
  console.log('🔧 Iniciando reparación del esquema de notificaciones...');
  
  try {
    // 1. Verificar estructura actual de la tabla
    console.log('📋 Verificando estructura actual de la tabla...');
    const columns = await new Promise((resolve, reject) => {
      db.all("PRAGMA table_info(notifications)", (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
    
    console.log('📋 Columnas actuales:', columns.map(col => `${col.name} (${col.type})`));
    
    // 2. Verificar si faltan columnas
    const hasPriority = columns.some(col => col.name === 'priority');
    const hasCreatedAt = columns.some(col => col.name === 'createdAt');
    
    console.log(`📊 Estado de columnas:
    - priority: ${hasPriority ? '✅ Existe' : '❌ Falta'}
    - createdAt: ${hasCreatedAt ? '✅ Existe' : '❌ Falta'}`);
    
    // 3. Agregar columna priority si no existe
    if (!hasPriority) {
      console.log('🔧 Agregando columna priority...');
      await new Promise((resolve, reject) => {
        db.run(`ALTER TABLE notifications ADD COLUMN priority TEXT DEFAULT 'normal'`, (err) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      });
      console.log('✅ Columna priority agregada');
    } else {
      console.log('✅ Columna priority ya existe');
    }
    
    // 4. Agregar columna createdAt si no existe
    if (!hasCreatedAt) {
      console.log('🔧 Agregando columna createdAt...');
      await new Promise((resolve, reject) => {
        db.run(`ALTER TABLE notifications ADD COLUMN createdAt DATETIME DEFAULT CURRENT_TIMESTAMP`, (err) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      });
      console.log('✅ Columna createdAt agregada');
    } else {
      console.log('✅ Columna createdAt ya existe');
    }
    
    // 5. Actualizar registros existentes
    console.log('🔄 Actualizando registros existentes...');
    
    // Actualizar priority para registros que no la tengan
    await new Promise((resolve, reject) => {
      db.run(`UPDATE notifications SET priority = 'normal' WHERE priority IS NULL`, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
    
    // Actualizar createdAt para registros que no la tengan
    await new Promise((resolve, reject) => {
      db.run(`UPDATE notifications SET createdAt = CURRENT_TIMESTAMP WHERE createdAt IS NULL`, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
    
    console.log('✅ Registros existentes actualizados');
    
    // 6. Verificar estructura final
    console.log('🔍 Verificando estructura final...');
    const finalColumns = await new Promise((resolve, reject) => {
      db.all("PRAGMA table_info(notifications)", (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
    
    console.log('📋 Estructura final:', finalColumns.map(col => `${col.name} (${col.type})`));
    
    // 7. Contar registros
    const count = await new Promise((resolve, reject) => {
      db.get("SELECT COUNT(*) as count FROM notifications", (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row.count);
        }
      });
    });
    
    console.log(`📊 Total de notificaciones: ${count}`);
    
    console.log('🎉 ¡Reparación del esquema completada exitosamente!');
    
  } catch (error) {
    console.error('❌ Error durante la reparación:', error);
    process.exit(1);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  fixNotificationsSchema()
    .then(() => {
      console.log('✅ Script completado');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Error:', error);
      process.exit(1);
    });
}

module.exports = { fixNotificationsSchema };
