import React, { useState } from 'react';
import { 
  FaIdCard, FaMoneyBillWave, FaHistory, FaClipboardList, 
  FaSearch, FaGavel, FaLock, FaTrophy, FaEye, 
  FaEdit, FaTrash, FaCheckCircle, FaTimes, FaExclamationTriangle,
  FaUser, FaFileAlt, FaCarCrash, FaShieldAlt
} from 'react-icons/fa';
import { apiUrl } from '../../utils/api';

// Sección DNI
export const DNISection = ({ data }) => {
  if (!data) {
    return (
      <div className="mdt-section">
        <h3><FaIdCard /> Mi DNI</h3>
        <div className="mdt-no-data">
          <FaExclamationTriangle />
          <p>No tienes DNI registrado</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mdt-section">
      <h3><FaIdCard /> Mi DNI</h3>
      <div className="dni-card">
        <div className="dni-header">
          <h4>DNI {data.numero}</h4>
          <span className={`dni-status ${data.arrestado ? 'arrestado' : 'activo'}`}>
            {data.arrestado ? 'ARRESTADO' : 'ACTIVO'}
          </span>
        </div>
        <div className="dni-info">
          <div className="dni-field">
            <label>Nombre:</label>
            <span>{data.nombre}</span>
          </div>
          <div className="dni-field">
            <label>Apellidos:</label>
            <span>{data.apellidos}</span>
          </div>
          <div className="dni-field">
            <label>Fecha de Nacimiento:</label>
            <span>{data.fechaNacimiento}</span>
          </div>
          <div className="dni-field">
            <label>Nacionalidad:</label>
            <span>{data.nacionalidad}</span>
          </div>
          <div className="dni-field">
            <label>Dirección:</label>
            <span>{data.direccion}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Sección Multas
export const MultasSection = ({ data, userId, onRefresh }) => {
  const [paying, setPaying] = useState(null);

  const handlePayMulta = async (multaId) => {
    setPaying(multaId);
    try {
      const response = await fetch(apiUrl('/api/proxy/admin/pagar-multa'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ multaId, userId })
      });

      if (response.ok) {
        onRefresh();
      }
    } catch (err) {
      console.error('Error pagando multa:', err);
    } finally {
      setPaying(null);
    }
  };

  if (!data || data.length === 0) {
    return (
      <div className="mdt-section">
        <h3><FaMoneyBillWave /> Mis Multas</h3>
        <div className="mdt-no-data">
          <FaCheckCircle />
          <p>No tienes multas pendientes</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mdt-section">
      <h3><FaMoneyBillWave /> Mis Multas ({data.length})</h3>
      <div className="multas-list">
        {data.map((multa, index) => (
          <div key={index} className={`multa-card ${multa.pagada ? 'pagada' : 'pendiente'}`}>
            <div className="multa-header">
              <h4>Multa #{multa.id}</h4>
              <span className={`multa-status ${multa.pagada ? 'pagada' : 'pendiente'}`}>
                {multa.pagada ? 'PAGADA' : 'PENDIENTE'}
              </span>
            </div>
            <div className="multa-info">
              <div className="multa-field">
                <label>Motivo:</label>
                <span>{multa.motivo}</span>
              </div>
              <div className="multa-field">
                <label>Cantidad:</label>
                <span className="multa-amount">{multa.cantidad}€</span>
              </div>
              <div className="multa-field">
                <label>Fecha:</label>
                <span>{new Date(multa.fecha).toLocaleDateString()}</span>
              </div>
              {multa.descripcion && (
                <div className="multa-field">
                  <label>Descripción:</label>
                  <span>{multa.descripcion}</span>
                </div>
              )}
            </div>
            {!multa.pagada && (
              <button 
                className="mdt-btn mdt-btn-success"
                onClick={() => handlePayMulta(multa.id)}
                disabled={paying === multa.id}
              >
                {paying === multa.id ? 'Pagando...' : 'Pagar Multa'}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// Sección Antecedentes
export const AntecedentesSection = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="mdt-section">
        <h3><FaHistory /> Mis Antecedentes</h3>
        <div className="mdt-no-data">
          <FaCheckCircle />
          <p>No tienes antecedentes penales</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mdt-section">
      <h3><FaHistory /> Mis Antecedentes ({data.length})</h3>
      <div className="antecedentes-list">
        {data.map((antecedente, index) => (
          <div key={index} className="antecedente-card">
            <div className="antecedente-header">
              <h4>{antecedente.tipo}</h4>
              <span className="antecedente-fecha">
                {new Date(antecedente.fecha).toLocaleDateString()}
              </span>
            </div>
            <div className="antecedente-info">
              <div className="antecedente-field">
                <label>Descripción:</label>
                <span>{antecedente.descripcion}</span>
              </div>
              <div className="antecedente-field">
                <label>Gravedad:</label>
                <span className={`gravedad ${antecedente.gravedad?.toLowerCase()}`}>
                  {antecedente.gravedad}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Sección Inventario
export const InventarioSection = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="mdt-section">
        <h3><FaClipboardList /> Mi Inventario</h3>
        <div className="mdt-no-data">
          <FaExclamationTriangle />
          <p>No tienes objetos en tu inventario</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mdt-section">
      <h3><FaClipboardList /> Mi Inventario ({data.length})</h3>
      <div className="inventario-grid">
        {data.map((item, index) => (
          <div key={index} className="inventario-item">
            <div className="item-icon">
              <FaFileAlt />
            </div>
            <div className="item-info">
              <h4>{item.nombre}</h4>
              <p>Cantidad: {item.cantidad}</p>
              {item.descripcion && <p>{item.descripcion}</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Sección Búsqueda (Policía)
export const SearchSection = ({ onSearch }) => {
  const [searchType, setSearchType] = useState('discord');
  const [searchValue, setSearchValue] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchValue.trim()) return;

    setLoading(true);
    try {
      let url;
      if (searchType === 'discord') {
        url = `/api/proxy/admin/antecedentes/${searchValue}`;
      } else {
        url = `/api/proxy/admin/antecedentes/dni/${searchValue}`;
      }

      const response = await fetch(apiUrl(url));
      if (response.ok) {
        const data = await response.json();
        setResults(data);
      }
    } catch (err) {
      console.error('Error en búsqueda:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mdt-section">
      <h3><FaSearch /> Búsqueda de Ciudadanos</h3>
      
      <form onSubmit={handleSearch} className="search-form">
        <div className="search-inputs">
          <select 
            value={searchType} 
            onChange={(e) => setSearchType(e.target.value)}
            className="mdt-select"
          >
            <option value="discord">Discord ID</option>
            <option value="dni">DNI</option>
          </select>
          <input
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder={searchType === 'discord' ? 'Discord ID' : 'Número de DNI'}
            className="mdt-input"
            required
          />
          <button type="submit" className="mdt-btn mdt-btn-primary" disabled={loading}>
            {loading ? 'Buscando...' : 'Buscar'}
          </button>
        </div>
      </form>

      {results && (
        <div className="search-results">
          <h4>Resultados de la búsqueda:</h4>
          <div className="result-card">
            <div className="result-header">
              <h5>{results.nombre || 'Usuario encontrado'}</h5>
              <span className="result-type">{searchType.toUpperCase()}</span>
            </div>
            <div className="result-info">
              {results.antecedentes && (
                <div className="result-field">
                  <label>Antecedentes:</label>
                  <span>{results.antecedentes.length} registros</span>
                </div>
              )}
              {results.dni && (
                <div className="result-field">
                  <label>DNI:</label>
                  <span>{results.dni.numero}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Sección Multar (Policía)
export const MultarSection = ({ onRefresh }) => {
  const [formData, setFormData] = useState({
    discordId: '',
    motivo: '',
    cantidad: '',
    descripcion: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(apiUrl('/api/proxy/admin/multar'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        alert('Multa aplicada correctamente');
        setFormData({ discordId: '', motivo: '', cantidad: '', descripcion: '' });
        onRefresh();
      } else {
        alert('Error aplicando multa');
      }
    } catch (err) {
      console.error('Error multando:', err);
      alert('Error aplicando multa');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mdt-section">
      <h3><FaGavel /> Aplicar Multa</h3>
      
      <form onSubmit={handleSubmit} className="multa-form">
        <div className="form-group">
          <label>Discord ID del infractor:</label>
          <input
            type="text"
            value={formData.discordId}
            onChange={(e) => setFormData({...formData, discordId: e.target.value})}
            className="mdt-input"
            required
          />
        </div>
        
        <div className="form-group">
          <label>Motivo de la multa:</label>
          <input
            type="text"
            value={formData.motivo}
            onChange={(e) => setFormData({...formData, motivo: e.target.value})}
            className="mdt-input"
            required
          />
        </div>
        
        <div className="form-group">
          <label>Cantidad (€):</label>
          <input
            type="number"
            value={formData.cantidad}
            onChange={(e) => setFormData({...formData, cantidad: e.target.value})}
            className="mdt-input"
            min="1"
            required
          />
        </div>
        
        <div className="form-group">
          <label>Descripción (opcional):</label>
          <textarea
            value={formData.descripcion}
            onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
            className="mdt-textarea"
            rows="3"
          />
        </div>
        
        <button type="submit" className="mdt-btn mdt-btn-danger" disabled={loading}>
          {loading ? 'Aplicando...' : 'Aplicar Multa'}
        </button>
      </form>
    </div>
  );
};

// Sección Arrestar (Policía)
export const ArrestarSection = ({ onRefresh }) => {
  const [discordId, setDiscordId] = useState('');
  const [loading, setLoading] = useState(false);

  const handleArrest = async (e) => {
    e.preventDefault();
    if (!discordId.trim()) return;

    setLoading(true);
    try {
      const response = await fetch(apiUrl(`/api/proxy/admin/dni/arrestar/${discordId}`), {
        method: 'POST'
      });

      if (response.ok) {
        alert('DNI marcado como arrestado');
        setDiscordId('');
        onRefresh();
      } else {
        alert('Error marcando como arrestado');
      }
    } catch (err) {
      console.error('Error arrestando:', err);
      alert('Error marcando como arrestado');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mdt-section">
      <h3><FaLock /> Marcar como Arrestado</h3>
      
      <form onSubmit={handleArrest} className="arrest-form">
        <div className="form-group">
          <label>Discord ID del arrestado:</label>
          <input
            type="text"
            value={discordId}
            onChange={(e) => setDiscordId(e.target.value)}
            className="mdt-input"
            required
          />
        </div>
        
        <button type="submit" className="mdt-btn mdt-btn-danger" disabled={loading}>
          {loading ? 'Procesando...' : 'Marcar como Arrestado'}
        </button>
      </form>
    </div>
  );
};

// Sección Ranking (Policía)
export const RankingSection = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="mdt-section">
        <h3><FaTrophy /> Top Multas</h3>
        <div className="mdt-no-data">
          <FaExclamationTriangle />
          <p>No hay datos de multas disponibles</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mdt-section">
      <h3><FaTrophy /> Top Multas</h3>
      <div className="ranking-list">
        {data.map((user, index) => (
          <div key={index} className={`ranking-item ${index < 3 ? 'top' : ''}`}>
            <div className="ranking-position">
              {index === 0 && <FaTrophy className="gold" />}
              {index === 1 && <FaTrophy className="silver" />}
              {index === 2 && <FaTrophy className="bronze" />}
              {index > 2 && <span className="position">#{index + 1}</span>}
            </div>
            <div className="ranking-info">
              <h4>{user.username}</h4>
              <p>{user.totalMultas} multas - {user.totalCantidad}€</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
