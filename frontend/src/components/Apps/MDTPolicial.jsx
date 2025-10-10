import React, { useState, useEffect } from 'react';
import { 
  FaShieldAlt, FaUser, FaSearch, FaFileAlt, FaExclamationTriangle, 
  FaCheckCircle, FaTimes, FaEye, FaEdit, FaTrash, FaPlus, 
  FaCrown, FaGavel, FaIdCard, FaMoneyBillWave, FaList, 
  FaTrophy, FaLock, FaUnlock, FaCarCrash,
  FaUserShield, FaDatabase, FaClipboardList, FaHistory
} from 'react-icons/fa';
import { apiUrl } from '../../utils/api';
import './MDTPolicial.css';
import { 
  DNISection, MultasSection, AntecedentesSection, InventarioSection,
  SearchSection, MultarSection, ArrestarSection, RankingSection 
} from './MDTSections';
import CNISection from './CNISection';

const MDTPolicial = () => {
  const [user, setUser] = useState(null);
  const [isPolice, setIsPolice] = useState(false);
  const [isCNI, setIsCNI] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('citizen');
  const [error, setError] = useState(null);

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

  // Estados para formularios
  const [searchForm, setSearchForm] = useState({
    discordId: '',
    dni: ''
  });
  const [multaForm, setMultaForm] = useState({
    discordId: '',
    motivo: '',
    cantidad: '',
    descripcion: ''
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
          topMultas: topData, // Pasar toda la estructura de datos
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

  if (loading) {
    return (
      <div className="mdt-loading">
        <div className="mdt-spinner"></div>
        <h2>Verificando permisos...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mdt-error">
        <FaExclamationTriangle size={48} />
        <h2>Error de Acceso</h2>
        <p>{error}</p>
        <a href="/auth/login" className="mdt-btn mdt-btn-primary">
          Iniciar Sesión
        </a>
      </div>
    );
  }

  return (
    <div className="mdt-container">
      <div className="mdt-header">
        <div className="mdt-header-content">
          <div className="mdt-logo">
            <FaShieldAlt />
            <h1>MDT Policial</h1>
          </div>
          <div className="mdt-user-info">
            <span className="mdt-user-name">{user?.username}</span>
            {isPolice && <span className="mdt-police-badge">POLICÍA</span>}
          </div>
        </div>
      </div>

      <div className="mdt-tabs">
        <button 
          className={`mdt-tab ${activeTab === 'citizen' ? 'active' : ''}`}
          onClick={() => setActiveTab('citizen')}
        >
          <FaUser /> Ciudadano
        </button>
        {isPolice && (
          <button 
            className={`mdt-tab ${activeTab === 'police' ? 'active' : ''}`}
            onClick={() => setActiveTab('police')}
          >
            <FaShieldAlt /> Policía
          </button>
        )}
        {isCNI && (
          <button 
            className={`mdt-tab ${activeTab === 'cni' ? 'active' : ''}`}
            onClick={() => setActiveTab('cni')}
          >
            <FaEye /> CNI
          </button>
        )}
      </div>

      <div className="mdt-content">
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
    </div>
  );
};

// Panel de Ciudadano
const CitizenPanel = ({ data, onRefresh, userId }) => {
  const [activeSection, setActiveSection] = useState('dni');

  return (
    <div className="citizen-panel">
      <div className="citizen-nav">
        <button 
          className={`citizen-nav-btn ${activeSection === 'dni' ? 'active' : ''}`}
          onClick={() => setActiveSection('dni')}
        >
          <FaIdCard /> Mi DNI
        </button>
        <button 
          className={`citizen-nav-btn ${activeSection === 'multas' ? 'active' : ''}`}
          onClick={() => setActiveSection('multas')}
        >
          <FaMoneyBillWave /> Multas
        </button>
        <button 
          className={`citizen-nav-btn ${activeSection === 'antecedentes' ? 'active' : ''}`}
          onClick={() => setActiveSection('antecedentes')}
        >
          <FaHistory /> Antecedentes
        </button>
        <button 
          className={`citizen-nav-btn ${activeSection === 'inventario' ? 'active' : ''}`}
          onClick={() => setActiveSection('inventario')}
        >
          <FaClipboardList /> Inventario
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
      <div className="police-nav">
        <button 
          className={`police-nav-btn ${activeSection === 'search' ? 'active' : ''}`}
          onClick={() => setActiveSection('search')}
        >
          <FaSearch /> Buscar
        </button>
        <button 
          className={`police-nav-btn ${activeSection === 'multar' ? 'active' : ''}`}
          onClick={() => setActiveSection('multar')}
        >
          <FaGavel /> Multar
        </button>
        <button 
          className={`police-nav-btn ${activeSection === 'arrestar' ? 'active' : ''}`}
          onClick={() => setActiveSection('arrestar')}
        >
          <FaLock /> Arrestar
        </button>
        <button 
          className={`police-nav-btn ${activeSection === 'ranking' ? 'active' : ''}`}
          onClick={() => setActiveSection('ranking')}
        >
          <FaTrophy /> Ranking
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
