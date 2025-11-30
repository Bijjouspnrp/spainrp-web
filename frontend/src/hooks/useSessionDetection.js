import { useState, useEffect, useCallback } from 'react';

/**
 * Hook especializado para detección robusta de sesión
 * Detecta tokens desde múltiples fuentes y proporciona feedback detallado
 */
export const useSessionDetection = (options = {}) => {
  const {
    enableLogging = true,
    componentName = 'SessionDetection',
    checkInterval = 1000, // Verificar cada segundo
    maxRetries = 5
  } = options;

  const [sessionState, setSessionState] = useState({
    hasToken: false,
    tokenSource: null,
    tokenPreview: null,
    lastChecked: null,
    retryCount: 0,
    isChecking: false
  });

  const log = useCallback((message, data = {}) => {
    if (enableLogging) {
      console.log(`[${componentName}] ${message}`, data);
    }
  }, [enableLogging, componentName]);

  const detectToken = useCallback(() => {
    log('🔍 Starting comprehensive token detection...');
    
    const sources = {
      localStorage: localStorage.getItem('spainrp_token'),
      sessionStorage: sessionStorage.getItem('spainrp_token'),
      urlParams: new URLSearchParams(window.location.search).get('token'),
      urlHash: window.location.hash.includes('token=') ? 
        new URLSearchParams(window.location.hash.substring(1)).get('token') : null
    };

    log('🔑 Token sources check:', {
      localStorage: {
        hasToken: !!sources.localStorage,
        preview: sources.localStorage ? sources.localStorage.substring(0, 20) + '...' : 'none'
      },
      sessionStorage: {
        hasToken: !!sources.sessionStorage,
        preview: sources.sessionStorage ? sources.sessionStorage.substring(0, 20) + '...' : 'none'
      },
      urlParams: {
        hasToken: !!sources.urlParams,
        preview: sources.urlParams ? sources.urlParams.substring(0, 20) + '...' : 'none'
      },
      urlHash: {
        hasToken: !!sources.urlHash,
        preview: sources.urlHash ? sources.urlHash.substring(0, 20) + '...' : 'none'
      },
      currentUrl: window.location.href
    });

    // Priorizar fuentes de tokens
    let activeToken = null;
    let tokenSource = null;

    if (sources.urlParams) {
      activeToken = sources.urlParams;
      tokenSource = 'urlParams';
      log('🎯 Token found in URL params, saving to localStorage');
      localStorage.setItem('spainrp_token', sources.urlParams);
      
      // Limpiar URL
      const newUrl = window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
      log('🧹 URL cleaned after token extraction');
    } else if (sources.urlHash) {
      activeToken = sources.urlHash;
      tokenSource = 'urlHash';
      log('🎯 Token found in URL hash, saving to localStorage');
      localStorage.setItem('spainrp_token', sources.urlHash);
      
      // Limpiar hash
      window.history.replaceState({}, document.title, window.location.pathname + window.location.search);
      log('🧹 URL hash cleaned after token extraction');
    } else if (sources.localStorage) {
      activeToken = sources.localStorage;
      tokenSource = 'localStorage';
    } else if (sources.sessionStorage) {
      activeToken = sources.sessionStorage;
      tokenSource = 'sessionStorage';
      log('🔄 Using sessionStorage token, copying to localStorage');
      localStorage.setItem('spainrp_token', sources.sessionStorage);
    }

    const newState = {
      hasToken: !!activeToken,
      tokenSource,
      tokenPreview: activeToken ? activeToken.substring(0, 20) + '...' : null,
      lastChecked: new Date().toISOString(),
      retryCount: 0,
      isChecking: false
    };

    log('✅ Token detection result:', newState);
    setSessionState(newState);

    return activeToken;
  }, [log]);

  const verifyToken = useCallback(async (token) => {
    if (!token) return false;

    try {
      log('🌐 Verifying token with backend...');
      // Usar apiUrl para garantizar la URL correcta en prod
      const { apiUrl } = await import('../utils/api');
      const response = await fetch(apiUrl('/auth/me'), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      log('📡 Token verification response:', {
        status: response.status,
        ok: response.ok,
        statusText: response.statusText
      });

      if (response.ok) {
        const data = await response.json();
        log('✅ Token verification successful:', {
          userId: data?.user?.id,
          username: data?.user?.username
        });
        return true;
      } else {
        log('❌ Token verification failed:', response.status);
        return false;
      }
    } catch (error) {
      log('❌ Token verification error:', error.message);
      return false;
    }
  }, [log]);

  const checkSession = useCallback(async () => {
    setSessionState(prev => ({ ...prev, isChecking: true }));
    
    const token = detectToken();
    
    if (token) {
      const isValid = await verifyToken(token);
      if (!isValid) {
        log('❌ Token invalid, clearing all storage');
        localStorage.removeItem('spainrp_token');
        sessionStorage.removeItem('spainrp_token');
        setSessionState(prev => ({
          ...prev,
          hasToken: false,
          tokenSource: null,
          tokenPreview: null,
          isChecking: false
        }));
      }
    }
    
    setSessionState(prev => ({ ...prev, isChecking: false }));
  }, [detectToken, verifyToken, log]);

  useEffect(() => {
    // Verificación inicial
    checkSession();

    // Verificación periódica
    const interval = setInterval(() => {
      checkSession();
    }, checkInterval);

    // Event listeners para cambios
    const handleStorageChange = (e) => {
      if (e.key === 'spainrp_token') {
        log('🔄 Storage change detected, rechecking session');
        checkSession();
      }
    };

    const handleUrlChange = () => {
      log('🔄 URL change detected, rechecking session');
      checkSession();
    };

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        log('🔄 Page visibility change, rechecking session');
        checkSession();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('popstate', handleUrlChange);
    window.addEventListener('hashchange', handleUrlChange);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('popstate', handleUrlChange);
      window.removeEventListener('hashchange', handleUrlChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [checkSession, checkInterval, log]);

  return {
    ...sessionState,
    checkSession,
    detectToken
  };
};

export default useSessionDetection;
