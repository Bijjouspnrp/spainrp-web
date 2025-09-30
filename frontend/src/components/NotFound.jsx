import React from 'react';
import spainLogo from '/assets/spainrplogo.png';

const NotFound = ({ logs }) => {
  // Debug logging for 404 page
  React.useEffect(() => {
    console.log('[NotFound] 🚨 404 Page loaded');
    console.log('[NotFound] 📍 Current URL:', window.location.href);
    console.log('[NotFound] 📍 Pathname:', window.location.pathname);
    console.log('[NotFound] 📍 Search:', window.location.search);
    console.log('[NotFound] 📍 Hash:', window.location.hash);
    console.log('[NotFound] 📍 Referrer:', document.referrer);
    console.log('[NotFound] 📍 User Agent:', navigator.userAgent);
    console.log('[NotFound] 📍 Timestamp:', new Date().toISOString());
    
    // Check if this is a direct file access
    const isFileAccess = window.location.pathname.match(/\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$/);
    const isApiRoute = window.location.pathname.startsWith('/api/');
    
    console.log('[NotFound] 🔍 Analysis:', {
      isFileAccess,
      isApiRoute,
      pathname: window.location.pathname,
      isDirectAccess: !document.referrer || document.referrer === window.location.href
    });
  }, []);

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
        onError={(e) => {
          console.warn('[NotFound] Error cargando logo, usando fallback');
          e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMzIiIGN5PSIzMiIgcj0iMzIiIGZpbGw9IiM3Mjg5ZGEiLz4KPHRleHQgeD0iMzIiIHk9IjM4IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSJ3aGl0ZSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE2IiBmb250LXdlaWdodD0iYm9sZCI+U1A8L3RleHQ+Cjwvc3ZnPgo=';
        }} 
        style={{
          width: 96,
          height: 96,
          borderRadius: '50%',
          boxShadow: '0 2px 12px #FFD70033',
          marginBottom: 24
        }} 
      />
      <h1 style={{
        fontSize: '4rem',
        fontWeight: 900,
        color: '#FFD700',
        marginBottom: '1rem'
      }}>
        404
      </h1>
      <h2 style={{
        fontSize: '2rem',
        fontWeight: 700,
        color: '#fff',
        marginBottom: '2rem'
      }}>
        Página no encontrada
      </h2>
      <div style={{
        marginBottom: '2rem',
        color: '#FFD700',
        fontWeight: 600,
        fontSize: '1.2rem'
      }}>
        ¿No encuentras lo que buscas?
      </div>
      <a 
        href="https://discord.gg/sMzFgFQHXA" 
        style={{
          background: '#FFD700',
          color: '#23272a',
          borderRadius: 8,
          padding: '0.7rem 1.5rem',
          fontWeight: 700,
          textDecoration: 'none',
          fontSize: '1.2rem'
        }}
      >
        Unirse a SpainRP
      </a>
      {logs && logs.length > 0 && (
        <div style={{
          marginTop: '2rem',
          background: 'rgba(255,255,255,0.08)',
          borderRadius: 12,
          padding: '1rem',
          maxWidth: 600
        }}>
          <b style={{ color: '#FFD700' }}>Logs recientes:</b>
          <ul style={{
            color: '#fff',
            fontSize: '1rem',
            marginLeft: 18
          }}>
            {logs.map((log, i) => (
              <li key={i}>
                {typeof log === 'string' ? log : JSON.stringify(log)}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default NotFound;

