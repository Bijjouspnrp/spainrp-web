import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaBell, 
  FaTimes, 
  FaCheck, 
  FaTrash, 
  FaCog,
  FaVolumeUp,
  FaVolumeMute
} from 'react-icons/fa';
import useNotifications from '../../hooks/useNotifications';

const NotificationCenter = () => {
  const {
    notifications,
    unreadCount,
    isConnected,
    markAsRead,
    markAllAsRead,
    clearAll
  } = useNotifications();

  const [isOpen, setIsOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(
    localStorage.getItem('spainrp_notification_sound') !== 'false'
  );

  const toggleSound = () => {
    const newValue = !soundEnabled;
    setSoundEnabled(newValue);
    localStorage.setItem('spainrp_notification_sound', newValue.toString());
  };

  const formatTime = (timestamp) => {
    const now = new Date();
    const diff = now - new Date(timestamp);
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Ahora';
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    return `${days}d`;
  };

  const getNotificationStyle = (type, read) => {
    const baseStyle = {
      padding: '12px 16px',
      borderRadius: '12px',
      marginBottom: '8px',
      border: '1px solid',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      position: 'relative'
    };

    const typeStyles = {
      info: {
        background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(59, 130, 246, 0.05))',
        borderColor: 'rgba(59, 130, 246, 0.3)',
        color: '#1e40af'
      },
      success: {
        background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(34, 197, 94, 0.05))',
        borderColor: 'rgba(34, 197, 94, 0.3)',
        color: '#166534'
      },
      warning: {
        background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(245, 158, 11, 0.05))',
        borderColor: 'rgba(245, 158, 11, 0.3)',
        color: '#92400e'
      },
      error: {
        background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(239, 68, 68, 0.05))',
        borderColor: 'rgba(239, 68, 68, 0.3)',
        color: '#991b1b'
      },
      announcement: {
        background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.1), rgba(168, 85, 247, 0.05))',
        borderColor: 'rgba(168, 85, 247, 0.3)',
        color: '#7c3aed'
      },
      admin: {
        background: 'linear-gradient(135deg, rgba(114, 137, 218, 0.1), rgba(114, 137, 218, 0.05))',
        borderColor: 'rgba(114, 137, 218, 0.3)',
        color: '#4f46e5'
      }
    };

    return {
      ...baseStyle,
      ...typeStyles[type] || typeStyles.info,
      opacity: read ? 0.7 : 1,
      fontWeight: read ? 'normal' : '600'
    };
  };

  return (
    <div className="notification-center" style={{ position: 'relative' }}>
      {/* Botón de notificaciones */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        style={{
          background: 'linear-gradient(135deg, #7289da, #5865f2)',
          border: 'none',
          borderRadius: '12px',
          padding: '12px',
          color: 'white',
          cursor: 'pointer',
          position: 'relative',
          boxShadow: '0 4px 12px rgba(114, 137, 218, 0.3)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}
      >
        <FaBell size={16} />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            style={{
              position: 'absolute',
              top: '-4px',
              right: '-4px',
              background: '#ef4444',
              color: 'white',
              borderRadius: '50%',
              width: '20px',
              height: '20px',
              fontSize: '10px',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </motion.span>
        )}
        <span style={{ fontSize: '14px', fontWeight: '600' }}>
          Notificaciones
        </span>
      </motion.button>

      {/* Panel de notificaciones */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            style={{
              position: 'absolute',
              top: '100%',
              right: '0',
              marginTop: '8px',
              width: '400px',
              maxHeight: '500px',
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              borderRadius: '16px',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
              border: '1px solid rgba(114, 137, 218, 0.2)',
              zIndex: 1000,
              overflow: 'hidden'
            }}
          >
            {/* Header */}
            <div style={{
              padding: '16px 20px',
              borderBottom: '1px solid rgba(114, 137, 218, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'linear-gradient(135deg, rgba(114, 137, 218, 0.05), rgba(114, 137, 218, 0.02))'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#2c2f33' }}>
                  Notificaciones
                </h3>
                {isConnected ? (
                  <div style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: '#10b981',
                    animation: 'pulse 2s infinite'
                  }} />
                ) : (
                  <div style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: '#ef4444'
                  }} />
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  onClick={toggleSound}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '4px',
                    borderRadius: '6px',
                    color: soundEnabled ? '#10b981' : '#6b7280'
                  }}
                  title={soundEnabled ? 'Sonido activado' : 'Sonido desactivado'}
                >
                  {soundEnabled ? <FaVolumeUp size={14} /> : <FaVolumeMute size={14} />}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '4px',
                    borderRadius: '6px',
                    color: '#6b7280'
                  }}
                >
                  <FaTimes size={14} />
                </button>
              </div>
            </div>

            {/* Contenido */}
            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {notifications.length === 0 ? (
                <div style={{
                  padding: '40px 20px',
                  textAlign: 'center',
                  color: '#6b7280'
                }}>
                  <FaBell size={32} style={{ marginBottom: '12px', opacity: 0.5 }} />
                  <p style={{ margin: 0, fontSize: '14px' }}>
                    No hay notificaciones
                  </p>
                </div>
              ) : (
                <div style={{ padding: '12px' }}>
                  {notifications.map((notification, index) => (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => !notification.read && markAsRead(notification.id)}
                      style={getNotificationStyle(notification.type, notification.read)}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                        <div style={{ fontSize: '16px', marginTop: '2px' }}>
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{
                            fontSize: '14px',
                            fontWeight: notification.read ? '500' : '600',
                            marginBottom: '4px',
                            lineHeight: '1.4'
                          }}>
                            {notification.title || 'Notificación'}
                          </div>
                          {notification.message && (
                            <div style={{
                              fontSize: '12px',
                              opacity: 0.8,
                              lineHeight: '1.4',
                              marginBottom: '4px'
                            }}>
                              {notification.message}
                            </div>
                          )}
                          <div style={{
                            fontSize: '10px',
                            opacity: 0.6,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                          }}>
                            <span>{formatTime(notification.timestamp)}</span>
                            {!notification.read && (
                              <div style={{
                                width: '6px',
                                height: '6px',
                                borderRadius: '50%',
                                background: '#7289da'
                              }} />
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div style={{
                padding: '12px 20px',
                borderTop: '1px solid rgba(114, 137, 218, 0.1)',
                display: 'flex',
                gap: '8px',
                background: 'rgba(114, 137, 218, 0.02)'
              }}>
                <button
                  onClick={markAllAsRead}
                  style={{
                    background: 'linear-gradient(135deg, #10b981, #059669)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    fontSize: '12px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <FaCheck size={10} />
                  Marcar todas
                </button>
                <button
                  onClick={clearAll}
                  style={{
                    background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    fontSize: '12px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <FaTrash size={10} />
                  Limpiar
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
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

export default NotificationCenter;
