import React, { useState, useEffect, useRef } from 'react';
import { 
  FaShieldAlt, FaUser, FaSearch, FaFileAlt, FaExclamationTriangle, 
  FaCheckCircle, FaTimes, FaEye, FaEdit, FaTrash, FaPlus, 
  FaCrown, FaGavel, FaIdCard, FaMoneyBillWave, FaList, 
  FaTrophy, FaLock, FaUnlock, FaCarCrash,
  FaUserShield, FaDatabase, FaClipboardList, FaHistory,
  FaSatellite, FaFingerprint, FaBrain, FaRobot,
  FaWifi, FaSignal, FaBolt, FaCog, FaGlobeAmericas, FaShieldVirus,
  FaCctv, FaMapMarkerAlt, FaPhone, FaEnvelope, FaClock,
  FaChartLine, FaUsers, FaCar, FaBuilding, FaNewspaper,
  FaMicrochip, FaSatelliteDish, FaBroadcastTower, FaWifi2,
  FaQrcode, FaBarcode, FaKey, FaCrosshairs, FaBullseye
} from 'react-icons/fa';
import { apiUrl } from '../../utils/api';
import './MDTPolicial.css';
import { 
  DNISection, MultasSection, AntecedentesSection, InventarioSection,
  SearchSection, MultarSection, ArrestarSection, RankingSection 
} from './MDTSections';
import CNISection from './CNISection';
import DashboardAdmin from './DashboardAdmin';

// Componente de búsqueda de ciudadanos con avatares
const CitizenSearchSection = ({ 
  searchResults, 
  searchLoading, 
  searchQuery, 
  setSearchQuery, 
  onSearch, 
  getRobloxAvatar 
}) => {
  const [selectedCitizen, setSelectedCitizen] = useState(null);

  const handleSearch = (e) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    if (value.length > 2) {
      onSearch(value);
    } else {
      onSearch('');
    }
  };

  return (
    <div className="citizen-search-section">
      <div className="search-header">
        <h3>
          <FaSearch />
          Búsqueda de Ciudadanos
        </h3>
        <p>Busca ciudadanos por nombre de Discord, Roblox o ID</p>
      </div>

      <div className="search-form-container">
        <form onSubmit={handleSearch} className="search-form">
          <div className="search-input-group">
            <input
              type="text"
              value={searchQuery}
              onChange={handleInputChange}
              placeholder="Buscar por nombre, Roblox o ID..."
              className="search-input"
            />
            <button type="submit" className="search-btn" disabled={searchLoading}>
              {searchLoading ? <FaCog className="spinning" /> : <FaSearch />}
            </button>
          </div>
        </form>
      </div>

      {searchLoading && (
        <div className="search-loading">
          <div className="loading-spinner">
            <div className="spinner-ring"></div>
            <div className="spinner-ring"></div>
            <div className="spinner-ring"></div>
          </div>
          <p>Buscando ciudadanos...</p>
        </div>
      )}

      {searchResults.length > 0 && (
        <div className="search-results">
          <div className="results-header">
            <h4>Resultados de Búsqueda</h4>
            <span className="results-count">{searchResults.length} ciudadano(s) encontrado(s)</span>
          </div>
          
          <div className="citizens-grid">
            {searchResults.map((citizen, index) => (
              <div 
                key={citizen.id || index} 
                className={`citizen-card ${selectedCitizen?.id === citizen.id ? 'selected' : ''}`}
                onClick={() => setSelectedCitizen(citizen)}
              >
                <div className="citizen-avatar">
                  {citizen.roblox_name ? (
                    <img 
                      src={getRobloxAvatar(citizen.roblox_name)} 
                      alt={citizen.discord_name || citizen.roblox_name}
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div className="avatar-placeholder" style={{ display: citizen.roblox_name ? 'none' : 'flex' }}>
                    <FaUser />
                  </div>
                </div>
                
                <div className="citizen-info">
                  <h5 className="citizen-name">
                    {citizen.discord_name || citizen.roblox_name || 'Sin nombre'}
                  </h5>
                  <div className="citizen-details">
                    {citizen.roblox_name && (
                      <div className="detail-item">
                        <span className="label">Roblox:</span>
                        <span className="value">{citizen.roblox_name}</span>
                      </div>
                    )}
                    {citizen.discord_id && (
                      <div className="detail-item">
                        <span className="label">Discord ID:</span>
                        <span className="value">{citizen.discord_id}</span>
                      </div>
                    )}
                    {citizen.dni && (
                      <div className="detail-item">
                        <span className="label">DNI:</span>
                        <span className="value">{citizen.dni}</span>
                      </div>
                    )}
                    <div className="citizen-status">
                      <span className={`status-badge ${citizen.estado === 'activo' ? 'active' : 'inactive'}`}>
                        {citizen.estado || 'Desconocido'}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="citizen-actions">
                  <button className="action-btn" title="Ver detalles">
                    <FaEye />
                  </button>
                  <button className="action-btn" title="Ver DNI">
                    <FaIdCard />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {searchQuery && !searchLoading && searchResults.length === 0 && (
        <div className="no-results">
          <FaSearch />
          <h4>No se encontraron ciudadanos</h4>
          <p>Intenta con un término de búsqueda diferente</p>
        </div>
      )}

      {selectedCitizen && (
        <div className="citizen-detail-modal">
          <div className="modal-header">
            <h4>Detalles del Ciudadano</h4>
            <button 
              className="close-btn" 
              onClick={() => setSelectedCitizen(null)}
            >
              <FaTimes />
            </button>
          </div>
          <div className="modal-content">
            <div className="citizen-detail-avatar">
              {selectedCitizen.roblox_name ? (
                <img 
                  src={getRobloxAvatar(selectedCitizen.roblox_name)} 
                  alt={selectedCitizen.discord_name || selectedCitizen.roblox_name}
                />
              ) : (
                <div className="avatar-placeholder">
                  <FaUser />
                </div>
              )}
            </div>
            <div className="citizen-detail-info">
              <h5>{selectedCitizen.discord_name || selectedCitizen.roblox_name || 'Sin nombre'}</h5>
              <div className="detail-grid">
                {selectedCitizen.roblox_name && (
                  <div className="detail-row">
                    <span className="label">Nombre Roblox:</span>
                    <span className="value">{selectedCitizen.roblox_name}</span>
                  </div>
                )}
                {selectedCitizen.discord_id && (
                  <div className="detail-row">
                    <span className="label">Discord ID:</span>
                    <span className="value">{selectedCitizen.discord_id}</span>
                  </div>
                )}
                {selectedCitizen.dni && (
                  <div className="detail-row">
                    <span className="label">DNI:</span>
                    <span className="value">{selectedCitizen.dni}</span>
                  </div>
                )}
                <div className="detail-row">
                  <span className="label">Estado:</span>
                  <span className={`value status ${selectedCitizen.estado === 'activo' ? 'active' : 'inactive'}`}>
                    {selectedCitizen.estado || 'Desconocido'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Componente de tarjeta de identificación policial moderna
const PoliceIDCard = ({ user, isPolice, isCNI, onFlip, compact = false }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
    if (onFlip) onFlip();
  };

  if (compact) {
    return (
      <div 
        className={`modern-police-badge ${isFlipped ? 'flipped' : ''} ${isHovered ? 'hovered' : ''}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleFlip}
      >
        <div className="badge-container">
          <div className="badge-header">
            <div className="badge-icon">
              <FaShieldAlt />
            </div>
            <div className="badge-title">
              <span className="title-main">MDT</span>
              <span className="title-sub">SISTEMA</span>
            </div>
            <div className="badge-status">
              <div className={`status-indicator ${isPolice ? 'active' : 'inactive'}`}></div>
            </div>
          </div>
          
          <div className="badge-content">
            <div className="officer-info">
              <div className="officer-name">
                <span className="name">{user?.username || 'USUARIO'}</span>
                <span className="id">ID: {user?.id?.slice(-4) || '0000'}</span>
              </div>
              <div className="officer-role">
                <span className={`role-badge ${isCNI ? 'cni' : isPolice ? 'police' : 'citizen'}`}>
                  {isCNI ? 'CNI' : isPolice ? 'POLICÍA' : 'CIUDADANO'}
                </span>
              </div>
            </div>
            
            <div className="badge-footer">
              <div className="security-level">
                <span className="level-text">NIVEL</span>
                <span className="level-number">3</span>
              </div>
              <div className="badge-qr">
                <FaQrcode />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`police-id-card ${isFlipped ? 'flipped' : ''} ${isHovered ? 'hovered' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleFlip}
    >
      {/* Frente de la tarjeta */}
      <div className="id-card-front">
        <div className="id-card-header">
          <div className="police-badge">
            <FaShieldAlt />
            <span>POLICÍA NACIONAL</span>
          </div>
          <div className="security-level">
            <div className="security-dots">
              <span className="dot active"></span>
              <span className="dot active"></span>
              <span className="dot active"></span>
            </div>
            <span>NIVEL 3</span>
          </div>
        </div>
        
        <div className="id-card-content">
          <div className="officer-photo">
            <div className="photo-container">
              <div className="photo-placeholder">
                <FaUserShield />
              </div>
              <div className="photo-overlay">
                <FaFingerprint />
              </div>
            </div>
          </div>
          
          <div className="officer-info">
            <div className="officer-name">
              <h3>{user?.username || 'OFICIAL'}</h3>
              <span className="badge-number">#{user?.id?.slice(-6) || '000000'}</span>
            </div>
            
            <div className="officer-details">
              <div className="detail-row">
                <span className="label">RANGO:</span>
                <span className="value">
                  {isCNI ? 'AGENTE CNI' : isPolice ? 'POLICÍA' : 'CIUDADANO'}
                </span>
              </div>
              <div className="detail-row">
                <span className="label">DEPARTAMENTO:</span>
                <span className="value">MDT CENTRAL</span>
              </div>
              <div className="detail-row">
                <span className="label">ESTADO:</span>
                <span className={`status ${isPolice ? 'active' : 'inactive'}`}>
                  {isPolice ? 'ACTIVO' : 'INACTIVO'}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="id-card-footer">
          <div className="qr-code">
            <FaQrcode />
          </div>
          <div className="expiry-date">
            <span>VÁLIDO HASTA</span>
            <span>12/25</span>
          </div>
        </div>
      </div>

      {/* Reverso de la tarjeta */}
      <div className="id-card-back">
        <div className="back-header">
          <div className="police-logo">
            <FaShieldAlt />
            <span>POLICÍA NACIONAL</span>
          </div>
        </div>
        
        <div className="back-content">
          <div className="magnetic-stripe"></div>
          
          <div className="back-info">
            <div className="security-features">
              <h4>CARACTERÍSTICAS DE SEGURIDAD</h4>
              <div className="features-grid">
                <div className="feature-item">
                  <FaMicrochip />
                  <span>Chip de Seguridad</span>
                </div>
                <div className="feature-item">
                  <FaFingerprint />
                  <span>Biometría</span>
                </div>
                <div className="feature-item">
                  <FaQrcode />
                  <span>Código QR</span>
                </div>
                <div className="feature-item">
                  <FaShieldAlt />
                  <span>Encriptación</span>
                </div>
              </div>
            </div>
            
            <div className="contact-info">
              <div className="contact-item">
                <FaPhone />
                <span>+34 900 123 456</span>
              </div>
              <div className="contact-item">
                <FaEnvelope />
                <span>mdt@policia.es</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Componente de terminal de comandos animado
const CommandTerminal = ({ isActive, onCommand }) => {
  const [command, setCommand] = useState('');
  const [history, setHistory] = useState([]);
  const terminalRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (command.trim()) {
      setHistory(prev => [...prev, { command, timestamp: new Date() }]);
      if (onCommand) onCommand(command);
      setCommand('');
    }
  };

  return (
    <div className={`command-terminal ${isActive ? 'active' : ''}`}>
      <div className="terminal-header">
        <div className="terminal-controls">
          <span className="control close"></span>
          <span className="control minimize"></span>
          <span className="control maximize"></span>
        </div>
        <div className="terminal-title">MDT COMMAND INTERFACE</div>
      </div>
      
      <div className="terminal-body" ref={terminalRef}>
        <div className="terminal-output">
          {history.map((item, index) => (
            <div key={index} className="terminal-line">
              <span className="prompt">mdt@police:~$</span>
              <span className="command">{item.command}</span>
              <span className="timestamp">
                {item.timestamp.toLocaleTimeString()}
              </span>
            </div>
          ))}
        </div>
        
        <form onSubmit={handleSubmit} className="terminal-input">
          <span className="prompt">mdt@police:~$</span>
          <input
            type="text"
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            placeholder="Ingresa comando..."
            className="command-input"
            autoFocus
          />
        </form>
      </div>
    </div>
  );
};

// Componente de información del sistema
const SystemInfoPanel = () => {
  const [systemStats, setSystemStats] = useState({
    onlineUsers: 0,
    activeSearches: 0,
    systemLoad: 0,
    lastUpdate: new Date()
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setSystemStats(prev => ({
        ...prev,
        onlineUsers: Math.floor(Math.random() * 50) + 20,
        activeSearches: Math.floor(Math.random() * 10) + 1,
        systemLoad: Math.floor(Math.random() * 30) + 10,
        lastUpdate: new Date()
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="system-info-panel">
      <div className="panel-header">
        <FaDatabase />
        <span>INFORMACIÓN DEL SISTEMA</span>
      </div>
      
      <div className="system-stats">
        <div className="stat-item">
          <div className="stat-icon">
            <FaUsers />
          </div>
          <div className="stat-content">
            <span className="stat-label">USUARIOS ONLINE</span>
            <span className="stat-value">{systemStats.onlineUsers}</span>
          </div>
        </div>
        
        <div className="stat-item">
          <div className="stat-icon">
            <FaSearch />
          </div>
          <div className="stat-content">
            <span className="stat-label">BÚSQUEDAS ACTIVAS</span>
            <span className="stat-value">{systemStats.activeSearches}</span>
          </div>
        </div>
        
        <div className="stat-item">
          <div className="stat-icon">
            <FaCog />
          </div>
          <div className="stat-content">
            <span className="stat-label">CARGA DEL SISTEMA</span>
            <span className="stat-value">{systemStats.systemLoad}%</span>
          </div>
        </div>
      </div>
      
      <div className="system-status">
        <div className="status-indicator">
          <div className="status-dot online"></div>
          <span>SISTEMA OPERATIVO</span>
        </div>
        <div className="last-update">
          Última actualización: {systemStats.lastUpdate.toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
};

const MDTPolicial = () => {
  const [user, setUser] = useState(null);
  const [isPolice, setIsPolice] = useState(false);
  const [isCNI, setIsCNI] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('citizen');
  const [error, setError] = useState(null);
  const [terminalActive, setTerminalActive] = useState(false);
  const [bannerVisible, setBannerVisible] = useState(true);

  // Estados para ciudadanos
  const [citizenData, setCitizenData] = useState({
    dni: null,
    multas: [],
    antecedentes: [],
    inventario: []
  });

  // Estados para policías
  const [policeData, setPoliceData] = useState({
    dnis: [],
    searchResults: [],
    selectedDNI: null
  });

  // Verificar autenticación y permisos
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('spainrp_token');
        if (!token) {
          setError('Debes iniciar sesión para acceder al MDT');
          setLoading(false);
          return;
        }

        // Verificar usuario
        const userRes = await fetch(apiUrl('/auth/me'), {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!userRes.ok) {
          setError('Token inválido');
          setLoading(false);
          return;
        }

        const userData = await userRes.json();
        setUser(userData.user);

        // Verificar si es policía
        const policeRes = await fetch(apiUrl(`/api/discord/rolecheck/${userData.user.id}/1384340781392724171`));
        if (policeRes.ok) {
          const policeData = await policeRes.json();
          setIsPolice(policeData.hasRole);
        }

        // Verificar si es CNI
        const cniRes = await fetch(apiUrl(`/api/discord/rolecheck/${userData.user.id}/1384340775772360841`));
        if (cniRes.ok) {
          const cniData = await cniRes.json();
          setIsCNI(cniData.hasRole);
        }

        setLoading(false);
      } catch (err) {
        setError('Error verificando permisos');
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Cargar datos del ciudadano
  const loadCitizenData = async () => {
    if (!user) return;

    try {
      // Cargar DNI
      const dniRes = await fetch(apiUrl(`/api/proxy/admin/dni/ver/${user.id}`));
      if (dniRes.ok) {
        const dniData = await dniRes.json();
        setCitizenData(prev => ({ ...prev, dni: dniData }));
      }

      // Cargar multas
      const multasRes = await fetch(apiUrl(`/api/proxy/admin/ver-multas/${user.id}`));
      if (multasRes.ok) {
        const multasData = await multasRes.json();
        setCitizenData(prev => ({ ...prev, multas: multasData.multas || [] }));
      }

      // Cargar antecedentes
      const antecedentesRes = await fetch(apiUrl(`/api/proxy/admin/antecedentes/${user.id}`));
      if (antecedentesRes.ok) {
        const antecedentesData = await antecedentesRes.json();
        setCitizenData(prev => ({ ...prev, antecedentes: antecedentesData.antecedentes || [] }));
      }

      // Cargar inventario
      const inventarioRes = await fetch(apiUrl(`/api/proxy/admin/inventario/${user.id}`));
      if (inventarioRes.ok) {
        const inventarioData = await inventarioRes.json();
        setCitizenData(prev => ({ ...prev, inventario: inventarioData.inventario || [] }));
      }
    } catch (err) {
      console.error('Error cargando datos del ciudadano:', err);
    }
  };

  // Cargar datos policiales
  const loadPoliceData = async () => {
    try {
      // Cargar ranking de multas
      const topRes = await fetch(apiUrl('/api/proxy/admin/top-multas'));
      if (topRes.ok) {
        const topData = await topRes.json();
        console.log('Datos del ranking recibidos:', topData);
        setPoliceData(prev => ({ 
          ...prev, 
          topMultas: topData,
          rankingMessage: topData.message || null
        }));
      } else {
        console.warn('Error cargando ranking de multas:', topRes.status);
        setPoliceData(prev => ({ 
          ...prev, 
          topMultas: [],
          rankingMessage: 'Ranking no disponible temporalmente'
        }));
      }
    } catch (err) {
      console.error('Error cargando datos policiales:', err);
      setPoliceData(prev => ({ 
        ...prev, 
        topMultas: [],
        rankingMessage: 'Error de conexión al cargar ranking'
      }));
    }
  };

  useEffect(() => {
    if (user) {
      loadCitizenData();
      if (isPolice) {
        loadPoliceData();
      }
    }
  }, [user, isPolice]);

  const handleCommand = (command) => {
    console.log('Comando ejecutado:', command);
    // Aquí se pueden añadir comandos específicos del MDT
  };

  if (loading) {
    return (
      <div className="mdt-loading-screen">
        <div className="loading-content">
          <div className="police-logo">
            <FaShieldAlt />
            <span>MDT POLICIAL</span>
          </div>
          <div className="loading-spinner">
            <div className="spinner-ring"></div>
            <div className="spinner-ring"></div>
            <div className="spinner-ring"></div>
          </div>
          <p>Inicializando sistema MDT...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mdt-error-screen">
        <div className="error-content">
          <FaExclamationTriangle className="error-icon" />
          <h2>Error de Acceso</h2>
          <p>{error}</p>
          <a href="/auth/login" className="mdt-btn mdt-btn-primary">
            Iniciar Sesión
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="mdt-container">
      {/* Banner informativo */}
      {bannerVisible && (
        <div className="mdt-banner">
          <div className="banner-content">
            <FaExclamationTriangle className="banner-icon" />
            <div className="banner-text">
              <strong>Nota Importante:</strong> Sabemos que hay funciones en desarrollo, pendientes de configuración o ciertos errores. 
              El programador <strong>BijjouPro08</strong> está al tanto y trabajando en las mejoras. 
              <em>Gracias por su comprensión y paciencia.</em>
            </div>
            <button 
              className="banner-close" 
              onClick={() => setBannerVisible(false)}
              title="Cerrar banner"
            >
              <FaTimes />
            </button>
          </div>
        </div>
      )}

      {/* Header simplificado */}
      <div className="mdt-header">
        <div className="header-left">
          <div className="mdt-logo">
            <FaShieldAlt />
            <div className="logo-text">
              <span className="main-title">MDT POLICIAL</span>
              <span className="subtitle">Sistema de Gestión Policial</span>
            </div>
          </div>
        </div>
        
        <div className="header-center">
          <div className="mdt-status-indicator">
            <div className="status-dot online"></div>
            <span className="status-text">MDT ACTIVO</span>
          </div>
        </div>
        
        <div className="header-right">
          <div className="system-controls">
            <button 
              className={`control-btn ${terminalActive ? 'active' : ''}`}
              onClick={() => setTerminalActive(!terminalActive)}
              title="Terminal de Comandos"
            >
              <FaCog />
            </button>
            <div className="status-indicators">
              <div className="indicator online">
                <span className="dot"></span>
                <span>ONLINE</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Panel de herramientas flotantes */}
      <div className="mdt-toolbar">
        <div className="toolbar-left">
          <button 
            className={`toolbar-btn ${activeTab === 'citizen' ? 'active' : ''}`}
            onClick={() => setActiveTab('citizen')}
          >
            <FaUser />
            <span>Ciudadano</span>
          </button>
          {isPolice && (
            <button 
              className={`toolbar-btn ${activeTab === 'police' ? 'active' : ''}`}
              onClick={() => setActiveTab('police')}
            >
              <FaShieldAlt />
              <span>Policía</span>
            </button>
          )}
          {isCNI && (
            <button 
              className={`toolbar-btn ${activeTab === 'cni' ? 'active' : ''}`}
              onClick={() => setActiveTab('cni')}
            >
              <FaEye />
              <span>CNI</span>
            </button>
          )}
          {user?.id === '710112055985963090' && (
            <button 
              className={`toolbar-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => setActiveTab('dashboard')}
            >
              <FaCog />
              <span>Dashboard</span>
            </button>
          )}
        </div>
        
        <div className="toolbar-center">
          <div className="system-info">
            <span className="time">{new Date().toLocaleTimeString()}</span>
            <span className="date">{new Date().toLocaleDateString()}</span>
          </div>
        </div>
        
        <div className="toolbar-right">
          <div className="user-info">
            <span className="user-name">{user?.username || 'Usuario'}</span>
            <span className="user-role">{isCNI ? 'CNI' : isPolice ? 'Policía' : 'Ciudadano'}</span>
          </div>
        </div>
        
        <div className="toolbar-center">
          <div className="id-card-compact">
            <PoliceIDCard 
              user={user} 
              isPolice={isPolice} 
              isCNI={isCNI}
              onFlip={() => console.log('Tarjeta volteada')}
              compact={true}
            />
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="mdt-main-content">
        <div className="content-left">
          {activeTab === 'citizen' && (
            <CitizenPanel 
              data={citizenData} 
              onRefresh={loadCitizenData}
              userId={user?.id}
            />
          )}
          {activeTab === 'police' && isPolice && (
            <PolicePanel 
              data={policeData}
              onSearch={setPoliceData}
              onRefresh={loadPoliceData}
            />
          )}
          {activeTab === 'cni' && isCNI && (
            <CNISection />
          )}
          {activeTab === 'dashboard' && user?.id === '710112055985963090' && (
            <DashboardAdmin userId={user.id} />
          )}
        </div>
        
        <div className="content-right">
          {/* Terminal de comandos */}
          {terminalActive && (
            <CommandTerminal 
              isActive={terminalActive}
              onCommand={handleCommand}
            />
          )}
          
          {/* Panel de información del sistema */}
          <SystemInfoPanel />
        </div>
      </div>

      {/* Términos y Condiciones */}
      <div className="mdt-terms">
        <div className="terms-content">
          <div className="terms-section">
            <h4>Información del Sistema</h4>
            <p>El MDT Policial es un sistema de gestión policial virtual desarrollado para el servidor SpainRP. Todos los datos mostrados son simulados y utilizados únicamente para fines de roleplay.</p>
          </div>
          <div className="terms-section">
            <h4>Uso de Datos</h4>
            <p>Los datos de ciudadanos, multas, antecedentes e inventarios son generados automáticamente por el sistema del servidor.</p>
          </div>
          <div className="terms-section">
            <h4>Seguridad</h4>
            <p>El sistema utiliza encriptación SSL y cumple con los estándares de seguridad para proteger la información. El acceso está restringido a personal autorizado.</p>
          </div>
          <div className="terms-section">
            <h4>Contacto</h4>
            <p>Para soporte técnico o reportar problemas, contacte con BijjouPro08 en el servidor SpainRP a través de Discord.</p>
          </div>
        </div>
        <div className="terms-footer">
          <p>© 2025 MDT Policial SpainRP. Sistema de Gestión Policial Virtual. | Servidor: SpainRP | Versión: 2.0</p>
        </div>
      </div>
    </div>
  );
};

// Panel de Ciudadano Reformado
const CitizenPanel = ({ data, onRefresh, userId }) => {
  const [activeSection, setActiveSection] = useState('mi-dni');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Función para buscar ciudadanos
  const searchCitizens = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setSearchLoading(true);
    try {
      const response = await fetch(apiUrl(`/api/proxy/admin/buscar-ciudadanos?q=${encodeURIComponent(query)}`));
      if (response.ok) {
        const results = await response.json();
        setSearchResults(results.ciudadanos || []);
      }
    } catch (error) {
      console.error('Error buscando ciudadanos:', error);
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  // Función para obtener avatar de Roblox
  const getRobloxAvatar = (robloxName) => {
    if (!robloxName) return null;
    return `https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${robloxName}&size=150x150&format=Png&isCircular=true`;
  };

  return (
    <div className="citizen-panel">
      <div className="panel-header">
        <h2>Panel de Ciudadano</h2>
        <div className="panel-controls">
          <button className="refresh-btn" onClick={onRefresh}>
            <FaCog />
          </button>
        </div>
      </div>
      
      <div className="citizen-nav">
        <button 
          className={`nav-btn ${activeSection === 'mi-dni' ? 'active' : ''}`}
          onClick={() => setActiveSection('mi-dni')}
        >
          <FaIdCard />
          <span>Mi DNI</span>
        </button>
        <button 
          className={`nav-btn ${activeSection === 'buscar-ciudadanos' ? 'active' : ''}`}
          onClick={() => setActiveSection('buscar-ciudadanos')}
        >
          <FaSearch />
          <span>Buscar Ciudadanos</span>
        </button>
        <button 
          className={`nav-btn ${activeSection === 'multas' ? 'active' : ''}`}
          onClick={() => setActiveSection('multas')}
        >
          <FaMoneyBillWave />
          <span>Multas</span>
        </button>
        <button 
          className={`nav-btn ${activeSection === 'antecedentes' ? 'active' : ''}`}
          onClick={() => setActiveSection('antecedentes')}
        >
          <FaHistory />
          <span>Antecedentes</span>
        </button>
        <button 
          className={`nav-btn ${activeSection === 'inventario' ? 'active' : ''}`}
          onClick={() => setActiveSection('inventario')}
        >
          <FaClipboardList />
          <span>Inventario</span>
        </button>
      </div>

      <div className="citizen-content">
        {activeSection === 'mi-dni' && <DNISection data={data.dni} />}
        {activeSection === 'buscar-ciudadanos' && (
          <CitizenSearchSection 
            searchResults={searchResults}
            searchLoading={searchLoading}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onSearch={searchCitizens}
            getRobloxAvatar={getRobloxAvatar}
          />
        )}
        {activeSection === 'multas' && <MultasSection data={data.multas} userId={userId} onRefresh={onRefresh} />}
        {activeSection === 'antecedentes' && <AntecedentesSection data={data.antecedentes} />}
        {activeSection === 'inventario' && <InventarioSection data={data.inventario} />}
      </div>
    </div>
  );
};

// Panel de Policía
const PolicePanel = ({ data, onSearch, onRefresh }) => {
  const [activeSection, setActiveSection] = useState('search');

  return (
    <div className="police-panel">
      <div className="panel-header">
        <h2>Panel Policial</h2>
        <div className="panel-controls">
          <button className="refresh-btn" onClick={onRefresh}>
            <FaCog />
          </button>
        </div>
      </div>
      
      <div className="police-nav">
        <button 
          className={`nav-btn ${activeSection === 'search' ? 'active' : ''}`}
          onClick={() => setActiveSection('search')}
        >
          <FaSearch />
          <span>Buscar</span>
        </button>
        <button 
          className={`nav-btn ${activeSection === 'multar' ? 'active' : ''}`}
          onClick={() => setActiveSection('multar')}
        >
          <FaGavel />
          <span>Multar</span>
        </button>
        <button 
          className={`nav-btn ${activeSection === 'arrestar' ? 'active' : ''}`}
          onClick={() => setActiveSection('arrestar')}
        >
          <FaLock />
          <span>Arrestar</span>
        </button>
        <button 
          className={`nav-btn ${activeSection === 'ranking' ? 'active' : ''}`}
          onClick={() => setActiveSection('ranking')}
        >
          <FaTrophy />
          <span>Ranking</span>
        </button>
      </div>

      <div className="police-content">
        {activeSection === 'search' && <SearchSection onSearch={onSearch} />}
        {activeSection === 'multar' && <MultarSection onRefresh={onRefresh} />}
        {activeSection === 'arrestar' && <ArrestarSection onRefresh={onRefresh} />}
        {activeSection === 'ranking' && <RankingSection data={data.topMultas} message={data.rankingMessage} />}
      </div>
    </div>
  );
};

export default MDTPolicial;