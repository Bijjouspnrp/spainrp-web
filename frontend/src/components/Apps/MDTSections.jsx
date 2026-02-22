import React, { useState } from 'react';
import { 
  FaIdCard, FaMoneyBillWave, FaHistory, FaClipboardList, 
  FaSearch, FaGavel, FaLock, FaTrophy, FaEye, 
  FaEdit, FaTrash, FaCheckCircle, FaTimes, FaExclamationTriangle,
  FaUser, FaFileAlt, FaCarCrash, FaShieldAlt, FaSpinner
} from 'react-icons/fa';
import { apiUrl } from '../../utils/api';
import codigoPenal from '../../utils/codigoPenal';

// Sección DNI - Reformada completamente
export const DNISection = ({ data }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

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

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'activo':
        return 'activo';
      case 'arrestado':
        return 'arrestado';
      default:
        return 'activo';
    }
  };

  return (
    <div className="mdt-section">
      <div className="dni-section-header">
        <h3><FaIdCard /> Mi DNI</h3>
        <div className="dni-controls">
          <button 
            className="dni-flip-btn"
            onClick={handleFlip}
            title={isFlipped ? "Ver frente" : "Ver reverso"}
          >
            <FaEye />
            {isFlipped ? "Frente" : "Reverso"}
          </button>
        </div>
      </div>
      
      <div className="dni-container">
        <div 
          className={`dni-card-interactive ${isFlipped ? 'flipped' : ''} ${isHovered ? 'hovered' : ''}`}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Frente del DNI */}
          <div className="dni-card-front">
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
                
                <div className="dni-details-scrollable">
                  <div className="dni-details">
                    <div className="dni-detail-row">
                      <span className="dni-detail-label">NACIMIENTO:</span>
                      <span className="dni-detail-value">{dni.fechaNacimiento}</span>
                    </div>
                    <div className="dni-detail-row">
                      <span className="dni-detail-label">LUGAR NAC:</span>
                      <span className="dni-detail-value">{dni.lugarNacimiento || 'N/A'}</span>
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
                      <span className="dni-detail-label">ESTADO CIVIL:</span>
                      <span className="dni-detail-value">{dni.estadoCivil || 'Soltero/a'}</span>
                    </div>
                    <div className="dni-detail-row">
                      <span className="dni-detail-label">PROFESIÓN:</span>
                      <span className="dni-detail-value">{dni.trabajo || 'N/A'}</span>
                    </div>
                    <div className="dni-detail-row">
                      <span className="dni-detail-label">DOMICILIO:</span>
                      <span className="dni-detail-value">{dni.domicilio || 'N/A'}</span>
                    </div>
                    <div className="dni-detail-row">
                      <span className="dni-detail-label">TELÉFONO:</span>
                      <span className="dni-detail-value">{dni.telefono || 'N/A'}</span>
                    </div>
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

          {/* Reverso del DNI */}
          <div className="dni-card-back">
            <div className="dni-back-header">
              <div className="dni-back-logo">
                <span className="dni-back-logo-text">ESPAÑA</span>
              </div>
              <div className="dni-back-title">
                <span className="dni-back-title-text">DOCUMENTO NACIONAL DE IDENTIDAD</span>
              </div>
            </div>
            
            <div className="dni-back-content">
              <div className="dni-back-info">
                <div className="dni-back-section">
                  <h4>Información Personal Completa</h4>
                  <div className="dni-back-details">
                    <div className="dni-back-field">
                      <span className="dni-back-label">Número de DNI:</span>
                      <span className="dni-back-value">{dni.numeroDNI}</span>
                    </div>
                    <div className="dni-back-field">
                      <span className="dni-back-label">Estado:</span>
                      <span className={`dni-back-value ${dni.arrestado ? 'arrestado' : 'activo'}`}>
                        {dni.arrestado ? 'ARRESTADO' : 'ACTIVO'}
                      </span>
                    </div>
                    <div className="dni-back-field">
                      <span className="dni-back-label">Usuario Roblox:</span>
                      <span className="dni-back-value">{dni.robloxUser || 'No verificado'}</span>
                    </div>
                    <div className="dni-back-field">
                      <span className="dni-back-label">Lugar de Nacimiento:</span>
                      <span className="dni-back-value">{dni.lugarNacimiento || 'N/A'}</span>
                    </div>
                    <div className="dni-back-field">
                      <span className="dni-back-label">Estado Civil:</span>
                      <span className="dni-back-value">{dni.estadoCivil || 'Soltero/a'}</span>
                    </div>
                    <div className="dni-back-field">
                      <span className="dni-back-label">Domicilio:</span>
                      <span className="dni-back-value">{dni.domicilio || 'N/A'}</span>
                    </div>
                    <div className="dni-back-field">
                      <span className="dni-back-label">Teléfono:</span>
                      <span className="dni-back-value">{dni.telefono || 'N/A'}</span>
                    </div>
                  </div>
                </div>
                
                <div className="dni-back-section">
                  <h4>Datos del Documento</h4>
                  <div className="dni-back-details">
                    <div className="dni-back-field">
                      <span className="dni-back-label">Fecha de Emisión:</span>
                      <span className="dni-back-value">{dni.fechaEmision}</span>
                    </div>
                    <div className="dni-back-field">
                      <span className="dni-back-label">Fecha de Caducidad:</span>
                      <span className="dni-back-value">{dni.caducidad}</span>
                    </div>
                    <div className="dni-back-field">
                      <span className="dni-back-label">Autoridad Expedidora:</span>
                      <span className="dni-back-value">Ministerio del Interior</span>
                    </div>
                    <div className="dni-back-field">
                      <span className="dni-back-label">Oficina de Expedición:</span>
                      <span className="dni-back-value">Comisaría Central</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="dni-back-footer">
                <div className="dni-back-qr">
                  <div className="qr-placeholder">
                    <FaIdCard size={40} />
                    <span>QR Code</span>
                  </div>
                </div>
                <div className="dni-back-signature">
                  <span>Firma del titular</span>
                  <div className="signature-line"></div>
                </div>
              </div>
            </div>
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

  // Calcular estadísticas de multas
  const multasPagadas = data.filter(multa => multa.pagada).length;
  const multasPendientes = data.filter(multa => !multa.pagada).length;
  const totalPagado = data.filter(multa => multa.pagada).reduce((sum, multa) => sum + (multa.cantidad || multa.multa || 0), 0);
  const totalPendiente = data.filter(multa => !multa.pagada).reduce((sum, multa) => sum + (multa.cantidad || multa.multa || 0), 0);

  return (
    <div className="mdt-section">
      <h3><FaMoneyBillWave /> Mis Multas ({data.length})</h3>
      
      {/* Resumen de multas */}
      <div className="multas-summary">
        <div className="summary-stats">
          <div className="stat-item">
            <span className="stat-label">Pagadas</span>
            <span className="stat-value success">{multasPagadas}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Pendientes</span>
            <span className="stat-value warning">{multasPendientes}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Total Pagado</span>
            <span className="stat-value success">{totalPagado.toLocaleString('es-ES')}€</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Total Pendiente</span>
            <span className="stat-value danger">{totalPendiente.toLocaleString('es-ES')}€</span>
          </div>
        </div>
      </div>

      {/* Mensaje motivacional o de advertencia */}
      {multasPendientes === 0 && multasPagadas > 0 && (
        <div className="multas-message good-citizen">
          <div className="message-icon">
            <FaCheckCircle />
          </div>
          <div className="message-content">
            <h4>¡Excelente ciudadano! 🏆</h4>
            <p>Has pagado todas tus multas correctamente. ¡Sigue así! Tu cumplimiento de las normas es un ejemplo para la comunidad.</p>
            <div className="message-stats">
              <span>✅ {multasPagadas} multas pagadas</span>
              <span>💰 {totalPagado.toLocaleString('es-ES')}€ abonados</span>
            </div>
          </div>
        </div>
      )}

      {multasPendientes > 0 && (
        <div className="multas-message warning-citizen">
          <div className="message-icon">
            <FaExclamationTriangle />
          </div>
          <div className="message-content">
            <h4>⚠️ Atención: Multas Pendientes</h4>
            <p>Tienes <strong>{multasPendientes}</strong> multa{multasPendientes > 1 ? 's' : ''} pendiente{multasPendientes > 1 ? 's' : ''} por un total de <strong>{totalPendiente.toLocaleString('es-ES')}€</strong>.</p>
            <p className="warning-text">
              <strong>Importante:</strong> Si no pagas tus multas en el plazo establecido, podrías enfrentar consecuencias legales más graves, incluyendo la posibilidad de un juicio. 
              Te recomendamos pagar cuanto antes para evitar problemas mayores.
            </p>
            <div className="message-actions">
              <span className="action-text">💡 Haz clic en "Pagar Multa" para cada multa pendiente</span>
            </div>
          </div>
        </div>
      )}

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
  const [expandedCards, setExpandedCards] = useState({});

  const toggleCard = (index) => {
    setExpandedCards(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  // Función para determinar si el contenido es largo
  const isLongContent = (cargos, multa) => {
    const cargosLength = cargos ? cargos.length : 0;
    const multaLength = multa ? String(multa).length : 0;
    return cargosLength > 50 || multaLength > 10;
  };

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
        {data.map((antecedente, index) => {
          const isExpanded = expandedCards[index];
          const hasLongContent = isLongContent(antecedente.cargos, antecedente.multa);
          const shouldCollapse = hasLongContent && !isExpanded;

          return (
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
                  <div className="cargos-container">
                    {shouldCollapse ? (
                      <>
                        <span className="cargos">{antecedente.cargos ? antecedente.cargos.substring(0, 50) + '...' : 'N/A'}</span>
                        <button 
                          className="expand-btn"
                          onClick={() => toggleCard(index)}
                          title="Ver más"
                        >
                          <FaEye /> Ver más
                        </button>
                      </>
                    ) : (
                      <>
                        <span className="cargos">{antecedente.cargos || 'N/A'}</span>
                        {hasLongContent && (
                          <button 
                            className="expand-btn"
                            onClick={() => toggleCard(index)}
                            title="Ver menos"
                          >
                            <FaEye /> Ver menos
                          </button>
                        )}
                      </>
                    )}
                  </div>
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
          );
        })}
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

  // Función para obtener el nombre del item basado en el item_id
  const getItemName = (itemId) => {
    const itemNames = {
      'bm_ak_47': 'AK-47',
      'bm_m4a1': 'M4A1',
      'bm_glock': 'Glock',
      'bm_usp': 'USP',
      'bm_knife': 'Cuchillo',
      'bm_vest': 'Chaleco',
      'bm_helmet': 'Casco',
      'bm_ammo': 'Munición',
      'bm_medkit': 'Botiquín',
      'bm_phone': 'Teléfono',
      'bm_keys': 'Llaves',
      'bm_wallet': 'Cartera',
      'bm_id': 'Documentos',
      'bm_drugs': 'Drogas',
      'bm_money': 'Dinero',
      'bm_food': 'Comida',
      'bm_drink': 'Bebida',
      'bm_cigarettes': 'Cigarrillos',
      'bm_lighter': 'Encendedor',
      'bm_rope': 'Cuerda',
      'bm_tools': 'Herramientas',
      'bm_bandage': 'Vendaje',
      'bm_painkillers': 'Analgésicos',
      'bm_energy_drink': 'Bebida Energética',
      'bm_sandwich': 'Sándwich',
      'bm_water': 'Agua',
      'bm_coffee': 'Café',
      'bm_beer': 'Cerveza',
      'bm_whiskey': 'Whiskey',
      'bm_vodka': 'Vodka',
      'bm_cocaine': 'Cocaína',
      'bm_marijuana': 'Marihuana',
      'bm_heroin': 'Heroína',
      'bm_meth': 'Metanfetamina',
      'bm_lsd': 'LSD',
      'bm_ecstasy': 'Éxtasis',
      'bm_weed': 'Hierba',
      'bm_crack': 'Crack',
      'bm_pills': 'Pastillas',
      'bm_syringe': 'Jeringa',
      'bm_scale': 'Báscula',
      'bm_bag': 'Bolsa',
      'bm_backpack': 'Mochila',
      'bm_duffel': 'Bolsa de Deporte',
      'bm_suitcase': 'Maleta',
      'bm_briefcase': 'Maletín',
      'bm_laptop': 'Laptop',
      'bm_tablet': 'Tablet',
      'bm_camera': 'Cámara',
      'bm_watch': 'Reloj',
      'bm_ring': 'Anillo',
      'bm_necklace': 'Collar',
      'bm_bracelet': 'Pulsera',
      'bm_earrings': 'Aretes',
      'bm_glasses': 'Gafas',
      'bm_hat': 'Sombrero',
      'bm_cap': 'Gorra',
      'bm_shirt': 'Camisa',
      'bm_pants': 'Pantalones',
      'bm_shoes': 'Zapatos',
      'bm_jacket': 'Chaqueta',
      'bm_coat': 'Abrigo',
      'bm_dress': 'Vestido',
      'bm_skirt': 'Falda',
      'bm_underwear': 'Ropa Interior',
      'bm_socks': 'Calcetines',
      'bm_belt': 'Cinturón',
      'bm_tie': 'Corbata',
      'bm_scarf': 'Bufanda',
      'bm_gloves': 'Guantes',
      'bm_umbrella': 'Paraguas',
      'bm_sunglasses': 'Gafas de Sol',
      'bm_mask': 'Máscara',
      'bm_wig': 'Peluca',
      'bm_makeup': 'Maquillaje',
      'bm_perfume': 'Perfume',
      'bm_deodorant': 'Desodorante',
      'bm_shampoo': 'Champú',
      'bm_soap': 'Jabón',
      'bm_toothbrush': 'Cepillo de Dientes',
      'bm_toothpaste': 'Pasta de Dientes',
      'bm_towel': 'Toalla',
      'bm_razor': 'Navaja de Afeitar',
      'bm_comb': 'Peine',
      'bm_mirror': 'Espejo',
      'bm_brush': 'Cepillo',
      'bm_nail_clipper': 'Cortauñas',
      'bm_tweezers': 'Pinzas',
      'bm_scissors': 'Tijeras',
      'bm_needle': 'Aguja',
      'bm_thread': 'Hilo',
      'bm_button': 'Botón',
      'bm_zipper': 'Cremallera',
      'bm_velcro': 'Velcro',
      'bm_snap': 'Broche',
      'bm_hook': 'Gancho',
      'bm_eyelet': 'Ojal',
      'bm_buckle': 'Hebilla',
      'bm_clasp': 'Cierre',
      'bm_lock': 'Candado',
      'bm_key': 'Llave',
      'bm_chain': 'Cadena',
      'bm_rope': 'Cuerda',
      'bm_wire': 'Cable',
      'bm_cord': 'Cordón',
      'bm_string': 'Cuerda',
      'bm_tape': 'Cinta',
      'bm_glue': 'Pegamento',
      'bm_cement': 'Cemento',
      'bm_putty': 'Masilla',
      'bm_sealant': 'Sellador',
      'bm_adhesive': 'Adhesivo',
      'bm_sticker': 'Pegatina',
      'bm_label': 'Etiqueta',
      'bm_tag': 'Etiqueta',
      'bm_badge': 'Insignia',
      'bm_pin': 'Pin',
      'bm_brooch': 'Broche',
      'bm_clip': 'Clip',
      'bm_paperclip': 'Clip de Papel',
      'bm_binder': 'Carpeta',
      'bm_folder': 'Carpeta',
      'bm_file': 'Archivo',
      'bm_document': 'Documento',
      'bm_paper': 'Papel',
      'bm_notebook': 'Cuaderno',
      'bm_diary': 'Diario',
      'bm_journal': 'Revista',
      'bm_magazine': 'Revista',
      'bm_newspaper': 'Periódico',
      'bm_book': 'Libro',
      'bm_novel': 'Novela',
      'bm_textbook': 'Libro de Texto',
      'bm_dictionary': 'Diccionario',
      'bm_encyclopedia': 'Enciclopedia',
      'bm_atlas': 'Atlas',
      'bm_map': 'Mapa',
      'bm_globe': 'Globo',
      'bm_compass': 'Brújula',
      'bm_gps': 'GPS',
      'bm_radio': 'Radio',
      'bm_walkie_talkie': 'Walkie Talkie',
      'bm_cb_radio': 'Radio CB',
      'bm_ham_radio': 'Radio Ham',
      'bm_satellite_phone': 'Teléfono Satelital',
      'bm_cell_phone': 'Teléfono Celular',
      'bm_smartphone': 'Smartphone',
      'bm_pager': 'Buscapersonas',
      'bm_fax': 'Fax',
      'bm_telephone': 'Teléfono',
      'bm_intercom': 'Intercomunicador',
      'bm_speaker': 'Altavoz',
      'bm_microphone': 'Micrófono',
      'bm_headphones': 'Auriculares',
      'bm_earphones': 'Auriculares',
      'bm_earbuds': 'Auriculares',
      'bm_speaker_system': 'Sistema de Altavoces',
      'bm_sound_system': 'Sistema de Sonido',
      'bm_stereo': 'Estéreo',
      'bm_boombox': 'Radiocasete',
      'bm_cassette_player': 'Reproductor de Casete',
      'bm_cd_player': 'Reproductor de CD',
      'bm_dvd_player': 'Reproductor de DVD',
      'bm_blu_ray_player': 'Reproductor de Blu-ray',
      'bm_vcr': 'VCR',
      'bm_dvr': 'DVR',
      'bm_set_top_box': 'Decodificador',
      'bm_streaming_device': 'Dispositivo de Streaming',
      'bm_game_console': 'Consola de Juegos',
      'bm_handheld_gaming': 'Consola Portátil',
      'bm_virtual_reality': 'Realidad Virtual',
      'bm_augmented_reality': 'Realidad Aumentada',
      'bm_mixed_reality': 'Realidad Mixta',
      'bm_artificial_intelligence': 'Inteligencia Artificial',
      'bm_machine_learning': 'Aprendizaje Automático',
      'bm_deep_learning': 'Aprendizaje Profundo',
      'bm_neural_network': 'Red Neuronal',
      'bm_algorithm': 'Algoritmo',
      'bm_program': 'Programa',
      'bm_software': 'Software',
      'bm_application': 'Aplicación',
      'bm_app': 'App',
      'bm_website': 'Sitio Web',
      'bm_webpage': 'Página Web',
      'bm_blog': 'Blog',
      'bm_forum': 'Foro',
      'bm_chat': 'Chat',
      'bm_message': 'Mensaje',
      'bm_email': 'Correo Electrónico',
      'bm_instant_message': 'Mensaje Instantáneo',
      'bm_text_message': 'Mensaje de Texto',
      'bm_voice_message': 'Mensaje de Voz',
      'bm_video_message': 'Mensaje de Video',
      'bm_photo': 'Foto',
      'bm_picture': 'Imagen',
      'bm_image': 'Imagen',
      'bm_selfie': 'Selfie',
      'bm_portrait': 'Retrato',
      'bm_landscape': 'Paisaje',
      'bm_nature': 'Naturaleza',
      'bm_animal': 'Animal',
      'bm_pet': 'Mascota',
      'bm_dog': 'Perro',
      'bm_cat': 'Gato',
      'bm_bird': 'Pájaro',
      'bm_fish': 'Pez',
      'bm_hamster': 'Hámster',
      'bm_rabbit': 'Conejo',
      'bm_guinea_pig': 'Cobaya',
      'bm_mouse': 'Ratón',
      'bm_rat': 'Rata',
      'bm_gerbil': 'Gerbo',
      'bm_ferret': 'Hurón',
      'bm_chinchilla': 'Chinchilla',
      'bm_hedgehog': 'Erizo',
      'bm_sugar_glider': 'Petauro del Azúcar',
      'bm_skunk': 'Mofeta',
      'bm_raccoon': 'Mapache',
      'bm_opposum': 'Zarigüeya',
      'bm_squirrel': 'Ardilla',
      'bm_chipmunk': 'Ardilla Listada',
      'bm_groundhog': 'Marmota',
      'bm_beaver': 'Castor',
      'bm_otter': 'Nutria',
      'bm_weasel': 'Comadreja',
      'bm_stoat': 'Armiño',
      'bm_mink': 'Visón',
      'bm_marten': 'Marta',
      'bm_fisher': 'Pescador',
      'bm_wolverine': 'Glotón',
      'bm_badger': 'Tejón'
    };
    
    return itemNames[itemId] || itemId.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  // Función para obtener el icono del item basado en el item_id
  const getItemIcon = (itemId) => {
    if (itemId.includes('ak_47') || itemId.includes('m4a1') || itemId.includes('glock') || itemId.includes('usp') || itemId.includes('knife')) {
      return <FaShieldAlt />;
    } else if (itemId.includes('vest') || itemId.includes('helmet') || itemId.includes('ammo')) {
      return <FaShieldAlt />;
    } else if (itemId.includes('medkit') || itemId.includes('bandage') || itemId.includes('painkillers')) {
      return <FaShieldAlt />;
    } else if (itemId.includes('phone') || itemId.includes('laptop') || itemId.includes('tablet')) {
      return <FaFileAlt />;
    } else if (itemId.includes('keys') || itemId.includes('wallet') || itemId.includes('id')) {
      return <FaIdCard />;
    } else if (itemId.includes('drugs') || itemId.includes('cocaine') || itemId.includes('marijuana')) {
      return <FaExclamationTriangle />;
    } else if (itemId.includes('money') || itemId.includes('wallet')) {
      return <FaMoneyBillWave />;
    } else if (itemId.includes('food') || itemId.includes('drink') || itemId.includes('sandwich')) {
      return <FaFileAlt />;
    } else {
      return <FaFileAlt />;
    }
  };

  return (
    <div className="mdt-section">
      <h3><FaClipboardList /> Mi Inventario ({data.length})</h3>
      <div className="inventario-grid">
        {data.map((item, index) => (
          <div key={index} className="inventario-item">
            <div className="item-icon">
              {getItemIcon(item.item_id || item.nombre)}
            </div>
            <div className="item-info">
              <h4>{getItemName(item.item_id || item.nombre)}</h4>
              <p>Cantidad: {item.cantidad}</p>
              {item.descripcion && <p>{item.descripcion}</p>}
              <p className="item-id">ID: {item.item_id || item.nombre}</p>
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
    } else if (searchType === 'discord') {
      // Buscar usuarios de Discord cuando el tipo es discord
      if (value.length >= 3) {
        searchDiscordUsers(value);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  // Función para buscar usuarios de Discord
  const searchDiscordUsers = async (query) => {
    if (query.length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setSearchingSuggestions(true);
    try {
      const response = await fetch(apiUrl(`/api/discord/search-users?q=${encodeURIComponent(query)}`));
      if (response.ok) {
        const users = await response.json();
        const discordSuggestions = (users || []).slice(0, 10).map(user => ({
          type: 'discord',
          value: user.id,
          label: `${user.username || user.displayName || 'Usuario'} (ID: ${user.id})`,
          discordId: user.id,
          username: user.username || user.displayName,
          avatar: user.avatar
        }));
        setSuggestions(discordSuggestions);
        setShowSuggestions(true);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    } catch (err) {
      console.error('Error buscando usuarios Discord:', err);
      setSuggestions([]);
      setShowSuggestions(false);
    } finally {
      setSearchingSuggestions(false);
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
      let dniData = null;
      
      // Si buscan por DNI o nombre, primero obtener el Discord ID
      if (searchType === 'dni' || searchType === 'nombre') {
        let dniResponse;
        
        if (searchType === 'dni') {
          // Usar el nuevo endpoint de búsqueda exacta de DNI
          console.log('🔍 Buscando DNI exacto:', searchValue);
          dniResponse = await fetch(apiUrl(`/api/proxy/admin/dni/search/exact/${searchValue}`));
          
          if (dniResponse.ok) {
            const exactDniData = await dniResponse.json();
            console.log('📋 Respuesta búsqueda exacta DNI:', exactDniData);
            
            if (exactDniData.success && exactDniData.dniData) {
              discordId = exactDniData.dniData.discordId;
              dniData = exactDniData.dniData;
              console.log('✅ DNI encontrado:', exactDniData.dniData.numeroDNI);
            } else {
              setError(`❌ No se encontró DNI con el número: ${searchValue}`);
              setLoading(false);
              return;
            }
          } else {
            setError('❌ Error consultando DNI exacto');
            setLoading(false);
            return;
          }
        } else {
          // Para búsqueda por nombre, usar el endpoint de búsqueda
          console.log('🔍 Buscando por nombre:', searchValue);
          const searchResponse = await fetch(apiUrl(`/api/proxy/admin/dni/search?q=${encodeURIComponent(searchValue)}`));
          const searchData = await searchResponse.json();
          console.log('📋 Respuesta búsqueda por nombre:', searchData);
          
          if (searchData.success && searchData.dniPorNombre && searchData.dniPorNombre.length > 0) {
            // Usar el primer resultado encontrado
            const firstResult = searchData.dniPorNombre[0];
            discordId = firstResult.discordId;
            dniData = firstResult;
            console.log('✅ Ciudadano encontrado por nombre:', firstResult.nombre, firstResult.apellidos);
          } else if (searchData.success && searchData.discordUsers && searchData.discordUsers.length > 0) {
            // Usar el primer usuario de Discord encontrado
            const firstUser = searchData.discordUsers[0];
            discordId = firstUser.id;
            console.log('✅ Usuario Discord encontrado:', firstUser.username);
          } else {
            setError(`❌ No se encontró ningún ciudadano con el nombre: ${searchValue}`);
            setLoading(false);
            return;
          }
        }
      }

      console.log('🆔 Discord ID obtenido:', discordId);

      // Consultar múltiples endpoints en paralelo
      const [antecedentesRes, multasRes, dniRes, inventarioRes] = await Promise.all([
        fetch(apiUrl(`/api/proxy/admin/antecedentes/${discordId}`)),
        fetch(apiUrl(`/api/proxy/admin/ver-multas/${discordId}`)),
        fetch(apiUrl(`/api/proxy/admin/dni/ver/${discordId}`)),
        fetch(apiUrl(`/api/proxy/admin/inventario/${discordId}`))
      ]);

      const [antecedentesData, multasData, dniDataFromVer, inventarioData] = await Promise.all([
        antecedentesRes.json(),
        multasRes.json(),
        dniRes.json(),
        inventarioRes.json()
      ]);

      console.log('📊 Datos obtenidos:', {
        antecedentes: antecedentesData.success ? antecedentesData.antecedentes?.length : 0,
        multas: multasData.success ? multasData.multas?.length : 0,
        dni: dniDataFromVer.success ? 'Sí' : 'No',
        inventario: inventarioData.success ? inventarioData.inventario?.length : 0
      });

      // Compilar resultados
      const searchResults = {
        discordId: discordId,
        searchValue: searchValue,
        searchType: searchType,
        dni: dniData || (dniDataFromVer.success ? dniDataFromVer.dni : null),
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
        console.log('✅ Búsqueda exitosa, datos encontrados');
      } else {
        setError('ℹ️ No se encontraron datos para este usuario');
        console.log('ℹ️ No se encontraron datos para el usuario');
      }

    } catch (err) {
      console.error('❌ Error en búsqueda:', err);
      setError(`❌ Error de conexión en la búsqueda: ${err.message}`);
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
                    {suggestion.avatar && (
                      <div className="suggestion-avatar">
                        <img 
                          src={`https://cdn.discordapp.com/avatars/${suggestion.discordId}/${suggestion.avatar}.png`} 
                          alt={suggestion.username}
                          onError={(e) => e.target.style.display = 'none'}
                        />
                      </div>
                    )}
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
                <div className="dni-avatar-section">
                  <div className="dni-avatar-container">
                    {results.dni.robloxAvatar ? (
                      <img 
                        src={results.dni.robloxAvatar} 
                        alt="Avatar Roblox" 
                        className="dni-avatar"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div className="dni-avatar-placeholder" style={{ display: results.dni.robloxAvatar ? 'none' : 'flex' }}>
                      <FaUser size={40} />
                    </div>
                  </div>
                  <div className="dni-avatar-info">
                    <div className="dni-field">
                      <label>Usuario Roblox:</label>
                      <span>{results.dni.robloxUser || 'N/A'}</span>
                    </div>
                  </div>
                </div>
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
                  <label>Lugar de Nacimiento:</label>
                  <span>{results.dni.lugarNacimiento || 'N/A'}</span>
                </div>
                <div className="dni-field">
                  <label>Sexo:</label>
                  <span>{results.dni.sexo || 'N/A'}</span>
                </div>
                <div className="dni-field">
                  <label>Nacionalidad:</label>
                  <span>{results.dni.nacionalidad}</span>
                </div>
                <div className="dni-field">
                  <label>Estado Civil:</label>
                  <span>{results.dni.estadoCivil || 'Soltero/a'}</span>
                </div>
                <div className="dni-field">
                  <label>Trabajo:</label>
                  <span>{results.dni.trabajo || 'N/A'}</span>
                </div>
                <div className="dni-field">
                  <label>Domicilio:</label>
                  <span>{results.dni.domicilio || 'N/A'}</span>
                </div>
                <div className="dni-field">
                  <label>Teléfono:</label>
                  <span>{results.dni.telefono || 'N/A'}</span>
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
            {searchingDiscord && (
              <div className="search-spinner-wrapper">
                <FaSpinner className="fa-spin search-spinner" />
              </div>
            )}
            {showDiscordSuggestions && discordSuggestions.length > 0 && (
              <div className="autocomplete-suggestions">
                {discordSuggestions.map((user, index) => (
                  <div
                    key={index}
                    className="suggestion-item discord-suggestion"
                    onClick={() => selectDiscordUser(user)}
                  >
                    <div className="suggestion-avatar">
                      {user.avatar ? (
                        <img 
                          src={`https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=64`} 
                          alt={user.username || 'Usuario'}
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div className="suggestion-avatar-placeholder" style={{ display: user.avatar ? 'none' : 'flex' }}>
                        <FaUser />
                      </div>
                    </div>
                    <div className="suggestion-info">
                      <div className="suggestion-name">{user.username || user.displayName || 'Usuario'}</div>
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
      </div>
      <div className="ranking-list">
        {rankingData.map((user, index) => {
          // Usar directamente los datos que vienen de la API
          const username = user.username || user.displayName || `Usuario_${user.discordId?.slice(-4)}`;
          const avatarUrl = user.avatar || `https://cdn.discordapp.com/avatars/${user.discordId}/default.png`;
          
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
