import { apiUrl } from '../../utils/api';
import React, { useState, useEffect } from "react";
import DiscordUserBar from '../DiscordUserBar';
import { 
  FaHeart, 
  FaTimes, 
  FaStar, 
  FaUser, 
  FaEdit, 
  FaCog, 
  FaSignOutAlt,
  FaCamera,
  FaMapMarkerAlt,
  FaBirthdayCake,
  FaGamepad,
  FaComment,
  FaUsers,
  FaFire,
  FaRocket
} from 'react-icons/fa';

const TinderRP = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [profiles, setProfiles] = useState([]);
  const [matches, setMatches] = useState([]);
  const [active, setActive] = useState(0);
  const [form, setForm] = useState({ 
    nombre: '', 
    edad: '', 
    roblox: '', 
    bio: '',
    ubicacion: '',
    intereses: [],
    genero: '',
    busco: ''
  });
  const [avatar, setAvatar] = useState(null);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [registering, setRegistering] = useState(false);
  const [fetchingAvatar, setFetchingAvatar] = useState(false);
  const [currentView, setCurrentView] = useState('discover'); // discover, matches, profile
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    edadMin: 18,
    edadMax: 50,
    genero: 'todos',
    ubicacion: ''
  });

  // Verificación JWT mejorada
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('spainrp_token');
        if (!token) {
          setUser(null);
          setLoading(false);
          return;
        }

        const response = await fetch(apiUrl('/auth/me'), {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        });

        if (response.status === 401) {
          localStorage.removeItem('spainrp_token');
          setUser(null);
        } else if (response.ok) {
          const data = await response.json();
          setUser(data.user);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Error verificando autenticación:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Cargar perfil propio con JWT
  useEffect(() => {
    if (!user) return;
    const token = localStorage.getItem('spainrp_token');
    if (!token) return;

    fetch(apiUrl('/api/tinder/me'), {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    })
      .then(res => res.ok ? res.json() : null)
      .then(data => { 
        if (data && data.profile) {
          setProfile(data.profile);
          setForm(prev => ({ ...prev, ...data.profile }));
        }
      })
      .catch(err => console.error('Error cargando perfil:', err));
  }, [user]);

  // Cargar perfiles de otros con JWT
  useEffect(() => {
    if (!user) return;
    const token = localStorage.getItem('spainrp_token');
    if (!token) return;

    fetch(apiUrl('/api/tinder/all'), {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    })
      .then(res => res.ok ? res.json() : null)
      .then(data => { 
        if (data && data.profiles) {
          setProfiles(data.profiles);
        }
      })
      .catch(err => console.error('Error cargando perfiles:', err));
  }, [user, msg]);

  // Cargar matches con JWT
  useEffect(() => {
    if (!user) return;
    const token = localStorage.getItem('spainrp_token');
    if (!token) return;

    fetch(apiUrl('/api/tinder/matches'), {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    })
      .then(res => res.ok ? res.json() : null)
      .then(data => { 
        if (data && data.matches) {
          setMatches(data.matches);
        }
      })
      .catch(err => console.error('Error cargando matches:', err));
  }, [user, msg]);

  // Buscar avatar de Roblox
  const fetchRobloxAvatar = async (roblox) => {
    setFetchingAvatar(true);
    setAvatar(null);
    setError("");
    try {
      const res = await fetch(apiUrl(`/api/roblox/avatar/${encodeURIComponent(roblox)}`));
      const data = await res.json();
      if (data.img) setAvatar(data.img);
      else setError('No se encontró el usuario de Roblox');
    } catch (err) {
      console.error('Error buscando avatar de Roblox:', err);
      setError('Error buscando avatar de Roblox');
    }
    setFetchingAvatar(false);
  };

  // Registro/edición de perfil con JWT
  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.nombre.trim() || !form.edad.trim() || !form.roblox.trim()) {
      setError('Completa todos los campos obligatorios');
      return;
    }
    if (!avatar) {
      setError('Debes buscar y confirmar tu avatar de Roblox');
      return;
    }
    
    setRegistering(true);
    const token = localStorage.getItem('spainrp_token');
    
    try {
    const res = await fetch(apiUrl('/api/tinder/me'), {
      method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
      body: JSON.stringify({
        nombre: form.nombre,
        edad: form.edad,
        roblox_user: form.roblox,
          bio: form.bio,
          ubicacion: form.ubicacion,
          intereses: form.intereses,
          genero: form.genero,
          busco: form.busco
      })
    });
      
    if (res.ok) {
        setMsg('Perfil guardado exitosamente');
        setTimeout(() => setMsg(''), 3000);
      setProfile({ ...form, img: avatar, roblox_user: form.roblox });
    } else {
        const errorData = await res.json();
        setError(errorData.error || 'Error guardando perfil');
      }
    } catch (err) {
      setError('Error de conexión');
    }
    setRegistering(false);
  };

  // Hacer match con JWT
  const handleMatch = async (other) => {
    if (!profile) { 
      setMsg('Completa tu perfil primero'); 
      setTimeout(() => setMsg(''), 2000); 
      return; 
    }
    
    const token = localStorage.getItem('spainrp_token');
    
    try {
    const res = await fetch(apiUrl('/api/tinder/match'), {
      method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
      body: JSON.stringify({ other_id: other.discord_id })
    });
      
    if (res.ok) {
      setMsg(`¡Has hecho match con ${other.nombre}! 💖`);
        setTimeout(() => setMsg(''), 3000);
        // Recargar matches
        const matchesRes = await fetch(apiUrl('/api/tinder/matches'), {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        });
        if (matchesRes.ok) {
          const matchesData = await matchesRes.json();
          setMatches(matchesData.matches || []);
        }
      } else {
        const errorData = await res.json();
        setMsg(errorData.error || 'Error al hacer match');
        setTimeout(() => setMsg(''), 2000);
      }
    } catch (err) {
      setMsg('Error de conexión');
      setTimeout(() => setMsg(''), 2000);
    }
    
    setActive((active + 1) % profiles.length);
  };

  // Rechazar perfil
  const handleReject = () => {
    setActive((active + 1) % profiles.length);
  };

  // Super like
  const handleSuperLike = async (other) => {
    if (!profile) return;
    
    const token = localStorage.getItem('spainrp_token');
    
    try {
      const res = await fetch(apiUrl('/api/tinder/superlike'), {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify({ other_id: other.discord_id })
      });
      
      if (res.ok) {
        setMsg(`¡Super like enviado a ${other.nombre}! ⭐`);
        setTimeout(() => setMsg(''), 3000);
    } else {
        setMsg('Error enviando super like');
        setTimeout(() => setMsg(''), 2000);
      }
    } catch (err) {
      setMsg('Error de conexión');
      setTimeout(() => setMsg(''), 2000);
    }
    
    setActive((active + 1) % profiles.length);
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #ff6b6b 0%, #ff8e8e 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column'
      }}>
        <div style={{
          width: '60px',
          height: '60px',
          border: '4px solid rgba(255,255,255,0.3)',
          borderTop: '4px solid white',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <p style={{ color: 'white', marginTop: '20px', fontSize: '18px', fontWeight: '600' }}>
          Cargando TinderRP...
        </p>
        <style>{`
          @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        `}</style>
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #ff6b6b 0%, #ff8e8e 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontFamily: 'Inter, sans-serif'
      }}>
        <div style={{ textAlign: 'center', maxWidth: '400px', padding: '20px' }}>
          <div style={{ fontSize: '4rem', marginBottom: '20px' }}>💕</div>
          <h1 style={{ fontSize: '3rem', fontWeight: '900', marginBottom: '10px', letterSpacing: '2px' }}>
            TinderRP
          </h1>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '30px', opacity: 0.9 }}>
            Encuentra tu pareja perfecta en SpainRP
          </h2>
          <p style={{ fontSize: '1.1rem', marginBottom: '40px', opacity: 0.8, lineHeight: '1.6' }}>
            Conecta con otros jugadores, haz matches y vive historias de amor únicas en el mejor servidor de roleplay español.
          </p>
          <a 
            href="/auth/login" 
            style={{
              background: 'white',
              color: '#ff6b6b',
              borderRadius: '25px',
              padding: '15px 40px',
              fontWeight: '800',
              textDecoration: 'none',
              fontSize: '1.2rem',
              boxShadow: '0 8px 25px rgba(0,0,0,0.2)',
              display: 'inline-block',
              transition: 'transform 0.2s ease'
            }}
            onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
            onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
          >
            Iniciar sesión con Discord
          </a>
        </div>
        <div style={{
          position: 'fixed',
          bottom: '20px',
          width: '100%',
          textAlign: 'center',
          fontSize: '0.9rem',
          opacity: 0.7
        }}>
          💖 Solo para miembros de SpainRP • Autenticación segura
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #ff6b6b 0%, #ff8e8e 100%)',
      fontFamily: 'Inter, sans-serif'
    }}>
      <DiscordUserBar />
      
      {/* Header */}
      <div style={{
        background: 'rgba(255,255,255,0.1)',
        backdropFilter: 'blur(10px)',
        padding: '15px 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <h1 style={{
          color: 'white',
          fontSize: '1.8rem',
          fontWeight: '900',
          margin: 0,
          letterSpacing: '1px'
        }}>
          TinderRP
        </h1>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => setCurrentView('discover')}
            style={{
              background: currentView === 'discover' ? 'white' : 'rgba(255,255,255,0.2)',
              color: currentView === 'discover' ? '#ff6b6b' : 'white',
              border: 'none',
              borderRadius: '20px',
              padding: '8px 16px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <FaRocket style={{ marginRight: '5px' }} />
            Descubrir
          </button>
          <button
            onClick={() => setCurrentView('matches')}
            style={{
              background: currentView === 'matches' ? 'white' : 'rgba(255,255,255,0.2)',
              color: currentView === 'matches' ? '#ff6b6b' : 'white',
              border: 'none',
              borderRadius: '20px',
              padding: '8px 16px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <FaHeart style={{ marginRight: '5px' }} />
            Matches ({matches.length})
          </button>
          <button
            onClick={() => setCurrentView('profile')}
            style={{
              background: currentView === 'profile' ? 'white' : 'rgba(255,255,255,0.2)',
              color: currentView === 'profile' ? '#ff6b6b' : 'white',
              border: 'none',
              borderRadius: '20px',
              padding: '8px 16px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <FaUser style={{ marginRight: '5px' }} />
            Perfil
          </button>
        </div>
      </div>

      {/* Contenido principal */}
      <div style={{ padding: '20px', maxWidth: '400px', margin: '0 auto' }}>
        
        {/* Mensaje de estado */}
        {msg && (
          <div style={{
            background: 'white',
            color: '#ff6b6b',
            borderRadius: '15px',
            padding: '15px',
            marginBottom: '20px',
            textAlign: 'center',
            fontWeight: '600',
            boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
            animation: 'slideDown 0.3s ease'
          }}>
            {msg}
          </div>
        )}

        {/* Vista de Descubrir */}
        {currentView === 'discover' && (
          <div>
            {!profile ? (
              <div style={{
                background: 'white',
                borderRadius: '20px',
                padding: '30px',
                textAlign: 'center',
                boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
                marginBottom: '20px'
              }}>
                <div style={{ fontSize: '3rem', marginBottom: '20px' }}>👤</div>
                <h2 style={{ color: '#ff6b6b', marginBottom: '15px', fontSize: '1.5rem' }}>
                  Crea tu perfil
                </h2>
                <p style={{ color: '#666', marginBottom: '25px', lineHeight: '1.5' }}>
                  Completa tu perfil para empezar a conocer gente increíble en SpainRP
                </p>
                <button
                  onClick={() => setCurrentView('profile')}
                  style={{
                    background: '#ff6b6b',
                    color: 'white',
                    border: 'none',
                    borderRadius: '25px',
                    padding: '12px 30px',
                    fontSize: '16px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    boxShadow: '0 4px 15px rgba(255,107,107,0.3)'
                  }}
                >
                  Crear Perfil
                </button>
              </div>
            ) : (
              <div>
                {profiles.length === 0 ? (
                  <div style={{
                    background: 'white',
                    borderRadius: '20px',
                    padding: '40px 30px',
                    textAlign: 'center',
                    boxShadow: '0 8px 25px rgba(0,0,0,0.1)'
                  }}>
                    <div style={{ fontSize: '4rem', marginBottom: '20px' }}>💔</div>
                    <h3 style={{ color: '#ff6b6b', marginBottom: '15px' }}>
                      No hay más perfiles
                    </h3>
                    <p style={{ color: '#666', marginBottom: '20px' }}>
                      Vuelve más tarde para ver nuevos perfiles
                    </p>
                    <button
                      onClick={() => window.location.reload()}
                      style={{
                        background: '#ff6b6b',
                        color: 'white',
                        border: 'none',
                        borderRadius: '20px',
                        padding: '10px 25px',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: 'pointer'
                      }}
                    >
                      Actualizar
                    </button>
                  </div>
                ) : (
                  <div style={{
                    background: 'white',
                    borderRadius: '20px',
                    padding: '20px',
                    boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
                    position: 'relative',
                    minHeight: '500px'
                  }}>
                    <div style={{ textAlign: 'center' }}>
                      <img
                        src={apiUrl(`/api/roblox/avatar/${profiles[active].roblox_user}`)}
                        alt={profiles[active].nombre}
                        style={{
                          width: '200px',
                          height: '200px',
                          borderRadius: '50%',
                          objectFit: 'cover',
                          marginBottom: '20px',
                          boxShadow: '0 8px 25px rgba(0,0,0,0.1)'
                        }}
                        onError={(e) => e.target.style.opacity = 0.3}
                      />
                      <h3 style={{
                        fontSize: '1.8rem',
                        fontWeight: '700',
                        color: '#333',
                        marginBottom: '5px'
                      }}>
                        {profiles[active].nombre}
                      </h3>
                      <p style={{
                        color: '#666',
                        marginBottom: '15px',
                        fontSize: '1.1rem'
                      }}>
                        {profiles[active].edad} años
                      </p>
                      {profiles[active].bio && (
                        <p style={{
                          color: '#555',
                          lineHeight: '1.5',
                          marginBottom: '30px',
                          fontSize: '1rem'
                        }}>
                          {profiles[active].bio}
                        </p>
                      )}
              </div>

                    {/* Botones de acción */}
                    <div style={{
                      display: 'flex',
                      justifyContent: 'center',
                      gap: '20px',
                      marginTop: '30px'
                    }}>
                      <button
                        onClick={handleReject}
                        style={{
                          background: '#ff4757',
                          color: 'white',
                          border: 'none',
                          borderRadius: '50%',
                          width: '60px',
                          height: '60px',
                          fontSize: '1.5rem',
                          cursor: 'pointer',
                          boxShadow: '0 4px 15px rgba(255,71,87,0.3)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <FaTimes />
                      </button>
                      <button
                        onClick={() => handleSuperLike(profiles[active])}
                        style={{
                          background: '#3742fa',
                          color: 'white',
                          border: 'none',
                          borderRadius: '50%',
                          width: '60px',
                          height: '60px',
                          fontSize: '1.5rem',
                          cursor: 'pointer',
                          boxShadow: '0 4px 15px rgba(55,66,250,0.3)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <FaStar />
                      </button>
                      <button
                        onClick={() => handleMatch(profiles[active])}
                        style={{
                          background: '#2ed573',
                          color: 'white',
                          border: 'none',
                          borderRadius: '50%',
                          width: '60px',
                          height: '60px',
                          fontSize: '1.5rem',
                          cursor: 'pointer',
                          boxShadow: '0 4px 15px rgba(46,213,115,0.3)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <FaHeart />
                      </button>
                </div>
              </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Vista de Matches */}
        {currentView === 'matches' && (
          <div>
            {matches.length === 0 ? (
              <div style={{
                background: 'white',
                borderRadius: '20px',
                padding: '40px 30px',
                textAlign: 'center',
                boxShadow: '0 8px 25px rgba(0,0,0,0.1)'
              }}>
                <div style={{ fontSize: '4rem', marginBottom: '20px' }}>💔</div>
                <h3 style={{ color: '#ff6b6b', marginBottom: '15px' }}>
                  Aún no tienes matches
                </h3>
                <p style={{ color: '#666', marginBottom: '20px' }}>
                  Sigue deslizando para encontrar tu pareja perfecta
                </p>
                <button
                  onClick={() => setCurrentView('discover')}
                  style={{
                    background: '#ff6b6b',
                    color: 'white',
                    border: 'none',
                    borderRadius: '20px',
                    padding: '10px 25px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Empezar a deslizar
                </button>
              </div>
            ) : (
              <div style={{
                background: 'white',
                borderRadius: '20px',
                padding: '20px',
                boxShadow: '0 8px 25px rgba(0,0,0,0.1)'
              }}>
                <h3 style={{
                  color: '#ff6b6b',
                  marginBottom: '20px',
                  fontSize: '1.3rem',
                  fontWeight: '700'
                }}>
                  Tus Matches ({matches.length})
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  {matches.map((match, index) => (
                    <div
                      key={match.id || index}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '15px',
                        background: '#f8f9fa',
                        borderRadius: '15px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseOver={(e) => e.target.style.background = '#e9ecef'}
                      onMouseOut={(e) => e.target.style.background = '#f8f9fa'}
                    >
                      <img
                        src={apiUrl(`/api/roblox/avatar/${match.roblox_user}`)}
                        alt={match.nombre}
                        style={{
                          width: '50px',
                          height: '50px',
                          borderRadius: '50%',
                          objectFit: 'cover',
                          marginRight: '15px',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                        }}
                        onError={(e) => e.target.style.opacity = 0.3}
                      />
                      <div style={{ flex: 1 }}>
                        <h4 style={{
                          margin: 0,
                          fontSize: '1.1rem',
                          fontWeight: '600',
                          color: '#333'
                        }}>
                          {match.nombre}
                        </h4>
                        <p style={{
                          margin: '5px 0 0 0',
                          fontSize: '0.9rem',
                          color: '#666'
                        }}>
                          {match.edad} años
                        </p>
                      </div>
                      <button
                        style={{
                          background: '#ff6b6b',
                          color: 'white',
                          border: 'none',
                          borderRadius: '20px',
                          padding: '8px 15px',
                          fontSize: '12px',
                          fontWeight: '600',
                          cursor: 'pointer'
                        }}
                      >
                        <FaComment style={{ marginRight: '5px' }} />
                        Chat
                      </button>
                    </div>
                  ))}
            </div>
              </div>
            )}
          </div>
        )}

        {/* Vista de Perfil */}
        {currentView === 'profile' && (
          <div style={{
            background: 'white',
            borderRadius: '20px',
            padding: '30px',
            boxShadow: '0 8px 25px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{
              color: '#ff6b6b',
              marginBottom: '25px',
              fontSize: '1.5rem',
              fontWeight: '700',
              textAlign: 'center'
            }}>
              {profile ? 'Editar Perfil' : 'Crear Perfil'}
            </h3>
            
            <form onSubmit={handleRegister}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  fontWeight: '600',
                  color: '#333',
                  marginBottom: '8px'
                }}>
                  Nombre *
                </label>
                <input
                  type="text"
                  value={form.nombre}
                  onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '12px 15px',
                    borderRadius: '10px',
                    border: '2px solid #e9ecef',
                    fontSize: '16px',
                    outline: 'none',
                    transition: 'border-color 0.2s ease'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#ff6b6b'}
                  onBlur={(e) => e.target.style.borderColor = '#e9ecef'}
                  required
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  fontWeight: '600',
                  color: '#333',
                  marginBottom: '8px'
                }}>
                  Edad *
                </label>
                <input
                  type="number"
                  value={form.edad}
                  onChange={e => setForm(f => ({ ...f, edad: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '12px 15px',
                    borderRadius: '10px',
                    border: '2px solid #e9ecef',
                    fontSize: '16px',
                    outline: 'none',
                    transition: 'border-color 0.2s ease'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#ff6b6b'}
                  onBlur={(e) => e.target.style.borderColor = '#e9ecef'}
                  required
                  min={18}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  fontWeight: '600',
                  color: '#333',
                  marginBottom: '8px'
                }}>
                  Usuario de Roblox *
                </label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <input
                    type="text"
                    value={form.roblox}
                    onChange={e => setForm(f => ({ ...f, roblox: e.target.value }))}
                    style={{
                      flex: 1,
                      padding: '12px 15px',
                      borderRadius: '10px',
                      border: '2px solid #e9ecef',
                      fontSize: '16px',
                      outline: 'none',
                      transition: 'border-color 0.2s ease'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#ff6b6b'}
                    onBlur={(e) => e.target.style.borderColor = '#e9ecef'}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => fetchRobloxAvatar(form.roblox)}
                    style={{
                      background: '#ff6b6b',
                      color: 'white',
                      border: 'none',
                      borderRadius: '10px',
                      padding: '12px 20px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    <FaCamera style={{ marginRight: '5px' }} />
                    Buscar
                  </button>
                </div>
                {fetchingAvatar && (
                  <div style={{ color: '#ff6b6b', marginTop: '8px', fontSize: '14px' }}>
                    Buscando avatar...
                  </div>
                )}
                {avatar && (
                  <img
                    src={avatar}
                    alt="avatar roblox"
                    style={{
                      width: '80px',
                      height: '80px',
                      borderRadius: '50%',
                      marginTop: '10px',
                      boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
                    }}
                  />
                )}
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  fontWeight: '600',
                  color: '#333',
                  marginBottom: '8px'
                }}>
                  Bio
                </label>
                <textarea
                  value={form.bio}
                  onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '12px 15px',
                    borderRadius: '10px',
                    border: '2px solid #e9ecef',
                    fontSize: '16px',
                    outline: 'none',
                    minHeight: '80px',
                    resize: 'vertical',
                    transition: 'border-color 0.2s ease'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#ff6b6b'}
                  onBlur={(e) => e.target.style.borderColor = '#e9ecef'}
                  maxLength={200}
                  placeholder="Cuéntanos algo sobre ti..."
                />
                <div style={{
                  fontSize: '12px',
                  color: '#666',
                  textAlign: 'right',
                  marginTop: '5px'
                }}>
                  {form.bio.length}/200
                </div>
              </div>

              {error && (
                <div style={{
                  background: '#ffe6e6',
                  color: '#ff4757',
                  borderRadius: '10px',
                  padding: '12px',
                  marginBottom: '20px',
                  textAlign: 'center',
                  fontSize: '14px',
                  fontWeight: '500'
                }}>
                  {error}
          </div>
        )}

              <button
                type="submit"
                disabled={registering}
                style={{
                  width: '100%',
                  background: registering ? '#ccc' : '#ff6b6b',
                  color: 'white',
                  border: 'none',
                  borderRadius: '15px',
                  padding: '15px',
                  fontSize: '16px',
                  fontWeight: '700',
                  cursor: registering ? 'not-allowed' : 'pointer',
                  boxShadow: '0 4px 15px rgba(255,107,107,0.3)',
                  transition: 'all 0.2s ease'
                }}
                onMouseOver={(e) => !registering && (e.target.style.transform = 'translateY(-2px)')}
                onMouseOut={(e) => !registering && (e.target.style.transform = 'translateY(0)')}
              >
                {registering ? 'Guardando...' : (profile ? 'Actualizar Perfil' : 'Crear Perfil')}
              </button>
            </form>
          </div>
        )}
      </div>

      <style>{`
        @keyframes slideDown {
          from { transform: translateY(-20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default TinderRP;
