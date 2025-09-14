import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          role="dialog"
          aria-live="polite"
          aria-label="Aviso de cookies"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 40 }}
          transition={{ duration: 0.5 }}
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
              <span style={{ fontSize: 24, transition:'transform 0.3s', animation:'cookiePop 1.2s' }}>🍪</span>
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
              <button
                onClick={() => window.open('/cookies','_blank')}
                style={{
                  background: 'rgba(255,255,255,0.12)',
                  border: '1px solid #7289da',
                  color: '#7289da',
                  padding: '0.5rem 0.9rem',
                  borderRadius: 8,
                  cursor: 'pointer',
                  fontWeight: 500,
                }}
              >
                Más info
              </button>
            </div>
          </div>
          <style>{`
            @keyframes cookiePop { 0% { transform: scale(0.7) rotate(-20deg);} 60% { transform: scale(1.2) rotate(10deg);} 100% { transform: scale(1) rotate(0deg);} }
          `}</style>
        </motion.div>
      )}
      <AnimatePresence>
        {settingsOpen && (
          <motion.div
            role="dialog"
            aria-label="Preferencias de cookies"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.35 }}
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
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              transition={{ duration: 0.35 }}
              style={{
                background: '#1f1f1f',
                color: '#fff',
                borderRadius: 12,
                maxWidth: 520,
                width: '100%',
                padding: '1rem',
                boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
              }}
            >
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
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AnimatePresence>
  );
};

export default CookieConsentBanner;


