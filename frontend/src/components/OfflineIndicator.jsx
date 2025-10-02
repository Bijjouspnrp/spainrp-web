import React from 'react';
import { FaWifi, FaWifiSlash, FaSync, FaExclamationTriangle } from 'react-icons/fa';
import useOffline from '../hooks/useOffline';
import './OfflineIndicator.css';

const OfflineIndicator = () => {
  const { isOffline, isOnline, lastOnline } = useOffline();

  if (!isOffline) {
    return null;
  }

  const formatLastOnline = (date) => {
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `hace ${days} día${days > 1 ? 's' : ''}`;
    } else if (hours > 0) {
      return `hace ${hours} hora${hours > 1 ? 's' : ''}`;
    } else if (minutes > 0) {
      return `hace ${minutes} minuto${minutes > 1 ? 's' : ''}`;
    } else {
      return 'hace un momento';
    }
  };

  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <div className="offline-indicator">
      <div className="offline-content">
        <div className="offline-icon">
          <FaWifiSlash />
        </div>
        <div className="offline-text">
          <div className="offline-title">Sin Conexión</div>
          <div className="offline-subtitle">
            Última conexión: {formatLastOnline(lastOnline)}
          </div>
        </div>
        <button 
          className="offline-retry"
          onClick={handleRetry}
          title="Intentar reconectar"
        >
          <FaSync />
        </button>
      </div>
      
      <div className="offline-warning">
        <FaExclamationTriangle />
        <span>Algunas funciones pueden no estar disponibles</span>
      </div>
    </div>
  );
};

export default OfflineIndicator;
