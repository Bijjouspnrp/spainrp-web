import React, { useState, useEffect } from 'react';
import { FaPlay, FaPause, FaChevronLeft, FaChevronRight, FaImages, FaVideo, FaHeart, FaComments, FaShare } from 'react-icons/fa';
import { apiUrl } from '../utils/api';
import './GaleriaRP.css';

const GaleriaRP = () => {
  const [discordMembers, setDiscordMembers] = useState([]);
  const [currentMemberIndex, setCurrentMemberIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cargar miembros de Discord
  useEffect(() => {
    loadDiscordMembers();
  }, []);

  // Auto-rotación del carrusel
  useEffect(() => {
    if (!isPlaying || discordMembers.length === 0) return;

    const interval = setInterval(() => {
      setCurrentMemberIndex((prev) => (prev + 1) % discordMembers.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [isPlaying, discordMembers.length]);

  const loadDiscordMembers = async () => {
    try {
      setLoading(true);
      console.log('[GALERIA] Cargando miembros de Discord...');
      
      const response = await fetch(apiUrl('/api/discord/members'));
      const data = await response.json();
      
      if (data.success && data.members) {
        console.log(`[GALERIA] Cargados ${data.members.length} miembros`);
        setDiscordMembers(data.members);
        setError(null);
      } else {
        throw new Error(data.error || 'Error en la respuesta del servidor');
      }
    } catch (err) {
      console.error('[GALERIA] Error loading Discord members:', err);
      setError('Error cargando miembros de Discord: ' + err.message);
      
      // Fallback: usar algunos miembros básicos si falla la carga
      const fallbackMembers = [
        {
          id: 'fallback-1',
          username: 'bijjoupro08',
          discriminator: '0001',
          avatar: 'https://cdn.discordapp.com/embed/avatars/0.png',
          status: 'online'
        }
      ];
      setDiscordMembers(fallbackMembers);
    } finally {
      setLoading(false);
    }
  };

  const nextMember = () => {
    setCurrentMemberIndex((prev) => (prev + 1) % discordMembers.length);
  };

  const prevMember = () => {
    setCurrentMemberIndex((prev) => (prev - 1 + discordMembers.length) % discordMembers.length);
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'online': return '#43b581';
      case 'idle': return '#faa61a';
      case 'dnd': return '#f04747';
      case 'offline': return '#747f8d';
      default: return '#747f8d';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'online': return 'En línea';
      case 'idle': return 'Ausente';
      case 'dnd': return 'No molestar';
      case 'offline': return 'Desconectado';
      default: return 'Desconectado';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'online': return '🟢';
      case 'idle': return '🟡';
      case 'dnd': return '🔴';
      case 'offline': return '⚫';
      default: return '⚫';
    }
  };

  if (loading) {
    return (
      <div className="galeria-loading">
        <div className="loading-spinner"></div>
        <p>Cargando GaleríaRP...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="galeria-error">
        <FaImages className="error-icon" />
        <h3>Error cargando la galería</h3>
        <p>{error}</p>
        <button onClick={loadDiscordMembers} className="retry-btn">
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="galeria-container">
      {/* Header */}
      <div className="galeria-header">
        <div className="galeria-title">
          <FaImages className="title-icon" />
          <h1>GaleríaRP</h1>
          <span className="title-subtitle">Los mejores momentos de SpainRP</span>
        </div>
        <div className="galeria-stats">
          <div className="stat-item">
            <FaImages />
            <span>{discordMembers.length} Miembros</span>
          </div>
          <div className="stat-item">
            <FaVideo />
            <span>12 Videos</span>
          </div>
          <div className="stat-item">
            <FaHeart />
            <span>156 Me gusta</span>
          </div>
        </div>
      </div>

      {/* Carrusel de miembros de Discord */}
      <div className="discord-carousel-section">
        <div className="carousel-header">
          <h2>Miembros de la Comunidad</h2>
          <div className="carousel-controls">
            <button 
              className="control-btn" 
              onClick={prevMember}
              disabled={discordMembers.length === 0}
            >
              <FaChevronLeft />
            </button>
            <button 
              className={`play-pause-btn ${isPlaying ? 'playing' : 'paused'}`}
              onClick={togglePlayPause}
            >
              {isPlaying ? <FaPause /> : <FaPlay />}
            </button>
            <button 
              className="control-btn" 
              onClick={nextMember}
              disabled={discordMembers.length === 0}
            >
              <FaChevronRight />
            </button>
          </div>
        </div>

        <div className="carousel-container">
          <div className="carousel-track" style={{ transform: `translateX(-${currentMemberIndex * 100}%)` }}>
            {discordMembers.map((member, index) => (
              <div key={member.id} className={`carousel-item ${index === currentMemberIndex ? 'active' : ''}`}>
                <div className="member-card">
                  <div className="member-avatar-container">
                    <img 
                      src={member.avatar} 
                      alt={`${member.username}#${member.discriminator}`}
                      className="member-avatar"
                      onError={(e) => {
                        // Si falla el avatar, usar avatar por defecto basado en el discriminator
                        const defaultAvatar = parseInt(member.discriminator) % 5;
                        e.target.src = `https://cdn.discordapp.com/embed/avatars/${defaultAvatar}.png`;
                      }}
                    />
                    <div 
                      className="member-status" 
                      style={{ backgroundColor: getStatusColor(member.status) }}
                    ></div>
                  </div>
                  <div className="member-info">
                    <h3 className="member-username">{member.username}</h3>
                    <p className="member-discriminator">#{member.discriminator}</p>
                    <div className="member-status-container">
                      <span className="member-status-icon">{getStatusIcon(member.status)}</span>
                      <span 
                        className="member-status-text"
                        style={{ color: getStatusColor(member.status) }}
                      >
                        {getStatusText(member.status)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="carousel-indicators">
          {discordMembers.map((_, index) => (
            <button
              key={index}
              className={`indicator ${index === currentMemberIndex ? 'active' : ''}`}
              onClick={() => setCurrentMemberIndex(index)}
            />
          ))}
        </div>
      </div>

      {/* Sección de contenido multimedia */}
      <div className="media-section">
        <div className="media-header">
          <h2>Mejores Momentos</h2>
          <div className="media-filters">
            <button className="filter-btn active">Todos</button>
            <button className="filter-btn">Fotos</button>
            <button className="filter-btn">Videos</button>
            <button className="filter-btn">Eventos</button>
          </div>
        </div>

        <div className="media-grid">
          {/* Placeholder para contenido futuro */}
          <div className="media-placeholder">
            <FaImages className="placeholder-icon" />
            <h3>Contenido próximamente</h3>
            <p>Aquí se mostrarán las mejores fotos y videos de SpainRP</p>
            <div className="placeholder-actions">
              <button className="action-btn">
                <FaHeart /> Me gusta
              </button>
              <button className="action-btn">
                <FaComments /> Comentar
              </button>
              <button className="action-btn">
                <FaShare /> Compartir
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Sección de estadísticas */}
      <div className="stats-section">
        <h2>Estadísticas de la Comunidad</h2>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">
              <FaImages />
            </div>
            <div className="stat-content">
              <h3>1,234</h3>
              <p>Fotos compartidas</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">
              <FaVideo />
            </div>
            <div className="stat-content">
              <h3>567</h3>
              <p>Videos subidos</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">
              <FaHeart />
            </div>
            <div className="stat-content">
              <h3>8,901</h3>
              <p>Me gusta totales</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">
              <FaComments />
            </div>
            <div className="stat-content">
              <h3>2,345</h3>
              <p>Comentarios</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GaleriaRP;
