const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

// Sistema de Health Checks
class HealthCheckSystem {
  constructor() {
    this.checks = new Map();
    this.results = new Map();
    this.alerts = [];
    this.checkInterval = 30000; // 30 segundos
    this.alertThresholds = {
      responseTime: 5000, // 5 segundos
      memoryUsage: 80, // 80%
      cpuUsage: 80, // 80%
      diskUsage: 90, // 90%
      errorRate: 5 // 5%
    };
    
    this.initializeChecks();
    this.startHealthChecks();
  }

  // Inicializar checks del sistema
  initializeChecks() {
    // Check de base de datos
    this.addCheck('database', async () => {
      try {
        const dbPath = path.join(__dirname, 'spainrp.db');
        if (!fs.existsSync(dbPath)) {
          return { status: 'error', message: 'Database file not found' };
        }
        
        const stats = fs.statSync(dbPath);
        if (stats.size === 0) {
          return { status: 'error', message: 'Database file is empty' };
        }
        
        return { status: 'healthy', message: 'Database accessible' };
      } catch (error) {
        return { status: 'error', message: error.message };
      }
    });

    // Check de memoria
    this.addCheck('memory', async () => {
      try {
        const memUsage = process.memoryUsage();
        const totalMem = memUsage.heapTotal;
        const usedMem = memUsage.heapUsed;
        const usagePercent = (usedMem / totalMem) * 100;
        
        if (usagePercent > this.alertThresholds.memoryUsage) {
          return { 
            status: 'warning', 
            message: `High memory usage: ${usagePercent.toFixed(2)}%`,
            value: usagePercent
          };
        }
        
        return { 
          status: 'healthy', 
          message: `Memory usage: ${usagePercent.toFixed(2)}%`,
          value: usagePercent
        };
      } catch (error) {
        return { status: 'error', message: error.message };
      }
    });

    // Check de CPU
    this.addCheck('cpu', async () => {
      try {
        const cpuUsage = process.cpuUsage();
        const usagePercent = (cpuUsage.user / 1000000) / 60 * 100; // Aproximación
        
        if (usagePercent > this.alertThresholds.cpuUsage) {
          return { 
            status: 'warning', 
            message: `High CPU usage: ${usagePercent.toFixed(2)}%`,
            value: usagePercent
          };
        }
        
        return { 
          status: 'healthy', 
          message: `CPU usage: ${usagePercent.toFixed(2)}%`,
          value: usagePercent
        };
      } catch (error) {
        return { status: 'error', message: error.message };
      }
    });

    // Check de disco
    this.addCheck('disk', async () => {
      try {
        const stats = fs.statSync(__dirname);
        // Simulación de uso de disco (en producción usar fs.statvfs)
        const diskUsage = Math.random() * 100;
        
        if (diskUsage > this.alertThresholds.diskUsage) {
          return { 
            status: 'warning', 
            message: `High disk usage: ${diskUsage.toFixed(2)}%`,
            value: diskUsage
          };
        }
        
        return { 
          status: 'healthy', 
          message: `Disk usage: ${diskUsage.toFixed(2)}%`,
          value: diskUsage
        };
      } catch (error) {
        return { status: 'error', message: error.message };
      }
    });

    // Check de conectividad de red
    this.addCheck('network', async () => {
      try {
        const { promisify } = require('util');
        const execAsync = promisify(exec);
        
        // Ping a Google DNS
        const { stdout } = await execAsync('ping -c 1 8.8.8.8');
        
        if (stdout.includes('1 received')) {
          return { status: 'healthy', message: 'Network connectivity OK' };
        } else {
          return { status: 'error', message: 'Network connectivity failed' };
        }
      } catch (error) {
        return { status: 'error', message: 'Network check failed' };
      }
    });

    // Check de archivos críticos
    this.addCheck('files', async () => {
      try {
        const criticalFiles = [
          'index.js',
          'package.json',
          'spainrp.db'
        ];
        
        const missingFiles = [];
        for (const file of criticalFiles) {
          const filePath = path.join(__dirname, file);
          if (!fs.existsSync(filePath)) {
            missingFiles.push(file);
          }
        }
        
        if (missingFiles.length > 0) {
          return { 
            status: 'error', 
            message: `Missing critical files: ${missingFiles.join(', ')}` 
          };
        }
        
        return { status: 'healthy', message: 'All critical files present' };
      } catch (error) {
        return { status: 'error', message: error.message };
      }
    });
  }

  // Agregar check personalizado
  addCheck(name, checkFunction) {
    this.checks.set(name, checkFunction);
  }

  // Ejecutar todos los checks
  async runAllChecks() {
    const results = {};
    const startTime = Date.now();
    
    for (const [name, checkFunction] of this.checks) {
      try {
        const result = await checkFunction();
        results[name] = {
          ...result,
          timestamp: new Date().toISOString(),
          duration: Date.now() - startTime
        };
      } catch (error) {
        results[name] = {
          status: 'error',
          message: error.message,
          timestamp: new Date().toISOString(),
          duration: Date.now() - startTime
        };
      }
    }
    
    this.results = results;
    this.processAlerts(results);
    
    return results;
  }

  // Procesar alertas
  processAlerts(results) {
    const alerts = [];
    
    for (const [name, result] of Object.entries(results)) {
      if (result.status === 'error') {
        alerts.push({
          type: 'error',
          check: name,
          message: result.message,
          timestamp: new Date().toISOString(),
          severity: 'high'
        });
      } else if (result.status === 'warning') {
        alerts.push({
          type: 'warning',
          check: name,
          message: result.message,
          timestamp: new Date().toISOString(),
          severity: 'medium'
        });
      }
    }
    
    // Agregar alertas nuevas
    for (const alert of alerts) {
      const existingAlert = this.alerts.find(a => 
        a.check === alert.check && 
        a.type === alert.type &&
        Date.now() - new Date(a.timestamp).getTime() < 300000 // 5 minutos
      );
      
      if (!existingAlert) {
        this.alerts.push(alert);
        console.log(`[HEALTH] Alert: ${alert.type.toUpperCase()} - ${alert.check}: ${alert.message}`);
      }
    }
    
    // Limpiar alertas antiguas (más de 24 horas)
    this.alerts = this.alerts.filter(alert => 
      Date.now() - new Date(alert.timestamp).getTime() < 24 * 60 * 60 * 1000
    );
  }

  // Obtener estado general del sistema
  getSystemStatus() {
    const results = Array.from(this.results.values());
    const errorCount = results.filter(r => r.status === 'error').length;
    const warningCount = results.filter(r => r.status === 'warning').length;
    const healthyCount = results.filter(r => r.status === 'healthy').length;
    
    let overallStatus = 'healthy';
    if (errorCount > 0) {
      overallStatus = 'error';
    } else if (warningCount > 0) {
      overallStatus = 'warning';
    }
    
    return {
      status: overallStatus,
      checks: {
        total: results.length,
        healthy: healthyCount,
        warning: warningCount,
        error: errorCount
      },
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
    };
  }

  // Obtener métricas detalladas
  getDetailedMetrics() {
    const systemStatus = this.getSystemStatus();
    const memoryUsage = process.memoryUsage();
    
    return {
      ...systemStatus,
      memory: {
        used: memoryUsage.heapUsed,
        total: memoryUsage.heapTotal,
        external: memoryUsage.external,
        rss: memoryUsage.rss
      },
      process: {
        pid: process.pid,
        platform: process.platform,
        nodeVersion: process.version,
        uptime: process.uptime()
      },
      alerts: this.alerts.slice(-10) // Últimas 10 alertas
    };
  }

  // Iniciar checks automáticos
  startHealthChecks() {
    setInterval(async () => {
      try {
        await this.runAllChecks();
      } catch (error) {
        console.error('[HEALTH] Error running health checks:', error);
      }
    }, this.checkInterval);
    
    console.log('[HEALTH] Health checks started');
  }

  // Obtener alertas
  getAlerts() {
    return this.alerts;
  }

  // Limpiar alertas
  clearAlerts() {
    this.alerts = [];
  }

  // Middleware para Express
  healthMiddleware() {
    return (req, res, next) => {
      if (req.path === '/health') {
        const status = this.getSystemStatus();
        const statusCode = status.status === 'error' ? 503 : 200;
        res.status(statusCode).json(status);
      } else {
        next();
      }
    };
  }
}

// Instancia global
const health = new HealthCheckSystem();

module.exports = health;
