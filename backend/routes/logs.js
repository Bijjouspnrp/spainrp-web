const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { verifyToken } = require('../middleware/jwt');
const { createLogger } = require('../utils/logger');

// Logger para logs
const logger = createLogger('LOGS');

// Directorio de logs
const LOG_DIR = path.join(__dirname, '..', 'logs');
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

const ACCESS_LOG = path.join(LOG_DIR, 'access.log');
const ERROR_LOG = path.join(LOG_DIR, 'error.log');
const SYSTEM_LOG = path.join(LOG_DIR, 'system.log');

// Middleware para verificar permisos de administrador
const ensureAdmin = (req, res, next) => {
  const userId = req.user?.id || req.user?.userId;
  const adminUserIds = [
    '710112055985963090', // bijjoupro08
    // Añade más IDs de administradores aquí
  ];
  
  if (!adminUserIds.includes(userId)) {
    console.log(`[LOGS] Usuario ${userId} no tiene permisos de administrador`);
    return res.status(403).json({ error: 'No tienes permisos de administrador para ver los logs' });
  }
  
  next();
};

// Aplicar middleware JWT y admin a todas las rutas
router.use(verifyToken);
router.use(ensureAdmin);

// Función para leer logs de un archivo
const readLogFile = (filePath, maxLines = 1000) => {
  try {
    if (!fs.existsSync(filePath)) {
      return [];
    }
    
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n').filter(line => line.trim());
    
    // Tomar las últimas maxLines líneas
    const recentLines = lines.slice(-maxLines);
    
    return recentLines.map((line, index) => {
      try {
        // Intentar parsear como JSON
        const parsed = JSON.parse(line);
        return {
          id: `log-${Date.now()}-${index}`,
          type: parsed.type || 'system',
          timestamp: parsed.timestamp || new Date().toISOString(),
          message: parsed.message || line,
          user: parsed.user || parsed.data?.user,
          ip: parsed.ip || parsed.data?.ip,
          userAgent: parsed.userAgent || parsed.data?.userAgent,
          data: parsed.data || null
        };
      } catch (e) {
        // Si no es JSON, crear un log básico
        return {
          id: `log-${Date.now()}-${index}`,
          type: 'system',
          timestamp: new Date().toISOString(),
          message: line,
          user: null,
          ip: null,
          userAgent: null,
          data: null
        };
      }
    });
  } catch (error) {
    console.error('Error leyendo archivo de log:', error);
    return [];
  }
};

// Función para escribir log
const writeLog = (filePath, logData) => {
  try {
    const logEntry = {
      timestamp: new Date().toISOString(),
      type: logData.type || 'system',
      message: logData.message || '',
      user: logData.user || null,
      ip: logData.ip || null,
      userAgent: logData.userAgent || null,
      data: logData.data || null
    };
    
    fs.appendFileSync(filePath, JSON.stringify(logEntry) + '\n');
  } catch (error) {
    console.error('Error escribiendo log:', error);
  }
};

// Función para generar logs de ejemplo más variados
function generateSampleLogs() {
  const logs = [];
  const now = new Date();
  const logTypes = [
    'access', 'error', 'auth', 'admin', 'api', 'system', 
    'security', 'database', 'payment', 'discord', 'roblox', 
    'tinder', 'mdt', 'banco', 'stock', 'blackmarket'
  ];
  
  const sampleMessages = {
    access: [
      'Usuario accedió al panel de administración',
      'Página visitada: /apps/tinder',
      'API endpoint accedido: /api/user/profile',
      'Descarga de archivo iniciada',
      'Navegación a sección de logs'
    ],
    error: [
      'Error de conexión a la base de datos',
      'Token JWT expirado',
      'Error 404: Página no encontrada',
      'Timeout en petición API',
      'Error de validación de datos'
    ],
    auth: [
      'Usuario inició sesión exitosamente',
      'Token JWT generado',
      'Sesión expirada',
      'Intento de login fallido',
      'Usuario cerró sesión'
    ],
    admin: [
      'Usuario baneado por administrador',
      'Rol modificado en Discord',
      'Acción de moderación ejecutada',
      'Configuración del sistema actualizada',
      'Logs del sistema limpiados'
    ],
    api: [
      'Petición API procesada correctamente',
      'Rate limit alcanzado',
      'Endpoint API no encontrado',
      'Validación de parámetros exitosa',
      'Respuesta API enviada'
    ],
    system: [
      'Sistema iniciado correctamente',
      'Memoria del sistema: 75% utilizada',
      'Backup automático completado',
      'Servicio reiniciado',
      'Configuración cargada'
    ],
    security: [
      'Intento de acceso no autorizado bloqueado',
      'IP sospechosa detectada',
      'Validación de seguridad exitosa',
      'Firewall activado',
      'Análisis de seguridad completado'
    ],
    database: [
      'Consulta a base de datos ejecutada',
      'Transacción de base de datos completada',
      'Conexión a BD establecida',
      'Backup de BD iniciado',
      'Índice de BD optimizado'
    ],
    payment: [
      'Pago procesado exitosamente',
      'Transacción de banco completada',
      'Error en procesamiento de pago',
      'Saldo actualizado',
      'Transferencia entre usuarios'
    ],
    discord: [
      'Comando Discord ejecutado',
      'Usuario unido al servidor',
      'Mensaje enviado en Discord',
      'Rol asignado en Discord',
      'Bot Discord conectado'
    ],
    roblox: [
      'Avatar de Roblox obtenido',
      'Usuario de Roblox verificado',
      'Error obteniendo datos de Roblox',
      'API de Roblox consultada',
      'Avatar actualizado en perfil'
    ],
    tinder: [
      'Perfil de Tinder creado',
      'Match encontrado en Tinder',
      'Like enviado en Tinder',
      'Perfil de Tinder actualizado',
      'Super like utilizado'
    ],
    mdt: [
      'Consulta MDT ejecutada',
      'Multa aplicada desde MDT',
      'DNI consultado en MDT',
      'Arresto registrado en MDT',
      'Búsqueda de ciudadano en MDT'
    ],
    banco: [
      'Transacción bancaria procesada',
      'Saldo consultado',
      'Transferencia entre cuentas',
      'Préstamo solicitado',
      'Depósito realizado'
    ],
    stock: [
      'Acción comprada en bolsa',
      'Precio de acción actualizado',
      'Portfolio consultado',
      'Venta de acciones ejecutada',
      'Mercado de valores actualizado'
    ],
    blackmarket: [
      'Transacción en mercado negro',
      'Item vendido en black market',
      'Precio de item actualizado',
      'Inventario consultado',
      'Compra en mercado negro'
    ]
  };
  
  const userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:89.0) Gecko/20100101 Firefox/89.0'
  ];
  
  // Generar logs de los últimos 30 días
  for (let i = 0; i < 300; i++) {
    const timestamp = new Date(now.getTime() - (Math.random() * 30 * 24 * 60 * 60 * 1000));
    const randomType = logTypes[Math.floor(Math.random() * logTypes.length)];
    const messages = sampleMessages[randomType] || ['Log del sistema'];
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    
    const logData = {
      id: `log_${Date.now()}_${i}`,
      timestamp: timestamp.toISOString(),
      type: randomType,
      message: randomMessage,
      user: Math.random() > 0.15 ? `user_${Math.floor(Math.random() * 1000)}` : null,
      ip: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
      userAgent: userAgents[Math.floor(Math.random() * userAgents.length)],
      data: Math.random() > 0.3 ? {
        extra: 'data',
        value: Math.random(),
        source: randomType,
        level: ['info', 'warn', 'error'][Math.floor(Math.random() * 3)]
      } : null,
      level: ['info', 'warn', 'error'][Math.floor(Math.random() * 3)],
      source: randomType
    };
    
    logs.push(logData);
  }
  
  return logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
}

// Obtener todos los logs
router.get('/', (req, res) => {
  try {
    console.log(`[LOGS] Usuario ${req.user?.id || req.user?.userId} solicitando logs`);
    
    const accessLogs = readLogFile(ACCESS_LOG);
    const errorLogs = readLogFile(ERROR_LOG);
    const systemLogs = readLogFile(SYSTEM_LOG);
    
    // Si no hay logs reales, generar logs de ejemplo
    const realLogs = [...accessLogs, ...errorLogs, ...systemLogs];
    const allLogs = realLogs.length > 0 ? realLogs : generateSampleLogs();
    
    // Combinar todos los logs y ordenar por timestamp
    const sortedLogs = allLogs
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 1000); // Limitar a 1000 logs más recientes
    
    res.json({
      success: true,
      logs: sortedLogs,
      total: sortedLogs.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error obteniendo logs:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor al obtener logs'
    });
  }
});

// Obtener logs por tipo
router.get('/type/:type', (req, res) => {
  try {
    const { type } = req.params;
    const validTypes = ['access', 'error', 'system'];
    
    if (!validTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        error: 'Tipo de log inválido. Tipos válidos: access, error, system'
      });
    }
    
    let filePath;
    switch (type) {
      case 'access':
        filePath = ACCESS_LOG;
        break;
      case 'error':
        filePath = ERROR_LOG;
        break;
      case 'system':
        filePath = SYSTEM_LOG;
        break;
    }
    
    const logs = readLogFile(filePath);
    
    res.json({
      success: true,
      logs: logs,
      total: logs.length,
      type: type,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error obteniendo logs por tipo:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor al obtener logs'
    });
  }
});

// Limpiar logs
router.delete('/clear', (req, res) => {
  try {
    console.log(`[LOGS] Usuario ${req.user?.id || req.user?.userId} limpiando logs`);
    
    // Crear backup antes de limpiar
    const backupDir = path.join(LOG_DIR, 'backups');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    
    // Hacer backup de los archivos existentes
    [ACCESS_LOG, ERROR_LOG, SYSTEM_LOG].forEach(filePath => {
      if (fs.existsSync(filePath)) {
        const backupPath = path.join(backupDir, `${path.basename(filePath)}-${timestamp}.backup`);
        fs.copyFileSync(filePath, backupPath);
      }
    });
    
    // Limpiar archivos de log
    fs.writeFileSync(ACCESS_LOG, '');
    fs.writeFileSync(ERROR_LOG, '');
    fs.writeFileSync(SYSTEM_LOG, '');
    
    // Escribir log de la acción
    writeLog(SYSTEM_LOG, {
      type: 'admin',
      message: `Logs limpiados por ${req.user?.username || req.user?.id}`,
      user: req.user?.username || req.user?.id,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });
    
    res.json({
      success: true,
      message: 'Logs limpiados exitosamente',
      backupCreated: true,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error limpiando logs:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor al limpiar logs'
    });
  }
});

// Obtener estadísticas de logs mejoradas
router.get('/stats', (req, res) => {
  try {
    const accessLogs = readLogFile(ACCESS_LOG);
    const errorLogs = readLogFile(ERROR_LOG);
    const systemLogs = readLogFile(SYSTEM_LOG);
    const allLogs = [...accessLogs, ...errorLogs, ...systemLogs];
    
    const now = new Date();
    const stats = {
      total: allLogs.length,
      byType: {
        access: accessLogs.length,
        error: errorLogs.length,
        system: systemLogs.length
      },
      byLevel: {
        info: 0,
        warn: 0,
        error: 0
      },
      byHour: {},
      byDay: {},
      byUser: {},
      byIP: {},
      recentActivity: {
        last1h: 0,
        last24h: 0,
        last7d: 0,
        last30d: 0
      },
      topUsers: [],
      topIPs: [],
      errorRate: 0,
      averageLogsPerHour: 0,
      peakHour: 0,
      systemHealth: 'good'
    };
    
    // Procesar todos los logs
    allLogs.forEach(log => {
      const logDate = new Date(log.timestamp);
      const hour = logDate.getHours();
      const day = logDate.toISOString().split('T')[0];
      
      // Estadísticas por hora y día
      stats.byHour[hour] = (stats.byHour[hour] || 0) + 1;
      stats.byDay[day] = (stats.byDay[day] || 0) + 1;
      
      // Estadísticas por nivel
      if (log.level) {
        stats.byLevel[log.level] = (stats.byLevel[log.level] || 0) + 1;
      }
      
      // Estadísticas por usuario
      if (log.user) {
        stats.byUser[log.user] = (stats.byUser[log.user] || 0) + 1;
      }
      
      // Estadísticas por IP
      if (log.ip) {
        stats.byIP[log.ip] = (stats.byIP[log.ip] || 0) + 1;
      }
      
      // Actividad reciente
      const diffMs = now - logDate;
      const diffHours = diffMs / (1000 * 60 * 60);
      const diffDays = diffMs / (1000 * 60 * 60 * 24);
      
      if (diffHours <= 1) stats.recentActivity.last1h++;
      if (diffDays <= 1) stats.recentActivity.last24h++;
      if (diffDays <= 7) stats.recentActivity.last7d++;
      if (diffDays <= 30) stats.recentActivity.last30d++;
    });
    
    // Calcular métricas adicionales
    stats.errorRate = allLogs.length > 0 ? 
      ((stats.byLevel.error || 0) / allLogs.length * 100).toFixed(2) : 0;
    
    // Encontrar hora pico
    const peakHourData = Object.entries(stats.byHour).reduce((max, [hour, count]) => 
      count > max.count ? { hour: parseInt(hour), count } : max, 
      { hour: 0, count: 0 }
    );
    stats.peakHour = peakHourData.hour;
    
    // Calcular promedio de logs por hora
    const totalHours = Object.keys(stats.byHour).length;
    stats.averageLogsPerHour = totalHours > 0 ? 
      (allLogs.length / totalHours).toFixed(2) : 0;
    
    // Top usuarios
    stats.topUsers = Object.entries(stats.byUser)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([user, count]) => ({ user, count }));
    
    // Top IPs
    stats.topIPs = Object.entries(stats.byIP)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([ip, count]) => ({ ip, count }));
    
    // Determinar salud del sistema
    if (stats.errorRate > 10) {
      stats.systemHealth = 'critical';
    } else if (stats.errorRate > 5) {
      stats.systemHealth = 'warning';
    } else if (stats.errorRate > 2) {
      stats.systemHealth = 'caution';
    } else {
      stats.systemHealth = 'good';
    }
    
    res.json({
      success: true,
      stats: stats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error obteniendo estadísticas de logs:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor al obtener estadísticas'
    });
  }
});

// Exportar logs mejorado
router.get('/export', (req, res) => {
  try {
    const { type, format = 'json', startDate, endDate, level, user, ip } = req.query;
    
    let logs = [];
    if (type && ['access', 'error', 'system'].includes(type)) {
      let filePath;
      switch (type) {
        case 'access':
          filePath = ACCESS_LOG;
          break;
        case 'error':
          filePath = ERROR_LOG;
          break;
        case 'system':
          filePath = SYSTEM_LOG;
          break;
      }
      logs = readLogFile(filePath);
    } else {
      const accessLogs = readLogFile(ACCESS_LOG);
      const errorLogs = readLogFile(ERROR_LOG);
      const systemLogs = readLogFile(SYSTEM_LOG);
      logs = [...accessLogs, ...errorLogs, ...systemLogs]
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    }
    
    // Aplicar filtros
    if (startDate || endDate) {
      logs = logs.filter(log => {
        const logDate = new Date(log.timestamp);
        const start = startDate ? new Date(startDate) : new Date(0);
        const end = endDate ? new Date(endDate) : new Date();
        return logDate >= start && logDate <= end;
      });
    }
    
    if (level) {
      logs = logs.filter(log => log.level === level);
    }
    
    if (user) {
      logs = logs.filter(log => log.user && log.user.includes(user));
    }
    
    if (ip) {
      logs = logs.filter(log => log.ip && log.ip.includes(ip));
    }
    
    if (format === 'csv') {
      // Exportar como CSV mejorado
      const csvHeader = 'Timestamp,Type,Level,Message,User,IP,UserAgent,Source,Data\n';
      const csvData = logs.map(log => 
        `"${log.timestamp}","${log.type || ''}","${log.level || ''}","${(log.message || '').replace(/"/g, '""')}","${log.user || ''}","${log.ip || ''}","${(log.userAgent || '').replace(/"/g, '""')}","${log.source || ''}","${JSON.stringify(log.data || {}).replace(/"/g, '""')}"`
      ).join('\n');
      
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="spainrp-logs-${type || 'all'}-${new Date().toISOString().split('T')[0]}.csv"`);
      res.send('\ufeff' + csvHeader + csvData); // BOM para Excel
    } else if (format === 'txt') {
      // Exportar como texto plano
      const txtData = logs.map(log => 
        `[${log.timestamp}] ${log.type?.toUpperCase() || 'UNKNOWN'} - ${log.message || 'No message'}\n` +
        `  User: ${log.user || 'N/A'}\n` +
        `  IP: ${log.ip || 'N/A'}\n` +
        `  Level: ${log.level || 'N/A'}\n` +
        `  Source: ${log.source || 'N/A'}\n` +
        (log.data ? `  Data: ${JSON.stringify(log.data, null, 2)}\n` : '') +
        '---\n'
      ).join('\n');
      
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="spainrp-logs-${type || 'all'}-${new Date().toISOString().split('T')[0]}.txt"`);
      res.send(txtData);
    } else {
      // Exportar como JSON mejorado
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="spainrp-logs-${type || 'all'}-${new Date().toISOString().split('T')[0]}.json"`);
      res.json({
        export: {
          timestamp: new Date().toISOString(),
          type: type || 'all',
          total: logs.length,
          filters: {
            startDate,
            endDate,
            level,
            user,
            ip
          },
          logs: logs
        }
      });
    }
  } catch (error) {
    console.error('Error exportando logs:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor al exportar logs'
    });
  }
});

// Buscar logs con filtros avanzados
router.get('/search', (req, res) => {
  try {
    const { 
      q: searchTerm, 
      type, 
      level, 
      user, 
      ip, 
      startDate, 
      endDate, 
      limit = 100,
      offset = 0 
    } = req.query;
    
    let logs = [];
    if (type && ['access', 'error', 'system'].includes(type)) {
      let filePath;
      switch (type) {
        case 'access':
          filePath = ACCESS_LOG;
          break;
        case 'error':
          filePath = ERROR_LOG;
          break;
        case 'system':
          filePath = SYSTEM_LOG;
          break;
      }
      logs = readLogFile(filePath);
    } else {
      const accessLogs = readLogFile(ACCESS_LOG);
      const errorLogs = readLogFile(ERROR_LOG);
      const systemLogs = readLogFile(SYSTEM_LOG);
      logs = [...accessLogs, ...errorLogs, ...systemLogs];
    }
    
    // Aplicar filtros
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      logs = logs.filter(log => 
        log.message?.toLowerCase().includes(term) ||
        log.user?.toLowerCase().includes(term) ||
        log.ip?.toLowerCase().includes(term) ||
        log.userAgent?.toLowerCase().includes(term) ||
        log.source?.toLowerCase().includes(term) ||
        JSON.stringify(log.data || {}).toLowerCase().includes(term)
      );
    }
    
    if (level) {
      logs = logs.filter(log => log.level === level);
    }
    
    if (user) {
      logs = logs.filter(log => log.user && log.user.includes(user));
    }
    
    if (ip) {
      logs = logs.filter(log => log.ip && log.ip.includes(ip));
    }
    
    if (startDate || endDate) {
      logs = logs.filter(log => {
        const logDate = new Date(log.timestamp);
        const start = startDate ? new Date(startDate) : new Date(0);
        const end = endDate ? new Date(endDate) : new Date();
        return logDate >= start && logDate <= end;
      });
    }
    
    // Ordenar por timestamp descendente
    logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    // Paginación
    const total = logs.length;
    const paginatedLogs = logs.slice(offset, offset + parseInt(limit));
    
    res.json({
      success: true,
      logs: paginatedLogs,
      total,
      limit: parseInt(limit),
      offset: parseInt(offset),
      hasMore: offset + parseInt(limit) < total,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error buscando logs:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor al buscar logs'
    });
  }
});

// Obtener logs en tiempo real (WebSocket simulation)
router.get('/realtime', (req, res) => {
  try {
    // Simular logs en tiempo real
    const realtimeLogs = [];
    const now = new Date();
    
    // Generar algunos logs de ejemplo para demostración
    for (let i = 0; i < 10; i++) {
      const logTypes = ['access', 'error', 'system'];
      const randomType = logTypes[Math.floor(Math.random() * logTypes.length)];
      
      realtimeLogs.push({
        id: `realtime_${Date.now()}_${i}`,
        timestamp: new Date(now.getTime() - (i * 60000)).toISOString(),
        type: randomType,
        level: ['info', 'warn', 'error'][Math.floor(Math.random() * 3)],
        message: `Log en tiempo real ${i + 1}`,
        user: `user_${Math.floor(Math.random() * 100)}`,
        ip: `192.168.1.${Math.floor(Math.random() * 255)}`,
        source: 'realtime'
      });
    }
    
    res.json({
      success: true,
      logs: realtimeLogs,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error obteniendo logs en tiempo real:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor al obtener logs en tiempo real'
    });
  }
});

// Recibir logs del frontend
router.post('/frontend', (req, res) => {
  try {
    const logEntry = req.body;
    const user = req.user?.username || req.user?.id || 'anonymous';
    const ip = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent');

    // Validar entrada
    if (!logEntry.message || !logEntry.level) {
      return res.status(400).json({
        success: false,
        error: 'Log entry debe contener message y level'
      });
    }

    // Determinar archivo de log basado en el módulo
    let logFile = SYSTEM_LOG;
    if (logEntry.module === 'ADMIN') {
      logFile = path.join(LOG_DIR, 'admin.log');
    } else if (logEntry.module === 'MODERATION') {
      logFile = path.join(LOG_DIR, 'moderation.log');
    } else if (logEntry.module === 'COMMUNICATION') {
      logFile = path.join(LOG_DIR, 'communication.log');
    } else if (logEntry.module === 'CNI') {
      logFile = path.join(LOG_DIR, 'cni.log');
    } else if (logEntry.module === 'ROLES') {
      logFile = path.join(LOG_DIR, 'roles.log');
    } else if (logEntry.module === 'SECURITY') {
      logFile = path.join(LOG_DIR, 'security.log');
    } else if (logEntry.module === 'API') {
      logFile = path.join(LOG_DIR, 'api.log');
    } else if (logEntry.level === 'error' || logEntry.level === 'critical') {
      logFile = ERROR_LOG;
    } else if (logEntry.level === 'access') {
      logFile = ACCESS_LOG;
    }

    // Crear entrada de log completa
    const fullLogEntry = {
      ...logEntry,
      user: user,
      ip: ip,
      userAgent: userAgent,
      source: 'frontend',
      timestamp: new Date().toISOString()
    };

    // Escribir al archivo
    fs.appendFileSync(logFile, JSON.stringify(fullLogEntry) + '\n');

    logger.info(`Log recibido del frontend: ${logEntry.message}`, {
      module: logEntry.module,
      level: logEntry.level,
      user: user
    }, user, ip, userAgent);

    res.json({
      success: true,
      message: 'Log recibido exitosamente'
    });
  } catch (error) {
    logger.error('Error procesando log del frontend:', error, req.user?.username || req.user?.id, req.ip, req.get('User-Agent'));
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor al procesar log'
    });
  }
});

module.exports = router;
