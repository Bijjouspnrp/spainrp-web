import React, { useState, useEffect } from 'react';
import { FaUsers, FaClock, FaServer, FaGamepad, FaGlobe } from 'react-icons/fa';
import { motion } from 'framer-motion';
import './ERLCServer.css';

const ERLCServer = () => {
  const [serverData, setServerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchServerData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch('/api/erlc/server-status');
        const data = await response.json();
        
        if (response.ok) {
          setServerData(data);
        } else {
          throw new Error(data.message || 'Error al obtener datos del servidor');
        }
      } catch (err) {
        console.error('[ERLCServer] Error fetching server data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchServerData();
    
    // Actualizar cada 30 segundos
    const interval = setInterval(fetchServerData, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <section className="erlc-server" id="erlc">
        <div className="erlc-container">
          <div className="erlc-header">
            <div className="erlc-logo">
              <FaServer className="server-icon" />
            </div>
            <div className="erlc-title-section">
              <h2 className="erlc-title">SpainRP ERLC Server</h2>
              <p className="erlc-subtitle">Servidor de Emergency Response Liberty City</p>
            </div>
          </div>
          <div className="erlc-loading">
            <div className="loading-spinner"></div>
            <p>Cargando datos del servidor...</p>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="erlc-server" id="erlc">
        <div className="erlc-container">
          <div className="erlc-header">
            <div className="erlc-logo">
              <FaServer className="server-icon" />
            </div>
            <div className="erlc-title-section">
              <h2 className="erlc-title">SpainRP ERLC Server</h2>
              <p className="erlc-subtitle">Servidor de Emergency Response Liberty City</p>
            </div>
          </div>
          <div className="erlc-error">
            <p>⚠️ No se pudo conectar con el servidor</p>
            <small>Intenta de nuevo en unos momentos</small>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="erlc-server" id="erlc">
      <div className="erlc-container">
        <motion.div 
          className="erlc-header"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="erlc-logo">
            <FaServer className="server-icon" />
          </div>
          <div className="erlc-title-section">
            <h2 className="erlc-title">SpainRP ERLC Server</h2>
            <p className="erlc-subtitle">Servidor de Emergency Response Liberty City</p>
          </div>
        </motion.div>

        <motion.div 
          className="erlc-content"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
        >
          <div className="erlc-stats">
            <div className="stat-card">
              <div className="stat-icon">
                <FaUsers />
              </div>
              <div className="stat-content">
                <h3>{serverData?.players || 0}</h3>
                <p>Jugadores Online</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">
                <FaClock />
              </div>
              <div className="stat-content">
                <h3>{serverData?.queue || 0}</h3>
                <p>En Cola</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">
                <FaGamepad />
              </div>
              <div className="stat-content">
                <h3>{serverData?.maxPlayers || 32}</h3>
                <p>Máximo</p>
              </div>
            </div>
          </div>

          <div className="erlc-info">
            <div className="info-card">
              <div className="info-header">
                <FaGlobe className="info-icon" />
                <h4>Información del Servidor</h4>
              </div>
              <div className="info-content">
                <div className="info-item">
                  <span className="info-label">Nombre:</span>
                  <span className="info-value">{serverData?.serverName || 'SpainRP Official'}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Estado:</span>
                  <span className={`info-value status ${serverData?.online ? 'online' : 'offline'}`}>
                    {serverData?.online ? '🟢 Online' : '🔴 Offline'}
                  </span>
                </div>
                <div className="info-item">
                  <span className="info-label">Mapa:</span>
                  <span className="info-value">{serverData?.map || 'Liberty City'}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Join Key:</span>
                  <span className="info-value">{serverData?.joinKey || 'SpainRP'}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Verificación:</span>
                  <span className="info-value">{serverData?.accVerifiedReq || 'Disabled'}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Team Balance:</span>
                  <span className={`info-value ${serverData?.teamBalance ? 'enabled' : 'disabled'}`}>
                    {serverData?.teamBalance ? '✅ Activado' : '❌ Desactivado'}
                  </span>
                </div>
              </div>
            </div>

            <div className="join-section">
              <h4>¡Únete al Servidor!</h4>
              <p>Conecta con otros jugadores y vive la experiencia completa de roleplay policial</p>
              <div className="join-buttons">
                <a 
                  href="https://discord.gg/sMzFgFQHXA" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="join-btn discord-btn"
                >
                  <FaGlobe />
                  Discord
                </a>
                <button 
                  className="join-btn copy-btn"
                  onClick={() => {
                    const joinKey = serverData?.joinKey || 'SpainRP';
                    navigator.clipboard.writeText(joinKey);
                    // Aquí podrías añadir un toast de confirmación
                  }}
                >
                  <FaServer />
                  Copiar Join Key
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ERLCServer;
