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
  FaTh
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
  const [viewMode, setViewMode] = useState('grid'); // grid, list, compact

  // Cargar datos iniciales
  useEffect(() => {
    loadStats();
    if (activeTab === 'ips') {
      loadIPs();
    } else {
      loadBans();
    }
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
    // Aquí podrías agregar una notificación toast
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
      const response = await fetch(apiUrl('/api/admin/ban/bans'), {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('spainrp_token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setBans(data.bans || []);
      }
    } catch (error) {
      console.error('Error loading bans:', error);
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
        
        // Mostrar feedback de éxito
        success(`✅ Ban aplicado correctamente`, 4000);
        
        // Mostrar información sobre notificación DM
        if (type === 'discord') {
          info(`📨 Se envió una notificación DM al usuario baneado`, 6000);
        } else if (type === 'ip') {
          warning(`📨 Se buscará un usuario asociado a esta IP para enviar notificación DM`, 6000);
        }
      } else {
        const errorData = await response.json();
        // Mostrar mensaje específico para auto-ban
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
    if (!confirm(`¿Estás seguro de que quieres desbanear ${type} ${value}?`)) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(apiUrl(`/api/admin/ban/${type}/${value}`), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('spainrp_token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        loadBans();
        loadStats();
        
        // Mostrar feedback de éxito
        success(`✅ Ban removido correctamente`, 4000);
        
        // Mostrar información sobre notificación DM
        if (type === 'discord') {
          info(`📨 Se envió una notificación DM al usuario desbaneado`, 6000);
        } else if (type === 'ip') {
          warning(`📨 Se buscará un usuario asociado a esta IP para enviar notificación DM`, 6000);
        }
      } else {
        const errorData = await response.json();
        error(`❌ Error: ${errorData.error}`, 5000);
      }
    } catch (error) {
      console.error('Error unbanning:', error);
      error('❌ Error al remover el ban', 5000);
    } finally {
      setLoading(false);
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

  const filteredIPs = ips.filter(ip => 
    ip.ip.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (ip.userId && ip.userId.includes(searchTerm)) ||
    (ip.username && ip.username.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredBans = bans.filter(ban => 
    ban.value.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ban.reason.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="ban-management">
      {/* Header mejorado */}
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
            <button 
              className="btn-icon"
              onClick={() => setShowStats(!showStats)}
              title="Toggle estadísticas"
            >
              <FaChartLine />
            </button>
            <button 
              className="btn-icon"
              onClick={() => window.location.reload()}
              title="Recargar datos"
            >
              <FaRedo />
            </button>
          </div>
        </div>
      </div>

      {/* Estadísticas colapsables */}
      {showStats && (
        <div className="ban-stats">
          <div className="stat-card primary">
            <div className="stat-icon">
              <FaServer />
            </div>
            <div className="stat-content">
              <div className="stat-number">{stats.activeIPs || 0}</div>
              <div className="stat-label">IPs Activas</div>
              <div className="stat-trend">+12% esta semana</div>
            </div>
          </div>
          <div className="stat-card danger">
            <div className="stat-icon">
              <FaBan />
            </div>
            <div className="stat-content">
              <div className="stat-number">{stats.ipBans || 0}</div>
              <div className="stat-label">IPs Baneadas</div>
              <div className="stat-trend">+3% esta semana</div>
            </div>
          </div>
          <div className="stat-card warning">
            <div className="stat-icon">
              <FaUser />
            </div>
            <div className="stat-content">
              <div className="stat-number">{stats.discordBans || 0}</div>
              <div className="stat-label">Usuarios Baneados</div>
              <div className="stat-trend">+1% esta semana</div>
            </div>
          </div>
          <div className="stat-card info">
            <div className="stat-icon">
              <FaChartLine />
            </div>
            <div className="stat-content">
              <div className="stat-number">{stats.totalIPs || 0}</div>
              <div className="stat-label">Total IPs</div>
              <div className="stat-trend">+8% esta semana</div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs mejoradas */}
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
        
        {/* Controles de vista */}
        <div className="view-controls">
          <div className="view-modes">
            <button 
              className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
              title="Vista de cuadrícula"
            >
              <FaTh />
            </button>
            <button 
              className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
              title="Vista de lista"
            >
              <FaList />
            </button>
            <button 
              className={`view-btn ${viewMode === 'compact' ? 'active' : ''}`}
              onClick={() => setViewMode('compact')}
              title="Vista compacta"
            >
              <FaServer />
            </button>
          </div>
        </div>
      </div>

      {/* Barra de herramientas mejorada */}
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
          
          <button 
            className={`filter-btn ${showFilters ? 'active' : ''}`}
            onClick={() => setShowFilters(!showFilters)}
          >
            <FaFilter />
            Filtros
            {showFilters && <FaChevronUp />}
            {!showFilters && <FaChevronDown />}
          </button>
        </div>

        <div className="toolbar-right">
          {selectedItems.length > 0 && (
            <div className="selection-actions">
              <span className="selection-count">
                {selectedItems.length} seleccionados
              </span>
              <button className="btn-danger">
                <FaTrash />
                Eliminar
              </button>
            </div>
          )}
          
          <button 
            className="btn-primary"
            onClick={() => setShowBanModal(true)}
          >
            <FaPlus />
            Nuevo Ban
          </button>
        </div>
      </div>

      {/* Panel de filtros */}
      {showFilters && (
        <div className="filters-panel">
          <div className="filter-group">
            <label>Tipo</label>
            <select 
              value={filterType} 
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="all">Todos</option>
              <option value="ip">Solo IPs</option>
              <option value="discord">Solo Discord</option>
            </select>
          </div>
          
          <div className="filter-group">
            <label>Estado</label>
            <select 
              value={filterStatus} 
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">Todos</option>
              <option value="active">Activos</option>
              <option value="banned">Baneados</option>
            </select>
          </div>
          
          <div className="filter-group">
            <label>Ordenar por</label>
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="lastSeen">Última visita</option>
              <option value="visitCount">Número de visitas</option>
              <option value="ip">Dirección IP</option>
              <option value="bannedAt">Fecha de ban</option>
            </select>
          </div>
          
          <div className="filter-group">
            <button 
              className={`sort-btn ${sortOrder === 'desc' ? 'active' : ''}`}
              onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
            >
              <FaSort />
              {sortOrder === 'desc' ? 'Descendente' : 'Ascendente'}
            </button>
          </div>
        </div>
      )}

      {/* Contenido principal */}
      <div className="ban-content">
        {activeTab === 'ips' ? (
          <div className={`ips-container ${viewMode}`}>
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
                  <div key={ip.ip} className={`ip-card ${viewMode}`}>
                    <div className="card-header">
                      <div className="card-title">
                        <FaGlobe />
                        <span className="ip-address">{ip.ip}</span>
                        {ip.userId && (
                          <div className="dm-indicator" title="Notificaciones DM habilitadas">
                            <FaDiscord />
                            <span>DM</span>
                          </div>
                        )}
                        <button 
                          className="copy-btn"
                          onClick={() => copyToClipboard(ip.ip)}
                          title="Copiar IP"
                        >
                          <FaCopy />
                        </button>
                      </div>
                      <div className="card-actions">
                        <input 
                          type="checkbox"
                          checked={selectedItems.includes(ip.ip)}
                          onChange={() => handleSelectItem(ip.ip)}
                        />
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
                        <span>{ip.country || 'Unknown'} {ip.city && `- ${ip.city}`}</span>
                      </div>
                      
                      <div className="device-info">
                        <span className="device-badge">
                          {ip.userAgent?.includes('Mobile') ? '📱' : '💻'} 
                          {ip.userAgent?.includes('Chrome') ? 'Chrome' : 
                           ip.userAgent?.includes('Firefox') ? 'Firefox' : 
                           ip.userAgent?.includes('Safari') ? 'Safari' : 'Browser'}
                        </span>
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
          <div className={`bans-container ${viewMode}`}>
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
                  <div key={`${ban.type}-${ban.value}`} className={`ban-card ${viewMode}`}>
                    <div className="card-header">
                      <div className="ban-type-badge">
                        {ban.type === 'ip' ? <FaGlobe /> : <FaUser />}
                        <span>{ban.type === 'ip' ? 'IP' : 'Discord'}</span>
                      </div>
                      <div className="ban-value">
                        {ban.value}
                        {ban.type === 'discord' && (
                          <div className="dm-indicator" title="Notificaciones DM enviadas">
                            <FaDiscord />
                            <span>DM</span>
                          </div>
                        )}
                        {ban.type === 'ip' && (
                          <div className="dm-indicator muted" title="Notificaciones DM (si hay usuario asociado)">
                            <FaEnvelope />
                            <span>DM?</span>
                          </div>
                        )}
                        <button 
                          className="copy-btn"
                          onClick={() => copyToClipboard(ban.value)}
                          title="Copiar"
                        >
                          <FaCopy />
                        </button>
                      </div>
                      <div className="card-actions">
                        <input 
                          type="checkbox"
                          checked={selectedItems.includes(ban.value)}
                          onChange={() => handleSelectItem(ban.value)}
                        />
                        <button 
                          className="btn-unban"
                          onClick={() => handleUnban(ban.type, ban.value)}
                          title="Desbanear"
                        >
                          <FaUnlock />
                        </button>
                      </div>
                    </div>
                    
                    <div className="card-content">
                      <div className="ban-reason">
                        <FaExclamationTriangle />
                        <span>{ban.reason}</span>
                      </div>
                      
                      <div className="ban-meta">
                        <div className="ban-date">
                          <FaClock />
                          <span>Baneado: {formatDate(ban.bannedAt)}</span>
                        </div>
                        {ban.expiresAt && (
                          <div className="ban-expires">
                            <FaClock />
                            <span>Expira: {formatDate(ban.expiresAt)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Paginación */}
      {pagination.pages > 1 && (
        <div className="pagination">
          <button 
            className="page-btn"
            disabled={pagination.page === 1}
            onClick={() => setPagination({...pagination, page: pagination.page - 1})}
          >
            Anterior
          </button>
          
          <div className="page-numbers">
            {Array.from({length: Math.min(5, pagination.pages)}, (_, i) => {
              const page = i + 1;
              return (
                <button
                  key={page}
                  className={`page-number ${pagination.page === page ? 'active' : ''}`}
                  onClick={() => setPagination({...pagination, page})}
                >
                  {page}
                </button>
              );
            })}
          </div>
          
          <button 
            className="page-btn"
            disabled={pagination.page === pagination.pages}
            onClick={() => setPagination({...pagination, page: pagination.page + 1})}
          >
            Siguiente
          </button>
        </div>
      )}

      {/* Modal de nuevo ban mejorado */}
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