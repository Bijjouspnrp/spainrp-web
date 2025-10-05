import { apiUrl } from '../utils/api';
import React, { useEffect, useState } from 'react';
import { FaDiscord } from 'react-icons/fa';

export default function DiscordUserBar() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const token = localStorage.getItem('spainrp_token');
    const headers = token ? { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' } : { 'Accept': 'application/json' };
    fetch(apiUrl('/auth/me'), { headers })
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data && data.user) setUser(data.user);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (loading) return null;

  return (
    <div style={{
      position: 'absolute',
      top: 18,
      right: 24,
      zIndex: 1001,
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      background: 'rgba(32,34,37,0.85)',
      borderRadius: 12,
      padding: '8px 18px',
      boxShadow: '0 2px 8px #23272a33',
      minHeight: 48,
      maxWidth: 'calc(100vw - 120px)',
      overflow: 'hidden'
    }}>
      {user ? (
        <>
          <FaDiscord size={isMobile ? 20 : 28} color="#7289da" style={{marginRight: isMobile ? 4 : 6}} />
          <img src={`https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`} alt="avatar" style={{
            width: isMobile ? 24 : 32,
            height: isMobile ? 24 : 32,
            borderRadius:'50%',
            border:'2px solid #7289da',
            marginRight: isMobile ? 4 : 8
          }} />
          <span style={{
            fontWeight:700,
            color:'#fff',
            fontSize: isMobile ? '0.8rem' : '1rem',
            display: isMobile ? 'none' : 'inline'
          }}>{user.username}#{user.discriminator}</span>
          <a href="/logout" style={{
            background:'#e74c3c',
            color:'#fff',
            borderRadius:8,
            padding: isMobile ? '4px 8px' : '6px 14px',
            fontWeight:700,
            textDecoration:'none',
            fontSize: isMobile ? '0.8rem' : '0.95rem',
            marginLeft: isMobile ? 4 : 12
          }}>{isMobile ? 'Salir' : 'Cerrar sesión'}</a>
        </>
      ) : (
        <>
          <FaDiscord size={isMobile ? 20 : 28} color="#7289da" style={{marginRight: isMobile ? 4 : 6}} />
          <span style={{
            fontWeight:700,
            color:'#fff',
            fontSize: isMobile ? '0.8rem' : '1rem',
            display: isMobile ? 'none' : 'inline'
          }}>No has iniciado sesión</span>
          <a href="/auth/login" style={{
            background:'#7289da',
            color:'#fff',
            borderRadius:8,
            padding: isMobile ? '4px 8px' : '6px 14px',
            fontWeight:700,
            textDecoration:'none',
            fontSize: isMobile ? '0.8rem' : '0.95rem',
            marginLeft: isMobile ? 4 : 12
          }}>{isMobile ? 'Login' : 'Iniciar sesión'}</a>
        </>
      )}
    </div>
  );
}
