const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { verifyToken } = require('../middleware/jwt');

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

// Obtener todos los logs
router.get('/', (req, res) => {
  try {
    console.log(`[LOGS] Usuario ${req.user?.id || req.user?.userId} solicitando logs`);
    
    const accessLogs = readLogFile(ACCESS_LOG);
    const errorLogs = readLogFile(ERROR_LOG);
    const systemLogs = readLogFile(SYSTEM_LOG);
    
    // Combinar todos los logs y ordenar por timestamp
    const allLogs = [...accessLogs, ...errorLogs, ...systemLogs]
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 1000); // Limitar a 1000 logs más recientes
    
    res.json({
      success: true,
      logs: allLogs,
      total: allLogs.length,
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

// Obtener estadísticas de logs
router.get('/stats', (req, res) => {
  try {
    const accessLogs = readLogFile(ACCESS_LOG);
    const errorLogs = readLogFile(ERROR_LOG);
    const systemLogs = readLogFile(SYSTEM_LOG);
    
    const stats = {
      total: accessLogs.length + errorLogs.length + systemLogs.length,
      byType: {
        access: accessLogs.length,
        error: errorLogs.length,
        system: systemLogs.length
      },
      byHour: {},
      byDay: {},
      recentActivity: {
        last24h: 0,
        last7d: 0,
        last30d: 0
      }
    };
    
    // Calcular actividad por hora y día
    const now = new Date();
    const allLogs = [...accessLogs, ...errorLogs, ...systemLogs];
    
    allLogs.forEach(log => {
      const logDate = new Date(log.timestamp);
      const hour = logDate.getHours();
      const day = logDate.toISOString().split('T')[0];
      
      stats.byHour[hour] = (stats.byHour[hour] || 0) + 1;
      stats.byDay[day] = (stats.byDay[day] || 0) + 1;
      
      // Actividad reciente
      const diffMs = now - logDate;
      const diffDays = diffMs / (1000 * 60 * 60 * 24);
      
      if (diffDays <= 1) stats.recentActivity.last24h++;
      if (diffDays <= 7) stats.recentActivity.last7d++;
      if (diffDays <= 30) stats.recentActivity.last30d++;
    });
    
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

// Exportar logs
router.get('/export', (req, res) => {
  try {
    const { type, format = 'json' } = req.query;
    
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
    
    if (format === 'csv') {
      // Exportar como CSV
      const csvHeader = 'Timestamp,Type,Message,User,IP,UserAgent\n';
      const csvData = logs.map(log => 
        `"${log.timestamp}","${log.type}","${log.message}","${log.user || ''}","${log.ip || ''}","${log.userAgent || ''}"`
      ).join('\n');
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="spainrp-logs-${type || 'all'}-${new Date().toISOString().split('T')[0]}.csv"`);
      res.send(csvHeader + csvData);
    } else {
      // Exportar como JSON
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="spainrp-logs-${type || 'all'}-${new Date().toISOString().split('T')[0]}.json"`);
      res.json({
        export: {
          timestamp: new Date().toISOString(),
          type: type || 'all',
          total: logs.length,
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

module.exports = router;
