import React, { useState, useEffect } from 'react';
import { FaTools, FaPowerOff, FaPlay, FaClock, FaUsers, FaEnvelope, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';
import { apiUrl } from '../utils/api';

const MaintenanceControl = ({ showToast }) => {
  const [maintenanceStatus, setMaintenanceStatus] = useState({
    maintenance: false,
    startedAt: null,
    message: '',
    activatedBy: null,
    activatedAt: null
  });
  const [loading, setLoading] = useState(false);
  const [customMessage, setCustomMessage] = useState('');
  const [subscribers, setSubscribers] = useState([]);
  const [subscribersLoading, setSubscribersLoading] = useState(false);

  // Cargar estado inicial
  useEffect(() => {
    fetchMaintenanceStatus();
    fetchSubscribers();
  }, []);

  const fetchMaintenanceStatus = async () => {
    try {
      const response = await fetch(apiUrl('/api/maintenance/status'));
      const data = await response.json();
      setMaintenanceStatus(data);
    } catch (error) {
      console.error('[MAINTENANCE] Error obteniendo estado:', error);
      showToast('Error obteniendo estado de mantenimiento', 'error');
    }
  };

  const fetchSubscribers = async () => {
    setSubscribersLoading(true);
    try {
      const token = localStorage.getItem('spainrp_token');
      const response = await fetch(apiUrl('/api/maintenance/subscribers'), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      const data = await response.json();
      setSubscribers(data.subscribers || []);
    } catch (error) {
      console.error('[MAINTENANCE] Error obteniendo suscriptores:', error);
    } finally {
      setSubscribersLoading(false);
    }
  };

  const toggleMaintenance = async (action) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('spainrp_token');
      const response = await fetch(apiUrl('/api/maintenance/toggle'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          action,
          message: customMessage || undefined
        })
      });

      const data = await response.json();
      
      if (data.success) {
        showToast(data.message, 'success');
        await fetchMaintenanceStatus();
        await fetchSubscribers();
      } else {
        showToast(data.error || 'Error al cambiar modo mantenimiento', 'error');
      }
    } catch (error) {
      console.error('[MAINTENANCE] Error cambiando modo:', error);
      showToast('Error al cambiar modo mantenimiento', 'error');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('es-ES');
  };

  const getDuration = (startTime) => {
    if (!startTime) return 'N/A';
    const now = new Date();
    const start = new Date(startTime);
    const diffMs = now - start;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    
    if (diffHours > 0) {
      return `${diffHours}h ${diffMins % 60}m`;
    }
    return `${diffMins}m`;
  };

  return (
    <div className="maintenance-control">
      <div className="maintenance-header">
        <h3><FaTools /> Control de Mantenimiento</h3>
        <div className={`maintenance-status ${maintenanceStatus.maintenance ? 'active' : 'inactive'}`}>
          {maintenanceStatus.maintenance ? (
            <>
              <FaExclamationTriangle className="status-icon" />
              <span>Mantenimiento Activo</span>
            </>
          ) : (
            <>
              <FaCheckCircle className="status-icon" />
              <span>Servidor Normal</span>
            </>
          )}
        </div>
      </div>

      <div className="maintenance-info">
        {maintenanceStatus.maintenance ? (
          <div className="maintenance-details">
            <div className="info-item">
              <strong>Iniciado:</strong> {formatDate(maintenanceStatus.startedAt)}
            </div>
            <div className="info-item">
              <strong>Duración:</strong> {getDuration(maintenanceStatus.startedAt)}
            </div>
            <div className="info-item">
              <strong>Mensaje:</strong> {maintenanceStatus.message}
            </div>
            {maintenanceStatus.activatedBy && (
              <div className="info-item">
                <strong>Activado por:</strong> {maintenanceStatus.activatedBy}
              </div>
            )}
          </div>
        ) : (
          <div className="maintenance-details">
            <div className="info-item">
              <strong>Estado:</strong> Servidor funcionando normalmente
            </div>
            <div className="info-item">
              <strong>Última actualización:</strong> {formatDate(new Date().toISOString())}
            </div>
          </div>
        )}
      </div>

      <div className="maintenance-actions">
        <div className="action-group">
          <label htmlFor="customMessage">Mensaje personalizado (opcional):</label>
          <textarea
            id="customMessage"
            value={customMessage}
            onChange={(e) => setCustomMessage(e.target.value)}
            placeholder="Mensaje que se mostrará a los usuarios durante el mantenimiento..."
            rows={3}
          />
        </div>

        <div className="action-buttons">
          {!maintenanceStatus.maintenance ? (
            <button
              className="btn-maintenance btn-activate"
              onClick={() => toggleMaintenance('on')}
              disabled={loading}
            >
              <FaPlay />
              {loading ? 'Activando...' : 'Activar Mantenimiento'}
            </button>
          ) : (
            <button
              className="btn-maintenance btn-deactivate"
              onClick={() => toggleMaintenance('off')}
              disabled={loading}
            >
              <FaPowerOff />
              {loading ? 'Desactivando...' : 'Desactivar Mantenimiento'}
            </button>
          )}
        </div>
      </div>

      <div className="maintenance-subscribers">
        <h4><FaUsers /> Suscriptores de Notificaciones ({subscribers.length})</h4>
        {subscribersLoading ? (
          <div className="loading">Cargando suscriptores...</div>
        ) : subscribers.length > 0 ? (
          <div className="subscribers-list">
            {subscribers.map((subscriber, index) => (
              <div key={index} className="subscriber-item">
                <FaEnvelope className="subscriber-icon" />
                <span className="subscriber-email">{subscriber.email}</span>
                <span className="subscriber-date">
                  {formatDate(subscriber.subscribedAt)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-subscribers">
            No hay suscriptores registrados
          </div>
        )}
      </div>

      <div className="maintenance-warning">
        <FaExclamationTriangle className="warning-icon" />
        <p>
          <strong>Advertencia:</strong> Al activar el modo mantenimiento, todos los usuarios 
          verán la página de mantenimiento y no podrán acceder al sitio web hasta que lo desactives.
        </p>
      </div>
    </div>
  );
};

export default MaintenanceControl;
