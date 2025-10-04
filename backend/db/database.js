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
        
        // Configurar modo WAL de forma segura
        db.run("PRAGMA journal_mode=WAL", (err) => {
          if (err) {
            console.warn('[DATABASE] Warning: No se pudo cambiar a modo WAL:', err.message);
            console.log('[DATABASE] Continuando con modo por defecto');
          } else {
            console.log('[DATABASE] Modo WAL activado correctamente');
          }
        });
        
        db.run("PRAGMA synchronous=NORMAL");
        db.run("PRAGMA cache_size=1000");
        db.run("PRAGMA temp_store=MEMORY");
        db.run("PRAGMA foreign_keys=ON");
        
        console.log('[DATABASE] Optimizaciones SQLite aplicadas');
        
        // Inicializar tablas necesarias
        initializeTables(db);
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

// Función para inicializar todas las tablas necesarias
const initializeTables = (database) => {
  console.log('[DATABASE] Inicializando tablas...');
  
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
        authorId TEXT,
        authorName TEXT,
        createdAt TEXT,
        images TEXT,
        company TEXT,
        tags TEXT
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
    },
    {
      name: 'news_comments',
      sql: `CREATE TABLE IF NOT EXISTS news_comments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        newsId INTEGER,
        userId TEXT,
        username TEXT,
        text TEXT,
        createdAt TEXT
      )`
    },
    {
      name: 'news_reactions',
      sql: `CREATE TABLE IF NOT EXISTS news_reactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        newsId INTEGER,
        userId TEXT,
        emoji TEXT,
        createdAt TEXT,
        UNIQUE(newsId, userId, emoji)
      )`
    },
    {
      name: 'calendar_claims',
      sql: `CREATE TABLE IF NOT EXISTS calendar_claims (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId TEXT NOT NULL,
        year INTEGER NOT NULL,
        month INTEGER NOT NULL,
        day INTEGER NOT NULL,
        claimedAt TEXT NOT NULL,
        reward TEXT,
        UNIQUE(userId, year, month, day)
      )`
    },
        {
          name: 'calendar_streaks',
          sql: `CREATE TABLE IF NOT EXISTS calendar_streaks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            userId TEXT UNIQUE NOT NULL,
            currentStreak INTEGER DEFAULT 0,
            longestStreak INTEGER DEFAULT 0,
            lastClaimedDate TEXT,
            totalClaims INTEGER DEFAULT 0
          )`
        },
        {
          name: 'web_bans',
          sql: `CREATE TABLE IF NOT EXISTS web_bans (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            type TEXT NOT NULL CHECK (type IN ('ip', 'discord')),
            value TEXT NOT NULL,
            reason TEXT,
            bannedBy TEXT NOT NULL,
            bannedAt TEXT NOT NULL,
            expiresAt TEXT,
            isActive INTEGER DEFAULT 1,
            UNIQUE(type, value)
          )`
        },
        {
          name: 'ip_tracking',
          sql: `CREATE TABLE IF NOT EXISTS ip_tracking (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            ip TEXT NOT NULL,
            userId TEXT,
            userAgent TEXT,
            country TEXT,
            city TEXT,
            firstSeen TEXT NOT NULL,
            lastSeen TEXT NOT NULL,
            visitCount INTEGER DEFAULT 1,
            isActive INTEGER DEFAULT 1
          )`
        }
  ];

  let completed = 0;
  const total = tables.length;

  tables.forEach(table => {
    database.run(table.sql, (err) => {
      if (err) {
        console.error(`[DATABASE] Error creando tabla ${table.name}:`, err);
      } else {
        console.log(`[DATABASE] Tabla ${table.name} creada/verificada correctamente`);
      }
      
      completed++;
      if (completed === total) {
        console.log('[DATABASE] Todas las tablas inicializadas correctamente');
        
        // Insertar datos de muestra si es necesario
        insertSampleData(database);
      }
    });
  });
};

// Función para insertar datos de muestra
const insertSampleData = (database) => {
  // Verificar si ya hay datos en sessions
  database.get('SELECT COUNT(*) as count FROM sessions', (err, row) => {
    if (err) {
      console.error('[DATABASE] Error verificando datos existentes:', err);
      return;
    }

    if (row.count === 0) {
      console.log('[DATABASE] Insertando datos de muestra...');
      
      const now = Date.now();
      database.run(
        'INSERT INTO sessions (sessionId, userId, username, avatar, ip, userAgent, lastSeen) VALUES (?, ?, ?, ?, ?, ?, ?)',
        ['sample-session', '710112055985963090', 'DemoAdmin', null, '127.0.0.1', 'Demo UA', now],
        (err) => {
          if (err) {
            console.error('[DATABASE] Error insertando sesión de muestra:', err);
          } else {
            console.log('[DATABASE] Sesión de muestra insertada correctamente');
          }
        }
      );
    } else {
      console.log('[DATABASE] Base de datos ya contiene datos, omitiendo inserción de muestra');
    }
  });
};

module.exports = {
  getDatabase,
  closeDatabase,
  runQuery,
  getQuery,
  allQuery
};
