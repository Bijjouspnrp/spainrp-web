import React, { useEffect, useState } from 'react';
import { applyConsent, getStoredConsent } from '../utils/consentManager';

const CookieConsentBanner = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const pref = localStorage.getItem('cookieConsent');
      if (!pref) setVisible(true);
    } catch (_) {
      setVisible(true);
    }
  }, []);

  const handleChoice = (choice) => {
    try {
      // choice puede ser 'accepted' | 'rejected' o un objeto de preferencias
      const value = typeof choice === 'string' ? choice : JSON.stringify(choice);
      localStorage.setItem('cookieConsent', value);
    } catch (_) {
      // Ignorar errores de almacenamiento
    }
    setVisible(false);
    // Notificar al resto de la app por si hace falta reaccionar
    try {
      window.dispatchEvent(new CustomEvent('cookie-consent', { detail: choice }));
    } catch (_) {}
    try {
      applyConsent(getStoredConsent());
    } catch (_) {}
  };

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [prefs, setPrefs] = useState({ analytics: false, thirdParty: false });

  useEffect(() => {
    // Aplicar preferencias si ya existen al montar
    try {
      const stored = getStoredConsent();
      applyConsent(stored);
    } catch (_) {}
  }, []);

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Aviso de cookies"
      style={{
        position: 'fixed',
        left: 16,
        right: 16,
        bottom: 16,
        background: 'rgba(0,0,0,0.85)',
        color: '#fff',
        padding: '1rem',
        borderRadius: 12,
        boxShadow: '0 8px 30px rgba(0,0,0,0.4)',
        backdropFilter: 'blur(6px)',
        zIndex: 9999,
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <span style={{ fontSize: 20 }}>🍪</span>
          <strong>Usamos cookies</strong>
        </div>
        <div style={{ opacity: 0.9, lineHeight: 1.5 }}>
          Utilizamos cookies esenciales para el funcionamiento del sitio y, opcionalmente, de terceros para
          mejorar tu experiencia. Puedes aceptar o rechazar ahora. Más información en nuestra{' '}
          <a href="/cookies" style={{ color: '#7289da', textDecoration: 'underline' }}>Política de Cookies</a>.
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.25rem' }}>
          <button
            onClick={() => handleChoice('rejected')}
            style={{
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.25)',
              color: '#fff',
              padding: '0.5rem 0.9rem',
              borderRadius: 8,
              cursor: 'pointer',
            }}
          >
            Rechazar
          </button>
          <button
            onClick={() => setSettingsOpen(true)}
            style={{
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.2)',
              color: '#fff',
              padding: '0.5rem 0.9rem',
              borderRadius: 8,
              cursor: 'pointer',
              fontWeight: 500,
            }}
          >
            Configurar
          </button>
          <button
            onClick={() => handleChoice('accepted')}
            style={{
              background: '#7289da',
              border: 'none',
              color: '#fff',
              padding: '0.5rem 0.9rem',
              borderRadius: 8,
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            Aceptar todas
          </button>
        </div>
      </div>
      {settingsOpen && (
        <div
          role="dialog"
          aria-label="Preferencias de cookies"
          style={{
            position: 'fixed',
            left: 0,
            top: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.6)',
            zIndex: 10000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
          }}
        >
          <div style={{
            background: '#1f1f1f',
            color: '#fff',
            borderRadius: 12,
            maxWidth: 520,
            width: '100%',
            padding: '1rem',
            boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0 }}>Preferencias de cookies</h3>
              <button
                aria-label="Cerrar"
                onClick={() => setSettingsOpen(false)}
                style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: 22, cursor: 'pointer' }}
              >
                ×
              </button>
            </div>
            <div style={{ marginTop: '0.75rem', opacity: 0.9 }}>
              Ajusta tus preferencias. Las cookies esenciales son siempre necesarias para el funcionamiento del sitio.
            </div>
            <div style={{ marginTop: '1rem', display: 'grid', gap: '0.75rem' }}>
              <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 10, padding: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong>Analítica</strong>
                    <div style={{ opacity: 0.8, fontSize: 14 }}>Ayuda a entender el uso del sitio para mejorarlo.</div>
                  </div>
                  <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={prefs.analytics}
                      onChange={(e) => setPrefs((p) => ({ ...p, analytics: e.target.checked }))}
                    />
                    <span>{prefs.analytics ? 'Activado' : 'Desactivado'}</span>
                  </label>
                </div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 10, padding: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong>Terceros</strong>
                    <div style={{ opacity: 0.8, fontSize: 14 }}>Integraciones como scripts externos embebidos.</div>
                  </div>
                  <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={prefs.thirdParty}
                      onChange={(e) => setPrefs((p) => ({ ...p, thirdParty: e.target.checked }))}
                    />
                    <span>{prefs.thirdParty ? 'Activado' : 'Desactivado'}</span>
                  </label>
                </div>
              </div>
            </div>
            <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
              <button
                onClick={() => setSettingsOpen(false)}
                style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.25)', color: '#fff', padding: '0.5rem 0.9rem', borderRadius: 8, cursor: 'pointer' }}
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  const consent = { decision: 'custom', preferences: { ...prefs } };
                  handleChoice(consent);
                }}
                style={{ background: '#7289da', border: 'none', color: '#fff', padding: '0.5rem 0.9rem', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}
              >
                Guardar preferencias
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CookieConsentBanner;


