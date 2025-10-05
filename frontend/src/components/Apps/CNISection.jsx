import React, { useState, useEffect } from 'react';
import { 
  FaEye, FaSearch, FaDatabase, FaUser, FaIdCard, FaMoneyBillWave, 
  FaHistory, FaClipboardList, FaShieldAlt, FaSpinner, FaExclamationTriangle,
  FaCheckCircle, FaTimes, FaCrown, FaGavel, FaLock, FaTrophy,
  FaUserShield, FaFileAlt, FaCarCrash, FaGlobe, FaChartLine,
  FaUsers, FaBuilding, FaMapMarkerAlt, FaPhone, FaEnvelope,
  FaCalendarAlt, FaClock, FaFlag, FaKey, FaFingerprint, FaPlus
} from 'react-icons/fa';
import { apiUrl } from '../../utils/api';
import './CNISection.css';
import './BusinessRecords.css';

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
      // Usar el nuevo endpoint del dashboard CNI
      const dashboardRes = await fetch(apiUrl('/api/cni/dashboard'));
      
      if (dashboardRes.ok) {
        const dashboardData = await dashboardRes.json();
        console.log('[CNI] Dashboard data received:', dashboardData);
        
        if (dashboardData.success && dashboardData.cni) {
          const cniData = dashboardData.cni.dashboard;
          setDatabaseStats(prev => ({
            ...prev,
            totalUsers: cniData.baseDatos?.totalUsuarios || 0,
            totalDNIs: cniData.baseDatos?.dnisRegistrados || 0,
            totalMultas: cniData.multas?.total || 0,
            totalAntecedentes: cniData.baseDatos?.antecedentes || 0,
            totalArrestos: cniData.baseDatos?.arrestos || 0
          }));
        }
      } else {
        console.warn('[CNI] Dashboard endpoint not available, using fallback');
        // Fallback a los endpoints individuales si el dashboard no está disponible
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
      }

      // Cargar DNIs registrados
      try {
        const dnisRes = await fetch(apiUrl('/api/proxy/admin/dni/search?q='));
        if (dnisRes.ok) {
          const dnisData = await dnisRes.json();
          setDatabaseStats(prev => ({
            ...prev,
            totalDNIs: dnisData.dniPorNombre?.length || 0
          }));
        }
      } catch (err) {
        console.error('Error cargando DNIs:', err);
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
            <img 
              src="https://i.imgur.com/4G56e8C.png" 
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
        <button 
          className={`cni-tab ${activeTab === 'business' ? 'active' : ''}`}
          onClick={() => setActiveTab('business')}
        >
          <FaBuilding /> Registros Empresariales
        </button>
      </div>

      <div className="cni-content">
        {activeTab === 'database' && <DatabaseTab stats={databaseStats} />}
        {activeTab === 'search' && <AdvancedSearchTab />}
        {activeTab === 'tracking' && <TrackingTab />}
        {activeTab === 'intelligence' && <IntelligenceTab />}
        {activeTab === 'surveillance' && <SurveillanceTab />}
        {activeTab === 'business' && <BusinessRecordsTab />}
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
        setSuccess('✅ Empresa registrada correctamente');
        setNewBusiness({ nombre: '', tipo: '', propietario: '', ubicacion: '', estado: 'activa', notas: '', agente_registro: '' });
        loadBusinesses();
        loadStats();
      } else {
        setError(`❌ Error: ${data.error}`);
      }
    } catch (err) {
      console.error('Error añadiendo empresa:', err);
      setError('❌ Error de conexión al registrar empresa');
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
        setSuccess('✅ Visita registrada correctamente');
        setNewVisit({ empresa_id: '', agente: '', fecha_visita: '', notas: '', estado: 'completada' });
        loadVisits();
        loadBusinesses();
        loadStats();
      } else {
        setError(`❌ Error: ${data.error}`);
      }
    } catch (err) {
      console.error('Error añadiendo visita:', err);
      setError('❌ Error de conexión al registrar visita');
    } finally {
      setLoading(false);
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
              <input
                type="text"
                value={newBusiness.agente_registro}
                onChange={(e) => setNewBusiness({...newBusiness, agente_registro: e.target.value})}
                className="cni-input"
                placeholder="Nombre del agente CNI"
              />
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
              <input
                type="text"
                value={newVisit.agente}
                onChange={(e) => setNewVisit({...newVisit, agente: e.target.value})}
                className="cni-input"
                required
              />
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
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CNISection;
