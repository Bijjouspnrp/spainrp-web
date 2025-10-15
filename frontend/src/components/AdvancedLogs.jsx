import { apiUrl } from '../utils/api';
import React, { useEffect, useState, useCallback } from 'react';
import { 
  FaDownload, FaRedo, FaSearch, FaFilter, FaExpand, FaCompress, 
  FaCopy, FaSave, FaTrash, FaClock, FaExclamationTriangle, 
  FaInfoCircle, FaCheckCircle, FaCog, FaDatabase, FaShieldAlt,
  FaPlay, FaPause, FaStop, FaFileExport, FaChartBar
} from 'react-icons/fa';
const AdvancedLogs = () => {
  const [accessLog, setAccessLog] = useState('');
  const [errorLog, setErrorLog] = useState('');
  const [systemLog, setSystemLog] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLogType, setSelectedLogType] = useState('all');
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(null);
  const [expandedSections, setExpandedSections] = useState({
    access: true,
    error: true,
    system: true
  });
  const [notification, setNotification] = useState(null);

  const logTypes = {
    all: { label: 'Todos los Logs', color: '#7289da' },
    access: { label: 'Access Log', color: '#2ecc71' },
    error: { label: 'Error Log', color: '#e74c3c' },
    system: { label: 'System Log', color: '#f39c12' }
  };

  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('spainrp_token');
      if (!token) {
        setError('No autenticado. Inicia sesión como admin.');
        setLoading(false);
        return;
      }

      // Obtener logs usando la API mejorada
      const response = await fetch(apiUrl('/api/logs'), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 401) {
        setError('Token de autenticación inválido');
        setLoading(false);
        return;
      }
      if (response.status === 403) {
        setError('No tienes permisos para ver estos logs');
        setLoading(false);
        return;
      }
      if (!response.ok) {
        setError(`Error del servidor: ${response.status}`);
        setLoading(false);
        return;
      }

      const data = await response.json();
      
      if (data.success && data.logs) {
        // Separar logs por tipo
        const accessLogs = data.logs.filter(log => log.type === 'access');
        const errorLogs = data.logs.filter(log => log.type === 'error');
        const systemLogs = data.logs.filter(log => log.type === 'system');
        
        // Formatear logs para visualización
        setAccessLog(accessLogs.map(log => 
          `[${log.timestamp}] ${log.level?.toUpperCase() || 'INFO'} - ${log.message}\n` +
          `  User: ${log.user || 'N/A'}\n` +
          `  IP: ${log.ip || 'N/A'}\n` +
          `  UserAgent: ${log.userAgent || 'N/A'}\n` +
          (log.data ? `  Data: ${JSON.stringify(log.data, null, 2)}\n` : '') +
          '---\n'
        ).join(''));
        
        setErrorLog(errorLogs.map(log => 
          `[${log.timestamp}] ${log.level?.toUpperCase() || 'ERROR'} - ${log.message}\n` +
          `  User: ${log.user || 'N/A'}\n` +
          `  IP: ${log.ip || 'N/A'}\n` +
          `  Source: ${log.source || 'N/A'}\n` +
          (log.data ? `  Data: ${JSON.stringify(log.data, null, 2)}\n` : '') +
          '---\n'
        ).join(''));
        
        setSystemLog(systemLogs.map(log => 
          `[${log.timestamp}] ${log.level?.toUpperCase() || 'INFO'} - ${log.message}\n` +
          `  User: ${log.user || 'N/A'}\n` +
          `  IP: ${log.ip || 'N/A'}\n` +
          `  Source: ${log.source || 'N/A'}\n` +
          (log.data ? `  Data: ${JSON.stringify(log.data, null, 2)}\n` : '') +
          '---\n'
        ).join(''));
        
        showNotification('Logs cargados exitosamente', 'success');
      } else {
        setError('Error al procesar los logs del servidor');
      }
    } catch (e) {
      console.error('Error fetching logs:', e);
      setError('Error de red o servidor: ' + e.message);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  // Auto-refresh
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(fetchLogs, 10000); // Cada 10 segundos
      setRefreshInterval(interval);
    } else {
      if (refreshInterval) {
        clearInterval(refreshInterval);
        setRefreshInterval(null);
      }
    }

    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, [autoRefresh, fetchLogs]);

  // Funciones de utilidad
  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      showNotification('Copiado al portapapeles', 'success');
    } catch (err) {
      showNotification('Error al copiar', 'error');
    }
  };

  const downloadLog = (content, filename) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showNotification(`Archivo ${filename} descargado`, 'success');
  };

  const filterLogs = (logs, searchTerm) => {
    if (!searchTerm) return logs;
    return logs.split('\n').filter(line => 
      line.toLowerCase().includes(searchTerm.toLowerCase())
    ).join('\n');
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
      color: '#fff',
      fontFamily: 'monospace',
      padding: '6rem 2rem 2rem 2rem'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div>
          <h1 style={{
            color: '#FFD700',
            fontWeight: 800,
            fontSize: '2.5rem',
            margin: 0,
            background: 'linear-gradient(135deg, #FFD700 0%, #7289da 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            Logs Avanzados del Sistema
          </h1>
          <p style={{ margin: '0.5rem 0 0 0', opacity: 0.7, fontSize: '1.1rem' }}>
            Visualización detallada de logs del servidor
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            style={{
              background: autoRefresh ? '#2ecc71' : 'rgba(255, 255, 255, 0.1)',
              color: autoRefresh ? 'white' : '#e5e7eb',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              padding: '8px 16px',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '14px',
              fontWeight: '600'
            }}
          >
            {autoRefresh ? <FaPause /> : <FaPlay />}
            Auto-refresh
          </button>

          <button
            onClick={fetchLogs}
            style={{
              background: 'rgba(114, 137, 218, 0.2)',
              color: '#7289da',
              border: '1px solid #7289da',
              padding: '8px 16px',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '14px',
              fontWeight: '600'
            }}
          >
            <FaRedo />
            Actualizar
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.05)',
        padding: '1.5rem',
        borderRadius: '12px',
        marginBottom: '2rem',
        border: '1px solid rgba(114, 137, 218, 0.1)'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '1rem'
        }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#7289da' }}>
              <FaSearch style={{ marginRight: '8px' }} />
              Buscar en logs
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar en todos los logs..."
              style={{
                width: '100%',
                padding: '10px 12px',
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '8px',
                color: 'white',
                fontSize: '14px'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#7289da' }}>
              <FaFilter style={{ marginRight: '8px' }} />
              Tipo de Log
            </label>
            <select
              value={selectedLogType}
              onChange={(e) => setSelectedLogType(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '8px',
                color: 'white',
                fontSize: '14px'
              }}
            >
              {Object.entries(logTypes).map(([key, type]) => (
                <option key={key} value={key}>{type.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Notificación */}
      {notification && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          background: notification.type === 'error' ? '#e74c3c' : 
                     notification.type === 'success' ? '#2ecc71' : '#7289da',
          color: 'white',
          padding: '12px 20px',
          borderRadius: '8px',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
        }}>
          {notification.type === 'error' ? <FaExclamationTriangle /> : 
           notification.type === 'success' ? <FaCheckCircle /> : <FaInfoCircle />}
          {notification.message}
        </div>
      )}

      {/* Contenido principal */}
      {loading ? (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '400px',
          flexDirection: 'column',
          gap: '1rem'
        }}>
          <div style={{
            width: '50px',
            height: '50px',
            border: '3px solid #7289da',
            borderTop: '3px solid transparent',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
          <div style={{ color: '#FFD700', fontSize: '1.2rem' }}>Cargando logs...</div>
        </div>
      ) : error ? (
        <div style={{
          background: 'rgba(231, 76, 60, 0.1)',
          border: '1px solid #e74c3c',
          borderRadius: '12px',
          padding: '2rem',
          textAlign: 'center'
        }}>
          <FaExclamationTriangle size={48} style={{ color: '#e74c3c', marginBottom: '1rem' }} />
          <h3 style={{ color: '#e74c3c', marginBottom: '1rem' }}>Error cargando logs</h3>
          <p style={{ marginBottom: '2rem', opacity: 0.8 }}>{error}</p>
          <button
            onClick={fetchLogs}
            style={{
              background: '#7289da',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              margin: '0 auto'
            }}
          >
            <FaRedo />
            Reintentar
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Access Log */}
          {(selectedLogType === 'all' || selectedLogType === 'access') && (
            <div style={{
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '12px',
              border: '1px solid rgba(46, 204, 113, 0.2)',
              overflow: 'hidden'
            }}>
              <div
                style={{
                  background: 'rgba(46, 204, 113, 0.1)',
                  padding: '1rem 1.5rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderBottom: expandedSections.access ? '1px solid rgba(46, 204, 113, 0.2)' : 'none'
                }}
                onClick={() => toggleSection('access')}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <FaDatabase style={{ color: '#2ecc71' }} />
                  <h3 style={{ margin: 0, color: '#2ecc71', fontSize: '1.2rem' }}>
                    Access Log ({accessLog.split('---').length - 1} entradas)
                  </h3>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      copyToClipboard(accessLog);
                    }}
                    style={{
                      background: 'rgba(46, 204, 113, 0.2)',
                      color: '#2ecc71',
                      border: '1px solid #2ecc71',
                      padding: '6px 12px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    <FaCopy />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      downloadLog(accessLog, 'access-log.txt');
                    }}
                    style={{
                      background: 'rgba(46, 204, 113, 0.2)',
                      color: '#2ecc71',
                      border: '1px solid #2ecc71',
                      padding: '6px 12px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    <FaDownload />
                  </button>
                  {expandedSections.access ? <FaCompress /> : <FaExpand />}
                </div>
              </div>
              {expandedSections.access && (
                <pre style={{
                  background: '#23272a',
                  padding: '1rem',
                  margin: 0,
                  maxHeight: '400px',
                  overflow: 'auto',
                  fontSize: '12px',
                  lineHeight: '1.4'
                }}>
                  {filterLogs(accessLog, searchTerm)}
                </pre>
              )}
            </div>
          )}

          {/* Error Log */}
          {(selectedLogType === 'all' || selectedLogType === 'error') && (
            <div style={{
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '12px',
              border: '1px solid rgba(231, 76, 60, 0.2)',
              overflow: 'hidden'
            }}>
              <div
                style={{
                  background: 'rgba(231, 76, 60, 0.1)',
                  padding: '1rem 1.5rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderBottom: expandedSections.error ? '1px solid rgba(231, 76, 60, 0.2)' : 'none'
                }}
                onClick={() => toggleSection('error')}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <FaExclamationTriangle style={{ color: '#e74c3c' }} />
                  <h3 style={{ margin: 0, color: '#e74c3c', fontSize: '1.2rem' }}>
                    Error Log ({errorLog.split('---').length - 1} entradas)
                  </h3>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      copyToClipboard(errorLog);
                    }}
                    style={{
                      background: 'rgba(231, 76, 60, 0.2)',
                      color: '#e74c3c',
                      border: '1px solid #e74c3c',
                      padding: '6px 12px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    <FaCopy />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      downloadLog(errorLog, 'error-log.txt');
                    }}
                    style={{
                      background: 'rgba(231, 76, 60, 0.2)',
                      color: '#e74c3c',
                      border: '1px solid #e74c3c',
                      padding: '6px 12px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    <FaDownload />
                  </button>
                  {expandedSections.error ? <FaCompress /> : <FaExpand />}
                </div>
              </div>
              {expandedSections.error && (
                <pre style={{
                  background: '#23272a',
                  padding: '1rem',
                  margin: 0,
                  maxHeight: '400px',
                  overflow: 'auto',
                  fontSize: '12px',
                  lineHeight: '1.4'
                }}>
                  {filterLogs(errorLog, searchTerm)}
                </pre>
              )}
            </div>
          )}

          {/* System Log */}
          {(selectedLogType === 'all' || selectedLogType === 'system') && (
            <div style={{
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '12px',
              border: '1px solid rgba(243, 156, 18, 0.2)',
              overflow: 'hidden'
            }}>
              <div
                style={{
                  background: 'rgba(243, 156, 18, 0.1)',
                  padding: '1rem 1.5rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderBottom: expandedSections.system ? '1px solid rgba(243, 156, 18, 0.2)' : 'none'
                }}
                onClick={() => toggleSection('system')}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <FaCog style={{ color: '#f39c12' }} />
                  <h3 style={{ margin: 0, color: '#f39c12', fontSize: '1.2rem' }}>
                    System Log ({systemLog.split('---').length - 1} entradas)
                  </h3>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      copyToClipboard(systemLog);
                    }}
                    style={{
                      background: 'rgba(243, 156, 18, 0.2)',
                      color: '#f39c12',
                      border: '1px solid #f39c12',
                      padding: '6px 12px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    <FaCopy />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      downloadLog(systemLog, 'system-log.txt');
                    }}
                    style={{
                      background: 'rgba(243, 156, 18, 0.2)',
                      color: '#f39c12',
                      border: '1px solid #f39c12',
                      padding: '6px 12px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    <FaDownload />
                  </button>
                  {expandedSections.system ? <FaCompress /> : <FaExpand />}
                </div>
              </div>
              {expandedSections.system && (
                <pre style={{
                  background: '#23272a',
                  padding: '1rem',
                  margin: 0,
                  maxHeight: '400px',
                  overflow: 'auto',
                  fontSize: '12px',
                  lineHeight: '1.4'
                }}>
                  {filterLogs(systemLog, searchTerm)}
                </pre>
              )}
            </div>
          )}
        </div>
      )}

      {/* Estilos CSS */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        pre::-webkit-scrollbar {
          width: 6px;
        }
        
        pre::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
        }
        
        pre::-webkit-scrollbar-thumb {
          background: rgba(114, 137, 218, 0.5);
          border-radius: 3px;
        }
        
        pre::-webkit-scrollbar-thumb:hover {
          background: rgba(114, 137, 218, 0.7);
        }
      `}</style>
    </div>
  );
};

export default AdvancedLogs;
