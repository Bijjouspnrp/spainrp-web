// Logger del frontend que se integra con el backend
class FrontendLogger {
  constructor(module = 'FRONTEND') {
    this.module = module;
    this.apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
  }

  // Función principal de logging
  async log(level, message, data = null, user = null, ip = null, userAgent = null) {
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
      source: 'frontend',
      url: window.location.href,
      userAgent: navigator.userAgent
    };

    // Log a consola
    this.logToConsole(level, message, data, user);

    // Enviar al backend si hay token
    try {
      const token = localStorage.getItem('spainrp_token');
      if (token) {
        await this.sendToBackend(logEntry);
      }
    } catch (error) {
      console.error('Error enviando log al backend:', error);
    }
  }

  // Log a consola con colores
  logToConsole(level, message, data, user) {
    const colors = {
      DEBUG: 'color: #00bcd4;',
      INFO: 'color: #4caf50;',
      WARN: 'color: #ff9800;',
      ERROR: 'color: #f44336;',
      CRITICAL: 'color: #9c27b0;'
    };
    
    const userInfo = user ? ` [${user}]` : '';
    const dataInfo = data ? ` | Data: ${JSON.stringify(data)}` : '';
    
    console.log(
      `%c[${new Date().toISOString()}] ${level} [${this.module}]${userInfo}: ${message}${dataInfo}`,
      colors[level] || 'color: #000;'
    );
  }

  // Enviar log al backend
  async sendToBackend(logEntry) {
    try {
      const token = localStorage.getItem('spainrp_token');
      const response = await fetch(`${this.apiUrl}/api/logs/frontend`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(logEntry)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error enviando log al backend:', error);
    }
  }

  // Métodos de conveniencia
  debug(message, data = null, user = null) {
    this.log('DEBUG', message, data, user);
  }

  info(message, data = null, user = null) {
    this.log('INFO', message, data, user);
  }

  warn(message, data = null, user = null) {
    this.log('WARN', message, data, user);
  }

  error(message, data = null, user = null) {
    this.log('ERROR', message, data, user);
  }

  critical(message, data = null, user = null) {
    this.log('CRITICAL', message, data, user);
  }

  // Logs específicos para diferentes módulos
  admin(message, data = null, user = null) {
    this.log('ADMIN', message, data, user);
  }

  moderation(message, data = null, user = null) {
    this.log('MODERATION', message, data, user);
  }

  communication(message, data = null, user = null) {
    this.log('COMMUNICATION', message, data, user);
  }

  cni(message, data = null, user = null) {
    this.log('CNI', message, data, user);
  }

  roles(message, data = null, user = null) {
    this.log('ROLES', message, data, user);
  }

  security(message, data = null, user = null) {
    this.log('SECURITY', message, data, user);
  }

  api(message, data = null, user = null) {
    this.log('API', message, data, user);
  }

  access(message, data = null, user = null) {
    this.log('ACCESS', message, data, user);
  }

  // Logs específicos para acciones del usuario
  userAction(action, target = null, data = null, user = null) {
    this.admin(`Usuario ${action}${target ? ` ${target}` : ''}`, data, user);
  }

  // Logs de errores de API
  apiError(endpoint, error, user = null) {
    this.error(`Error en API ${endpoint}`, {
      endpoint,
      error: error.message || error,
      stack: error.stack
    }, user);
  }

  // Logs de acciones de moderación
  moderationAction(action, target, reason = null, user = null) {
    this.moderation(`Acción de moderación: ${action}`, {
      target,
      reason,
      action
    }, user);
  }

  // Logs de comunicación
  communicationAction(type, target, message = null, user = null) {
    this.communication(`Comunicación: ${type}`, {
      target,
      message: message ? message.substring(0, 100) + '...' : null,
      type
    }, user);
  }

  // Logs de CNI/DNI
  cniAction(action, dni = null, data = null, user = null) {
    this.cni(`Acción CNI: ${action}`, {
      dni,
      action,
      ...data
    }, user);
  }

  // Logs de roles
  roleAction(action, target, role = null, user = null) {
    this.roles(`Acción de rol: ${action}`, {
      target,
      role,
      action
    }, user);
  }
}

// Función helper para crear logger de módulo específico
const createLogger = (module) => new FrontendLogger(module);

// Logger por defecto
const logger = new FrontendLogger();

// Función helper para obtener información del usuario actual
const getCurrentUser = () => {
  try {
    const userData = localStorage.getItem('spainrp_user');
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    return null;
  }
};

// Función helper para logging automático de acciones
const logAction = (action, data = null) => {
  const user = getCurrentUser();
  logger.userAction(action, null, data, user?.username || user?.id);
};

// Función helper para logging de errores
const logError = (error, context = null) => {
  const user = getCurrentUser();
  logger.error(`Error: ${error.message}`, {
    error: error.message,
    stack: error.stack,
    context
  }, user?.username || user?.id);
};

// Función helper para logging de API calls
const logApiCall = (method, endpoint, success = true, data = null) => {
  const user = getCurrentUser();
  const level = success ? 'info' : 'error';
  logger.api(`${method} ${endpoint} - ${success ? 'SUCCESS' : 'ERROR'}`, data, user?.username || user?.id);
};

export {
  FrontendLogger,
  createLogger,
  logger,
  getCurrentUser,
  logAction,
  logError,
  logApiCall
};

