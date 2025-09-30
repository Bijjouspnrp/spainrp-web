import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FaPaperPlane, 
  FaUsers, 
  FaUser, 
  FaGlobe,
  FaCog,
  FaTimes,
  FaCheck
} from 'react-icons/fa';
import { apiUrl, authFetch } from '../../utils/api';

const AdminNotificationSender = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'info',
    target: 'all', // all, online, specific
    targetUser: '',
    priority: 'normal'
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const notificationTypes = [
    { value: 'info', label: 'Información', icon: 'ℹ️', color: '#3b82f6' },
    { value: 'success', label: 'Éxito', icon: '✅', color: '#10b981' },
    { value: 'warning', label: 'Advertencia', icon: '⚠️', color: '#f59e0b' },
    { value: 'error', label: 'Error', icon: '❌', color: '#ef4444' },
    { value: 'announcement', label: 'Anuncio', icon: '📢', color: '#8b5cf6' },
    { value: 'admin', label: 'Admin', icon: '👑', color: '#7289da' }
  ];

  const targetOptions = [
    { value: 'all', label: 'Todos los usuarios', icon: FaGlobe, description: 'Enviar a todos los usuarios registrados' },
    { value: 'online', label: 'Usuarios online', icon: FaUsers, description: 'Solo usuarios conectados actualmente' },
    { value: 'specific', label: 'Usuario específico', icon: FaUser, description: 'Enviar a un usuario en particular' }
  ];

  const priorityOptions = [
    { value: 'low', label: 'Baja', color: '#6b7280' },
    { value: 'normal', label: 'Normal', color: '#3b82f6' },
    { value: 'high', label: 'Alta', color: '#f59e0b' },
    { value: 'urgent', label: 'Urgente', color: '#ef4444' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.message.trim()) return;

    setLoading(true);
    setSuccess(false);

    try {
      const payload = {
        ...formData,
        targetUser: formData.target === 'specific' ? formData.targetUser : undefined
      };

      const response = await authFetch(apiUrl('/api/notifications/send'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        setSuccess(true);
        setFormData({
          title: '',
          message: '',
          type: 'info',
          target: 'all',
          targetUser: '',
          priority: 'normal'
        });
        
        setTimeout(() => {
          setSuccess(false);
          onClose();
        }, 2000);
      } else {
        throw new Error('Error enviando notificación');
      }
    } catch (error) {
      console.error('[ADMIN-NOTIFICATIONS] Error:', error);
      alert('Error enviando notificación. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
        padding: '20px'
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(248, 250, 252, 0.95))',
          backdropFilter: 'blur(20px)',
          borderRadius: '20px',
          padding: '32px',
          maxWidth: '600px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 25px 50px rgba(0, 0, 0, 0.15)',
          border: '1px solid rgba(114, 137, 218, 0.2)',
          position: 'relative'
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '24px',
          paddingBottom: '16px',
          borderBottom: '1px solid rgba(114, 137, 218, 0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              background: 'linear-gradient(135deg, #7289da, #5865f2)',
              borderRadius: '12px',
              padding: '8px',
              color: 'white'
            }}>
              <FaPaperPlane size={20} />
            </div>
            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '700', color: '#2c2f33' }}>
              Enviar Notificación
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '8px',
              borderRadius: '8px',
              color: '#6b7280',
              fontSize: '18px'
            }}
          >
            <FaTimes />
          </button>
        </div>

        {/* Success Message */}
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              background: 'linear-gradient(135deg, #10b981, #059669)',
              color: 'white',
              padding: '12px 16px',
              borderRadius: '12px',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontWeight: '600'
            }}
          >
            <FaCheck />
            Notificación enviada exitosamente
          </motion.div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {/* Tipo de notificación */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '8px'
            }}>
              Tipo de notificación
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '8px' }}>
              {notificationTypes.map(type => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => handleInputChange('type', type.value)}
                  style={{
                    background: formData.type === type.value 
                      ? type.color 
                      : 'rgba(114, 137, 218, 0.1)',
                    color: formData.type === type.value 
                      ? 'white' 
                      : '#374151',
                    border: `2px solid ${formData.type === type.value ? type.color : 'transparent'}`,
                    borderRadius: '10px',
                    padding: '12px 8px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: '600',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '4px',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <span style={{ fontSize: '16px' }}>{type.icon}</span>
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          {/* Título */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '8px'
            }}>
              Título *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Título de la notificación"
              required
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: '12px',
                border: '2px solid rgba(114, 137, 218, 0.2)',
                fontSize: '14px',
                background: 'rgba(255, 255, 255, 0.8)',
                transition: 'all 0.2s ease'
              }}
            />
          </div>

          {/* Mensaje */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '8px'
            }}>
              Mensaje *
            </label>
            <textarea
              value={formData.message}
              onChange={(e) => handleInputChange('message', e.target.value)}
              placeholder="Contenido de la notificación"
              required
              rows={4}
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: '12px',
                border: '2px solid rgba(114, 137, 218, 0.2)',
                fontSize: '14px',
                background: 'rgba(255, 255, 255, 0.8)',
                resize: 'vertical',
                minHeight: '100px',
                fontFamily: 'inherit'
              }}
            />
          </div>

          {/* Destinatario */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '8px'
            }}>
              Destinatario
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {targetOptions.map(option => (
                <label
                  key={option.value}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    border: `2px solid ${formData.target === option.value ? '#7289da' : 'rgba(114, 137, 218, 0.2)'}`,
                    background: formData.target === option.value 
                      ? 'rgba(114, 137, 218, 0.1)' 
                      : 'rgba(255, 255, 255, 0.5)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <input
                    type="radio"
                    name="target"
                    value={option.value}
                    checked={formData.target === option.value}
                    onChange={(e) => handleInputChange('target', e.target.value)}
                    style={{ margin: 0 }}
                  />
                  <option.icon size={16} color="#7289da" />
                  <div>
                    <div style={{ fontWeight: '600', fontSize: '14px' }}>
                      {option.label}
                    </div>
                    <div style={{ fontSize: '12px', opacity: 0.7 }}>
                      {option.description}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Usuario específico */}
          {formData.target === 'specific' && (
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '8px'
              }}>
                ID de Usuario
              </label>
              <input
                type="text"
                value={formData.targetUser}
                onChange={(e) => handleInputChange('targetUser', e.target.value)}
                placeholder="ID de Discord del usuario"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  border: '2px solid rgba(114, 137, 218, 0.2)',
                  fontSize: '14px',
                  background: 'rgba(255, 255, 255, 0.8)'
                }}
              />
            </div>
          )}

          {/* Prioridad */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '8px'
            }}>
              Prioridad
            </label>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {priorityOptions.map(priority => (
                <button
                  key={priority.value}
                  type="button"
                  onClick={() => handleInputChange('priority', priority.value)}
                  style={{
                    background: formData.priority === priority.value 
                      ? priority.color 
                      : 'rgba(114, 137, 218, 0.1)',
                    color: formData.priority === priority.value 
                      ? 'white' 
                      : '#374151',
                    border: `2px solid ${formData.priority === priority.value ? priority.color : 'transparent'}`,
                    borderRadius: '8px',
                    padding: '8px 16px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: '600',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {priority.label}
                </button>
              ))}
            </div>
          </div>

          {/* Botones */}
          <div style={{
            display: 'flex',
            gap: '12px',
            justifyContent: 'flex-end'
          }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                background: 'rgba(107, 114, 128, 0.1)',
                color: '#6b7280',
                border: 'none',
                borderRadius: '12px',
                padding: '12px 24px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || !formData.title.trim() || !formData.message.trim()}
              style={{
                background: loading 
                  ? 'rgba(114, 137, 218, 0.5)' 
                  : 'linear-gradient(135deg, #7289da, #5865f2)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                padding: '12px 24px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s ease',
                opacity: loading ? 0.7 : 1
              }}
            >
              {loading ? (
                <>
                  <div style={{
                    width: '16px',
                    height: '16px',
                    border: '2px solid rgba(255,255,255,0.3)',
                    borderTop: '2px solid white',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }} />
                  Enviando...
                </>
              ) : (
                <>
                  <FaPaperPlane size={14} />
                  Enviar Notificación
                </>
              )}
            </button>
          </div>
        </form>

        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </motion.div>
    </motion.div>
  );
};

export default AdminNotificationSender;
