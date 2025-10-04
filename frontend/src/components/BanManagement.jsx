import React, { useState, useEffect } from 'react';
import { apiUrl } from '../utils/api';
import { 
  FaBan, 
  FaUnlock, 
  FaEye, 
  FaSearch, 
  FaPlus, 
  FaTrash, 
  FaExclamationTriangle,
  FaCheckCircle,
  FaClock,
  FaGlobe,
  FaUser,
  FaServer,
  FaChartLine
} from 'react-icons/fa';
import './BanManagement.css';

const BanManagement = () => {
  const [activeTab, setActiveTab] = useState('ips');
  const [ips, setIps] = useState([]);
  const [bans, setBans] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(false);
  const [showBanModal, setShowBanModal] = useState(false);
  const [banForm, setBanForm] = useState({
    type: 'ip',
    value: '',
    reason: '',
    expiresAt: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    pages: 0
  });

  // Cargar datos iniciales
  useEffect(() => {
    loadStats();
    if (activeTab === 'ips') {
      loadIPs();
    } else {
      loadBans();
    }
  }, [activeTab]);

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
    setLoading(true);
    try {
      const response = await fetch(apiUrl(`/api/admin/ban/ips?page=${page}&limit=50&active=true`), {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('spainrp_token')}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        const data = await response.json();
        setIps(data.ips);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('Error loading IPs:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadBans = async () => {
    setLoading(true);
    try {
      const response = await fetch(apiUrl('/api/admin/ban/bans?active=true'), {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('spainrp_token')}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        const data = await response.json();
        setBans(data);
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
      const endpoint = banForm.type === 'ip' ? '/api/admin/ban/ip' : '/api/admin/ban/discord';
      const body = {
        [banForm.type === 'ip' ? 'ip' : 'userId']: banForm.value,
        reason: banForm.reason,
        expiresAt: banForm.expiresAt || null
      };

      const response = await fetch(apiUrl(endpoint), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('spainrp_token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });

      if (response.ok) {
        setShowBanModal(false);
        setBanForm({ type: 'ip', value: '', reason: '', expiresAt: '' });
        loadBans();
        loadStats();
        alert('Ban aplicado correctamente');
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Error banning:', error);
      alert('Error al aplicar el ban');
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
        alert('Ban removido correctamente');
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Error unbanning:', error);
      alert('Error al remover el ban');
    } finally {
      setLoading(false);
    }
  };

  const filteredIPs = ips.filter(ip => 
    ip.ip.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (ip.userId && ip.userId.includes(searchTerm))
  );

  const filteredBans = bans.filter(ban => 
    ban.value.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ban.reason.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="ban-management">
      <div className="ban-header">
        <h2><FaBan /> Gestión de Bans y IPs</h2>
        <p>Sistema de moderación web exclusivo para administradores</p>
      </div>

      {/* Estadísticas */}
      <div className="ban-stats">
        <div className="stat-card">
          <FaGlobe className="stat-icon" />
          <div className="stat-content">
            <div className="stat-value">{stats.activeIPs || 0}</div>
            <div className="stat-label">IPs Activas</div>
          </div>
        </div>
        <div className="stat-card">
          <FaBan className="stat-icon" />
          <div className="stat-content">
            <div className="stat-value">{stats.ipBans || 0}</div>
            <div className="stat-label">IPs Baneadas</div>
          </div>
        </div>
        <div className="stat-card">
          <FaUser className="stat-icon" />
          <div className="stat-content">
            <div className="stat-value">{stats.discordBans || 0}</div>
            <div className="stat-label">Usuarios Baneados</div>
          </div>
        </div>
        <div className="stat-card">
          <FaServer className="stat-icon" />
          <div className="stat-content">
            <div className="stat-value">{stats.totalIPs || 0}</div>
            <div className="stat-label">Total IPs</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="ban-tabs">
        <button 
          className={`tab ${activeTab === 'ips' ? 'active' : ''}`}
          onClick={() => setActiveTab('ips')}
        >
          <FaGlobe /> IPs Trackeadas
        </button>
        <button 
          className={`tab ${activeTab === 'bans' ? 'active' : ''}`}
          onClick={() => setActiveTab('bans')}
        >
          <FaBan /> Bans Activos
        </button>
      </div>

      {/* Contenido de tabs */}
      <div className="ban-content">
        {/* Barra de búsqueda y acciones */}
        <div className="ban-toolbar">
          <div className="search-box">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Buscar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
            className="btn-primary"
            onClick={() => setShowBanModal(true)}
          >
            <FaPlus /> Nuevo Ban
          </button>
        </div>

        {/* Lista de IPs */}
        {activeTab === 'ips' && (
          <div className="ban-list">
            {loading ? (
              <div className="loading">Cargando IPs...</div>
            ) : filteredIPs.length === 0 ? (
              <div className="empty">No hay IPs para mostrar</div>
            ) : (
              filteredIPs.map(ip => (
                <div key={ip.id} className="ban-item">
                  <div className="item-info">
                    <div className="item-main">
                      <FaGlobe className="item-icon" />
                      <span className="item-value">{ip.ip}</span>
                    </div>
                    <div className="item-details">
                      <span className="detail">
                        <FaUser /> {ip.userId || 'Anónimo'}
                      </span>
                      <span className="detail">
                        <FaClock /> {new Date(ip.lastSeen).toLocaleString()}
                      </span>
                      <span className="detail">
                        Visitas: {ip.visitCount}
                      </span>
                      {ip.country && (
                        <span className="detail">
                          🌍 {ip.country} {ip.city && `- ${ip.city}`}
                        </span>
                      )}
                      {ip.userAgent && (
                        <span className="detail" title={ip.userAgent}>
                          📱 {ip.userAgent.substring(0, 30)}...
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="item-actions">
                    <button 
                      className="btn-danger"
                      onClick={() => {
                        setBanForm({
                          type: 'ip',
                          value: ip.ip,
                          reason: '',
                          expiresAt: ''
                        });
                        setShowBanModal(true);
                      }}
                    >
                      <FaBan /> Banear IP
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Lista de Bans */}
        {activeTab === 'bans' && (
          <div className="ban-list">
            {loading ? (
              <div className="loading">Cargando bans...</div>
            ) : filteredBans.length === 0 ? (
              <div className="empty">No hay bans activos</div>
            ) : (
              filteredBans.map(ban => (
                <div key={ban.id} className="ban-item banned">
                  <div className="item-info">
                    <div className="item-main">
                      {ban.type === 'ip' ? <FaGlobe className="item-icon" /> : <FaUser className="item-icon" />}
                      <span className="item-value">{ban.value}</span>
                      <span className="ban-type">{ban.type.toUpperCase()}</span>
                    </div>
                    <div className="item-details">
                      <span className="detail">
                        <FaExclamationTriangle /> {ban.reason}
                      </span>
                      <span className="detail">
                        <FaClock /> {new Date(ban.bannedAt).toLocaleString()}
                      </span>
                      {ban.expiresAt && (
                        <span className="detail">
                          Expira: {new Date(ban.expiresAt).toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="item-actions">
                    <button 
                      className="btn-success"
                      onClick={() => handleUnban(ban.type, ban.value)}
                    >
                      <FaUnlock /> Desbanear
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Modal de Ban */}
      {showBanModal && (
        <div className="modal-overlay" onClick={() => setShowBanModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Crear Nuevo Ban</h3>
            <form onSubmit={handleBan}>
              <div className="form-group">
                <label>Tipo de Ban</label>
                <select
                  value={banForm.type}
                  onChange={(e) => setBanForm({...banForm, type: e.target.value})}
                  required
                >
                  <option value="ip">IP</option>
                  <option value="discord">Usuario Discord</option>
                </select>
              </div>
              
              <div className="form-group">
                <label>
                  {banForm.type === 'ip' ? 'Dirección IP' : 'ID de Usuario Discord'}
                </label>
                <input
                  type="text"
                  value={banForm.value}
                  onChange={(e) => setBanForm({...banForm, value: e.target.value})}
                  placeholder={banForm.type === 'ip' ? '192.168.1.1' : '123456789012345678'}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Razón del Ban</label>
                <input
                  type="text"
                  value={banForm.reason}
                  onChange={(e) => setBanForm({...banForm, reason: e.target.value})}
                  placeholder="Ej: Spam, comportamiento inapropiado..."
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Expira (opcional)</label>
                <input
                  type="datetime-local"
                  value={banForm.expiresAt}
                  onChange={(e) => setBanForm({...banForm, expiresAt: e.target.value})}
                />
              </div>
              
              <div className="form-actions">
                <button type="button" onClick={() => setShowBanModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn-danger" disabled={loading}>
                  {loading ? 'Aplicando...' : 'Aplicar Ban'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BanManagement;
