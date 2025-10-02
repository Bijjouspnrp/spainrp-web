// Sistema de Seguridad y Detección de Spam
class SecuritySystem {
  constructor() {
    this.blockedIPs = new Set();
    this.suspiciousIPs = new Map(); // IP -> { count, lastSeen, reasons }
    this.rateLimits = new Map(); // IP -> { requests, windowStart }
    this.spamPatterns = [
      /(?:viagra|cialis|pharmacy|drugs)/i,
      /(?:casino|poker|gambling|bet)/i,
      /(?:bitcoin|crypto|investment|money)/i,
      /(?:free|win|prize|lottery)/i,
      /(?:click here|visit now|limited time)/i,
      /(?:http[s]?:\/\/[^\s]+)/g, // URLs
      /(?:[A-Z]{3,})/g, // Múltiples mayúsculas
      /(?:!{3,})/g, // Múltiples exclamaciones
      /(?:\.{3,})/g // Múltiples puntos
    ];
    
    this.rateLimitWindow = 60000; // 1 minuto
    this.maxRequestsPerWindow = 100;
    this.suspiciousThreshold = 5;
    this.blockDuration = 3600000; // 1 hora
    
    this.startCleanup();
  }

  // Verificar si una IP está bloqueada
  isBlocked(ip) {
    return this.blockedIPs.has(ip);
  }

  // Bloquear IP
  blockIP(ip, reason = 'Suspicious activity') {
    this.blockedIPs.add(ip);
    console.log(`[SECURITY] Blocked IP ${ip}: ${reason}`);
    
    // Desbloquear después del tiempo de bloqueo
    setTimeout(() => {
      this.blockedIPs.delete(ip);
      console.log(`[SECURITY] Unblocked IP ${ip}`);
    }, this.blockDuration);
  }

  // Verificar rate limit
  checkRateLimit(ip) {
    const now = Date.now();
    const limit = this.rateLimits.get(ip);
    
    if (!limit) {
      this.rateLimits.set(ip, { requests: 1, windowStart: now });
      return true;
    }
    
    // Resetear ventana si ha pasado el tiempo
    if (now - limit.windowStart > this.rateLimitWindow) {
      this.rateLimits.set(ip, { requests: 1, windowStart: now });
      return true;
    }
    
    // Incrementar contador
    limit.requests++;
    
    if (limit.requests > this.maxRequestsPerWindow) {
      this.markSuspicious(ip, 'Rate limit exceeded');
      return false;
    }
    
    return true;
  }

  // Marcar IP como sospechosa
  markSuspicious(ip, reason) {
    const suspicious = this.suspiciousIPs.get(ip) || { count: 0, lastSeen: 0, reasons: [] };
    suspicious.count++;
    suspicious.lastSeen = Date.now();
    suspicious.reasons.push(reason);
    
    this.suspiciousIPs.set(ip, suspicious);
    
    if (suspicious.count >= this.suspiciousThreshold) {
      this.blockIP(ip, `Multiple violations: ${suspicious.reasons.join(', ')}`);
    }
  }

  // Detectar spam en texto
  detectSpam(text) {
    if (!text || typeof text !== 'string') return false;
    
    let spamScore = 0;
    const reasons = [];
    
    // Verificar patrones de spam
    for (const pattern of this.spamPatterns) {
      const matches = text.match(pattern);
      if (matches) {
        spamScore += matches.length;
        reasons.push(`Pattern match: ${pattern.source}`);
      }
    }
    
    // Verificar longitud excesiva
    if (text.length > 1000) {
      spamScore += 2;
      reasons.push('Excessive length');
    }
    
    // Verificar repetición de caracteres
    const repeatedChars = text.match(/(.)\1{4,}/g);
    if (repeatedChars) {
      spamScore += repeatedChars.length;
      reasons.push('Repeated characters');
    }
    
    // Verificar mayúsculas excesivas
    const upperCaseRatio = (text.match(/[A-Z]/g) || []).length / text.length;
    if (upperCaseRatio > 0.7) {
      spamScore += 3;
      reasons.push('Excessive uppercase');
    }
    
    // Verificar URLs sospechosas
    const urls = text.match(/https?:\/\/[^\s]+/g) || [];
    if (urls.length > 3) {
      spamScore += urls.length;
      reasons.push('Multiple URLs');
    }
    
    return {
      isSpam: spamScore >= 3,
      score: spamScore,
      reasons
    };
  }

  // Analizar User-Agent
  analyzeUserAgent(userAgent) {
    if (!userAgent) return { suspicious: false, reasons: [] };
    
    const reasons = [];
    let suspicious = false;
    
    // Verificar bots conocidos
    const botPatterns = [
      /bot/i, /crawler/i, /spider/i, /scraper/i,
      /curl/i, /wget/i, /python/i, /java/i
    ];
    
    for (const pattern of botPatterns) {
      if (pattern.test(userAgent)) {
        reasons.push('Bot-like user agent');
        suspicious = true;
      }
    }
    
    // Verificar User-Agent vacío o muy corto
    if (userAgent.length < 10) {
      reasons.push('Suspiciously short user agent');
      suspicious = true;
    }
    
    // Verificar User-Agent muy largo
    if (userAgent.length > 500) {
      reasons.push('Suspiciously long user agent');
      suspicious = true;
    }
    
    return { suspicious, reasons };
  }

  // Middleware de seguridad
  securityMiddleware() {
    return (req, res, next) => {
      const ip = req.ip || req.connection.remoteAddress;
      const userAgent = req.get('User-Agent') || '';
      
      // Verificar si la IP está bloqueada
      if (this.isBlocked(ip)) {
        return res.status(403).json({ error: 'IP blocked' });
      }
      
      // Verificar rate limit
      if (!this.checkRateLimit(ip)) {
        return res.status(429).json({ error: 'Rate limit exceeded' });
      }
      
      // Analizar User-Agent
      const uaAnalysis = this.analyzeUserAgent(userAgent);
      if (uaAnalysis.suspicious) {
        this.markSuspicious(ip, `Suspicious user agent: ${uaAnalysis.reasons.join(', ')}`);
      }
      
      // Verificar contenido del body si existe
      if (req.body && typeof req.body === 'object') {
        const bodyText = JSON.stringify(req.body);
        const spamCheck = this.detectSpam(bodyText);
        
        if (spamCheck.isSpam) {
          this.markSuspicious(ip, `Spam detected: ${spamCheck.reasons.join(', ')}`);
          return res.status(400).json({ error: 'Spam detected' });
        }
      }
      
      next();
    };
  }

  // Obtener estadísticas de seguridad
  getSecurityStats() {
    return {
      blockedIPs: this.blockedIPs.size,
      suspiciousIPs: this.suspiciousIPs.size,
      rateLimitedIPs: this.rateLimits.size,
      totalBlocked: Array.from(this.suspiciousIPs.values())
        .reduce((sum, ip) => sum + ip.count, 0)
    };
  }

  // Limpiar datos antiguos
  cleanup() {
    const now = Date.now();
    const maxAge = 24 * 60 * 60 * 1000; // 24 horas
    
    // Limpiar IPs sospechosas antiguas
    for (const [ip, data] of this.suspiciousIPs.entries()) {
      if (now - data.lastSeen > maxAge) {
        this.suspiciousIPs.delete(ip);
      }
    }
    
    // Limpiar rate limits antiguos
    for (const [ip, data] of this.rateLimits.entries()) {
      if (now - data.windowStart > this.rateLimitWindow) {
        this.rateLimits.delete(ip);
      }
    }
  }

  // Iniciar limpieza automática
  startCleanup() {
    setInterval(() => {
      this.cleanup();
    }, 60 * 60 * 1000); // Cada hora
  }
}

// Instancia global
const security = new SecuritySystem();

module.exports = security;
