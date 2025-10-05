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
          <div key={user.discordId || index} className={`ranking-item ${index < 3 ? 'top' : ''}`}>
            <div className="ranking-position">
              {index === 0 && <FaTrophy className="gold" />}
              {index === 1 && <FaTrophy className="silver" />}
              {index === 2 && <FaTrophy className="bronze" />}
              {index > 2 && <span className="position">#{user.position || index + 1}</span>}
            </div>
            <div className="ranking-avatar">
              {user.displayAvatarURL ? (
                <img 
                  src={user.displayAvatarURL} 
                  alt={`Avatar de ${user.username}`}
                  className="ranking-avatar-img"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <div className="ranking-avatar-placeholder" style={{ display: user.displayAvatarURL ? 'none' : 'flex' }}>
                <FaUser size={20} />
              </div>
            </div>
            <div className="ranking-info">
              <h4>{user.username || `Usuario ${user.discordId?.slice(-4) || 'N/A'}`}</h4>
              <p className="ranking-discord-id">ID: {user.discordId}</p>
              <p className="ranking-stats">
                {user.totalMultas || user.total || 0} multas - {user.totalCantidad || 0}€
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
