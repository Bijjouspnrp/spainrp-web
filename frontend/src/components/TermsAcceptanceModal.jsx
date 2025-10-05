import React, { useState, useEffect } from 'react';
import { FaCheck, FaTimes, FaFileContract, FaExclamationTriangle } from 'react-icons/fa';

const TermsAcceptanceModal = ({ isOpen, onAccept, onReject, user }) => {
  const [hasScrolled, setHasScrolled] = useState(false);
  const [isAccepted, setIsAccepted] = useState(false);
  const [showFullTerms, setShowFullTerms] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Reset state when modal opens
      setHasScrolled(false);
      setIsAccepted(false);
      setShowFullTerms(false);
    }
  }, [isOpen]);

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    const scrolled = scrollTop + clientHeight >= scrollHeight - 20; // Aumentar margen
    setHasScrolled(scrolled);
  };

  const handleAccept = () => {
    // Permitir aceptar si está en modo resumen O si ha scrolleado en modo completo
    const canAccept = !showFullTerms || hasScrolled;
    
    if (canAccept && isAccepted) {
      // Store acceptance in localStorage with timestamp
      const acceptanceData = {
        accepted: true,
        timestamp: new Date().toISOString(),
        userId: user?.id,
        version: '2.0' // Update this when terms change
      };
      localStorage.setItem('spainrp_terms_accepted', JSON.stringify(acceptanceData));
      onAccept();
    }
  };

  const handleReject = () => {
    // Clear any stored data and redirect
    localStorage.removeItem('spainrp_token');
    localStorage.removeItem('spainrp_terms_accepted');
    onReject();
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.9)',
      zIndex: 10000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
        borderRadius: '16px',
        padding: '24px',
        maxWidth: '800px',
        width: '100%',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        border: '2px solid #7289da',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '20px',
          paddingBottom: '16px',
          borderBottom: '1px solid rgba(114, 137, 218, 0.3)'
        }}>
          <FaFileContract size={24} color="#FFD700" />
          <h2 style={{
            color: '#FFD700',
            fontSize: '24px',
            fontWeight: 'bold',
            margin: 0
          }}>
            Términos y Condiciones Actualizados
          </h2>
        </div>

        {/* Warning */}
        <div style={{
          background: 'rgba(255, 193, 7, 0.1)',
          border: '1px solid #ffc107',
          borderRadius: '8px',
          padding: '12px',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <FaExclamationTriangle color="#ffc107" size={16} />
          <p style={{
            color: '#ffc107',
            margin: 0,
            fontSize: '14px',
            fontWeight: '600'
          }}>
            Hemos actualizado nuestros términos y condiciones. Debes aceptarlos para continuar usando el panel.
          </p>
        </div>

        {/* Terms Content */}
        <div style={{
          flex: 1,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}>
          {!showFullTerms ? (
            // Summary view
            <div style={{
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '8px',
              padding: '16px',
              marginBottom: '16px',
              maxHeight: '300px',
              overflow: 'auto'
            }}>
              <h3 style={{ color: '#FFD700', marginTop: 0, marginBottom: '12px' }}>
                Resumen de los cambios principales:
              </h3>
              <ul style={{ color: '#fff', paddingLeft: '20px', lineHeight: '1.6' }}>
                <li>Política de datos detallada con retención de 2 años</li>
                <li>Derechos GDPR y proceso de eliminación de datos</li>
                <li>Limitación de responsabilidad por servicios externos (Discord, ERLC)</li>
                <li>Protección contra contenido ilegal</li>
                <li>Prohibición de ingeniería inversa</li>
                <li>Política de notificación de cambios</li>
                <li>Medidas de backup y seguridad de datos</li>
                <li>Proceso de reporte de brechas de seguridad</li>
              </ul>
            </div>
          ) : (
            // Full terms view
            <div 
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '8px',
                padding: '16px',
                marginBottom: '16px',
                maxHeight: '400px',
                overflow: 'auto',
                fontSize: '12px',
                lineHeight: '1.4'
              }}
              onScroll={handleScroll}
            >
              <h3 style={{ color: '#FFD700', marginTop: 0, marginBottom: '12px' }}>
                Términos y Condiciones Completos:
              </h3>
              <div style={{ color: '#fff' }}>
                <p><strong>1. Aceptación de los términos:</strong> Al utilizar este sitio, confirmas que tienes la capacidad legal para aceptar estos términos y que cumples con todas las leyes y regulaciones aplicables.</p>
                
                <p><strong>2. Política de datos:</strong> Guardamos datos de Discord por 2 años desde tu último acceso. Tienes derecho a solicitar eliminación contactando a BijjouPro08.</p>
                
                <p><strong>3. Servicios de terceros:</strong> No nos responsabilizamos por caídas de APIs de Discord, ERLC o servicios externos. Enlaces a Discord ToS y ERLC Terms incluidos.</p>
                
                <p><strong>4. Protección de contenido:</strong> Implementamos medidas contra contenido ilegal, pero no garantizamos detección del 100%.</p>
                
                <p><strong>5. Ingeniería inversa:</strong> Está estrictamente prohibido realizar ingeniería inversa de nuestro código o crear bots que imiten nuestra funcionalidad.</p>
                
                <p><strong>6. Monitoreo:</strong> Recopilamos datos de uso para mejorar servicios, incluyendo métricas de rendimiento y patrones de uso.</p>
                
                <p><strong>7. Backup y seguridad:</strong> Implementamos cifrado, backups diarios y acceso restringido a administradores.</p>
                
                <p><strong>8. Brechas de seguridad:</strong> Notificaremos filtraciones en 72 horas. Reporta incidentes contactando a BijjouPro08.</p>
                
                <p><strong>9. Modificaciones:</strong> Te notificaremos cambios importantes via Discord, panel, email o banner web.</p>
                
                <p><strong>10. Contacto:</strong> Para cualquier consulta, contacta a BijjouPro08 mediante Discord.</p>
              </div>
            </div>
          )}

          {/* Toggle between summary and full terms */}
          <button
            onClick={() => setShowFullTerms(!showFullTerms)}
            style={{
              background: 'rgba(114, 137, 218, 0.2)',
              border: '1px solid #7289da',
              color: '#7289da',
              padding: '8px 16px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: '600',
              marginBottom: '16px',
              alignSelf: 'flex-start'
            }}
          >
            {showFullTerms ? 'Ver resumen' : 'Ver términos completos'}
          </button>

          {/* Scroll indicator */}
          {showFullTerms && !hasScrolled && (
            <div style={{
              background: 'rgba(255, 193, 7, 0.1)',
              border: '1px solid #ffc107',
              borderRadius: '6px',
              padding: '8px',
              marginBottom: '16px',
              textAlign: 'center',
              fontSize: '12px',
              color: '#ffc107'
            }}>
              ⬇️ Desplázate hacia abajo para leer todos los términos
            </div>
          )}
        </div>

        {/* Checkbox and buttons */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          {/* Acceptance checkbox */}
          <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer',
            color: '#fff',
            fontSize: '14px'
          }}>
            <input
              type="checkbox"
              checked={isAccepted}
              onChange={(e) => setIsAccepted(e.target.checked)}
              style={{
                width: '16px',
                height: '16px',
                accentColor: '#7289da'
              }}
            />
            He leído y acepto los términos y condiciones actualizados
          </label>

          {/* Action buttons */}
          <div style={{
            display: 'flex',
            gap: '12px',
            justifyContent: 'flex-end'
          }}>
            <button
              onClick={handleReject}
              style={{
                background: '#e74c3c',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                padding: '12px 24px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                opacity: 0.8,
                transition: 'opacity 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.opacity = '1'}
              onMouseLeave={(e) => e.target.style.opacity = '0.8'}
            >
              <FaTimes size={14} />
              Rechazar y salir
            </button>

            <button
              onClick={handleAccept}
              disabled={(!showFullTerms ? false : !hasScrolled) || !isAccepted}
              style={{
                background: ((!showFullTerms ? true : hasScrolled) && isAccepted) ? '#27ae60' : '#666',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                padding: '12px 24px',
                cursor: ((!showFullTerms ? true : hasScrolled) && isAccepted) ? 'pointer' : 'not-allowed',
                fontSize: '14px',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s'
              }}
            >
              <FaCheck size={14} />
              Aceptar y continuar
            </button>
          </div>

          {/* Status messages */}
          {showFullTerms && !hasScrolled && (
            <p style={{
              color: '#ffc107',
              fontSize: '12px',
              textAlign: 'center',
              margin: 0
            }}>
              Debes desplazarte hasta el final de los términos
            </p>
          )}
          {!isAccepted && (
            <p style={{
              color: '#e74c3c',
              fontSize: '12px',
              textAlign: 'center',
              margin: 0
            }}>
              Debes marcar la casilla de aceptación
            </p>
          )}
          {!showFullTerms && (
            <p style={{
              color: '#27ae60',
              fontSize: '12px',
              textAlign: 'center',
              margin: 0
            }}>
              Puedes aceptar directamente desde el resumen
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default TermsAcceptanceModal;
