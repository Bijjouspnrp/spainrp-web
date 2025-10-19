import React, { useState, useEffect } from 'react';
import { FaPlay, FaPause, FaChevronLeft, FaChevronRight, FaImages, FaVideo, FaHeart, FaComments, FaShare } from 'react-icons/fa';
import { apiUrl } from '../utils/api';
import './GaleriaRP.css';

// Array de imágenes reales de SpainRP
const galleryItems = [
  {
    type: 'image',
    src: 'https://media.discordapp.net/attachments/1387914767276048445/1428442996944146442/image.png?ex=68f47ef5&is=68f32d75&hm=41f01724ebc83b98db670b0f0e550781a527532c8d620d11925a1b631b76a2b2&=&format=webp&quality=lossless',
    alt: '🚔 Guardia Civil y UMS en acción'
  },
  {
    type: 'image',
    src: 'https://media.discordapp.net/attachments/1387914767276048445/1428442997430816858/image.png?ex=68f47ef5&is=68f32d75&hm=8b1af42158cfa763a9e6836c07706a5e7e9d73d3bc146b0853f6dfbd1aae9dac&=&format=webp&quality=lossless&width=1734&height=975',
    alt: '🇪🇸 Desfile Día Nacional España - UMS, UME y Policía Nacional'
  },
  {
    type: 'image',
    src: 'https://media.discordapp.net/attachments/1387914767276048445/1428442999007875252/image.png?ex=68f47ef6&is=68f32d76&hm=8eba1daaf99c29e5d97957fa0fb50e94e4e8ed3196941ac57ea552d9121ba2c4&=&format=webp&quality=lossless&width=1734&height=975',
    alt: '🎖️ Desfile con Guardia Civil incluida'
  },
  {
    type: 'image',
    src: 'https://media.discordapp.net/attachments/1387914767276048445/1427294202664058920/IMG-20250829-WA0001.jpg?ex=68f4ee4f&is=68f39ccf&hm=013ef2e7313b6cf6f9b00fd5a2821ac00e83448260fd302f03f29ceeb681128d&=&format=webp&width=607&height=1080',
    alt: '🍩 Manolo (MrPro21) disfrutando de unos churros'
  },
  {
    type: 'image',
    src: 'https://media.discordapp.net/attachments/1387914767276048445/1418906049695449138/IMG_0971.png?ex=68f4bcbc&is=68f36b3c&hm=1e1c95fab983e3590bc8e3d00dc16bfc8d0ff384fee740a7574cab26159df3e2&=&format=webp&quality=lossless&width=1768&height=817',
    alt: '💛 Los Vagos robando joyería '
  },
  {
    type: 'image',
    src: 'https://media.discordapp.net/attachments/1387914767276048445/1416718668812779541/Anadir_un_titulo.png?ex=68f4b094&is=68f35f14&hm=4e88fc07f344e39c49c64825737ed46697327c445c757245a18dd1a174016055&=&format=webp&quality=lossless',
    alt: '⚡ Sergiojpni el electricista en acción'
  },
  {
    type: 'image',
    src: 'https://media.discordapp.net/attachments/1387914767276048445/1414282400246136852/Staff.png?ex=68f46560&is=68f313e0&hm=f933cf0d00e29717edd20facbf3a19a98d594890a87c8c7f698a09d55e100e5b&=&format=webp&quality=lossless',
    alt: '👑 Moderadores OG SpainRP: Pato, Rafamonterox y Pietro'
  },
  {
    type: 'image',
    src: 'https://media.discordapp.net/attachments/1361508961307725887/1429262886282334288/image.png?ex=68f5804a&is=68f42eca&hm=3f91e53ed72d51e3676a9321a5a67f73bb319005e37fe4a0024f1946f2873551&=&format=webp&quality=lossless',
    alt: 'Benjaelp el developer con sus hijos 👶'
  },
  {
    type: 'image',
    src: 'https://media.discordapp.net/attachments/1387914767276048445/1406761063659212902/image.png?ex=68f4b815&is=68f36695&hm=9692c624dfa035d5617fa05b139ed2f8713aafc6205509fa10a396559c88a65f&=&format=webp&quality=lossless&width=1735&height=976',
    alt: '🌿 Amigodedoc y Julepe fumando un porro'
  },
  {
    type: 'image',
    src: 'https://media.discordapp.net/attachments/1387914767276048445/1406649595475529749/image.png?ex=68f45045&is=68f2fec5&hm=8dc025e42262f81211da26c3212b0892d6f5ccc52caf8349fdeaf91ab1a095cc&=&format=webp&quality=lossless&width=1734&height=975',
    alt: '👥 Staff SpainRP - El equipo que lo hace posible'
  },
  {
    type: 'image',
    src: 'https://media.discordapp.net/attachments/1387914767276048445/1393655223456891040/5B25AEF3-964D-4592-9C4B-641BB94398FA.png?ex=68f48052&is=68f32ed2&hm=892a39c7a27b2a74ab5589883b822de674aa922b7de691dfdf197bc1b902e93a&=&format=webp&quality=lossless',
    alt: '🏋️‍♂️ Antiguo entrenamiento CNP'
  },
  {
    type: 'image',
    src: 'https://media.discordapp.net/attachments/1387914767276048445/1387922970340753408/image.png?ex=68f5667e&is=68f414fe&hm=85dfd0733d3fc2c07e03e7d609173b6ec8ab69b17bbbd2063e89e31950a452ab&=&format=webp&quality=lossless',
    alt: '💙 Los Aztecas'
  },
  {
    type: 'image',
    src: 'https://media.discordapp.net/attachments/1387914767276048445/1387925137365667970/image.png?ex=68f56883&is=68f41703&hm=e0255470e1350a936f4d36aa80e3145d594d19d5937279ef2e56d8780ea39d33&=&format=webp&quality=lossless&width=1857&height=976',
    alt: '🏗️ Obras del gobierno - Construyendo el futuro'
  }
];

const GaleriaRP = () => {
  const [discordMembers, setDiscordMembers] = useState([]);
  const [currentMemberIndex, setCurrentMemberIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [totalMembers, setTotalMembers] = useState(0);

  // Cargar miembros de Discord
  useEffect(() => {
    loadDiscordMembers();
  }, []);

  // Auto-rotación del carrusel
  useEffect(() => {
    if (!isPlaying || discordMembers.length === 0) return;

    const interval = setInterval(() => {
      setCurrentMemberIndex((prev) => {
        const nextIndex = (prev + 1) % discordMembers.length;
        
        // Si llegamos al final de la tanda actual y hay más páginas, cargar siguiente tanda
        if (nextIndex === 0 && hasMore) {
          console.log('[GALERIA] Fin de tanda, cargando siguiente página...');
          loadDiscordMembers(currentPage + 1);
          return 0; // Mantener índice en 0 para la nueva tanda
        }
        
        return nextIndex;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [isPlaying, discordMembers.length, hasMore, currentPage]);

  const loadDiscordMembers = async (page = 0) => {
    try {
      setLoading(true);
      console.log(`[GALERIA] Cargando miembros de Discord - Página ${page}...`);
      
      const response = await fetch(apiUrl(`/api/discord/members?page=${page}`));
      const data = await response.json();
      
      if (data.success && data.members) {
        console.log(`[GALERIA] Cargados ${data.members.length} miembros de la página ${page}`);
        setDiscordMembers(data.members);
        setCurrentPage(page);
        setHasMore(data.hasMore);
        setTotalMembers(data.totalMembers);
        setCurrentMemberIndex(0); // Resetear índice al cargar nueva tanda
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
            <span>{galleryItems.length} Imágenes</span>
          </div>
          <div className="stat-item">
            <FaHeart />
            <span>{totalMembers} Total</span>
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
            {hasMore && (
              <button 
                className="control-btn next-tanda-btn" 
                onClick={() => loadDiscordMembers(currentPage + 1)}
                disabled={loading}
                title="Siguiente tanda"
              >
                {loading ? '...' : '→→'}
              </button>
            )}
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
          <h2>Mejores Momentos de SpainRP</h2>
          <div className="media-filters">
            <button className="filter-btn active">Todos</button>
            <button className="filter-btn">Fotos</button>
            <button className="filter-btn">Videos</button>
            <button className="filter-btn">Eventos</button>
          </div>
        </div>

        <div className="media-grid">
          {galleryItems.map((item, index) => (
            <div key={index} className="media-item">
              {item.type === 'image' && (
                <img 
                  src={item.src} 
                  alt={item.alt} 
                  className="media-image"
                  loading="lazy"
                />
              )}
              {item.type === 'video' && (
                <video 
                  src={item.src} 
                  controls 
                  className="media-video"
                  preload="metadata"
                />
              )}
              <div className="media-overlay">
                <h3 className="media-title">{item.alt}</h3>
                <div className="media-actions">
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
          ))}
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
