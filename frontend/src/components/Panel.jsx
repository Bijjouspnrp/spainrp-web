import React, { useEffect, useState } from 'react';

import DailyCalendar from './DailyCalendar.jsx';
import AdminPanel from './AdminPanel.jsx';
import './Panel.css';
import { apiUrl } from '../utils/api';
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
  FaClipboardList,
  FaCheckCircle,
  FaSpinner
} from 'react-icons/fa';

const TERMS_KEY = 'spainrp_terms_accepted';

const Panel = () => {
  // Estado para input y verificación Roblox
  const [robloxUsername, setRobloxUsername] = useState("");
  const [robloxError, setRobloxError] = useState("");
  const [robloxLoading, setRobloxLoading] = useState(false);
  const [robloxProfile, setRobloxProfile] = useState(null); // Datos del perfil Roblox
  const [robloxVerified, setRobloxVerified] = useState(false);
  const [robloxConfirming, setRobloxConfirming] = useState(false);
  const [robloxUnlinkSuccess, setRobloxUnlinkSuccess] = useState(false);
  const [robloxUnlinkModal, setRobloxUnlinkModal] = useState(false);
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
  fetch(apiUrl('/auth/me'), { credentials: 'include' })
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
          fetch(apiUrl(`/api/member/${guildId}/${data.user.id}`), { credentials: 'include' })
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
  // Consultar perfil Roblox verificado al cargar usuario
  useEffect(() => {
    if (user?.id) {
      fetch(apiUrl(`/api/roblox/profile/${user.id}`))
        .then(res => res.ok ? res.json() : null)
        .then(data => {
          if (data && data.robloxUserId) {
            setRobloxProfile({
              userId: data.robloxUserId,
              username: data.robloxUsername,
              displayName: data.robloxDisplayName,
              avatarUrl: data.robloxAvatarUrl
            });
            setRobloxVerified(true);
          }
        })
        .catch(() => {});
    }
  }, [user?.id]);
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
      const url = apiUrl(`/api/proxy/dni/${user.id}/exportar?${Date.now()}`);
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


  // Estado para totales generales
  const [statsTotals, setStatsTotals] = useState({ antecedentes: 0, arrestos: 0, multasPendientes: 0 });
  // Estado para antecedentes y multas individuales
  const [userRecords, setUserRecords] = useState({ antecedentes: 0, multasTotal: 0, multasPendientes: 0 });

  useEffect(() => {
    fetch(apiUrl('/api/admin-records/stats/records'))
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data) setStatsTotals({
          antecedentes: data.antecedentes || 0,
          arrestos: data.arrestos || 0,
          multasPendientes: data.multasPendientes || 0
        });
      })
      .catch(() => {});
  }, []);

  // Consultar antecedentes y multas del usuario autenticado
  useEffect(() => {
    if (user?.id) {
      fetch(apiUrl(`/api/admin-records/antecedentes/${user.id}`))
        .then(res => res.ok ? res.json() : null)
        .then(data => {
          setUserRecords(r => ({ ...r, antecedentes: data?.total || 0 }));
        })
        .catch(() => {});
      fetch(apiUrl(`/api/admin-records/multas/${user.id}`))
        .then(res => res.ok ? res.json() : null)
        .then(data => {
          setUserRecords(r => ({
            ...r,
            multasTotal: data?.total || 0,
            multasPendientes: data?.pendientes || 0
          }));
        })
        .catch(() => {});
    }
  }, [user?.id]);

  const allZero =
    statsTotals.antecedentes === 0 &&
    statsTotals.arrestos === 0 &&
    statsTotals.multasPendientes === 0 &&
    userRecords.antecedentes === 0 &&
    userRecords.multasTotal === 0 &&
    userRecords.multasPendientes === 0;

  const renderOverview = () => (
    <div className="overview-section">
      <div className="welcome-card">
        <div className="welcome-header">
          <img 
            src={user?.avatar ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png` : '/assets/spainrplogo.png'} 
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
        {allZero && (
          <div style={{
            background: '#fffbe6',
            color: '#856404',
            border: '1px solid #ffeeba',
            borderRadius: 10,
            padding: '16px 24px',
            marginBottom: 18,
            textAlign: 'center',
            fontWeight: 500,
            fontSize: 16
          }}>
            <span role="img" aria-label="info" style={{marginRight:8}}>ℹ️</span>
            No tienes registros, arrestos ni multas pendientes actualmente.<br/>
            Si esperabas ver datos, contacta con el staff o recarga más tarde.
          </div>
        )}

        {/* DNI digital */}
        <div className="stat-card" style={{gridColumn:'span 2',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'1.2rem 0'}}>
          <div className="stat-icon" style={{marginBottom:8}}>
            <FaIdCard />
          </div>
          <div className="stat-content" style={{width:'100%',textAlign:'center'}}>
            <h3 style={{marginBottom:8}}>DNI digital</h3>
            {/* ...existing code DNI... */}
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
                <img src={'/assets/spainrplogo.png'} alt="SpainRP" style={{width: 64, opacity: 0.7, marginBottom: 12, filter: 'grayscale(1)'}} />
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
            {/* ...fin DNI... */}
          </div>
        </div>

        {/* Estadísticas ordenadas */}
        <div className="stat-row" style={{display:'flex',gap:24,marginTop:16,flexWrap:'wrap'}}>
          <div className="stat-card" style={{flex:1,minWidth:180}}>
            <div className="stat-icon"><FaFolderOpen /></div>
            <div className="stat-content">
              <h3>Antecedentes</h3>
              <div style={{fontSize:15,fontWeight:600}}>Tus registros: <span style={{color:'#007bff'}}>{userRecords.antecedentes}</span></div>
              <div style={{fontSize:14,color:'#888',marginTop:2}}>Total global: <span style={{color:'#333'}}>{statsTotals.antecedentes}</span></div>
            </div>
          </div>
          <div className="stat-card" style={{flex:1,minWidth:180}}>
            <div className="stat-icon"><FaGavel /></div>
            <div className="stat-content">
              <h3>Arrestos</h3>
              <div style={{fontSize:15,fontWeight:600}}>Global: <span style={{color:'#333'}}>{statsTotals.arrestos}</span></div>
            </div>
          </div>
          <div className="stat-card" style={{flex:1,minWidth:180}}>
            <div className="stat-icon"><FaCoins /></div>
            <div className="stat-content">
              <h3>Multas</h3>
              <div style={{fontSize:15,fontWeight:600}}>Tus pendientes: <span style={{color:'#d9534f'}}>{userRecords.multasPendientes}</span></div>
              <div style={{fontSize:14,color:'#888',marginTop:2}}>Total usuario: <span style={{color:'#333'}}>{userRecords.multasTotal}</span> | Global: <span style={{color:'#333'}}>{statsTotals.multasPendientes}</span></div>
            </div>
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
            src={user?.avatar ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png` : '/assets/spainrplogo.png'} 
            alt="Avatar" 
            className="profile-avatar"
          />
          <div className="profile-info">
            <h2>{user?.username}#{user?.discriminator}
              {/* Etiqueta Staff si corresponde */}
              {isAdmin && (
                <span style={{
                  background: 'linear-gradient(90deg,#007bff,#0056b3)',
                  color: '#fff',
                  borderRadius: '8px',
                  padding: '2px 10px',
                  marginLeft: 10,
                  fontWeight: 700,
                  fontSize: 13,
                  verticalAlign: 'middle',
                  boxShadow: '0 1px 6px #0056b333',
                  display: 'inline-block',
                }} title="Staff SpainRP">
                  <FaUserShield style={{marginRight:5,verticalAlign:'middle'}} />STAFF
                </span>
              )}
              {/* Etiqueta especial si está verificado con Roblox */}
              {robloxVerified && robloxProfile && (
                <span style={{
                  background: 'linear-gradient(90deg,#0099ff,#00e0ff)',
                  color: '#fff',
                  borderRadius: '10px',
                  padding: '2px 14px 2px 8px',
                  marginLeft: 10,
                  fontWeight: 700,
                  fontSize: 14,
                  verticalAlign: 'middle',
                  display: 'inline-flex',
                  alignItems: 'center',
                  boxShadow: '0 1px 8px #0099ff33',
                  gap: 7,
                  border: '1.5px solid #00e0ff',
                  position: 'relative'
                }} title={`Verificado con Roblox: ${robloxProfile.username}`}>
                  <img src={robloxProfile.avatarUrl} alt="Roblox avatar" style={{width:22,height:22,borderRadius:'50%',marginRight:6,boxShadow:'0 1px 6px #0099ff33',border:'1px solid #fff'}} />
                  <span style={{fontWeight:700}}>Roblox</span>
                  <span style={{fontSize:12,background:'#fff2',color:'#fff',borderRadius:6,padding:'0 6px',marginLeft:6}}>{robloxProfile.username}</span>
                  <button
                    style={{
                      background:'none',
                      border:'none',
                      color:'#fff',
                      fontSize:16,
                      marginLeft:8,
                      cursor:'pointer',
                      opacity:0.7,
                      transition:'opacity 0.2s',
                      padding:0
                    }}
                    title="Desvincular perfil Roblox"
                    onClick={e => {
                      e.stopPropagation();
                      setRobloxUnlinkModal(true);
                    }}
                  >✖</button>
                </span>
              )}
              {/* Insignias automáticas ordenadas por prioridad y sin duplicados */}
              {roles.some(r => r.name?.toLowerCase().includes('dueño')) && (
                <span style={{background:'#c62828',color:'#fff',borderRadius:'8px',padding:'2px 10px',marginLeft:10,fontWeight:700,fontSize:13,verticalAlign:'middle',display:'inline-block'}} title="Dueño">👑 Dueño</span>
              )}
              {roles.some(r => r.name?.toLowerCase().includes('socio fundador spainrp')) && (
                <span style={{background:'#ffd700',color:'#333',borderRadius:'8px',padding:'2px 10px',marginLeft:10,fontWeight:700,fontSize:13,verticalAlign:'middle',display:'inline-block'}} title="Socio Fundador SpainRP">👑 Socio Fundador</span>
              )}
              {roles.some(r => r.name?.toLowerCase().includes('developer')) && (
                <span style={{background:'#00bcd4',color:'#fff',borderRadius:'8px',padding:'2px 10px',marginLeft:10,fontWeight:700,fontSize:13,verticalAlign:'middle',display:'inline-block'}} title="Developer">💻 Developer</span>
              )}
              {roles.some(r => r.name?.toLowerCase().includes('empresario') || r.name?.toLowerCase().includes('dueño de empresa')) && (
                <span style={{background:'linear-gradient(90deg,#00c853,#009624)',color:'#fff',borderRadius:'8px',padding:'2px 10px',marginLeft:10,fontWeight:700,fontSize:13,verticalAlign:'middle',boxShadow:'0 1px 6px #00962433',display:'inline-block'}} title="Empresario SpainRP">🏢 EMPRESARIO</span>
              )}
              {roles.some(r => ['donador','booster','nitro','patrocinador'].some(tag => r.name?.toLowerCase().includes(tag))) && (
                <span style={{background:'linear-gradient(90deg,#ffd700,#ff9800)',color:'#333',borderRadius:'8px',padding:'2px 10px',marginLeft:10,fontWeight:700,fontSize:13,verticalAlign:'middle',boxShadow:'0 1px 6px #ffd70033',display:'inline-block'}} title="Donador SpainRP">💎 DONADOR</span>
              )}
              {roles.some(r => r.name?.toLowerCase().includes('policia nacional')) && (
                <span style={{background:'#1976d2',color:'#fff',borderRadius:'8px',padding:'2px 10px',marginLeft:10,fontWeight:700,fontSize:13,verticalAlign:'middle',display:'inline-block'}} title="Policia Nacional">👮‍♂️ Policia Nacional</span>
              )}
              {roles.some(r => r.name?.toLowerCase().includes('guardia civil')) && (
                <span style={{background:'#388e3c',color:'#fff',borderRadius:'8px',padding:'2px 10px',marginLeft:10,fontWeight:700,fontSize:13,verticalAlign:'middle',display:'inline-block'}} title="Guardia Civil">🚔 Guardia Civil</span>
              )}
              {roles.some(r => r.name?.toLowerCase().includes('cuerpo de bomberos')) && (
                <span style={{background:'#ff9800',color:'#333',borderRadius:'8px',padding:'2px 10px',marginLeft:10,fontWeight:700,fontSize:13,verticalAlign:'middle',display:'inline-block'}} title="Cuerpo de Bomberos">🔥 Bomberos</span>
              )}
              {roles.some(r => r.name?.toLowerCase().includes('civil')) && (
                <span style={{background:'#607d8b',color:'#fff',borderRadius:'8px',padding:'2px 10px',marginLeft:10,fontWeight:700,fontSize:13,verticalAlign:'middle',display:'inline-block'}} title="Civil">🧑‍🤝‍🧑 Civil</span>
              )}
              {roles.some(r => r.name?.toLowerCase().includes('mafia administrativa')) && (
                <span style={{background:'#212121',color:'#fff',borderRadius:'8px',padding:'2px 10px',marginLeft:10,fontWeight:700,fontSize:13,verticalAlign:'middle',display:'inline-block'}} title="Mafia Administrativa">🔪 Mafia</span>
              )}
              {roles.some(r => r.name?.toLowerCase().includes('noticiero')) && (
                <span style={{background:'#ffeb3b',color:'#333',borderRadius:'8px',padding:'2px 10px',marginLeft:10,fontWeight:700,fontSize:13,verticalAlign:'middle',display:'inline-block'}} title="Noticiero">🗞️ Noticiero</span>
              )}
              {roles.some(r => r.name?.toLowerCase().includes('criminal')) && (
                <span style={{background:'#b71c1c',color:'#fff',borderRadius:'8px',padding:'2px 10px',marginLeft:10,fontWeight:700,fontSize:13,verticalAlign:'middle',display:'inline-block'}} title="Criminal">🔫 Criminal</span>
              )}
              {roles.some(r => r.name?.toLowerCase().includes('españa')) && (
                <span style={{background:'#1976d2',color:'#fff',borderRadius:'8px',padding:'2px 10px',marginLeft:10,fontWeight:700,fontSize:13,verticalAlign:'middle',display:'inline-block'}} title="España">🇪🇸 España</span>
              )}
              {roles.some(r => r.name?.toLowerCase().includes('verano 2025')) && (
                <span style={{background:'#ff9800',color:'#333',borderRadius:'8px',padding:'2px 10px',marginLeft:10,fontWeight:700,fontSize:13,verticalAlign:'middle',display:'inline-block'}} title="Verano 2025">🌞 Verano 2025</span>
              )}
              {roles.some(r => r.name?.toLowerCase().includes('delitos penales')) && (
                <span style={{background:'#616161',color:'#fff',borderRadius:'8px',padding:'2px 10px',marginLeft:10,fontWeight:700,fontSize:13,verticalAlign:'middle',display:'inline-block'}} title="Delitos Penales">⛓️ Delitos Penales</span>
              )}
              {roles.some(r => r.name?.toLowerCase().includes('dni')) && (
                <span style={{background:'#90caf9',color:'#333',borderRadius:'8px',padding:'2px 10px',marginLeft:10,fontWeight:700,fontSize:13,verticalAlign:'middle',display:'inline-block'}} title="DNI">🪪 DNI</span>
              )}
              {/* Insignia OG si corresponde (soporta string, timestamp, y más formatos) */}
              {(() => {
                if (!user?.joinedAt) {
                  console.log('[OG Badge] joinedAt no existe:', user?.joinedAt);
                  return null;
                }
                let joinedDate = null;
                let raw = user.joinedAt;
                // ISO string
                if (typeof raw === 'string' && !isNaN(Date.parse(raw))) {
                  joinedDate = new Date(raw);
                  console.log('[OG Badge] Formato ISO:', raw, joinedDate);
                }
                // Timestamp (segundos o ms)
                else if (typeof raw === 'number') {
                  joinedDate = new Date(raw < 1e12 ? raw * 1000 : raw);
                  console.log('[OG Badge] Formato timestamp:', raw, joinedDate);
                }
                // Formato fecha corta (dd/mm/yyyy)
                else if (typeof raw === 'string' && /^\d{1,2}\/\d{1,2}\/\d{4}$/.test(raw)) {
                  const [d, m, y] = raw.split('/').map(Number);
                  joinedDate = new Date(y, m - 1, d);
                  console.log('[OG Badge] Formato dd/mm/yyyy:', raw, joinedDate);
                }
                // Formato fecha larga (ej: 14 de septiembre de 2025)
                else if (typeof raw === 'string' && /de/.test(raw)) {
                  // Intentar parsear con Intl
                  try {
                    const parts = raw.match(/(\d{1,2}) de ([a-zA-Z]+) de (\d{4})/);
                    if (parts) {
                      const day = Number(parts[1]);
                      const month = {
                        enero:0, febrero:1, marzo:2, abril:3, mayo:4, junio:5, julio:6, agosto:7, septiembre:8, octubre:9, noviembre:10, diciembre:11
                      }[parts[2].toLowerCase()];
                      const year = Number(parts[3]);
                      if (month !== undefined) {
                        joinedDate = new Date(year, month, day);
                        console.log('[OG Badge] Formato largo ES:', raw, joinedDate);
                      }
                    }
                  } catch (e) {
                    console.log('[OG Badge] Error parseando fecha larga:', raw, e);
                  }
                }
                // Si no se pudo parsear
                if (!joinedDate || isNaN(joinedDate.getTime())) {
                  console.log('[OG Badge] joinedAt formato no soportado:', raw);
                  return null;
                }
                // Ajuste: considerar OG si la fecha es el mismo día o anterior (independiente de la hora)
                const ogYear = 2025, ogMonth = 5, ogDay = 17; // Mes 5 = junio
                const joinedYear = joinedDate.getUTCFullYear();
                const joinedMonth = joinedDate.getUTCMonth();
                const joinedDay = joinedDate.getUTCDate();
                const isOg =
                  joinedYear < ogYear ||
                  (joinedYear === ogYear && joinedMonth < ogMonth) ||
                  (joinedYear === ogYear && joinedMonth === ogMonth && joinedDay <= ogDay);
                if (isOg) {
                  console.log('[OG Badge] Usuario es OG:', raw, joinedDate);
                  return (
                    <span style={{
                      background: 'linear-gradient(90deg,#ff2a2a,#b30000)',
                      color: '#fff',
                      borderRadius: '8px',
                      padding: '2px 10px',
                      marginLeft: 10,
                      fontWeight: 700,
                      fontSize: 13,
                      verticalAlign: 'middle',
                      boxShadow: '0 1px 6px #b3000033',
                      display: 'inline-block',
                    }} title="Miembro OG SpainRP">OG</span>
                  );
                }
                console.log('[OG Badge] Usuario NO es OG:', raw, joinedDate);
                return null;
              })()}
            </h2>
            <p>ID: {user?.id}</p>
            {/* Botón verificar con Roblox mejorado */}
            <div style={{margin:'10px 0'}}>
              {!robloxVerified ? (
                <div>
                  {!robloxProfile ? (
                    <form style={{display:'flex',alignItems:'center',gap:12}} onSubmit={async e => {
                      e.preventDefault();
                      setRobloxLoading(true);
                      setRobloxError("");
                      setRobloxProfile(null);
                      try {
                        // Consultar perfil Roblox desde backend para evitar CORS
                        const res = await fetch(apiUrl('/api/roblox/verify'), {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ username: robloxUsername, discordId: user?.id })
                        });
                        const data = await res.json();
                        if (res.ok && data?.userId) {
                          setRobloxProfile(data);
                          setRobloxError("");
                          setRobloxConfirming(true);
                        } else {
                          setRobloxError(data?.error || "Usuario no encontrado en Roblox.");
                        }
                      } catch (e) {
                        setRobloxError("Error al consultar Roblox. Intenta de nuevo.");
                      }
                      setRobloxLoading(false);
                    }}>
                      <input
                        type="text"
                        value={robloxUsername}
                        onChange={e => setRobloxUsername(e.target.value)}
                        placeholder="Tu usuario de Roblox"
                        style={{padding:'7px 14px',fontSize:15,borderRadius:8,border:'1px solid #bbb',minWidth:140,transition:'box-shadow 0.3s'}}
                        required
                        disabled={robloxLoading}
                        autoFocus
                      />
                      <button
                        className="btn-primary"
                        style={{
                          padding:'6px 20px',
                          fontSize:15,
                          borderRadius:8,
                          minWidth:160,
                          display:'flex',
                          alignItems:'center',
                          gap:8,
                          boxShadow:'0 2px 8px #0099ff22',
                          position:'relative',
                          transition:'background 0.3s'
                        }}
                        disabled={robloxLoading || !robloxUsername}
                        title="Verifica tu cuenta para obtener la insignia Roblox."
                        type="submit"
                      >
                        <span style={{fontSize:18,verticalAlign:'middle'}}>
                          {robloxLoading ? <FaSpinner className="fa-spin" /> : <FaCheckCircle color="#0099ff" />}
                        </span>
                        {robloxLoading ? 'Verificando...' : 'Verificar con Roblox'}
                      </button>
                      <span style={{color:'#888',fontSize:13}}>
                        Escribe tu usuario de Roblox para obtener la insignia especial.
                      </span>
                    </form>
                  ) : (
                    <div className="roblox-confirm-card" style={{
                      background:'#f4f8ff',
                      border:'1px solid #b3d1ff',
                      borderRadius:12,
                      padding:'18px 24px',
                      boxShadow:'0 2px 12px #0099ff22',
                      display:'flex',
                      flexDirection:'column',
                      alignItems:'center',
                      animation:'fadeInScale 0.6s cubic-bezier(.4,2,.6,1)'
                    }}>
                      <img src={robloxProfile.avatarUrl} alt="Roblox avatar" style={{width:80,height:80,borderRadius:'50%',marginBottom:10,boxShadow:'0 2px 8px #0099ff33'}} />
                      <div style={{fontWeight:700,fontSize:17,color:'#0099ff',marginBottom:4}}>{robloxProfile.displayName || robloxProfile.username}</div>
                      <div style={{fontSize:14,color:'#555',marginBottom:8}}>Usuario: <b>{robloxProfile.username}</b> | ID: <span style={{color:'#888'}}>{robloxProfile.userId}</span></div>
                      <div style={{fontSize:13,color:'#888',marginBottom:12}}>¿Es este tu perfil de Roblox?<br/>Confirma para guardar y obtener la insignia.</div>
                      <div style={{display:'flex',gap:16}}>
                        <button
                          className="btn-primary"
                          style={{padding:'7px 22px',fontSize:15,borderRadius:8,boxShadow:'0 2px 8px #0099ff22'}}
                          onClick={async () => {
                            setRobloxLoading(true);
                            setRobloxError("");
                            try {
                              const res = await fetch(apiUrl('/api/roblox/save'), {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                  discordId: user?.id,
                                  robloxUserId: robloxProfile.userId,
                                  robloxUsername: robloxProfile.username,
                                  robloxDisplayName: robloxProfile.displayName,
                                  robloxAvatarUrl: robloxProfile.avatarUrl
                                })
                              });
                              const data = await res.json();
                              if (res.ok && data.success) {
                                setRobloxVerified(true);
                                setRobloxError("");
                                setRobloxConfirming(false);
                              } else {
                                setRobloxError(data?.error || "Error guardando verificación.");
                              }
                            } catch (e) {
                              setRobloxError("Error guardando verificación. Intenta de nuevo.");
                            }
                            setRobloxLoading(false);
                          }}
                          disabled={robloxLoading}
                        >Confirmar y guardar</button>
                        <button
                          className="btn-secondary"
                          style={{padding:'7px 22px',fontSize:15,borderRadius:8,background:'#eee',color:'#333'}}
                          onClick={() => {
                            setRobloxProfile(null);
                            setRobloxConfirming(false);
                          }}
                          disabled={robloxLoading}
                        >Cancelar</button>
                      </div>
                      {robloxError && <div style={{color:'#d32f2f',fontSize:13,marginTop:8}}>{robloxError}</div>}
                    </div>
                  )}
                  {robloxError && !robloxProfile && <div style={{color:'#d32f2f',fontSize:13,marginTop:4}}>{robloxError}</div>}
                </div>
              ) : (
                <span style={{color:'#0099ff',fontWeight:600,fontSize:15,display:'flex',alignItems:'center',gap:6,animation:'fadeInScale 0.6s cubic-bezier(.4,2,.6,1)'}}>
                  <FaCheckCircle color="#0099ff" /> ¡Tu cuenta está verificada con Roblox!
                  {robloxProfile && (
                    <img src={robloxProfile.avatarUrl} alt="Roblox avatar" style={{width:32,height:32,borderRadius:'50%',marginLeft:8,boxShadow:'0 2px 8px #0099ff33'}} />
                  )}
                </span>
              )}
            </div>
            {user?.joinedAt && (
              <p>Miembro desde: {(() => {
                let joinedDate = null;
                let raw = user.joinedAt;
                if (typeof raw === 'string' && !isNaN(Date.parse(raw))) {
                  joinedDate = new Date(raw);
                  console.log('[Miembro desde] Formato ISO:', raw, joinedDate);
                } else if (typeof raw === 'number') {
                  joinedDate = new Date(raw < 1e12 ? raw * 1000 : raw);
                  console.log('[Miembro desde] Formato timestamp:', raw, joinedDate);
                } else if (typeof raw === 'string' && /^\d{1,2}\/\d{1,2}\/\d{4}$/.test(raw)) {
                  const [d, m, y] = raw.split('/').map(Number);
                  joinedDate = new Date(y, m - 1, d);
                  console.log('[Miembro desde] Formato dd/mm/yyyy:', raw, joinedDate);
                } else if (typeof raw === 'string' && /de/.test(raw)) {
                  try {
                    const parts = raw.match(/(\d{1,2}) de ([a-zA-Z]+) de (\d{4})/);
                    if (parts) {
                      const day = Number(parts[1]);
                      const month = {
                        enero:0, febrero:1, marzo:2, abril:3, mayo:4, junio:5, julio:6, agosto:7, septiembre:8, octubre:9, noviembre:10, diciembre:11
                      }[parts[2].toLowerCase()];
                      const year = Number(parts[3]);
                      if (month !== undefined) {
                        joinedDate = new Date(year, month, day);
                        console.log('[Miembro desde] Formato largo ES:', raw, joinedDate);
                      }
                    }
                  } catch (e) {
                    console.log('[Miembro desde] Error parseando fecha larga:', raw, e);
                  }
                }
                return joinedDate ? joinedDate.toLocaleDateString() : String(raw);
              })()}</p>
            )}
          </div>
        </div>

  <div className="roles-section">
          <h3 style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
            <span>Roles ({roles.length})</span>
            {roles.length > 3 && (
              <button
                className="btn-secondary"
                style={{fontSize:13,padding:'2px 10px',borderRadius:6,marginLeft:10}}
                onClick={() => setShowRoles(v => !v)}
              >
                {showRoles ? 'Ocultar' : 'Ver todos'}
              </button>
            )}
          </h3>
          <div className="roles-grid">
            {roles.length > 0 ? (
              (showRoles ? roles : roles.slice(0,3)).map((role, i) => (
                <span key={i} className={`role-badge ${isAdmin ? 'admin' : 'user'}`}> 
                  {isAdmin ? <FaUserShield /> : <FaUser />}
                  {role.name}
                </span>
              ))
            ) : <span className="no-roles">No tienes roles especiales</span>}
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
      {/* Modal de confirmación desvincular Roblox */}
      {robloxUnlinkModal && (
        <div className="modal-overlay" style={{zIndex:9999}}>
          <div className="modal" style={{maxWidth:400,padding:'32px 24px',textAlign:'center'}}>
            <h3>¿Desvincular perfil Roblox?</h3>
            <p>¿Seguro que quieres desvincular tu cuenta de Roblox?<br/>Perderás la insignia y los datos asociados.</p>
            <div style={{display:'flex',gap:18,justifyContent:'center',marginTop:18}}>
              <button className="btn-primary" style={{padding:'8px 24px',fontSize:16}} onClick={handleUnlinkRoblox} disabled={robloxLoading}>
                {robloxLoading ? <FaSpinner className="fa-spin" /> : 'Sí, desvincular'}
              </button>
              <button className="btn-secondary" style={{padding:'8px 24px',fontSize:16}} onClick={() => setRobloxUnlinkModal(false)} disabled={robloxLoading}>Cancelar</button>
            </div>
            {robloxError && <div style={{color:'#d32f2f',fontSize:14,marginTop:10}}>{robloxError}</div>}
          </div>
        </div>
      )}
      {/* Modal de éxito desvinculación Roblox */}
      {robloxUnlinkSuccess && (
        <div className="modal-overlay" style={{zIndex:9999}}>
          <div className="modal" style={{maxWidth:400,padding:'32px 24px',textAlign:'center'}}>
            <h3 style={{color:'#0099ff'}}><FaCheckCircle style={{marginRight:8}}/>Perfil Roblox desvinculado</h3>
            <p>Tu cuenta de Roblox ha sido desvinculada correctamente.<br/>Puedes volver a vincularla cuando quieras.</p>
          </div>
        </div>
      )}
      {/* Overlay para móviles */}
      {sidebarOpen && <div className="sidebar-overlay open" onClick={() => setSidebarOpen(false)}></div>}
      
      {/* Sidebar */}
      <div className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <img src={'/assets/spainrplogo.png'} alt="SpainRP" className="sidebar-logo" />
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
                  <img src={'/assets/spainrplogo.png'} alt="SpainRP" />
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