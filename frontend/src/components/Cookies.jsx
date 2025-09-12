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
      minHeight: '60vh',
      background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
      color: 'white',
      padding: '2rem 1rem'
    }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <h1 style={{ marginBottom: '1rem' }}>Política de Cookies</h1>
        <p style={{ opacity: 0.8, marginBottom: '2rem' }}>
          En SpainRP utilizamos cookies y tecnologías similares para mejorar la experiencia de usuario,
          analizar el uso del sitio y, en su caso, personalizar contenido. A continuación encontrarás
          información detallada sobre qué son las cookies, qué tipos utilizamos y cómo puedes gestionarlas.
        </p>

        {savedMsg && (
          <div style={{
            background: 'rgba(114,137,218,0.2)',
            border: '1px solid rgba(114,137,218,0.35)',
            padding: '0.75rem 1rem',
            borderRadius: 10,
            marginBottom: '1rem'
          }}>{savedMsg}</div>
        )}

        <div style={sectionStyle}>
          <h2>¿Qué son las cookies?</h2>
          <p style={{ opacity: 0.85 }}>
            Las cookies son pequeños archivos de texto que se almacenan en tu dispositivo cuando visitas
            un sitio web. Permiten que el sitio recuerde tus acciones y preferencias durante un período de tiempo.
          </p>
        </div>

        <div style={sectionStyle}>
          <h2>Tipos de cookies que utilizamos</h2>
          <ul>
            <li>
              <strong>Cookies esenciales</strong>: necesarias para el funcionamiento básico del sitio y la
              autenticación del usuario (por ejemplo, mantener tu sesión iniciada en el panel).
            </li>
            <li>
              <strong>Cookies de rendimiento</strong>: nos ayudan a entender cómo se utiliza la web para
              mejorar su funcionamiento (por ejemplo, datos agregados de navegación).
            </li>
            <li>
              <strong>Cookies de terceros</strong>: pueden establecerse por servicios de terceros integrados
              (por ejemplo, contenido de Discord o analítica).
            </li>
          </ul>
        </div>

        <div style={sectionStyle}>
          <h2>Gestión de cookies</h2>
          <p style={{ opacity: 0.85 }}>
            Puedes permitir, bloquear o eliminar las cookies instaladas en tu equipo mediante la configuración
            de las opciones del navegador. Ten en cuenta que deshabilitar ciertas cookies puede afectar al
            funcionamiento del sitio, especialmente el acceso al panel privado.
          </p>
          <div style={{
            marginTop: '1rem',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 10,
            padding: '1rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <strong>Tu estado</strong>
              <span style={{ opacity: 0.85 }}>{decisionLabel}</span>
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
              <button onClick={handleRejectAll} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.25)', color: '#fff', padding: '0.5rem 0.9rem', borderRadius: 8, cursor: 'pointer' }}>Rechazar</button>
              <button onClick={handleSave} style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.25)', color: '#fff', padding: '0.5rem 0.9rem', borderRadius: 8, cursor: 'pointer' }}>Guardar preferencias</button>
              <button onClick={handleAcceptAll} style={{ background: '#7289da', border: 'none', color: '#fff', padding: '0.5rem 0.9rem', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>Aceptar todas</button>
            </div>
          </div>
        </div>

        <div style={sectionStyle} id="support">
          <h2>Contacto</h2>
          <p style={{ opacity: 0.85 }}>
            Si tienes dudas sobre nuestra política de cookies, contáctanos en el servidor de Discord de SpainRP.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Cookies;


