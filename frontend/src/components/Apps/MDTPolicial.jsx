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
  FaGlobeAmericas as FaGlobeIcon, FaShieldVirus as FaShieldVirusIcon
} from 'react-icons/fa';
import { apiUrl } from '../../utils/api';
import './MDTPolicial.css';
import { 
  DNISection, MultasSection, AntecedentesSection, InventarioSection,
  SearchSection, MultarSection, ArrestarSection, RankingSection 
} from './MDTSections';
import CNISection from './CNISection';

// Componente de tarjeta de identificación policial animada
const PoliceIDCard = ({ user, isPolice, isCNI, onFlip }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
    if (onFlip) onFlip();
  };

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
                <FaFingerprintIcon />
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
                  <FaFingerprintIcon />
                  <span>Biometría</span>
                </div>
                <div className="feature-item">
                  <FaQrcode />
                  <span>Código QR</span>
                </div>
                <div className="feature-item">
                  <FaShieldIcon />
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

// Componente de radar de actividad
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
    <div className={`activity-radar ${isActive ? 'active' : ''}`}>
      <div className="radar-header">
        <FaRadarIcon />
        <span>RADAR DE ACTIVIDAD</span>
      </div>
      
      <div className="radar-display" ref={radarRef}>
        <div className="radar-grid">
          <div className="grid-line horizontal"></div>
          <div className="grid-line vertical"></div>
          <div className="grid-line diagonal-1"></div>
          <div className="grid-line diagonal-2"></div>
        </div>
        
        <div className="radar-center">
          <div className="center-dot"></div>
        </div>
        
        {scans.map(scan => (
          <div
            key={scan.id}
            className="radar-scan"
            style={{
              left: `${scan.x}%`,
              top: `${scan.y}%`,
              '--intensity': `${scan.intensity}%`
            }}
          >
            <div className="scan-pulse"></div>
          </div>
        ))}
      </div>
      
      <div className="radar-stats">
        <div className="stat">
          <span className="label">ESCANEOS:</span>
          <span className="value">{scans.length}</span>
        </div>
        <div className="stat">
          <span className="label">ACTIVIDAD:</span>
          <span className="value">ALTA</span>
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
      {/* Header con tarjeta de identificación */}
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
          <PoliceIDCard 
            user={user} 
            isPolice={isPolice} 
            isCNI={isCNI}
            onFlip={() => console.log('Tarjeta volteada')}
          />
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
            <button 
              className={`control-btn ${radarActive ? 'active' : ''}`}
              onClick={() => setRadarActive(!radarActive)}
              title="Radar de Actividad"
            >
              <FaRadarIcon />
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
        </div>
        
        <div className="toolbar-right">
          <div className="system-info">
            <span className="time">{new Date().toLocaleTimeString()}</span>
            <span className="date">{new Date().toLocaleDateString()}</span>
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
        </div>
        
        <div className="content-right">
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
    </div>
  );
};

// Panel de Ciudadano
const CitizenPanel = ({ data, onRefresh, userId }) => {
  const [activeSection, setActiveSection] = useState('dni');

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
          className={`nav-btn ${activeSection === 'dni' ? 'active' : ''}`}
          onClick={() => setActiveSection('dni')}
        >
          <FaIdCard />
          <span>Mi DNI</span>
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
        {activeSection === 'dni' && <DNISection data={data.dni} />}
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