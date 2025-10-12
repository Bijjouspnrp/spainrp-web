import React, { useState } from 'react';
import { FaFileContract, FaChevronDown, FaChevronUp, FaTimes } from 'react-icons/fa';

const TermsViewer = ({ isOpen, onClose }) => {
  const [showFullTerms, setShowFullTerms] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    const scrolled = scrollTop + clientHeight >= scrollHeight - 20;
    setHasScrolled(scrolled);
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
        maxWidth: '900px',
        width: '100%',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        border: '2px solid #7289da',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)',
        position: 'relative'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '20px',
          paddingBottom: '16px',
          borderBottom: '1px solid rgba(114, 137, 218, 0.3)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <FaFileContract size={24} color="#FFD700" />
            <h2 style={{
              color: '#FFD700',
              fontSize: '24px',
              fontWeight: 'bold',
              margin: 0
            }}>
              Términos y Condiciones
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#fff',
              cursor: 'pointer',
              padding: '8px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
              transition: 'background 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.1)'}
            onMouseLeave={(e) => e.target.style.background = 'transparent'}
          >
            <FaTimes />
          </button>
        </div>

        {/* Discord DM Consent Notice */}
        <div style={{
          background: 'rgba(114, 137, 218, 0.1)',
          border: '1px solid #7289da',
          borderRadius: '8px',
          padding: '16px',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '12px'
        }}>
          <div style={{
            background: '#7289da',
            borderRadius: '50%',
            width: '24px',
            height: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            marginTop: '2px'
          }}>
            <span style={{ color: 'white', fontSize: '12px', fontWeight: 'bold' }}>💬</span>
          </div>
          <div>
            <h4 style={{
              color: '#7289da',
              margin: '0 0 8px 0',
              fontSize: '16px',
              fontWeight: '700'
            }}>
              Consentimiento para Mensajes Directos de Discord
            </h4>
            <p style={{
              color: '#e2e8f0',
              margin: '0 0 8px 0',
              fontSize: '14px',
              lineHeight: '1.5'
            }}>
              Al aceptar estos términos, autorizas al bot de SpainRP a enviarte mensajes directos (DMs) en Discord para:
            </p>
            <ul style={{
              color: '#e2e8f0',
              margin: '0',
              paddingLeft: '20px',
              fontSize: '14px',
              lineHeight: '1.5'
            }}>
              <li>Notificaciones importantes del sistema</li>
              <li>Alertas de seguridad y cambios en tu cuenta</li>
              <li>Actualizaciones de servicios y mantenimiento</li>
              <li>Comunicaciones relacionadas con tu participación en SpainRP</li>
            </ul>
            <p style={{
              color: '#a0aec0',
              margin: '8px 0 0 0',
              fontSize: '12px',
              fontStyle: 'italic'
            }}>
              Estos mensajes son comunicaciones legítimas del servicio y no constituyen spam según las reglas de Discord.
            </p>
          </div>
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
                Resumen de los términos:
              </h3>
              <ul style={{ color: '#fff', paddingLeft: '20px', lineHeight: '1.6' }}>
                <li>Política de datos detallada con retención de 2 años</li>
                <li>Derechos GDPR y proceso de eliminación de datos</li>
                <li><strong>Autorización para recibir DMs del bot de Discord</strong></li>
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
                
                <p><strong>3. Comunicaciones por Discord:</strong> Al aceptar estos términos, autorizas al bot de SpainRP a enviarte mensajes directos (DMs) para notificaciones importantes, actualizaciones del sistema, alertas de seguridad y comunicaciones relacionadas con tu cuenta. Estos mensajes no constituyen spam según las reglas de Discord, ya que son comunicaciones legítimas relacionadas con el servicio.</p>
                
                <p><strong>4. Servicios de terceros:</strong> No nos responsabilizamos por caídas de APIs de Discord, ERLC o servicios externos. Enlaces a Discord ToS y ERLC Terms incluidos.</p>
                
                <p><strong>5. Protección de contenido:</strong> Implementamos medidas contra contenido ilegal, pero no garantizamos detección del 100%.</p>
                
                <p><strong>6. Ingeniería inversa:</strong> Está estrictamente prohibido realizar ingeniería inversa de nuestro código o crear bots que imiten nuestra funcionalidad.</p>
                
                <p><strong>7. Monitoreo:</strong> Recopilamos datos de uso para mejorar servicios, incluyendo métricas de rendimiento y patrones de uso.</p>
                
                <p><strong>8. Backup y seguridad:</strong> Implementamos cifrado, backups diarios y acceso restringido a administradores.</p>
                
                <p><strong>9. Brechas de seguridad:</strong> Notificaremos filtraciones en 72 horas. Reporta incidentes contactando a BijjouPro08.</p>
                
                <p><strong>10. Modificaciones:</strong> Te notificaremos cambios importantes via Discord, panel, email o banner web.</p>
                
                <p><strong>11. Contacto:</strong> Para cualquier consulta, contacta a BijjouPro08 mediante Discord.</p>
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
              alignSelf: 'flex-start',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.background = 'rgba(114, 137, 218, 0.3)'}
            onMouseLeave={(e) => e.target.style.background = 'rgba(114, 137, 218, 0.2)'}
          >
            {showFullTerms ? (
              <>
                <FaChevronUp size={12} />
                Ver resumen
              </>
            ) : (
              <>
                <FaChevronDown size={12} />
                Ver términos completos
              </>
            )}
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

        {/* Footer */}
        <div style={{
          paddingTop: '16px',
          borderTop: '1px solid rgba(114, 137, 218, 0.3)',
          textAlign: 'center'
        }}>
          <p style={{
            color: '#a0aec0',
            fontSize: '12px',
            margin: 0
          }}>
            Última actualización: {new Date().toLocaleDateString('es-ES')} | Versión 2.1
          </p>
        </div>
      </div>
    </div>
  );
};

export default TermsViewer;
