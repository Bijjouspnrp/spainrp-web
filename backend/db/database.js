const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Crear conexión centralizada a la base de datos
const dbPath = path.join(__dirname, '..', 'spainrp.db');
let db = null;

// Función para obtener la conexión de base de datos
const getDatabase = () => {
  if (!db) {
    db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('[DATABASE] Error abriendo base de datos:', err);
      } else {
        console.log('[DATABASE] Base de datos conectada correctamente');
        
        // Configurar optimizaciones de rendimiento
        db.run("PRAGMA busy_timeout=30000");
        db.run("PRAGMA journal_mode=WAL");
        db.run("PRAGMA synchronous=NORMAL");
        db.run("PRAGMA cache_size=1000");
        db.run("PRAGMA temp_store=MEMORY");
        db.run("PRAGMA foreign_keys=ON");
        
        console.log('[DATABASE] Optimizaciones SQLite aplicadas');
      }
    });
  }
  return db;
};

// Función para cerrar la conexión (útil para tests)
const closeDatabase = () => {
  if (db) {
    db.close((err) => {
      if (err) {
        console.error('[DATABASE] Error cerrando base de datos:', err);
      } else {
        console.log('[DATABASE] Base de datos cerrada correctamente');
        db = null;
      }
    });
  }
};

// Función para ejecutar queries de forma segura
const runQuery = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    const database = getDatabase();
    database.run(sql, params, function(err) {
      if (err) {
        console.error('[DATABASE] Error ejecutando query:', err);
        reject(err);
      } else {
        resolve({ id: this.lastID, changes: this.changes });
      }
    });
  });
};

// Función para obtener un registro
const getQuery = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    const database = getDatabase();
    database.get(sql, params, (err, row) => {
      if (err) {
        console.error('[DATABASE] Error obteniendo registro:', err);
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
};

// Función para obtener múltiples registros
const allQuery = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    const database = getDatabase();
    database.all(sql, params, (err, rows) => {
      if (err) {
        console.error('[DATABASE] Error obteniendo registros:', err);
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
};

module.exports = {
  getDatabase,
  closeDatabase,
  runQuery,
  getQuery,
  allQuery
};
