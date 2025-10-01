const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Función para inicializar la base de datos
function initializeDatabase() {
  return new Promise((resolve, reject) => {
    const dbPath = path.join(__dirname, '..', 'database.sqlite');
    const db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('[DB INIT] Error abriendo base de datos:', err);
        reject(err);
        return;
      }
      console.log('[DB INIT] Conectado a la base de datos SQLite');
    });

    // Configurar la base de datos
    db.serialize(() => {
      // Configuraciones de rendimiento
      db.run('PRAGMA journal_mode=WAL');
      db.run('PRAGMA synchronous=NORMAL');
      db.run('PRAGMA cache_size=10000');
      db.run('PRAGMA temp_store=memory');
      db.run('PRAGMA foreign_keys=ON');
      db.run('PRAGMA busy_timeout=30000');

      // Crear tablas necesarias
      const tables = [
        {
          name: 'sessions',
          sql: `CREATE TABLE IF NOT EXISTS sessions (
            sessionId TEXT PRIMARY KEY,
            userId TEXT,
            username TEXT,
            avatar TEXT,
            ip TEXT,
            userAgent TEXT,
            lastSeen INTEGER
          )`
        },
        {
          name: 'announcements',
          sql: `CREATE TABLE IF NOT EXISTS announcements (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT,
            body TEXT,
            author TEXT,
            createdAt TEXT,
            updatedAt TEXT
          )`
        },
        {
          name: 'polls',
          sql: `CREATE TABLE IF NOT EXISTS polls (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            question TEXT,
            options TEXT,
            author TEXT,
            createdAt TEXT,
            expiresAt TEXT,
            active INTEGER DEFAULT 1
          )`
        },
        {
          name: 'poll_votes',
          sql: `CREATE TABLE IF NOT EXISTS poll_votes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            pollId INTEGER,
            userId TEXT,
            optionIndex INTEGER,
            createdAt TEXT,
            FOREIGN KEY (pollId) REFERENCES polls (id)
          )`
        },
        {
          name: 'notifications',
          sql: `CREATE TABLE IF NOT EXISTS notifications (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            userId TEXT,
            title TEXT,
            message TEXT,
            type TEXT DEFAULT 'info',
            priority TEXT DEFAULT 'normal',
            read INTEGER DEFAULT 0,
            createdAt TEXT
          )`
        },
        {
          name: 'access_logs',
          sql: `CREATE TABLE IF NOT EXISTS access_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            method TEXT,
            url TEXT,
            userId TEXT,
            ip TEXT,
            userAgent TEXT,
            timestamp TEXT
          )`
        },
        {
          name: 'error_logs',
          sql: `CREATE TABLE IF NOT EXISTS error_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            error TEXT,
            stack TEXT,
            method TEXT,
            url TEXT,
            userId TEXT,
            ip TEXT,
            userAgent TEXT,
            timestamp TEXT
          )`
        },
        {
          name: 'maintenance_subscribers',
          sql: `CREATE TABLE IF NOT EXISTS maintenance_subscribers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE,
            subscribedAt TEXT
          )`
        }
      ];

      let completed = 0;
      const total = tables.length;

      tables.forEach(table => {
        db.run(table.sql, (err) => {
          if (err) {
            console.error(`[DB INIT] Error creando tabla ${table.name}:`, err);
          } else {
            console.log(`[DB INIT] Tabla ${table.name} creada/verificada correctamente`);
          }
          
          completed++;
          if (completed === total) {
            // Insertar datos de prueba si es necesario
            insertSampleData(db)
              .then(() => {
                console.log('[DB INIT] Inicialización de base de datos completada');
                resolve(db);
              })
              .catch(err => {
                console.error('[DB INIT] Error insertando datos de muestra:', err);
                resolve(db); // Resolver de todas formas
              });
          }
        });
      });
    });
  });
}

// Función para insertar datos de muestra
function insertSampleData(db) {
  return new Promise((resolve, reject) => {
    // Verificar si ya hay datos
    db.get('SELECT COUNT(*) as count FROM sessions', (err, row) => {
      if (err) {
        reject(err);
        return;
      }

      if (row.count === 0) {
        console.log('[DB INIT] Insertando datos de muestra...');
        
        const now = Date.now();
        const sampleData = [
          {
            table: 'sessions',
            data: ['sample-session', '710112055985963090', 'DemoAdmin', null, '127.0.0.1', 'Demo UA', now]
          },
          {
            table: 'announcements',
            data: ['Bienvenido a SpainRP', '¡Bienvenido a nuestro servidor!', '710112055985963090', new Date().toISOString(), new Date().toISOString()]
          }
        ];

        let completed = 0;
        sampleData.forEach(item => {
          const sql = `INSERT INTO ${item.table} VALUES (${item.data.map(() => '?').join(', ')})`;
          db.run(sql, item.data, (err) => {
            if (err) {
              console.error(`[DB INIT] Error insertando en ${item.table}:`, err);
            } else {
              console.log(`[DB INIT] Datos de muestra insertados en ${item.table}`);
            }
            
            completed++;
            if (completed === sampleData.length) {
              resolve();
            }
          });
        });
      } else {
        console.log('[DB INIT] Base de datos ya contiene datos, omitiendo inserción de muestra');
        resolve();
      }
    });
  });
}

module.exports = { initializeDatabase };
