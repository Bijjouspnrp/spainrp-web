import React, { useState, useEffect } from 'react';
import { FaCookie, FaCheck, FaTimes, FaInfoCircle, FaShieldAlt, FaCog } from 'react-icons/fa';

const Cookies = () => {
  const [cookiePreferences, setCookiePreferences] = useState({
    necessary: true, // Siempre activo
    analytics: false,
    marketing: false,
    preferences: false
  });
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    // Cargar preferencias guardadas
    const saved = localStorage.getItem('spainrp_cookie_preferences');
    if (saved) {
      try {
        const preferences = JSON.parse(saved);
        setCookiePreferences({ ...cookiePreferences, ...preferences });
      } catch (error) {
        console.error('Error cargando preferencias de cookies:', error);
      }
    }
  }, []);

  const handlePreferenceChange = (type) => {
    if (type === 'necessary') return; // No se puede desactivar
    
    setCookiePreferences(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  };

  const savePreferences = () => {
    localStorage.setItem('spainrp_cookie_preferences', JSON.stringify(cookiePreferences));
    localStorage.setItem('spainrp_cookies_accepted', 'true');
    
    // Mostrar mensaje de confirmación
    alert('Preferencias de cookies guardadas correctamente');
    
    // Redirigir a la página principal
    window.location.href = '/';
  };

  const acceptAll = () => {
    const allAccepted = {
      necessary: true,
      analytics: true,
      marketing: true,
      preferences: true
    };
    setCookiePreferences(allAccepted);
    localStorage.setItem('spainrp_cookie_preferences', JSON.stringify(allAccepted));
    localStorage.setItem('spainrp_cookies_accepted', 'true');
    window.location.href = '/';
  };

  const rejectAll = () => {
    const onlyNecessary = {
      necessary: true,
      analytics: false,
      marketing: false,
      preferences: false
    };
    setCookiePreferences(onlyNecessary);
    localStorage.setItem('spainrp_cookie_preferences', JSON.stringify(onlyNecessary));
    localStorage.setItem('spainrp_cookies_accepted', 'true');
    window.location.href = '/';
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
      color: 'white',
      padding: '6rem 1rem 2rem 1rem',
      marginTop: '64px'
    }}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        {/* Header */}
        <div style={{
          textAlign: 'center',
          marginBottom: '3rem',
          animation: 'fadeInUp 0.8s ease-out'
        }}>
          <div style={{
      display: 'flex',
      alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            marginBottom: '1rem'
          }}>
            <FaCookie size={32} color="#FFD700" />
            <h1 style={{ 
              margin: 0,
              fontSize: '2.5rem',
              background: 'linear-gradient(135deg, #FFD700 0%, #7289da 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              fontWeight: 'bold'
            }}>
              Política de Cookies
            </h1>
          </div>
          <p style={{ 
            opacity: 0.85, 
            fontSize: '1.1rem',
            lineHeight: '1.6',
            maxWidth: '600px',
            margin: '0 auto'
          }}>
            Gestiona tus preferencias de cookies para personalizar tu experiencia en SpainRP
          </p>
        </div>

        {/* Información general */}
        <div style={{
          background: 'rgba(114, 137, 218, 0.1)',
          border: '1px solid rgba(114, 137, 218, 0.3)',
          borderRadius: '12px',
          padding: '1.5rem',
          marginBottom: '2rem'
        }}>
          <h2 style={{ color: '#7289da', marginTop: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FaInfoCircle />
            ¿Qué son las cookies?
          </h2>
          <p style={{ opacity: 0.85, lineHeight: '1.6' }}>
            Las cookies son pequeños archivos de texto que se almacenan en tu dispositivo cuando visitas nuestro sitio web. 
            Nos ayudan a recordar tus preferencias y mejorar tu experiencia de navegación.
          </p>
        </div>

        {/* Tipos de cookies */}
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ color: '#FFD700', marginBottom: '1.5rem' }}>Tipos de Cookies que Utilizamos</h2>
          
          {/* Cookies Necesarias */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(114, 137, 218, 0.1)',
            borderRadius: '12px',
            padding: '1.5rem',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ flex: 1 }}>
              <h3 style={{ color: '#FFD700', margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FaShieldAlt />
                Cookies Necesarias
              </h3>
              <p style={{ opacity: 0.85, margin: 0, fontSize: '14px' }}>
                Esenciales para el funcionamiento básico del sitio web. No se pueden desactivar.
          </p>
        </div>
            <div style={{
              background: '#27ae60',
              color: 'white',
              padding: '4px 12px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              <FaCheck size={12} />
              Siempre Activo
            </div>
        </div>

          {/* Cookies de Análisis */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(114, 137, 218, 0.1)',
            borderRadius: '12px',
            padding: '1.5rem',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ flex: 1 }}>
              <h3 style={{ color: '#7289da', margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FaCog />
                Cookies de Análisis
              </h3>
              <p style={{ opacity: 0.85, margin: 0, fontSize: '14px' }}>
                Nos ayudan a entender cómo los usuarios interactúan con nuestro sitio web.
              </p>
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={cookiePreferences.analytics}
                onChange={() => handlePreferenceChange('analytics')}
                style={{
                  width: '20px',
                  height: '20px',
                  accentColor: '#7289da'
                }}
              />
              <span style={{ fontSize: '14px', fontWeight: '600' }}>
                {cookiePreferences.analytics ? 'Activado' : 'Desactivado'}
              </span>
            </label>
          </div>

          {/* Cookies de Marketing */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(114, 137, 218, 0.1)',
            borderRadius: '12px',
            padding: '1.5rem',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ flex: 1 }}>
              <h3 style={{ color: '#e74c3c', margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FaCog />
                Cookies de Marketing
              </h3>
              <p style={{ opacity: 0.85, margin: 0, fontSize: '14px' }}>
                Utilizadas para mostrar anuncios relevantes y medir la efectividad de las campañas.
              </p>
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                checked={cookiePreferences.marketing}
                onChange={() => handlePreferenceChange('marketing')}
                style={{
                  width: '20px',
                  height: '20px',
                  accentColor: '#e74c3c'
                }}
              />
              <span style={{ fontSize: '14px', fontWeight: '600' }}>
                {cookiePreferences.marketing ? 'Activado' : 'Desactivado'}
              </span>
                </label>
              </div>

          {/* Cookies de Preferencias */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(114, 137, 218, 0.1)',
            borderRadius: '12px',
            padding: '1.5rem',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ flex: 1 }}>
              <h3 style={{ color: '#f39c12', margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FaCog />
                Cookies de Preferencias
              </h3>
              <p style={{ opacity: 0.85, margin: 0, fontSize: '14px' }}>
                Recuerdan tus configuraciones y preferencias para personalizar tu experiencia.
              </p>
                </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                checked={cookiePreferences.preferences}
                onChange={() => handlePreferenceChange('preferences')}
                style={{
                  width: '20px',
                  height: '20px',
                  accentColor: '#f39c12'
                }}
              />
              <span style={{ fontSize: '14px', fontWeight: '600' }}>
                {cookiePreferences.preferences ? 'Activado' : 'Desactivado'}
              </span>
                </label>
              </div>
            </div>

        {/* Botones de acción */}
        <div style={{
          display: 'flex',
          gap: '1rem',
          justifyContent: 'center',
          flexWrap: 'wrap',
          marginBottom: '2rem'
        }}>
          <button
            onClick={acceptAll}
            style={{
              background: 'linear-gradient(135deg, #27ae60, #2ecc71)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '12px 24px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 15px rgba(39, 174, 96, 0.3)'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 6px 20px rgba(39, 174, 96, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 15px rgba(39, 174, 96, 0.3)';
            }}
          >
            <FaCheck />
            Aceptar Todas
          </button>

          <button
            onClick={rejectAll}
            style={{
              background: 'linear-gradient(135deg, #e74c3c, #c0392b)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '12px 24px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 15px rgba(231, 76, 60, 0.3)'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 6px 20px rgba(231, 76, 60, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 15px rgba(231, 76, 60, 0.3)';
            }}
          >
            <FaTimes />
            Rechazar Todas
          </button>

          <button
            onClick={savePreferences}
            style={{
              background: 'linear-gradient(135deg, #7289da, #5865f2)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '12px 24px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 15px rgba(114, 137, 218, 0.3)'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 6px 20px rgba(114, 137, 218, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 15px rgba(114, 137, 218, 0.3)';
            }}
          >
            <FaCog />
            Guardar Preferencias
          </button>
            </div>

        {/* Información adicional */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid rgba(114, 137, 218, 0.1)',
          borderRadius: '12px',
          padding: '1.5rem',
          textAlign: 'center'
        }}>
          <p style={{ opacity: 0.85, margin: 0, fontSize: '14px' }}>
            Puedes cambiar tus preferencias de cookies en cualquier momento visitando esta página.
            Para más información, consulta nuestra <a href="/terms#privacy" style={{ color: '#7289da' }}>Política de Privacidad</a>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Cookies;
