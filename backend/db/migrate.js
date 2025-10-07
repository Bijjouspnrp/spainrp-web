const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Función para migrar la base de datos
function migrateDatabase() {
  return new Promise((resolve, reject) => {
    const dbPath = path.join(__dirname, '..', 'spainrp.db');
    const db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('[MIGRATION] Error abriendo base de datos:', err);
        reject(err);
        return;
      }
      console.log('[MIGRATION] Conectado a la base de datos para migración');
    });

    // Verificar si la tabla ip_tracking existe
    db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='ip_tracking'", (err, row) => {
      if (err) {
        console.error('[MIGRATION] Error verificando tabla:', err);
        reject(err);
        return;
      }

      if (!row) {
        console.log('[MIGRATION] Tabla ip_tracking no existe, creándola...');
        createTable();
      } else {
        console.log('[MIGRATION] Tabla ip_tracking existe, verificando columnas...');
        checkColumns();
      }
    });

    // Verificar si la tabla roblox_auth existe
    db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='roblox_auth'", (err, row) => {
      if (err) {
        console.error('[MIGRATION] Error verificando tabla roblox_auth:', err);
        return;
      }

      if (!row) {
        console.log('[MIGRATION] Tabla roblox_auth no existe, creándola...');
        createRobloxAuthTable();
      } else {
        console.log('[MIGRATION] Tabla roblox_auth ya existe');
      }
    });

    function createTable() {
      const createTableSQL = `
        CREATE TABLE IF NOT EXISTS ip_tracking (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          ip TEXT NOT NULL,
          userId TEXT,
          username TEXT,
          discriminator TEXT,
          avatar TEXT,
          userAgent TEXT,
          browser TEXT,
          os TEXT,
          device TEXT,
          country TEXT,
          countryCode TEXT,
          city TEXT,
          region TEXT,
          timezone TEXT,
          latitude REAL,
          longitude REAL,
          isp TEXT,
          firstSeen TEXT,
          lastSeen TEXT,
          visitCount INTEGER DEFAULT 1,
          isActive INTEGER DEFAULT 1,
          UNIQUE(ip)
        )
      `;

      db.run(createTableSQL, (err) => {
        if (err) {
          console.error('[MIGRATION] Error creando tabla:', err);
          reject(err);
        } else {
          console.log('[MIGRATION] ✅ Tabla ip_tracking creada correctamente');
          resolve();
        }
      });
    }

    function checkColumns() {
      // Obtener información de las columnas existentes
      db.all("PRAGMA table_info(ip_tracking)", (err, columns) => {
        if (err) {
          console.error('[MIGRATION] Error obteniendo información de columnas:', err);
          reject(err);
          return;
        }

        const existingColumns = columns.map(col => col.name);
        console.log('[MIGRATION] Columnas existentes:', existingColumns);

        // Columnas que necesitamos agregar
        const requiredColumns = [
          { name: 'browser', type: 'TEXT' },
          { name: 'os', type: 'TEXT' },
          { name: 'device', type: 'TEXT' },
          { name: 'countryCode', type: 'TEXT' },
          { name: 'region', type: 'TEXT' },
          { name: 'timezone', type: 'TEXT' },
          { name: 'latitude', type: 'REAL' },
          { name: 'longitude', type: 'REAL' },
          { name: 'isp', type: 'TEXT' }
        ];

        const columnsToAdd = requiredColumns.filter(col => !existingColumns.includes(col.name));
        
        if (columnsToAdd.length === 0) {
          console.log('[MIGRATION] ✅ Todas las columnas necesarias ya existen');
          resolve();
          return;
        }

        console.log('[MIGRATION] Columnas a agregar:', columnsToAdd.map(col => col.name));
        addColumns(columnsToAdd);
      });
    }

    function addColumns(columnsToAdd) {
      let completed = 0;
      const total = columnsToAdd.length;

      columnsToAdd.forEach(column => {
        const alterSQL = `ALTER TABLE ip_tracking ADD COLUMN ${column.name} ${column.type}`;
        
        db.run(alterSQL, (err) => {
          if (err) {
            console.error(`[MIGRATION] Error agregando columna ${column.name}:`, err);
            // Continuar con las demás columnas aunque una falle
          } else {
            console.log(`[MIGRATION] ✅ Columna ${column.name} agregada correctamente`);
          }
          
          completed++;
          if (completed === total) {
            console.log('[MIGRATION] ✅ Migración completada');
            resolve();
          }
        });
      });
    }

    function createRobloxAuthTable() {
      const createRobloxAuthSQL = `
        CREATE TABLE IF NOT EXISTS roblox_auth (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          discord_user_id TEXT NOT NULL UNIQUE,
          roblox_user_id TEXT NOT NULL,
          roblox_username TEXT NOT NULL,
          roblox_display_name TEXT,
          roblox_avatar TEXT,
          pin_hash TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          last_access DATETIME
        )
      `;

      db.run(createRobloxAuthSQL, (err) => {
        if (err) {
          console.error('[MIGRATION] Error creando tabla roblox_auth:', err);
        } else {
          console.log('[MIGRATION] ✅ Tabla roblox_auth creada correctamente');
        }
      });
    }
  });
}

// Ejecutar migración si se llama directamente
if (require.main === module) {
  migrateDatabase()
    .then(() => {
      console.log('[MIGRATION] ✅ Migración exitosa');
      process.exit(0);
    })
    .catch((err) => {
      console.error('[MIGRATION] ❌ Error en migración:', err);
      process.exit(1);
    });
}

module.exports = { migrateDatabase };
