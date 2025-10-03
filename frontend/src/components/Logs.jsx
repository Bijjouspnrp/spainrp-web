import React, { useState, useEffect, useCallback } from 'react';
import { FaDownload, FaRedo, FaFilter, FaSearch, FaTrash, FaEye, FaEyeSlash, FaClock, FaExclamationTriangle, FaInfoCircle, FaCheckCircle, FaTimes, FaChevronDown, FaChevronUp, FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';
import { apiUrl } from '../utils/api';

const Logs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [levelFilter, setLevelFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('timestamp');
  const [sortOrder, setSortOrder] = useState('desc');
  const [expandedLogs, setExpandedLogs] = useState(new Set());
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(null);
  const [showStats, setShowStats] = useState(false);
  const [stats, setStats] = useState(null);

  // Tipos de logs y sus colores
  const logTypes = {
    access: { label: 'Acceso', color: '#7289da', icon: <FaInfoCircle /> },
    error: { label: 'Error', color: '#e74c3c', icon: <FaExclamationTriangle /> },
    auth: { label: 'Autenticación', color: '#f39c12', icon: <FaCheckCircle /> },
    admin: { label: 'Administración', color: '#9b59b6', icon: <FaInfoCircle /> },
    api: { label: 'API', color: '#2ecc71', icon: <FaInfoCircle /> },
    system: { label: 'Sistema', color: '#95a5a6', icon: <FaInfoCircle /> },
    security: { label: 'Seguridad', color: '#e67e22', icon: <FaExclamationTriangle /> },
    database: { label: 'Base de Datos', color: '#3498db', icon: <FaInfoCircle /> },
    payment: { label: 'Pagos', color: '#27ae60', icon: <FaCheckCircle /> },
    discord: { label: 'Discord', color: '#5865f2', icon: <FaInfoCircle /> },
    roblox: { label: 'Roblox', color: '#c4302b', icon: <FaInfoCircle /> },
    tinder: { label: 'Tinder', color: '#fd5068', icon: <FaInfoCircle /> },
    mdt: { label: 'MDT', color: '#1e3a8a', icon: <FaInfoCircle /> },
    banco: { label: 'Banco', color: '#16a085', icon: <FaInfoCircle /> },
    stock: { label: 'Bolsa', color: '#f1c40f', icon: <FaInfoCircle /> },
    blackmarket: { label: 'Mercado Negro', color: '#2c3e50', icon: <FaInfoCircle /> }
  };

  // Cargar logs del servidor
  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('spainrp_token');
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      const response = await fetch(apiUrl('/api/logs'), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Token de autenticación inválido');
        } else if (response.status === 403) {
          throw new Error('No tienes permisos para ver los logs');
        } else {
          throw new Error(`Error del servidor: ${response.status}`);
        }
      }

      const data = await response.json();
      setLogs(data.logs || []);
    } catch (err) {
      console.error('Error cargando logs:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Calcular estadísticas en tiempo real
  const calculateStats = useCallback(() => {
    if (!logs || logs.length === 0) {
      return {
        total: 0,
        byType: {},
        recentActivity: {
          last24h: 0,
          last7d: 0,
          last30d: 0
        },
        byLevel: {
          info: 0,
          warn: 0,
          error: 0
        }
      };
    }

    const now = new Date();
    const stats = {
      total: logs.length,
      byType: {},
      recentActivity: {
        last24h: 0,
        last7d: 0,
        last30d: 0
      },
      byLevel: {
        info: 0,
        warn: 0,
        error: 0
      }
    };

    logs.forEach(log => {
      // Contar por tipo
      stats.byType[log.type] = (stats.byType[log.type] || 0) + 1;

      // Contar por nivel
      if (log.level) {
        stats.byLevel[log.level] = (stats.byLevel[log.level] || 0) + 1;
      }

      // Actividad reciente
      const logDate = new Date(log.timestamp);
      const diffMs = now - logDate;
      const diffDays = diffMs / (1000 * 60 * 60 * 24);

      if (diffDays <= 1) stats.recentActivity.last24h++;
      if (diffDays <= 7) stats.recentActivity.last7d++;
      if (diffDays <= 30) stats.recentActivity.last30d++;
    });

    return stats;
  }, [logs]);

  // Cargar estadísticas del servidor (fallback)
  const fetchStats = useCallback(async () => {
    try {
      const token = localStorage.getItem('spainrp_token');
      const response = await fetch(apiUrl('/api/logs/stats'), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
      }
    } catch (err) {
      console.error('Error cargando estadísticas:', err);
    }
  }, []);

  // Cargar logs al montar el componente
  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  // Auto-refresh
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(fetchLogs, 5000); // Cada 5 segundos
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

  // Filtrar y ordenar logs
  const filteredAndSortedLogs = React.useMemo(() => {
    let filtered = logs;

    // Filtrar por tipo
    if (filter !== 'all') {
      filtered = filtered.filter(log => log.type === filter);
    }

    // Filtrar por nivel
    if (levelFilter !== 'all') {
      filtered = filtered.filter(log => log.level === levelFilter);
    }

    // Filtrar por término de búsqueda
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(log => 
        log.message?.toLowerCase().includes(term) ||
        log.user?.toLowerCase().includes(term) ||
        log.ip?.toLowerCase().includes(term) ||
        log.userAgent?.toLowerCase().includes(term) ||
        log.source?.toLowerCase().includes(term)
      );
    }

    // Ordenar
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'timestamp':
          aValue = new Date(a.timestamp);
          bValue = new Date(b.timestamp);
          break;
        case 'type':
          aValue = a.type || '';
          bValue = b.type || '';
          break;
        case 'user':
          aValue = a.user || '';
          bValue = b.user || '';
          break;
        case 'message':
          aValue = a.message || '';
          bValue = b.message || '';
          break;
        default:
          aValue = a[sortBy] || '';
          bValue = b[sortBy] || '';
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [logs, filter, levelFilter, searchTerm, sortBy, sortOrder]);

  // Toggle expandir log
  const toggleLogExpansion = (logId) => {
    setExpandedLogs(prev => {
      const newSet = new Set(prev);
      if (newSet.has(logId)) {
        newSet.delete(logId);
      } else {
        newSet.add(logId);
      }
      return newSet;
    });
  };

  // Limpiar logs
  const clearLogs = async () => {
    if (!window.confirm('¿Estás seguro de que quieres limpiar todos los logs? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      const token = localStorage.getItem('spainrp_token');
      const response = await fetch(apiUrl('/api/logs/clear'), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setLogs([]);
        setExpandedLogs(new Set());
      } else {
        throw new Error('Error limpiando logs');
      }
    } catch (err) {
      console.error('Error limpiando logs:', err);
      alert('Error limpiando logs: ' + err.message);
    }
  };

  // Descargar logs
  const downloadLogs = () => {
    const dataStr = JSON.stringify(logs, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `spainrp-logs-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Formatear timestamp
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  // Formatear duración
  const formatDuration = (timestamp) => {
    const now = new Date();
    const logTime = new Date(timestamp);
    const diffMs = now - logTime;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `hace ${diffDays}d`;
    if (diffHours > 0) return `hace ${diffHours}h`;
    if (diffMins > 0) return `hace ${diffMins}m`;
    return 'ahora';
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
        color: 'white',
        padding: '6rem 1rem 2rem 1rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '50px',
            height: '50px',
            border: '3px solid #7289da',
            borderTop: '3px solid transparent',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem'
          }} />
          <h2 style={{ color: '#7289da', margin: 0 }}>Cargando logs...</h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
        color: 'white',
        padding: '6rem 1rem 2rem 1rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center', maxWidth: '500px' }}>
          <FaExclamationTriangle size={64} style={{ color: '#e74c3c', marginBottom: '1rem' }} />
          <h2 style={{ color: '#e74c3c', marginBottom: '1rem' }}>Error cargando logs</h2>
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
              fontWeight: '600'
            }}
          >
            <FaRefresh style={{ marginRight: '8px' }} />
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
      color: 'white',
      padding: '6rem 1rem 2rem 1rem'
    }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
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
              margin: 0,
              fontSize: '2.5rem',
              background: 'linear-gradient(135deg, #FFD700 0%, #7289da 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              fontWeight: 'bold'
            }}>
              Logs del Sistema
            </h1>
            <p style={{ margin: '0.5rem 0 0 0', opacity: 0.7 }}>
              {logs.length} registro{logs.length !== 1 ? 's' : ''} encontrado{logs.length !== 1 ? 's' : ''}
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
              <FaRedo />
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

            <button
              onClick={downloadLogs}
              style={{
                background: 'rgba(46, 204, 113, 0.2)',
                color: '#2ecc71',
                border: '1px solid #2ecc71',
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
              <FaDownload />
              Descargar
            </button>

            <button
              onClick={() => setShowStats(!showStats)}
              style={{
                background: showStats ? '#f39c12' : 'rgba(243, 156, 18, 0.2)',
                color: showStats ? 'white' : '#f39c12',
                border: '1px solid #f39c12',
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
              <FaInfoCircle />
              Estadísticas
            </button>

            <button
              onClick={clearLogs}
              style={{
                background: 'rgba(231, 76, 60, 0.2)',
                color: '#e74c3c',
                border: '1px solid #e74c3c',
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
              <FaTrash />
              Limpiar
            </button>
          </div>
        </div>

        {/* Filtros y búsqueda */}
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
            gap: '1rem',
            marginBottom: '1rem'
          }}>
            {/* Búsqueda */}
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#7289da' }}>
                <FaSearch style={{ marginRight: '8px' }} />
                Buscar
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar en mensajes, usuarios, IPs..."
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

            {/* Filtro por tipo */}
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#7289da' }}>
                <FaFilter style={{ marginRight: '8px' }} />
                Tipo de Log
              </label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
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
                <option value="all">Todos los tipos</option>
                {Object.entries(logTypes).map(([key, type]) => (
                  <option key={key} value={key}>{type.label}</option>
                ))}
              </select>
            </div>

            {/* Filtro por nivel */}
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#7289da' }}>
                <FaFilter style={{ marginRight: '8px' }} />
                Nivel
              </label>
              <select
                value={levelFilter}
                onChange={(e) => setLevelFilter(e.target.value)}
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
                <option value="all">Todos los niveles</option>
                <option value="info">Info</option>
                <option value="warn">Warning</option>
                <option value="error">Error</option>
              </select>
            </div>

            {/* Ordenar por */}
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#7289da' }}>
                <FaSort style={{ marginRight: '8px' }} />
                Ordenar por
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '10px 12px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '8px',
                    color: 'white',
                    fontSize: '14px'
                  }}
                >
                  <option value="timestamp">Fecha</option>
                  <option value="type">Tipo</option>
                  <option value="user">Usuario</option>
                  <option value="message">Mensaje</option>
                </select>
                <button
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  style={{
                    padding: '10px 12px',
                    background: 'rgba(114, 137, 218, 0.2)',
                    border: '1px solid #7289da',
                    borderRadius: '8px',
                    color: '#7289da',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  {sortOrder === 'asc' ? <FaSortUp /> : <FaSortDown />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Estadísticas */}
        {showStats && (
          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            padding: '1.5rem',
            borderRadius: '12px',
            marginBottom: '2rem',
            border: '1px solid rgba(243, 156, 18, 0.2)'
          }}>
            <h3 style={{ margin: '0 0 1rem 0', color: '#f39c12', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FaInfoCircle />
              Estadísticas del Sistema
            </h3>
            {(() => {
              const currentStats = calculateStats();
              return (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '1rem'
                }}>
                  <div style={{
                    background: 'rgba(114, 137, 218, 0.1)',
                    padding: '1rem',
                    borderRadius: '8px',
                    border: '1px solid rgba(114, 137, 218, 0.2)'
                  }}>
                    <div style={{ color: '#7289da', fontSize: '2rem', fontWeight: 'bold' }}>
                      {currentStats.total}
                    </div>
                    <div style={{ color: '#9ca3af', fontSize: '0.9rem' }}>
                      Total de Logs
                    </div>
                  </div>
                  
                  <div style={{
                    background: 'rgba(46, 204, 113, 0.1)',
                    padding: '1rem',
                    borderRadius: '8px',
                    border: '1px solid rgba(46, 204, 113, 0.2)'
                  }}>
                    <div style={{ color: '#2ecc71', fontSize: '2rem', fontWeight: 'bold' }}>
                      {currentStats.recentActivity.last24h}
                    </div>
                    <div style={{ color: '#9ca3af', fontSize: '0.9rem' }}>
                      Últimas 24h
                    </div>
                  </div>
                  
                  <div style={{
                    background: 'rgba(231, 76, 60, 0.1)',
                    padding: '1rem',
                    borderRadius: '8px',
                    border: '1px solid rgba(231, 76, 60, 0.2)'
                  }}>
                    <div style={{ color: '#e74c3c', fontSize: '2rem', fontWeight: 'bold' }}>
                      {currentStats.byLevel.error}
                    </div>
                    <div style={{ color: '#9ca3af', fontSize: '0.9rem' }}>
                      Errores
                    </div>
                  </div>
                  
                  <div style={{
                    background: 'rgba(243, 156, 18, 0.1)',
                    padding: '1rem',
                    borderRadius: '8px',
                    border: '1px solid rgba(243, 156, 18, 0.2)'
                  }}>
                    <div style={{ color: '#f39c12', fontSize: '2rem', fontWeight: 'bold' }}>
                      {Object.keys(currentStats.byType).length}
                    </div>
                    <div style={{ color: '#9ca3af', fontSize: '0.9rem' }}>
                      Tipos de Log
                    </div>
                  </div>

                  <div style={{
                    background: 'rgba(155, 89, 182, 0.1)',
                    padding: '1rem',
                    borderRadius: '8px',
                    border: '1px solid rgba(155, 89, 182, 0.2)'
                  }}>
                    <div style={{ color: '#9b59b6', fontSize: '2rem', fontWeight: 'bold' }}>
                      {currentStats.byLevel.warn}
                    </div>
                    <div style={{ color: '#9ca3af', fontSize: '0.9rem' }}>
                      Warnings
                    </div>
                  </div>

                  <div style={{
                    background: 'rgba(52, 152, 219, 0.1)',
                    padding: '1rem',
                    borderRadius: '8px',
                    border: '1px solid rgba(52, 152, 219, 0.2)'
                  }}>
                    <div style={{ color: '#3498db', fontSize: '2rem', fontWeight: 'bold' }}>
                      {currentStats.byLevel.info}
                    </div>
                    <div style={{ color: '#9ca3af', fontSize: '0.9rem' }}>
                      Info
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* Lista de logs */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '12px',
          border: '1px solid rgba(114, 137, 218, 0.1)',
          overflow: 'hidden'
        }}>
          {filteredAndSortedLogs.length === 0 ? (
            <div style={{
              padding: '3rem',
              textAlign: 'center',
              color: '#9ca3af'
            }}>
              <FaInfoCircle size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
              <h3 style={{ margin: '0 0 0.5rem 0' }}>No hay logs</h3>
              <p style={{ margin: 0, opacity: 0.7 }}>
                {searchTerm || filter !== 'all' 
                  ? 'No se encontraron logs con los filtros aplicados'
                  : 'No hay registros de logs disponibles'
                }
              </p>
            </div>
          ) : (
            <div style={{ maxHeight: '70vh', overflow: 'auto' }}>
              {filteredAndSortedLogs.map((log, index) => {
                const isExpanded = expandedLogs.has(log.id || index);
                const logType = logTypes[log.type] || logTypes.system;
                
                return (
                  <div
                    key={log.id || index}
                    style={{
                      borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                      transition: 'background 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    {/* Header del log */}
                    <div
                      style={{
                        padding: '1rem 1.5rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem'
                      }}
                      onClick={() => toggleLogExpansion(log.id || index)}
                    >
                      {/* Icono de tipo */}
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        background: logType.color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        {logType.icon}
                      </div>

                      {/* Contenido principal */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '1rem',
                          marginBottom: '0.25rem',
                          flexWrap: 'wrap'
                        }}>
                          <span style={{
                            background: logType.color,
                            color: 'white',
                            padding: '2px 8px',
                            borderRadius: '12px',
                            fontSize: '12px',
                            fontWeight: '600'
                          }}>
                            {logType.label}
                          </span>
                          
                          {log.level && (
                            <span style={{
                              background: log.level === 'error' ? '#e74c3c' : 
                                        log.level === 'warn' ? '#f39c12' : '#2ecc71',
                              color: 'white',
                              padding: '2px 6px',
                              borderRadius: '8px',
                              fontSize: '10px',
                              fontWeight: '600',
                              textTransform: 'uppercase'
                            }}>
                              {log.level}
                            </span>
                          )}
                          
                          <span style={{
                            color: '#e5e7eb',
                            fontSize: '14px',
                            fontWeight: '600'
                          }}>
                            {log.message || 'Sin mensaje'}
                          </span>
                        </div>

                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '1rem',
                          fontSize: '12px',
                          color: '#9ca3af',
                          flexWrap: 'wrap'
                        }}>
                          <span>
                            <FaClock style={{ marginRight: '4px' }} />
                            {formatTimestamp(log.timestamp)}
                          </span>
                          
                          {log.user && (
                            <span>Usuario: {log.user}</span>
                          )}
                          
                          {log.ip && (
                            <span>IP: {log.ip}</span>
                          )}
                        </div>
                      </div>

                      {/* Botón expandir */}
                      <div style={{
                        color: '#9ca3af',
                        fontSize: '14px',
                        flexShrink: 0
                      }}>
                        {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
                      </div>
                    </div>

                    {/* Detalles expandidos */}
                    {isExpanded && (
                      <div style={{
                        padding: '0 1.5rem 1.5rem 1.5rem',
                        background: 'rgba(0, 0, 0, 0.2)',
                        borderTop: '1px solid rgba(255, 255, 255, 0.1)'
                      }}>
                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                          gap: '1rem',
                          marginBottom: '1rem'
                        }}>
                          <div>
                            <strong style={{ color: '#7289da' }}>ID:</strong>
                            <div style={{ fontFamily: 'monospace', fontSize: '12px', marginTop: '4px' }}>
                              {log.id || 'N/A'}
                            </div>
                          </div>
                          
                          <div>
                            <strong style={{ color: '#7289da' }}>Timestamp:</strong>
                            <div style={{ fontFamily: 'monospace', fontSize: '12px', marginTop: '4px' }}>
                              {log.timestamp}
                            </div>
                          </div>
                          
                          {log.user && (
                            <div>
                              <strong style={{ color: '#7289da' }}>Usuario:</strong>
                              <div style={{ fontFamily: 'monospace', fontSize: '12px', marginTop: '4px' }}>
                                {log.user}
                              </div>
                            </div>
                          )}
                          
                          {log.ip && (
                            <div>
                              <strong style={{ color: '#7289da' }}>IP:</strong>
                              <div style={{ fontFamily: 'monospace', fontSize: '12px', marginTop: '4px' }}>
                                {log.ip}
                              </div>
                            </div>
                          )}
                          
                          {log.source && (
                            <div>
                              <strong style={{ color: '#7289da' }}>Fuente:</strong>
                              <div style={{ fontFamily: 'monospace', fontSize: '12px', marginTop: '4px' }}>
                                {log.source}
                              </div>
                            </div>
                          )}
                          
                          {log.level && (
                            <div>
                              <strong style={{ color: '#7289da' }}>Nivel:</strong>
                              <div style={{ 
                                fontFamily: 'monospace', 
                                fontSize: '12px', 
                                marginTop: '4px',
                                color: log.level === 'error' ? '#e74c3c' : 
                                       log.level === 'warn' ? '#f39c12' : '#2ecc71',
                                fontWeight: 'bold'
                              }}>
                                {log.level.toUpperCase()}
                              </div>
                            </div>
                          )}
                        </div>

                        {log.userAgent && (
                          <div style={{ marginBottom: '1rem' }}>
                            <strong style={{ color: '#7289da' }}>User Agent:</strong>
                            <div style={{
                              fontFamily: 'monospace',
                              fontSize: '12px',
                              marginTop: '4px',
                              background: 'rgba(0, 0, 0, 0.3)',
                              padding: '8px',
                              borderRadius: '4px',
                              wordBreak: 'break-all'
                            }}>
                              {log.userAgent}
                            </div>
                          </div>
                        )}

                        {log.data && (
                          <div>
                            <strong style={{ color: '#7289da' }}>Datos adicionales:</strong>
                            <pre style={{
                              fontFamily: 'monospace',
                              fontSize: '12px',
                              marginTop: '4px',
                              background: 'rgba(0, 0, 0, 0.3)',
                              padding: '8px',
                              borderRadius: '4px',
                              overflow: 'auto',
                              whiteSpace: 'pre-wrap'
                            }}>
                              {JSON.stringify(log.data, null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Estilos CSS */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        /* Scrollbar personalizado */
        div::-webkit-scrollbar {
          width: 6px;
        }
        
        div::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
        }
        
        div::-webkit-scrollbar-thumb {
          background: rgba(114, 137, 218, 0.5);
          border-radius: 3px;
        }
        
        div::-webkit-scrollbar-thumb:hover {
          background: rgba(114, 137, 218, 0.7);
        }
      `}</style>
    </div>
  );
};

export default Logs;
