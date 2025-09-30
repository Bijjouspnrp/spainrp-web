import { useState, useEffect, useCallback } from 'react';
import { apiUrl } from '../utils/api';

const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);

  // Cargar notificaciones existentes
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

  useEffect(() => {
    loadNotifications();
  }, []);

  // Polling cada 30 segundos para obtener notificaciones (WebSocket deshabilitado temporalmente)
  useEffect(() => {
    console.log('[NOTIFICATIONS] Usando polling cada 30 segundos');
    setIsConnected(false);
    
    const pollInterval = setInterval(() => {
      loadNotifications();
    }, 30000);

    return () => {
      clearInterval(pollInterval);
    };
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

      const response = await fetch(apiUrl(`/api/notifications/mark-read/${notificationId}`), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setNotifications(prev => 
          prev.map(notif => 
            notif.id === notificationId ? { ...notif, read: true } : notif
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('[NOTIFICATIONS] Error marcando como leída:', error);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      const token = localStorage.getItem('spainrp_token');
      if (!token) return;

      const response = await fetch(apiUrl('/api/notifications/mark-all-read'), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setNotifications(prev => 
          prev.map(notif => ({ ...notif, read: true }))
        );
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('[NOTIFICATIONS] Error marcando todas como leídas:', error);
    }
  }, []);

  const deleteNotification = useCallback(async (notificationId) => {
    try {
      const token = localStorage.getItem('spainrp_token');
      if (!token) return;

      const response = await fetch(apiUrl(`/api/notifications/delete/${notificationId}`), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('[NOTIFICATIONS] Error eliminando notificación:', error);
    }
  }, []);

  const clearAll = useCallback(async () => {
    try {
      const token = localStorage.getItem('spainrp_token');
      if (!token) return;

      const response = await fetch(apiUrl('/api/notifications/clear-all'), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setNotifications([]);
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('[NOTIFICATIONS] Error limpiando todas las notificaciones:', error);
    }
  }, []);

  // Función para reproducir sonido de notificación
  const playNotificationSound = useCallback(() => {
    try {
      const audio = new Audio('/sounds/notification.mp3');
      audio.volume = 0.3;
      audio.play().catch(error => {
        console.log('[NOTIFICATIONS] No se pudo reproducir el sonido:', error);
      });
    } catch (error) {
      console.log('[NOTIFICATIONS] Error creando audio:', error);
    }
  }, []);

  // Función para mostrar toast notification
  const showToastNotification = useCallback((notification) => {
    // Crear elemento toast
    const toast = document.createElement('div');
    toast.className = 'notification-toast';
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
    `;

    toast.innerHTML = `
      <div style="display: flex; align-items: center; gap: 12px;">
        <div style="font-size: 20px;">🔔</div>
        <div style="flex: 1;">
          <div style="font-weight: 600; margin-bottom: 4px;">${notification.title}</div>
          <div style="font-size: 14px; opacity: 0.9;">${notification.message}</div>
        </div>
        <button style="background: none; border: none; color: white; font-size: 18px; cursor: pointer; padding: 4px;">×</button>
      </div>
    `;

    // Añadir estilos CSS si no existen
    if (!document.getElementById('notification-toast-styles')) {
      const style = document.createElement('style');
      style.id = 'notification-toast-styles';
      style.textContent = `
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOutRight {
          from { transform: translateX(0); opacity: 1; }
          to { transform: translateX(100%); opacity: 0; }
        }
      `;
      document.head.appendChild(style);
    }

    // Añadir al DOM
    document.body.appendChild(toast);

    // Auto-remover después de 5 segundos
    const autoRemove = setTimeout(() => {
      if (toast.parentNode) {
        toast.style.animation = 'slideOutRight 0.3s ease-in';
        setTimeout(() => {
          if (toast.parentNode) {
            toast.parentNode.removeChild(toast);
          }
        }, 300);
      }
    }, 5000);

    // Remover al hacer click
    toast.addEventListener('click', () => {
      clearTimeout(autoRemove);
      toast.style.animation = 'slideOutRight 0.3s ease-in';
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 300);
    });

    // Remover al hacer click en el botón X
    const closeBtn = toast.querySelector('button');
    closeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      clearTimeout(autoRemove);
      toast.style.animation = 'slideOutRight 0.3s ease-in';
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 300);
    });
  }, []);

  return {
    notifications,
    unreadCount,
    isConnected,
    addNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
    loadNotifications
  };
};

export default useNotifications;