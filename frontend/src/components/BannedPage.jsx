import React, { useState, useEffect } from 'react';
import { FaBan, FaExclamationTriangle, FaClock, FaGavel, FaEnvelope } from 'react-icons/fa';
import './BannedPage.css';

const BannedPage = ({ banData }) => {
  const [timeLeft, setTimeLeft] = useState(null);

  useEffect(() => {
    console.log('[BANNED PAGE] Componente montado con banData:', banData);
  }, [banData]);

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
          setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
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
                  {banData?.type === 'ip' ? 'Dirección IP' : 'Usuario Discord'}
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
              Has sido baneado de SpainRP Web por violar nuestros términos de servicio. 
              Esto significa que no puedes acceder a ninguna funcionalidad del sitio web.
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
