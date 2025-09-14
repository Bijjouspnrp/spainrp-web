import React, { useEffect, useState } from 'react';
import { getStoredConsent, applyConsent } from '../utils/consentManager';

const sectionStyle = {
  background: 'rgba(255,255,255,0.05)',
  padding: '1.5rem',
  borderRadius: '12px',
  marginBottom: '1rem',
};

const Cookies = () => {
  const [decision, setDecision] = useState('unknown');
  const [prefs, setPrefs] = useState({ analytics: false, thirdParty: false });
  const [savedMsg, setSavedMsg] = useState('');

  useEffect(() => {
    const stored = getStoredConsent();
    setDecision(stored.decision);
    setPrefs(stored.preferences);
  }, []);

  // Soporte de ancla: /cookies#support con scroll suave y offset
  useEffect(() => {
    const smoothScrollWithOffset = (el, offset = 80) => {
      const y = (el?.getBoundingClientRect()?.top || 0) + window.pageYOffset - offset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    };
    const handleHash = () => {
      const h = window.location.hash;
      if (h) {
        const id = h.replace('#', '');
        const el = document.getElementById(id);
        if (el) smoothScrollWithOffset(el);
      }
    };
    setTimeout(handleHash, 50);
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const showSaved = (msg) => {
    setSavedMsg(msg);
    setTimeout(() => setSavedMsg(''), 2500);
  };

  const persist = (value) => {
    try {
      const toStore = typeof value === 'string' ? value : JSON.stringify(value);
      localStorage.setItem('cookieConsent', toStore);
      window.dispatchEvent(new CustomEvent('cookie-consent', { detail: value }));
    } catch (_) {}
    try { applyConsent(getStoredConsent()); } catch (_) {}
  };

  const handleAcceptAll = () => {
    setDecision('accepted');
    setPrefs({ analytics: true, thirdParty: true });
    persist('accepted');
    showSaved('Preferencias guardadas: aceptaste todas las cookies.');
  };

  const handleRejectAll = () => {
    setDecision('rejected');
    setPrefs({ analytics: false, thirdParty: false });
    persist('rejected');
    showSaved('Preferencias guardadas: rechazaste cookies no esenciales.');
  };

  const handleSave = () => {
    const payload = { decision: 'custom', preferences: { ...prefs } };
    setDecision('custom');
    persist(payload);
    showSaved('Preferencias personalizadas guardadas.');
  };

  const decisionLabel = decision === 'accepted' ? 'Aceptadas todas' : decision === 'rejected' ? 'Rechazadas' : decision === 'custom' ? 'Personalizadas' : 'Sin establecer';

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #23272a 0%, #7289da 100%)',
      color: 'white',
      padding: '0',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'flex-start',
      fontFamily: 'Inter,Segoe UI,sans-serif',
    }}>
      <div style={{ maxWidth: 900, margin: '0 auto', marginTop: 80, padding: '2.5rem 1.5rem', background: 'rgba(44,47,51,0.98)', borderRadius: 18, boxShadow: '0 8px 32px #23272a88', position: 'relative', zIndex: 1 }}>
        <div style={{textAlign:'center',marginBottom:'2.2rem'}}>
          <span style={{fontSize:'3.2rem',marginBottom:12,display:'block',textShadow:'0 2px 24px #7289da88'}}>🍪</span>
          <h1 style={{ marginBottom: '1rem', fontWeight:900, fontSize:'2.3rem', letterSpacing:1, color:'#7289da' }}>Política de Cookies</h1>
          <p style={{ opacity: 0.85, marginBottom: '2rem', fontSize:'1.18rem', fontWeight:500 }}>
            En SpainRP usamos cookies y tecnologías similares para mejorar tu experiencia, analizar el uso y personalizar contenido. Aquí puedes consultar y gestionar tus preferencias.
          </p>
        </div>
        {savedMsg && (
          <div style={{
            background: 'rgba(114,137,218,0.2)',
            border: '1px solid rgba(114,137,218,0.35)',
            padding: '0.75rem 1rem',
            borderRadius: 10,
            marginBottom: '1rem',
            textAlign:'center',
            fontWeight:700,
            color:'#7289da',
            fontSize:'1.08rem',
            animation:'fadein 1.2s',
          }}>{savedMsg}</div>
        )}
        <div style={sectionStyle}>
          <h2 style={{color:'#fff',fontWeight:800}}>¿Qué son las cookies?</h2>
          <p style={{ opacity: 0.85, fontSize:'1.08rem' }}>
            Las cookies son pequeños archivos de texto que se almacenan en tu dispositivo cuando visitas un sitio web. Permiten que el sitio recuerde tus acciones y preferencias durante un período de tiempo.
          </p>
        </div>
        <div style={sectionStyle}>
          <h2 style={{color:'#fff',fontWeight:800}}>Tipos de cookies que utilizamos</h2>
          <ul style={{fontSize:'1.08rem',marginLeft:0,paddingLeft:18}}>
            <li style={{marginBottom:8}}>
              <strong style={{color:'#7289da'}}>Cookies esenciales</strong>: necesarias para el funcionamiento básico del sitio y la autenticación del usuario (por ejemplo, mantener tu sesión iniciada en el panel).
            </li>
            <li style={{marginBottom:8}}>
              <strong style={{color:'#7289da'}}>Cookies de rendimiento</strong>: nos ayudan a entender cómo se utiliza la web para mejorar su funcionamiento (por ejemplo, datos agregados de navegación).
            </li>
            <li style={{marginBottom:8}}>
              <strong style={{color:'#7289da'}}>Cookies de terceros</strong>: pueden establecerse por servicios de terceros integrados (por ejemplo, contenido de Discord o analítica).
            </li>
          </ul>
        </div>
        <div style={sectionStyle}>
          <h2 style={{color:'#fff',fontWeight:800}}>Gestión de cookies</h2>
          <p style={{ opacity: 0.85, fontSize:'1.08rem' }}>
            Puedes permitir, bloquear o eliminar las cookies instaladas en tu equipo mediante la configuración de las opciones del navegador. Deshabilitar ciertas cookies puede afectar al funcionamiento del sitio, especialmente el acceso al panel privado.
          </p>
          <div style={{
            marginTop: '1rem',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 10,
            padding: '1rem',
            boxShadow:'0 2px 12px #7289da22',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom:8 }}>
              <strong style={{color:'#7289da'}}>Tu estado</strong>
              <span style={{ opacity: 0.85, fontWeight:700 }}>{decisionLabel}</span>
            </div>
            <div style={{ display: 'grid', gap: '0.75rem', marginTop: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.05)', borderRadius: 8, padding: '0.75rem' }}>
                <div>
                  <div><strong>Analítica</strong></div>
                  <div style={{ opacity: 0.8, fontSize: 14 }}>Ayuda a entender el uso del sitio.</div>
                </div>
                <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={prefs.analytics}
                    onChange={(e) => setPrefs(p => ({ ...p, analytics: e.target.checked }))}
                  />
                  <span>{prefs.analytics ? 'Activado' : 'Desactivado'}</span>
                </label>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.05)', borderRadius: 8, padding: '0.75rem' }}>
                <div>
                  <div><strong>Terceros</strong></div>
                  <div style={{ opacity: 0.8, fontSize: 14 }}>Integraciones externas embebidas.</div>
                </div>
                <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={prefs.thirdParty}
                    onChange={(e) => setPrefs(p => ({ ...p, thirdParty: e.target.checked }))}
                  />
                  <span>{prefs.thirdParty ? 'Activado' : 'Desactivado'}</span>
                </label>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '0.75rem' }}>
              <button onClick={handleRejectAll} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.25)', color: '#fff', padding: '0.5rem 0.9rem', borderRadius: 8, cursor: 'pointer', fontWeight:600 }}>Rechazar</button>
              <button onClick={handleSave} style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.25)', color: '#fff', padding: '0.5rem 0.9rem', borderRadius: 8, cursor: 'pointer', fontWeight:600 }}>Guardar preferencias</button>
              <button onClick={handleAcceptAll} style={{ background: '#7289da', border: 'none', color: '#fff', padding: '0.5rem 0.9rem', borderRadius: 8, cursor: 'pointer', fontWeight: 700 }}>Aceptar todas</button>
            </div>
          </div>
        </div>
        <div style={sectionStyle} id="support">
          <h2 style={{color:'#fff',fontWeight:800}}>Contacto</h2>
          <p style={{ opacity: 0.85, fontSize:'1.08rem' }}>
            Si tienes dudas sobre nuestra política de cookies, contáctanos en el servidor de Discord de SpainRP.
          </p>
        </div>
      </div>
      <style>{`
        @keyframes fadein { from { opacity: 0; transform: translateY(30px);} to { opacity: 1; transform: none;} }
      `}</style>
    </div>
  );
};

export default Cookies;


