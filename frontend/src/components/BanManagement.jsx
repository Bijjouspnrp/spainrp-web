import React, { useState, useEffect } from 'react';
import { apiUrl } from '../utils/api';
import useToast from '../hooks/useToast';
import ToastContainer from './ToastContainer';
import { 
  FaBan, 
  FaUnlock, 
  FaEye, 
  FaSearch, 
  FaPlus, 
  FaTrash, 
  FaExclamationTriangle,
  FaDiscord,
  FaEnvelope,
  FaCheckCircle,
  FaClock,
  FaGlobe,
  FaUser,
  FaServer,
  FaChartLine,
  FaFilter,
  FaSort,
  FaRedo,
  FaDownload,
  FaUpload,
  FaCog,
  FaShieldAlt,
  FaFlag,
  FaHistory,
  FaInfoCircle,
  FaTimes,
  FaChevronDown,
  FaChevronUp,
  FaExternalLinkAlt,
  FaCopy,
  FaEdit,
  FaList,
  FaTh,
  FaTrashAlt,
  FaKey
} from 'react-icons/fa';
import './BanManagement.css';

const BanManagement = () => {
  const [activeTab, setActiveTab] = useState('ips');
  const [ips, setIps] = useState([]);
  const [bans, setBans] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(false);
  const [showBanModal, setShowBanModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showStats, setShowStats] = useState(true);
  const { toasts, success, error, warning, info, removeToast } = useToast();
  const [banForm, setBanForm] = useState({
    type: 'ip',
    value: '',
    reason: '',
    expiresAt: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('lastSeen');
  const [sortOrder, setSortOrder] = useState('desc');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedItems, setSelectedItems] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 25,
    total: 0,
    pages: 0
  });
  const [viewMode, setViewMode] = useState('grid');
  const [connectionStatus, setConnectionStatus] = useState('connected');

  // Cargar datos iniciales
  useEffect(() => {
    loadStats();
    if (activeTab === 'ips') {
      loadIPs();
    } else {
      loadBans();
    }
  }, [activeTab]);

  // Auto-refresh cada 30 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      if (activeTab === 'ips') {
        loadIPs();
      } else {
        loadBans();
      }
      loadStats();
    }, 30000);

    return () => clearInterval(interval);
  }, [activeTab]);

  // Funciones de utilidad
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDuration = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diff = now - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    success('✅ Copiado al portapapeles', 2000);
  };

  const handleSelectAll = () => {
    const currentData = activeTab === 'ips' ? ips : bans;
    if (selectedItems.length === currentData.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(currentData.map(item => item.id || item.ip));
    }
  };

  const handleSelectItem = (itemId) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const loadStats = async () => {
    try {
      const response = await fetch(apiUrl('/api/admin/ban/stats'), {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('spainrp_token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const loadIPs = async (page = 1) => {
    try {
      setLoading(true);
      const response = await fetch(apiUrl(`/api/admin/ban/ips?page=${page}&limit=${pagination.limit}&active=true`), {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('spainrp_token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setIps(data.ips || []);
        setPagination(prev => ({
          ...prev,
          page: data.page || 1,
          total: data.total || 0,
          pages: data.pages || 0
        }));
      }
    } catch (error) {
      console.error('Error loading IPs:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadBans = async () => {
    try {
      setLoading(true);
      setConnectionStatus('connected');
      const response = await fetch(apiUrl('/api/admin/ban/bans'), {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('spainrp_token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('[BAN MANAGEMENT] Bans cargados:', data);
        setBans(data.bans || []);
        setConnectionStatus('connected');
      } else {
        const errorData = await response.json();
        console.error('[BAN MANAGEMENT] Error cargando bans:', errorData);
        setConnectionStatus('error');
        error(`❌ Error cargando bans: ${errorData.error || 'Error desconocido'}`, 5000);
      }
    } catch (error) {
      console.error('[BAN MANAGEMENT] Error loading bans:', error);
      setConnectionStatus('disconnected');
      error('❌ Error de conexión al cargar bans', 5000);
    } finally {
      setLoading(false);
    }
  };

  const handleBan = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { type, value, reason, expiresAt } = banForm;
      const endpoint = type === 'ip' ? '/api/admin/ban/ip' : '/api/admin/ban/discord';
      const body = type === 'ip' 
        ? { ip: value, reason, expiresAt: expiresAt || null }
        : { userId: value, reason, expiresAt: expiresAt || null };

      const response = await fetch(apiUrl(endpoint), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('spainrp_token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });

      if (response.ok) {
        const result = await response.json();
        setShowBanModal(false);
        setBanForm({ type: 'ip', value: '', reason: '', expiresAt: '' });
        loadBans();
        loadStats();
        
        success(`✅ Ban aplicado correctamente`, 4000);
        
        if (type === 'discord') {
          info(`📨 Se envió una notificación DM al usuario baneado`, 6000);
        } else if (type === 'ip') {
          warning(`📨 Se buscará un usuario asociado a esta IP para enviar notificación DM`, 6000);
        }
      } else {
        const errorData = await response.json();
        if (errorData.error === 'No puedes banearte a ti mismo') {
          error(`❌ ${errorData.error}\n\n${errorData.message}`, 8000);
        } else {
          error(`❌ Error: ${errorData.error}`, 5000);
        }
      }
    } catch (error) {
      console.error('Error banning:', error);
      error('❌ Error al aplicar el ban', 5000);
    } finally {
      setLoading(false);
    }
  };

  const handleUnban = async (type, value) => {
    const banType = type === 'ip' ? 'IP' : 'Usuario Discord';
    const confirmMessage = `¿Estás seguro de que quieres desbanear ${banType} "${value}"?\n\nEsta acción no se puede deshacer.`;
    
    if (!confirm(confirmMessage)) {
      console.log('[BAN MANAGEMENT] Desbaneo cancelado por el usuario');
      return;
    }

    setLoading(true);
    try {
      console.log(`[BAN MANAGEMENT] 🚀 Iniciando desbaneo de ${type}: ${value}`);
      
      const url = apiUrl(`/api/admin/ban/${type}/${value}`);
      console.log(`[BAN MANAGEMENT] URL de desbaneo:`, url);
      
      const token = localStorage.getItem('spainrp_token');
      console.log(`[BAN MANAGEMENT] Token disponible:`, token ? 'Sí' : 'No');
      
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log(`[BAN MANAGEMENT] 📡 Respuesta del servidor:`, {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      });

      if (response.ok) {
        const result = await response.json();
        console.log('[BAN MANAGEMENT] ✅ Resultado del desbaneo:', result);
        
        console.log('[BAN MANAGEMENT] 🔄 Recargando datos...');
        await Promise.all([loadBans(), loadStats()]);
        
        success(`✅ ${banType} "${value}" desbaneado correctamente`, 4000);
        
        if (type === 'discord') {
          info(`📨 Se envió una notificación DM al usuario desbaneado`, 6000);
        } else if (type === 'ip') {
          warning(`📨 Se buscará un usuario asociado a esta IP para enviar notificación DM`, 6000);
        }
      } else {
        const errorData = await response.json();
        console.error('[BAN MANAGEMENT] ❌ Error del servidor:', errorData);
        error(`❌ Error desbaneando ${banType}: ${errorData.error || errorData.message || 'Error desconocido'}`, 5000);
      }
    } catch (error) {
      console.error('[BAN MANAGEMENT] ❌ Error de conexión:', error);
      error(`❌ Error de conexión al desbanear ${banType}`, 5000);
    } finally {
      setLoading(false);
      console.log('[BAN MANAGEMENT] 🏁 Proceso de desbaneo finalizado');
    }
  };

  const handleBanIP = (ip) => {
    setBanForm({
      type: 'ip',
      value: ip,
      reason: '',
      expiresAt: ''
    });
    setShowBanModal(true);
  };

  const filteredIPs = ips.filter(ip => {
    const matchesSearch = ip.ip.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (ip.userId && ip.userId.includes(searchTerm)) ||
      (ip.username && ip.username.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (ip.country && ip.country.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (ip.city && ip.city.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (ip.isp && ip.isp.toLowerCase().includes(searchTerm.toLowerCase()));
    
    let matchesGeo = true;
    if (filterType === 'high-accuracy') {
      matchesGeo = ip.latitude && ip.longitude;
    } else if (filterType === 'medium-accuracy') {
      matchesGeo = ip.city && ip.city !== 'Unknown' && (!ip.latitude || !ip.longitude);
    } else if (filterType === 'low-accuracy') {
      matchesGeo = ip.country && ip.country !== 'Unknown' && (!ip.city || ip.city === 'Unknown');
    } else if (filterType === 'no-location') {
      matchesGeo = (!ip.country || ip.country === 'Unknown');
    }
    
    return matchesSearch && matchesGeo;
  });

  const filteredBans = bans.filter(ban => 
    ban.value.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ban.reason.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="ban-management">
      {/* Header */}
      <div className="ban-header">
        <div className="header-content">
          <div className="header-title">
            <FaShieldAlt className="header-icon" />
            <div>
              <h1>Centro de Moderación</h1>
              <p>Sistema avanzado de gestión de bans y monitoreo de IPs</p>
            </div>
          </div>
          <div className="header-actions">
            <div className="connection-status">
              <div className={`status-dot ${connectionStatus}`}></div>
              <span className="status-text">
                {connectionStatus === 'connected' ? 'Conectado' : 
                 connectionStatus === 'disconnected' ? 'Desconectado' : 'Error'}
              </span>
            </div>
            <button 
              className="btn-icon"
              onClick={() => setShowStats(!showStats)}
              title="Toggle estadísticas"
            >
              <FaChartLine />
            </button>
            <button 
              className="btn-icon"
              onClick={() => {
                if (activeTab === 'ips') {
                  loadIPs();
                } else {
                  loadBans();
                }
                loadStats();
              }}
              title="Recargar datos"
            >
              <FaRedo />
            </button>
          </div>
        </div>
      </div>

      {/* Estadísticas */}
      {showStats && (
        <div className="ban-stats">
          <div className="stat-card primary">
            <div className="stat-icon">
              <FaServer />
            </div>
            <div className="stat-content">
              <div className="stat-number">{stats.activeIPs || 0}</div>
              <div className="stat-label">IPs Activas</div>
            </div>
          </div>
          <div className="stat-card danger">
            <div className="stat-icon">
              <FaBan />
            </div>
            <div className="stat-content">
              <div className="stat-number">{stats.ipBans || 0}</div>
              <div className="stat-label">IPs Baneadas</div>
            </div>
          </div>
          <div className="stat-card warning">
            <div className="stat-icon">
              <FaUser />
            </div>
            <div className="stat-content">
              <div className="stat-number">{stats.discordBans || 0}</div>
              <div className="stat-label">Usuarios Baneados</div>
            </div>
          </div>
          <div className="stat-card info">
            <div className="stat-icon">
              <FaChartLine />
            </div>
            <div className="stat-content">
              <div className="stat-number">{stats.totalIPs || 0}</div>
              <div className="stat-label">Total IPs</div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="ban-tabs">
        <div className="tab-nav">
          <button 
            className={`tab ${activeTab === 'ips' ? 'active' : ''}`}
            onClick={() => setActiveTab('ips')}
          >
            <FaServer />
            <span>IPs Trackeadas</span>
            <span className="tab-count">{ips.length}</span>
          </button>
          <button 
            className={`tab ${activeTab === 'bans' ? 'active' : ''}`}
            onClick={() => setActiveTab('bans')}
          >
            <FaBan />
            <span>Bans Activos</span>
            <span className="tab-count">{bans.length}</span>
          </button>
        </div>
      </div>

      {/* Barra de herramientas */}
      <div className="toolbar">
        <div className="toolbar-left">
          <div className="search-container">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Buscar IPs, usuarios, razones..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            {searchTerm && (
              <button 
                className="search-clear"
                onClick={() => setSearchTerm('')}
              >
                <FaTimes />
              </button>
            )}
          </div>
        </div>

        <div className="toolbar-right">
          <button 
            className="btn-primary"
            onClick={() => setShowBanModal(true)}
          >
            <FaPlus />
            Nuevo Ban
          </button>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="ban-content">
        {activeTab === 'ips' ? (
          <div className="ips-container">
            {loading ? (
              <div className="loading-state">
                <div className="spinner"></div>
                <p>Cargando IPs...</p>
              </div>
            ) : filteredIPs.length === 0 ? (
              <div className="empty-state">
                <FaServer className="empty-icon" />
                <h3>No hay IPs para mostrar</h3>
                <p>Las IPs aparecerán aquí cuando los usuarios accedan al sitio</p>
                <button className="btn-primary" onClick={() => window.location.reload()}>
                  <FaRedo />
                  Recargar
                </button>
              </div>
            ) : (
              <div className="ips-grid">
                {filteredIPs.map(ip => (
                  <div key={ip.ip} className="ip-card">
                    <div className="card-header">
                      <div className="card-title">
                        <FaGlobe />
                        <span className="ip-address">{ip.ip}</span>
                        <button 
                          className="copy-btn"
                          onClick={() => copyToClipboard(ip.ip)}
                          title="Copiar IP"
                        >
                          <FaCopy />
                        </button>
                      </div>
                      <div className="card-actions">
                        <button 
                          className="btn-ban"
                          onClick={() => handleBanIP(ip.ip)}
                          title="Banear IP"
                        >
                          <FaBan />
                        </button>
                      </div>
                    </div>
                    
                    <div className="card-content">
                      <div className="user-info">
                        {ip.avatar ? (
                          <img 
                            src={`https://cdn.discordapp.com/avatars/${ip.userId}/${ip.avatar}.png?size=32`} 
                            alt="Avatar" 
                            className="user-avatar"
                            onError={(e) => e.target.style.display = 'none'}
                          />
                        ) : (
                          <div className="user-avatar-placeholder">
                            <FaUser />
                          </div>
                        )}
                        <div className="user-details">
                          <div className="username">
                            {ip.username ? `${ip.username}#${ip.discriminator || '0000'}` : 'Anónimo'}
                          </div>
                          {ip.userId && (
                            <div className="user-id">
                              ID: {ip.userId}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="location-info">
                        <FaGlobe />
                        <div className="location-details">
                          <div className="location-main">
                            {ip.country || 'Unknown'} 
                            {ip.countryCode && ` (${ip.countryCode})`}
                            {ip.city && ` - ${ip.city}`}
                          </div>
                        </div>
                      </div>
                      
                      <div className="device-info">
                        <div className="device-details">
                          <span className="device-badge">
                            {ip.browser || 'Unknown Browser'}
                          </span>
                          <span className="os-badge">
                            {ip.os || 'Unknown OS'}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="card-footer">
                      <div className="visit-stats">
                        <FaEye />
                        <span>{ip.visitCount} visitas</span>
                      </div>
                      <div className="time-info">
                        <FaClock />
                        <span title={formatDate(ip.lastSeen)}>
                          {formatDuration(ip.lastSeen)} ago
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="bans-container">
            {loading ? (
              <div className="loading-state">
                <div className="spinner"></div>
                <p>Cargando bans...</p>
              </div>
            ) : filteredBans.length === 0 ? (
              <div className="empty-state">
                <FaBan className="empty-icon" />
                <h3>No hay bans activos</h3>
                <p>Los bans aparecerán aquí cuando se apliquen</p>
                <button 
                  className="btn-primary"
                  onClick={() => setShowBanModal(true)}
                >
                  <FaPlus />
                  Crear primer ban
                </button>
              </div>
            ) : (
              <div className="bans-grid">
                {filteredBans.map(ban => (
                  <div key={`${ban.type}-${ban.value}`} className="ban-card">
                    <div className="card-header">
                      <div className="ban-type-badge">
                        {ban.type === 'ip' ? <FaGlobe /> : <FaUser />}
                        <span>{ban.type === 'ip' ? 'IP' : 'Discord'}</span>
                        {ban.isActive === 1 && (
                          <span className="active-badge">ACTIVO</span>
                        )}
                      </div>
                      <div className="ban-value">
                        <span className="ban-value-text">{ban.value}</span>
                        <button 
                          className="copy-btn"
                          onClick={() => copyToClipboard(ban.value)}
                          title="Copiar"
                        >
                          <FaCopy />
                        </button>
                      </div>
                    </div>
                    
                    <div className="card-content">
                      <div className="ban-reason">
                        <FaExclamationTriangle />
                        <span>{ban.reason || 'Sin razón especificada'}</span>
                      </div>
                      
                      <div className="ban-meta">
                        <div className="ban-date">
                          <FaClock />
                          <span>Baneado: {formatDate(ban.bannedAt)}</span>
                        </div>
                        {ban.bannedBy && (
                          <div className="ban-admin">
                            <FaUser />
                            <span>Por: {ban.bannedBy}</span>
                          </div>
                        )}
                        {ban.expiresAt ? (
                          <div className="ban-expires">
                            <FaClock />
                            <span>Expira: {formatDate(ban.expiresAt)}</span>
                          </div>
                        ) : (
                          <div className="ban-permanent">
                            <FaBan />
                            <span>Permanente</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="ban-status">
                        <div className={`status-indicator ${ban.isActive === 1 ? 'active' : 'inactive'}`}>
                          {ban.isActive === 1 ? 'ACTIVO' : 'INACTIVO'}
                        </div>
                      </div>
                    </div>
                    
                    {/* Botón de desbanear prominente */}
                    <div className="ban-actions-footer">
                      <button 
                        className="btn-unban-large"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          console.log('🚀 Botón de desbanear clickeado:', ban.type, ban.value);
                          handleUnban(ban.type, ban.value);
                        }}
                        title={`Desbanear ${ban.type === 'ip' ? 'IP' : 'Usuario Discord'}: ${ban.value}`}
                        disabled={loading}
                      >
                        <FaUnlock />
                        <span>Desbanear {ban.type === 'ip' ? 'IP' : 'Usuario'}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal de nuevo ban */}
      {showBanModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>
                <FaBan />
                Nuevo Ban
              </h3>
              <button 
                className="modal-close"
                onClick={() => setShowBanModal(false)}
              >
                <FaTimes />
              </button>
            </div>
            
            <form onSubmit={handleBan} className="ban-form">
              <div className="form-grid">
                <div className="form-group">
                  <label>
                    <FaFlag />
                    Tipo de Ban
                  </label>
                  <select
                    value={banForm.type}
                    onChange={(e) => setBanForm({...banForm, type: e.target.value})}
                    className="form-select"
                  >
                    <option value="ip">🌐 Dirección IP</option>
                    <option value="discord">👤 Usuario Discord</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label>
                    {banForm.type === 'ip' ? '🌐' : '👤'} 
                    {banForm.type === 'ip' ? 'Dirección IP' : 'ID de Usuario Discord'}
                  </label>
                  <input
                    type="text"
                    value={banForm.value}
                    onChange={(e) => setBanForm({...banForm, value: e.target.value})}
                    placeholder={banForm.type === 'ip' ? '192.168.1.1' : '123456789012345678'}
                    className="form-input"
                    required
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label>
                  <FaExclamationTriangle />
                  Razón del Ban
                </label>
                <textarea
                  value={banForm.reason}
                  onChange={(e) => setBanForm({...banForm, reason: e.target.value})}
                  placeholder="Describe la razón del ban..."
                  className="form-textarea"
                  rows="3"
                  required
                />
              </div>
              
              <div className="form-group">
                <label>
                  <FaClock />
                  Fecha de Expiración (opcional)
                </label>
                <input
                  type="datetime-local"
                  value={banForm.expiresAt}
                  onChange={(e) => setBanForm({...banForm, expiresAt: e.target.value})}
                  className="form-input"
                />
                <small>Dejar vacío para ban permanente</small>
              </div>
              
              <div className="form-actions">
                <button 
                  type="button" 
                  className="btn-secondary"
                  onClick={() => setShowBanModal(false)}
                >
                  <FaTimes />
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="btn-primary"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="spinner-small"></div>
                      Aplicando...
                    </>
                  ) : (
                    <>
                      <FaBan />
                      Aplicar Ban
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Toast Container */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
};

export default BanManagement;