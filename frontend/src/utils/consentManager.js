// Utilidades para gestionar la aplicación de preferencias de cookies

export function normalizeConsent(raw) {
  // Acepta strings "accepted"/"rejected" o un objeto de preferencias
  try {
    if (!raw) return { decision: 'unknown', preferences: { analytics: false, thirdParty: false } };
    if (raw === 'accepted') return { decision: 'accepted', preferences: { analytics: true, thirdParty: true } };
    if (raw === 'rejected') return { decision: 'rejected', preferences: { analytics: false, thirdParty: false } };
    const obj = typeof raw === 'string' ? JSON.parse(raw) : raw;
    const prefs = obj?.preferences || {};
    return {
      decision: obj?.decision || 'custom',
      preferences: {
        analytics: Boolean(prefs.analytics),
        thirdParty: Boolean(prefs.thirdParty),
      }
    };
  } catch (_) {
    return { decision: 'unknown', preferences: { analytics: false, thirdParty: false } };
  }
}

export function getStoredConsent() {
  try {
    const raw = localStorage.getItem('cookieConsent');
    return normalizeConsent(raw);
  } catch (_) {
    return { decision: 'unknown', preferences: { analytics: false, thirdParty: false } };
  }
}

export function applyConsent(consent) {
  const normalized = normalizeConsent(consent?.decision ? consent : consent?.preferences ? consent : consent);
  const allowedCategories = new Set();
  if (normalized.preferences.analytics) allowedCategories.add('analytics');
  if (normalized.preferences.thirdParty) allowedCategories.add('third-party');

  // Estrategia: solo activamos scripts marcados como type="text/plain" con data-consent
  // y optativamente data-src. Si ya estaban activos previamente, no podemos revertirlos aquí.
  const candidates = Array.from(document.querySelectorAll('script[data-consent]'));
  candidates.forEach((el) => {
    const category = el.getAttribute('data-consent');
    const alreadyLoaded = el.getAttribute('data-loaded') === 'true';

    // Solo gestionamos scripts "bloqueados" inicialmente
    const isBlockedType = (el.type || '').toLowerCase() === 'text/plain';
    if (!isBlockedType && !alreadyLoaded) {
      return; // no gestionado por el sistema (ya es un script real o desconocido)
    }

    if (allowedCategories.has(category)) {
      if (!alreadyLoaded) {
        // Activar script creando uno nuevo real
        const s = document.createElement('script');
        // Copiar atributos relevantes
        if (el.getAttribute('data-src')) s.src = el.getAttribute('data-src');
        if (el.getAttribute('async') !== null) s.async = true;
        if (el.getAttribute('defer') !== null) s.defer = true;
        if (!el.getAttribute('data-src')) s.textContent = el.textContent || '';
        const nonce = el.getAttribute('nonce');
        if (nonce) s.setAttribute('nonce', nonce);
        // Marcar
        s.setAttribute('data-loaded-by', 'consentManager');
        // Insertar y marcar origen como cargado
        el.parentNode?.insertBefore(s, el.nextSibling);
        el.setAttribute('data-loaded', 'true');
      }
    } else {
      // Mantener bloqueado; si por alguna razón se marcó como cargado, no podemos revertir sin lógica específica
      // Aseguramos que permanezca como text/plain
      if (el.type.toLowerCase() !== 'text/plain') {
        el.type = 'text/plain';
      }
    }
  });
}


