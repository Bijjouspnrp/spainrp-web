#!/usr/bin/env node

/**
 * Script de diagnóstico para el sistema de notificaciones
 */

const { getDatabase } = require('../db/database');

async function diagnoseNotifications() {
  const db = getDatabase();
  
  console.log('🔍 Diagnóstico del sistema de notificaciones...');
  
  try {
    // 1. Verificar si la tabla existe
    console.log('📋 Verificando existencia de la tabla...');
    const tableExists = await new Promise((resolve, reject) => {
      db.get(`
        SELECT name FROM sqlite_master 
        WHERE type='table' AND name='notifications'
      `, (err, row) => {
        if (err) reject(err);
        else resolve(!!row);
      });
    });
    
    console.log(`📋 Tabla notifications existe: ${tableExists ? '✅' : '❌'}`);
    
    if (!tableExists) {
      console.log('❌ La tabla notifications no existe');
      return;
    }
    
    // 2. Verificar estructura
    console.log('📋 Verificando estructura de la tabla...');
    const columns = await new Promise((resolve, reject) => {
      db.all("PRAGMA table_info(notifications)", (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
    
    console.log('📋 Columnas encontradas:');
    columns.forEach(col => {
      console.log(`  - ${col.name} (${col.type}) ${col.notnull ? 'NOT NULL' : 'NULL'} ${col.dflt_value ? `DEFAULT ${col.dflt_value}` : ''}`);
    });
    
    // 3. Contar registros
    console.log('📊 Contando registros...');
    const count = await new Promise((resolve, reject) => {
      db.get("SELECT COUNT(*) as count FROM notifications", (err, row) => {
        if (err) reject(err);
        else resolve(row.count);
      });
    });
    
    console.log(`📊 Total de registros: ${count}`);
    
    // 4. Mostrar algunos registros
    if (count > 0) {
      console.log('📖 Mostrando registros existentes...');
      const records = await new Promise((resolve, reject) => {
        db.all("SELECT * FROM notifications LIMIT 3", (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        });
      });
      
      records.forEach((record, index) => {
        console.log(`📖 Registro ${index + 1}:`, record);
      });
    }
    
    // 5. Probar inserción
    console.log('📝 Probando inserción...');
    const testId = 'test-' + Date.now();
    
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
    
    // 6. Leer el registro insertado
    console.log('📖 Leyendo registro insertado...');
    const insertedRecord = await new Promise((resolve, reject) => {
      db.get("SELECT * FROM notifications WHERE id = ?", [insertResult.id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    
    console.log('📖 Registro leído:', insertedRecord);
    
    // 7. Verificar campos específicos
    if (insertedRecord) {
      console.log('🔍 Verificando campos específicos:');
      console.log(`  - id: ${insertedRecord.id ? '✅' : '❌'}`);
      console.log(`  - user_id: ${insertedRecord.user_id ? '✅' : '❌'}`);
      console.log(`  - title: ${insertedRecord.title ? '✅' : '❌'}`);
      console.log(`  - message: ${insertedRecord.message ? '✅' : '❌'}`);
      console.log(`  - type: ${insertedRecord.type ? '✅' : '❌'}`);
      console.log(`  - priority: ${insertedRecord.priority ? '✅' : '❌'}`);
      console.log(`  - read: ${insertedRecord.read !== undefined ? '✅' : '❌'}`);
      console.log(`  - createdAt: ${insertedRecord.createdAt ? '✅' : '❌'}`);
    } else {
      console.log('❌ No se pudo leer el registro insertado');
    }
    
    // 8. Limpiar registro de prueba
    console.log('🧹 Limpiando registro de prueba...');
    await new Promise((resolve, reject) => {
      db.run("DELETE FROM notifications WHERE user_id = ?", [testId], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    
    console.log('✅ Limpieza completada');
    
    // 9. Resumen
    console.log('\n📊 RESUMEN DEL DIAGNÓSTICO:');
    console.log(`- Tabla existe: ${tableExists ? '✅' : '❌'}`);
    console.log(`- Columnas: ${columns.length}`);
    console.log(`- Registros: ${count}`);
    console.log(`- Inserción: ${insertResult ? '✅' : '❌'}`);
    console.log(`- Lectura: ${insertedRecord ? '✅' : '❌'}`);
    
    if (insertedRecord && insertedRecord.priority && insertedRecord.createdAt) {
      console.log('🎉 ¡Sistema de notificaciones funcionando correctamente!');
    } else {
      console.log('❌ Problemas detectados en el sistema');
    }
    
  } catch (error) {
    console.error('❌ Error durante el diagnóstico:', error);
  }
}

diagnoseNotifications();
