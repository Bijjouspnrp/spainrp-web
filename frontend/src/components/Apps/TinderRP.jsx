import { apiUrl } from '../../utils/api';

import React, { useState, useEffect } from "react";
import DiscordUserBar from '../DiscordUserBar';

const romanticFont = `'Quicksand', 'Montserrat', 'Comic Sans MS', cursive, sans-serif`;

const TinderRP = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [profiles, setProfiles] = useState([]);
  const [matches, setMatches] = useState([]);
  const [active, setActive] = useState(0);
  const [form, setForm] = useState({ nombre: '', edad: '', roblox: '', bio: '' });
  const [avatar, setAvatar] = useState(null);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [registering, setRegistering] = useState(false);
  const [fetchingAvatar, setFetchingAvatar] = useState(false);

  // Cargar usuario Discord
  useEffect(() => {
    fetch(apiUrl('/api/auth/me'), { credentials: 'include' })
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data && (data.user || data.id)) setUser(data.user || data);
        setLoading(false);
      });
  }, []);

  // Cargar perfil propio
  useEffect(() => {
    if (!user) return;
    fetch(apiUrl('/api/tinder/me'), { credentials: 'include' })
      .then(res => res.ok ? res.json() : null)
      .then(data => { if (data && data.profile) setProfile(data.profile); });
  }, [user]);

  // Cargar perfiles de otros
  useEffect(() => {
    if (!user) return;
    fetch(apiUrl('/api/tinder/all'), { credentials: 'include' })
      .then(res => res.ok ? res.json() : null)
      .then(data => { if (data && data.profiles) setProfiles(data.profiles); });
  }, [user, msg]);

  // Cargar matches
  useEffect(() => {
    if (!user) return;
    fetch(apiUrl('/api/tinder/matches'), { credentials: 'include' })
      .then(res => res.ok ? res.json() : null)
      .then(data => { if (data && data.matches) setMatches(data.matches); });
  }, [user, msg]);

  // Buscar avatar de Roblox
  const fetchRobloxAvatar = async (roblox) => {
    setFetchingAvatar(true);
    setAvatar(null);
    setError("");
    try {
      const res = await fetch(`/api/roblox/avatar/${encodeURIComponent(roblox)}`);
      const data = await res.json();
      if (data.img) setAvatar(data.img);
      else setError('No se encontró el usuario de Roblox');
    } catch {
      setError('Error buscando avatar de Roblox');
    }
    setFetchingAvatar(false);
  };

  // Registro/edición de perfil
  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.nombre.trim() || !form.edad.trim() || !form.roblox.trim()) {
      setError('Completa todos los campos');
      return;
    }
    if (!avatar) {
      setError('Debes buscar y confirmar tu avatar de Roblox');
      return;
    }
    setRegistering(true);
    const res = await fetch(apiUrl('/api/tinder/me'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        nombre: form.nombre,
        edad: form.edad,
        roblox_user: form.roblox,
        bio: form.bio
      })
    });
    if (res.ok) {
      setMsg('Perfil guardado');
      setTimeout(() => setMsg(''), 2000);
      setProfile({ ...form, img: avatar, roblox_user: form.roblox });
    } else {
      setError('Error guardando perfil');
    }
    setRegistering(false);
  };

  // Hacer match
  const handleMatch = async (other) => {
    if (!profile) { setMsg('Completa tu perfil primero'); setTimeout(() => setMsg(''),2000); return; }
    const res = await fetch(apiUrl('/api/tinder/match'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ other_id: other.discord_id })
    });
    if (res.ok) {
      setMsg(`¡Has hecho match con ${other.nombre}! 💖`);
      setTimeout(() => setMsg(''), 2000);
    } else {
      setMsg('Error al hacer match');
      setTimeout(() => setMsg(''), 2000);
    }
    setActive((active + 1) % profiles.length);
  };

  if (loading) return null;
  if (!user) {
    return (
      <div style={{minHeight:'100vh',background:'linear-gradient(135deg,#e74c3c 0%,#fff0 100%)',fontFamily:romanticFont}}>
        <DiscordUserBar />
        <div style={{textAlign:'center',marginTop:120,color:'#e74c3c',fontFamily:romanticFont}}>
          <h1 style={{fontSize:'2.7rem',fontWeight:900,letterSpacing:2}}>TinderRP</h1>
          <h2 style={{fontWeight:700,margin:'2rem 0'}}>Debes iniciar sesión con Discord para acceder a TinderRP.</h2>
          <a href="/auth/login" style={{background:'#e74c3c',color:'#fff',borderRadius:12,padding:'0.9rem 2.2rem',fontWeight:800,textDecoration:'none',fontSize:'1.3rem',boxShadow:'0 2px 12px #e74c3c33'}}>Iniciar sesión</a>
        </div>
        <div style={{position:'fixed',bottom:24,width:'100%',textAlign:'center',color:'#e74c3c',fontWeight:600,letterSpacing:1,zIndex:1000}}>Acceso solo para usuarios logueados Discord. App de rol social.</div>
      </div>
    );
  }

  return (
    <div style={{minHeight:'100vh',background:'linear-gradient(135deg,#fff0 0%,#e74c3c10 100%)',fontFamily:romanticFont}}>
      <DiscordUserBar />
      <div style={{maxWidth:440,margin:'0 auto',padding:'2.5rem 0 3rem 0'}}>
        <h1 style={{textAlign:'center',fontSize:'2.7rem',fontWeight:900,marginBottom:'2.2rem',letterSpacing:2,color:'#e74c3c',fontFamily:romanticFont}}>TinderRP</h1>

        {/* Registro/edición de perfil */}
        {!profile && (
          <div style={{background:'#fff',borderRadius:22,padding:'2.2rem 2rem',boxShadow:'0 4px 24px #e74c3c22',marginBottom:32}}>
            <form onSubmit={handleRegister}>
              <h2 style={{textAlign:'center',fontSize:'1.5rem',fontWeight:800,marginBottom:'1.2rem',color:'#e74c3c'}}>Crea tu perfil</h2>
              <div style={{marginBottom:'1.1rem'}}>
                <label style={{fontWeight:700}}>Nombre</label>
                <input type="text" value={form.nombre} onChange={e => setForm(f => ({...f, nombre: e.target.value}))} style={{width:'100%',marginTop:6,padding:'0.7rem',borderRadius:10,border:'1px solid #eee',fontFamily:romanticFont,fontSize:'1.1rem'}} required />
              </div>
              <div style={{marginBottom:'1.1rem'}}>
                <label style={{fontWeight:700}}>Edad</label>
                <input type="number" value={form.edad} onChange={e => setForm(f => ({...f, edad: e.target.value}))} style={{width:'100%',marginTop:6,padding:'0.7rem',borderRadius:10,border:'1px solid #eee',fontFamily:romanticFont,fontSize:'1.1rem'}} required min={18} />
              </div>
              <div style={{marginBottom:'1.1rem'}}>
                <label style={{fontWeight:700}}>Usuario de Roblox</label>
                <div style={{display:'flex',gap:8}}>
                  <input type="text" value={form.roblox} onChange={e => setForm(f => ({...f, roblox: e.target.value}))} style={{flex:1,marginTop:6,padding:'0.7rem',borderRadius:10,border:'1px solid #eee',fontFamily:romanticFont,fontSize:'1.1rem'}} required />
                  <button type="button" onClick={()=>fetchRobloxAvatar(form.roblox)} style={{background:'#e74c3c',color:'#fff',border:'none',borderRadius:8,padding:'0.7rem 1.2rem',fontWeight:700,cursor:'pointer'}}>Buscar avatar</button>
                </div>
                {fetchingAvatar && <div style={{color:'#e74c3c',marginTop:8}}>Buscando avatar...</div>}
                {avatar && <img src={avatar} alt="avatar roblox" style={{width:70,height:70,borderRadius:'50%',marginTop:10,boxShadow:'0 2px 8px #e74c3c33'}} />}
              </div>
              <div style={{marginBottom:'1.1rem'}}>
                <label style={{fontWeight:700}}>Bio (opcional)</label>
                <textarea value={form.bio} onChange={e => setForm(f => ({...f, bio: e.target.value}))} style={{width:'100%',marginTop:6,padding:'0.7rem',borderRadius:10,border:'1px solid #eee',fontFamily:romanticFont,fontSize:'1.1rem',minHeight:60}} maxLength={120} />
              </div>
              {error && <div style={{background:'#ffeaea',color:'#e74c3c',borderRadius:8,padding:'0.7rem',marginBottom:10,textAlign:'center'}}>{error}</div>}
              <button type="submit" disabled={registering} style={{width:'100%',background:'#e74c3c',color:'#fff',border:'none',borderRadius:10,padding:'0.9rem',fontWeight:800,fontSize:'1.15rem',marginTop:8,boxShadow:'0 2px 8px #e74c3c33',cursor:'pointer'}}>Guardar perfil</button>
            </form>
          </div>
        )}

        {/* Perfil propio y swipe */}
        {profile && (
          <div style={{background:'#fff',borderRadius:22,padding:'2.2rem 2rem',boxShadow:'0 4px 24px #e74c3c22',marginBottom:32}}>
            <div style={{display:'flex',flexDirection:'column',alignItems:'center',marginBottom:18}}>
              <img src={avatar || `/api/roblox/avatar/${profile.roblox_user}`} alt="avatar roblox" style={{width:90,height:90,borderRadius:'50%',objectFit:'cover',marginBottom:12,boxShadow:'0 2px 8px #e74c3c33'}} onError={e=>e.target.style.opacity=0.3} />
              <div style={{fontWeight:'bold',fontSize:'1.3rem',color:'#e74c3c',fontFamily:romanticFont}}>{profile.nombre}</div>
              <div style={{fontSize:14,color:'#888'}}>Edad: {profile.edad}</div>
              <div style={{fontSize:15,color:'#555',margin:'8px 0 0 0',textAlign:'center'}}>{profile.bio}</div>
            </div>
            <hr style={{margin:'1.2rem 0',border:'none',borderTop:'1.5px dashed #e74c3c33'}} />
            <div style={{fontWeight:700,color:'#e74c3c',marginBottom:10,fontSize:'1.1rem'}}>Perfiles para hacer match</div>
            {profiles.length === 0 && <div style={{color:'#aaa',textAlign:'center'}}>No hay más perfiles por ahora.</div>}
            {profiles.length > 0 && (
              <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:18}}>
                <img src={`/api/roblox/avatar/${profiles[active].roblox_user}`} alt={profiles[active].nombre} style={{width:80,height:80,borderRadius:'50%',objectFit:'cover',marginBottom:8,boxShadow:'0 2px 8px #e74c3c33'}} onError={e=>e.target.style.opacity=0.3} />
                <div style={{fontWeight:'bold',fontSize:'1.15rem',color:'#e74c3c'}}>{profiles[active].nombre}</div>
                <div style={{fontSize:13,color:'#888'}}>Edad: {profiles[active].edad}</div>
                <div style={{fontSize:14,color:'#555',margin:'8px 0 0 0',textAlign:'center'}}>{profiles[active].bio}</div>
                <button style={{marginTop:10,background:'#e74c3c',color:'#fff',border:'none',borderRadius:10,padding:'0.7rem 2.2rem',fontWeight:800,fontSize:'1.1rem',cursor:'pointer',boxShadow:'0 2px 8px #e74c3c33'}} onClick={()=>handleMatch(profiles[active])}>Match 💖</button>
                <button style={{marginTop:6,background:'#eee',color:'#e74c3c',border:'none',borderRadius:10,padding:'0.5rem 1.2rem',fontWeight:700,cursor:'pointer'}} onClick={()=>setActive((active+1)%profiles.length)}>Siguiente perfil</button>
              </div>
            )}
          </div>
        )}

        {/* Mensaje de match o error */}
        {msg && <div style={{background:'#e74c3c',color:'#fff',borderRadius:10,padding:'0.9rem',textAlign:'center',marginBottom:'1.2rem',fontWeight:700,letterSpacing:1,fontSize:'1.1rem',boxShadow:'0 2px 8px #e74c3c33'}}>{msg}</div>}

        {/* Matches */}
        {matches.length > 0 && (
          <div style={{background:'#fff',borderRadius:22,padding:'1.5rem',boxShadow:'0 2px 8px #e74c3c22',marginBottom:'2rem'}}>
            <strong style={{fontSize:'1.15rem',color:'#e74c3c'}}>Tus matches:</strong>
            <ul style={{marginTop:'1rem',fontSize:15,color:'#555',listStyle:'none',padding:0}}>
              {matches.map(m => (
                <li key={m.id} style={{marginBottom:'0.7rem',display:'flex',alignItems:'center',gap:10}}>
                  <img src={`/api/roblox/avatar/${m.roblox_user}`} alt={m.nombre} style={{width:36,height:36,borderRadius:'50%',marginRight:10,objectFit:'cover',boxShadow:'0 2px 8px #e74c3c33'}} onError={e=>e.target.style.opacity=0.3} />
                  <span>{m.nombre} ({m.edad} años)</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div style={{background:'#fff',borderRadius:18,padding:'1.5rem',boxShadow:'0 2px 8px #e74c3c22',fontFamily:romanticFont}}>
          <strong style={{fontSize:'1.1rem',color:'#e74c3c'}}>Chat simulado:</strong>
          <div style={{marginTop:'1.2rem',fontSize:15,color:'#555'}}>
            <div><b>Lucía:</b> Hola, ¿qué tal?</div>
            <div><b>Tú:</b> ¡Bien! ¿Te gusta el roleo?</div>
          </div>
        </div>
      </div>
      <link href="https://fonts.googleapis.com/css2?family=Quicksand:wght@500;700;900&family=Montserrat:wght@700&display=swap" rel="stylesheet" />
    </div>
  );
};

export default TinderRP;
