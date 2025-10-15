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
  FaFingerprint as FaFingerprintIcon, FaQrcode, FaBarcode,
  FaKey, FaLock as FaLockIcon, FaUnlock as FaUnlockIcon,
  FaShieldAlt as FaShieldIcon, FaCrosshairs, FaBullseye,
  FaSatellite as FaRadarIcon, FaSatellite as FaSatelliteIcon,
  FaWifi as FaWifiIcon, FaSignal as FaSignalIcon,
  FaBolt as FaBoltIcon, FaCog as FaCogIcon,
  FaGlobeAmericas as FaGlobeIcon, FaShieldVirus as FaShieldVirusIcon,
  FaChevronDown, FaChevronUp, FaExpand, FaCompress, FaBars,
  FaQuestionCircle, FaBell, FaUserCircle, FaSignOutAlt,
  FaHome, FaShieldAlt as FaHandcuffsIcon, FaChartBar, FaExclamationCircle, 
  FaInfoCircle, FaCheck, FaTimes as FaX, FaCog as FaSettings,
  FaSync, FaDownload, FaUpload, FaSave, FaPrint,
  FaMapPin, FaRoute, FaTrafficLight, FaCarSide, FaMotorcycle,
  FaTruck, FaBus, FaBicycle, FaWalking, FaRunning
} from 'react-icons/fa';
import { apiUrl } from '../../utils/api';
import './MDTPolicial.css';
import { 
  DNISection, MultasSection, AntecedentesSection, InventarioSection,
  SearchSection, MultarSection, ArrestarSection, RankingSection 
} from './MDTSections';
import CNISection from './CNISection';
import DashboardAdmin from './DashboardAdmin';

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
        className={`mdt-id-card-compact ${isFlipped ? 'flipped' : ''} ${isHovered ? 'hovered' : ''}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleFlip}
      >
        <div className="mdt-id-compact-content">
          <div className="mdt-id-compact-header">
            <div className="mdt-badge-small">
              <FaShieldAlt />
              <span>{isCNI ? 'CNI' : 'POLICÍA'}</span>
            </div>
            <div className="mdt-status-indicator">
              <div className={`mdt-status-dot ${isPolice ? 'active' : 'inactive'}`}></div>
            </div>
          </div>
          
          <div className="mdt-id-compact-info">
            <div className="mdt-officer-name-compact">
              <h4>{user?.username || 'OFICIAL'}</h4>
              <span className="mdt-badge-number">#{user?.id?.slice(-6) || '000000'}</span>
            </div>
            
            <div className="mdt-officer-details-compact">
              <div className="mdt-detail-row">
                <span className="mdt-label">RANGO:</span>
                <span className="mdt-value">
                  {isCNI ? 'AGENTE CNI' : isPolice ? 'POLICÍA' : 'CIUDADANO'}
                </span>
              </div>
              <div className="mdt-detail-row">
                <span className="mdt-label">ESTADO:</span>
                <span className={`mdt-status ${isPolice ? 'active' : 'inactive'}`}>
                  {isPolice ? 'ACTIVO' : 'INACTIVO'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`mdt-id-card ${isFlipped ? 'flipped' : ''} ${isHovered ? 'hovered' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleFlip}
    >
      {/* Frente de la tarjeta */}
      <div className="mdt-id-card-front">
        <div className="mdt-id-card-header">
          <div className="mdt-police-badge">
            <FaShieldAlt />
            <span>POLICÍA NACIONAL</span>
          </div>
          <div className="mdt-security-level">
            <div className="mdt-security-dots">
              <span className="mdt-dot active"></span>
              <span className="mdt-dot active"></span>
              <span className="mdt-dot active"></span>
            </div>
            <span>NIVEL 3</span>
          </div>
        </div>
        
        <div className="mdt-id-card-content">
          <div className="mdt-officer-photo">
            <div className="mdt-photo-container">
              <div className="mdt-photo-placeholder">
                <FaUserShield />
              </div>
              <div className="mdt-photo-overlay">
                <FaFingerprintIcon />
              </div>
            </div>
          </div>
          
          <div className="mdt-officer-info">
            <div className="mdt-officer-name">
              <h3>{user?.username || 'OFICIAL'}</h3>
              <span className="mdt-badge-number">#{user?.id?.slice(-6) || '000000'}</span>
            </div>
            
            <div className="mdt-officer-details">
              <div className="mdt-detail-row">
                <span className="mdt-label">RANGO:</span>
                <span className="mdt-value">
                  {isCNI ? 'AGENTE CNI' : isPolice ? 'POLICÍA' : 'CIUDADANO'}
                </span>
              </div>
              <div className="mdt-detail-row">
                <span className="mdt-label">DEPARTAMENTO:</span>
                <span className="mdt-value">MDT CENTRAL</span>
              </div>
              <div className="mdt-detail-row">
                <span className="mdt-label">ESTADO:</span>
                <span className={`mdt-status ${isPolice ? 'active' : 'inactive'}`}>
                  {isPolice ? 'ACTIVO' : 'INACTIVO'}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mdt-id-card-footer">
          <div className="mdt-qr-code">
            <FaQrcode />
          </div>
          <div className="mdt-expiry-date">
            <span>VÁLIDO HASTA</span>
            <span>12/25</span>
          </div>
        </div>
      </div>

      {/* Reverso de la tarjeta */}
      <div className="mdt-id-card-back">
        <div className="mdt-back-header">
          <div className="mdt-police-logo">
            <FaShieldAlt />
            <span>POLICÍA NACIONAL</span>
          </div>
        </div>
        
        <div className="mdt-back-content">
          <div className="mdt-magnetic-stripe"></div>
          
          <div className="mdt-back-info">
            <div className="mdt-security-features">
              <h4>CARACTERÍSTICAS DE SEGURIDAD</h4>
              <div className="mdt-features-grid">
                <div className="mdt-feature-item">
                  <FaMicrochip />
                  <span>Chip de Seguridad</span>
                </div>
                <div className="mdt-feature-item">
                  <FaFingerprintIcon />
                  <span>Biometría</span>
                </div>
                <div className="mdt-feature-item">
                  <FaQrcode />
                  <span>Código QR</span>
                </div>
                <div className="mdt-feature-item">
                  <FaShieldIcon />
                  <span>Encriptación</span>
                </div>
              </div>
            </div>
            
            <div className="mdt-contact-info">
              <div className="mdt-contact-item">
                <FaPhone />
                <span>+34 900 123 456</span>
              </div>
              <div className="mdt-contact-item">
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

// Componente de terminal de comandos moderno
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
    <div className={`mdt-command-terminal ${isActive ? 'active' : ''}`}>
      <div className="mdt-terminal-header">
        <div className="mdt-terminal-controls">
          <span className="mdt-control close"></span>
          <span className="mdt-control minimize"></span>
          <span className="mdt-control maximize"></span>
        </div>
        <div className="mdt-terminal-title">MDT COMMAND INTERFACE</div>
      </div>
      
      <div className="mdt-terminal-body" ref={terminalRef}>
        <div className="mdt-terminal-output">
          {history.map((item, index) => (
            <div key={index} className="mdt-terminal-line">
              <span className="mdt-prompt">mdt@police:~$</span>
              <span className="mdt-command">{item.command}</span>
              <span className="mdt-timestamp">
                {item.timestamp.toLocaleTimeString()}
              </span>
            </div>
          ))}
        </div>
        
        <form onSubmit={handleSubmit} className="mdt-terminal-input">
          <span className="mdt-prompt">mdt@police:~$</span>
          <input
            type="text"
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            placeholder="Ingresa comando..."
            className="mdt-command-input"
            autoFocus
          />
        </form>
      </div>
    </div>
  );
};

// Componente de radar de actividad moderno
const ActivityRadar = ({ isActive }) => {
  const [scans, setScans] = useState([]);
  const radarRef = useRef(null);

  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      const newScan = {
        id: Date.now(),
        x: Math.random() * 100,
        y: Math.random() * 100,
        intensity: Math.random() * 100
      };
      setScans(prev => [...prev.slice(-10), newScan]);
    }, 2000);

    return () => clearInterval(interval);
  }, [isActive]);

  return (
    <div className={`mdt-activity-radar ${isActive ? 'active' : ''}`}>
      <div className="mdt-radar-header">
        <FaRadarIcon />
        <span>RADAR DE ACTIVIDAD</span>
      </div>
      
      <div className="mdt-radar-display" ref={radarRef}>
        <div className="mdt-radar-grid">
          <div className="mdt-grid-line horizontal"></div>
          <div className="mdt-grid-line vertical"></div>
          <div className="mdt-grid-line diagonal-1"></div>
          <div className="mdt-grid-line diagonal-2"></div>
        </div>
        
        <div className="mdt-radar-center">
          <div className="mdt-center-dot"></div>
        </div>
        
        {scans.map(scan => (
          <div
            key={scan.id}
            className="mdt-radar-scan"
            style={{
              left: `${scan.x}%`,
              top: `${scan.y}%`,
              '--intensity': `${scan.intensity}%`
            }}
          >
            <div className="mdt-scan-pulse"></div>
          </div>
        ))}
      </div>
      
      <div className="mdt-radar-stats">
        <div className="mdt-stat">
          <span className="mdt-label">ESCANEOS:</span>
          <span className="mdt-value">{scans.length}</span>
        </div>
        <div className="mdt-stat">
          <span className="mdt-label">ACTIVIDAD:</span>
          <span className="mdt-value">ALTA</span>
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
  const [radarActive, setRadarActive] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
        <div className="mdt-loading-content">
          <div className="mdt-loading-logo">
            <FaShieldAlt />
            <span>MDT POLICIAL</span>
          </div>
          <div className="mdt-loading-spinner">
            <div className="mdt-spinner-ring"></div>
            <div className="mdt-spinner-ring"></div>
            <div className="mdt-spinner-ring"></div>
          </div>
          <p>Inicializando sistema MDT...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mdt-error-screen">
        <div className="mdt-error-content">
          <FaExclamationTriangle className="mdt-error-icon" />
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
    <div className={`mdt-container ${isFullscreen ? 'fullscreen' : ''}`}>
      {/* Header moderno */}
      <div className="mdt-header">
        <div className="mdt-header-left">
          <div className="mdt-logo">
            <div className="mdt-logo-icon">
              <FaShieldAlt />
            </div>
            <div className="mdt-logo-text">
              <span className="mdt-main-title">MDT POLICIAL</span>
              <span className="mdt-subtitle">Sistema de Gestión Policial</span>
            </div>
          </div>
        </div>
        
        <div className="mdt-header-center">
          <div className="mdt-system-status">
            <div className="mdt-status-item">
              <div className="mdt-status-indicator online"></div>
              <span className="mdt-status-label">SISTEMA</span>
              <span className="mdt-status-value">OPERATIVO</span>
            </div>
            <div className="mdt-status-item">
              <div className="mdt-status-indicator online"></div>
              <span className="mdt-status-label">CONEXIÓN</span>
              <span className="mdt-status-value">ESTABLE</span>
            </div>
            <div className="mdt-status-item">
              <div className="mdt-status-indicator online"></div>
              <span className="mdt-status-label">BASE DE DATOS</span>
              <span className="mdt-status-value">CONECTADA</span>
            </div>
          </div>
        </div>
        
        <div className="mdt-header-right">
          <div className="mdt-header-controls">
            <button 
              className={`mdt-control-btn ${terminalActive ? 'active' : ''}`}
              onClick={() => setTerminalActive(!terminalActive)}
              title="Terminal de Comandos"
            >
              <FaCog />
            </button>
            <button 
              className={`mdt-control-btn ${radarActive ? 'active' : ''}`}
              onClick={() => setRadarActive(!radarActive)}
              title="Radar de Actividad"
            >
              <FaRadarIcon />
            </button>
            <button 
              className="mdt-control-btn"
              onClick={() => setShowHelp(!showHelp)}
              title="Ayuda del Sistema"
            >
              <FaQuestionCircle />
            </button>
            <button 
              className="mdt-control-btn"
              onClick={() => setIsFullscreen(!isFullscreen)}
              title={isFullscreen ? "Salir de Pantalla Completa" : "Pantalla Completa"}
            >
              {isFullscreen ? <FaCompress /> : <FaExpand />}
            </button>
            <button 
              className="mdt-control-btn mdt-mobile-menu-btn"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              title="Menú"
            >
              <FaBars />
            </button>
          </div>
        </div>
      </div>

      {/* Navegación principal */}
      <div className="mdt-navigation">
        <div className="mdt-nav-container">
          <button 
            className={`mdt-nav-btn ${activeTab === 'citizen' ? 'active' : ''}`}
            onClick={() => setActiveTab('citizen')}
          >
            <FaUser />
            <span>Ciudadano</span>
          </button>
          {isPolice && (
            <button 
              className={`mdt-nav-btn ${activeTab === 'police' ? 'active' : ''}`}
              onClick={() => setActiveTab('police')}
            >
              <FaShieldAlt />
              <span>Policía</span>
            </button>
          )}
          {isCNI && (
            <button 
              className={`mdt-nav-btn ${activeTab === 'cni' ? 'active' : ''}`}
              onClick={() => setActiveTab('cni')}
            >
              <FaEye />
              <span>CNI</span>
            </button>
          )}
          {user?.id === '710112055985963090' && (
            <button 
              className={`mdt-nav-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => setActiveTab('dashboard')}
            >
              <FaSettings />
              <span>Dashboard</span>
            </button>
          )}
        </div>
        
        <div className="mdt-user-info">
          <div className="mdt-user-avatar">
            <FaUserCircle />
          </div>
          <div className="mdt-user-details">
            <span className="mdt-user-name">{user?.username || 'Usuario'}</span>
            <span className="mdt-user-role">{isCNI ? 'CNI' : isPolice ? 'Policía' : 'Ciudadano'}</span>
          </div>
          <div className="mdt-id-card-compact">
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
        <div className="mdt-content-left">
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
        
        <div className="mdt-content-right">
          {/* Terminal de comandos */}
          {terminalActive && (
            <CommandTerminal 
              isActive={terminalActive}
              onCommand={handleCommand}
            />
          )}
          
          {/* Radar de actividad */}
          {radarActive && (
            <ActivityRadar isActive={radarActive} />
          )}
        </div>
      </div>

      {/* Panel de ayuda */}
      {showHelp && (
        <div className="mdt-help-overlay" onClick={() => setShowHelp(false)}>
          <div className="mdt-help-panel" onClick={(e) => e.stopPropagation()}>
            <div className="mdt-help-header">
              <h3>Ayuda del Sistema MDT</h3>
              <button 
                className="mdt-help-close"
                onClick={() => setShowHelp(false)}
              >
                <FaX />
              </button>
            </div>
            <div className="mdt-help-content">
              <div className="mdt-help-section">
                <h4>Navegación</h4>
                <p>Utiliza las pestañas superiores para navegar entre las diferentes secciones del MDT.</p>
              </div>
              <div className="mdt-help-section">
                <h4>Búsquedas</h4>
                <p>En la sección de Policía puedes buscar ciudadanos por DNI, nombre o Discord ID.</p>
              </div>
              <div className="mdt-help-section">
                <h4>Herramientas</h4>
                <p>Utiliza el terminal de comandos y el radar de actividad para monitorear el sistema.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Términos y Condiciones */}
      <div className="mdt-footer">
        <div className="mdt-footer-content">
          <div className="mdt-footer-section">
            <h4>Información del Sistema</h4>
            <p>El MDT Policial es un sistema de gestión policial virtual desarrollado para el servidor SpainRP. Todos los datos mostrados son simulados y utilizados únicamente para fines de roleplay.</p>
          </div>
          <div className="mdt-footer-section">
            <h4>Uso de Datos</h4>
            <p>Los datos de ciudadanos, multas, antecedentes e inventarios son generados automáticamente por el sistema del servidor.</p>
          </div>
          <div className="mdt-footer-section">
            <h4>Seguridad</h4>
            <p>El sistema utiliza encriptación SSL y cumple con los estándares de seguridad para proteger la información. El acceso está restringido a personal autorizado.</p>
          </div>
          <div className="mdt-footer-section">
            <h4>Contacto</h4>
            <p>Para soporte técnico o reportar problemas, contacte con BijjouPro08 en el servidor SpainRP a través de Discord.</p>
          </div>
        </div>
        <div className="mdt-footer-bottom">
          <p>© 2025 MDT Policial SpainRP. Sistema de Gestión Policial Virtual. | Servidor: SpainRP | Versión: 3.0</p>
        </div>
      </div>
    </div>
  );
};

// Panel de Ciudadano moderno
const CitizenPanel = ({ data, onRefresh, userId }) => {
  const [activeSection, setActiveSection] = useState('dni');

  return (
    <div className="mdt-citizen-panel">
      <div className="mdt-panel-header">
        <h2>Panel de Ciudadano</h2>
        <div className="mdt-panel-controls">
          <button className="mdt-refresh-btn" onClick={onRefresh} title="Actualizar Datos">
            <FaSync />
          </button>
        </div>
      </div>
      
      <div className="mdt-citizen-nav">
        <button 
          className={`mdt-nav-item ${activeSection === 'dni' ? 'active' : ''}`}
          onClick={() => setActiveSection('dni')}
        >
          <FaIdCard />
          <span>Mi DNI</span>
        </button>
        <button 
          className={`mdt-nav-item ${activeSection === 'multas' ? 'active' : ''}`}
          onClick={() => setActiveSection('multas')}
        >
          <FaMoneyBillWave />
          <span>Multas</span>
        </button>
        <button 
          className={`mdt-nav-item ${activeSection === 'antecedentes' ? 'active' : ''}`}
          onClick={() => setActiveSection('antecedentes')}
        >
          <FaHistory />
          <span>Antecedentes</span>
        </button>
        <button 
          className={`mdt-nav-item ${activeSection === 'inventario' ? 'active' : ''}`}
          onClick={() => setActiveSection('inventario')}
        >
          <FaClipboardList />
          <span>Inventario</span>
        </button>
      </div>

      <div className="mdt-citizen-content">
        {activeSection === 'dni' && <DNISection data={data.dni} />}
        {activeSection === 'multas' && <MultasSection data={data.multas} userId={userId} onRefresh={onRefresh} />}
        {activeSection === 'antecedentes' && <AntecedentesSection data={data.antecedentes} />}
        {activeSection === 'inventario' && <InventarioSection data={data.inventario} />}
      </div>
    </div>
  );
};

// Panel de Policía moderno
const PolicePanel = ({ data, onSearch, onRefresh }) => {
  const [activeSection, setActiveSection] = useState('search');

  return (
    <div className="mdt-police-panel">
      <div className="mdt-panel-header">
        <h2>Panel Policial</h2>
        <div className="mdt-panel-controls">
          <button className="mdt-refresh-btn" onClick={onRefresh} title="Actualizar Datos">
            <FaSync />
          </button>
        </div>
      </div>
      
      <div className="mdt-police-nav">
        <button 
          className={`mdt-nav-item ${activeSection === 'search' ? 'active' : ''}`}
          onClick={() => setActiveSection('search')}
        >
          <FaSearch />
          <span>Buscar</span>
        </button>
        <button 
          className={`mdt-nav-item ${activeSection === 'multar' ? 'active' : ''}`}
          onClick={() => setActiveSection('multar')}
        >
          <FaGavel />
          <span>Multar</span>
        </button>
        <button 
          className={`mdt-nav-item ${activeSection === 'arrestar' ? 'active' : ''}`}
          onClick={() => setActiveSection('arrestar')}
        >
          <FaHandcuffsIcon />
          <span>Arrestar</span>
        </button>
        <button 
          className={`mdt-nav-item ${activeSection === 'ranking' ? 'active' : ''}`}
          onClick={() => setActiveSection('ranking')}
        >
          <FaTrophy />
          <span>Ranking</span>
        </button>
      </div>

      <div className="mdt-police-content">
        {activeSection === 'search' && <SearchSection onSearch={onSearch} />}
        {activeSection === 'multar' && <MultarSection onRefresh={onRefresh} />}
        {activeSection === 'arrestar' && <ArrestarSection onRefresh={onRefresh} />}
        {activeSection === 'ranking' && <RankingSection data={data.topMultas} message={data.rankingMessage} />}
      </div>
    </div>
  );
};

export default MDTPolicial;