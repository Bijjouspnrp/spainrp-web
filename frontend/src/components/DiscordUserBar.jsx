import { apiUrl } from './utils/api';
import React, { useEffect, useState } from 'react';
import { FaDiscord } from 'react-icons/fa';

export default function DiscordUserBar() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(apiUrl('/auth/me'), { credentials: 'include' })
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data && data.user) setUser(data.user);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return null;

  return (
    <div style={{
      position: 'absolute',
      top: 18,
      right: 24,
      zIndex: 1002,
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      background: 'rgba(32,34,37,0.85)',
      borderRadius: 12,
      padding: '8px 18px',
      boxShadow: '0 2px 8px #23272a33',
      minHeight: 48
    }}>
      {user ? (
        <>
          <FaDiscord size={28} color="#7289da" style={{marginRight:6}} />
          <img src={`https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`} alt="avatar" style={{width:32,height:32,borderRadius:'50%',border:'2px solid #7289da',marginRight:8}} />
          <span style={{fontWeight:700,color:'#fff',fontSize:'1rem'}}>{user.username}#{user.discriminator}</span>
          <a href="/logout" style={{background:'#e74c3c',color:'#fff',borderRadius:8,padding:'6px 14px',fontWeight:700,textDecoration:'none',fontSize:'0.95rem',marginLeft:12}}>Cerrar sesión</a>
        </>
      ) : (
        <>
          <FaDiscord size={28} color="#7289da" style={{marginRight:6}} />
          <span style={{fontWeight:700,color:'#fff',fontSize:'1rem'}}>No has iniciado sesión</span>
          <a href="/auth/login" style={{background:'#7289da',color:'#fff',borderRadius:8,padding:'6px 14px',fontWeight:700,textDecoration:'none',fontSize:'0.95rem',marginLeft:12}}>Iniciar sesión</a>
        </>
      )}
    </div>
  );
}
