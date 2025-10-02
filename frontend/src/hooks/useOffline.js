import { useState, useEffect } from 'react';

// Hook para manejar el estado offline
export const useOffline = () => {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [lastOnline, setLastOnline] = useState(new Date());

  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      setIsOnline(true);
      setLastOnline(new Date());
      
      // Mostrar notificación de reconexión
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Conexión Restaurada', {
          body: 'Se ha restaurado la conexión a internet',
          icon: '/assets/spainrplogo.png',
          tag: 'connection-restored'
        });
      }
      
      // Recargar la página después de un breve delay
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    };

    const handleOffline = () => {
      setIsOffline(true);
      setIsOnline(false);
      
      // Mostrar notificación de desconexión
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Sin Conexión', {
          body: 'Se ha perdido la conexión a internet',
          icon: '/assets/spainrplogo.png',
          tag: 'connection-lost'
        });
      }
    };

    // Escuchar eventos de conexión
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Verificar conexión periódicamente
    const checkConnection = async () => {
      try {
        const response = await fetch('/api/health', {
          method: 'HEAD',
          mode: 'no-cors',
          cache: 'no-cache'
        });
        
        if (!isOnline) {
          handleOnline();
        }
      } catch (error) {
        if (isOnline) {
          handleOffline();
        }
      }
    };

    // Verificar cada 10 segundos
    const interval = setInterval(checkConnection, 10000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, [isOnline]);

  return {
    isOffline,
    isOnline,
    lastOnline
  };
};

// Hook para manejar notificaciones
export const useNotifications = () => {
  const [permission, setPermission] = useState(Notification.permission);

  const requestPermission = async () => {
    if ('Notification' in window) {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result;
    }
    return 'denied';
  };

  const showNotification = (title, options = {}) => {
    if (permission === 'granted') {
      return new Notification(title, {
        icon: '/assets/spainrplogo.png',
        badge: '/assets/spainrplogo.png',
        ...options
      });
    }
    return null;
  };

  return {
    permission,
    requestPermission,
    showNotification
  };
};

// Hook para manejar cache offline
export const useOfflineCache = () => {
  const [cacheStatus, setCacheStatus] = useState('unknown');

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        if (registration.active) {
          setCacheStatus('ready');
        } else {
          setCacheStatus('installing');
        }
      });
    } else {
      setCacheStatus('unsupported');
    }
  }, []);

  const clearCache = async () => {
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      );
      setCacheStatus('cleared');
    }
  };

  const updateCache = async () => {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.ready;
      if (registration.waiting) {
        registration.waiting.postMessage({ type: 'SKIP_WAITING' });
        window.location.reload();
      }
    }
  };

  return {
    cacheStatus,
    clearCache,
    updateCache
  };
};

export default useOffline;
