const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Función para inicializar la base de datos
function initializeDatabase() {
  return new Promise((resolve, reject) => {
    const dbPath = path.join(__dirname, '..', 'spainrp.db');
    const db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('[DB INIT] Error abriendo base de datos:', err);
        reject(err);
        return;
      }
      console.log('[DB INIT] Conectado a la base de datos SQLite');
    });

    // Configurar la base de datos - PRAGMA fuera de serialize()
    // Configuraciones de rendimiento (deben ir antes de serialize)
    // Nota: El modo WAL se configura en database.js para evitar conflictos
    db.run('PRAGMA synchronous=NORMAL');
    db.run('PRAGMA cache_size=10000');
    db.run('PRAGMA temp_store=memory');
    db.run('PRAGMA foreign_keys=ON');
    db.run('PRAGMA busy_timeout=30000');

    // Pequeño delay para asegurar que las configuraciones PRAGMA se apliquen
    setTimeout(() => {
      // Crear tablas en una transacción
      db.serialize(() => {
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
            name: 'access_logs',
            sql: `CREATE TABLE IF NOT EXISTS access_logs (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              userId TEXT,
              username TEXT,
              action TEXT,
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
          },
          {
            name: 'news_comments',
            sql: `CREATE TABLE IF NOT EXISTS news_comments (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              newsId TEXT,
              userId TEXT,
              username TEXT,
              comment TEXT,
              createdAt TEXT
            )`
          },
          {
            name: 'news_reactions',
            sql: `CREATE TABLE IF NOT EXISTS news_reactions (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              newsId TEXT,
              userId TEXT,
              reaction TEXT,
              createdAt TEXT
            )`
          },
          {
            name: 'roblox_verifications',
            sql: `CREATE TABLE IF NOT EXISTS roblox_verifications (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              discordId TEXT UNIQUE,
              robloxId TEXT,
              robloxUsername TEXT,
              verifiedAt TEXT,
              status TEXT DEFAULT 'pending'
            )`
          },
          {
            name: 'bans',
            sql: `CREATE TABLE IF NOT EXISTS bans (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              userId TEXT,
              username TEXT,
              reason TEXT,
              bannedBy TEXT,
              bannedAt TEXT,
              expiresAt TEXT,
              active INTEGER DEFAULT 1
            )`
          },
          {
            name: 'polls',
            sql: `CREATE TABLE IF NOT EXISTS polls (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              title TEXT,
              description TEXT,
              options TEXT,
              createdBy TEXT,
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
              option TEXT,
              votedAt TEXT,
              FOREIGN KEY (pollId) REFERENCES polls (id)
            )`
          },
          {
            name: 'notifications',
            sql: `CREATE TABLE IF NOT EXISTS notifications (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              user_id TEXT,
              title TEXT,
              message TEXT,
              type TEXT DEFAULT 'info',
              priority TEXT DEFAULT 'normal',
              read INTEGER DEFAULT 0,
              created_at TEXT
            )`
          },
          {
            name: 'live_chats',
            sql: `CREATE TABLE IF NOT EXISTS live_chats (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              user_id TEXT NOT NULL,
              user_name TEXT NOT NULL,
              status TEXT DEFAULT 'active',
              created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
              closed_at DATETIME NULL,
              assigned_moderator TEXT NULL
            )`
          },
          {
            name: 'chat_messages',
            sql: `CREATE TABLE IF NOT EXISTS chat_messages (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              chat_id INTEGER NOT NULL,
              sender_type TEXT NOT NULL,
              sender_id TEXT NOT NULL,
              sender_name TEXT NOT NULL,
              message TEXT NOT NULL,
              created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
              FOREIGN KEY (chat_id) REFERENCES live_chats (id)
            )`
          },
          {
            name: 'moderators_online',
            sql: `CREATE TABLE IF NOT EXISTS moderators_online (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              user_id TEXT NOT NULL,
              user_name TEXT NOT NULL,
              last_seen DATETIME DEFAULT CURRENT_TIMESTAMP,
              is_online INTEGER DEFAULT 1
            )`
          },
          {
            name: 'ip_tracking',
            sql: `CREATE TABLE IF NOT EXISTS ip_tracking (
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
            )`
          }
        ];

        // Crear todas las tablas
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
              console.log('[DB INIT] Todas las tablas inicializadas correctamente');
              
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
    }, 100); // 100ms delay para asegurar que las configuraciones PRAGMA se apliquen
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
        
        const sampleData = [
          {
            table: 'sessions',
            data: ['sample-session-123', '710112055985963090', 'bijjoupro08', 'https://cdn.discordapp.com/avatars/710112055985963090/a_1234567890abcdef.png', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', Date.now()]
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
