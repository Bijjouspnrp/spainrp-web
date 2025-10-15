const fs = require('fs');
const path = require('path');

// Directorio de logs
const LOG_DIR = path.join(__dirname, '..', 'logs');
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

// Archivos de log específicos
const LOG_FILES = {
  access: path.join(LOG_DIR, 'access.log'),
  error: path.join(LOG_DIR, 'error.log'),
  system: path.join(LOG_DIR, 'system.log'),
  admin: path.join(LOG_DIR, 'admin.log'),
  moderation: path.join(LOG_DIR, 'moderation.log'),
  communication: path.join(LOG_DIR, 'communication.log'),
  cni: path.join(LOG_DIR, 'cni.log'),
  roles: path.join(LOG_DIR, 'roles.log'),
  security: path.join(LOG_DIR, 'security.log'),
  api: path.join(LOG_DIR, 'api.log')
};

// Niveles de log
const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
  CRITICAL: 4
};

// Configuración del logger
const config = {
  level: process.env.LOG_LEVEL || 'INFO',
  maxFileSize: 10 * 1024 * 1024, // 10MB
  maxFiles: 5,
  enableConsole: true,
  enableFile: true
};

class Logger {
  constructor(module = 'SYSTEM') {
    this.module = module;
    this.level = LOG_LEVELS[config.level] || LOG_LEVELS.INFO;
  }

  // Función principal de logging
  log(level, message, data = null, user = null, ip = null, userAgent = null) {
    const logLevel = LOG_LEVELS[level];
    if (logLevel < this.level) return;

    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level: level.toLowerCase(),
      module: this.module,
      message,
      data,
      user,
      ip,
      userAgent,
      pid: process.pid
    };

    // Log a consola
    if (config.enableConsole) {
      this.logToConsole(level, message, data, user);
    }

    // Log a archivo
    if (config.enableFile) {
      this.logToFile(level, logEntry);
    }
  }

  // Log a consola con colores
  logToConsole(level, message, data, user) {
    const colors = {
      DEBUG: '\x1b[36m',    // Cyan
      INFO: '\x1b[32m',     // Green
      WARN: '\x1b[33m',     // Yellow
      ERROR: '\x1b[31m',    // Red
      CRITICAL: '\x1b[35m'  // Magenta
    };
    const reset = '\x1b[0m';
    const color = colors[level] || reset;
    
    const userInfo = user ? ` [${user}]` : '';
    const dataInfo = data ? ` | Data: ${JSON.stringify(data)}` : '';
    
    console.log(`${color}[${new Date().toISOString()}] ${level} [${this.module}]${userInfo}: ${message}${dataInfo}${reset}`);
  }

  // Log a archivo
  logToFile(level, logEntry) {
    try {
      // Determinar archivo de log basado en el módulo y nivel
      let logFile = LOG_FILES.system;
      
      if (this.module === 'ADMIN' || level === 'ADMIN') {
        logFile = LOG_FILES.admin;
      } else if (this.module === 'MODERATION' || level === 'MODERATION') {
        logFile = LOG_FILES.moderation;
      } else if (this.module === 'COMMUNICATION' || level === 'COMMUNICATION') {
        logFile = LOG_FILES.communication;
      } else if (this.module === 'CNI' || level === 'CNI') {
        logFile = LOG_FILES.cni;
      } else if (this.module === 'ROLES' || level === 'ROLES') {
        logFile = LOG_FILES.roles;
      } else if (this.module === 'SECURITY' || level === 'SECURITY') {
        logFile = LOG_FILES.security;
      } else if (this.module === 'API' || level === 'API') {
        logFile = LOG_FILES.api;
      } else if (level === 'ERROR' || level === 'CRITICAL') {
        logFile = LOG_FILES.error;
      } else if (level === 'ACCESS' || this.module === 'ACCESS') {
        logFile = LOG_FILES.access;
      }

      // Rotar archivo si es muy grande
      this.rotateLogFile(logFile);

      // Escribir log
      fs.appendFileSync(logFile, JSON.stringify(logEntry) + '\n');
    } catch (error) {
      console.error('Error escribiendo log:', error);
    }
  }

  // Rotar archivo de log si es muy grande
  rotateLogFile(logFile) {
    try {
      if (fs.existsSync(logFile)) {
        const stats = fs.statSync(logFile);
        if (stats.size > config.maxFileSize) {
          // Crear backup con timestamp
          const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
          const backupFile = `${logFile}.${timestamp}.backup`;
          fs.renameSync(logFile, backupFile);
          
          // Limpiar archivos de backup antiguos
          this.cleanOldBackups(path.dirname(logFile));
        }
      }
    } catch (error) {
      console.error('Error rotando archivo de log:', error);
    }
  }

  // Limpiar archivos de backup antiguos
  cleanOldBackups(logDir) {
    try {
      const files = fs.readdirSync(logDir);
      const backupFiles = files
        .filter(file => file.endsWith('.backup'))
        .map(file => ({
          name: file,
          path: path.join(logDir, file),
          mtime: fs.statSync(path.join(logDir, file)).mtime
        }))
        .sort((a, b) => b.mtime - a.mtime);

      // Mantener solo los últimos maxFiles archivos
      if (backupFiles.length > config.maxFiles) {
        backupFiles.slice(config.maxFiles).forEach(file => {
          fs.unlinkSync(file.path);
        });
      }
    } catch (error) {
      console.error('Error limpiando backups:', error);
    }
  }

  // Métodos de conveniencia
  debug(message, data = null, user = null, ip = null, userAgent = null) {
    this.log('DEBUG', message, data, user, ip, userAgent);
  }

  info(message, data = null, user = null, ip = null, userAgent = null) {
    this.log('INFO', message, data, user, ip, userAgent);
  }

  warn(message, data = null, user = null, ip = null, userAgent = null) {
    this.log('WARN', message, data, user, ip, userAgent);
  }

  error(message, data = null, user = null, ip = null, userAgent = null) {
    this.log('ERROR', message, data, user, ip, userAgent);
  }

  critical(message, data = null, user = null, ip = null, userAgent = null) {
    this.log('CRITICAL', message, data, user, ip, userAgent);
  }

  // Logs específicos para diferentes módulos
  admin(message, data = null, user = null, ip = null, userAgent = null) {
    this.log('ADMIN', message, data, user, ip, userAgent);
  }

  moderation(message, data = null, user = null, ip = null, userAgent = null) {
    this.log('MODERATION', message, data, user, ip, userAgent);
  }

  communication(message, data = null, user = null, ip = null, userAgent = null) {
    this.log('COMMUNICATION', message, data, user, ip, userAgent);
  }

  cni(message, data = null, user = null, ip = null, userAgent = null) {
    this.log('CNI', message, data, user, ip, userAgent);
  }

  roles(message, data = null, user = null, ip = null, userAgent = null) {
    this.log('ROLES', message, data, user, ip, userAgent);
  }

  security(message, data = null, user = null, ip = null, userAgent = null) {
    this.log('SECURITY', message, data, user, ip, userAgent);
  }

  api(message, data = null, user = null, ip = null, userAgent = null) {
    this.log('API', message, data, user, ip, userAgent);
  }

  access(message, data = null, user = null, ip = null, userAgent = null) {
    this.log('ACCESS', message, data, user, ip, userAgent);
  }
}

// Función helper para crear logger de módulo específico
const createLogger = (module) => new Logger(module);

// Logger por defecto
const logger = new Logger();

// Función helper para logging de requests HTTP
const logRequest = (req, res, next) => {
  const start = Date.now();
  const user = req.user?.username || req.user?.id || 'anonymous';
  const ip = req.ip || req.connection.remoteAddress;
  const userAgent = req.get('User-Agent');
  
  logger.access(`${req.method} ${req.originalUrl}`, {
    method: req.method,
    url: req.originalUrl,
    headers: req.headers,
    query: req.query,
    body: req.method !== 'GET' ? req.body : undefined
  }, user, ip, userAgent);

  // Log de respuesta
  res.on('finish', () => {
    const duration = Date.now() - start;
    const status = res.statusCode;
    
    if (status >= 400) {
      logger.error(`HTTP ${status} - ${req.method} ${req.originalUrl}`, {
        status,
        duration,
        responseHeaders: res.getHeaders()
      }, user, ip, userAgent);
    } else {
      logger.info(`HTTP ${status} - ${req.method} ${req.originalUrl}`, {
        status,
        duration
      }, user, ip, userAgent);
    }
  });

  next();
};

module.exports = {
  Logger,
  createLogger,
  logger,
  logRequest,
  LOG_LEVELS,
  LOG_FILES
};

