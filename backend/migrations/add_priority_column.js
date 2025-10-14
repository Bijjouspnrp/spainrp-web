const { getDatabase } = require('../db/database');

/**
 * Migración para agregar la columna priority a la tabla notifications
 * Esta migración es segura y puede ejecutarse múltiples veces
 */
async function addPriorityColumn() {
  const db = getDatabase();
  
  try {
    console.log('[MIGRATION] 🔍 Verificando si la columna priority existe...');
    
    // Verificar si la columna priority existe
    const columns = await new Promise((resolve, reject) => {
      db.all("PRAGMA table_info(notifications)", (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
    
    console.log('[MIGRATION] 📋 Columnas actuales de la tabla notifications:', columns.map(col => col.name));
    
    const hasPriorityColumn = columns.some(col => col.name === 'priority');
    
    if (hasPriorityColumn) {
      console.log('[MIGRATION] ✅ La columna priority ya existe, no es necesario migrar');
      return { success: true, message: 'Columna priority ya existe' };
    }
    
    console.log('[MIGRATION] 🔧 Agregando columna priority...');
    
    // Agregar la columna priority
    await new Promise((resolve, reject) => {
      db.run(`ALTER TABLE notifications ADD COLUMN priority TEXT DEFAULT 'normal'`, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
    
    console.log('[MIGRATION] ✅ Columna priority agregada exitosamente');
    
    // Actualizar registros existentes que no tengan priority
    await new Promise((resolve, reject) => {
      db.run(`UPDATE notifications SET priority = 'normal' WHERE priority IS NULL`, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
    
    console.log('[MIGRATION] ✅ Registros existentes actualizados con priority = normal');
    
    return { success: true, message: 'Migración completada exitosamente' };
    
  } catch (error) {
    console.error('[MIGRATION] ❌ Error en la migración:', error);
    return { success: false, error: error.message };
  }
}

module.exports = { addPriorityColumn };
