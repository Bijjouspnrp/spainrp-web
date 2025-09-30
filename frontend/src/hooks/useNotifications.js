import { useState, useEffect, useCallback } from 'react';
import { io } from 'socket.io-client';
import { apiUrl } from '../utils/api';

const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);

  // Socket.IO connection
  useEffect(() => {
    let socket = null;
    let reconnectInterval = null;

    const connectSocket = () => {
      try {
        // Usar la URL correcta del backend
        const socketUrl = 'https://spainrp-web.onrender.com';
        
        socket = io(socketUrl, {
          path: '/ws/notifications',
          transports: ['websocket', 'polling'],
          timeout: 20000,
          reconnection: true,
          reconnectionDelay: 1000,
          reconnectionAttempts: 5
        });
        
        socket.on('connect', () => {
          console.log('[NOTIFICATIONS] Socket.IO conectado:', socket.id);
          setIsConnected(true);
          if (reconnectInterval) {
            clearInterval(reconnectInterval);
            reconnectInterval = null;
          }
        });

        socket.on('notification', (data) => {
          console.log('[NOTIFICATIONS] Notificación recibida:', data);
          if (data.type === 'notification') {
            addNotification(data.notification);
          }
        });

        socket.on('disconnect', () => {
          console.log('[NOTIFICATIONS] Socket.IO desconectado');
          setIsConnected(false);
        });

        socket.on('connect_error', (error) => {
          console.error('[NOTIFICATIONS] Error conectando Socket.IO:', error);
          setIsConnected(false);
        });

        socket.on('reconnect', () => {
          console.log('[NOTIFICATIONS] Socket.IO reconectado');
          setIsConnected(true);
        });

        socket.on('reconnect_error', (error) => {
          console.error('[NOTIFICATIONS] Error reconectando Socket.IO:', error);
          setIsConnected(false);
        });

      } catch (error) {
        console.error('[NOTIFICATIONS] Error inicializando Socket.IO:', error);
        setIsConnected(false);
      }
    };

    connectSocket();

    return () => {
      if (socket) {
        socket.disconnect();
      }
      if (reconnectInterval) {
        clearInterval(reconnectInterval);
      }
    };
  }, []);

  // Cargar notificaciones existentes
  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const token = localStorage.getItem('spainrp_token');
        if (!token) return;

        const response = await fetch(apiUrl('/api/notifications'), {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          setNotifications(data.notifications || []);
          setUnreadCount(data.unreadCount || 0);
        }
      } catch (error) {
        console.error('[NOTIFICATIONS] Error cargando notificaciones:', error);
      }
    };

    loadNotifications();
  }, []);

  const addNotification = useCallback((notification) => {
    const newNotification = {
      id: Date.now() + Math.random(),
      ...notification,
      timestamp: new Date(),
      read: false
    };

    setNotifications(prev => [newNotification, ...prev.slice(0, 49)]); // Máximo 50 notificaciones
    setUnreadCount(prev => prev + 1);

    // Reproducir sonido si está habilitado
    const soundEnabled = localStorage.getItem('spainrp_notification_sound') !== 'false';
    if (soundEnabled) {
      playNotificationSound();
    }

    // Mostrar toast notification
    showToastNotification(newNotification);
  }, []);

  const markAsRead = useCallback(async (notificationId) => {
    try {
      const token = localStorage.getItem('spainrp_token');
      if (!token) return;

      await fetch(apiUrl(`/api/notifications/${notificationId}/read`), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId ? { ...notif, read: true } : notif
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('[NOTIFICATIONS] Error marcando como leída:', error);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      const token = localStorage.getItem('spainrp_token');
      if (!token) return;

      await fetch(apiUrl('/api/notifications/read-all'), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      setNotifications(prev => 
        prev.map(notif => ({ ...notif, read: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('[NOTIFICATIONS] Error marcando todas como leídas:', error);
    }
  }, []);

  const clearAll = useCallback(async () => {
    try {
      const token = localStorage.getItem('spainrp_token');
      if (!token) return;

      await fetch(apiUrl('/api/notifications/clear'), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      setNotifications([]);
      setUnreadCount(0);
    } catch (error) {
      console.error('[NOTIFICATIONS] Error limpiando notificaciones:', error);
    }
  }, []);

  return {
    notifications,
    unreadCount,
    isConnected,
    addNotification,
    markAsRead,
    markAllAsRead,
    clearAll
  };
};

// Función para reproducir sonido de notificación
const playNotificationSound = () => {
  try {
    const audio = new Audio('/sounds/notification.mp3');
    audio.volume = 0.3;
    audio.play().catch(() => {
      // Si no se puede reproducir el audio, usar el sonido del sistema
      console.log('[NOTIFICATIONS] Usando sonido del sistema');
    });
  } catch (error) {
    console.error('[NOTIFICATIONS] Error reproduciendo sonido:', error);
  }
};

// Función para mostrar toast notification
const showToastNotification = (notification) => {
  // Crear elemento de toast
  const toast = document.createElement('div');
  toast.className = 'toast-notification';
  toast.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: linear-gradient(135deg, #7289da, #5865f2);
    color: white;
    padding: 16px 20px;
    border-radius: 12px;
    box-shadow: 0 8px 32px rgba(114, 137, 218, 0.3);
    z-index: 10000;
    max-width: 350px;
    animation: slideInRight 0.3s ease-out;
    cursor: pointer;
    border: 1px solid rgba(255, 255, 255, 0.2);
  `;

  toast.innerHTML = `
    <div style="display: flex; align-items: center; gap: 12px;">
      <div style="font-size: 20px;">${getNotificationIcon(notification.type)}</div>
      <div style="flex: 1;">
        <div style="font-weight: 600; font-size: 14px; margin-bottom: 4px;">
          ${notification.title || 'Nueva notificación'}
        </div>
        <div style="font-size: 12px; opacity: 0.9;">
          ${notification.message || ''}
        </div>
      </div>
      <button onclick="this.parentElement.parentElement.remove()" style="
        background: none; border: none; color: white; font-size: 18px; 
        cursor: pointer; padding: 0; width: 20px; height: 20px;
        display: flex; align-items: center; justify-content: center;
      ">×</button>
    </div>
  `;

  document.body.appendChild(toast);

  // Auto-remove después de 5 segundos
  setTimeout(() => {
    if (toast.parentElement) {
      toast.style.animation = 'slideOutRight 0.3s ease-in';
      setTimeout(() => toast.remove(), 300);
    }
  }, 5000);
};

// Función para obtener icono según el tipo de notificación
const getNotificationIcon = (type) => {
  const icons = {
    info: 'ℹ️',
    success: '✅',
    warning: '⚠️',
    error: '❌',
    announcement: '📢',
    system: '⚙️',
    user: '👤',
    admin: '👑'
  };
  return icons[type] || '🔔';
};

export default useNotifications;
