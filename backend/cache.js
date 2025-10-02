// Sistema de Cache Inteligente
class IntelligentCache {
  constructor() {
    this.cache = new Map();
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      evictions: 0
    };
    this.maxSize = 1000; // Máximo 1000 items en cache
    this.defaultTTL = 300000; // 5 minutos por defecto
    this.cleanupInterval = 60000; // Limpiar cada minuto
    
    this.startCleanup();
  }

  // Generar clave de cache
  generateKey(prefix, ...params) {
    return `${prefix}:${params.join(':')}`;
  }

  // Obtener del cache
  get(key) {
    const item = this.cache.get(key);
    
    if (!item) {
      this.stats.misses++;
      return null;
    }
    
    // Verificar si ha expirado
    if (Date.now() > item.expires) {
      this.cache.delete(key);
      this.stats.misses++;
      this.stats.evictions++;
      return null;
    }
    
    this.stats.hits++;
    return item.value;
  }

  // Guardar en cache
  set(key, value, ttl = this.defaultTTL) {
    // Si el cache está lleno, eliminar el item más antiguo
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
      this.stats.evictions++;
    }
    
    const item = {
      value,
      expires: Date.now() + ttl,
      createdAt: Date.now(),
      accessCount: 0
    };
    
    this.cache.set(key, item);
    this.stats.sets++;
  }

  // Eliminar del cache
  delete(key) {
    const deleted = this.cache.delete(key);
    if (deleted) {
      this.stats.deletes++;
    }
    return deleted;
  }

  // Limpiar cache expirado
  cleanup() {
    const now = Date.now();
    let cleaned = 0;
    
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expires) {
        this.cache.delete(key);
        cleaned++;
        this.stats.evictions++;
      }
    }
    
    if (cleaned > 0) {
      console.log(`[CACHE] Cleaned ${cleaned} expired items`);
    }
  }

  // Iniciar limpieza automática
  startCleanup() {
    setInterval(() => {
      this.cleanup();
    }, this.cleanupInterval);
  }

  // Obtener estadísticas
  getStats() {
    const total = this.stats.hits + this.stats.misses;
    const hitRate = total > 0 ? (this.stats.hits / total) * 100 : 0;
    
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hits: this.stats.hits,
      misses: this.stats.misses,
      hitRate: Math.round(hitRate * 100) / 100,
      sets: this.stats.sets,
      deletes: this.stats.deletes,
      evictions: this.stats.evictions
    };
  }

  // Limpiar todo el cache
  clear() {
    this.cache.clear();
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      evictions: 0
    };
  }

  // Middleware para Express
  middleware(ttl = this.defaultTTL) {
    return (req, res, next) => {
      const key = this.generateKey('http', req.method, req.originalUrl, JSON.stringify(req.query));
      
      // Intentar obtener del cache
      const cached = this.get(key);
      if (cached) {
        console.log(`[CACHE] Hit for ${req.originalUrl}`);
        return res.json(cached);
      }
      
      // Interceptar la respuesta
      const originalSend = res.json;
      res.json = function(data) {
        // Solo cachear respuestas exitosas
        if (res.statusCode === 200) {
          cache.set(key, data, ttl);
          console.log(`[CACHE] Set for ${req.originalUrl}`);
        }
        return originalSend.call(this, data);
      };
      
      next();
    };
  }
}

// Instancia global
const cache = new IntelligentCache();

module.exports = cache;
