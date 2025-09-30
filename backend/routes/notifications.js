const express = require('express');
const router = express.Router();
const db = require('../db/db');
const jwt = require('jsonwebtoken');

// Middleware para autenticación JWT
const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token de acceso requerido' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'spainrp_secret_key', (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Token inválido' });
    }
    req.user = user;
    next();
  });
};

// Aplicar middleware de autenticación a todas las rutas
router.use(authenticateJWT);

// Inicializar tabla de notificaciones si no existe
db.run(`CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'info',
    priority TEXT DEFAULT 'normal',
    read INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)`);

// Obtener notificaciones del usuario
router.get('/', async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'No autorizado' });
    }

    const notifications = await new Promise((resolve, reject) => {
      db.all(
        'SELECT * FROM notifications WHERE user_id = ? OR user_id IS NULL ORDER BY created_at DESC LIMIT 50',
        [userId],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });

    const unreadCount = await new Promise((resolve, reject) => {
      db.get(
        'SELECT COUNT(*) as count FROM notifications WHERE (user_id = ? OR user_id IS NULL) AND read = 0',
        [userId],
        (err, row) => {
          if (err) reject(err);
          else resolve(row.count);
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
    res.status(500).json({ error: 'Error obteniendo notificaciones' });
  }
});

// Marcar notificación como leída
router.post('/:id/read', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'No autorizado' });
    }

    await new Promise((resolve, reject) => {
      db.run(
        'UPDATE notifications SET read = 1 WHERE id = ? AND (user_id = ? OR user_id IS NULL)',
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
    
    if (!userId) {
      return res.status(401).json({ error: 'No autorizado' });
    }

    await new Promise((resolve, reject) => {
      db.run(
        'UPDATE notifications SET read = 1 WHERE user_id = ? OR user_id IS NULL',
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
    
    if (!userId) {
      return res.status(401).json({ error: 'No autorizado' });
    }

    await new Promise((resolve, reject) => {
      db.run(
        'DELETE FROM notifications WHERE user_id = ?',
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

    // Verificar permisos de administrador
    if (!req.user || !req.user.roles?.some(r => 
      r.name?.toLowerCase().includes('admin') || 
      r.name?.toLowerCase().includes('staff') || 
      r.name?.toLowerCase().includes('moderador')
    )) {
      return res.status(403).json({ error: 'No tienes permisos de administrador' });
    }

    if (!title || !message) {
      return res.status(400).json({ error: 'Título y mensaje son requeridos' });
    }

    let targetUserId = null;
    if (target === 'specific' && targetUser) {
      targetUserId = targetUser;
    }

    // Crear notificación
    const notificationId = await new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO notifications (user_id, title, message, type, priority) VALUES (?, ?, ?, ?, ?)',
        [targetUserId, title, message, type || 'info', priority || 'normal'],
        function(err) {
          if (err) reject(err);
          else resolve(this.lastID);
        }
      );
    });

    console.log(`[NOTIFICATIONS] Notificación enviada por admin ${userId}:`, {
      id: notificationId,
      title,
      message,
      type,
      target,
      targetUser: targetUserId
    });

    // Si es para todos los usuarios, crear notificaciones para usuarios online
    if (target === 'all' || target === 'online') {
      // Aquí podrías implementar lógica para obtener usuarios online
      // Por ahora, creamos una notificación global (user_id = NULL)
      if (target === 'all') {
        await new Promise((resolve, reject) => {
          db.run(
            'INSERT INTO notifications (user_id, title, message, type, priority) VALUES (NULL, ?, ?, ?, ?)',
            [title, message, type || 'info', priority || 'normal'],
            function(err) {
              if (err) reject(err);
              else resolve();
            }
          );
        });
      }
    }

    res.json({
      success: true,
      notificationId,
      message: 'Notificación enviada exitosamente'
    });
  } catch (error) {
    console.error('[NOTIFICATIONS] Error enviando notificación:', error);
    res.status(500).json({ error: 'Error enviando notificación' });
  }
});

module.exports = router;
