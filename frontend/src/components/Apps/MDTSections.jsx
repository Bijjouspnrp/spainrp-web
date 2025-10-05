import React, { useState } from 'react';
import { 
  FaIdCard, FaMoneyBillWave, FaHistory, FaClipboardList, 
  FaSearch, FaGavel, FaLock, FaTrophy, FaEye, 
  FaEdit, FaTrash, FaCheckCircle, FaTimes, FaExclamationTriangle,
  FaUser, FaFileAlt, FaCarCrash, FaShieldAlt, FaSpinner
} from 'react-icons/fa';
import { apiUrl } from '../../utils/api';
import codigoPenal from '../../utils/codigoPenal';

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
      <div className="dni-card-real">
        <div className="dni-header-real">
          <div className="dni-logo">
            <span className="dni-logo-text">ESPAÑA</span>
          </div>
          <div className="dni-title">
            <span className="dni-title-text">DOCUMENTO NACIONAL DE IDENTIDAD</span>
          </div>
        </div>
        
        <div className="dni-content">
          <div className="dni-photo-section">
            <div className="dni-photo-container">
              {dni.robloxAvatar ? (
                <img 
                  src={dni.robloxAvatar} 
                  alt="Foto DNI" 
                  className="dni-photo"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <div className="dni-photo-placeholder" style={{ display: dni.robloxAvatar ? 'none' : 'flex' }}>
                <FaUser size={40} />
              </div>
            </div>
            <div className="dni-number">
              <span className="dni-number-text">{dni.numeroDNI}</span>
            </div>
          </div>
          
          <div className="dni-info-real">
            <div className="dni-name-section">
              <div className="dni-name">
                <span className="dni-name-text">{dni.nombre} {dni.apellidos}</span>
              </div>
              <div className="dni-roblox">
                <span className="dni-roblox-text">Roblox: {dni.robloxUser || 'N/A'}</span>
              </div>
            </div>
            
            <div className="dni-details">
              <div className="dni-detail-row">
                <span className="dni-detail-label">NACIMIENTO:</span>
                <span className="dni-detail-value">{dni.fechaNacimiento}</span>
              </div>
              <div className="dni-detail-row">
                <span className="dni-detail-label">SEXO:</span>
                <span className="dni-detail-value">{dni.sexo}</span>
              </div>
              <div className="dni-detail-row">
                <span className="dni-detail-label">NACIONALIDAD:</span>
                <span className="dni-detail-value">{dni.nacionalidad}</span>
              </div>
              <div className="dni-detail-row">
                <span className="dni-detail-label">PROFESIÓN:</span>
                <span className="dni-detail-value">{dni.trabajo || 'N/A'}</span>
              </div>
            </div>
            
            <div className="dni-dates">
              <div className="dni-date-row">
                <span className="dni-date-label">EXPEDICIÓN:</span>
                <span className="dni-date-value">{dni.fechaEmision}</span>
              </div>
              <div className="dni-date-row">
                <span className="dni-date-label">VÁLIDO HASTA:</span>
                <span className="dni-date-value">{dni.caducidad}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="dni-footer">
          <div className={`dni-status-real ${dni.arrestado ? 'arrestado' : 'activo'}`}>
            {dni.arrestado ? 'ARRESTADO' : 'VÁLIDO'}
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
          <div key={antecedente.id || index} className="antecedente-card">
            <div className="antecedente-header">
              <h4>Antecedente #{antecedente.id || index + 1}</h4>
              <span className="antecedente-fecha">
                {antecedente.fecha ? (() => {
                  try {
                    const date = new Date(antecedente.fecha);
                    return isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    });
                  } catch {
                    return 'N/A';
                  }
                })() : 'N/A'}
              </span>
            </div>
            <div className="antecedente-info">
              <div className="antecedente-field">
                <label>DNI:</label>
                <span>{antecedente.dni || 'N/A'}</span>
              </div>
              <div className="antecedente-field">
                <label>Nombre:</label>
                <span>{antecedente.nombre} {antecedente.apellidos}</span>
              </div>
              <div className="antecedente-field">
                <label>Cargos:</label>
                <span className="cargos">{antecedente.cargos || 'N/A'}</span>
              </div>
              <div className="antecedente-field">
                <label>Multa:</label>
                <span className="multa-amount">{antecedente.multa || 0}€</span>
              </div>
              {antecedente.tiempoC && (
                <div className="antecedente-field">
                  <label>Tiempo Carcel:</label>
                  <span className="tiempo-carcel">{antecedente.tiempoC}</span>
                </div>
              )}
              {antecedente.tiempoOOC && (
                <div className="antecedente-field">
                  <label>Tiempo OOC:</label>
                  <span className="tiempo-ooc">{antecedente.tiempoOOC}</span>
                </div>
              )}
              {antecedente.tiempoIC && (
                <div className="antecedente-field">
                  <label>Tiempo IC:</label>
                  <span className="tiempo-ic">{antecedente.tiempoIC}</span>
                </div>
              )}
              {antecedente.fotoUrl && (
                <div className="antecedente-field">
                  <label>Foto:</label>
                  <img 
                    src={antecedente.fotoUrl} 
                    alt="Foto del antecedente" 
                    className="antecedente-foto"
                    onError={(e) => e.target.style.display = 'none'}
                  />
                </div>
              )}
              <div className="antecedente-field">
                <label>Oficial ID:</label>
                <span className="oficial-id">{antecedente.oficialId || 'N/A'}</span>
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
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchingSuggestions, setSearchingSuggestions] = useState(false);

  // Función para buscar sugerencias
  const searchSuggestions = async (query) => {
    if (query.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setSearchingSuggestions(true);
    try {
      const response = await fetch(apiUrl(`/api/proxy/admin/dni/search?q=${encodeURIComponent(query)}`));
      const data = await response.json();
      
      if (data.success) {
        const allSuggestions = [
          ...(data.dniPorNombre || []).map(dni => ({
            type: 'dni',
            value: dni.numeroDNI,
            label: `${dni.nombre} ${dni.apellidos} (DNI: ${dni.numeroDNI})`,
            discordId: dni.discordId
          })),
          ...(data.discordUsers || []).map(user => ({
            type: 'discord',
            value: user.id,
            label: `${user.username} (Discord: ${user.id})`,
            discordId: user.id
          }))
        ];
        setSuggestions(allSuggestions);
        setShowSuggestions(true);
      }
    } catch (err) {
      console.error('Error buscando sugerencias:', err);
    } finally {
      setSearchingSuggestions(false);
    }
  };

  // Manejar cambio en el input
  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchValue(value);
    setError('');
    
    if (searchType === 'nombre') {
      searchSuggestions(value);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  // Seleccionar sugerencia
  const selectSuggestion = (suggestion) => {
    setSearchValue(suggestion.value);
    setShowSuggestions(false);
    setSuggestions([]);
  };

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
      let discordId = searchValue;
      
      // Si buscan por DNI o nombre, primero obtener el Discord ID
      if (searchType === 'dni' || searchType === 'nombre') {
        let dniResponse;
        
        if (searchType === 'dni') {
          dniResponse = await fetch(apiUrl(`/api/proxy/admin/dni/ver/${searchValue}`));
        } else {
          // Para búsqueda por nombre, usar el endpoint de búsqueda
          const searchResponse = await fetch(apiUrl(`/api/proxy/admin/dni/search?q=${encodeURIComponent(searchValue)}`));
          const searchData = await searchResponse.json();
          
          if (searchData.success && searchData.dniPorNombre && searchData.dniPorNombre.length > 0) {
            // Usar el primer resultado encontrado
            const firstResult = searchData.dniPorNombre[0];
            discordId = firstResult.discordId;
          } else if (searchData.success && searchData.discordUsers && searchData.discordUsers.length > 0) {
            // Usar el primer usuario de Discord encontrado
            const firstUser = searchData.discordUsers[0];
            discordId = firstUser.id;
          } else {
            setError('❌ No se encontró ningún ciudadano con ese nombre');
            setLoading(false);
            return;
          }
        }
        
        if (searchType === 'dni' && dniResponse) {
          if (dniResponse.ok) {
            const dniData = await dniResponse.json();
            if (dniData.success && dniData.dni) {
              discordId = dniData.dni.discordId;
            } else {
              setError('❌ No se encontró DNI con ese número');
              setLoading(false);
              return;
            }
          } else {
            setError('❌ Error consultando DNI');
            setLoading(false);
            return;
          }
        }
      }

      // Consultar múltiples endpoints en paralelo
      const [antecedentesRes, multasRes, dniRes, inventarioRes] = await Promise.all([
        fetch(apiUrl(`/api/proxy/admin/antecedentes/${discordId}`)),
        fetch(apiUrl(`/api/proxy/admin/ver-multas/${discordId}`)),
        fetch(apiUrl(`/api/proxy/admin/dni/ver/${discordId}`)),
        fetch(apiUrl(`/api/proxy/admin/inventario/${discordId}`))
      ]);

      const [antecedentesData, multasData, dniData, inventarioData] = await Promise.all([
        antecedentesRes.json(),
        multasRes.json(),
        dniRes.json(),
        inventarioRes.json()
      ]);

      // Compilar resultados
      const searchResults = {
        discordId: discordId,
        searchValue: searchValue,
        searchType: searchType,
        dni: dniData.success ? dniData.dni : null,
        antecedentes: antecedentesData.success ? antecedentesData.antecedentes : [],
        multas: multasData.success ? multasData.multas : [],
        inventario: inventarioData.success ? inventarioData.inventario : [],
        hasData: false
      };

      // Verificar si hay algún dato
      if (searchResults.dni || 
          searchResults.antecedentes.length > 0 || 
          searchResults.multas.length > 0 || 
          searchResults.inventario.length > 0) {
        searchResults.hasData = true;
        setResults(searchResults);
      } else {
        setError('ℹ️ No se encontraron datos para este usuario');
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
            onChange={(e) => {
              setSearchType(e.target.value);
              setSearchValue('');
              setSuggestions([]);
              setShowSuggestions(false);
            }}
            className="mdt-select"
          >
            <option value="discord">Discord ID</option>
            <option value="dni">DNI</option>
            <option value="nombre">Nombre</option>
          </select>
          <div className="search-input-container">
            <input
              type="text"
              value={searchValue}
              onChange={handleInputChange}
              placeholder={
                searchType === 'discord' ? 'Discord ID' : 
                searchType === 'dni' ? 'Número de DNI' : 
                'Nombre de la persona'
              }
              className="mdt-input"
              required
              autoComplete="off"
            />
            {searchingSuggestions && (
              <div className="search-loading">
                <div className="search-spinner"></div>
              </div>
            )}
            {showSuggestions && suggestions.length > 0 && (
              <div className="suggestions-dropdown">
                {suggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className="suggestion-item"
                    onClick={() => selectSuggestion(suggestion)}
                  >
                    <span className="suggestion-type">
                      {suggestion.type === 'dni' ? '🆔' : '👤'}
                    </span>
                    <span className="suggestion-label">{suggestion.label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
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
          
          {/* Información del DNI */}
          {results.dni && (
            <div className="result-card dni-result">
              <div className="result-header">
                <h5><FaIdCard /> Datos del DNI</h5>
                <span className="result-type">DNI</span>
              </div>
              <div className="dni-info">
                <div className="dni-field">
                  <label>Número DNI:</label>
                  <span>{results.dni.numeroDNI}</span>
                </div>
                <div className="dni-field">
                  <label>Nombre:</label>
                  <span>{results.dni.nombre} {results.dni.apellidos}</span>
                </div>
                <div className="dni-field">
                  <label>Fecha Nacimiento:</label>
                  <span>{results.dni.fechaNacimiento}</span>
                </div>
                <div className="dni-field">
                  <label>Nacionalidad:</label>
                  <span>{results.dni.nacionalidad}</span>
                </div>
                <div className="dni-field">
                  <label>Trabajo:</label>
                  <span>{results.dni.trabajo || 'N/A'}</span>
                </div>
                <div className="dni-field">
                  <label>Estado:</label>
                  <span className={`dni-status ${results.dni.arrestado ? 'arrestado' : 'activo'}`}>
                    {results.dni.arrestado ? 'ARRESTADO' : 'ACTIVO'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Multas */}
          {results.multas && results.multas.length > 0 && (
            <div className="result-card multas-result">
              <div className="result-header">
                <h5><FaMoneyBillWave /> Multas ({results.multas.length})</h5>
                <span className="result-type">MULTAS</span>
              </div>
              <div className="multas-list">
                {results.multas.slice(0, 3).map((multa, index) => (
                  <div key={index} className="multa-item">
                    <div className="multa-info">
                      <span className="multa-amount">{multa.cantidad || multa.multa || 0}€</span>
                      <span className="multa-motivo">{multa.motivo || multa.cargos || 'N/A'}</span>
                      <span className={`multa-status ${multa.pagada ? 'pagada' : 'pendiente'}`}>
                        {multa.pagada ? 'PAGADA' : 'PENDIENTE'}
                      </span>
                    </div>
                  </div>
                ))}
                {results.multas.length > 3 && (
                  <div className="more-items">... y {results.multas.length - 3} multas más</div>
                )}
              </div>
            </div>
          )}

          {/* Antecedentes */}
          {results.antecedentes && results.antecedentes.length > 0 && (
            <div className="result-card antecedentes-result">
              <div className="result-header">
                <h5><FaHistory /> Antecedentes ({results.antecedentes.length})</h5>
                <span className="result-type">ANTECEDENTES</span>
              </div>
              <div className="antecedentes-list">
                {results.antecedentes.slice(0, 3).map((antecedente, index) => (
                  <div key={antecedente.id || index} className="antecedente-item">
                    <div className="antecedente-item-header">
                      <span className="antecedente-id">#{antecedente.id || index + 1}</span>
                      <span className="antecedente-fecha">
                        {antecedente.fecha ? (() => {
                          try {
                            const date = new Date(antecedente.fecha);
                            return isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString('es-ES');
                          } catch {
                            return 'N/A';
                          }
                        })() : 'N/A'}
                      </span>
                    </div>
                    <div className="antecedente-item-info">
                      <span className="antecedente-cargos">{antecedente.cargos || 'N/A'}</span>
                      <span className="antecedente-multa">{antecedente.multa || 0}€</span>
                      {antecedente.tiempoOOC && (
                        <span className="antecedente-tiempo-ooc">OOC: {antecedente.tiempoOOC}</span>
                      )}
                      {antecedente.tiempoIC && (
                        <span className="antecedente-tiempo-ic">IC: {antecedente.tiempoIC}</span>
                      )}
                    </div>
                  </div>
                ))}
                {results.antecedentes.length > 3 && (
                  <div className="more-items">... y {results.antecedentes.length - 3} antecedentes más</div>
                )}
              </div>
            </div>
          )}

          {/* Inventario */}
          {results.inventario && results.inventario.length > 0 && (
            <div className="result-card inventario-result">
              <div className="result-header">
                <h5><FaClipboardList /> Inventario ({results.inventario.length})</h5>
                <span className="result-type">INVENTARIO</span>
              </div>
              <div className="inventario-list">
                {results.inventario.slice(0, 5).map((item, index) => (
                  <div key={index} className="inventario-item">
                    <span className="item-name">{item.nombre || 'Objeto'}</span>
                    <span className="item-quantity">x{item.cantidad || 1}</span>
                  </div>
                ))}
                {results.inventario.length > 5 && (
                  <div className="more-items">... y {results.inventario.length - 5} objetos más</div>
                )}
              </div>
            </div>
          )}

          {/* Resumen */}
          <div className="result-card summary-result">
            <div className="result-header">
              <h5>Resumen de Búsqueda</h5>
              <span className="status-success">✅ Usuario localizado</span>
            </div>
            <div className="summary-info">
              <div className="summary-field">
                <label>Discord ID:</label>
                <span>{results.discordId}</span>
              </div>
              <div className="summary-field">
                <label>Búsqueda por:</label>
                <span>{results.searchType.toUpperCase()}: {results.searchValue}</span>
              </div>
              <div className="summary-field">
                <label>Datos encontrados:</label>
                <span>
                  {results.dni ? 'DNI ' : ''}
                  {results.multas.length > 0 ? `${results.multas.length} multas ` : ''}
                  {results.antecedentes.length > 0 ? `${results.antecedentes.length} antecedentes ` : ''}
                  {results.inventario.length > 0 ? `${results.inventario.length} objetos` : ''}
                </span>
              </div>
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
  const [formData, setFormData] = useState({
    discordId: '',
    cargos: '',
    oficialId: '',
    fotoUrl: ''
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [arrestResult, setArrestResult] = useState(null);
  
  // Estados para autocompletado
  const [cargosSuggestions, setCargosSuggestions] = useState([]);
  const [showCargosSuggestions, setShowCargosSuggestions] = useState(false);
  const [discordSuggestions, setDiscordSuggestions] = useState([]);
  const [showDiscordSuggestions, setShowDiscordSuggestions] = useState(false);
  const [searchingDiscord, setSearchingDiscord] = useState(false);
  const [selectedCargos, setSelectedCargos] = useState([]);
  const [cargosInput, setCargosInput] = useState('');

  const handleArrest = async (e) => {
    e.preventDefault();
    
    // Validar datos
    if (!formData.discordId.trim() || !formData.cargos.trim() || !formData.oficialId.trim()) {
      setResult('❌ Discord ID, cargos y oficial ID son obligatorios');
      return;
    }

    setLoading(true);
    setResult('');
    setArrestResult(null);

    try {
      const response = await fetch(apiUrl('/api/proxy/admin/arrestar'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          discordId: formData.discordId.trim(),
          cargos: formData.cargos.trim(),
          oficialId: formData.oficialId.trim(),
          fotoUrl: formData.fotoUrl.trim() || undefined
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setResult('✅ Arresto procesado correctamente');
        setArrestResult(data);
        setFormData({ discordId: '', cargos: '', oficialId: '', fotoUrl: '' });
        setSelectedCargos([]);
        setCargosInput('');
        onRefresh();
      } else {
        setResult(`❌ Error: ${data.error || 'Error procesando arresto'}`);
      }
    } catch (err) {
      console.error('Error procesando arresto:', err);
      setResult('❌ Error de conexión al procesar arresto');
    } finally {
      setLoading(false);
    }
  };

  // Función para buscar cargos
  const handleCargosChange = (value) => {
    setCargosInput(value);
    
    if (value.length > 0) {
      const suggestions = Object.entries(codigoPenal)
        .filter(([codigo, data]) => 
          codigo.toLowerCase().includes(value.toLowerCase()) ||
          data.nombre.toLowerCase().includes(value.toLowerCase())
        )
        .slice(0, 10)
        .map(([codigo, data]) => ({
          codigo,
          nombre: data.nombre,
          multa: data.multa,
          tipo: data.tipo
        }));
      
      setCargosSuggestions(suggestions);
      setShowCargosSuggestions(true);
    } else {
      setShowCargosSuggestions(false);
    }
  };

  // Función para seleccionar un cargo
  const selectCargo = (cargo) => {
    if (!selectedCargos.find(c => c.codigo === cargo.codigo)) {
      const newSelectedCargos = [...selectedCargos, cargo];
      setSelectedCargos(newSelectedCargos);
      
      // Actualizar el formData con los códigos separados por comas
      const cargosString = newSelectedCargos.map(c => c.codigo).join(',');
      setFormData({...formData, cargos: cargosString});
    }
    
    setCargosInput('');
    setShowCargosSuggestions(false);
  };

  // Función para eliminar un cargo seleccionado
  const removeCargo = (codigo) => {
    const newSelectedCargos = selectedCargos.filter(c => c.codigo !== codigo);
    setSelectedCargos(newSelectedCargos);
    
    // Actualizar el formData
    const cargosString = newSelectedCargos.map(c => c.codigo).join(',');
    setFormData({...formData, cargos: cargosString});
  };

  // Función para buscar usuarios de Discord
  const handleDiscordChange = async (value) => {
    setFormData({...formData, discordId: value});
    
    if (value.length >= 3) {
      setSearchingDiscord(true);
      try {
        // Buscar usuarios en el servidor Discord (sin autenticación requerida)
        const response = await fetch(apiUrl(`/api/discord/search-users?q=${encodeURIComponent(value)}`), {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          const users = await response.json();
          setDiscordSuggestions(users.slice(0, 5));
          setShowDiscordSuggestions(true);
        } else {
          console.warn('Error en búsqueda de usuarios:', response.status);
          // Fallback: crear sugerencias básicas basadas en el input
          const basicSuggestions = [
            {
              id: value,
              username: `Usuario_${value}`,
              avatar: null,
              displayName: `Usuario ${value}`
            }
          ];
          setDiscordSuggestions(basicSuggestions);
          setShowDiscordSuggestions(true);
        }
      } catch (err) {
        console.error('Error buscando usuarios:', err);
        // Fallback en caso de error de red
        const basicSuggestions = [
          {
            id: value,
            username: `Usuario_${value}`,
            avatar: null,
            displayName: `Usuario ${value}`
          }
        ];
        setDiscordSuggestions(basicSuggestions);
        setShowDiscordSuggestions(true);
      } finally {
        setSearchingDiscord(false);
      }
    } else {
      setShowDiscordSuggestions(false);
    }
  };


  // Función para seleccionar usuario Discord
  const selectDiscordUser = (user) => {
    setFormData({...formData, discordId: user.id});
    setShowDiscordSuggestions(false);
  };

  return (
    <div className="mdt-section">
      <h3><FaLock /> Procesar Arresto</h3>
      
      <form onSubmit={handleArrest} className="arrest-form">
        <div className="form-group">
          <label>Discord ID del arrestado:</label>
          <div className="autocomplete-container">
            <input
              type="text"
              value={formData.discordId}
              onChange={(e) => handleDiscordChange(e.target.value)}
              className="mdt-input"
              placeholder="123456789012345678 o busca por nombre"
              required
            />
            {searchingDiscord && <FaSpinner className="fa-spin search-spinner" />}
            {showDiscordSuggestions && discordSuggestions.length > 0 && (
              <div className="autocomplete-suggestions">
                {discordSuggestions.map((user, index) => (
                  <div
                    key={index}
                    className="suggestion-item"
                    onClick={() => selectDiscordUser(user)}
                  >
                    <div className="suggestion-avatar">
                      <img src={user.avatar ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png` : '/assets/spainrplogo.png'} alt="Avatar" />
                    </div>
                    <div className="suggestion-info">
                      <div className="suggestion-name">{user.username}</div>
                      <div className="suggestion-id">ID: {user.id}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        <div className="form-group">
          <label>Cargos *</label>
          <div className="form-help">Busca y selecciona cargos del código penal</div>
          
          {/* Cargos seleccionados */}
          {selectedCargos.length > 0 && (
            <div className="selected-cargos">
              {selectedCargos.map((cargo, index) => (
                <div key={index} className="cargo-chip">
                  <span className="cargo-chip-text">
                    <strong>{cargo.codigo}</strong> - {cargo.nombre}
                  </span>
                  <button
                    type="button"
                    className="cargo-chip-remove"
                    onClick={() => removeCargo(cargo.codigo)}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
          
          {/* Input de búsqueda */}
          <div className="autocomplete-container">
            <input
              type="text"
              value={cargosInput}
              onChange={(e) => handleCargosChange(e.target.value)}
              className="mdt-input"
              placeholder="Busca por código o nombre del cargo..."
            />
            
            {showCargosSuggestions && cargosSuggestions.length > 0 && (
              <div className="autocomplete-suggestions">
                {cargosSuggestions.map((cargo, index) => (
                  <div
                    key={index}
                    className="suggestion-item"
                    onClick={() => selectCargo(cargo)}
                  >
                    <div className="suggestion-info">
                      <div className="suggestion-name">
                        <strong>{cargo.codigo}</strong> - {cargo.nombre}
                      </div>
                      <div className="suggestion-details">
                        {cargo.multa}€ • {cargo.tipo}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        <div className="form-group">
          <label>ID del oficial:</label>
          <input
            type="text"
            value={formData.oficialId}
            onChange={(e) => setFormData({...formData, oficialId: e.target.value})}
            className="mdt-input"
            placeholder="987654321098765432"
            required
          />
        </div>
        
        <div className="form-group">
          <label>URL de foto (opcional):</label>
          <input
            type="url"
            value={formData.fotoUrl}
            onChange={(e) => setFormData({...formData, fotoUrl: e.target.value})}
            className="mdt-input"
            placeholder="https://ejemplo.com/foto.jpg"
          />
        </div>
        
        <button type="submit" className="mdt-btn mdt-btn-danger" disabled={loading}>
          {loading ? 'Procesando...' : 'Procesar Arresto'}
        </button>
      </form>

      {result && (
        <div className={`result-message ${result.startsWith('✅') ? 'success' : 'error'}`}>
          {result}
        </div>
      )}

      {arrestResult && (
        <div className="arrest-result">
          <h4>📋 Resumen del Arresto Procesado</h4>
          
          {/* Información del arrestado */}
          <div className="arrest-section">
            <h5>👤 Información del Arrestado</h5>
            <div className="arrest-details">
              <div className="arrest-field">
                <label>Nombre Completo:</label>
                <span className="arrest-value">{arrestResult.nombre} {arrestResult.apellidos || ''}</span>
              </div>
              <div className="arrest-field">
                <label>DNI:</label>
                <span className="arrest-value">{arrestResult.dni}</span>
              </div>
              <div className="arrest-field">
                <label>Usuario Roblox:</label>
                <span className="arrest-value">{arrestResult.roblox || 'No verificado'}</span>
              </div>
              <div className="arrest-field">
                <label>Discord ID:</label>
                <span className="arrest-value discord-id">{arrestResult.discordId}</span>
              </div>
            </div>
          </div>

          {/* Cargos y sanciones */}
          <div className="arrest-section">
            <h5>⚖️ Cargos y Sanciones</h5>
            <div className="cargos-summary">
              <div className="cargos-detail" dangerouslySetInnerHTML={{ __html: arrestResult.cargos }} />
            </div>
            <div className="sanciones-grid">
              <div className="sancion-item multa">
                <div className="sancion-icon">💰</div>
                <div className="sancion-info">
                  <div className="sancion-label">Multa Total</div>
                  <div className="sancion-value">{arrestResult.multaTotal}€</div>
                </div>
              </div>
              <div className="sancion-item tiempo-ic">
                <div className="sancion-icon">⏰</div>
                <div className="sancion-info">
                  <div className="sancion-label">Tiempo IC</div>
                  <div className="sancion-value">{arrestResult.tiempoIC}</div>
                </div>
              </div>
              <div className="sancion-item tiempo-ooc">
                <div className="sancion-icon">🕐</div>
                <div className="sancion-info">
                  <div className="sancion-label">Tiempo OOC</div>
                  <div className="sancion-value">{arrestResult.tiempoOOC}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Información del proceso */}
          <div className="arrest-section">
            <h5>📝 Información del Proceso</h5>
            <div className="arrest-details">
              <div className="arrest-field">
                <label>Oficial Responsable:</label>
                <span className="arrest-value">{arrestResult.oficialId}</span>
              </div>
              <div className="arrest-field">
                <label>Fecha y Hora:</label>
                <span className="arrest-value">{new Date(arrestResult.fecha).toLocaleString('es-ES', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}</span>
              </div>
              {arrestResult.fotoUrl && (
                <div className="arrest-field">
                  <label>Foto del Arresto:</label>
                  <div className="foto-container">
                    <img src={arrestResult.fotoUrl} alt="Foto del arresto" className="arrest-foto" />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Estado del proceso */}
          <div className="arrest-status">
            <div className="status-success">
              <FaCheckCircle className="status-icon" />
              <span>Arresto registrado exitosamente en la base de datos</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Sección Ranking (Policía)
export const RankingSection = ({ data, message }) => {
  const [activeTab, setActiveTab] = useState('importe');
  const [userData, setUserData] = useState({});
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Función para obtener datos de usuarios de Discord
  const fetchUserData = async (discordIds) => {
    if (discordIds.length === 0) return;
    
    setLoadingUsers(true);
    try {
      // Hacer múltiples requests en paralelo para obtener datos de usuarios
      const userPromises = discordIds.map(async (discordId) => {
        try {
          const response = await fetch(apiUrl(`/api/discord/search-users?q=${discordId}`));
          if (response.ok) {
            const users = await response.json();
            const user = users.find(u => u.id === discordId);
            return { discordId, user: user || null };
          }
        } catch (err) {
          console.warn(`Error obteniendo datos para ${discordId}:`, err);
        }
        return { discordId, user: null };
      });

      const results = await Promise.all(userPromises);
      const userDataMap = {};
      results.forEach(({ discordId, user }) => {
        userDataMap[discordId] = user;
      });
      
      setUserData(userDataMap);
    } catch (err) {
      console.error('Error obteniendo datos de usuarios:', err);
    } finally {
      setLoadingUsers(false);
    }
  };

  // Obtener datos de usuarios cuando cambien los datos del ranking
  React.useEffect(() => {
    if (data?.top?.porImportePendiente || data?.top?.porNumeroPendientes) {
      const allDiscordIds = [
        ...(data.top?.porImportePendiente || []).map(u => u.discordId),
        ...(data.top?.porNumeroPendientes || []).map(u => u.discordId)
      ];
      
      // Eliminar duplicados
      const uniqueIds = [...new Set(allDiscordIds)];
      fetchUserData(uniqueIds);
    }
  }, [data]);

  if (!data || (!data.top?.porImportePendiente && !data.top?.porNumeroPendientes)) {
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

  const renderRankingList = (rankingData, title, subtitle) => (
    <div className="ranking-tab-content">
      <div className="ranking-header">
        <h4>{title}</h4>
        <p className="ranking-subtitle">{subtitle}</p>
        {loadingUsers && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
            <FaSpinner className="fa-spin" />
            <span style={{ fontSize: '0.9rem', color: '#9ca3af' }}>Cargando datos de usuarios...</span>
          </div>
        )}
      </div>
      <div className="ranking-list">
        {rankingData.map((user, index) => {
          const userInfo = userData[user.discordId];
          const username = userInfo?.username || userInfo?.displayName || `Usuario_${user.discordId?.slice(-4)}`;
          const avatarUrl = userInfo?.avatar 
            ? `https://cdn.discordapp.com/avatars/${user.discordId}/${userInfo.avatar}.png`
            : `https://cdn.discordapp.com/avatars/${user.discordId}/default.png`;
          
          return (
            <div key={user.discordId || index} className={`ranking-item ${index < 3 ? 'top' : ''}`}>
              <div className="ranking-position">
                {index === 0 && <FaTrophy className="gold" />}
                {index === 1 && <FaTrophy className="silver" />}
                {index === 2 && <FaTrophy className="bronze" />}
                {index > 2 && <span className="position">#{user.posicion || index + 1}</span>}
              </div>
              <div className="ranking-avatar">
                <img 
                  src={avatarUrl}
                  alt={`Avatar de ${username}`}
                  className="ranking-avatar-img"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
                <div className="ranking-avatar-placeholder" style={{display: 'none'}}>
                  <FaUser size={20} />
                </div>
              </div>
               <div className="ranking-info">
                 <h4>{username}</h4>
                 <p className="ranking-discord-id">ID: {user.discordId}</p>
                 <p className="ranking-stats">
                   {user.numPendientes || 0} multas pendientes<br/>
                   {(user.importePendiente || 0).toLocaleString('es-ES')}€ pendiente
                 </p>
               </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="mdt-section">
      <h3><FaTrophy /> Top Multas</h3>
      
      {/* Estadísticas generales */}
      {data.stats && (
        <div className="ranking-stats-overview">
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-label">Total Usuarios</span>
              <span className="stat-value">{data.stats.totalUsuarios}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Total Multas</span>
              <span className="stat-value">{data.stats.totalMultas}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Pendiente</span>
              <span className="stat-value">{data.stats.totalPendiente}€</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Pagado</span>
              <span className="stat-value">{data.stats.totalPagado}€</span>
            </div>
          </div>
        </div>
      )}

      {/* Tabs de ranking */}
      <div className="ranking-tabs">
        <button 
          className={`ranking-tab ${activeTab === 'importe' ? 'active' : ''}`}
          onClick={() => setActiveTab('importe')}
        >
          Por Importe Pendiente
        </button>
        <button 
          className={`ranking-tab ${activeTab === 'numero' ? 'active' : ''}`}
          onClick={() => setActiveTab('numero')}
        >
          Por Número de Multas
        </button>
      </div>

      {/* Contenido del ranking */}
      {activeTab === 'importe' && data.top?.porImportePendiente && 
        renderRankingList(
          data.top.porImportePendiente, 
          "Top por Importe Pendiente", 
          "Usuarios con mayor cantidad de dinero pendiente de pago"
        )
      }
      
      {activeTab === 'numero' && data.top?.porNumeroPendientes && 
        renderRankingList(
          data.top.porNumeroPendientes, 
          "Top por Número de Multas", 
          "Usuarios con mayor cantidad de multas pendientes"
        )
      }
    </div>
  );
};
