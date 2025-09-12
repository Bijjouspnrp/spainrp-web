import React, { useEffect, useState } from 'react';

import DailyCalendar from './DailyCalendar.jsx';
import AdminPanel from './AdminPanel.jsx';
import './Panel.css';
import { 
  FaBars, 
  FaUserShield, 
  FaUser, 
  FaChevronDown, 
  FaChevronUp, 
  FaCrown, 
  FaIdCard, 
  FaCoins, 
  FaGavel, 
  FaFolderOpen,
  FaHome,
  FaGamepad,
  FaNewspaper,
  FaShoppingCart,
  FaCog,
  FaSignOutAlt,
  FaBell,
  FaChartLine,
  FaShieldAlt,
  FaCalendarCheck,
  FaUserCircle,
  FaEnvelope,
  FaImage,
  FaBan,
  FaUserTimes,
  FaUserPlus,
  FaUsers,
  FaCog as FaSettings,
  FaHistory,
  FaClipboardList
} from 'react-icons/fa';

const TERMS_KEY = 'spainrp_terms_accepted';

const Panel = () => {
  const [user, setUser] = useState(null);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTerms, setShowTerms] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showRoles, setShowRoles] = useState(false);
  const [activeSection, setActiveSection] = useState('overview');
  

  // Estado para imagen real de DNI
  const [dniImgUrl, setDniImgUrl] = useState(null);


  useEffect(() => {
    // Mostrar términos si no se han aceptado
    if (!localStorage.getItem(TERMS_KEY)) {
      setShowTerms(true);
    }
    
    // Obtener datos del usuario autenticado
  fetch('/auth/me', { credentials: 'include' })
      .then(res => {
        if (res.status === 401) {
          setUser(null);
          setLoading(false);
          return null;
        }
        return res.ok ? res.json() : null;
      })
      .then(data => {
        if (data && data.user) {
          setUser(data.user);
          // Obtener roles del usuario en el servidor SpainRP (guildId necesario)
          const guildId = '1212556680911650866'; // ID del servidor SpainRP
          fetch(`/api/member/${guildId}/${data.user.id}`, { credentials: 'include' })
            .then(res => {
              if (res.status === 401) {
                setRoles([]);
                setUser(u => ({ ...u, joinedAt: null, permissions: null }));
                setLoading(false);
                return null;
              }
              if (res.status === 404) {
                // Si el usuario está autenticado pero no está en el servidor Discord,
                // mostrar el panel con invitación en vez de redirigir a /404
                setRoles([]);
                setUser(u => u ? { ...u, notInGuild: true, invite: undefined } : null);
                setLoading(false);
                return null;
              }
              return res.ok ? res.json() : null;
            })
            .then(member => {
              if (member?.notInGuild) {
                setUser({
                  ...data.user,
                  notInGuild: true,
                  invite: member.invite
                });
                setRoles([]);
                setLoading(false);
                return;
              }
              if (member) {
                setRoles(member?.roles || []);
                setUser(u => ({
                  ...u,
                  joinedAt: member?.joined_at,
                  permissions: member?.permissions
                }));
              }
              setLoading(false);
            })
            .catch(() => setLoading(false));
        } else {
          setLoading(false);
        }
      })
      .catch(() => setLoading(false));
  }, []);

  // Manejar navegación por URL
  useEffect(() => {
    const handleRouteChange = () => {
      const path = window.location.pathname;
      if (path === '/panel') setActiveSection('overview');
      else if (path === '/panel/profile') setActiveSection('profile');
      else if (path === '/apps') setActiveSection('apps');
      else if (path === '/news') setActiveSection('news');
      else if (path === '/blackmarket') setActiveSection('market');
      else if (path === '/admin') setActiveSection('admin');
    };
    
    handleRouteChange();
    window.addEventListener('popstate', handleRouteChange);
    return () => window.removeEventListener('popstate', handleRouteChange);
  }, []);

  // Determinar si el usuario es admin o ciudadano
  const isAdmin = roles.some(r => r.name?.toLowerCase().includes('admin') || r.name?.toLowerCase().includes('staff') || r.name?.toLowerCase().includes('moderador'));

  const menuItems = [
    { id: 'overview', label: 'Resumen', icon: FaHome, href: '/panel' },
    { id: 'profile', label: 'Perfil', icon: FaUserCircle, href: '/panel/profile' },
    { id: 'apps', label: 'Apps RP', icon: FaGamepad, href: '/apps' },
    { id: 'news', label: 'Noticias', icon: FaNewspaper, href: '/news' },
    { id: 'market', label: 'Blackmarket', icon: FaShoppingCart, href: '/blackmarket' },
    ...(isAdmin ? [{ id: 'admin', label: 'Admin Panel', icon: FaCrown, href: '/admin', admin: true }] : [])
  ];

  // Mostrar imagen real de DNI usando el endpoint proxy y detectar si existe
  const [dniExists, setDniExists] = useState(null); // null: no comprobado, true: existe, false: no existe
  useEffect(() => {
    if (user?.id) {
      const url = `/api/proxy/dni/${user.id}/exportar?${Date.now()}`;
      setDniImgUrl(url);
      setDniExists(null);
      // Comprobar si la imagen existe realmente
      fetch(url, { method: 'HEAD' })
        .then(res => {
          setDniExists(res.ok);
        })
        .catch(() => setDniExists(false));
    } else {
      setDniImgUrl(null);
      setDniExists(null);
    }
  }, [user?.id]);

  // Estado para flip animación
  const [dniFlipped, setDniFlipped] = useState(false);
  // Estado para mostrar modal de reporte
  const [showReport, setShowReport] = useState(false);
  const [reportMsg, setReportMsg] = useState("");
  const [reportLoading, setReportLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const renderOverview = () => (
    <div className="overview-section">
      <div className="welcome-card">
        <div className="welcome-header">
          <img 
            src={user?.avatar ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png` : import.meta.env.BASE_URL + 'src/assets/spainrplogo.png'} 
            alt="Avatar" 
            className="user-avatar"
          />
          <div className="welcome-text">
            <h1>¡Bienvenido, {user?.username}!</h1>
            <p>Panel de control de SpainRP</p>
          </div>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card" style={{gridColumn:'span 2',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'1.2rem 0'}}>
          <div className="stat-icon" style={{marginBottom:8}}>
            <FaIdCard />
          </div>
          <div className="stat-content" style={{width:'100%',textAlign:'center'}}>
            <h3 style={{marginBottom:8}}>DNI digital</h3>

            {dniExists === true ? (
              <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center'}}>
                {/* Flip Card */}
                <div 
                  className={`dni-flip-card${dniFlipped ? ' flipped' : ''}`}
                  style={{width:340,height:210,margin:'0 auto',perspective:1000,position:'relative'}}
                  onClick={() => setDniFlipped(f => !f)}
                  title="Haz click para girar el DNI"
                >
                  <div className="dni-flip-inner" style={{position:'relative',width:'100%',height:'100%',transition:'transform 0.7s cubic-bezier(.4,2,.6,1)',transformStyle:'preserve-3d',transform: dniFlipped ? 'rotateY(180deg)' : 'none'}}>
                    {/* Anverso */}
                    <div className="dni-flip-front" style={{position:'absolute',width:'100%',height:'100%',backfaceVisibility:'hidden',zIndex:2}}>
                      <img src={dniImgUrl} alt="DNI SpainRP" style={{width:'100%',height:'100%',objectFit:'cover',borderRadius:12,boxShadow:'0 2px 12px #23272a44',background:'#fff'}} />
                    </div>
                    {/* Reverso: solo datos básicos */}
                    <div className="dni-flip-back" style={{position:'absolute',width:'100%',height:'100%',backfaceVisibility:'hidden',transform:'rotateY(180deg)',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',background:'#fff',borderRadius:12,boxShadow:'0 2px 12px #23272a44'}}>
                      <div style={{fontSize:14,color:'#333',marginBottom:4}}>ID: {user?.id}</div>
                      <div style={{fontSize:12,color:'#888'}}>Usuario: {user?.username}</div>
                    </div>
                  </div>
                </div>
                {/* Botón descargar pequeño y centrado */}
                <button
                  className="btn-primary"
                  style={{margin:'10px auto 0 auto',padding:'4px 16px',fontSize:13,display:'block',borderRadius:8,minWidth:120}}
                  onClick={e => {
                    e.stopPropagation();
                    const link = document.createElement('a');
                    link.href = dniImgUrl;
                    link.download = `DNI_SpainRP_${user?.username || 'usuario'}.png`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }}
                >
                  Descargar DNI
                </button>
                {/* Botón reportar problema */}
                <button
                  className="btn-secondary"
                  style={{margin:'8px auto 0 auto',padding:'3px 12px',fontSize:12,display:'block',borderRadius:8,minWidth:120,background:'#f8d7da',color:'#721c24',border:'none'}}
                  onClick={e => {
                    e.stopPropagation();
                    setShowReport(true);
                  }}
                >
                  Reportar problema
                </button>
              </div>
            ) : dniExists === false ? (
              <div style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 120,
                animation: 'fadeIn 0.7s',
                color: '#888',
                border: '1px dashed #bbb',
                borderRadius: 12,
                padding: 24,
                background: 'rgba(255,255,255,0.7)',
                boxShadow: '0 2px 12px #23272a11',
                margin: '12px 0'
              }}>
                <img src={import.meta.env.BASE_URL + 'src/assets/spainrplogo.png'} alt="SpainRP" style={{width: 64, opacity: 0.7, marginBottom: 12, filter: 'grayscale(1)'}} />
                <div style={{fontSize: 17, fontWeight: 500, marginBottom: 6, color: '#555'}}>No tienes DNI generado</div>
                <div style={{fontSize: 14, marginBottom: 10}}>
                  Para obtener tu DNI digital, usa el comando <b>/dni_crear</b> en el servidor de Discord.<br/>
                  Una vez creado, vuelve aquí y recarga la página.<br/>
                </div>
                <button
                  className="btn-secondary"
                  style={{margin:'6px auto 0 auto',padding:'3px 12px',fontSize:13,display:'block',borderRadius:8,minWidth:120,background:'#f8d7da',color:'#721c24',border:'none'}}
                  onClick={e => {
                    e.stopPropagation();
                    setShowReport(true);
                  }}
                >
                  ¿Crees que es un error? Reportar problema
                </button>
                {/* Animación fadeIn definida en CSS global, no aquí para evitar parpadeos */}
              </div>
            ) : (
              <div style={{height:120,display:'flex',alignItems:'center',justifyContent:'center',color:'#bbb',fontSize:15}}>Comprobando DNI...</div>
            )}
            <div style={{marginTop:8,fontSize:13,color:'#888'}}>Puedes usar este DNI en el servidor y exportarlo como imagen.<br/>Haz click en el DNI para girar y ver el reverso.</div>

      {/* Modal para reportar problemas con el DNI (Formcarry + reCAPTCHA) */}

      {showReport && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Reportar problema con el DNI</h3>
            <p>Por favor, rellena todos los campos. El equipo de SpainRP lo revisará.</p>
            <form
              method="POST"
              action="https://formcarry.com/s/MTax-JUiWPu"
              target="_blank"
              onSubmit={e => {
                // Validación simple en frontend
                const form = e.target;
                if (!form.name.value.trim() || !form.email.value.trim() || !form.message.value.trim()) {
                  e.preventDefault();
                  setToast({ type: 'error', msg: 'Por favor rellena todos los campos.' });
                  return false;
                }
                setShowReport(false);
                setToast({ type: 'success', msg: '¡Reporte enviado correctamente!' });
                setReportMsg("");
                return true;
              }}
            >
              <input
                type="text"
                name="name"
                placeholder="Tu nombre o usuario Discord"
                defaultValue={user?.username || ''}
                style={{width:'100%',marginBottom:8,padding:6,borderRadius:6,border:'1px solid #ccc',fontSize:14}}
                required
                autoFocus
              />
              <input
                type="email"
                name="email"
                placeholder="Tu email de contacto"
                style={{width:'100%',marginBottom:8,padding:6,borderRadius:6,border:'1px solid #ccc',fontSize:14}}
                required
              />
              <textarea
                name="message"
                style={{width:'100%',minHeight:60,marginBottom:12,padding:6,borderRadius:6,border:'1px solid #ccc',fontSize:14}}
                placeholder="Describe el problema..."
                value={reportMsg}
                onChange={e => setReportMsg(e.target.value)}
                required
              />
              <div style={{display:'flex',justifyContent:'flex-end',gap:8}}>
                <button type="button" className="btn-secondary" onClick={()=>setShowReport(false)}>Cancelar</button>
                <button type="submit" className="btn-primary">Enviar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast de éxito/error */}
      {toast && (
        <div style={{position:'fixed',bottom:24,left:'50%',transform:'translateX(-50%)',zIndex:9999,padding:'12px 24px',borderRadius:8,background:toast.type==='success'?'#d4edda':'#f8d7da',color:toast.type==='success'?'#155724':'#721c24',boxShadow:'0 2px 12px #23272a44',fontWeight:500}}>
          {toast.msg}
        </div>
      )}

            {/*
              IDEAS EXTRA PARA LA SECCIÓN DNI:
              - Mostrar QR escaneable con enlace a perfil o verificación.
              - Botón para compartir DNI en Discord (webhook o DM).
              - Mostrar historial de DNIs generados (si aplica).
              - Añadir animación de "flip" para ver anverso/reverso.
              - Mostrar estado de validez o caducidad del DNI.
              - Permitir personalizar foto/avatar del DNI.
              - Botón para reportar problemas con el DNI.
              - Mostrar cuándo fue generado el DNI y por quién.
              - Integrar con apps RP para validar identidad en tiempo real.
            */}
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <FaFolderOpen />
          </div>
          <div className="stat-content">
            <h3>Antecedentes</h3>
            <p className="stat-value">0</p>
            <span className="stat-label">Registros</span>
            </div>
          </div>

        <div className="stat-card">
          <div className="stat-icon">
            <FaGavel />
          </div>
          <div className="stat-content">
            <h3>Arrestos</h3>
            <p className="stat-value">0</p>
            <span className="stat-label">Total</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <FaCoins />
            </div>
          <div className="stat-content">
            <h3>Multas</h3>
            <p className="stat-value">0</p>
            <span className="stat-label">Pendientes</span>
            </div>
            </div>
          </div>

      <div className="calendar-section">
        <h2><FaCalendarCheck /> Registro Diario</h2>
        <DailyCalendar />
      </div>
    </div>
  );

  const renderProfile = () => (
    <div className="profile-section">
      <div className="profile-card">
        <div className="profile-header">
          <img 
            src={user?.avatar ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png` : import.meta.env.BASE_URL + 'src/assets/spainrplogo.png'} 
            alt="Avatar" 
            className="profile-avatar"
          />
          <div className="profile-info">
            <h2>{user?.username}#{user?.discriminator}</h2>
            <p>ID: {user?.id}</p>
            {user?.joinedAt && (
              <p>Miembro desde: {new Date(user.joinedAt).toLocaleDateString()}</p>
                )}
              </div>
        </div>

        <div className="roles-section">
          <h3>Roles ({roles.length})</h3>
          <div className="roles-grid">
            {roles.length > 0 ? roles.map((role, i) => (
              <span key={i} className={`role-badge ${isAdmin ? 'admin' : 'user'}`}>
                {isAdmin ? <FaUserShield /> : <FaUser />}
                {role.name}
              </span>
            )) : <span className="no-roles">No tienes roles especiales</span>}
          </div>
                </div>
                </div>
            </div>
  );

  const renderAdminTools = () => (
    <div className="admin-section">
      <AdminPanel />
    </div>
  );

  return (
    <div className="panel-container">
      {/* Overlay para móviles */}
      {sidebarOpen && <div className="sidebar-overlay open" onClick={() => setSidebarOpen(false)}></div>}
      
      {/* Sidebar */}
      <div className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <img src={import.meta.env.BASE_URL + 'src/assets/spainrplogo.png'} alt="SpainRP" className="sidebar-logo" />
          <h2>SpainRP</h2>
        </div>
        
        <nav className="sidebar-nav">
          {menuItems.map(item => (
            <button
              key={item.id}
              className={`nav-item ${activeSection === item.id ? 'active' : ''} ${item.admin ? 'admin' : ''}`}
              onClick={() => {
                setActiveSection(item.id);
                setSidebarOpen(false);
                // Navegar a la URL correspondiente
                window.history.pushState({}, '', item.href);
              }}
            >
              <item.icon />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <a href="/logout" className="logout-btn">
            <FaSignOutAlt />
            <span>Cerrar sesión</span>
          </a>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {/* Header */}
        <header className="main-header">
          <button 
            className="menu-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <FaBars />
          </button>
          <h1>Panel de Control</h1>
          <div className="header-actions">
            <button className="notification-btn">
              <FaBell />
            </button>
          </div>
        </header>

        {/* Content Area */}
        <main className="content-area">
          {loading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Cargando datos...</p>
            </div>
          ) : user ? (
            <>
              {user.notInGuild ? (
                <div className="not-in-guild">
                  <img src={import.meta.env.BASE_URL + 'src/assets/spainrplogo.png'} alt="SpainRP" />
                  <h2>No estás en SpainRP</h2>
                  <p>Para acceder a todas las funciones, únete al servidor Discord</p>
                  <a href={user.invite || 'https://discord.gg/sMzFgFQHXA'} target="_blank" rel="noopener" className="btn-primary">
                    Unirse a SpainRP
                  </a>
            </div>
          ) : (
                <>
                  {activeSection === 'overview' && renderOverview()}
                  {activeSection === 'profile' && renderProfile()}
                  {activeSection === 'admin' && isAdmin && renderAdminTools()}
                </>
              )}
            </>
          ) : (
            <div className="no-session">
              <h2>No tienes sesión activa</h2>
              <p>No se pudo cargar tu información de Discord</p>
              <a href="/auth/login" className="btn-primary">Iniciar sesión</a>
            </div>
          )}
        </main>
      </div>

      {/* Terms Modal */}
      {showTerms && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Términos y Servicio</h3>
            <p>
              Al usar el panel SpainRP aceptas los <a href="/terms">Términos y Servicio</a> y la <a href="/privacy">Política de Privacidad</a>.
              El uso indebido puede conllevar sanciones o expulsión del servidor.
            </p>
            <button 
              className="btn-primary"
              onClick={() => {
                localStorage.setItem(TERMS_KEY, '1');
                setShowTerms(false);
              }}
            >
              Aceptar y continuar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Panel; 