import React, { useState, useEffect, useRef, Suspense, lazy } from 'react';
import { io } from 'socket.io-client';
import './App.css';
import { apiUrl } from './utils/api';
import './utils/fetchInterceptor'; // Interceptor global de bans
import Navbar from './components/Navbar';
import AdBlockDetect from './components/AdBlockDetect';
import Hero from './components/Hero';
import Features from './components/Features';
import Stats from './components/Stats';
import StaffSection from './components/StaffSection';
import DiscordSection from './components/DiscordSection';
import Footer from './components/Footer';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import spainLogo from '/assets/spainrplogo.png';
import ToastProvider from './components/ToastProvider';
import MaintenanceControl from './components/MaintenanceControl';
import InteractiveTutorial from './components/Tutorial/InteractiveTutorial';
import HelpButton from './components/Tutorial/HelpButton';
import useTutorial from './hooks/useTutorial';

// Lazy load components that are not immediately visible
const BlackMarket = lazy(() => import('./components/BlackMarket/BlackMarket'));
const Rules = lazy(() => import('./components/Rules'));
const News = lazy(() => import('./components/News/News'));
const StockMarket = lazy(() => import('./components/StockMarket/StockMarket'));
const TinderRP = lazy(() => import('./components/Apps/TinderRP'));
const BancoCentralRP = lazy(() => import('./components/Apps/BancoCentralRP'));
const MinijuegosRP = lazy(() => import('./components/Apps/MinijuegosRP'));
const AppsMenu = lazy(() => import('./components/Apps/AppsMenu'));
const Panel = lazy(() => import('./components/Panel'));
const AdminPanel = lazy(() => import('./components/AdminPanel'));
const BanErrorHandler = lazy(() => import('./components/BanErrorHandler'));
const BannedPage = lazy(() => import('./components/BannedPage'));
const Logs = lazy(() => import('./components/Logs'));
const Cookies = lazy(() => import('./components/Cookies'));
const CookieConsentBanner = lazy(() => import('./components/CookieConsentBanner'));
const Terms = lazy(() => import('./components/Terms'));
const Support = lazy(() => import('./components/Support'));
const ModeratorDashboard = lazy(() => import('./components/ModeratorDashboard'));
const NotFound = lazy(() => import('./components/NotFound'));
const SimuladorTienda = lazy(() => import('./components/Apps/SimuladorTienda'));
const MDTPolicial = lazy(() => import('./components/Apps/MDTPolicial'));
const GlobalSearch = lazy(() => import('./components/GlobalSearch'));

// Componente de Login
function LoginPage() {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Debug logging for LoginPage
  useEffect(() => {
    console.log('[LoginPage] 🔐 Component mounted');
    console.log('[LoginPage] 📍 Current URL:', window.location.href);
    console.log('[LoginPage] 📍 Pathname:', window.location.pathname);
    console.log('[LoginPage] 📍 Search:', window.location.search);
    console.log('[LoginPage] 📍 Hash:', window.location.hash);
    console.log('[LoginPage] 📍 Referrer:', document.referrer);
    console.log('[LoginPage] 📍 Timestamp:', new Date().toISOString());
  }, []);
  
  useEffect(() => {
    // Obtener redirect URL de los query params
    const urlParams = new URLSearchParams(location.search);
    const redirect = urlParams.get('redirect') || '/';
    
    console.log('[LoginPage] 🔄 Redirect process:', {
      originalUrl: window.location.href,
      searchParams: location.search,
      redirectUrl: redirect,
      apiUrl: import.meta.env.VITE_API_URL || 'https://spainrp-web.onrender.com'
    });
    
    // Redirigir a Discord OAuth
    const apiUrl = import.meta.env.VITE_API_URL || 'https://spainrp-web.onrender.com';
    const discordAuthUrl = `${apiUrl.replace(/\/$/, '')}/auth/login?redirect=${encodeURIComponent(redirect)}`;
    console.log('[LoginPage] 🔗 Redirecting to Discord OAuth:', discordAuthUrl);
    window.location.href = discordAuthUrl;
  }, [location.search, navigate]);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg,#23272a 0%,#7289da 100%)',
      color: '#fff',
      fontFamily: 'inherit',
      textAlign: 'center',
      padding: '2rem'
    }}>
      <img 
        src={spainLogo} 
        alt="SpainRP Logo" 
        style={{width:80,height:80,borderRadius:'50%',boxShadow:'0 2px 12px #FFD70033',marginBottom:24,animation:'spinLogo 1.5s linear infinite'}}
        onError={(e) => {
          console.warn('[App] Error cargando logo, usando fallback');
          e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iNDAiIGN5PSI0MCIgcj0iNDAiIGZpbGw9IiM3Mjg5ZGEiLz4KPHRleHQgeD0iNDAiIHk9IjQ1IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSJ3aGl0ZSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmb250LXdlaWdodD0iYm9sZCI+U1A8L3RleHQ+Cjwvc3ZnPgo=';
        }}
      />
      <h2 style={{color:'#FFD700',fontWeight:800,fontSize:'2rem',marginBottom:'1rem'}}>Iniciando sesión...</h2>
      <div style={{color:'#fff',fontSize:'1.1rem',marginBottom:'1.5rem'}}>Redirigiendo a Discord para autenticación...</div>
      <style>{`
        @keyframes spinLogo { 0% { transform: rotate(0deg);} 100% { transform: rotate(360deg);} }
      `}</style>
    </div>
  );
}

function PrivateRoute({ children }) {
  const [user, setUser] = useState(undefined);
  const [isChecking, setIsChecking] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Verificar si hay token en localStorage
        const token = localStorage.getItem('spainrp_token');
        
        console.log('[Auth] 🔍 Checking authentication:', {
          hasToken: !!token,
          tokenPreview: token ? token.substring(0, 20) + '...' : 'none',
          timestamp: new Date().toISOString()
        });
        
        if (!token) {
          console.log('[Auth] ❌ No token found in localStorage');
          setUser(null);
          setIsChecking(false);
          return;
        }
        
        // Verificar token con JWT
        const authUrl = apiUrl('/auth/me');
        console.log('[Auth] 🌐 Sending JWT verification request to:', authUrl);
        console.log('[Auth] 🔑 Using token:', {
          tokenLength: token.length,
          tokenPreview: token.substring(0, 20) + '...',
          authHeader: `Bearer ${token.substring(0, 20)}...`
        });
        
        const response = await fetch(authUrl, { 
          headers: { 
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        
        console.log('[Auth] 📡 JWT verification response:', {
          status: response.status,
          statusText: response.statusText,
          ok: response.ok
        });
        
        if (response.status === 401) {
          // Token inválido, limpiar localStorage
          console.log('[Auth] ❌ Token inválido, limpiando localStorage');
          localStorage.removeItem('spainrp_token');
          setUser(null);
          return;
        }
        
        if (response.ok) {
          const data = await response.json();
          console.log('[Auth] ✅ JWT verification successful:', {
            userId: data.user?.id,
            username: data.user?.username,
            isAdmin: data.user?.isAdmin
          });
          
          let userData = data.user;
          
          if (userData && userData.id) {
            try {
              console.log('[Auth] 🔍 Checking admin status for user:', userData.id);
              const adminRes = await fetch(apiUrl(`/api/discord/isadmin/${userData.id}`));
              if (adminRes.ok) {
                const adminData = await adminRes.json();
                userData.isAdmin = !!adminData.isAdmin;
                console.log('[Auth] 👑 Admin status:', userData.isAdmin);
              } else {
                userData.isAdmin = false;
                console.log('[Auth] ⚠️ Could not verify admin status');
              }
            } catch (error) {
              console.log('[Auth] ❌ Error checking admin status:', error);
              userData.isAdmin = false;
            }
          }
          setUser(userData);
        } else {
          console.log('[Auth] ❌ JWT verification failed with status:', response.status);
          setUser(null);
        }
      } catch (error) {
        console.error('[Auth] ❌ Error checking JWT:', error);
        setUser(null);
      } finally {
        setIsChecking(false);
      }
    };
    checkAuth();
  }, []);

  if (isChecking) {
    return (
      <div style={{textAlign:'center',marginTop:'2rem'}}>Verificando autenticación...</div>
    );
  }

  // Si no está logueado o no es admin, mostrar página de acceso denegado con navbar y candado
  if (!user || !user.isAdmin) {
    // Redirige a la ruta actual tras login
    const redirectPath = encodeURIComponent(location.pathname);
    return (
      <>
        <Navbar />
        <div style={{
          minHeight: '80vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg,#23272a 0,#181818 100%)',
          color: '#fff',
          fontFamily: 'inherit',
          textAlign: 'center',
          padding: '2rem'
        }}>
          <div style={{fontSize:'4.5rem',marginBottom:'1.2rem',animation:'lockBounce 1.2s infinite alternate cubic-bezier(.2,.9,.2,1)'}}>
            <span role="img" aria-label="candado">🔒</span>
          </div>
          <h2 style={{color:'#ef4444',fontWeight:800,fontSize:'2rem',marginBottom:'1rem'}}>Acceso Denegado</h2>
          <div style={{color:'#FFD700',fontSize:'1.1rem',marginBottom:'1.5rem'}}>No tienes permisos para acceder a esta sección.<br/>Debes iniciar sesión como administrador.</div>
          <a href={`/auth/login?redirect=${redirectPath}`}>
            <button style={{background:'#ef4444',color:'#fff',border:'none',borderRadius:8,padding:'0.7rem 1.5rem',fontWeight:700,fontSize:'1.1rem',cursor:'pointer',boxShadow:'0 2px 8px #ef444433',transition:'background 0.2s, color 0.2s, transform 0.15s',marginBottom:'0.5rem'}}>
              Iniciar sesión
            </button>
          </a>
          <style>{`
            @keyframes lockBounce {
              0% { transform: translateY(0); }
              100% { transform: translateY(-12px) scale(1.08); }
            }
          `}</style>
        </div>
      </>
    );
  }

  return children;
}

function Home({ memberCount, totalMembers, loading }) {
  const location = useLocation();
  const [logoutMsg, setLogoutMsg] = useState(false);
  
  // Debug logging for Home component
  useEffect(() => {
    console.log('[Home] 🏠 Component mounted');
    console.log('[Home] 📍 Current URL:', window.location.href);
    console.log('[Home] 📍 Pathname:', window.location.pathname);
    console.log('[Home] 📍 Search:', window.location.search);
    console.log('[Home] 📍 Hash:', window.location.hash);
    console.log('[Home] 📍 Referrer:', document.referrer);
    console.log('[Home] 📍 State:', location.state);
    console.log('[Home] 📍 Timestamp:', new Date().toISOString());
    console.log('[Home] 📊 Props:', { memberCount, totalMembers, loading });
  }, [memberCount, totalMembers, loading]);
  
  useEffect(() => {
    if (location.state && location.state.loggedOut) {
      console.log('[Home] 🚪 Logout message detected');
      setLogoutMsg(true);
      setTimeout(() => setLogoutMsg(false), 3000);
    }
  }, [location.state]);
  return (
    <>
      {logoutMsg && <div style={{background:'#7289da',color:'#fff',padding:'1rem',textAlign:'center',borderRadius:8,margin:'1rem auto',maxWidth:400}}>Has cerrado sesión correctamente.</div>}
      <Hero memberCount={memberCount} loading={loading} />
      <Stats memberCount={memberCount} totalMembers={totalMembers} />
      <Features />
      <StaffSection />
      <DiscordSection />
    </>
  );
}


// Componente de página de mantenimiento con panel administrativo
function MaintenancePage({ vantaElRef, totalMinutes, elapsed, percent, apiUrl }) {
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminLoading, setAdminLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [maintenanceData, setMaintenanceData] = useState(null);
  const [emailSubmitting, setEmailSubmitting] = useState(false);

  // Obtener datos de mantenimiento
  useEffect(() => {
    const fetchMaintenanceData = async () => {
      try {
        const response = await fetch(apiUrl('/api/maintenance/status'));
        if (response.ok) {
          const data = await response.json();
          setMaintenanceData(data);
        }
      } catch (error) {
        console.error('[MAINTENANCE] Error obteniendo datos:', error);
      }
    };

    fetchMaintenanceData();
  }, [apiUrl]);

  // Verificar si el usuario es administrador
  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const token = localStorage.getItem('spainrp_token');
        if (!token) {
          setAdminLoading(false);
          return;
        }

        const response = await fetch(apiUrl('/auth/me'), {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          const userId = data.user?.id;
          
          // Verificar si es administrador
          if (userId === '710112055985963090') {
            setIsAdmin(true);
          }
        }
      } catch (error) {
        console.error('[MAINTENANCE] Error verificando admin:', error);
      } finally {
        setAdminLoading(false);
      }
    };

    checkAdmin();
  }, [apiUrl]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleMaintenanceToggle = () => {
    // Recargar la página para salir del modo mantenimiento
    window.location.reload();
  };

  // Calcular tiempo restante basado en los datos reales
  const calculateTimeRemaining = () => {
    if (!maintenanceData?.startedAt) {
      return { minutes: 0, percent: 0 };
    }
    
    const startTime = new Date(maintenanceData.startedAt).getTime();
    const now = Date.now();
    const elapsedMs = now - startTime;
    const elapsedMinutes = Math.floor(elapsedMs / 60000);
    const remainingMinutes = Math.max(0, totalMinutes - elapsedMinutes);
    const percent = Math.min(100, Math.round((elapsedMinutes / totalMinutes) * 100));
    
    return { minutes: remainingMinutes, percent };
  };

  const { minutes: remainingMinutes, percent: calculatedPercent } = calculateTimeRemaining();

  // Manejar suscripción por email
  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setEmailSubmitting(true);
    
    try {
      const formData = new FormData(e.target);
      const email = formData.get('email');
      
      const response = await fetch(apiUrl('/api/maintenance/subscribe'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      });
      
      if (response.ok) {
        showToast('¡Te avisaremos cuando volvamos!', 'success');
        e.target.reset();
      } else {
        showToast('No se pudo suscribir. Inténtalo de nuevo.', 'error');
      }
    } catch (error) {
      console.error('[MAINTENANCE] Error suscribiendo email:', error);
      showToast('Error al suscribirse. Inténtalo de nuevo.', 'error');
    } finally {
      setEmailSubmitting(false);
    }
  };

  return (
    <div style={{
      background: 'transparent',
      minHeight: '100vh',
      width: '100vw',
      overflow: 'hidden',
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Bangers,Impact,sans-serif'
    }}>
      {/* Fondo Vanta NET */}
      <div ref={vantaElRef} id="vanta-bg" style={{position:'absolute',inset:0,zIndex:0}} />
      
      {/* Panel administrativo flotante */}
      {isAdmin && !adminLoading && (
        <div style={{
          position: 'fixed',
          top: 20,
          right: 20,
          zIndex: 1000,
          background: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(10px)',
          borderRadius: 12,
          padding: 16,
          border: '1px solid rgba(114, 137, 218, 0.3)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginBottom: 12,
            color: '#FFD700',
            fontSize: 14,
            fontWeight: 600
          }}>
            🔧 Panel Administrativo
          </div>
          
          <button
            onClick={() => setShowAdminPanel(!showAdminPanel)}
            style={{
              background: showAdminPanel ? '#e74c3c' : '#7289da',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              padding: '8px 16px',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              marginBottom: 8,
              transition: 'all 0.2s ease'
            }}
          >
            {showAdminPanel ? 'Ocultar Control' : 'Mostrar Control'}
          </button>

          {showAdminPanel && (
            <div style={{
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: 8,
              padding: 12,
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}>
              <MaintenanceControl 
                showToast={showToast}
                onMaintenanceToggle={handleMaintenanceToggle}
              />
            </div>
          )}
        </div>
      )}

      {/* Branding y mensaje */}
      <div style={{zIndex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center'}}>
        {/* Icono FontAwesome spinner centrado */}
        <div style={{display:'flex',alignItems:'center',justifyContent:'center',marginBottom:16}}>
          <i className="fa fa-spinner fa-spin" style={{fontSize: '4.5rem', color: '#61dafb'}}></i>
        </div>
        {/* FontAwesome CDN para el icono spinner */}
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css" />
        <h1 style={{fontSize:'2.7rem',color:'#FFD700',textShadow:'2px 2px 0rgb(114, 8, 73),0 0 16pxrgb(201, 148, 180)',marginBottom:'1.2rem',letterSpacing:1}}>SpainRP™ / Mantenimiento</h1>
        <div style={{fontSize:'1.4rem',color:'#fff',marginBottom:'1.2rem',maxWidth:500,textAlign:'center'}}>
          Estamos mejorando la web y añadiendo nuevas funciones.<br/>
          <span style={{color:'#FFD700'}}>¡Gracias por tu paciencia!</span>
        </div>
        {/* Tiempo estimado y barra de progreso */}
        <div style={{marginBottom:'1.2rem',width:320,maxWidth:'90%',textAlign:'center'}}>
          <div style={{fontSize:'1.1rem',marginBottom:6}}>Tiempo estimado restante: <b>{remainingMinutes} min</b></div>
          <div style={{background:'#23272a',borderRadius:12,overflow:'hidden',height:18,boxShadow:'0 2px 8px #23272a33'}}>
            <div style={{width:`${calculatedPercent}%`,height:'100%',background:'#61dafb',transition:'width 0.5s',borderRadius:12}}></div>
          </div>
          <div style={{fontSize:'0.95rem',color:'#FFD700',marginTop:4}}>{calculatedPercent}% completado</div>
        </div>
        {/* Suscripción y botón de reintentar */}
        <form onSubmit={handleEmailSubmit} style={{display:'flex',gap:8,alignItems:'center',justifyContent:'center',flexWrap:'wrap',marginBottom:12}}>
          <input 
            type="email" 
            name="email" 
            required 
            placeholder="Tu email" 
            aria-label="Tu email" 
            style={{padding:'0.6rem 0.8rem',borderRadius:8,border:'1px solid #ffffff22',background:'rgba(0,0,0,.35)',color:'#fff',minWidth:220}} 
          />
          <button 
            type="submit" 
            disabled={emailSubmitting}
            style={{
              background: emailSubmitting ? '#666' : '#ef4444',
              color:'#fff',
              border:'none',
              borderRadius:8,
              padding:'0.7rem 1.5rem',
              fontWeight:700,
              cursor: emailSubmitting ? 'not-allowed' : 'pointer',
              boxShadow:'0 2px 8px #ef444433',
              opacity: emailSubmitting ? 0.7 : 1
            }}
          >
            {emailSubmitting ? 'Enviando...' : 'Avisarme cuando vuelva'}
          </button>
        </form>
        {/* Botón de reintentar */}
        <button onClick={()=>window.location.reload()} style={{
          background:'#FFD700',color:'#23272a',border:'none',borderRadius:8,
          padding:'0.7rem 1.5rem',fontWeight:700,fontSize:'1.1rem',cursor:'pointer',
          boxShadow:'0 2px 8px #FFD70033',marginBottom:'1.5rem',marginTop:8
        }}>
          Reintentar
        </button>
        {/* Discord o soporte */}
        <div style={{color:'#aaa',fontSize:'1rem',marginTop:'1rem'}}>
          ¿Dudas? Únete a nuestro <a href='https://discord.gg/spainrp' style={{color:'#FFD700'}}>Discord</a>
        </div>
      </div>

      {/* Toast notifications */}
      {toast && (
        <div style={{
          position: 'fixed',
          top: 20,
          left: '50%',
          transform: 'translateX(-50%)',
          background: toast.type === 'error' ? '#e74c3c' : '#27ae60',
          color: '#fff',
          padding: '12px 24px',
          borderRadius: 8,
          zIndex: 1001,
          fontSize: 14,
          fontWeight: 600,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
        }}>
          {toast.message}
        </div>
      )}

      <style>{`
        @keyframes bounce { 0%{transform:translateY(0);} 100%{transform:translateY(-18px) scale(1.08);} }
        @keyframes spin { 0%{transform:rotate(0deg);} 100%{transform:rotate(360deg);} }
      `}</style>
    </div>
  );
}

function App() {
  const [memberCount, setMemberCount] = useState(0);
  const [totalMembers, setTotalMembers] = useState(0);
  const [loading, setLoading] = useState(true);
  const [maintenance, setMaintenance] = useState(false);
  const [isProcessingToken, setIsProcessingToken] = useState(false);
  const vantaRef = useRef(null);
  const vantaElRef = useRef(null);
  
  // Hook del tutorial
  const {
    shouldShowTutorial,
    isTutorialOpen,
    openTutorial,
    closeTutorial,
    completeTutorial,
    skipTutorial
  } = useTutorial();
  
  // Capturar token de la URL después del login - EJECUTAR INMEDIATAMENTE
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    
    console.log('[App] 🔍 Checking for token in URL:', {
      hasToken: !!token,
      tokenPreview: token ? token.substring(0, 20) + '...' : 'none',
      currentUrl: window.location.href,
      searchParams: window.location.search
    });
    
    if (token) {
      console.log('[App] 🎫 Token recibido de Discord OAuth:', {
        tokenLength: token.length,
        tokenPreview: token.substring(0, 20) + '...',
        currentUrl: window.location.href,
        timestamp: new Date().toISOString()
      });
      
      setIsProcessingToken(true);
      localStorage.setItem('spainrp_token', token);
      console.log('[App] 💾 Token guardado en localStorage');
      
      // Disparar evento para que otros componentes se actualicen
      window.dispatchEvent(new Event('token-updated'));
      
      // Limpiar la URL
      const newUrl = window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
      console.log('[App] 🧹 URL limpiada, recargando página...');
      
      // Recargar para aplicar el token
      window.location.reload();
    } else {
      console.log('[App] ⚠️ No token found in URL, checking localStorage...');
      const storedToken = localStorage.getItem('spainrp_token');
      console.log('[App] 📦 Stored token:', {
        hasStoredToken: !!storedToken,
        storedTokenPreview: storedToken ? storedToken.substring(0, 20) + '...' : 'none'
      });
    }
  }, []);
  
  // Debug logging for App component
  useEffect(() => {
    console.log('[App] 🚀 App component mounted');
    console.log('[App] 📍 Current URL:', window.location.href);
    console.log('[App] 📍 Pathname:', window.location.pathname);
    console.log('[App] 📍 Search:', window.location.search);
    console.log('[App] 📍 Hash:', window.location.hash);
    console.log('[App] 📍 Referrer:', document.referrer);
    console.log('[App] 📍 Timestamp:', new Date().toISOString());
    console.log('[App] 📊 Initial state:', { memberCount, totalMembers, loading, maintenance });
  }, []);

  // Mostrar tutorial automáticamente si es necesario
  useEffect(() => {
    if (shouldShowTutorial && !loading && !maintenance) {
      // Esperar un poco para que la página se cargue completamente
      const timer = setTimeout(() => {
        openTutorial();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [shouldShowTutorial, loading, maintenance, openTutorial]);

  // Listener para abrir tutorial manualmente
  useEffect(() => {
    const handleOpenTutorial = () => {
      openTutorial();
    };

    window.addEventListener('open-tutorial', handleOpenTutorial);
    return () => window.removeEventListener('open-tutorial', handleOpenTutorial);
  }, [openTutorial]);
  // Progreso mantenimiento (hooks siempre fuera de condicionales)
  const totalMinutes = 50;
  const [elapsed, setElapsed] = useState(0);
  const [maintenanceStart, setMaintenanceStart] = useState(null);

  // Actualiza el tiempo de mantenimiento en tiempo real según el backend
  useEffect(() => {
    if (!maintenance || !maintenanceStart) {
      setElapsed(0);
      return;
    }
    setElapsed(Math.min(((Date.now() - maintenanceStart) / 60000), totalMinutes));
    const timer = setInterval(() => {
      setElapsed(Math.min(((Date.now() - maintenanceStart) / 60000), totalMinutes));
    }, 1000);
    return () => clearInterval(timer);
  }, [maintenance, maintenanceStart]);
  const percent = Math.min(100, Math.round((elapsed / totalMinutes) * 100));

  // Vanta background for maintenance
  useEffect(() => {
    let threeLoaded = !!window.THREE;
    let vantaLoaded = !!window.VANTA;
    let scripts = [];
    const loadScript = (src) => new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = src;
      s.async = true;
      s.onload = () => resolve();
      s.onerror = reject;
      document.body.appendChild(s);
      scripts.push(s);
    });
    const initVanta = () => {
      if (!window.VANTA || !vantaElRef.current) return;
      try {
        vantaRef.current = window.VANTA.NET({
          el: vantaElRef.current,
          mouseControls: true,
          touchControls: true,
          gyroControls: false,
          minHeight: 200.00,
          minWidth: 200.00,
          scale: 1.00,
          scaleMobile: 1.00,
          color: 0xff1744,
          backgroundColor: 0x160a10,
          points: 12.0,
          maxDistance: 24.0,
          spacing: 16.0,
          showDots: true
        });
      } catch {}
    };
    if (maintenance) {
      (async () => {
        try {
          if (!threeLoaded) {
            await loadScript('https://cdnjs.cloudflare.com/ajax/libs/three.js/r134/three.min.js');
            threeLoaded = true;
          }
          if (!vantaLoaded) {
            await loadScript('https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.net.min.js');
            vantaLoaded = true;
          }
          initVanta();
        } catch (e) {
          // Silenciar fallo de decoración visual
        }
      })();
    }
    return () => {
      if (vantaRef.current && vantaRef.current.destroy) {
        try { vantaRef.current.destroy(); } catch {}
        vantaRef.current = null;
      }
      scripts.forEach(s => { try { s.remove(); } catch {} });
    };
  }, [maintenance]);

  // Socket.io para mantenimiento en tiempo real
  useEffect(() => {
    let socket;
    const updateFromApi = async () => {
      try {
        const res = await fetch(apiUrl('/api/maintenance/status'));
        const data = await res.json();
        setMaintenance(!!data.maintenance);
        setMaintenanceStart(data.startedAt || null);
      } catch {
        setMaintenance(false);
        setMaintenanceStart(null);
      }
    };
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'https://spainrp-web.onrender.com';
      socket = io(apiUrl.replace(/\/$/, ''), {
        path: '/socket.io',
        transports: ['websocket'],
        withCredentials: true
      });
      socket.on('maintenance', (data) => {
        console.log('[MAINTENANCE] Evento recibido:', data);
        setMaintenance(!!data.maintenance);
        setMaintenanceStart(data.data?.activatedAt || null);
      });
    } catch {}
    // Fallback: polling cada 10s
    updateFromApi();
    const interval = setInterval(updateFromApi, 10000);
    return () => {
      if (socket) socket.disconnect();
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    fetchMemberCount();
    const interval = setInterval(fetchMemberCount, 10000);
    return () => clearInterval(interval);
  }, []);
  useEffect(() => {
    try {
      const target = sessionStorage.getItem('scrollTarget');
      if (target) {
        sessionStorage.removeItem('scrollTarget');
        const el = document.getElementById(target);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        else window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (_) {}
  }, []);
  const fetchMemberCount = async () => {
    try {
      // Miembros activos (widget)
      const response = await fetch(apiUrl('/api/widget'), { credentials: 'include' });
      let data = {};
      if (response.status === 404) {
        setMemberCount(0);
      } else {
        try {
          data = await response.json();
          setMemberCount(data.presence_count || 0);
        } catch (e) {
          setMemberCount(0);
        }
      }
      // Miembros totales reales (bot)
      const totalRes = await fetch(apiUrl('/api/membercount'), { credentials: 'include' });
      let totalData = {};
      if (totalRes.status === 404) {
        setTotalMembers(0);
      } else {
        try {
          totalData = await totalRes.json();
          setTotalMembers(totalData.memberCount || 0);
        } catch (e) {
          setTotalMembers(0);
        }
      }
    } catch (error) {
      setMemberCount(0);
      setTotalMembers(0);
    } finally {
      setLoading(false);
    }
  };

  // Páginas especiales sin Navbar
  const noNavbarRoutes = [
    '/blackmarket', '/news', '/stockmarket', '/apps', '/apps/tinder', '/apps/banco', '/apps/minijuegos', '/apps/tienda', '/rules'
  ];
  // Páginas especiales sin Footer (pantalla completa)
  const noFooterRoutes = ['/apps/tienda'];

  if (maintenance) {
    return <MaintenancePage 
      vantaElRef={vantaElRef}
      totalMinutes={totalMinutes}
      elapsed={elapsed}
      percent={percent}
      apiUrl={apiUrl}
    />;
  }

  // Mostrar loading mientras se procesa el token
  if (isProcessingToken) {
    return (
      <div className="App" style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        fontSize: '18px',
        fontWeight: '600'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            width: '50px', 
            height: '50px', 
            border: '3px solid rgba(255,255,255,0.3)',
            borderTop: '3px solid white',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }}></div>
          <div>Procesando login...</div>
          <style>{`
            @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
          `}</style>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <ToastProvider>
        <GlobalSearch />
        <AppContent noNavbarRoutes={noNavbarRoutes} memberCount={memberCount} totalMembers={totalMembers} loading={loading} />
      </ToastProvider>
    </Router>
  );
}

function AppContent({ noNavbarRoutes, memberCount, totalMembers, loading }) {
  const currentLocation = useLocation();
  const hideNavbar = noNavbarRoutes.includes(currentLocation.pathname);
  const hideFooter = ['/apps/tienda'].includes(currentLocation.pathname);
  
  // Enhanced debug logging
  console.log('[AppContent] 🔍 Route Debug Info:', {
    pathname: currentLocation.pathname,
    search: currentLocation.search,
    hash: currentLocation.hash,
    state: currentLocation.state,
    hideNavbar,
    hideFooter,
    noNavbarRoutes,
    isAppRoute: currentLocation.pathname.startsWith('/apps'),
    timestamp: new Date().toISOString()
  });
  
  // Log route changes
  React.useEffect(() => {
    console.log('[AppContent] 📍 Route changed to:', currentLocation.pathname);
    console.log('[AppContent] 📊 Route analysis:', {
      isNoNavbarRoute: hideNavbar,
      isNoFooterRoute: hideFooter,
      isApiRoute: currentLocation.pathname.startsWith('/api/'),
      isAssetRoute: currentLocation.pathname.match(/\.(js|css|png|jpg|jpeg|gif|ico|svg)$/),
      isRootRoute: currentLocation.pathname === '/'
    });
  }, [currentLocation.pathname, hideNavbar, hideFooter]);
  
  return (
    <div className="App">
      <AdBlockDetect />
      {!hideNavbar && <Navbar />}
      <Suspense fallback={
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '50vh',
          fontSize: '1.2rem',
          color: '#666'
        }}>
          Cargando...
        </div>
      }>
        <Routes>
          <Route path="/" element={<Home memberCount={memberCount} totalMembers={totalMembers} loading={loading} />} />
          <Route path="/cookies" element={<Cookies />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/support" element={<Support />} />
          <Route path="/moderator-dashboard" element={<ModeratorDashboard />} />
          <Route path="/blackmarket" element={<BlackMarket />} />
          <Route path="/rules" element={<Rules />} />
          <Route path="/news" element={<News />} />
          <Route path="/stockmarket" element={<StockMarket />} />
          <Route path="/apps" element={<BanErrorHandler><AppsMenu /></BanErrorHandler>} />
          <Route path="/apps/tinder" element={<BanErrorHandler><TinderRP /></BanErrorHandler>} />
          <Route path="/apps/banco" element={<BanErrorHandler><BancoCentralRP /></BanErrorHandler>} />
          <Route path="/apps/minijuegos" element={<BanErrorHandler><MinijuegosRP /></BanErrorHandler>} />
          <Route path="/apps/tienda" element={<BanErrorHandler><SimuladorTienda /></BanErrorHandler>} />
          <Route path="/apps/mdt" element={<BanErrorHandler><MDTPolicial /></BanErrorHandler>} />
          <Route path="/panel" element={<BanErrorHandler><Panel /></BanErrorHandler>} />
          <Route path="/panel/bans" element={<BanErrorHandler><Panel /></BanErrorHandler>} />
          <Route path="/admin" element={<PrivateRoute><BanErrorHandler><AdminPanel /></BanErrorHandler></PrivateRoute>} />
          <Route path="/banned" element={<BannedPage />} />
          <Route path="/auth/login" element={<LoginPage />} />
          <Route path="/logout" element={<LogoutPage />} />
          <Route path="/logs" element={<Logs />} />
          <Route path="/404" element={<NotFound />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
      <CookieConsentBanner />
      {!hideFooter && <Footer />}
      
      {/* Tutorial Interactivo */}
      <InteractiveTutorial
        isOpen={isTutorialOpen}
        onClose={closeTutorial}
        onComplete={completeTutorial}
      />
      
      {/* Botón de Ayuda Flotante */}
      <HelpButton />
    </div>
  );
}


// Componente para mejorar el flujo de logout
function LogoutPage() {
  const navigate = useNavigate();
  useEffect(() => {
    const timer = setTimeout(() => {
      fetch(apiUrl('/auth/logout'), { credentials: 'include' })
        .catch(() => {})
        .finally(() => {
          navigate('/', { state: { loggedOut: true } });
        });
    }, 5000); // Espera 5 segundos antes de redirigir
    return () => clearTimeout(timer);
  }, [navigate]);
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg,#23272a 0%,#7289da 100%)',
      color: '#fff',
      fontFamily: 'inherit',
      textAlign: 'center',
      padding: '2rem'
    }}>
      <img 
        src={spainLogo} 
        alt="SpainRP Logo" 
        style={{width:80,height:80,borderRadius:'50%',boxShadow:'0 2px 12px #FFD70033',marginBottom:24,animation:'spinLogo 1.5s linear infinite'}}
        onError={(e) => {
          console.warn('[App] Error cargando logo, usando fallback');
          e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iNDAiIGN5PSI0MCIgcj0iNDAiIGZpbGw9IiM3Mjg5ZGEiLz4KPHRleHQgeD0iNDAiIHk9IjQ1IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSJ3aGl0ZSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmb250LXdlaWdodD0iYm9sZCI+U1A8L3RleHQ+Cjwvc3ZnPgo=';
        }}
      />
      <h2 style={{color:'#FFD700',fontWeight:800,fontSize:'2rem',marginBottom:'1rem'}}>Cerrando sesión...</h2>
      <div style={{color:'#fff',fontSize:'1.1rem',marginBottom:'1.5rem'}}>Gracias por usar SpainRP. Espera un momento...</div>
      <style>{`
        @keyframes spinLogo { 0% { transform: rotate(0deg);} 100% { transform: rotate(360deg);} }
      `}</style>
    </div>
  );
}

export default App;
