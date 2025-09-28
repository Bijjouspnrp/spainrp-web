import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import './App.css';
import { apiUrl } from './utils/api';
import Navbar from './components/Navbar';
import AdBlockDetect from './components/AdBlockDetect';
import BlackMarket from './components/BlackMarket/BlackMarket';
import Rules from './components/Rules';
import News from './components/News/News';
import StockMarket from './components/StockMarket/StockMarket';
import TinderRP from './components/Apps/TinderRP';
import BancoCentralRP from './components/Apps/BancoCentralRP';
import MinijuegosRP from './components/Apps/MinijuegosRP';
import AppsMenu from './components/Apps/AppsMenu';
import Hero from './components/Hero';
import Features from './components/Features';
import Stats from './components/Stats';
import StaffSection from './components/StaffSection';
import DiscordSection from './components/DiscordSection';
import Footer from './components/Footer';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import Panel from './components/Panel';
import AdminPanel from './components/AdminPanel';
import AdvancedLogs from './components/AdvancedLogs';
import Cookies from './components/Cookies';
import CookieConsentBanner from './components/CookieConsentBanner';
import Terms from './components/Terms';
import Support from './components/Support';
import NotFound from './components/NotFound';
import spainLogo from '/assets/spainrplogo.png';
import SimuladorTienda from './components/Apps/SimuladorTienda';
import GlobalSearch from './components/GlobalSearch';
import ToastProvider from './components/ToastProvider';

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
      <img src={spainLogo} alt="SpainRP Logo" style={{width:80,height:80,borderRadius:'50%',boxShadow:'0 2px 12px #FFD70033',marginBottom:24,animation:'spinLogo 1.5s linear infinite'}} />
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
        const response = await fetch(apiUrl('/auth/me'), { 
          credentials: 'include',
          headers: { 'Accept': 'application/json' }
        });
        if (response.status === 401) {
          setUser(null);
          return;
        }
        if (response.ok) {
          const data = await response.json();
          let userData = data.user;
          if (userData && userData.id) {
            try {
              const adminRes = await fetch(apiUrl(`/api/discord/isadmin/${userData.id}`));
              if (adminRes.ok) {
                const adminData = await adminRes.json();
                userData.isAdmin = !!adminData.isAdmin;
              } else {
                userData.isAdmin = false;
              }
            } catch {
              userData.isAdmin = false;
            }
          }
          setUser(userData);
        } else {
          setUser(null);
        }
      } catch (error) {
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


function App() {
  const [memberCount, setMemberCount] = useState(0);
  const [totalMembers, setTotalMembers] = useState(0);
  const [loading, setLoading] = useState(true);
  const [maintenance, setMaintenance] = useState(false);
  const vantaRef = useRef(null);
  const vantaElRef = useRef(null);
  
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
        const res = await fetch(apiUrl('/api/maintenance'));
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
        updateFromApi();
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
        {/* Branding y mensaje */}
        <div style={{zIndex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center'}}>
          {/* Icono FontAwesome spinner centrado */}
          <div style={{display:'flex',alignItems:'center',justifyContent:'center',marginBottom:16}}>
            <i className="fa fa-spinner fa-spin" style={{fontSize: '4.5rem', color: '#61dafb'}}></i>
          </div>
          {/* FontAwesome CDN para el icono spinner */}
          <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css" />
          {/* FontAwesome CDN para el icono spinner */}
          <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css" />
          <h1 style={{fontSize:'2.7rem',color:'#FFD700',textShadow:'2px 2px 0rgb(114, 8, 73),0 0 16pxrgb(201, 148, 180)',marginBottom:'1.2rem',letterSpacing:1}}>SpainRP™ / Mantenimiento</h1>
          <div style={{fontSize:'1.4rem',color:'#fff',marginBottom:'1.2rem',maxWidth:500,textAlign:'center'}}>
            Estamos mejorando la web y añadiendo nuevas funciones.<br/>
            <span style={{color:'#FFD700'}}>¡Gracias por tu paciencia!</span>
          </div>
          {/* Tiempo estimado y barra de progreso */}
          <div style={{marginBottom:'1.2rem',width:320,maxWidth:'90%',textAlign:'center'}}>
            <div style={{fontSize:'1.1rem',marginBottom:6}}>Tiempo estimado restante: <b>{Math.max(0, totalMinutes - Math.floor(elapsed))} min</b></div>
            <div style={{background:'#23272a',borderRadius:12,overflow:'hidden',height:18,boxShadow:'0 2px 8px #23272a33'}}>
              <div style={{width:`${percent}%`,height:'100%',background:'#61dafb',transition:'width 0.5s',borderRadius:12}}></div>
            </div>
            <div style={{fontSize:'0.95rem',color:'#FFD700',marginTop:4}}>{percent}% completado</div>
          </div>
          {/* Suscripción y botón de reintentar */}
          <form onSubmit={async (e)=>{
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            const email = fd.get('email');
            try {
              const resp = await fetch(apiUrl('/api/maintenance/subscribe'), { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ email }) });
              if (resp.ok) alert('Te avisaremos cuando volvamos.'); else alert('No se pudo suscribir.');
            } catch { alert('No se pudo suscribir.'); }
          }} style={{display:'flex',gap:8,alignItems:'center',justifyContent:'center',flexWrap:'wrap',marginBottom:12}}>
            <input type="email" name="email" required placeholder="Tu email" aria-label="Tu email" style={{padding:'0.6rem 0.8rem',borderRadius:8,border:'1px solid #ffffff22',background:'rgba(0,0,0,.35)',color:'#fff',minWidth:220}} />
            <button type="submit" style={{background:'#ef4444',color:'#fff',border:'none',borderRadius:8,padding:'0.7rem 1.5rem',fontWeight:700,cursor:'pointer',boxShadow:'0 2px 8px #ef444433'}}>
              Avisarme cuando vuelva
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
        <style>{`
          @keyframes bounce { 0%{transform:translateY(0);} 100%{transform:translateY(-18px) scale(1.08);} }
          @keyframes spin { 0%{transform:rotate(0deg);} 100%{transform:rotate(360deg);} }
        `}</style>
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
      <Routes>
        <Route path="/" element={<Home memberCount={memberCount} totalMembers={totalMembers} loading={loading} />} />
        <Route path="/cookies" element={<Cookies />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/support" element={<Support />} />
        <Route path="/blackmarket" element={<BlackMarket />} />
        <Route path="/rules" element={<Rules />} />
        <Route path="/news" element={<News />} />
        <Route path="/stockmarket" element={<StockMarket />} />
        <Route path="/apps" element={<AppsMenu />} />
        <Route path="/apps/tinder" element={<TinderRP />} />
        <Route path="/apps/banco" element={<BancoCentralRP />} />
        <Route path="/apps/minijuegos" element={<MinijuegosRP />} />
        <Route path="/apps/tienda" element={<SimuladorTienda />} />
        <Route path="/panel" element={<Panel />} />
        <Route path="/admin" element={<PrivateRoute><AdminPanel /></PrivateRoute>} />
        <Route path="/auth/login" element={<LoginPage />} />
        <Route path="/logout" element={<LogoutPage />} />
        <Route path="/logs" element={<PrivateRoute><AdvancedLogs /></PrivateRoute>} />
        <Route path="/404" element={<NotFound />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <CookieConsentBanner />
      {!hideFooter && <Footer />}
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
      <img src={spainLogo} alt="SpainRP Logo" style={{width:80,height:80,borderRadius:'50%',boxShadow:'0 2px 12px #FFD70033',marginBottom:24,animation:'spinLogo 1.5s linear infinite'}} />
      <h2 style={{color:'#FFD700',fontWeight:800,fontSize:'2rem',marginBottom:'1rem'}}>Cerrando sesión...</h2>
      <div style={{color:'#fff',fontSize:'1.1rem',marginBottom:'1.5rem'}}>Gracias por usar SpainRP. Espera un momento...</div>
      <style>{`
        @keyframes spinLogo { 0% { transform: rotate(0deg);} 100% { transform: rotate(360deg);} }
      `}</style>
    </div>
  );
}

export default App;
