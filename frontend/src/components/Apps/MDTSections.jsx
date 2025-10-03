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
  if (!data || !data.dni) {
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

  const dni = data.dni;

  return (
    <div className="mdt-section">
      <h3><FaIdCard /> Mi DNI</h3>
      <div className="dni-card">
        <div className="dni-header">
          <h4>DNI {dni.numeroDNI}</h4>
          <span className={`dni-status ${dni.arrestado ? 'arrestado' : 'activo'}`}>
            {dni.arrestado ? 'ARRESTADO' : 'ACTIVO'}
          </span>
        </div>
        <div className="dni-info">
          <div className="dni-field">
            <label>Nombre:</label>
            <span>{dni.nombre}</span>
          </div>
          <div className="dni-field">
            <label>Apellidos:</label>
            <span>{dni.apellidos}</span>
          </div>
          <div className="dni-field">
            <label>Fecha de Nacimiento:</label>
            <span>{dni.fechaNacimiento}</span>
          </div>
          <div className="dni-field">
            <label>Sexo:</label>
            <span>{dni.sexo}</span>
          </div>
          <div className="dni-field">
            <label>Nacionalidad:</label>
            <span>{dni.nacionalidad}</span>
          </div>
          <div className="dni-field">
            <label>Dirección:</label>
            <span>{dni.direccion || 'N/A'}</span>
          </div>
          <div className="dni-field">
            <label>Trabajo:</label>
            <span>{dni.trabajo || 'N/A'}</span>
          </div>
          <div className="dni-field">
            <label>Altura:</label>
            <span>{dni.altura || 'N/A'}</span>
          </div>
          <div className="dni-field">
            <label>Color de Ojos:</label>
            <span>{dni.colorOjos || 'N/A'}</span>
          </div>
          <div className="dni-field">
            <label>Color de Pelo:</label>
            <span>{dni.colorPelo || 'N/A'}</span>
          </div>
          <div className="dni-field">
            <label>Fecha de Emisión:</label>
            <span>{dni.fechaEmision}</span>
          </div>
          <div className="dni-field">
            <label>Caducidad:</label>
            <span>{dni.caducidad}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Sección Multas
export const MultasSection = ({ data, userId, onRefresh }) => {
  const [paying, setPaying] = useState(null);
  const [result, setResult] = useState('');

  const handlePayMulta = async (multaId) => {
    setPaying(multaId);
    setResult('');
    
    try {
      const response = await fetch(apiUrl('/api/proxy/admin/pagar-multa'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ multaId, discordId: userId })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setResult('✅ Multa pagada correctamente');
        onRefresh();
      } else {
        setResult(`❌ Error: ${data.error || 'Error pagando multa'}`);
      }
    } catch (err) {
      console.error('Error pagando multa:', err);
      setResult('❌ Error de conexión al pagar multa');
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
              <h4>Multa #{multa.id || multa._id || `#${index + 1}`}</h4>
              <span className={`multa-status ${multa.pagada ? 'pagada' : 'pendiente'}`}>
                {multa.pagada ? 'PAGADA' : 'PENDIENTE'}
              </span>
            </div>
            <div className="multa-info">
              <div className="multa-field">
                <label>Motivo:</label>
                <span>{multa.motivo || multa.cargos || 'N/A'}</span>
              </div>
              <div className="multa-field">
                <label>Cantidad:</label>
                <span className="multa-amount">{multa.cantidad || multa.multa || 0}€</span>
              </div>
              <div className="multa-field">
                <label>Fecha:</label>
                <span>{multa.fecha ? (() => {
                  try {
                    const date = new Date(multa.fecha);
                    return isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString();
                  } catch {
                    return 'N/A';
                  }
                })() : 'N/A'}</span>
              </div>
              {multa.descripcion && (
                <div className="multa-field">
                  <label>Descripción:</label>
                  <span>{multa.descripcion}</span>
                </div>
              )}
              {multa.tiempoOOC && (
                <div className="multa-field">
                  <label>Tiempo OOC:</label>
                  <span>{multa.tiempoOOC}</span>
                </div>
              )}
              {multa.tiempoIC && (
                <div className="multa-field">
                  <label>Tiempo IC:</label>
                  <span>{multa.tiempoIC}</span>
                </div>
              )}
            </div>
            {!multa.pagada && (
              <button 
                className="mdt-btn mdt-btn-success"
                onClick={() => handlePayMulta(multa.id || multa._id)}
                disabled={paying === (multa.id || multa._id)}
              >
                {paying === (multa.id || multa._id) ? 'Pagando...' : 'Pagar Multa'}
              </button>
            )}
          </div>
        ))}
      </div>

      {result && (
        <div className={`result-message ${result.startsWith('✅') ? 'success' : 'error'}`}>
          {result}
        </div>
      )}
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
                {antecedente.fecha ? (() => {
                  try {
                    const date = new Date(antecedente.fecha);
                    return isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString();
                  } catch {
                    return 'N/A';
                  }
                })() : 'N/A'}
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
  const [error, setError] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchValue.trim()) {
      setError('❌ Debes ingresar un valor para buscar');
      return;
    }

    setLoading(true);
    setError('');
    setResults(null);

    try {
      let url;
      if (searchType === 'discord') {
        url = `/api/proxy/admin/antecedentes/${searchValue}`;
      } else {
        url = `/api/proxy/admin/antecedentes/dni/${searchValue}`;
      }

      const response = await fetch(apiUrl(url));
      const data = await response.json();

      if (response.ok) {
        if (data.success && data.antecedentes && data.antecedentes.length > 0) {
          setResults(data);
        } else {
          setError('ℹ️ No se encontraron antecedentes para este usuario');
        }
      } else {
        setError(`❌ Error en la búsqueda: ${data.error || 'Error desconocido'}`);
      }
    } catch (err) {
      console.error('Error en búsqueda:', err);
      setError('❌ Error de conexión en la búsqueda');
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

      {error && (
        <div className="search-error">
          <p>{error}</p>
        </div>
      )}

      {results && (
        <div className="search-results">
          <h4>Resultados de la búsqueda:</h4>
          <div className="result-card">
            <div className="result-header">
              <h5>Usuario encontrado</h5>
              <span className="result-type">{searchType.toUpperCase()}</span>
            </div>
            <div className="result-info">
              <div className="result-field">
                <label>ID consultado:</label>
                <span>{searchValue}</span>
              </div>
              <div className="result-field">
                <label>Antecedentes encontrados:</label>
                <span>{results.antecedentes ? results.antecedentes.length : 0} registros</span>
              </div>
              <div className="result-field">
                <label>Estado:</label>
                <span className="status-success">✅ Usuario localizado</span>
              </div>
            </div>
            {results.antecedentes && results.antecedentes.length > 0 && (
              <div className="antecedentes-details">
                <h6>Detalles de antecedentes:</h6>
                <ul>
                  {results.antecedentes.slice(0, 3).map((antecedente, index) => (
                    <li key={index}>
                      <strong>{antecedente.tipo || 'Antecedente'}:</strong> {antecedente.descripcion || 'Sin descripción'}
                    </li>
                  ))}
                  {results.antecedentes.length > 3 && (
                    <li>... y {results.antecedentes.length - 3} más</li>
                  )}
                </ul>
              </div>
            )}
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
  const [result, setResult] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult('');

    // Validar datos
    if (!formData.discordId.trim() || !formData.motivo.trim() || !formData.cantidad) {
      setResult('❌ Todos los campos son obligatorios');
      setLoading(false);
      return;
    }

    const cantidad = parseFloat(formData.cantidad);
    if (isNaN(cantidad) || cantidad <= 0) {
      setResult('❌ La cantidad debe ser un número válido mayor a 0');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(apiUrl('/api/proxy/admin/multar'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          discordId: formData.discordId.trim(),
          motivo: formData.motivo.trim(),
          cantidad: cantidad,
          agente: 'MDT Policial' // Agregar agente requerido
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setResult('✅ Multa aplicada correctamente');
        setFormData({ discordId: '', motivo: '', cantidad: '', descripcion: '' });
        onRefresh();
      } else {
        setResult(`❌ Error: ${data.error || 'Error aplicando multa'}`);
      }
    } catch (err) {
      console.error('Error multando:', err);
      setResult('❌ Error de conexión al aplicar multa');
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

      {result && (
        <div className={`result-message ${result.startsWith('✅') ? 'success' : 'error'}`}>
          {result}
        </div>
      )}
    </div>
  );
};

// Sección Arrestar (Policía)
export const ArrestarSection = ({ onRefresh }) => {
  const [discordId, setDiscordId] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');

  const handleArrest = async (e) => {
    e.preventDefault();
    if (!discordId.trim()) {
      setResult('❌ Debes ingresar un Discord ID');
      return;
    }

    setLoading(true);
    setResult('');

    try {
      const response = await fetch(apiUrl(`/api/proxy/admin/dni/arrestar/${discordId}`), {
        method: 'POST'
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setResult('✅ DNI marcado como arrestado correctamente');
        setDiscordId('');
        onRefresh();
      } else {
        setResult(`❌ Error: ${data.error || 'Error marcando como arrestado'}`);
      }
    } catch (err) {
      console.error('Error arrestando:', err);
      setResult('❌ Error de conexión al marcar como arrestado');
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

      {result && (
        <div className={`result-message ${result.startsWith('✅') ? 'success' : 'error'}`}>
          {result}
        </div>
      )}
    </div>
  );
};

// Sección Ranking (Policía)
export const RankingSection = ({ data, message }) => {
  if (!data || data.length === 0) {
    return (
      <div className="mdt-section">
        <h3><FaTrophy /> Top Multas</h3>
        <div className="mdt-no-data">
          <FaExclamationTriangle />
          <p>No hay datos de multas disponibles</p>
          {message && (
            <p className="ranking-message">{message}</p>
          )}
          {!message && (
            <p className="ranking-message">El ranking se actualiza automáticamente cuando hay multas registradas</p>
          )}
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
