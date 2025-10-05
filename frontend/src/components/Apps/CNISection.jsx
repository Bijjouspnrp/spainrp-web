import React, { useState, useEffect } from 'react';
import { 
  FaEye, FaSearch, FaDatabase, FaUser, FaIdCard, FaMoneyBillWave, 
  FaHistory, FaClipboardList, FaShieldAlt, FaSpinner, FaExclamationTriangle,
  FaCheckCircle, FaTimes, FaCrown, FaGavel, FaLock, FaTrophy,
  FaUserShield, FaFileAlt, FaCarCrash, FaGlobe, FaChartLine,
  FaUsers, FaBuilding, FaMapMarkerAlt, FaPhone, FaEnvelope,
  FaCalendarAlt, FaClock, FaFlag, FaKey, FaFingerprint
} from 'react-icons/fa';
import { apiUrl } from '../../utils/api';
import './CNISection.css';

const CNISection = () => {
  const [user, setUser] = useState(null);
  const [isCNI, setIsCNI] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('database');
  const [error, setError] = useState(null);

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
        }

        setLoading(false);
      } catch (err) {
        setError('Error verificando permisos CNI');
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Cargar estadísticas de la base de datos
  const loadDatabaseStats = async () => {
    try {
      const [statsRes, recordsRes] = await Promise.all([
        fetch(apiUrl('/api/proxy/admin/stats')),
        fetch(apiUrl('/api/proxy/admin/stats/records'))
      ]);

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setDatabaseStats(prev => ({
          ...prev,
          totalUsers: statsData.stats?.totalUsers || 0
        }));
      }

      if (recordsRes.ok) {
        const recordsData = await recordsRes.json();
        setDatabaseStats(prev => ({
          ...prev,
          totalMultas: recordsData.records?.multas || 0,
          totalAntecedentes: recordsData.records?.antecedentes || 0,
          totalArrestos: recordsData.records?.arrestos || 0
        }));
      }
    } catch (err) {
      console.error('Error cargando estadísticas:', err);
    }
  };

  useEffect(() => {
    if (isCNI) {
      loadDatabaseStats();
    }
  }, [isCNI]);

  if (loading) {
    return (
      <div className="cni-loading">
        <div className="cni-spinner"></div>
        <h2>Centro Nacional de Inteligencia</h2>
        <p>Verificando credenciales de acceso...</p>
        <p>Inicializando sistemas de inteligencia...</p>
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
    <div className="cni-container">
      <div className="cni-header">
        <div className="cni-header-content">
          <div className="cni-logo">
            <FaEye />
            <h1>CNI - Centro Nacional de Inteligencia</h1>
          </div>
          <div className="cni-user-info">
            <span className="cni-user-name">{user?.username}</span>
            <span className="cni-cni-badge">AGENTE CNI</span>
          </div>
        </div>
      </div>

      <div className="cni-tabs">
        <button 
          className={`cni-tab ${activeTab === 'database' ? 'active' : ''}`}
          onClick={() => setActiveTab('database')}
        >
          <FaDatabase /> Base de Datos
        </button>
        <button 
          className={`cni-tab ${activeTab === 'search' ? 'active' : ''}`}
          onClick={() => setActiveTab('search')}
        >
          <FaSearch /> Búsqueda Avanzada
        </button>
        <button 
          className={`cni-tab ${activeTab === 'tracking' ? 'active' : ''}`}
          onClick={() => setActiveTab('tracking')}
        >
          <FaGlobe /> Rastreo
        </button>
        <button 
          className={`cni-tab ${activeTab === 'intelligence' ? 'active' : ''}`}
          onClick={() => setActiveTab('intelligence')}
        >
          <FaChartLine /> Inteligencia
        </button>
        <button 
          className={`cni-tab ${activeTab === 'surveillance' ? 'active' : ''}`}
          onClick={() => setActiveTab('surveillance')}
        >
          <FaEye /> Vigilancia
        </button>
      </div>

      <div className="cni-content">
        {activeTab === 'database' && <DatabaseTab stats={databaseStats} />}
        {activeTab === 'search' && <AdvancedSearchTab />}
        {activeTab === 'tracking' && <TrackingTab />}
        {activeTab === 'intelligence' && <IntelligenceTab />}
        {activeTab === 'surveillance' && <SurveillanceTab />}
      </div>
    </div>
  );
};

// Pestaña de Base de Datos
const DatabaseTab = ({ stats }) => {
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
        <div className="cni-nav">
          <button className="cni-nav-btn">
            <FaIdCard /> Consultar DNI
          </button>
          <button className="cni-nav-btn">
            <FaMoneyBillWave /> Historial Multas
          </button>
          <button className="cni-nav-btn">
            <FaHistory /> Antecedentes
          </button>
          <button className="cni-nav-btn">
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
    </div>
  );
};

// Pestaña de Rastreo
const TrackingTab = () => {
  const [trackingForm, setTrackingForm] = useState({
    target: '',
    trackingType: 'discord',
    duration: '24'
  });

  const handleTracking = async (e) => {
    e.preventDefault();
    // Implementar lógica de rastreo
    console.log('Iniciando rastreo:', trackingForm);
  };

  return (
    <div className="cni-section">
      <h3><FaGlobe /> Sistema de Rastreo Avanzado</h3>
      
      <form onSubmit={handleTracking} className="cni-form">
        <div className="cni-form-group">
          <label>Objetivo de Rastreo:</label>
          <input
            type="text"
            value={trackingForm.target}
            onChange={(e) => setTrackingForm({...trackingForm, target: e.target.value})}
            className="cni-input"
            placeholder="Discord ID, DNI, o nombre..."
            required
          />
        </div>
        
        <div className="cni-form-group">
          <label>Tipo de Rastreo:</label>
          <select 
            value={trackingForm.trackingType}
            onChange={(e) => setTrackingForm({...trackingForm, trackingType: e.target.value})}
            className="cni-select"
          >
            <option value="discord">Actividad Discord</option>
            <option value="roblox">Actividad Roblox</option>
            <option value="financial">Movimientos Financieros</option>
            <option value="location">Ubicación</option>
            <option value="communications">Comunicaciones</option>
          </select>
        </div>

        <div className="cni-form-group">
          <label>Duración del Rastreo (horas):</label>
          <select 
            value={trackingForm.duration}
            onChange={(e) => setTrackingForm({...trackingForm, duration: e.target.value})}
            className="cni-select"
          >
            <option value="1">1 Hora</option>
            <option value="6">6 Horas</option>
            <option value="24">24 Horas</option>
            <option value="72">72 Horas</option>
            <option value="168">1 Semana</option>
          </select>
        </div>
        
        <button type="submit" className="cni-btn cni-btn-warning">
          <FaEye /> Iniciar Rastreo
        </button>
      </form>

      <div className="cni-section">
        <h3><FaMapMarkerAlt /> Rastreos Activos</h3>
        <div className="cni-no-data">
          <FaEye />
          <p>No hay rastreos activos en este momento</p>
        </div>
      </div>
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

// Pestaña de Vigilancia
const SurveillanceTab = () => {
  return (
    <div className="cni-section">
      <h3><FaEye /> Sistema de Vigilancia</h3>
      
      <div className="cni-nav">
        <button className="cni-nav-btn">
          <FaPhone /> Interceptación de Comunicaciones
        </button>
        <button className="cni-nav-btn">
          <FaEnvelope /> Monitoreo de Mensajes
        </button>
        <button className="cni-nav-btn">
          <FaCalendarAlt /> Seguimiento de Actividades
        </button>
        <button className="cni-nav-btn">
          <FaKey /> Análisis de Accesos
        </button>
      </div>

      <div className="cni-section">
        <h3><FaFingerprint /> Identificación Biométrica</h3>
        <div className="cni-no-data">
          <FaFingerprint />
          <p>Sistema de identificación biométrica no disponible</p>
        </div>
      </div>
    </div>
  );
};

export default CNISection;
