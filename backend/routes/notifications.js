const express = require('express');
const router = express.Router();
const { getDatabase } = require('../db/database');
const { verifyToken } = require('../middleware/jwt');

// Usar conexión centralizada de base de datos
const db = getDatabase();

// Aplicar middleware de autenticación a todas las rutas
router.use(verifyToken);

// Inicializar tabla de notificaciones si no existe
db.run(`CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId TEXT,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'info',
    priority TEXT DEFAULT 'normal',
    read INTEGER DEFAULT 0,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
)`);

// Migrar tabla existente si usa created_at
db.run(`ALTER TABLE notifications ADD COLUMN createdAt DATETIME DEFAULT CURRENT_TIMESTAMP`, (err) => {
  if (err && !err.message.includes('duplicate column name')) {
    console.error('[NOTIFICATIONS] Error agregando columna createdAt:', err);
  }
});

// Copiar datos de created_at a createdAt si existe
db.run(`UPDATE notifications SET createdAt = created_at WHERE created_at IS NOT NULL AND createdAt IS NULL`, (err) => {
  if (err) {
    console.log('[NOTIFICATIONS] No hay datos que migrar o columna created_at no existe');
  }
});

// Obtener notificaciones del usuario
router.get('/', async (req, res) => {
  try {
    console.log('[NOTIFICATIONS] GET / - Usuario:', req.user?.id);
    console.log('[NOTIFICATIONS] Headers:', req.headers);
    console.log('[NOTIFICATIONS] Token:', req.headers.authorization?.substring(0, 20) + '...');
    
    const userId = req.user?.id;
    if (!userId) {
      console.error('[NOTIFICATIONS] Usuario no autenticado');
      return res.status(401).json({ error: 'No autorizado' });
    }

    // Verificar que la base de datos esté disponible
    if (!db) {
      console.error('[NOTIFICATIONS] Base de datos no disponible');
      return res.status(503).json({ error: 'Base de datos no disponible' });
    }
    
    console.log('[NOTIFICATIONS] Base de datos disponible, ejecutando query...');

    const notifications = await new Promise((resolve, reject) => {
      db.all(
        'SELECT * FROM notifications WHERE userId = ? OR userId IS NULL ORDER BY createdAt DESC LIMIT 50',
        [userId],
        (err, rows) => {
          if (err) {
            console.error('[NOTIFICATIONS] Error en query de notificaciones:', err);
            reject(err);
          } else {
            resolve(rows || []);
          }
        }
      );
    });

    const unreadCount = await new Promise((resolve, reject) => {
      db.get(
        'SELECT COUNT(*) as count FROM notifications WHERE (userId = ? OR userId IS NULL) AND read = 0',
        [userId],
        (err, row) => {
          if (err) {
            console.error('[NOTIFICATIONS] Error en query de conteo:', err);
            reject(err);
          } else {
            resolve(row ? row.count : 0);
          }
        }
      );
    });

    res.json({
      success: true,
      notifications,
      unreadCount
    });
  } catch (error) {
    console.error('[NOTIFICATIONS] Error obteniendo notificaciones:', error);
    res.status(500).json({ 
      error: 'Error obteniendo notificaciones',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Marcar notificación como leída
router.post('/:id/read', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    console.log(`[NOTIFICATIONS] POST /${id}/read - Usuario: ${userId}`);
    
    if (!userId) {
      return res.status(401).json({ error: 'No autorizado' });
    }

    await new Promise((resolve, reject) => {
      db.run(
        'UPDATE notifications SET read = 1 WHERE id = ? AND (userId = ? OR userId IS NULL)',
        [id, userId],
        function(err) {
          if (err) reject(err);
          else resolve();
        }
      );
    });

    res.json({ success: true });
  } catch (error) {
    console.error('[NOTIFICATIONS] Error marcando como leída:', error);
    res.status(500).json({ error: 'Error marcando notificación' });
  }
});

// Marcar todas las notificaciones como leídas
router.post('/read-all', async (req, res) => {
  try {
    const userId = req.user?.id;
    console.log(`[NOTIFICATIONS] POST /read-all - Usuario: ${userId}`);
    
    if (!userId) {
      return res.status(401).json({ error: 'No autorizado' });
    }

    await new Promise((resolve, reject) => {
      db.run(
        'UPDATE notifications SET read = 1 WHERE userId = ? OR userId IS NULL',
        [userId],
        function(err) {
          if (err) reject(err);
          else resolve();
        }
      );
    });

    res.json({ success: true });
  } catch (error) {
    console.error('[NOTIFICATIONS] Error marcando todas como leídas:', error);
    res.status(500).json({ error: 'Error marcando notificaciones' });
  }
});

// Limpiar todas las notificaciones
router.delete('/clear', async (req, res) => {
  try {
    const userId = req.user?.id;
    console.log(`[NOTIFICATIONS] DELETE /clear - Usuario: ${userId}`);
    
    if (!userId) {
      return res.status(401).json({ error: 'No autorizado' });
    }

    await new Promise((resolve, reject) => {
      db.run(
        'DELETE FROM notifications WHERE userId = ?',
        [userId],
        function(err) {
          if (err) reject(err);
          else resolve();
        }
      );
    });

    res.json({ success: true });
  } catch (error) {
    console.error('[NOTIFICATIONS] Error limpiando notificaciones:', error);
    res.status(500).json({ error: 'Error limpiando notificaciones' });
  }
});

// Enviar notificación (solo administradores)
router.post('/send', async (req, res) => {
  try {
    const userId = req.user?.id;
    const { title, message, type, target, targetUser, priority } = req.body;

    console.log('[NOTIFICATIONS] POST /send - Request received:', {
      userId,
      hasTitle: !!title,
      hasMessage: !!message,
      type,
      target,
      targetUser,
      priority,
      userAgent: req.headers['user-agent']?.substring(0, 50) || 'unknown'
    });

    // Verificar permisos de administrador
    if (!req.user) {
      console.log('[NOTIFICATIONS] ❌ Usuario no autenticado');
      return res.status(401).json({ error: 'Usuario no autenticado' });
    }

    // Lista de IDs de administradores (puedes añadir más IDs aquí)
    const adminUserIds = [
      '710112055985963090', // bijjoupro08
      // Añade más IDs de administradores aquí
    ];

    if (!adminUserIds.includes(userId)) {
      console.log(`[NOTIFICATIONS] ❌ Usuario ${userId} no está en la lista de administradores`);
      console.log(`[NOTIFICATIONS] Lista de admins permitidos:`, adminUserIds);
      return res.status(403).json({ error: 'No tienes permisos de administrador' });
    }

    console.log(`[NOTIFICATIONS] ✅ Usuario ${userId} tiene permisos de administrador`);

    if (!title || !message) {
      console.log('[NOTIFICATIONS] ❌ Faltan campos requeridos:', { title: !!title, message: !!message });
      return res.status(400).json({ error: 'Título y mensaje son requeridos' });
    }

    let targetUserId = null;
    if (target === 'specific' && targetUser) {
      targetUserId = targetUser;
    }

    // Determinar el userId correcto según el target
    let finalUserId = targetUserId;
    if (target === 'all' || target === 'online') {
      finalUserId = null; // Notificación global
    }

    console.log('[NOTIFICATIONS] 📝 Creando notificación:', {
      finalUserId,
      title,
      message: message.substring(0, 50) + '...',
      type: type || 'info',
      priority: priority || 'normal',
      isGlobal: finalUserId === null
    });

    // Crear notificación (solo una vez)
    const notificationId = await new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO notifications (userId, title, message, type, priority) VALUES (?, ?, ?, ?, ?)',
        [finalUserId, title, message, type || 'info', priority || 'normal'],
        function(err) {
          if (err) {
            console.error('[NOTIFICATIONS] ❌ Error insertando notificación:', err);
            reject(err);
          } else {
            console.log('[NOTIFICATIONS] ✅ Notificación insertada con ID:', this.lastID);
            resolve(this.lastID);
          }
        }
      );
    });

    console.log(`[NOTIFICATIONS] ✅ Notificación enviada por admin ${userId}:`, {
      id: notificationId,
      title,
      message: message.substring(0, 50) + '...',
      type,
      target,
      targetUser: finalUserId,
      isGlobal: finalUserId === null
    });

    // Crear objeto de notificación para WebSocket
    const notification = {
      id: notificationId,
      title,
      message,
      type: type || 'info',
      priority: priority || 'normal',
      timestamp: new Date().toISOString()
    };

    // Enviar por WebSocket si es para todos los usuarios
    if ((target === 'all' || target === 'online') && global.broadcastNotification) {
      console.log('[NOTIFICATIONS] 📡 Enviando notificación por WebSocket');
      global.broadcastNotification(notification);
    } else {
      console.log('[NOTIFICATIONS] ⚠️ WebSocket no disponible o notificación específica');
    }

    console.log('[NOTIFICATIONS] ✅ Notificación procesada exitosamente');

    res.json({
      success: true,
      notificationId,
      message: 'Notificación enviada exitosamente',
      target: target,
      isGlobal: finalUserId === null
    });
  } catch (error) {
    console.error('[NOTIFICATIONS] ❌ Error enviando notificación:', {
      error: error.message,
      stack: error.stack,
      userId: req.user?.id
    });
    res.status(500).json({ 
      error: 'Error enviando notificación',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;
