import { apiUrl } from './api';

class LoggingService {
  constructor() {
    this.baseUrl = apiUrl('/api/logs');
  }

  // Crear un log
  async createLog(logData) {
    try {
      const token = localStorage.getItem('spainrp_token');
      if (!token) {
        console.warn('No hay token de autenticación para logging');
        return;
      }

      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(logData)
      });

      if (!response.ok) {
        console.error('Error enviando log:', response.status);
      }
    } catch (error) {
      console.error('Error en logging service:', error);
    }
  }

  // Log de búsqueda MDT
  async logSearch(userId, searchType, searchTerm, results) {
    await this.createLog({
      type: 'mdt',
      level: 'info',
      message: `Búsqueda ${searchType}: "${searchTerm}"`,
      user: userId,
      source: 'MDT',
      data: {
        searchType,
        searchTerm,
        resultsCount: results?.length || 0,
        timestamp: new Date().toISOString()
      }
    });
  }

  // Log de multa
  async logFine(userId, targetUser, amount, reason, fineId) {
    await this.createLog({
      type: 'mdt',
      level: 'info',
      message: `Multa aplicada: $${amount} a ${targetUser}`,
      user: userId,
      source: 'MDT',
      data: {
        action: 'fine',
        targetUser,
        amount,
        reason,
        fineId,
        timestamp: new Date().toISOString()
      }
    });
  }

  // Log de arresto
  async logArrest(userId, targetUser, charges, totalFine, icTime, oocTime, arrestId) {
    await this.createLog({
      type: 'mdt',
      level: 'info',
      message: `Arresto realizado: ${targetUser} - ${charges.length} cargos`,
      user: userId,
      source: 'MDT',
      data: {
        action: 'arrest',
        targetUser,
        charges,
        totalFine,
        icTime,
        oocTime,
        arrestId,
        timestamp: new Date().toISOString()
      }
    });
  }

  // Log de acciones CNI
  async logCNIAction(userId, action, details) {
    await this.createLog({
      type: 'cni',
      level: 'info',
      message: `Acción CNI: ${action}`,
      user: userId,
      source: 'CNI',
      data: {
        action,
        ...details,
        timestamp: new Date().toISOString()
      }
    });
  }

  // Log de búsqueda CNI
  async logCNISearch(userId, searchType, searchTerm, results) {
    await this.logCNIAction(userId, 'search', {
      searchType,
      searchTerm,
      resultsCount: results?.length || 0
    });
  }

  // Log de creación de registro empresarial
  async logBusinessRecord(userId, businessName, businessType, action) {
    await this.logCNIAction(userId, 'business_record', {
      businessName,
      businessType,
      action // 'create', 'update', 'delete'
    });
  }

  // Log de visita empresarial
  async logBusinessVisit(userId, businessName, visitType, details) {
    await this.logCNIAction(userId, 'business_visit', {
      businessName,
      visitType,
      ...details
    });
  }

  // Log de artículo de blog
  async logBlogArticle(userId, articleTitle, action) {
    await this.logCNIAction(userId, 'blog_article', {
      articleTitle,
      action // 'create', 'update', 'delete'
    });
  }

  // Log de tracking de jugadores
  async logPlayerTracking(userId, targetUser, action) {
    await this.logCNIAction(userId, 'player_tracking', {
      targetUser,
      action // 'track', 'untrack'
    });
  }

  // Log de tracking de vehículos
  async logVehicleTracking(userId, vehicleId, action) {
    await this.logCNIAction(userId, 'vehicle_tracking', {
      vehicleId,
      action // 'track', 'untrack'
    });
  }

  // Log de estadísticas de base de datos
  async logDatabaseStats(userId, statsType, details) {
    await this.logCNIAction(userId, 'database_stats', {
      statsType,
      ...details
    });
  }
}

// Instancia singleton
const loggingService = new LoggingService();
export default loggingService;
