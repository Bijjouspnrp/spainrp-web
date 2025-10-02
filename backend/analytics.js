const fs = require('fs');
const path = require('path');

// Sistema de Analytics y Métricas
class AnalyticsSystem {
  constructor() {
    this.metrics = {
      visitors: {
        total: 0,
        today: 0,
        thisWeek: 0,
        thisMonth: 0,
        unique: new Set(),
        returning: new Set(),
        hourly: new Array(24).fill(0),
        daily: new Array(30).fill(0)
      },
      performance: {
        pageLoadTimes: [],
        serverResponseTimes: [],
        cacheHits: 0,
        cacheMisses: 0,
        errors: 0,
        totalRequests: 0,
        uptime: Date.now()
      },
      content: {
        pageViews: new Map(),
        searches: new Map(),
        userEngagement: 0,
        bounceRate: 0,
        sessionDuration: 0
      },
      security: {
        blockedRequests: 0,
        suspiciousActivities: 0,
        failedLogins: 0,
        spamDetected: 0,
        securityScore: 100
      },
      system: {
        memoryUsage: 0,
        cpuUsage: 0,
        diskUsage: 0,
        activeConnections: 0,
        databaseSize: 0
      }
    };
    
    this.analyticsFile = path.join(__dirname, 'data', 'analytics.json');
    this.loadAnalytics();
    this.startPeriodicTasks();
  }

  // Cargar analytics desde archivo
  loadAnalytics() {
    try {
      if (fs.existsSync(this.analyticsFile)) {
        const data = JSON.parse(fs.readFileSync(this.analyticsFile, 'utf8'));
        this.metrics = { ...this.metrics, ...data };
        
        // Convertir Sets de vuelta
        this.metrics.visitors.unique = new Set(this.metrics.visitors.unique || []);
        this.metrics.visitors.returning = new Set(this.metrics.visitors.returning || []);
        this.metrics.content.pageViews = new Map(this.metrics.content.pageViews || []);
        this.metrics.content.searches = new Map(this.metrics.content.searches || []);
      }
    } catch (error) {
      console.error('[ANALYTICS] Error loading analytics:', error);
    }
  }

  // Guardar analytics a archivo
  saveAnalytics() {
    try {
      const dataToSave = {
        ...this.metrics,
        visitors: {
          ...this.metrics.visitors,
          unique: Array.from(this.metrics.visitors.unique),
          returning: Array.from(this.metrics.visitors.returning)
        },
        content: {
          ...this.metrics.content,
          pageViews: Array.from(this.metrics.content.pageViews),
          searches: Array.from(this.metrics.content.searches)
        }
      };
      
      fs.writeFileSync(this.analyticsFile, JSON.stringify(dataToSave, null, 2));
    } catch (error) {
      console.error('[ANALYTICS] Error saving analytics:', error);
    }
  }

  // Registrar visita
  trackVisit(req, res, next) {
    const ip = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent') || '';
    const referer = req.get('Referer') || '';
    const page = req.path;
    
    // Incrementar contadores
    this.metrics.visitors.total++;
    this.metrics.visitors.today++;
    this.metrics.performance.totalRequests++;
    
    // Registrar visitante único
    this.metrics.visitors.unique.add(ip);
    
    // Registrar página visitada
    const pageViews = this.metrics.content.pageViews.get(page) || 0;
    this.metrics.content.pageViews.set(page, pageViews + 1);
    
    // Registrar hora de visita
    const hour = new Date().getHours();
    this.metrics.visitors.hourly[hour]++;
    
    // Detectar visitante recurrente
    if (this.metrics.visitors.returning.has(ip)) {
      this.metrics.visitors.returning.add(ip);
    }
    
    // Medir tiempo de respuesta
    const startTime = Date.now();
    res.on('finish', () => {
      const responseTime = Date.now() - startTime;
      this.metrics.performance.serverResponseTimes.push(responseTime);
      
      // Mantener solo los últimos 1000 tiempos
      if (this.metrics.performance.serverResponseTimes.length > 1000) {
        this.metrics.performance.serverResponseTimes = this.metrics.performance.serverResponseTimes.slice(-1000);
      }
    });
    
    next();
  }

  // Registrar búsqueda
  trackSearch(searchTerm) {
    const searches = this.metrics.content.searches.get(searchTerm) || 0;
    this.metrics.content.searches.set(searchTerm, searches + 1);
  }

  // Registrar error
  trackError(error) {
    this.metrics.performance.errors++;
    this.metrics.performance.errorRate = (this.metrics.performance.errors / this.metrics.performance.totalRequests) * 100;
  }

  // Registrar actividad sospechosa
  trackSuspiciousActivity(ip, reason) {
    this.metrics.security.suspiciousActivities++;
    this.metrics.security.securityScore = Math.max(0, this.metrics.security.securityScore - 1);
    console.log(`[SECURITY] Suspicious activity from ${ip}: ${reason}`);
  }

  // Registrar spam detectado
  trackSpam(content) {
    this.metrics.security.spamDetected++;
    this.metrics.security.securityScore = Math.max(0, this.metrics.security.securityScore - 2);
    console.log(`[SECURITY] Spam detected: ${content.substring(0, 50)}...`);
  }

  // Registrar login fallido
  trackFailedLogin(ip) {
    this.metrics.security.failedLogins++;
    this.metrics.security.securityScore = Math.max(0, this.metrics.security.securityScore - 1);
    console.log(`[SECURITY] Failed login attempt from ${ip}`);
  }

  // Registrar request bloqueado
  trackBlockedRequest(ip, reason) {
    this.metrics.security.blockedRequests++;
    this.metrics.security.securityScore = Math.max(0, this.metrics.security.securityScore - 0.5);
    console.log(`[SECURITY] Blocked request from ${ip}: ${reason}`);
  }

  // Obtener métricas
  getMetrics() {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    // Calcular métricas derivadas
    const avgResponseTime = this.metrics.performance.serverResponseTimes.length > 0
      ? this.metrics.performance.serverResponseTimes.reduce((a, b) => a + b, 0) / this.metrics.performance.serverResponseTimes.length
      : 0;
    
    const cacheHitRate = this.metrics.performance.cacheHits + this.metrics.performance.cacheMisses > 0
      ? (this.metrics.performance.cacheHits / (this.metrics.performance.cacheHits + this.metrics.performance.cacheMisses)) * 100
      : 0;
    
    const uptime = Date.now() - this.metrics.performance.uptime;
    const uptimeHours = uptime / (1000 * 60 * 60);
    const uptimePercentage = Math.min(100, (uptimeHours / (24 * 30)) * 100); // 30 días como referencia
    
    return {
      visitors: {
        total: this.metrics.visitors.total,
        today: this.metrics.visitors.today,
        thisWeek: this.metrics.visitors.thisWeek,
        thisMonth: this.metrics.visitors.thisMonth,
        unique: this.metrics.visitors.unique.size,
        returning: this.metrics.visitors.returning.size,
        hourly: this.metrics.visitors.hourly
      },
      performance: {
        pageLoadTime: Math.round(avgResponseTime),
        serverResponseTime: Math.round(avgResponseTime),
        cacheHitRate: Math.round(cacheHitRate * 100) / 100,
        errorRate: Math.round(this.metrics.performance.errorRate * 100) / 100,
        uptime: Math.round(uptimePercentage * 100) / 100,
        totalRequests: this.metrics.performance.totalRequests
      },
      content: {
        mostVisitedPages: Array.from(this.metrics.content.pageViews.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, 10)
          .map(([name, views]) => ({ name, views })),
        popularSearches: Array.from(this.metrics.content.searches.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, 10)
          .map(([term, count]) => ({ term, count })),
        userEngagement: this.metrics.content.userEngagement,
        bounceRate: this.metrics.content.bounceRate,
        sessionDuration: this.metrics.content.sessionDuration
      },
      security: {
        blockedRequests: this.metrics.security.blockedRequests,
        suspiciousActivities: this.metrics.security.suspiciousActivities,
        failedLogins: this.metrics.security.failedLogins,
        spamDetected: this.metrics.security.spamDetected,
        securityScore: Math.round(this.metrics.security.securityScore)
      },
      system: {
        memoryUsage: Math.round(process.memoryUsage().heapUsed / 1024 / 1024), // MB
        cpuUsage: Math.round(process.cpuUsage().user / 1000000), // Microseconds to seconds
        diskUsage: this.metrics.system.diskUsage,
        activeConnections: this.metrics.system.activeConnections,
        databaseSize: this.metrics.system.databaseSize
      }
    };
  }

  // Tareas periódicas
  startPeriodicTasks() {
    // Guardar analytics cada 5 minutos
    setInterval(() => {
      this.saveAnalytics();
    }, 5 * 60 * 1000);
    
    // Resetear contadores diarios a medianoche
    setInterval(() => {
      const now = new Date();
      if (now.getHours() === 0 && now.getMinutes() === 0) {
        this.metrics.visitors.today = 0;
        this.metrics.visitors.hourly = new Array(24).fill(0);
        console.log('[ANALYTICS] Daily counters reset');
      }
    }, 60 * 1000); // Check every minute
    
    // Actualizar métricas del sistema cada 30 segundos
    setInterval(() => {
      this.updateSystemMetrics();
    }, 30 * 1000);
  }

  // Actualizar métricas del sistema
  updateSystemMetrics() {
    const memUsage = process.memoryUsage();
    this.metrics.system.memoryUsage = Math.round((memUsage.heapUsed / memUsage.heapTotal) * 100);
    this.metrics.system.cpuUsage = Math.round(process.cpuUsage().user / 1000000);
    
    // Simular uso de disco (en producción usar fs.stat)
    this.metrics.system.diskUsage = Math.round(Math.random() * 20 + 10); // 10-30%
  }
}

// Instancia global
const analytics = new AnalyticsSystem();

module.exports = analytics;
