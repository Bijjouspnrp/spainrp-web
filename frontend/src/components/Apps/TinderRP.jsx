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
  const [loadingAvatars, setLoadingAvatars] = useState({});
  const [currentView, setCurrentView] = useState('discover'); // discover, matches, profile, myProfile
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

    const loadProfile = async () => {
      try {
        const res = await fetch(apiUrl('/api/tinder/me'), {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        });
        
        if (res.ok) {
          const data = await res.json();
          if (data && data.profile) {
            console.log('Perfil cargado:', data.profile);
            setProfile(data.profile);
            
            // Convertir intereses de string a array si es necesario
            const intereses = data.profile.intereses ? 
              (typeof data.profile.intereses === 'string' ? 
                data.profile.intereses.split(',').map(i => i.trim()).filter(i => i) : 
                data.profile.intereses) : [];
            
            setForm(prev => ({ 
              ...prev, 
              ...data.profile,
              intereses: intereses,
              roblox: data.profile.roblox_user || data.profile.roblox || ''
            }));
            
            // Si hay avatar, cargarlo
            if (data.profile.roblox_user) {
              fetchRobloxAvatar(data.profile.roblox_user);
            }
          }
        } else {
          console.log('No hay perfil creado aún');
        }
      } catch (err) {
        console.error('Error cargando perfil:', err);
      }
    };

    loadProfile();
  }, [user]);

  // Cargar perfiles de otros con JWT
  useEffect(() => {
    if (!user) return;
    const token = localStorage.getItem('spainrp_token');
    if (!token) return;

    const loadProfiles = async () => {
      try {
        const res = await fetch(apiUrl('/api/tinder/all'), {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        });
        
        if (res.ok) {
          const data = await res.json();
          if (data && data.profiles) {
            console.log('Perfiles cargados:', data.profiles.length);
            setProfiles(data.profiles);
            
            // Inicializar estado de carga para todos los avatares
            const loadingState = {};
            data.profiles.forEach(profile => {
              if (profile.roblox_user) {
                loadingState[profile.roblox_user] = true;
              }
            });
            setLoadingAvatars(loadingState);
          }
        } else {
          console.error('Error cargando perfiles:', res.status);
        }
      } catch (err) {
        console.error('Error cargando perfiles:', err);
      }
    };

    loadProfiles();
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
        
        // Actualizar el perfil local
      setProfile({ ...form, img: avatar, roblox_user: form.roblox });
        
        // Recargar perfiles para que aparezca en la lista de otros usuarios
        const profilesRes = await fetch(apiUrl('/api/tinder/all'), {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        });
        
        if (profilesRes.ok) {
          const profilesData = await profilesRes.json();
          if (profilesData && profilesData.profiles) {
            setProfiles(profilesData.profiles);
            console.log('Perfiles recargados después de guardar:', profilesData.profiles.length);
          }
        }
        
        // Cambiar a vista de descubrir después de guardar
        setCurrentView('discover');
    } else {
        const errorData = await res.json();
        setError(errorData.error || 'Error guardando perfil');
      }
    } catch (err) {
      console.error('Error guardando perfil:', err);
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
    
    if (profiles.length === 0) return;
    
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
        const data = await res.json();
        if (data.already) {
          setMsg(`Ya tienes match con ${other.nombre}! 💖`);
        } else {
      setMsg(`¡Has hecho match con ${other.nombre}! 💖`);
        }
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
      console.error('Error en match:', err);
      setMsg('Error de conexión');
      setTimeout(() => setMsg(''), 2000);
    }
    
    // Cambiar al siguiente perfil
    setActive((active + 1) % profiles.length);
    
    // Si no hay más perfiles, mostrar mensaje
    if (profiles.length === 1) {
      setTimeout(() => {
        setMsg('No hay más perfiles disponibles');
        setTimeout(() => setMsg(''), 3000);
      }, 1000);
    }
  };

  // Rechazar perfil
  const handleReject = () => {
    if (profiles.length === 0) return;
    
    // Mostrar mensaje de rechazo
    setMsg(`Has rechazado a ${profiles[active].nombre} ❌`);
    setTimeout(() => setMsg(''), 2000);
    
    // Cambiar al siguiente perfil
    setActive((active + 1) % profiles.length);
    
    // Si no hay más perfiles, mostrar mensaje
    if (profiles.length === 1) {
      setTimeout(() => {
        setMsg('No hay más perfiles disponibles');
        setTimeout(() => setMsg(''), 3000);
      }, 1000);
    }
  };

  // Super like
  const handleSuperLike = async (other) => {
    if (!profile) {
      setMsg('Completa tu perfil primero');
      setTimeout(() => setMsg(''), 2000);
      return;
    }
    
    if (profiles.length === 0) return;
    
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
        const data = await res.json();
        if (data.already) {
          setMsg(`Ya tienes match con ${other.nombre}! ⭐`);
    } else {
          setMsg(`¡Super like enviado a ${other.nombre}! ⭐`);
        }
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
        setMsg(errorData.error || 'Error enviando super like');
      setTimeout(() => setMsg(''), 2000);
    }
    } catch (err) {
      console.error('Error en super like:', err);
      setMsg('Error de conexión');
      setTimeout(() => setMsg(''), 2000);
    }
    
    // Cambiar al siguiente perfil
    setActive((active + 1) % profiles.length);
    
    // Si no hay más perfiles, mostrar mensaje
    if (profiles.length === 1) {
      setTimeout(() => {
        setMsg('No hay más perfiles disponibles');
        setTimeout(() => setMsg(''), 3000);
      }, 1000);
    }
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
          
          .spin {
            animation: spin 1s linear infinite;
          }
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
      
      {/* Aviso de desarrollo */}
      <div style={{
        background: 'linear-gradient(135deg, #ffa502, #ff6348)',
        color: 'white',
        padding: '12px 20px',
        textAlign: 'center',
        fontSize: '14px',
        fontWeight: '600',
        boxShadow: '0 4px 15px rgba(255,165,2,0.3)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: '0',
          left: '0',
          right: '0',
          height: '2px',
          background: 'linear-gradient(90deg, #ffa502, #ff6348, #ffa502)',
          animation: 'shimmer 2s infinite'
        }}></div>
        🚧 TinderRP está en desarrollo - Funcionalidades limitadas 🚧
      </div>

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
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setCurrentView('discover')}
            style={{
              background: currentView === 'discover' ? 'white' : 'rgba(255,255,255,0.2)',
              color: currentView === 'discover' ? '#ff6b6b' : 'white',
              border: 'none',
              borderRadius: '25px',
              padding: '10px 18px',
              fontSize: '13px',
              fontWeight: '700',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: currentView === 'discover' ? '0 4px 15px rgba(255,255,255,0.3)' : 'none',
              transform: currentView === 'discover' ? 'translateY(-2px)' : 'translateY(0)'
            }}
            onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
            onMouseOut={(e) => e.target.style.transform = currentView === 'discover' ? 'translateY(-2px)' : 'translateY(0)'}
          >
            <FaRocket style={{ marginRight: '6px' }} />
            Descubrir
          </button>
          <button
            onClick={() => setCurrentView('matches')}
            style={{
              background: currentView === 'matches' ? 'white' : 'rgba(255,255,255,0.2)',
              color: currentView === 'matches' ? '#ff6b6b' : 'white',
              border: 'none',
              borderRadius: '25px',
              padding: '10px 18px',
              fontSize: '13px',
              fontWeight: '700',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: currentView === 'matches' ? '0 4px 15px rgba(255,255,255,0.3)' : 'none',
              transform: currentView === 'matches' ? 'translateY(-2px)' : 'translateY(0)'
            }}
            onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
            onMouseOut={(e) => e.target.style.transform = currentView === 'matches' ? 'translateY(-2px)' : 'translateY(0)'}
          >
            <FaHeart style={{ marginRight: '6px' }} />
            Matches ({matches.length})
          </button>
          {profile && (
            <button
              onClick={() => setCurrentView('myProfile')}
              style={{
                background: currentView === 'myProfile' ? 'white' : 'rgba(255,255,255,0.2)',
                color: currentView === 'myProfile' ? '#ff6b6b' : 'white',
                border: 'none',
                borderRadius: '25px',
                padding: '10px 18px',
                fontSize: '13px',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: currentView === 'myProfile' ? '0 4px 15px rgba(255,255,255,0.3)' : 'none',
                transform: currentView === 'myProfile' ? 'translateY(-2px)' : 'translateY(0)'
              }}
              onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
              onMouseOut={(e) => e.target.style.transform = currentView === 'myProfile' ? 'translateY(-2px)' : 'translateY(0)'}
            >
              <FaUser style={{ marginRight: '6px' }} />
              Mi Perfil
            </button>
          )}
          <button
            onClick={() => setCurrentView('profile')}
            style={{
              background: currentView === 'profile' ? 'white' : 'rgba(255,255,255,0.2)',
              color: currentView === 'profile' ? '#ff6b6b' : 'white',
              border: 'none',
              borderRadius: '25px',
              padding: '10px 18px',
              fontSize: '13px',
              fontWeight: '700',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: currentView === 'profile' ? '0 4px 15px rgba(255,255,255,0.3)' : 'none',
              transform: currentView === 'profile' ? 'translateY(-2px)' : 'translateY(0)'
            }}
            onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
            onMouseOut={(e) => e.target.style.transform = currentView === 'profile' ? 'translateY(-2px)' : 'translateY(0)'}
          >
            <FaEdit style={{ marginRight: '6px' }} />
            {profile ? 'Editar' : 'Crear'}
          </button>
              </div>
              </div>

      {/* Contenido principal */}
      <div style={{ 
        padding: '20px', 
        maxWidth: '450px', 
        margin: '0 auto',
        minHeight: 'calc(100vh - 120px)'
      }}>
        
        {/* Mensaje de estado */}
        {msg && (
          <div 
            className="fade-in"
            style={{
              background: 'linear-gradient(135deg, #ffffff, #f8f9fa)',
              color: '#ff6b6b',
              borderRadius: '20px',
              padding: '20px',
              marginBottom: '25px',
              textAlign: 'center',
              fontWeight: '700',
              boxShadow: '0 8px 25px rgba(255,107,107,0.2)',
              border: '2px solid rgba(255,107,107,0.1)',
              fontSize: '16px',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <div style={{
              position: 'absolute',
              top: '0',
              left: '0',
              right: '0',
              height: '3px',
              background: 'linear-gradient(90deg, #ff6b6b, #ff8e8e, #ff6b6b)',
              animation: 'shimmer 2s infinite'
            }}></div>
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
                  <div 
                    className="fade-in"
                    style={{
                      background: 'white',
                      borderRadius: '25px',
                      padding: '50px 30px',
                      textAlign: 'center',
                      boxShadow: '0 15px 35px rgba(0,0,0,0.1)',
                      border: '1px solid rgba(255,107,107,0.1)'
                    }}
                  >
                    <div style={{ fontSize: '5rem', marginBottom: '25px' }}>💔</div>
                    <h3 style={{ 
                      color: '#ff6b6b', 
                      marginBottom: '20px',
                      fontSize: '1.8rem',
                      fontWeight: '800'
                    }}>
                      No hay más perfiles
                    </h3>
                    <p style={{ 
                      color: '#666', 
                      marginBottom: '30px',
                      fontSize: '1.1rem',
                      lineHeight: '1.6'
                    }}>
                      Has visto todos los perfiles disponibles.<br/>
                      ¡Vuelve más tarde para ver nuevos usuarios!
                    </p>
                    <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
                      <button
                        onClick={() => window.location.reload()}
                        className="button-hover"
                        style={{
                          background: 'linear-gradient(135deg, #ff6b6b, #ff8e8e)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '25px',
                          padding: '15px 30px',
                          fontSize: '16px',
                          fontWeight: '700',
                          cursor: 'pointer',
                          boxShadow: '0 8px 25px rgba(255,107,107,0.3)',
                          transition: 'all 0.3s ease'
                        }}
                        onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
                        onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
                      >
                        🔄 Actualizar
                      </button>
                      <button
                        onClick={() => setCurrentView('matches')}
                        className="button-hover"
                        style={{
                          background: 'linear-gradient(135deg, #3742fa, #5352ed)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '25px',
                          padding: '15px 30px',
                          fontSize: '16px',
                          fontWeight: '700',
                          cursor: 'pointer',
                          boxShadow: '0 8px 25px rgba(55,66,250,0.3)',
                          transition: 'all 0.3s ease'
                        }}
                        onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
                        onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
                      >
                        💕 Ver Matches
                      </button>
              </div>
                  </div>
                ) : (
                  <div 
                    className="card-hover fade-in"
                    style={{
                      background: 'white',
                      borderRadius: '25px',
                      padding: '25px',
                      boxShadow: '0 15px 35px rgba(0,0,0,0.1)',
                      position: 'relative',
                      minHeight: '550px',
                      border: '1px solid rgba(255,107,107,0.1)',
                      overflow: 'hidden'
                    }}
                  >
                    <div style={{ textAlign: 'center', position: 'relative' }}>
                      <div style={{
                        position: 'relative',
                        display: 'inline-block',
                        marginBottom: '20px'
                      }}>
                        <img
                          src={apiUrl(`/api/roblox/avatar/${profiles[active].roblox_user}`)}
                          alt={profiles[active].nombre}
                          style={{
                            width: '200px',
                            height: '200px',
                            borderRadius: '50%',
                            objectFit: 'cover',
                            boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
                            border: '4px solid white',
                            transition: 'opacity 0.3s ease'
                          }}
                          onLoad={(e) => {
                            console.log('Avatar cargado correctamente:', profiles[active].roblox_user);
                            setLoadingAvatars(prev => ({ ...prev, [profiles[active].roblox_user]: false }));
                          }}
                          onError={(e) => {
                            console.error('Error cargando avatar de Roblox:', profiles[active].roblox_user);
                            setLoadingAvatars(prev => ({ ...prev, [profiles[active].roblox_user]: false }));
                            e.target.style.opacity = 0.3;
                            e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjBGMEYwIi8+CjxjaXJjbGUgY3g9IjEwMCIgY3k9IjcwIiByPSIyNSIgZmlsbD0iI0NDQ0NDQyIvPgo8cGF0aCBkPSJNNTAgMTQwQzUwIDEyMCA3MCAxMDAgMTAwIDEwMEMxMzAgMTAwIDE1MCAxMjAgMTUwIDE0MEg1MFoiIGZpbGw9IiNDQ0NDQ0MiLz4KPC9zdmc+Cg==';
                          }}
                        />
                        {loadingAvatars[profiles[active].roblox_user] && (
                          <div style={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            background: 'rgba(255,255,255,0.9)',
                            borderRadius: '50%',
                            width: '60px',
                            height: '60px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
                          }}>
                            <div style={{
                              width: '30px',
                              height: '30px',
                              border: '3px solid #ff6b6b',
                              borderTop: '3px solid transparent',
                              borderRadius: '50%',
                              animation: 'spin 1s linear infinite'
                            }}></div>
          </div>
        )}
                      </div>
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
                        marginBottom: '10px',
                        fontSize: '1.1rem'
                      }}>
                        {profiles[active].edad} años
                      </p>
                      {profiles[active].ubicacion && (
                        <p style={{
                          color: '#888',
                          marginBottom: '10px',
                          fontSize: '0.9rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '5px'
                        }}>
                          <FaMapMarkerAlt /> {profiles[active].ubicacion}
                        </p>
                      )}
                      {profiles[active].bio && (
                        <p style={{
                          color: '#555',
                          lineHeight: '1.5',
                          marginBottom: '20px',
                          fontSize: '1rem',
                          fontStyle: 'italic'
                        }}>
                          "{profiles[active].bio}"
                        </p>
                      )}
                      {profiles[active].intereses && (
                        <div style={{
                          display: 'flex',
                          flexWrap: 'wrap',
                          gap: '8px',
                          justifyContent: 'center',
                          marginBottom: '20px'
                        }}>
                          {profiles[active].intereses.split(',').map((interes, idx) => (
                            <span
                              key={idx}
                              style={{
                                background: '#ff6b6b',
                                color: 'white',
                                padding: '4px 12px',
                                borderRadius: '15px',
                                fontSize: '0.8rem',
                                fontWeight: '500'
                              }}
                            >
                              {interes.trim()}
                            </span>
                          ))}
                        </div>
                      )}
              </div>

                    {/* Botones de acción */}
                    <div style={{
                      display: 'flex',
                      justifyContent: 'center',
                      gap: '25px',
                      marginTop: '35px'
                    }}>
                      <button
                        onClick={() => {
                          handleReject();
                          // Efecto visual de rechazo
                          const button = event.target;
                          button.style.transform = 'scale(0.9) rotate(-10deg)';
                          setTimeout(() => {
                            button.style.transform = 'scale(1) rotate(0deg)';
                          }, 150);
                        }}
                        className="button-hover"
                        style={{
                          background: 'linear-gradient(135deg, #ff4757, #ff6b7a)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '50%',
                          width: '65px',
                          height: '65px',
                          fontSize: '1.6rem',
                          cursor: 'pointer',
                          boxShadow: '0 8px 25px rgba(255,71,87,0.4)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                          position: 'relative',
                          overflow: 'hidden'
                        }}
                        onMouseOver={(e) => {
                          e.target.style.transform = 'scale(1.1) rotate(-5deg)';
                          e.target.style.boxShadow = '0 12px 35px rgba(255,71,87,0.6)';
                        }}
                        onMouseOut={(e) => {
                          e.target.style.transform = 'scale(1) rotate(0deg)';
                          e.target.style.boxShadow = '0 8px 25px rgba(255,71,87,0.4)';
                        }}
                      >
                        <FaTimes />
                      </button>
                      <button
                        onClick={(e) => {
                          handleSuperLike(profiles[active]);
                          // Efecto visual de super like
                          const button = e.target;
                          button.style.transform = 'scale(1.2) rotate(10deg)';
                          button.style.boxShadow = '0 15px 40px rgba(55,66,250,0.8)';
                          setTimeout(() => {
                            button.style.transform = 'scale(1) rotate(0deg)';
                            button.style.boxShadow = '0 8px 25px rgba(55,66,250,0.4)';
                          }, 200);
                        }}
                        className="button-hover pulse"
                        style={{
                          background: 'linear-gradient(135deg, #3742fa, #5352ed)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '50%',
                          width: '70px',
                          height: '70px',
                          fontSize: '1.8rem',
                          cursor: 'pointer',
                          boxShadow: '0 8px 25px rgba(55,66,250,0.4)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                          position: 'relative',
                          overflow: 'hidden'
                        }}
                        onMouseOver={(e) => {
                          e.target.style.transform = 'scale(1.15) rotate(5deg)';
                          e.target.style.boxShadow = '0 12px 35px rgba(55,66,250,0.6)';
                        }}
                        onMouseOut={(e) => {
                          e.target.style.transform = 'scale(1) rotate(0deg)';
                          e.target.style.boxShadow = '0 8px 25px rgba(55,66,250,0.4)';
                        }}
                      >
                        <FaStar />
                      </button>
                      <button
                        onClick={(e) => {
                          handleMatch(profiles[active]);
                          // Efecto visual de like
                          const button = e.target;
                          button.style.transform = 'scale(1.2) rotate(-10deg)';
                          button.style.boxShadow = '0 15px 40px rgba(46,213,115,0.8)';
                          setTimeout(() => {
                            button.style.transform = 'scale(1) rotate(0deg)';
                            button.style.boxShadow = '0 8px 25px rgba(46,213,115,0.4)';
                          }, 200);
                        }}
                        className="button-hover bounce"
                        style={{
                          background: 'linear-gradient(135deg, #2ed573, #7bed9f)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '50%',
                          width: '65px',
                          height: '65px',
                          fontSize: '1.6rem',
                          cursor: 'pointer',
                          boxShadow: '0 8px 25px rgba(46,213,115,0.4)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                          position: 'relative',
                          overflow: 'hidden'
                        }}
                        onMouseOver={(e) => {
                          e.target.style.transform = 'scale(1.1) rotate(-5deg)';
                          e.target.style.boxShadow = '0 12px 35px rgba(46,213,115,0.6)';
                        }}
                        onMouseOut={(e) => {
                          e.target.style.transform = 'scale(1) rotate(0deg)';
                          e.target.style.boxShadow = '0 8px 25px rgba(46,213,115,0.4)';
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
              <div 
                className="fade-in"
                style={{
                  background: 'white',
                  borderRadius: '25px',
                  padding: '25px',
                  boxShadow: '0 15px 35px rgba(0,0,0,0.1)',
                  border: '1px solid rgba(255,107,107,0.1)'
                }}
              >
                <h3 style={{
                  color: '#ff6b6b',
                  marginBottom: '25px',
                  fontSize: '1.5rem',
                  fontWeight: '800',
                  textAlign: 'center',
                  letterSpacing: '1px'
                }}>
                  💕 Tus Matches ({matches.length})
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {matches.map((match, index) => (
                    <div
                      key={match.id || index}
                      className="card-hover slide-in-left"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '20px',
                        background: 'linear-gradient(135deg, #f8f9fa, #ffffff)',
                        borderRadius: '20px',
                        cursor: 'pointer',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        border: '2px solid rgba(255,107,107,0.1)',
                        position: 'relative',
                        overflow: 'hidden'
                      }}
                      onMouseOver={(e) => {
                        e.target.style.background = 'linear-gradient(135deg, #ffffff, #f8f9fa)';
                        e.target.style.transform = 'translateY(-3px)';
                        e.target.style.boxShadow = '0 10px 30px rgba(255,107,107,0.2)';
                      }}
                      onMouseOut={(e) => {
                        e.target.style.background = 'linear-gradient(135deg, #f8f9fa, #ffffff)';
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = 'none';
                      }}
                    >
                      <img
                        src={apiUrl(`/api/roblox/avatar/${match.roblox_user}`)}
                        alt={match.nombre}
                        style={{
                          width: '60px',
                          height: '60px',
                          borderRadius: '50%',
                          objectFit: 'cover',
                          marginRight: '15px',
                          boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
                          border: '3px solid white'
                        }}
                        onError={(e) => {
                          e.target.style.opacity = 0.3;
                          e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjYwIiBoZWlnaHQ9IjYwIiBmaWxsPSIjRjBGMEYwIi8+CjxjaXJjbGUgY3g9IjMwIiBjeT0iMjQiIHI9IjgiIGZpbGw9IiNDQ0NDQ0MiLz4KPHBhdGggZD0iTTE2IDQ0QzE2IDM4IDyIDMyIDMwIDMyQzUyIDMyIDQ0IDM4IDQ0IDQ0SDE2WiIgZmlsbD0iI0NDQ0NDQyIvPgo8L3N2Zz4K';
                        }}
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
                        className="button-hover"
                        style={{
                          background: 'linear-gradient(135deg, #ff6b6b, #ff8e8e)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '25px',
                          padding: '12px 20px',
                          fontSize: '14px',
                          fontWeight: '700',
                          cursor: 'pointer',
                          boxShadow: '0 4px 15px rgba(255,107,107,0.3)',
                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}
                        onMouseOver={(e) => {
                          e.target.style.transform = 'translateY(-2px)';
                          e.target.style.boxShadow = '0 8px 25px rgba(255,107,107,0.4)';
                        }}
                        onMouseOut={(e) => {
                          e.target.style.transform = 'translateY(0)';
                          e.target.style.boxShadow = '0 4px 15px rgba(255,107,107,0.3)';
                        }}
                      >
                        <FaComment />
                        Chat
                      </button>
                    </div>
                  ))}
            </div>
              </div>
            )}
          </div>
        )}

        {/* Vista de Mi Perfil */}
        {currentView === 'myProfile' && profile && (
          <div style={{
            background: 'white',
            borderRadius: '25px',
            padding: '30px',
            boxShadow: '0 15px 35px rgba(0,0,0,0.1)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Header del perfil */}
            <div style={{
              textAlign: 'center',
              marginBottom: '30px',
              position: 'relative'
            }}>
              <div style={{
                position: 'relative',
                display: 'inline-block',
                marginBottom: '20px'
              }}>
                <img
                  src={avatar || apiUrl(`/api/roblox/avatar/${profile.roblox_user}`)}
                  alt={profile.nombre}
                  style={{
                    width: '150px',
                    height: '150px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
                    border: '4px solid white'
                  }}
                  onError={(e) => {
                    e.target.style.opacity = 0.3;
                    e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDE1MCAxNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxNTAiIGhlaWdodD0iMTUwIiBmaWxsPSIjRjBGMEYwIi8+CjxjaXJjbGUgY3g9Ijc1IiBjeT0iNjAiIHI9IjIwIiBmaWxsPSIjQ0NDQ0NDIi8+CjxwYXRoIGQ9Ik00MCAxMTBDNDAgOTUgNTUgODAgNzUgODBDOTUgODAgMTEwIDk1IDExMCAxMTBIMzBaIiBmaWxsPSIjQ0NDQ0NDIi8+Cjwvc3ZnPgo=';
                  }}
                />
                <div style={{
                  position: 'absolute',
                  bottom: '10px',
                  right: '10px',
                  background: '#2ed573',
                  color: 'white',
                  borderRadius: '50%',
                  width: '30px',
                  height: '30px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  boxShadow: '0 2px 10px rgba(46,213,115,0.3)'
                }}>
                  ✓
                </div>
              </div>
              
              <h2 style={{
                fontSize: '2rem',
                fontWeight: '800',
                color: '#333',
                marginBottom: '8px',
                letterSpacing: '1px'
              }}>
                {profile.nombre}
              </h2>
              
              <p style={{
                color: '#666',
                fontSize: '1.2rem',
                marginBottom: '15px',
                fontWeight: '500'
              }}>
                {profile.edad} años
              </p>
              
              {profile.ubicacion && (
                <p style={{
                  color: '#888',
                  fontSize: '1rem',
                  marginBottom: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}>
                  <FaMapMarkerAlt style={{ color: '#ff6b6b' }} />
                  {profile.ubicacion}
                </p>
              )}
            </div>

            {/* Información del perfil */}
            <div style={{ marginBottom: '30px' }}>
              {profile.bio && (
                <div style={{
                  background: '#f8f9fa',
                  borderRadius: '15px',
                  padding: '20px',
                  marginBottom: '20px',
                  borderLeft: '4px solid #ff6b6b'
                }}>
                  <h4 style={{
                    color: '#333',
                    marginBottom: '10px',
                    fontSize: '1.1rem',
                    fontWeight: '600'
                  }}>
                    Sobre mí
                  </h4>
                  <p style={{
                    color: '#555',
                    lineHeight: '1.6',
                    fontSize: '1rem',
                    fontStyle: 'italic'
                  }}>
                    "{profile.bio}"
                  </p>
                </div>
              )}

              {profile.intereses && (
                <div style={{
                  background: '#f8f9fa',
                  borderRadius: '15px',
                  padding: '20px',
                  marginBottom: '20px',
                  borderLeft: '4px solid #3742fa'
                }}>
                  <h4 style={{
                    color: '#333',
                    marginBottom: '15px',
                    fontSize: '1.1rem',
                    fontWeight: '600'
                  }}>
                    Intereses
                  </h4>
                  <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '10px'
                  }}>
                    {profile.intereses.split(',').map((interes, idx) => (
                      <span
                        key={idx}
                        style={{
                          background: 'linear-gradient(135deg, #ff6b6b, #ff8e8e)',
                          color: 'white',
                          padding: '8px 16px',
                          borderRadius: '20px',
                          fontSize: '0.9rem',
                          fontWeight: '600',
                          boxShadow: '0 2px 8px rgba(255,107,107,0.3)'
                        }}
                      >
                        {interes.trim()}
                      </span>
                    ))}
                  </div>
          </div>
        )}

              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '15px'
              }}>
                {profile.genero && (
                  <div style={{
                    background: '#f8f9fa',
                    borderRadius: '15px',
                    padding: '15px',
                    textAlign: 'center',
                    borderLeft: '4px solid #2ed573'
                  }}>
                    <h5 style={{
                      color: '#333',
                      marginBottom: '5px',
                      fontSize: '0.9rem',
                      fontWeight: '600'
                    }}>
                      Género
                    </h5>
                    <p style={{
                      color: '#555',
                      fontSize: '1rem',
                      fontWeight: '500',
                      textTransform: 'capitalize'
                    }}>
                      {profile.genero}
                    </p>
          </div>
                )}

                {profile.busco && (
                  <div style={{
                    background: '#f8f9fa',
                    borderRadius: '15px',
                    padding: '15px',
                    textAlign: 'center',
                    borderLeft: '4px solid #ffa502'
                  }}>
                    <h5 style={{
                      color: '#333',
                      marginBottom: '5px',
                      fontSize: '0.9rem',
                      fontWeight: '600'
                    }}>
                      Busco
                    </h5>
                    <p style={{
                      color: '#555',
                      fontSize: '1rem',
                      fontWeight: '500',
                      textTransform: 'capitalize'
                    }}>
                      {profile.busco}
                    </p>
        </div>
                )}
      </div>
            </div>

            {/* Botones de acción */}
            <div style={{
              display: 'flex',
              gap: '15px'
            }}>
              <button
                onClick={() => setCurrentView('profile')}
                style={{
                  flex: 1,
                  background: 'linear-gradient(135deg, #ff6b6b, #ff8e8e)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '25px',
                  padding: '15px',
                  fontSize: '16px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  boxShadow: '0 8px 25px rgba(255,107,107,0.3)',
                  transition: 'all 0.3s ease'
                }}
                onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
                onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
              >
                <FaEdit style={{ marginRight: '8px' }} />
                Editar Perfil
              </button>
              <button
                onClick={() => setCurrentView('discover')}
                style={{
                  flex: 1,
                  background: 'linear-gradient(135deg, #3742fa, #5352ed)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '25px',
                  padding: '15px',
                  fontSize: '16px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  boxShadow: '0 8px 25px rgba(55,66,250,0.3)',
                  transition: 'all 0.3s ease'
                }}
                onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
                onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
              >
                <FaRocket style={{ marginRight: '8px' }} />
                Descubrir
              </button>
            </div>
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
                  Ubicación
                </label>
                <input
                  type="text"
                  value={form.ubicacion}
                  onChange={e => setForm(f => ({ ...f, ubicacion: e.target.value }))}
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
                  placeholder="¿De dónde eres?"
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  fontWeight: '600',
                  color: '#333',
                  marginBottom: '8px'
                }}>
                  Género
                </label>
                <select
                  value={form.genero}
                  onChange={e => setForm(f => ({ ...f, genero: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '12px 15px',
                    borderRadius: '10px',
                    border: '2px solid #e9ecef',
                    fontSize: '16px',
                    outline: 'none',
                    transition: 'border-color 0.2s ease',
                    background: 'white'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#ff6b6b'}
                  onBlur={(e) => e.target.style.borderColor = '#e9ecef'}
                >
                  <option value="">Selecciona tu género</option>
                  <option value="hombre">Hombre</option>
                  <option value="mujer">Mujer</option>
                  <option value="no-binario">No binario</option>
                  <option value="otro">Otro</option>
                </select>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  fontWeight: '600',
                  color: '#333',
                  marginBottom: '8px'
                }}>
                  Busco
                </label>
                <select
                  value={form.busco}
                  onChange={e => setForm(f => ({ ...f, busco: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '12px 15px',
                    borderRadius: '10px',
                    border: '2px solid #e9ecef',
                    fontSize: '16px',
                    outline: 'none',
                    transition: 'border-color 0.2s ease',
                    background: 'white'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#ff6b6b'}
                  onBlur={(e) => e.target.style.borderColor = '#e9ecef'}
                >
                  <option value="">¿Qué buscas?</option>
                  <option value="amistad">Amistad</option>
                  <option value="relacion">Relación seria</option>
                  <option value="aventura">Aventura</option>
                  <option value="lo-que-sea">Lo que sea</option>
                </select>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  fontWeight: '600',
                  color: '#333',
                  marginBottom: '8px'
                }}>
                  Intereses (separados por comas)
                </label>
                <input
                  type="text"
                  value={Array.isArray(form.intereses) ? form.intereses.join(', ') : (form.intereses || '')}
                  onChange={e => setForm(f => ({ ...f, intereses: e.target.value.split(',').map(i => i.trim()).filter(i => i) }))}
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
                  placeholder="Ej: Gaming, Música, Deportes, Viajes..."
                />
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
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideInLeft {
          from { transform: translateX(-30px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        
        @keyframes slideInRight {
          from { transform: translateX(30px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-10px); }
          60% { transform: translateY(-5px); }
        }
        
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }
        
        @keyframes shimmer {
          0% { background-position: -200px 0; }
          100% { background-position: calc(200px + 100%) 0; }
        }
        
        .card-hover {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .card-hover:hover {
          transform: translateY(-5px) scale(1.02);
          box-shadow: 0 20px 40px rgba(0,0,0,0.15);
        }
        
        .button-hover {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .button-hover:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0,0,0,0.2);
        }
        
        .fade-in {
          animation: fadeIn 0.6s ease-out;
        }
        
        .slide-in-left {
          animation: slideInLeft 0.6s ease-out;
        }
        
        .slide-in-right {
          animation: slideInRight 0.6s ease-out;
        }
        
        .bounce {
          animation: bounce 1s infinite;
        }
        
        .pulse {
          animation: pulse 2s infinite;
        }
        
        .shimmer {
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200px 100%;
          animation: shimmer 1.5s infinite;
        }
      `}</style>
    </div>
  );
};

export default TinderRP;
