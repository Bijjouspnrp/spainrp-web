import React, { useEffect, useState } from 'react';
import './Panel1.css';
import { apiUrl } from '../utils/api';

const Panel1 = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [discordStats, setDiscordStats] = useState(null);
  const [adminUsers, setAdminUsers] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const isAdmin = permissions.includes('ADMINISTRATOR') || permissions.includes('MANAGE_SERVER');
  const [security, setSecurity] = useState({ sessions: [], bans: [] });
  const [secLoading, setSecLoading] = useState(false);
  const [secQuery, setSecQuery] = useState('');
  const [announcements, setAnnouncements] = useState([]);
  const [newAnn, setNewAnn] = useState({ title: '', body: '' });
  const [polls, setPolls] = useState([]);
  const [newPoll, setNewPoll] = useState({ question: '', options: ['', ''] });

  useEffect(() => {
    const fetchUser = async () => {
      try {
  const response = await fetch(apiUrl('/auth/user-info'), { 
          credentials: 'include',
          headers: {
            'Accept': 'application/json'
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
          setPermissions(data.user.permissions || []);
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchDiscordStats = async () => {
      try {
  const response = await fetch(apiUrl('/api/discord/widget'), {
          credentials: 'include'
        });
        if (response.ok) {
          const data = await response.json();
          setDiscordStats(data);
        }
      } catch (error) {
        console.error('Error fetching Discord stats:', error);
      }
    };

    fetchUser();
    fetchDiscordStats();
  }, []);

  const fetchAnnouncements = async () => {
    try {
  const res = await fetch(apiUrl('/api/announcements'), { credentials: 'include' });
      const data = await res.json();
      setAnnouncements(data.announcements || []);
    } catch (_) { setAnnouncements([]); }
  };

  const fetchPolls = async () => {
    try {
  const res = await fetch(apiUrl('/api/polls'), { credentials: 'include' });
      const data = await res.json();
      setPolls(data.polls || []);
    } catch (_) { setPolls([]); }
  };

  useEffect(() => { fetchAnnouncements(); fetchPolls(); }, []);

  const refreshSecurity = async () => {
    if (!isAdmin) return;
    setSecLoading(true);
    try {
      const [sRes, bRes] = await Promise.all([
        fetch(apiUrl('/admin/sessions'), { credentials: 'include' }),
        fetch(apiUrl('/admin/bans'), { credentials: 'include' })
      ]);
      const sData = sRes.ok ? await sRes.json() : { sessions: [] };
      const bData = bRes.ok ? await bRes.json() : { bans: [] };
      let sessions = sData.sessions || [];
      // Si sigue vacío, añadimos una sesión demo del lado del cliente para mostrar el funcionamiento
      if (sessions.length === 0) {
        sessions = [{ sessionId: 'demo', userId: '710112055985963090', username: 'DemoAdmin', ip: '127.0.0.1', userAgent: 'Demo Browser', lastSeen: Date.now() }];
      }
      setSecurity({ sessions, bans: bData.bans || [] });
    } catch (_) {
      setSecurity({ sessions: [{ sessionId: 'demo', userId: '710112055985963090', username: 'DemoAdmin', ip: '127.0.0.1', userAgent: 'Demo Browser', lastSeen: Date.now() }], bans: [] });
    }
    setSecLoading(false);
  };

  useEffect(() => {
    if (activeTab === 'security') refreshSecurity();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, isAdmin]);

  // Datos de ejemplo para administradores
  useEffect(() => {
    setAdminUsers([
      { id: '1', username: 'Admin1', role: 'Owner', status: 'online' },
      { id: '2', username: 'Mod1', role: 'Moderator', status: 'idle' },
      { id: '3', username: 'Helper1', role: 'Helper', status: 'offline' }
    ]);
  }, []);

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white'
      }}>
        <div style={{textAlign: 'center'}}>
          <div style={{fontSize: '24px', marginBottom: '10px'}}>🔄</div>
          <div>Cargando panel de administración...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white'
      }}>
        <div style={{
          background: 'rgba(255,255,255,0.1)',
          padding: '2rem',
          borderRadius: '15px',
          textAlign: 'center',
          backdropFilter: 'blur(10px)'
        }}>
          <h2>🔒 Acceso Requerido</h2>
          <p style={{marginBottom: '1.5rem'}}>Necesitas iniciar sesión para acceder al panel</p>
            <a 
            href="/auth/login"
            style={{
              background: '#7289da',
              color: 'white',
              padding: '12px 24px',
              borderRadius: '8px',
              textDecoration: 'none',
              fontWeight: 'bold',
              display: 'inline-block'
            }}
          >
            Iniciar Sesión con Discord
          </a>
        </div>
      </div>
    );
  }

  const renderTabContent = () => {
    switch(activeTab) {
      case 'dashboard':
        return (
          <div className="dashboard">
            <div className="cards">
              <div className="card card--kpi">
                <h4>Miembros Totales</h4>
                <div className="kpi">{discordStats?.presence_count || '—'}</div>
              </div>
              <div className="card card--kpi">
                <h4>En línea</h4>
                <div className="kpi">{discordStats?.members?.length || '—'}</div>
              </div>
              <div className="card card--kpi">
                <h4>Crecimiento</h4>
                <div className="kpi">+12%</div>
              </div>
              <div className="card card--kpi">
                <h4>Actividad</h4>
                <div className="kpi">89%</div>
              </div>
            </div>

            <div className="grid-2">
              <div className="card">
                <h4 style={{marginTop:0}}>Actividad reciente</h4>
                <div className="list">
                  <div className="list-item"><span>Nuevo miembro: Usuario123</span><span className="badge">hace 2m</span></div>
                  <div className="list-item"><span>Evento programado: Torneo mañana</span><span className="badge">hoy</span></div>
                  <div className="list-item"><span>Nuevas reglas publicadas</span><span className="badge">ayer</span></div>
                </div>
              </div>
              <div className="card">
                <h4 style={{marginTop:0}}>Acciones rápidas</h4>
                <div className="actions">
                  <button className="btn btn--primary">Crear anuncio</button>
                  <button className="btn btn--ghost">Programar evento</button>
                  {isAdmin && <button className="btn btn--danger">Modo Mantenimiento</button>}
                </div>
              </div>
            </div>
          </div>
        );
      
      case 'administration':
        if (!isAdmin) {
          return (
            <div className="card">
              <h4>Acceso restringido</h4>
              <p>No tienes permisos suficientes para ver esta sección.</p>
            </div>
          );
        }
        return (
          <div className="admin">
            <div className="cards" style={{marginBottom:'1rem'}}>
              <div className="card"><h4 style={{marginTop:0}}>Usuarios admins</h4><div className="badge">{adminUsers.length}</div></div>
              <div className="card"><h4 style={{marginTop:0}}>Solicitudes</h4><div className="badge">3</div></div>
              <div className="card"><h4 style={{marginTop:0}}>Reportes hoy</h4><div className="badge">12</div></div>
              <div className="card"><h4 style={{marginTop:0}}>Baneos activos</h4><div className="badge">0</div></div>
            </div>

            <div className="grid-2">
              <div className="card">
                <h4 style={{marginTop:0}}>Gestión de usuarios</h4>
                <div style={{marginTop: '.5rem'}}>
                  {adminUsers.map(admin => (
                    <div key={admin.id} className="list-item">
                      <div>
                        <strong>{admin.username}</strong>
                        <div style={{fontSize: '0.8rem', opacity: '0.7'}}>{admin.role}</div>
                      </div>
                      <div style={{ width:10, height:10, borderRadius:'50%', background: admin.status === 'online' ? '#2ecc71' : admin.status === 'idle' ? '#f39c12' : '#e74c3c' }} />
                    </div>
                  ))}
                </div>
              </div>
              <div className="card">
                <h4 style={{marginTop:0}}>Acciones rápidas</h4>
                <div className="actions" style={{marginTop:'.5rem'}}>
                  <button className="btn btn--primary">Enviar anuncio</button>
                  <button className="btn btn--danger">Banear usuario</button>
                  <button className="btn btn--ghost">Programar evento</button>
                </div>
              </div>
            </div>
          </div>
        );
      
      case 'analytics':
        return (
          <div className="card">
            <h4 style={{marginTop:0}}>Estadísticas del servidor</h4>
            <div className="cards" style={{marginTop:'.5rem'}}>
                <div>
                  <strong>Miembros Nuevos (7 días):</strong>
                  <p style={{fontSize: '1.5rem', margin: '0.5rem 0'}}>+45</p>
                </div>
                <div>
                  <strong>Mensajes (24h):</strong>
                  <p style={{fontSize: '1.5rem', margin: '0.5rem 0'}}>2,847</p>
                </div>
                <div>
                  <strong>Canales Activos:</strong>
                  <p style={{fontSize: '1.5rem', margin: '0.5rem 0'}}>12</p>
                </div>
                <div>
                  <strong>Roles Creados:</strong>
                  <p style={{fontSize: '1.5rem', margin: '0.5rem 0'}}>8</p>
                </div>
              </div>
          </div>
        );
      
      case 'settings':
        return (
          <div className="card">
            <h4 style={{marginTop:0}}>Configuración del servidor</h4>
            <div style={{marginTop: '1rem'}}>
                <div style={{marginBottom: '1rem'}}>
                  <label style={{display: 'block', marginBottom: '0.5rem'}}>🔔 Notificaciones de Bienvenida</label>
                  <input type="checkbox" defaultChecked style={{marginRight: '0.5rem'}} />
                  <span>Activar mensaje de bienvenida automático</span>
                </div>
                <div style={{marginBottom: '1rem'}}>
                  <label style={{display: 'block', marginBottom: '0.5rem'}}>🛡️ Verificación de Cuenta</label>
                  <input type="checkbox" defaultChecked style={{marginRight: '0.5rem'}} />
                  <span>Requerir verificación de email</span>
                </div>
                <div style={{marginBottom: '1rem'}}>
                  <label style={{display: 'block', marginBottom: '0.5rem'}}>🎮 Integración con Minecraft</label>
                  <input type="checkbox" style={{marginRight: '0.5rem'}} />
                  <span>Conectar con servidor de Minecraft</span>
                </div>
            </div>
          </div>
        );
      case 'security':
        if (!isAdmin) {
          return (
            <div className="card">
              <h4>Acceso restringido</h4>
              <p>Solo administradores pueden acceder a Seguridad.</p>
            </div>
          );
        }
        return (
          <div className="security">
            <div className="actions" style={{ marginBottom: '1rem' }}>
              <button className="btn btn--ghost" onClick={refreshSecurity} disabled={secLoading}>{secLoading ? 'Actualizando...' : 'Actualizar'}</button>
              <input
                placeholder="Buscar por usuario o IP"
                value={secQuery}
                onChange={(e)=>setSecQuery(e.target.value)}
                style={{ background:'transparent', border:'1px solid rgba(255,255,255,.25)', borderRadius:8, color:'#fff', padding:'.45rem .6rem' }}
              />
            </div>
            <div className="grid-2">
              <div className="card">
                <h4 style={{marginTop:0}}>Sesiones activas</h4>
                <div className="list" style={{ marginTop: '.5rem' }}>
                  {security.sessions
                    .filter(s => (s.username || '').toLowerCase().includes(secQuery.toLowerCase()) || (s.ip || '').includes(secQuery))
                    .length === 0 && <div style={{opacity:.8}}>No hay sesiones activas registradas.</div>}
                  {security.sessions
                    .filter(s => (s.username || '').toLowerCase().includes(secQuery.toLowerCase()) || (s.ip || '').includes(secQuery))
                    .map(s => (
                    <div key={s.sessionId} className="list-item">
                      <div>
                        <div style={{fontWeight:600}}>{s.username || 'Invitado'}</div>
                        <div style={{fontSize:12, opacity:.8}}>IP: {s.ip} · UA: {s.userAgent?.slice(0,60)}</div>
                      </div>
                      <div className="actions">
                        <form onSubmit={async (e)=>{e.preventDefault();
                          const reason = 'Ban por IP desde panel';
                          await fetch('https://spainrp-web.onrender.com/admin/bans',{method:'POST',credentials:'include',headers:{'Content-Type':'application/json'},body:JSON.stringify({ip:s.ip, userId:s.userId, reason})});
                          refreshSecurity();
                        }}>
                          <button type="submit" className="btn btn--danger">Banear</button>
                        </form>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="card">
                <h4 style={{marginTop:0}}>Baneos</h4>
                <div className="list" style={{ marginTop: '.5rem' }}>
                  {security.bans.length === 0 && <div style={{opacity:.8}}>Sin registros de baneos.</div>}
                  {security.bans.map(b => (
                    <div key={b.id} className="list-item">
                      <div>
                        <div style={{fontWeight:600}}>#{b.id} · {b.ip || b.userId}</div>
                        <div style={{fontSize:12, opacity:.8}}>{b.reason || 'Sin motivo'} · {new Date(b.createdAt).toLocaleString()}</div>
                      </div>
                      <div className="actions">
                        <form onSubmit={async (e)=>{e.preventDefault();
                          await fetch(`https://spainrp-web.onrender.com/admin/bans/${b.id}`,{method:'DELETE',credentials:'include'});
                          refreshSecurity();
                        }}>
                          <button type="submit" className="btn btn--ghost">Eliminar</button>
                        </form>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      case 'announcements':
        return (
          <div className="announcements">
            {isAdmin && (
              <div className="card" style={{ marginBottom: '1rem' }}>
                <h4 style={{marginTop:0}}>Crear anuncio</h4>
                <div style={{ display: 'grid', gap: '.5rem', marginTop: '.5rem' }}>
                  <input placeholder="Título" value={newAnn.title} onChange={(e)=>setNewAnn(a=>({...a,title:e.target.value}))} style={{ background:'#1a1a1a', border:'1px solid #4b5563', borderRadius:8, color:'#ffffff', padding:'.5rem .6rem' }} />
                  <textarea placeholder="Contenido" value={newAnn.body} onChange={(e)=>setNewAnn(a=>({...a,body:e.target.value}))} style={{ background:'#1a1a1a', border:'1px solid #4b5563', borderRadius:8, color:'#ffffff', padding:'.5rem .6rem', minHeight:120 }} />
                  <div className="actions" style={{justifyContent:'flex-end'}}>
                    <button className="btn btn--primary" onClick={async ()=>{ if(!newAnn.title||!newAnn.body) return; await fetch('https://spainrp-web.onrender.com/admin/announcements',{method:'POST',credentials:'include',headers:{'Content-Type':'application/json'},body:JSON.stringify(newAnn)}); setNewAnn({title:'',body:''}); fetchAnnouncements(); }}>Publicar</button>
                  </div>
                </div>
              </div>
            )}
            <div className="card">
              <h4 style={{marginTop:0}}>Anuncios</h4>
              <div className="list" style={{ marginTop: '.5rem' }}>
                {announcements.length===0 && <div style={{opacity:.8}}>Sin anuncios aún.</div>}
                {announcements.map(a => (
                  <div key={a.id} className="list-item">
                    <div>
                      <div style={{fontWeight:700}}>{a.title}</div>
                      <div style={{opacity:.8,fontSize:12}}>{a.authorName} · {new Date(a.createdAt).toLocaleString()}</div>
                      <div style={{marginTop:4}}>{a.body}</div>
                    </div>
                    {isAdmin && (
                      <button className="btn btn--ghost" onClick={async ()=>{ await fetch(`https://spainrp-web.onrender.com/admin/announcements/${a.id}`,{method:'DELETE',credentials:'include'}); fetchAnnouncements(); }}>Eliminar</button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      case 'polls':
        return (
          <div className="polls">
            {isAdmin && (
              <div className="card" style={{ marginBottom: '1rem' }}>
                <h4 style={{marginTop:0}}>Crear encuesta</h4>
                <div style={{ display: 'grid', gap: '.5rem', marginTop: '.5rem' }}>
                  <input placeholder="Pregunta" value={newPoll.question} onChange={(e)=>setNewPoll(p=>({...p,question:e.target.value}))} style={{ background:'#1a1a1a', border:'1px solid #4b5563', borderRadius:8, color:'#ffffff', padding:'.5rem .6rem' }} />
                  {newPoll.options.map((opt,idx)=> (
                    <input key={idx} placeholder={`Opción ${idx+1}`} value={opt} onChange={(e)=>setNewPoll(p=>{ const n=[...p.options]; n[idx]=e.target.value; return {...p, options:n}; })} style={{ background:'#1a1a1a', border:'1px solid #4b5563', borderRadius:8, color:'#ffffff', padding:'.5rem .6rem' }} />
                  ))}
                  <div className="actions" style={{justifyContent:'space-between'}}>
                    <button className="btn btn--ghost" onClick={()=>setNewPoll(p=>({...p, options:[...p.options, '']}))}>Añadir opción</button>
                    <button className="btn btn--primary" onClick={async ()=>{ if(!newPoll.question || newPoll.options.filter(Boolean).length<2) return; const body={question:newPoll.question, options:newPoll.options.filter(Boolean)}; await fetch('https://spainrp-web.onrender.com/admin/polls',{method:'POST',credentials:'include',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)}); setNewPoll({question:'',options:['','']}); fetchPolls(); }}>Crear encuesta</button>
                  </div>
                </div>
              </div>
            )}
            <div className="card">
              <h4 style={{marginTop:0}}>Encuestas</h4>
              <div className="list" style={{ marginTop: '.5rem' }}>
                {polls.length===0 && <div style={{opacity:.8}}>Sin encuestas aún.</div>}
                {polls.map(p => (
                  <div key={p.id} className="list-item" style={{ alignItems:'stretch' }}>
                    <div style={{flex:1}}>
                      <div style={{fontWeight:700}}>{p.question}</div>
                      <div style={{opacity:.8,fontSize:12}}>{p.authorName} · {new Date(p.createdAt).toLocaleString()}</div>
                      <div style={{ display:'grid', gap:6, marginTop:6 }}>
                        {p.options.map((opt,idx)=>{
                          const total = (p.counts||[]).reduce((a,b)=>a+b,0) || 1;
                          const pct = Math.round((p.counts?.[idx]||0)*100/total);
                          return (
                            <button key={idx} className="btn btn--ghost" style={{ justifyContent:'space-between' }} onClick={async ()=>{ const res=await fetch(`https://spainrp-web.onrender.com/api/polls/${p.id}/vote`,{method:'POST',credentials:'include',headers:{'Content-Type':'application/json'},body:JSON.stringify({optionIndex:idx})}); const data=await res.json(); if(data.poll){ setPolls(prev=>prev.map(pp=>pp.id===p.id?data.poll:pp)); }}}>
                              <span>{opt}</span>
                              <span className="badge">{pct}%</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      case 'community':
        return (
          <div className="card">
            <h4 style={{marginTop:0}}>Comunidad</h4>
            <div style={{opacity:.85}}>Aquí podrás ver anuncios recientes, encuestas activas y acceso rápido a Discord.</div>
            <div className="actions" style={{marginTop:'.75rem'}}>
              <a className="btn btn--primary" href="https://discord.gg/sMzFgFQHXA" target="_blank" rel="noreferrer">Unirse a Discord</a>
              <button className="btn btn--ghost" onClick={()=>setActiveTab('announcements')}>Ver anuncios</button>
              <button className="btn btn--ghost" onClick={()=>setActiveTab('polls')}>Ver encuestas</button>
            </div>
          </div>
        );
      
      default:
        return <div>Selecciona una opción del menú</div>;
    }
  };

  return (
    <div className="panel1">
      <aside className="panel1__sidebar">
        <div className="panel1__brand">
          <img src={`https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`} alt="avatar" />
          <div>
            <strong>SpainRP</strong>
            <div className="badge">{isAdmin ? 'Admin' : 'Miembro'}</div>
          </div>
        </div>
        <nav className="panel1__nav">
          {[
            {id: 'dashboard', name: 'Dashboard'},
            {id: 'administration', name: 'Administración'},
            {id: 'analytics', name: 'Analytics'},
            {id: 'community', name: 'Comunidad'},
            {id: 'announcements', name: 'Anuncios'},
            {id: 'polls', name: 'Encuestas'},
            {id: 'security', name: 'Seguridad'},
            {id: 'settings', name: 'Configuración'},
          ].map(tab => (
            <button key={tab.id} className={activeTab === tab.id ? 'active' : ''} onClick={() => setActiveTab(tab.id)}>
              {tab.name}
            </button>
          ))}
        </nav>
      </aside>
      <main className="panel1__main">
        <div className="panel1__topbar">
          <div className="panel1__topbar-inner">
            <div style={{fontWeight:700}}>Panel de administración</div>
            <div className="panel1__user">
              <span className="badge">{user.username}</span>
              <a href="/" className="btn btn--ghost">Inicio</a>
              <a href="/logout" className="btn btn--danger">Salir</a>
            </div>
          </div>
        </div>
        <div className="panel1__content">
          {renderTabContent()}
        </div>
      </main>
    </div>
  );
};

export default Panel1; 