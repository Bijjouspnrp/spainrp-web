import React, { useState } from 'react';
import { authFetch } from '../../utils/api.js';

const NotificationSender = () => {
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'info',
    target: 'all',
    targetUser: '',
    priority: 'normal'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      console.log('[NOTIFICATION SENDER] 🚀 Enviando notificación:', formData);

      // Verificar que tenemos token
      const token = localStorage.getItem('spainrp_token');
      if (!token) {
        throw new Error('No hay token de autenticación. Por favor, inicia sesión.');
      }

      console.log('[NOTIFICATION SENDER] 🔑 Token encontrado:', token.substring(0, 20) + '...');

      const response = await authFetch('/api/notifications/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      console.log('[NOTIFICATION SENDER] 📡 Respuesta del servidor:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Error del servidor: ${response.status}`);
      }

      const data = await response.json();
      console.log('[NOTIFICATION SENDER] ✅ Notificación enviada exitosamente:', data);

      setResult({
        success: true,
        notificationId: data.notificationId,
        message: data.message,
        target: data.target,
        isGlobal: data.isGlobal
      });

      // Limpiar formulario
      setFormData({
        title: '',
        message: '',
        type: 'info',
        target: 'all',
        targetUser: '',
        priority: 'normal'
      });

    } catch (err) {
      console.error('[NOTIFICATION SENDER] ❌ Error:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div style={{
      maxWidth: '600px',
      margin: '20px auto',
      padding: '20px',
      background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
      borderRadius: '12px',
      border: '2px solid #7289da',
      color: '#fff'
    }}>
      <h2 style={{ color: '#FFD700', marginBottom: '20px' }}>
        📢 Enviar Notificación
      </h2>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', color: '#e2e8f0' }}>
            Título *
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: '6px',
              border: '1px solid #7289da',
              background: '#2d2d2d',
              color: '#fff',
              fontSize: '14px'
            }}
            placeholder="Título de la notificación"
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', color: '#e2e8f0' }}>
            Mensaje *
          </label>
          <textarea
            name="message"
            value={formData.message}
            onChange={handleChange}
            required
            rows={4}
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: '6px',
              border: '1px solid #7289da',
              background: '#2d2d2d',
              color: '#fff',
              fontSize: '14px',
              resize: 'vertical'
            }}
            placeholder="Mensaje de la notificación"
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', color: '#e2e8f0' }}>
              Tipo
            </label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '6px',
                border: '1px solid #7289da',
                background: '#2d2d2d',
                color: '#fff',
                fontSize: '14px'
              }}
            >
              <option value="info">ℹ️ Información</option>
              <option value="success">✅ Éxito</option>
              <option value="warning">⚠️ Advertencia</option>
              <option value="error">❌ Error</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px', color: '#e2e8f0' }}>
              Prioridad
            </label>
            <select
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '6px',
                border: '1px solid #7289da',
                background: '#2d2d2d',
                color: '#fff',
                fontSize: '14px'
              }}
            >
              <option value="low">🟢 Baja</option>
              <option value="normal">🟡 Normal</option>
              <option value="high">🟠 Alta</option>
              <option value="urgent">🔴 Urgente</option>
            </select>
          </div>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', color: '#e2e8f0' }}>
            Destinatario
          </label>
          <select
            name="target"
            value={formData.target}
            onChange={handleChange}
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: '6px',
              border: '1px solid #7289da',
              background: '#2d2d2d',
              color: '#fff',
              fontSize: '14px'
            }}
          >
            <option value="all">🌍 Todos los usuarios</option>
            <option value="online">🟢 Solo usuarios online</option>
            <option value="specific">👤 Usuario específico</option>
          </select>
        </div>

        {formData.target === 'specific' && (
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', color: '#e2e8f0' }}>
              ID del Usuario
            </label>
            <input
              type="text"
              name="targetUser"
              value={formData.targetUser}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '6px',
                border: '1px solid #7289da',
                background: '#2d2d2d',
                color: '#fff',
                fontSize: '14px'
              }}
              placeholder="ID de Discord del usuario"
            />
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          style={{
            width: '100%',
            padding: '12px',
            borderRadius: '6px',
            border: 'none',
            background: isLoading ? '#666' : '#7289da',
            color: '#fff',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            transition: 'background 0.2s'
          }}
        >
          {isLoading ? '⏳ Enviando...' : '📤 Enviar Notificación'}
        </button>
      </form>

      {error && (
        <div style={{
          marginTop: '15px',
          padding: '10px',
          background: 'rgba(220, 38, 38, 0.1)',
          border: '1px solid #dc2626',
          borderRadius: '6px',
          color: '#fca5a5'
        }}>
          ❌ {error}
        </div>
      )}

      {result && (
        <div style={{
          marginTop: '15px',
          padding: '10px',
          background: 'rgba(34, 197, 94, 0.1)',
          border: '1px solid #22c55e',
          borderRadius: '6px',
          color: '#86efac'
        }}>
          ✅ {result.message}
          <br />
          <small>
            ID: {result.notificationId} | 
            Destino: {result.target} | 
            Global: {result.isGlobal ? 'Sí' : 'No'}
          </small>
        </div>
      )}
    </div>
  );
};

export default NotificationSender;
