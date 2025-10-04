import React, { useState, useEffect, useRef } from 'react';
import { FaBan, FaExclamationTriangle, FaClock, FaGavel, FaEnvelope } from 'react-icons/fa';
import './BannedPage.css';

const BannedPage = () => {
  const [banData, setBanData] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);
  const [isChecking, setIsChecking] = useState(true);
  const [hasRedirected, setHasRedirected] = useState(false);
  const hasInitialized = useRef(false);

  useEffect(() => {
    console.log('[BANNED PAGE] Componente montado');
    
    // Solo inicializar una vez
    if (!hasInitialized.current) {
      hasInitialized.current = true;
      checkBanStatus();
    }
  }, []);

  const checkBanStatus = () => {
    try {
      // Verificar si hay datos de ban en localStorage
      const banError = localStorage.getItem('ban_error');
      if (banError) {
        const ban = JSON.parse(banError);
        
        // Verificar si el ban ha expirado
        if (ban.expiresAt && new Date(ban.expiresAt).getTime() <= Date.now()) {
          console.log('[BANNED PAGE] Ban expirado, limpiando localStorage');
          localStorage.removeItem('ban_error');
          setBanData(null);
          setIsChecking(false);
          
          // Redirigir con delay para evitar bucles
          if (!hasRedirected) {
            setHasRedirected(true);
            setTimeout(() => {
              window.location.href = '/';
            }, 1000);
          }
          return;
        }
        
        setBanData(ban);
        setIsChecking(false);
        return;
      }

      // Si no hay datos de ban, redirigir con delay
      if (!hasRedirected) {
        console.log('[BANNED PAGE] No hay datos de ban, redirigiendo en 2 segundos...');
        setHasRedirected(true);
        setTimeout(() => {
          window.location.href = '/';
        }, 2000);
      }
    } catch (error) {
      console.error('[BANNED PAGE] Error checking ban status:', error);
      setIsChecking(false);
    }
  };

  useEffect(() => {
    if (banData?.expiresAt) {
      const updateTimeLeft = () => {
        const now = new Date().getTime();
        const expires = new Date(banData.expiresAt).getTime();
        const diff = expires - now;

        if (diff > 0) {
          const days = Math.floor(diff / (1000 * 60 * 60 * 24));
          const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((diff % (1000 * 60)) / 1000);

          setTimeLeft({ days, hours, minutes, seconds });
        } else {
          // Ban expirado, limpiar localStorage y recargar página
          console.log('[BANNED PAGE] Ban expirado, limpiando localStorage y recargando...');
          localStorage.removeItem('ban_error');
          setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
          // Recargar la página para permitir acceso
          setTimeout(() => {
            window.location.reload();
          }, 2000);
        }
      };

      updateTimeLeft();
      const interval = setInterval(updateTimeLeft, 1000);
      return () => clearInterval(interval);
    }
  }, [banData?.expiresAt]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Si está verificando, mostrar loading
  if (isChecking) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: '#f8fafc'
      }}>
        <div style={{
          textAlign: 'center',
          padding: '2rem',
          background: 'white',
          borderRadius: '12px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid #e2e8f0',
            borderTop: '4px solid #3b82f6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem auto'
          }}></div>
          <p style={{ margin: 0, color: '#64748b' }}>Verificando acceso...</p>
          <p style={{ margin: '0.5rem 0 0 0', color: '#94a3b8', fontSize: '0.875rem' }}>
            {hasRedirected ? 'Redirigiendo...' : 'Cargando...'}
          </p>
        </div>
      </div>
    );
  }

  const isPermanent = !banData?.expiresAt;
  const isExpired = banData?.expiresAt && new Date(banData.expiresAt).getTime() <= Date.now();

  // Si no hay datos de ban, mostrar mensaje genérico
  if (!banData) {
    return (
      <div className="banned-page">
        <div className="banned-container">
          <div className="banned-header">
            <div className="banned-icon">
              <FaBan />
            </div>
            <h1>Acceso Denegado</h1>
            <p>Tu acceso a SpainRP Web ha sido restringido</p>
          </div>
          <div className="banned-info">
            <div className="info-card">
              <div className="info-header">
                <FaExclamationTriangle className="info-icon" />
                <h3>Detalles del Ban</h3>
              </div>
              <div className="info-content">
                <div className="info-row">
                  <span className="label">Estado:</span>
                  <span className="value">Acceso restringido</span>
                </div>
                <div className="info-row">
                  <span className="label">Razón:</span>
                  <span className="value reason">No especificada</span>
                </div>
              </div>
            </div>
          </div>
          <div className="contact-section">
            <p>¿Necesitas ayuda? Contáctanos en Discord</p>
            <a 
              href="https://discord.gg/sMzFgFQHXA" 
              target="_blank" 
              rel="noopener noreferrer"
              className="contact-btn"
            >
              <FaGavel /> Servidor de Discord
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="banned-page">
      <div className="banned-container">
        {/* Header */}
        <div className="banned-header">
          <div className="banned-icon">
            <FaBan />
          </div>
          <h1>Acceso Denegado</h1>
          <p>Tu acceso a SpainRP Web ha sido restringido</p>
        </div>

        {/* Información del ban */}
        <div className="banned-info">
          <div className="info-card">
            <div className="info-header">
              <FaExclamationTriangle className="info-icon" />
              <h3>Detalles del Ban</h3>
            </div>
            <div className="info-content">
              <div className="info-row">
                <span className="label">Tipo:</span>
                <span className="value">
                  {banData?.type === 'ip' ? '🌐 Dirección IP' : 
                   banData?.type === 'discord' ? '👤 Usuario Discord' : 
                   '❓ Tipo desconocido'}
                </span>
              </div>
              <div className="info-row">
                <span className="label">Razón:</span>
                <span className="value reason">{banData?.reason || 'No especificada'}</span>
              </div>
              <div className="info-row">
                <span className="label">Fecha:</span>
                <span className="value">{formatDate(banData?.bannedAt)}</span>
              </div>
              {banData?.expiresAt && (
                <div className="info-row">
                  <span className="label">Expira:</span>
                  <span className="value">{formatDate(banData.expiresAt)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Tiempo restante */}
          {!isPermanent && !isExpired && timeLeft && (
            <div className="time-card">
              <div className="time-header">
                <FaClock className="time-icon" />
                <h3>Tiempo Restante</h3>
              </div>
              <div className="time-display">
                <div className="time-unit">
                  <span className="time-value">{timeLeft.days}</span>
                  <span className="time-label">Días</span>
                </div>
                <div className="time-unit">
                  <span className="time-value">{timeLeft.hours}</span>
                  <span className="time-label">Horas</span>
                </div>
                <div className="time-unit">
                  <span className="time-value">{timeLeft.minutes}</span>
                  <span className="time-label">Minutos</span>
                </div>
                <div className="time-unit">
                  <span className="time-value">{timeLeft.seconds}</span>
                  <span className="time-label">Segundos</span>
                </div>
              </div>
            </div>
          )}

          {/* Ban expirado */}
          {isExpired && (
            <div className="expired-card">
              <div className="expired-header">
                <FaClock className="expired-icon" />
                <h3>Ban Expirado</h3>
              </div>
              <p>Tu ban ha expirado. Puedes intentar acceder nuevamente.</p>
              <button 
                className="retry-btn"
                onClick={() => window.location.reload()}
              >
                Intentar Acceder
              </button>
            </div>
          )}
        </div>

        {/* Información adicional */}
        <div className="banned-footer">
          <div className="footer-card">
            <h4>¿Qué significa esto?</h4>
            <p>
              {banData?.type === 'ip' ? 
                'Tu dirección IP ha sido baneada de SpainRP Web por violar nuestros términos de servicio. Esto significa que no puedes acceder desde esta IP a ninguna funcionalidad del sitio web.' :
                banData?.type === 'discord' ?
                'Tu cuenta de Discord ha sido baneada de SpainRP Web por violar nuestros términos de servicio. Esto significa que no puedes acceder con esta cuenta a ninguna funcionalidad del sitio web.' :
                'Has sido baneado de SpainRP Web por violar nuestros términos de servicio. Esto significa que no puedes acceder a ninguna funcionalidad del sitio web.'
              }
            </p>
          </div>

          <div className="footer-card">
            <h4>¿Cómo puedo apelar?</h4>
            <p>
              Si crees que esto es un error, puedes contactar con el equipo de moderación 
              a través de nuestro servidor de Discord.
            </p>
            <a 
              href="https://discord.gg/sMzFgFQHXA" 
              target="_blank" 
              rel="noopener noreferrer"
              className="discord-btn"
            >
              <FaEnvelope /> Contactar en Discord
            </a>
          </div>

          <div className="footer-card">
            <h4>Política de Bans</h4>
            <p>
              Los bans pueden ser temporales o permanentes dependiendo de la gravedad 
              de la infracción. Revisa nuestros términos de servicio para más información.
            </p>
          </div>
        </div>

        {/* Botón de contacto */}
        <div className="contact-section">
          <p>¿Necesitas ayuda? Contáctanos en Discord</p>
          <a 
            href="https://discord.gg/sMzFgFQHXA" 
            target="_blank" 
            rel="noopener noreferrer"
            className="contact-btn"
          >
            <FaGavel /> Servidor de Discord
          </a>
        </div>
      </div>
    </div>
  );
};

export default BannedPage;
