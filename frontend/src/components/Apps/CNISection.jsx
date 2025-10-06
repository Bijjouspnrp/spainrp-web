import React, { useState, useEffect, useRef } from 'react';
import { 
  FaEye, FaSearch, FaDatabase, FaUser, FaIdCard, FaMoneyBillWave, 
  FaHistory, FaClipboardList, FaShieldAlt, FaSpinner, FaExclamationTriangle,
  FaCheckCircle, FaTimes, FaCrown, FaGavel, FaLock, FaTrophy,
  FaUserShield, FaFileAlt, FaCarCrash, FaGlobe, FaChartLine,
  FaUsers, FaBuilding, FaMapMarkerAlt, FaPhone, FaEnvelope,
  FaCalendarAlt, FaClock, FaFlag, FaKey, FaFingerprint, FaPlus,
  FaBars, FaChevronDown, FaChevronUp, FaQuestionCircle, FaInfoCircle,
  FaCog, FaExpand, FaCompress, FaAngleRight, FaAngleLeft, FaDiscord
} from 'react-icons/fa';
import { apiUrl } from '../../utils/api';
import loggingService from '../../utils/loggingService';
import discordService from '../../utils/discordService';
import './CNISection.css';
import './BusinessRecords.css';
import './CNIBlog.css';

const CNISection = () => {
  const [user, setUser] = useState(null);
  const [isCNI, setIsCNI] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('database');
  const [error, setError] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [cniAgents, setCniAgents] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionRef = useRef(null);

  // Estados para funcionalidades CNI
  const [searchData, setSearchData] = useState({
    results: [],
    loading: false,
    error: ''
  });

  const [databaseStats, setDatabaseStats] = useState({
    totalUsers: 0,
    totalDNIs: 0,
    totalMultas: 0,
    totalAntecedentes: 0,
    totalArrestos: 0
  });

  const [showWelcomeModal, setShowWelcomeModal] = useState(false);

  const [advancedSearch, setAdvancedSearch] = useState({
    query: '',
    searchType: 'all',
    filters: {
      dateRange: '',
      status: '',
      location: ''
    }
  });

  // Verificar autenticación y permisos CNI
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('spainrp_token');
        if (!token) {
          setError('Debes iniciar sesión para acceder al CNI');
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

        // Verificar si tiene rol CNI
        const cniRes = await fetch(apiUrl(`/api/discord/rolecheck/${userData.user.id}/1384340775772360841`));
        if (cniRes.ok) {
          const cniData = await cniRes.json();
          setIsCNI(cniData.hasRole);
          
          // Mostrar modal de bienvenida solo la primera vez
          if (cniData.hasRole) {
            const hasSeenWelcome = localStorage.getItem('cni-welcome-seen');
            if (!hasSeenWelcome) {
              setShowWelcomeModal(true);
            }
          }
        }

        // Esperar un poco para que los datos se carguen completamente
        setTimeout(() => {
          setLoading(false);
        }, 1000);
      } catch (err) {
        setError('Error verificando permisos CNI');
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Cargar agentes CNI para autocompletado
  const loadCniAgents = async () => {
    try {
      // Simular carga de agentes CNI (en producción vendría de la API)
      const agents = [
        'BijjouPro08', 'nanobox_32', 'RA_ESTE', 'lichandro56',
        'LAFROGCRAZI', 'Elgato21053', 'Mimi (YoSoySergiox)', 'The441884',
        'amigo_dedoc', 'Secret_Agent', 'nicogamer2220', 'Director_CNI'
      ];
      setCniAgents(agents);
    } catch (err) {
      console.error('Error cargando agentes CNI:', err);
    }
  };

  // Función de autocompletado
  const handleAgentInput = (value, setter) => {
    setter(value);
    if (value.length > 1) {
      const filtered = cniAgents.filter(agent => 
        agent.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  // Seleccionar sugerencia
  const selectSuggestion = (agent, setter) => {
    setter(agent);
    setShowSuggestions(false);
  };

  // Cerrar sugerencias al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (suggestionRef.current && !suggestionRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Cargar estadísticas de la base de datos
  const loadDatabaseStats = async () => {
    try {
      // Valores simulados para evitar errores de API
      setDatabaseStats({
        totalUsers: 1250,
        totalDNIs: 1100,
        totalMultas: 450,
        totalAntecedentes: 89,
        totalArrestos: 23
      });
    } catch (err) {
      console.error('Error cargando estadísticas:', err);
      // Valores por defecto
      setDatabaseStats({
        totalUsers: 0,
        totalDNIs: 0,
        totalMultas: 0,
        totalAntecedentes: 0,
        totalArrestos: 0
      });
    }
  };

  useEffect(() => {
    if (isCNI) {
      loadDatabaseStats();
      loadCniAgents();
    }
  }, [isCNI]);

  if (loading) {
    return (
      <div className="cni-loading">
        <div className="cni-loading-logo">
          <img 
            src="https://media.discordapp.net/attachments/1329945759541497906/1424473452206751764/CNIescudoespaC3B1a2.png?ex=68e413c8&is=68e2c248&hm=f12f703571bbc40060329de77d8c8f6973c677806a45a1b1238a8deb9522a0b1&=" 
            alt="CNI Logo" 
            className="cni-loading-logo-img"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
          <div className="cni-loading-logo-fallback" style={{display: 'none'}}>
            <FaEye />
          </div>
        </div>
        <div className="cni-loading-content">
          <h2>Centro Nacional de Inteligencia</h2>
          <p>Verificando credenciales de acceso...</p>
          <p>Inicializando sistemas de inteligencia...</p>
          <div className="cni-loading-progress">
            <div className="cni-loading-bar"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="cni-loading">
        <FaExclamationTriangle size={48} color="#8a2be2" />
        <h2>Acceso Denegado</h2>
        <p>{error}</p>
        <a href="/auth/login" className="cni-btn cni-btn-primary">
          Iniciar Sesión
        </a>
      </div>
    );
  }

  if (!isCNI) {
    return (
      <div className="cni-loading">
        <FaShieldAlt size={48} color="#8a2be2" />
        <h2>Acceso Restringido</h2>
        <p>No tienes permisos para acceder al Centro Nacional de Inteligencia</p>
        <p>Se requiere rol de CNI para acceder a esta sección</p>
      </div>
    );
  }

  return (
    <div className={`cni-container ${isFullscreen ? 'fullscreen' : ''}`}>
      {/* Modal de Bienvenida CNI */}
      {showWelcomeModal && (
        <div className="cni-welcome-modal-overlay">
          <div className="cni-welcome-modal">
            <div className="cni-welcome-header">
              <FaShieldAlt className="cni-welcome-icon" />
              <h2><FaCheckCircle /> ¡Bienvenido al Centro Nacional de Inteligencia!</h2>
            </div>
            
            <div className="cni-welcome-content">
              <div className="cni-welcome-section">
                <h3><FaPlus /> Nuevas Funcionalidades Disponibles</h3>
                <ul>
                  <li><strong><FaSearch /> Sistema de Rastreo Avanzado</strong> - Rastrea movimientos financieros, inventarios y actividad completa</li>
                  <li><strong><FaBuilding /> Gestión Empresarial Completa</strong> - Suspender, investigar, clausurar y eliminar empresas</li>
                  <li><strong><FaFileAlt /> Archivos CNI</strong> - Sistema de blog para documentar investigaciones de bandas</li>
                  <li><strong><FaMoneyBillWave /> Análisis Financiero</strong> - Supervisión de patrimonios y movimientos sospechosos</li>
                </ul>
              </div>

              <div className="cni-welcome-section">
                <h3><FaGlobe /> Misión del CNI en SpainRP</h3>
                <div className="cni-mission-cards">
                  <div className="cni-mission-card">
                    <FaBuilding />
                    <h4>Registro Empresarial</h4>
                    <p>Registrar y supervisar todas las empresas del servidor Discord</p>
                  </div>
                  <div className="cni-mission-card">
                    <FaEye />
                    <h4>Supervisión Continua</h4>
                    <p>Revisar y monitorear actividades empresariales</p>
                  </div>
                  <div className="cni-mission-card">
                    <FaShieldAlt />
                    <h4>Investigación Criminal</h4>
                    <p>Detectar y documentar actos maliciosos en SpainRP</p>
                  </div>
                </div>
              </div>

              <div className="cni-welcome-section">
                <h3><FaCog /> Desarrollado por BijjouPro08</h3>
                <p>Este sistema de inteligencia ha sido desarrollado específicamente para las necesidades del CNI de SpainRP, proporcionando herramientas avanzadas de investigación y supervisión.</p>
              </div>
            </div>

            <div className="cni-welcome-actions">
              <button 
                className="cni-btn cni-btn-primary"
                onClick={() => {
                  localStorage.setItem('cni-welcome-seen', 'true');
                  setShowWelcomeModal(false);
                }}
              >
                <FaCheckCircle /> Entendido, Comenzar
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="cni-header">
        <div className="cni-header-content">
          <div className="cni-logo">
            <img 
              src="https://media.discordapp.net/attachments/1329945759541497906/1424473452206751764/CNIescudoespaC3B1a2.png?ex=68e413c8&is=68e2c248&hm=f12f703571bbc40060329de77d8c8f6973c677806a45a1b1238a8deb9522a0b1&=" 
              alt="CNI Logo" 
              className="cni-logo-img"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
            <div className="cni-logo-fallback" style={{display: 'none'}}>
              <FaEye />
            </div>
            <h1>CNI - Centro Nacional de Inteligencia</h1>
          </div>
          
          <div className="cni-header-controls">
            <div className="cni-user-info">
              <span className="cni-user-name">{user?.username}</span>
              <span className="cni-cni-badge">AGENTE CNI</span>
            </div>
            
            <div className="cni-control-buttons">
              <button 
                className="cni-control-btn"
                onClick={() => setShowHelp(!showHelp)}
                title="Ayuda del Sistema"
              >
                <FaQuestionCircle />
              </button>
              <button 
                className="cni-control-btn"
                onClick={() => setIsFullscreen(!isFullscreen)}
                title={isFullscreen ? "Salir de Pantalla Completa" : "Pantalla Completa"}
              >
                {isFullscreen ? <FaCompress /> : <FaExpand />}
              </button>
              <button 
                className="cni-control-btn cni-mobile-menu-btn"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                title="Menú"
              >
                <FaBars />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Menú de Ayuda */}
      {showHelp && (
        <div className="cni-help-panel">
          <div className="cni-help-content">
            <h3><FaInfoCircle /> Guía del Sistema CNI</h3>
            <div className="cni-help-sections">
              <div className="cni-help-section">
                <h4><FaDatabase /> Base de Datos</h4>
                <p>Acceso completo a todos los registros del servidor. Búsquedas rápidas por DNI, Discord ID, multas y antecedentes.</p>
              </div>
              <div className="cni-help-section">
                <h4><FaGlobe /> Rastreo</h4>
                <p>Sistema de rastreo avanzado para analizar actividad completa de usuarios: finanzas, inventario, antecedentes.</p>
              </div>
              <div className="cni-help-section">
                <h4><FaUsers /> Ciudadanos/Vehículos</h4>
                <p>Monitoreo en tiempo real de jugadores y vehículos conectados al servidor.</p>
              </div>
              <div className="cni-help-section">
                <h4><FaBuilding /> Empresas</h4>
                <p>Gestión completa del registro empresarial: crear, suspender, investigar y clausurar empresas.</p>
              </div>
            </div>
            <button 
              className="cni-btn cni-btn-primary"
              onClick={() => setShowHelp(false)}
            >
              <FaCheckCircle /> Entendido
            </button>
          </div>
        </div>
      )}

      <div className={`cni-tabs ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
        <div className="cni-tabs-container">
          <button 
            className={`cni-tab ${activeTab === 'database' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('database');
              setIsMobileMenuOpen(false);
            }}
          >
            <FaDatabase /> <span>Base de Datos</span>
          </button>
          <button 
            className={`cni-tab ${activeTab === 'search' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('search');
              setIsMobileMenuOpen(false);
            }}
          >
            <FaSearch /> <span>Búsqueda Avanzada</span>
          </button>
          <button 
            className={`cni-tab ${activeTab === 'tracking' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('tracking');
              setIsMobileMenuOpen(false);
            }}
          >
            <FaGlobe /> <span>Rastreo</span>
          </button>
          <button 
            className={`cni-tab ${activeTab === 'players' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('players');
              setIsMobileMenuOpen(false);
            }}
          >
            <FaUsers /> <span>Ciudadanos</span>
          </button>
          <button 
            className={`cni-tab ${activeTab === 'vehicles' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('vehicles');
              setIsMobileMenuOpen(false);
            }}
          >
            <FaCarCrash /> <span>Vehículos</span>
          </button>
          <button 
            className={`cni-tab ${activeTab === 'intelligence' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('intelligence');
              setIsMobileMenuOpen(false);
            }}
          >
            <FaChartLine /> <span>Inteligencia</span>
          </button>
          <button 
            className={`cni-tab ${activeTab === 'business' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('business');
              setIsMobileMenuOpen(false);
            }}
          >
            <FaBuilding /> <span>Empresas</span>
          </button>
          <button 
            className={`cni-tab ${activeTab === 'blog' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('blog');
              setIsMobileMenuOpen(false);
            }}
          >
            <FaFileAlt /> <span>Archivos CNI</span>
          </button>
        </div>
      </div>

      <div className="cni-content">
        {activeTab === 'database' && <DatabaseTab stats={databaseStats} />}
        {activeTab === 'search' && <AdvancedSearchTab />}
        {activeTab === 'tracking' && <TrackingTab />}
        {activeTab === 'players' && <PlayersInCityTab />}
        {activeTab === 'vehicles' && <VehiclesInCityTab />}
        {activeTab === 'intelligence' && <IntelligenceTab />}
        {activeTab === 'business' && <BusinessRecordsTab />}
        {activeTab === 'blog' && <BlogTab />}
      </div>
    </div>
  );
};

// Pestaña de Base de Datos
const DatabaseTab = ({ stats }) => {
  const [quickSearch, setQuickSearch] = useState({
    query: '',
    type: 'discord',
    results: [],
    loading: false
  });

  const handleQuickSearch = async (searchType) => {
    if (!quickSearch.query.trim()) return;
    
    setQuickSearch(prev => ({ ...prev, loading: true, results: [] }));
    
    try {
      let endpoint = '';
      let results = [];
      
      switch (searchType) {
        case 'dni':
          const dniRes = await fetch(apiUrl(`/api/proxy/admin/dni/search?q=${encodeURIComponent(quickSearch.query)}`));
          if (dniRes.ok) {
            const dniData = await dniRes.json();
            results = dniData.dniPorNombre || [];
          }
          break;
          
        case 'discord':
          const discordRes = await fetch(apiUrl(`/api/proxy/admin/search?query=${encodeURIComponent(quickSearch.query)}`));
          if (discordRes.ok) {
            const discordData = await discordRes.json();
            results = discordData.results || [];
          }
          break;
          
        case 'multas':
          const multasRes = await fetch(apiUrl(`/api/proxy/admin/multas/${quickSearch.query}`));
          if (multasRes.ok) {
            const multasData = await multasRes.json();
            results = multasData.multas || [];
          }
          break;
          
        case 'antecedentes':
          const antRes = await fetch(apiUrl(`/api/proxy/admin/antecedentes/${quickSearch.query}`));
          if (antRes.ok) {
            const antData = await antRes.json();
            results = antData.antecedentes || [];
          }
          break;
          
        case 'inventario':
          const invRes = await fetch(apiUrl(`/api/proxy/admin/inventory/${quickSearch.query}`));
          if (invRes.ok) {
            const invData = await invRes.json();
            results = invData.inventario || [];
          }
          break;
      }
      
      setQuickSearch(prev => ({ ...prev, results, loading: false }));
    } catch (err) {
      console.error('Error en búsqueda rápida:', err);
      setQuickSearch(prev => ({ ...prev, loading: false }));
    }
  };

  return (
    <div className="cni-section">
      <h3><FaDatabase /> Base de Datos Nacional</h3>
      
      <div className="cni-stats-grid">
        <div className="cni-stat-card">
          <span className="cni-stat-label">Total Usuarios</span>
          <span className="cni-stat-value">{stats.totalUsers.toLocaleString()}</span>
        </div>
        <div className="cni-stat-card">
          <span className="cni-stat-label">DNIs Registrados</span>
          <span className="cni-stat-value">{stats.totalDNIs.toLocaleString()}</span>
        </div>
        <div className="cni-stat-card">
          <span className="cni-stat-label">Multas Totales</span>
          <span className="cni-stat-value">{stats.totalMultas.toLocaleString()}</span>
        </div>
        <div className="cni-stat-card">
          <span className="cni-stat-label">Antecedentes</span>
          <span className="cni-stat-value">{stats.totalAntecedentes.toLocaleString()}</span>
        </div>
        <div className="cni-stat-card">
          <span className="cni-stat-label">Arrestos</span>
          <span className="cni-stat-value">{stats.totalArrestos.toLocaleString()}</span>
        </div>
      </div>

      <div className="cni-section">
        <h3><FaUsers /> Acceso Rápido a Datos</h3>
        
        <div className="cni-form">
          <div className="cni-form-group">
            <label>Búsqueda Rápida:</label>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <input
                type="text"
                value={quickSearch.query}
                onChange={(e) => setQuickSearch({...quickSearch, query: e.target.value})}
                className="cni-input"
                placeholder="ID Discord, DNI, nombre..."
                style={{ flex: 1 }}
              />
              <select 
                value={quickSearch.type}
                onChange={(e) => setQuickSearch({...quickSearch, type: e.target.value})}
                className="cni-select"
                style={{ width: '150px' }}
              >
                <option value="discord">Discord ID</option>
                <option value="dni">DNI</option>
                <option value="multas">Multas</option>
                <option value="antecedentes">Antecedentes</option>
                <option value="inventario">Inventario</option>
              </select>
              <button 
                onClick={() => handleQuickSearch(quickSearch.type)}
                className="cni-btn cni-btn-primary"
                disabled={quickSearch.loading}
              >
                {quickSearch.loading ? <FaSpinner className="fa-spin" /> : <FaSearch />}
                Buscar
              </button>
            </div>
          </div>
        </div>

        {quickSearch.results.length > 0 && (
          <div className="cni-search-results">
            <h4>Resultados de Búsqueda:</h4>
            {quickSearch.results.map((result, index) => (
              <div key={index} className="cni-result-card">
                <div className="cni-result-header">
                  <h5>
                    {quickSearch.type === 'dni' && <FaIdCard />}
                    {quickSearch.type === 'discord' && <FaUser />}
                    {quickSearch.type === 'multas' && <FaMoneyBillWave />}
                    {quickSearch.type === 'antecedentes' && <FaHistory />}
                    {quickSearch.type === 'inventario' && <FaClipboardList />}
                    {result.nombre || result.username || result.userId || result.item_id}
                  </h5>
                  <span className="cni-result-type">
                    {quickSearch.type.toUpperCase()}
                  </span>
                </div>
                <div className="cni-result-info">
                  {Object.entries(result).map(([key, value]) => (
                    key !== 'nombre' && key !== 'username' && key !== 'userId' && (
                      <div key={key} className="cni-result-field">
                        <label>{key}:</label>
                        <span>{String(value)}</span>
                      </div>
                    )
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="cni-nav">
          <button className="cni-nav-btn" onClick={() => setQuickSearch({...quickSearch, type: 'dni'})}>
            <FaIdCard /> Consultar DNI
          </button>
          <button className="cni-nav-btn" onClick={() => setQuickSearch({...quickSearch, type: 'multas'})}>
            <FaMoneyBillWave /> Historial Multas
          </button>
          <button className="cni-nav-btn" onClick={() => setQuickSearch({...quickSearch, type: 'antecedentes'})}>
            <FaHistory /> Antecedentes
          </button>
          <button className="cni-nav-btn" onClick={() => setQuickSearch({...quickSearch, type: 'inventario'})}>
            <FaClipboardList /> Inventarios
          </button>
          <button className="cni-nav-btn">
            <FaBuilding /> Registros Empresariales
          </button>
        </div>
      </div>
    </div>
  );
};

// Pestaña de Búsqueda Avanzada
const AdvancedSearchTab = () => {
  const [searchForm, setSearchForm] = useState({
    query: '',
    searchType: 'all',
    filters: {
      dateRange: '',
      status: '',
      location: ''
    }
  });
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Búsqueda por nombre/DNI
      const searchRes = await fetch(apiUrl(`/api/proxy/admin/dni/search?q=${encodeURIComponent(searchForm.query)}`));
      const searchData = await searchRes.json();
      
      if (searchData.success) {
        setResults(searchData);
        
        // Logging de la búsqueda CNI
        const userId = localStorage.getItem('spainrp_user_id') || 'unknown';
        const resultsArray = [
          ...(searchData.dniPorNombre || []),
          ...(searchData.discordUsers || [])
        ];
        
        await loggingService.logCNISearch(userId, 'advanced', searchForm.query, resultsArray);
        await discordService.sendCNISearchEmbed(userId, 'advanced', searchForm.query, resultsArray);
      }
    } catch (err) {
      console.error('Error en búsqueda:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cni-section">
      <h3><FaSearch /> Búsqueda Avanzada de Inteligencia</h3>
      
      {/* Aviso de Desarrollo */}
      <div className="cni-development-notice">
        <div className="cni-notice-icon">
          <FaCog />
        </div>
        <div className="cni-notice-content">
          <h4>🚧 Sección en Desarrollo</h4>
          <p>Esta funcionalidad está siendo desarrollada activamente y puede presentar errores o no funcionar correctamente en algunos casos.</p>
          <p>Pedimos paciencia mientras trabajamos para ofrecerte la mejor experiencia de búsqueda avanzada.</p>
          <div className="cni-notice-developer">
            <strong>Desarrollador:</strong> BijjouPro08
          </div>
        </div>
      </div>
      
      <form onSubmit={handleSearch} className="cni-form">
        <div className="cni-form-group">
          <label>Término de Búsqueda:</label>
          <input
            type="text"
            value={searchForm.query}
            onChange={(e) => setSearchForm({...searchForm, query: e.target.value})}
            className="cni-input"
            placeholder="Nombre, DNI, Discord ID..."
            required
          />
        </div>
        
        <div className="cni-form-group">
          <label>Tipo de Búsqueda:</label>
          <select 
            value={searchForm.searchType}
            onChange={(e) => setSearchForm({...searchForm, searchType: e.target.value})}
            className="cni-select"
          >
            <option value="all">Todos los Registros</option>
            <option value="dni">Solo DNIs</option>
            <option value="discord">Solo Discord</option>
            <option value="multas">Solo Multas</option>
            <option value="antecedentes">Solo Antecedentes</option>
          </select>
        </div>

        <div className="cni-form-group">
          <label>Filtros Adicionales:</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <input
              type="date"
              value={searchForm.filters.dateRange}
              onChange={(e) => setSearchForm({
                ...searchForm, 
                filters: {...searchForm.filters, dateRange: e.target.value}
              })}
              className="cni-input"
              placeholder="Rango de fechas"
            />
            <select 
              value={searchForm.filters.status}
              onChange={(e) => setSearchForm({
                ...searchForm, 
                filters: {...searchForm.filters, status: e.target.value}
              })}
              className="cni-select"
            >
              <option value="">Todos los Estados</option>
              <option value="activo">Activo</option>
              <option value="arrestado">Arrestado</option>
              <option value="baneado">Baneado</option>
            </select>
          </div>
        </div>
        
        <button type="submit" className="cni-btn cni-btn-primary" disabled={loading}>
          {loading ? <FaSpinner className="fa-spin" /> : <FaSearch />}
          {loading ? 'Buscando...' : 'Ejecutar Búsqueda'}
        </button>
      </form>

      {results.dniPorNombre && results.dniPorNombre.length > 0 && (
        <div className="cni-search-results">
          <h4>Resultados de Búsqueda:</h4>
          {results.dniPorNombre.map((dni, index) => (
            <div key={index} className="cni-result-card">
              <div className="cni-result-header">
                <h5><FaIdCard /> {dni.nombre} {dni.apellidos}</h5>
                <span className="cni-result-type">DNI</span>
              </div>
              <div className="cni-result-info">
                <div className="cni-result-field">
                  <label>DNI:</label>
                  <span>{dni.numeroDNI}</span>
                </div>
                <div className="cni-result-field">
                  <label>Discord ID:</label>
                  <span>{dni.discordId}</span>
                </div>
                <div className="cni-result-field">
                  <label>Estado:</label>
                  <span>{dni.arrestado ? 'Arrestado' : 'Activo'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Feedback cuando no hay resultados */}
      {!loading && results && (!results.dniPorNombre || results.dniPorNombre.length === 0) && searchForm.query && (
        <div className="cni-no-results">
          <div className="cni-no-results-icon">
            <FaSearch />
          </div>
          <div className="cni-no-results-content">
            <h4>No se encontraron resultados</h4>
            <p>No se encontraron registros que coincidan con tu búsqueda: <strong>"{searchForm.query}"</strong></p>
            <div className="cni-no-results-suggestions">
              <h5>Sugerencias para mejorar tu búsqueda:</h5>
              <ul>
                <li>Verifica que el término de búsqueda esté escrito correctamente</li>
                <li>Intenta con un término de búsqueda más general</li>
                <li>Se recomienda el uso de la ID de Discord en lugar del nombre o apellido</li>
                <li>Verifica que el usuario esté registrado en el sistema</li>
              </ul>
            </div>
            <button 
              className="cni-btn cni-btn-secondary"
              onClick={() => setSearchForm({...searchForm, query: ''})}
            >
              <FaTimes /> Limpiar Búsqueda
            </button>
          </div>
        </div>
      )}

      {/* Feedback cuando no se ha realizado búsqueda */}
      {!loading && !searchForm.query && (
        <div className="cni-search-prompt">
          <div className="cni-search-prompt-icon">
            <FaSearch />
          </div>
          <div className="cni-search-prompt-content">
            <h4>Realiza una búsqueda avanzada</h4>
            <p>Utiliza el formulario superior para buscar ciudadanos, vehículos o registros en la base de datos del CNI.</p>
            <div className="cni-search-tips">
              <h5>Tipos de búsqueda disponibles:</h5>
              <div className="cni-search-tips-grid">
                <div className="cni-search-tip">
                  <FaIdCard />
                  <span>DNI y Nombres</span>
                </div>
                <div className="cni-search-tip">
                  <FaDiscord />
                  <span>Discord ID</span>
                </div>
                <div className="cni-search-tip">
                  <FaCar />
                  <span>Vehículos</span>
                </div>
                <div className="cni-search-tip">
                  <FaBuilding />
                  <span>Empresas</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


// Pestaña de Inteligencia
const IntelligenceTab = () => {
  return (
    <div className="cni-section">
      <h3><FaChartLine /> Análisis de Inteligencia</h3>
      
      <div className="cni-stats-grid">
        <div className="cni-stat-card">
          <span className="cni-stat-label">Amenazas Detectadas</span>
          <span className="cni-stat-value">0</span>
        </div>
        <div className="cni-stat-card">
          <span className="cni-stat-label">Patrones Sospechosos</span>
          <span className="cni-stat-value">0</span>
        </div>
        <div className="cni-stat-card">
          <span className="cni-stat-label">Redes Criminales</span>
          <span className="cni-stat-value">0</span>
        </div>
        <div className="cni-stat-card">
          <span className="cni-stat-label">Alertas Activas</span>
          <span className="cni-stat-value">0</span>
        </div>
      </div>

      <div className="cni-section">
        <h3><FaFlag /> Alertas de Seguridad</h3>
        <div className="cni-no-data">
          <FaCheckCircle />
          <p>No hay alertas de seguridad activas</p>
        </div>
      </div>
    </div>
  );
};

// Pestaña de Rastreo Mejorada
const TrackingTab = () => {
  const [trackingForm, setTrackingForm] = useState({
    target: '',
    trackingType: 'all'
  });
  const [trackingResults, setTrackingResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleTrackingSearch = async () => {
    if (!trackingForm.target.trim()) return;
    
    console.log('[CNI][RASTREO] 🔍 Iniciando búsqueda de rastreo para:', trackingForm.target);
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      console.log('[CNI][RASTREO] 📡 Realizando consultas paralelas...');
      const startTime = Date.now();
      
      // Buscar datos del usuario en múltiples fuentes
      const [dniRes, multasRes, antecedentesRes, balanceRes, inventarioRes] = await Promise.all([
        fetch(apiUrl(`/api/proxy/admin/dni/search?q=${encodeURIComponent(trackingForm.target)}`)),
        fetch(apiUrl(`/api/proxy/admin/ver-multas/${trackingForm.target}`)),
        fetch(apiUrl(`/api/proxy/admin/antecedentes/${trackingForm.target}`)),
        fetch(apiUrl(`/api/proxy/admin/balance/${trackingForm.target}`)),
        fetch(apiUrl(`/api/proxy/admin/inventory/${trackingForm.target}`))
      ]);

      const searchTime = Date.now() - startTime;
      console.log(`[CNI][RASTREO] ⏱️ Consultas completadas en ${searchTime}ms`);

      const results = [];
      console.log('[CNI][RASTREO] 📊 Procesando resultados...');
      
      // Procesar DNI
      console.log('[CNI][RASTREO] 🆔 Procesando datos de DNI...');
      if (dniRes.ok) {
        const dniData = await dniRes.json();
        console.log('[CNI][RASTREO] 📋 Datos DNI recibidos:', dniData);
        if (dniData.dniPorNombre && dniData.dniPorNombre.length > 0) {
          console.log(`[CNI][RASTREO] ✅ Encontrados ${dniData.dniPorNombre.length} DNIs`);
          dniData.dniPorNombre.forEach((dni, index) => {
            console.log(`[CNI][RASTREO] 👤 DNI ${index + 1}:`, dni);
            results.push({
              type: 'DNI',
              status: dni.arrestado ? 'Arrestado' : 'Activo',
              details: `${dni.nombre} ${dni.apellidos} - DNI: ${dni.numeroDNI}`,
              lastSeen: dni.fecha_registro || 'Desconocido'
            });
          });
        } else {
          console.log('[CNI][RASTREO] ⚠️ No se encontraron DNIs');
        }
      } else {
        console.log('[CNI][RASTREO] ❌ Error en consulta DNI:', dniRes.status, dniRes.statusText);
      }

      // Procesar Multas
      console.log('[CNI][RASTREO] 🚨 Procesando datos de multas...');
      if (multasRes.ok) {
        const multasData = await multasRes.json();
        console.log('[CNI][RASTREO] 📋 Datos multas recibidos:', multasData);
        if (multasData.multas && multasData.multas.length > 0) {
          const totalMultas = multasData.multas.length;
          const pendientes = multasData.multas.filter(m => !m.pagada).length;
          console.log(`[CNI][RASTREO] ✅ Encontradas ${totalMultas} multas (${pendientes} pendientes)`);
          results.push({
            type: 'Multas',
            status: pendientes > 0 ? 'Pendientes' : 'Al día',
            details: `${totalMultas} multas totales, ${pendientes} pendientes`,
            lastSeen: multasData.multas[0]?.fecha || 'Desconocido'
          });
        } else {
          console.log('[CNI][RASTREO] ⚠️ No se encontraron multas');
        }
      } else {
        console.log('[CNI][RASTREO] ❌ Error en consulta multas:', multasRes.status, multasRes.statusText);
      }

      // Procesar Antecedentes
      console.log('[CNI][RASTREO] ⚖️ Procesando datos de antecedentes...');
      if (antecedentesRes.ok) {
        const antData = await antecedentesRes.json();
        console.log('[CNI][RASTREO] 📋 Datos antecedentes recibidos:', antData);
        if (antData.antecedentes && antData.antecedentes.length > 0) {
          console.log(`[CNI][RASTREO] ✅ Encontrados ${antData.antecedentes.length} antecedentes`);
          results.push({
            type: 'Antecedentes',
            status: 'Con historial',
            details: `${antData.antecedentes.length} antecedentes registrados`,
            lastSeen: antData.antecedentes[0]?.fecha || 'Desconocido'
          });
        } else {
          console.log('[CNI][RASTREO] ⚠️ No se encontraron antecedentes');
        }
      } else {
        console.log('[CNI][RASTREO] ❌ Error en consulta antecedentes:', antecedentesRes.status, antecedentesRes.statusText);
      }

      // Procesar Balance Financiero
      console.log('[CNI][RASTREO] 💰 Procesando datos financieros...');
      if (balanceRes.ok) {
        const balanceData = await balanceRes.json();
        console.log('[CNI][RASTREO] 📋 Datos balance recibidos:', balanceData);
        if (balanceData.success && balanceData.balance) {
          const total = balanceData.balance.cash + balanceData.balance.bank;
          const patrimonio = total > 100000 ? 'Alto patrimonio' : total > 10000 ? 'Patrimonio medio' : 'Patrimonio bajo';
          console.log(`[CNI][RASTREO] ✅ Balance: ${total.toLocaleString()}€ (${patrimonio})`);
          results.push({
            type: 'Finanzas',
            status: patrimonio,
            details: `Efectivo: ${balanceData.balance.cash.toLocaleString()}€ | Banco: ${balanceData.balance.bank.toLocaleString()}€ | Total: ${total.toLocaleString()}€`,
            lastSeen: 'Activo'
          });
        } else {
          console.log('[CNI][RASTREO] ⚠️ No se encontraron datos de balance');
        }
      } else {
        console.log('[CNI][RASTREO] ❌ Error en consulta balance:', balanceRes.status, balanceRes.statusText);
      }

      // Procesar Inventario
      console.log('[CNI][RASTREO] 🎒 Procesando datos de inventario...');
      if (inventarioRes.ok) {
        const inventarioData = await inventarioRes.json();
        console.log('[CNI][RASTREO] 📋 Datos inventario recibidos:', inventarioData);
        if (inventarioData.success && inventarioData.inventario && inventarioData.inventario.length > 0) {
          const itemsValiosos = inventarioData.inventario.filter(item => 
            item.precio && item.precio > 10000
          );
          console.log(`[CNI][RASTREO] ✅ Inventario: ${inventarioData.inventario.length} objetos (${itemsValiosos.length} valiosos)`);
          results.push({
            type: 'Inventario',
            status: itemsValiosos.length > 0 ? 'Objetos valiosos' : 'Inventario normal',
            details: `${inventarioData.inventario.length} objetos, ${itemsValiosos.length} valiosos`,
            lastSeen: 'Activo'
          });
        } else {
          console.log('[CNI][RASTREO] ⚠️ No se encontraron objetos en inventario');
        }
      } else {
        console.log('[CNI][RASTREO] ❌ Error en consulta inventario:', inventarioRes.status, inventarioRes.statusText);
      }

      console.log(`[CNI][RASTREO] 🎯 Búsqueda completada. Resultados: ${results.length}`);
      console.log('[CNI][RASTREO] 📊 Resultados finales:', results);
      setTrackingResults(results);
      setSuccess(`Rastreo completado. Encontrados ${results.length} tipos de datos.`);
    } catch (error) {
      console.error('[CNI][RASTREO] ❌ Error en búsqueda de rastreo:', error);
      setError('Error de conexión durante el rastreo');
    } finally {
      setLoading(false);
      console.log('[CNI][RASTREO] ✅ Proceso de rastreo finalizado');
    }
  };

  return (
    <div className="cni-section">
      <h3><FaGlobe /> Sistema de Rastreo de Actividad</h3>
      
      {error && (
        <div className="cni-error-message">
          {error}
        </div>
      )}
      
      {success && (
        <div className="cni-success-message">
          {success}
        </div>
      )}
      
      <div className="cni-form">
        <div className="cni-form-group">
          <label>Buscar Usuario:</label>
          <input
            type="text"
            className="cni-input"
            placeholder="Discord ID, DNI, o nombre..."
            value={trackingForm.target}
            onChange={(e) => setTrackingForm(prev => ({ ...prev, target: e.target.value }))}
          />
        </div>
        
        <button 
          className="cni-btn cni-btn-primary"
          onClick={handleTrackingSearch}
          disabled={!trackingForm.target.trim() || loading}
        >
          {loading ? <FaSpinner className="fa-spin" /> : <FaSearch />} 
          {loading ? 'Buscando...' : 'Buscar Actividad'}
        </button>
      </div>
      
      {trackingResults.length > 0 && (
        <div className="cni-section">
          <h3><FaMapMarkerAlt /> Resultados de Rastreo</h3>
          <div className="cni-search-results">
            {trackingResults.map((result, index) => (
              <div key={index} className="cni-result-card">
                <div className="cni-result-header">
                  <h5><FaUser /> {result.type}</h5>
                  <span className={`cni-result-type ${result.status.toLowerCase().replace(' ', '-')}`}>
                    {result.status}
                  </span>
                </div>
                <div className="cni-result-info">
                  <div className="cni-result-field">
                    <label>Detalles:</label>
                    <span>{result.details}</span>
                  </div>
                  <div className="cni-result-field">
                    <label>Última Actividad:</label>
                    <span>{result.lastSeen}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Pestaña de Registros Empresariales
const BusinessRecordsTab = () => {
  const [businesses, setBusinesses] = useState([]);
  const [visits, setVisits] = useState([]);
  const [stats, setStats] = useState({
    total_empresas: 0,
    empresas_activas: 0,
    empresas_inactivas: 0,
    empresas_suspendidas: 0,
    visitas_semana: 0,
    visitas_mes: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Estados para autocompletado
  const [cniAgents, setCniAgents] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionRef = useRef(null);
  
  const [newBusiness, setNewBusiness] = useState({
    nombre: '',
    tipo: '',
    propietario: '',
    ubicacion: '',
    estado: 'activa',
    notas: '',
    agente_registro: ''
  });
  
  const [newVisit, setNewVisit] = useState({
    empresa_id: '',
    agente: '',
    fecha_visita: '',
    notas: '',
    estado: 'completada'
  });

  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [showBusinessModal, setShowBusinessModal] = useState(false);

  // Cargar agentes CNI para autocompletado
  const loadCniAgents = async () => {
    try {
      // Simular carga de agentes CNI (en producción vendría de la API)
      const agents = [
        'BijjouPro08', 'nanobox_32', 'RA_ESTE', 'lichandro56',
        'LAFROGCRAZI', 'Elgato21053', 'Mimi (YoSoySergiox)', 'The441884',
        'amigo_dedoc', 'Secret_Agent', 'nicogamer2220', 'Director_CNI'
      ];
      setCniAgents(agents);
    } catch (err) {
      console.error('Error cargando agentes CNI:', err);
    }
  };

  // Manejar input de agente con autocompletado
  const handleAgentInput = (value, setter) => {
    setter(value);
    if (value.length > 1) {
      const filtered = cniAgents.filter(agent => 
        agent.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  // Seleccionar sugerencia
  const selectSuggestion = (agent, setter) => {
    setter(agent);
    setShowSuggestions(false);
  };

  // Cerrar sugerencias al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (suggestionRef.current && !suggestionRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Cargar agentes al montar el componente
  useEffect(() => {
    loadCniAgents();
  }, []);

  const loadBusinesses = async () => {
    try {
      setLoading(true);
      const response = await fetch(apiUrl('/api/cni/empresas'));
      const data = await response.json();
      
      if (data.success) {
        setBusinesses(data.empresas);
      } else {
        setError('Error cargando empresas');
      }
    } catch (err) {
      console.error('Error cargando empresas:', err);
      setError('Error de conexión al cargar empresas');
    } finally {
      setLoading(false);
    }
  };

  const loadVisits = async () => {
    try {
      const response = await fetch(apiUrl('/api/cni/visitas'));
      const data = await response.json();
      
      if (data.success) {
        setVisits(data.visitas);
      }
    } catch (err) {
      console.error('Error cargando visitas:', err);
    }
  };

  const loadStats = async () => {
    try {
      const response = await fetch(apiUrl('/api/cni/estadisticas'));
      const data = await response.json();
      
      if (data.success) {
        setStats(data.estadisticas);
      }
    } catch (err) {
      console.error('Error cargando estadísticas:', err);
    }
  };

  const handleAddBusiness = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const response = await fetch(apiUrl('/api/cni/empresas'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBusiness)
      });
      
      const data = await response.json();
      
      if (data.success) {
        setSuccess('Empresa registrada correctamente');
        setNewBusiness({ nombre: '', tipo: '', propietario: '', ubicacion: '', estado: 'activa', notas: '', agente_registro: '' });
        loadBusinesses();
        loadStats();

        // Logging del registro empresarial
        const userId = localStorage.getItem('spainrp_user_id') || 'unknown';
        await loggingService.logBusinessRecord(userId, newBusiness.nombre, newBusiness.tipo, 'create');
        await discordService.sendBusinessRecordEmbed(userId, newBusiness.nombre, newBusiness.tipo, 'create');
      } else {
        setError(`Error: ${data.error}`);
      }
    } catch (err) {
      console.error('Error añadiendo empresa:', err);
      setError('Error de conexión al registrar empresa');
    } finally {
      setLoading(false);
    }
  };

  const handleAddVisit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const response = await fetch(apiUrl('/api/cni/visitas'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newVisit)
      });
      
      const data = await response.json();
      
      if (data.success) {
        setSuccess('Visita registrada correctamente');
        setNewVisit({ empresa_id: '', agente: '', fecha_visita: '', notas: '', estado: 'completada' });
        loadVisits();
        loadBusinesses();
        loadStats();

        // Logging de la visita empresarial
        const userId = localStorage.getItem('spainrp_user_id') || 'unknown';
        const businessName = businesses.find(b => b.id === newVisit.empresa_id)?.nombre || 'Unknown';
        await loggingService.logBusinessVisit(userId, businessName, 'visit', {
          fecha: newVisit.fecha_visita,
          notas: newVisit.notas,
          estado: newVisit.estado
        });
        await discordService.sendBusinessVisitEmbed(userId, businessName, 'visit', {
          fecha: newVisit.fecha_visita,
          notas: newVisit.notas,
          estado: newVisit.estado
        });
      } else {
        setError(`Error: ${data.error}`);
      }
    } catch (err) {
      console.error('Error añadiendo visita:', err);
      setError('Error de conexión al registrar visita');
    } finally {
      setLoading(false);
    }
  };

  // Funciones de gestión empresarial
  const handleBusinessAction = async (businessId, action, newStatus = null) => {
    console.log(`[CNI][EMPRESAS] 🏢 Iniciando acción empresarial:`, { businessId, action, newStatus });
    
    // Confirmaciones específicas para cada acción
    const confirmations = {
      'delete': {
        title: 'CONFIRMACIÓN CRÍTICA',
        message: '¿Estás seguro de ELIMINAR PERMANENTEMENTE esta empresa? Esta acción NO se puede deshacer y se perderán todos los datos asociados.',
        confirmText: 'SÍ, ELIMINAR DEFINITIVAMENTE',
        cancelText: 'Cancelar'
      },
      'suspendida': {
        title: 'Suspender Empresa',
        message: '¿Confirmas la SUSPENSIÓN TEMPORAL de esta empresa? La empresa quedará inactiva hasta nueva orden.',
        confirmText: 'SÍ, SUSPENDER',
        cancelText: 'Cancelar'
      },
      'bajo_investigacion': {
        title: 'Poner Bajo Investigación',
        message: '¿Confirmas poner esta empresa BAJO INVESTIGACIÓN? Se iniciará un protocolo de supervisión especial.',
        confirmText: 'SÍ, INVESTIGAR',
        cancelText: 'Cancelar'
      },
      'clausurada': {
        title: 'Clausurar Empresa',
        message: '¿Confirmas la CLAUSURA DEFINITIVA de esta empresa? Esta acción es IRREVERSIBLE.',
        confirmText: 'SÍ, CLAUSURAR',
        cancelText: 'Cancelar'
      },
      'activa': {
        title: 'Reactivar Empresa',
        message: '¿Confirmas REACTIVAR esta empresa? Se restaurará su estado operativo normal.',
        confirmText: 'SÍ, REACTIVAR',
        cancelText: 'Cancelar'
      }
    };

    const confirmation = confirmations[newStatus || action];
    if (!confirmation) {
      console.log('[CNI][EMPRESAS] ❌ Confirmación no encontrada para:', newStatus || action);
      return;
    }

    console.log('[CNI][EMPRESAS] ⚠️ Mostrando confirmación:', confirmation.title);

    // Mostrar confirmación personalizada
    const confirmed = window.confirm(
      `${confirmation.title}\n\n${confirmation.message}\n\nPresiona OK para ${confirmation.confirmText.toLowerCase()} o Cancelar para ${confirmation.cancelText.toLowerCase()}.`
    );

    if (!confirmed) {
      console.log('[CNI][EMPRESAS] ❌ Acción cancelada por el usuario');
      return;
    }

    console.log('[CNI][EMPRESAS] ✅ Confirmación aceptada, ejecutando acción...');
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      console.log(`[CNI][EMPRESAS] 📡 Enviando petición ${action} para empresa ${businessId}...`);
      let response;
      if (action === 'delete') {
        console.log('[CNI][EMPRESAS] 🗑️ Ejecutando eliminación...');
        response = await fetch(apiUrl(`/api/cni/empresas/${businessId}`), {
          method: 'DELETE'
        });
      } else if (action === 'update') {
        console.log(`[CNI][EMPRESAS] 🔄 Actualizando estado a: ${newStatus}`);
        response = await fetch(apiUrl(`/api/cni/empresas/${businessId}`), {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ estado: newStatus })
        });
      }
      
      console.log(`[CNI][EMPRESAS] 📊 Respuesta recibida:`, response.status, response.statusText);
      const data = await response.json();
      console.log('[CNI][EMPRESAS] 📋 Datos de respuesta:', data);
      
      if (data.success) {
        const actionMessages = {
          'delete': 'Empresa eliminada correctamente',
          'suspendida': 'Empresa suspendida temporalmente',
          'bajo_investigacion': 'Empresa puesta bajo investigación',
          'clausurada': 'Empresa clausurada definitivamente',
          'activa': 'Empresa reactivada'
        };
        const message = actionMessages[newStatus || action];
        console.log(`[CNI][EMPRESAS] ✅ Acción exitosa: ${message}`);
        setSuccess(message);
        console.log('[CNI][EMPRESAS] 🔄 Recargando datos...');
        loadBusinesses();
        loadStats();
      } else {
        console.log(`[CNI][EMPRESAS] ❌ Error en respuesta: ${data.error}`);
        setError(`Error: ${data.error}`);
      }
    } catch (err) {
      console.error('[CNI][EMPRESAS] ❌ Error en acción empresarial:', err);
      setError('Error de conexión');
    } finally {
      setLoading(false);
      console.log('[CNI][EMPRESAS] ✅ Proceso de acción empresarial finalizado');
    }
  };

  useEffect(() => {
    loadBusinesses();
    loadVisits();
    loadStats();
  }, []);

  return (
    <div className="cni-section">
      <h3><FaBuilding /> Registros Empresariales</h3>
      
      {error && (
        <div className="cni-error-message">
          {error}
        </div>
      )}
      
      {success && (
        <div className="cni-success-message">
          {success}
        </div>
      )}
      
      <div className="cni-stats-grid">
        <div className="cni-stat-card">
          <span className="cni-stat-label">Total Empresas</span>
          <span className="cni-stat-value">{stats.total_empresas}</span>
        </div>
        <div className="cni-stat-card">
          <span className="cni-stat-label">Empresas Activas</span>
          <span className="cni-stat-value">{stats.empresas_activas}</span>
        </div>
        <div className="cni-stat-card">
          <span className="cni-stat-label">Empresas Inactivas</span>
          <span className="cni-stat-value">{stats.empresas_inactivas}</span>
        </div>
        <div className="cni-stat-card">
          <span className="cni-stat-label">Empresas Suspendidas</span>
          <span className="cni-stat-value">{stats.empresas_suspendidas}</span>
        </div>
        <div className="cni-stat-card">
          <span className="cni-stat-label">Visitas Esta Semana</span>
          <span className="cni-stat-value">{stats.visitas_semana}</span>
        </div>
        <div className="cni-stat-card">
          <span className="cni-stat-label">Visitas Este Mes</span>
          <span className="cni-stat-value">{stats.visitas_mes}</span>
        </div>
      </div>

      <div className="cni-section">
        <h3><FaPlus /> Registrar Nueva Empresa</h3>
        <form onSubmit={handleAddBusiness} className="cni-form">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div className="cni-form-group">
              <label>Nombre de la Empresa:</label>
              <input
                type="text"
                value={newBusiness.nombre}
                onChange={(e) => setNewBusiness({...newBusiness, nombre: e.target.value})}
                className="cni-input"
                required
              />
            </div>
            <div className="cni-form-group">
              <label>Tipo:</label>
              <select 
                value={newBusiness.tipo}
                onChange={(e) => setNewBusiness({...newBusiness, tipo: e.target.value})}
                className="cni-select"
                required
              >
                <option value="">Seleccionar...</option>
                <option value="Restaurante">Restaurante</option>
                <option value="Automóviles">Automóviles</option>
                <option value="Salud">Salud</option>
                <option value="Educación">Educación</option>
                <option value="Entretenimiento">Entretenimiento</option>
                <option value="Otros">Otros</option>
              </select>
            </div>
            <div className="cni-form-group">
              <label>Propietario:</label>
              <input
                type="text"
                value={newBusiness.propietario}
                onChange={(e) => setNewBusiness({...newBusiness, propietario: e.target.value})}
                className="cni-input"
                required
              />
            </div>
            <div className="cni-form-group">
              <label>Ubicación:</label>
              <input
                type="text"
                value={newBusiness.ubicacion}
                onChange={(e) => setNewBusiness({...newBusiness, ubicacion: e.target.value})}
                className="cni-input"
                required
              />
            </div>
            <div className="cni-form-group">
              <label>Estado:</label>
              <select 
                value={newBusiness.estado}
                onChange={(e) => setNewBusiness({...newBusiness, estado: e.target.value})}
                className="cni-select"
              >
                <option value="activa">Activa</option>
                <option value="inactiva">Inactiva</option>
                <option value="suspendida">Suspendida</option>
              </select>
            </div>
            <div className="cni-form-group">
              <label>Agente CNI:</label>
              <div className="cni-autocomplete-container" ref={suggestionRef}>
                <input
                  type="text"
                  value={newBusiness.agente_registro}
                  onChange={(e) => handleAgentInput(e.target.value, (value) => setNewBusiness({...newBusiness, agente_registro: value}))}
                  className="cni-input"
                  placeholder="Nombre del agente CNI"
                  autoComplete="off"
                />
                {showSuggestions && suggestions.length > 0 && (
                  <div className="cni-suggestions-dropdown">
                    {suggestions.map((agent, index) => (
                      <div 
                        key={index}
                        className="cni-suggestion-item"
                        onClick={() => selectSuggestion(agent, (value) => setNewBusiness({...newBusiness, agente_registro: value}))}
                      >
                        <FaUser /> {agent}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="cni-form-group">
            <label>Notas adicionales:</label>
            <textarea
              value={newBusiness.notas}
              onChange={(e) => setNewBusiness({...newBusiness, notas: e.target.value})}
              className="cni-textarea"
              rows="3"
              placeholder="Información adicional sobre la empresa..."
            />
          </div>
          <button type="submit" className="cni-btn cni-btn-success" disabled={loading}>
            {loading ? 'Registrando...' : 'Registrar Empresa'}
          </button>
        </form>
      </div>

      <div className="cni-section">
        <h3><FaCalendarAlt /> Visitas de Inspección</h3>
        <form onSubmit={handleAddVisit} className="cni-form">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div className="cni-form-group">
              <label>Empresa:</label>
              <select 
                value={newVisit.empresa_id}
                onChange={(e) => setNewVisit({...newVisit, empresa_id: e.target.value})}
                className="cni-select"
                required
              >
                <option value="">Seleccionar empresa...</option>
                {businesses.map(business => (
                  <option key={business.id} value={business.id}>
                    {business.nombre} - {business.propietario}
                  </option>
                ))}
              </select>
            </div>
            <div className="cni-form-group">
              <label>Agente CNI:</label>
              <div className="cni-autocomplete-container" ref={suggestionRef}>
                <input
                  type="text"
                  value={newVisit.agente}
                  onChange={(e) => handleAgentInput(e.target.value, (value) => setNewVisit({...newVisit, agente: value}))}
                  className="cni-input"
                  placeholder="Nombre del agente CNI"
                  autoComplete="off"
                  required
                />
                {showSuggestions && suggestions.length > 0 && (
                  <div className="cni-suggestions-dropdown">
                    {suggestions.map((agent, index) => (
                      <div 
                        key={index}
                        className="cni-suggestion-item"
                        onClick={() => selectSuggestion(agent, (value) => setNewVisit({...newVisit, agente: value}))}
                      >
                        <FaUser /> {agent}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="cni-form-group">
              <label>Fecha:</label>
              <input
                type="date"
                value={newVisit.fecha_visita}
                onChange={(e) => setNewVisit({...newVisit, fecha_visita: e.target.value})}
                className="cni-input"
                required
              />
            </div>
            <div className="cni-form-group">
              <label>Estado:</label>
              <select 
                value={newVisit.estado}
                onChange={(e) => setNewVisit({...newVisit, estado: e.target.value})}
                className="cni-select"
              >
                <option value="completada">Completada</option>
                <option value="pendiente">Pendiente</option>
                <option value="cancelada">Cancelada</option>
              </select>
            </div>
          </div>
          <div className="cni-form-group">
            <label>Notas de la Visita:</label>
            <textarea
              value={newVisit.notas}
              onChange={(e) => setNewVisit({...newVisit, notas: e.target.value})}
              className="cni-textarea"
              rows="3"
              placeholder="Detalles de la inspección, observaciones, incidencias..."
            />
          </div>
          <button type="submit" className="cni-btn cni-btn-primary" disabled={loading}>
            {loading ? 'Registrando...' : 'Registrar Visita'}
          </button>
        </form>
      </div>

      <div className="cni-section">
        <h3><FaBuilding /> Empresas Registradas ({businesses.length})</h3>
        {loading ? (
          <div className="cni-loading">
            <FaSpinner className="fa-spin" />
            <p>Cargando empresas...</p>
          </div>
        ) : businesses.length === 0 ? (
          <div className="cni-no-data">
            <FaBuilding />
            <p>No hay empresas registradas</p>
          </div>
        ) : (
          <div className="cni-search-results">
            {businesses.map(business => (
              <div key={business.id} className="cni-result-card">
                <div className="cni-result-header">
                  <h5><FaBuilding /> {business.nombre}</h5>
                  <span className={`cni-result-type ${business.estado}`}>
                    {business.estado.toUpperCase()}
                  </span>
                </div>
                <div className="cni-result-info">
                  <div className="cni-result-field">
                    <label>Tipo:</label>
                    <span>{business.tipo}</span>
                  </div>
                  <div className="cni-result-field">
                    <label>Propietario:</label>
                    <span>{business.propietario}</span>
                  </div>
                  <div className="cni-result-field">
                    <label>Ubicación:</label>
                    <span>{business.ubicacion}</span>
                  </div>
                  <div className="cni-result-field">
                    <label>Última Visita:</label>
                    <span>{business.ultima_visita ? new Date(business.ultima_visita).toLocaleDateString('es-ES') : 'Sin visitas'}</span>
                  </div>
                  {business.agente_registro && (
                    <div className="cni-result-field">
                      <label>Agente Registro:</label>
                      <span>{business.agente_registro}</span>
                    </div>
                  )}
                  {business.notas && (
                    <div className="cni-result-field">
                      <label>Notas:</label>
                      <span>{business.notas}</span>
                    </div>
                  )}
                </div>
                <div className="cni-business-actions">
                  {business.estado === 'activa' && (
                    <>
                      <button 
                        className="cni-btn cni-btn-warning"
                        onClick={() => handleBusinessAction(business.id, 'update', 'suspendida')}
                        disabled={loading}
                      >
                        <FaClock /> Suspender
                      </button>
                      <button 
                        className="cni-btn cni-btn-info"
                        onClick={() => handleBusinessAction(business.id, 'update', 'bajo_investigacion')}
                        disabled={loading}
                      >
                        <FaSearch /> Investigar
                      </button>
                      <button 
                        className="cni-btn cni-btn-danger"
                        onClick={() => handleBusinessAction(business.id, 'update', 'clausurada')}
                        disabled={loading}
                      >
                        <FaTimes /> Clausurar
                      </button>
                    </>
                  )}
                  {business.estado === 'suspendida' && (
                    <>
                      <button 
                        className="cni-btn cni-btn-success"
                        onClick={() => handleBusinessAction(business.id, 'update', 'activa')}
                        disabled={loading}
                      >
                        <FaCheckCircle /> Reactivar
                      </button>
                      <button 
                        className="cni-btn cni-btn-danger"
                        onClick={() => handleBusinessAction(business.id, 'update', 'clausurada')}
                        disabled={loading}
                      >
                        <FaTimes /> Clausurar
                      </button>
                    </>
                  )}
                  {business.estado === 'bajo_investigacion' && (
                    <>
                      <button 
                        className="cni-btn cni-btn-success"
                        onClick={() => handleBusinessAction(business.id, 'update', 'activa')}
                        disabled={loading}
                      >
                        <FaCheckCircle /> Limpiar
                      </button>
                      <button 
                        className="cni-btn cni-btn-danger"
                        onClick={() => handleBusinessAction(business.id, 'update', 'clausurada')}
                        disabled={loading}
                      >
                        <FaTimes /> Clausurar
                      </button>
                    </>
                  )}
                  <button 
                    className="cni-btn cni-btn-danger"
                    onClick={() => handleBusinessAction(business.id, 'delete')}
                    disabled={loading}
                  >
                    <FaTimes /> Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Pestaña de Blog CNI
const BlogTab = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showNewArticle, setShowNewArticle] = useState(false);
  
  // Estados para autocompletado
  const [cniAgents, setCniAgents] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionRef = useRef(null);
  
  const [newArticle, setNewArticle] = useState({
    titulo: '',
    banda: '',
    categoria: 'investigacion',
    contenido: '',
    imagen_url: '',
    agente: '',
    nivel_seguridad: 'confidencial'
  });

  // Cargar agentes CNI para autocompletado
  const loadCniAgents = async () => {
    try {
      // Simular carga de agentes CNI (en producción vendría de la API)
      const agents = [
        'BijjouPro08', 'nanobox_32', 'RA_ESTE', 'lichandro56',
        'LAFROGCRAZI', 'Elgato21053', 'Mimi (YoSoySergiox)', 'The441884',
        'amigo_dedoc', 'Secret_Agent', 'nicogamer2220', 'Director_CNI'
      ];
      setCniAgents(agents);
    } catch (err) {
      console.error('Error cargando agentes CNI:', err);
    }
  };

  // Manejar input de agente con autocompletado
  const handleAgentInput = (value, setter) => {
    setter(value);
    if (value.length > 1) {
      const filtered = cniAgents.filter(agent => 
        agent.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  // Seleccionar sugerencia
  const selectSuggestion = (agent, setter) => {
    setter(agent);
    setShowSuggestions(false);
  };

  // Cerrar sugerencias al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (suggestionRef.current && !suggestionRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Cargar agentes al montar el componente
  useEffect(() => {
    loadCniAgents();
  }, []);

  const loadArticles = async () => {
    console.log('[CNI][BLOG] 📚 Cargando artículos del blog...');
    try {
      setLoading(true);
      const response = await fetch(apiUrl('/api/cni/blog'));
      console.log('[CNI][BLOG] 📡 Respuesta recibida:', response.status, response.statusText);
      const data = await response.json();
      console.log('[CNI][BLOG] 📋 Datos recibidos:', data);
      
      if (data.success) {
        console.log(`[CNI][BLOG] ✅ Cargados ${data.articles.length} artículos`);
        setArticles(data.articles);
      } else {
        console.log('[CNI][BLOG] ❌ Error en respuesta:', data.error);
        setError('Error cargando artículos');
      }
    } catch (err) {
      console.error('[CNI][BLOG] ❌ Error cargando artículos:', err);
      setError('Error de conexión al cargar artículos');
    } finally {
      setLoading(false);
      console.log('[CNI][BLOG] ✅ Carga de artículos finalizada');
    }
  };

  const handleAddArticle = async (e) => {
    e.preventDefault();
    console.log('[CNI][BLOG] ✍️ Creando nuevo artículo:', newArticle);
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      console.log('[CNI][BLOG] 📡 Enviando petición de creación...');
      const response = await fetch(apiUrl('/api/cni/blog'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newArticle)
      });
      
      console.log('[CNI][BLOG] 📊 Respuesta recibida:', response.status, response.statusText);
      const data = await response.json();
      console.log('[CNI][BLOG] 📋 Datos de respuesta:', data);
      
      if (data.success) {
        console.log('[CNI][BLOG] ✅ Artículo creado exitosamente');
        setSuccess('Artículo creado correctamente');
        setNewArticle({ titulo: '', banda: '', categoria: 'investigacion', contenido: '', imagen_url: '', agente: '', nivel_seguridad: 'confidencial' });
        setShowNewArticle(false);
        console.log('[CNI][BLOG] 🔄 Recargando lista de artículos...');
        loadArticles();

        // Logging del artículo de blog
        const userId = localStorage.getItem('spainrp_user_id') || 'unknown';
        await loggingService.logBlogArticle(userId, newArticle.titulo, 'create');
        await discordService.sendBlogArticleEmbed(userId, newArticle.titulo, 'create');
      } else {
        console.log('[CNI][BLOG] ❌ Error en creación:', data.error);
        setError(`Error: ${data.error}`);
      }
    } catch (err) {
      console.error('[CNI][BLOG] ❌ Error creando artículo:', err);
      setError('❌ Error de conexión al crear artículo');
    } finally {
      setLoading(false);
      console.log('[CNI][BLOG] ✅ Proceso de creación finalizado');
    }
  };

  const handleDeleteArticle = async (articleId) => {
    console.log(`[CNI][BLOG] 🗑️ Iniciando eliminación de artículo ${articleId}`);
    if (!window.confirm('¿Estás seguro de eliminar este artículo?')) {
      console.log('[CNI][BLOG] ❌ Eliminación cancelada por el usuario');
      return;
    }
    
    console.log('[CNI][BLOG] ✅ Confirmación aceptada, eliminando artículo...');
    setLoading(true);
    try {
      console.log('[CNI][BLOG] 📡 Enviando petición de eliminación...');
      const response = await fetch(apiUrl(`/api/cni/blog/${articleId}`), {
        method: 'DELETE'
      });
      
      console.log('[CNI][BLOG] 📊 Respuesta recibida:', response.status, response.statusText);
      const data = await response.json();
      console.log('[CNI][BLOG] 📋 Datos de respuesta:', data);
      
      if (data.success) {
        console.log('[CNI][BLOG] ✅ Artículo eliminado exitosamente');
        setSuccess('Artículo eliminado correctamente');
        console.log('[CNI][BLOG] 🔄 Recargando lista de artículos...');
        loadArticles();
      } else {
        console.log('[CNI][BLOG] ❌ Error en eliminación:', data.error);
        setError(`Error: ${data.error}`);
      }
    } catch (err) {
      console.error('[CNI][BLOG] ❌ Error eliminando artículo:', err);
      setError('Error de conexión');
    } finally {
      setLoading(false);
      console.log('[CNI][BLOG] ✅ Proceso de eliminación finalizado');
    }
  };

  useEffect(() => {
    loadArticles();
  }, []);

  return (
    <div className="cni-section">
      <h3><FaFileAlt /> Archivos CNI - Sistema de Inteligencia</h3>
      
      {error && (
        <div className="cni-error-message">
          {error}
        </div>
      )}
      
      {success && (
        <div className="cni-success-message">
          {success}
        </div>
      )}

      <div className="cni-blog-header">
        <button 
          className="cni-btn cni-btn-primary"
          onClick={() => setShowNewArticle(!showNewArticle)}
        >
          <FaPlus /> Nuevo Archivo
        </button>
      </div>

      {showNewArticle && (
        <div className="cni-section">
          <h3><FaPlus /> Crear Nuevo Archivo</h3>
          <form onSubmit={handleAddArticle} className="cni-form">
            <div className="cni-form-group">
              <label>Título del Archivo:</label>
              <input
                type="text"
                className="cni-input"
                value={newArticle.titulo}
                onChange={(e) => setNewArticle(prev => ({ ...prev, titulo: e.target.value }))}
                placeholder="Ej: Investigación Banda Los Zetas"
                required
              />
            </div>
            
            <div className="cni-form-group">
              <label>Banda/Organización:</label>
              <input
                type="text"
                className="cni-input"
                value={newArticle.banda}
                onChange={(e) => setNewArticle(prev => ({ ...prev, banda: e.target.value }))}
                placeholder="Nombre de la banda"
                required
              />
            </div>

            <div className="cni-form-group">
              <label>Categoría:</label>
              <select
                className="cni-select"
                value={newArticle.categoria}
                onChange={(e) => setNewArticle(prev => ({ ...prev, categoria: e.target.value }))}
              >
                <option value="investigacion">Investigación</option>
                <option value="operacion">Operación</option>
                <option value="inteligencia">Inteligencia</option>
                <option value="seguimiento">Seguimiento</option>
                <option value="archivo">Archivo</option>
              </select>
            </div>

            <div className="cni-form-group">
              <label>Nivel de Seguridad:</label>
              <select
                className="cni-select"
                value={newArticle.nivel_seguridad}
                onChange={(e) => setNewArticle(prev => ({ ...prev, nivel_seguridad: e.target.value }))}
              >
                <option value="publico">Público</option>
                <option value="confidencial">Confidencial</option>
                <option value="secreto">Secreto</option>
                <option value="ultra_secreto">Ultra Secreto</option>
              </select>
            </div>

            <div className="cni-form-group">
              <label>URL de Imagen:</label>
              <input
                type="url"
                className="cni-input"
                value={newArticle.imagen_url}
                onChange={(e) => setNewArticle(prev => ({ ...prev, imagen_url: e.target.value }))}
                placeholder="https://ejemplo.com/imagen.jpg"
              />
            </div>

            <div className="cni-form-group">
              <label>Agente Responsable:</label>
              <div className="cni-autocomplete-container" ref={suggestionRef}>
                <input
                  type="text"
                  className="cni-input"
                  value={newArticle.agente}
                  onChange={(e) => handleAgentInput(e.target.value, (value) => setNewArticle(prev => ({ ...prev, agente: value })))}
                  placeholder="Nombre del agente"
                  autoComplete="off"
                  required
                />
                {showSuggestions && suggestions.length > 0 && (
                  <div className="cni-suggestions-dropdown">
                    {suggestions.map((agent, index) => (
                      <div 
                        key={index}
                        className="cni-suggestion-item"
                        onClick={() => selectSuggestion(agent, (value) => setNewArticle(prev => ({ ...prev, agente: value })))}
                      >
                        <FaUser /> {agent}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="cni-form-group">
              <label>Contenido:</label>
              <textarea
                className="cni-textarea"
                value={newArticle.contenido}
                onChange={(e) => setNewArticle(prev => ({ ...prev, contenido: e.target.value }))}
                placeholder="Detalles de la investigación, operación, etc..."
                rows="6"
                required
              />
            </div>

            <div className="cni-form-actions">
              <button type="submit" className="cni-btn cni-btn-primary" disabled={loading}>
                {loading ? <FaSpinner className="fa-spin" /> : <FaPlus />} 
                {loading ? 'Creando...' : 'Crear Archivo'}
              </button>
              <button 
                type="button" 
                className="cni-btn cni-btn-secondary"
                onClick={() => setShowNewArticle(false)}
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="cni-section">
        <h3><FaFileAlt /> Archivos Existentes ({articles.length})</h3>
        {loading ? (
          <div className="cni-loading">
            <FaSpinner className="fa-spin" />
            <p>Cargando archivos...</p>
          </div>
        ) : articles.length === 0 ? (
          <div className="cni-no-data">
            <FaFileAlt />
            <p>No hay archivos creados</p>
          </div>
        ) : (
          <div className="cni-blog-grid">
            {articles.map(article => (
              <div key={article.id} className="cni-blog-card">
                <div className="cni-blog-header">
                  <h4>{article.titulo}</h4>
                  <span className={`cni-blog-security ${article.nivel_seguridad}`}>
                    {article.nivel_seguridad.toUpperCase()}
                  </span>
                </div>
                
                {article.imagen_url && (
                  <div className="cni-blog-image">
                    <img src={article.imagen_url} alt={article.titulo} />
                  </div>
                )}
                
                <div className="cni-blog-content">
                  <div className="cni-blog-meta">
                    <span><FaBuilding /> {article.banda}</span>
                    <span><FaUser /> {article.agente}</span>
                    <span><FaCalendarAlt /> {new Date(article.fecha_creacion).toLocaleDateString('es-ES')}</span>
                  </div>
                  
                  <div className="cni-blog-category">
                    <span className={`cni-blog-category-badge ${article.categoria}`}>
                      {article.categoria.toUpperCase()}
                    </span>
                  </div>
                  
                  <div className="cni-blog-text">
                    <p>{article.contenido}</p>
                  </div>
                </div>
                
                <div className="cni-blog-actions">
                  <button 
                    className="cni-btn cni-btn-danger"
                    onClick={() => handleDeleteArticle(article.id)}
                    disabled={loading}
                  >
                    <FaTimes /> Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Pestaña de Jugadores en Ciudad
const PlayersInCityTab = () => {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [lastUpdate, setLastUpdate] = useState(null);

  const loadPlayers = async () => {
    console.log('[CNI][JUGADORES] 👥 Cargando jugadores en ciudad...');
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const response = await fetch(apiUrl('/api/cni/tracking/players'));
      console.log('[CNI][JUGADORES] 📡 Respuesta recibida:', response.status, response.statusText);
      const data = await response.json();
      console.log('[CNI][JUGADORES] 📋 Datos recibidos:', data);
      
      if (data.success) {
        console.log(`[CNI][JUGADORES] ✅ Cargados ${data.players.length} jugadores`);
        setPlayers(data.players);
        setLastUpdate(new Date());
        setSuccess(`${data.players.length} jugadores detectados en la ciudad`);
      } else {
        console.log('[CNI][JUGADORES] ❌ Error en respuesta:', data.error);
        setError(`Error: ${data.error}`);
      }
    } catch (err) {
      console.error('[CNI][JUGADORES] ❌ Error cargando jugadores:', err);
      setError('Error de conexión al cargar jugadores');
    } finally {
      setLoading(false);
      console.log('[CNI][JUGADORES] ✅ Carga de jugadores finalizada');
    }
  };

  const getTeamIcon = (team) => {
    switch (team.toLowerCase()) {
      case 'police':
        return <FaShieldAlt />;
      case 'medical':
        return <FaUserShield />;
      case 'fire':
        return <FaCarCrash />;
      case 'civilian':
        return <FaUser />;
      default:
        return <FaUser />;
    }
  };

  const getTeamColor = (team) => {
    switch (team.toLowerCase()) {
      case 'police':
        return '#3b82f6';
      case 'medical':
        return '#10b981';
      case 'fire':
        return '#f59e0b';
      case 'civilian':
        return '#6b7280';
      default:
        return '#6b7280';
    }
  };

  const getPermissionColor = (permission) => {
    switch (permission.toLowerCase()) {
      case 'server owner':
        return '#dc2626';
      case 'server administrator':
        return '#f59e0b';
      case 'server moderator':
        return '#8b5cf6';
      case 'normal':
        return '#6b7280';
      default:
        return '#6b7280';
    }
  };

  useEffect(() => {
    loadPlayers();
  }, []);

  return (
    <div className="cni-section">
      <h3><FaUsers /> Ciudadanos Detectados en la Ciudad</h3>
      
      {error && (
        <div className="cni-error-message">
          {error}
        </div>
      )}
      
      {success && (
        <div className="cni-success-message">
          {success}
        </div>
      )}

      <div className="cni-section-header">
        <div className="cni-stats-overview">
          <div className="cni-stat-item">
            <span className="cni-stat-label">Total Ciudadanos</span>
            <span className="cni-stat-value">{players.length}</span>
          </div>
          <div className="cni-stat-item">
            <span className="cni-stat-label">Última Actualización</span>
            <span className="cni-stat-value">
              {lastUpdate ? lastUpdate.toLocaleTimeString('es-ES') : 'Nunca'}
            </span>
          </div>
        </div>
        
        <button 
          className="cni-btn cni-btn-primary"
          onClick={loadPlayers}
          disabled={loading}
        >
          {loading ? <FaSpinner className="fa-spin" /> : <FaUsers />}
          {loading ? 'Actualizando...' : 'Actualizar Lista'}
        </button>
      </div>

      {loading ? (
        <div className="cni-loading">
          <FaSpinner className="fa-spin" />
          <p>Obteniendo datos de ciudadanos en tiempo real...</p>
        </div>
      ) : players.length === 0 ? (
        <div className="cni-no-data">
          <FaUsers />
          <p>No hay ciudadanos detectados en la ciudad</p>
          <p>La ciudad puede estar vacía o hay un problema de conexión con las detecciones</p>
        </div>
      ) : (
        <div className="cni-players-grid">
          {players.map((player, index) => (
            <div key={index} className="cni-player-card">
              <div className="cni-player-header">
                <div className="cni-player-avatar">
                  {getTeamIcon(player.Team)}
                </div>
                <div className="cni-player-info">
                  <h4>{player.Player.split(':')[0]}</h4>
                  <p className="cni-player-id">ID: {player.Player.split(':')[1]}</p>
                </div>
                <div className="cni-player-badges">
                  <span 
                    className="cni-team-badge"
                    style={{ backgroundColor: getTeamColor(player.Team) }}
                  >
                    {player.Team}
                  </span>
                  <span 
                    className="cni-permission-badge"
                    style={{ backgroundColor: getPermissionColor(player.Permission) }}
                  >
                    {player.Permission}
                  </span>
                </div>
              </div>
              
              <div className="cni-player-details">
                {player.Callsign && (
                  <div className="cni-player-field">
                    <label>Indicativo:</label>
                    <span>{player.Callsign}</span>
                  </div>
                )}
                <div className="cni-player-field">
                  <label>Equipo:</label>
                  <span style={{ color: getTeamColor(player.Team) }}>
                    {player.Team}
                  </span>
                </div>
                <div className="cni-player-field">
                  <label>Permisos:</label>
                  <span style={{ color: getPermissionColor(player.Permission) }}>
                    {player.Permission}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Pestaña de Vehículos en Ciudad
const VehiclesInCityTab = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [lastUpdate, setLastUpdate] = useState(null);

  const loadVehicles = async () => {
    console.log('[CNI][VEHÍCULOS] 🚗 Cargando vehículos en ciudad...');
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const response = await fetch(apiUrl('/api/cni/tracking/vehicles'));
      console.log('[CNI][VEHÍCULOS] 📡 Respuesta recibida:', response.status, response.statusText);
      const data = await response.json();
      console.log('[CNI][VEHÍCULOS] 📋 Datos recibidos:', data);
      
      if (data.success) {
        console.log(`[CNI][VEHÍCULOS] ✅ Cargados ${data.vehicles.length} vehículos`);
        setVehicles(data.vehicles);
        setLastUpdate(new Date());
        setSuccess(`${data.vehicles.length} vehículos detectados en la ciudad`);
      } else {
        console.log('[CNI][VEHÍCULOS] ❌ Error en respuesta:', data.error);
        setError(`Error: ${data.error}`);
      }
    } catch (err) {
      console.error('[CNI][VEHÍCULOS] ❌ Error cargando vehículos:', err);
      setError('Error de conexión al cargar vehículos');
    } finally {
      setLoading(false);
      console.log('[CNI][VEHÍCULOS] ✅ Carga de vehículos finalizada');
    }
  };

  const getVehicleIcon = (name) => {
    if (name.toLowerCase().includes('police') || name.toLowerCase().includes('interceptor')) {
      return <FaShieldAlt />;
    } else if (name.toLowerCase().includes('ambulance') || name.toLowerCase().includes('medical')) {
      return <FaUserShield />;
    } else if (name.toLowerCase().includes('fire') || name.toLowerCase().includes('truck')) {
      return <FaCarCrash />;
    } else {
      return <FaCarCrash />;
    }
  };

  const getVehicleType = (name) => {
    if (name.toLowerCase().includes('police') || name.toLowerCase().includes('interceptor')) {
      return 'Policial';
    } else if (name.toLowerCase().includes('ambulance') || name.toLowerCase().includes('medical')) {
      return 'Médico';
    } else if (name.toLowerCase().includes('fire') || name.toLowerCase().includes('truck')) {
      return 'Bomberos';
    } else {
      return 'Civil';
    }
  };

  const getVehicleColor = (name) => {
    if (name.toLowerCase().includes('police') || name.toLowerCase().includes('interceptor')) {
      return '#3b82f6';
    } else if (name.toLowerCase().includes('ambulance') || name.toLowerCase().includes('medical')) {
      return '#10b981';
    } else if (name.toLowerCase().includes('fire') || name.toLowerCase().includes('truck')) {
      return '#f59e0b';
    } else {
      return '#6b7280';
    }
  };

  useEffect(() => {
    loadVehicles();
  }, []);

  return (
    <div className="cni-section">
      <h3><FaCarCrash /> Vehículos Actualmente en la Ciudad</h3>
      
      {error && (
        <div className="cni-error-message">
          {error}
        </div>
      )}
      
      {success && (
        <div className="cni-success-message">
          {success}
        </div>
      )}

      <div className="cni-section-header">
        <div className="cni-stats-overview">
          <div className="cni-stat-item">
            <span className="cni-stat-label">Total Vehículos</span>
            <span className="cni-stat-value">{vehicles.length}</span>
          </div>
          <div className="cni-stat-item">
            <span className="cni-stat-label">Última Actualización</span>
            <span className="cni-stat-value">
              {lastUpdate ? lastUpdate.toLocaleTimeString('es-ES') : 'Nunca'}
            </span>
          </div>
        </div>
        
        <button 
          className="cni-btn cni-btn-primary"
          onClick={loadVehicles}
          disabled={loading}
        >
          {loading ? <FaSpinner className="fa-spin" /> : <FaCarCrash />}
          {loading ? 'Actualizando...' : 'Actualizar Lista'}
        </button>
      </div>

      {loading ? (
        <div className="cni-loading">
          <FaSpinner className="fa-spin" />
          <p>Obteniendo datos de vehículos en tiempo real...</p>
        </div>
      ) : vehicles.length === 0 ? (
        <div className="cni-no-data">
          <FaCarCrash />
          <p>No hay vehículos detectados en la ciudad</p>
          <p>La ciudad puede estar vacía o hay un problema de conexión con las detecciones</p>
        </div>
      ) : (
        <div className="cni-vehicles-grid">
          {vehicles.map((vehicle, index) => (
            <div key={index} className="cni-vehicle-card">
              <div className="cni-vehicle-header">
                <div className="cni-vehicle-icon">
                  {getVehicleIcon(vehicle.Name)}
                </div>
                <div className="cni-vehicle-info">
                  <h4>{vehicle.Name}</h4>
                  <p className="cni-vehicle-owner">Propietario: {vehicle.Owner}</p>
                </div>
                <div className="cni-vehicle-badges">
                  <span 
                    className="cni-vehicle-type-badge"
                    style={{ backgroundColor: getVehicleColor(vehicle.Name) }}
                  >
                    {getVehicleType(vehicle.Name)}
                  </span>
                  <span 
                    className="cni-vehicle-texture-badge"
                    style={{ backgroundColor: '#6b7280' }}
                  >
                    {vehicle.Texture}
                  </span>
                </div>
              </div>
              
              <div className="cni-vehicle-details">
                <div className="cni-vehicle-field">
                  <label>Modelo:</label>
                  <span>{vehicle.Name}</span>
                </div>
                <div className="cni-vehicle-field">
                  <label>Propietario:</label>
                  <span>{vehicle.Owner}</span>
                </div>
                <div className="cni-vehicle-field">
                  <label>Tipo:</label>
                  <span style={{ color: getVehicleColor(vehicle.Name) }}>
                    {getVehicleType(vehicle.Name)}
                  </span>
                </div>
                <div className="cni-vehicle-field">
                  <label>Textura:</label>
                  <span>{vehicle.Texture}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CNISection;
