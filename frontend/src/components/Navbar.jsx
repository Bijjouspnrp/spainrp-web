import { apiUrl } from '../utils/api';
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import './Navbar.css';
import { 
  FaDiscord, FaBars, FaTimes, FaUserCircle, FaMoon, FaSun, 
  FaHome, FaUsers, FaStar, FaNewspaper, FaStore, FaAppStore 
} from 'react-icons/fa';
import { useLocation, useNavigate } from 'react-router-dom';

// Constantes extraídas para mejor mantenibilidad
const SCROLL_THRESHOLD = 24;
const SCROLL_OFFSET = 80;
const RETRY_ATTEMPTS = 12;
const RETRY_DELAY = 100;
const MOBILE_BREAKPOINT = 900;

// Configuración de enlaces centralizada
const NAVIGATION_CONFIG = {
  mainLinks: [
    { to: '/#home', label: 'Inicio', icon: <FaHome />, section: 'home' },
    { to: '/#features', label: 'Características', icon: <FaStar />, section: 'features' },
    { to: '/#staff', label: 'Staff', icon: <FaUsers />, section: 'staff' },
    { to: '/#discord', label: 'Discord', icon: <FaDiscord size={14} />, section: 'discord' },
    { to: '/#about', label: 'Sobre Nosotros', icon: <FaUsers />, section: 'home' },
  ],
  externalLinks: [
    { to: '/blackmarket', label: 'Marketplace Negro', icon: <FaStore /> },
    { to: '/news', label: 'Noticias RP', icon: <FaNewspaper /> },
    { to: '/stockmarket', label: 'Bolsa', icon: <FaStore /> },
    { to: '/apps', label: 'Apps RP', icon: <FaAppStore /> },
  ]
};

// Funciones utilitarias extraídas
const getStoredTheme = () => {
  try {
    return localStorage.getItem('theme') === 'dark';
  } catch (error) {
    console.warn('Error accessing localStorage:', error);
    return false;
  }
};

const setStoredTheme = (isDark) => {
  try {
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  } catch (error) {
    console.warn('Error setting theme in localStorage:', error);
  }
};

// Hook personalizado para manejo del tema
const useTheme = () => {
  const [dark, setDark] = useState(getStoredTheme);

  useEffect(() => {
    document.body.classList.toggle('dark', dark);
    setStoredTheme(dark);
  }, [dark]);

  const toggleTheme = useCallback(() => setDark(prev => !prev), []);

  return { dark, toggleTheme };
};

// Hook personalizado para autenticación
const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    
    const fetchUser = async () => {
      try {
        // Obtener token de localStorage
        const token = localStorage.getItem('spainrp_token');
        
        if (!token) {
          if (mounted) {
            setUser(null);
            setLoading(false);
          }
          return;
        }
        
        // Enviar token en header Authorization
        const response = await fetch(apiUrl('/auth/me'), { 
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        });
        
        if (!mounted) return;
        
        if (response.status === 401) {
          // Token inválido, limpiar
          localStorage.removeItem('spainrp_token');
          setUser(null);
          return;
        }
        
        if (response.ok) {
          const data = await response.json();
          setUser(data?.user || null);
        } else {
          setUser(null);
        }
      } catch (error) {
        // Silenciamos errores de autenticación para evitar spam en consola
        if (mounted) setUser(null);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchUser();

    const handleAuthEvent = () => fetchUser();
    window.addEventListener('cookie-consent', handleAuthEvent);
    window.addEventListener('token-updated', handleAuthEvent); // Escuchar cambios de token
    
    return () => {
      mounted = false;
      window.removeEventListener('cookie-consent', handleAuthEvent);
      window.removeEventListener('token-updated', handleAuthEvent);
    };
  }, []);

  return { user, loading };
};

// Hook personalizado para el scroll
const useScrollDetection = (threshold = SCROLL_THRESHOLD) => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > threshold;
      setScrolled(isScrolled);
    };

    // Throttle del evento scroll para mejor rendimiento
    let ticking = false;
    const throttledScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', throttledScroll, { passive: true });
    return () => window.removeEventListener('scroll', throttledScroll);
  }, [threshold]);

  return scrolled;
};

// Hook para detección de dispositivos móviles
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= MOBILE_BREAKPOINT);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= MOBILE_BREAKPOINT);
    };

    // Debounce del resize para mejor rendimiento
    let timeoutId;
    const debouncedResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(handleResize, 150);
    };

    window.addEventListener('resize', debouncedResize);
    return () => {
      window.removeEventListener('resize', debouncedResize);
      clearTimeout(timeoutId);
    };
  }, []);

  return isMobile;
};

// Componente para el dropdown
const NavigationDropdown = ({ isOpen, onClose, links, dark, isMobile }) => {
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      const handleClickOutside = (event) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
          onClose();
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      ref={dropdownRef}
      style={{
        position: 'absolute',
        top: '100%',
        left: 0,
        minWidth: '300px',
        background: dark ? 'rgba(35, 39, 42, 0.98)' : 'rgba(255, 255, 255, 0.98)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        boxShadow: '0 12px 40px rgba(114, 137, 218, 0.4), 0 0 0 1px rgba(114, 137, 218, 0.15)',
        borderRadius: '16px',
        padding: '16px 0',
        zIndex: 1003,
        border: '1px solid rgba(114, 137, 218, 0.25)',
        marginTop: '8px',
        display: 'block',
        opacity: 1,
        visibility: 'visible',
        transform: 'translateY(0)',
        animation: 'dropdownSlideIn 0.3s ease-out'
      }}
    >
      {links.map((link, index) => (
        <a
          key={index}
          href={link.to}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '14px 20px',
            borderRadius: '10px',
            fontWeight: 600,
            color: dark ? '#fff' : '#23272a',
            background: 'none',
            border: 'none',
            fontSize: '15px',
            textDecoration: 'none',
            transition: 'all 0.2s ease',
            margin: '4px 12px',
            width: 'calc(100% - 24px)',
            position: 'relative',
            minHeight: '44px',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => {
            e.target.style.background = 'rgba(114, 137, 218, 0.15)';
            e.target.style.color = '#7289da';
            e.target.style.transform = 'translateX(6px)';
            e.target.style.boxShadow = '0 4px 12px rgba(114, 137, 218, 0.25)';
            e.target.style.borderLeft = '3px solid #7289da';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'none';
            e.target.style.color = dark ? '#fff' : '#23272a';
            e.target.style.transform = 'translateX(0)';
            e.target.style.boxShadow = 'none';
            e.target.style.borderLeft = 'none';
          }}
          onClick={() => {
            onClose();
          }}
        >
          {link.icon}
          {link.label}
        </a>
      ))}
    </div>
  );
};

// Componente principal del Navbar
const Navbar = () => {
  // Estados locales
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  // Hooks personalizados
  const { dark, toggleTheme } = useTheme();
  const { user, loading } = useAuth();
  const scrolled = useScrollDetection();
  const isMobile = useIsMobile();

  // Hooks de React Router
  const navigate = useNavigate();
  const location = useLocation();

  // Funciones memoizadas para mejor rendimiento
  const toggleMenu = useCallback(() => {
    setIsMenuOpen(prev => !prev);
  }, []);

  const closeMenu = useCallback(() => {
    setIsMenuOpen(false);
  }, []);

  const closeDropdown = useCallback(() => {
    setShowDropdown(false);
  }, []);

  const toggleDropdown = useCallback(() => {
    setShowDropdown(prev => !prev);
  }, []);

  // Efecto para bloquear scroll cuando el menú móvil está abierto
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

  // Función mejorada para scroll suave con offset
  const smoothScrollWithOffset = useCallback((element, offset = SCROLL_OFFSET) => {
    if (!element) return;
    
    const elementTop = element.getBoundingClientRect().top;
    const offsetPosition = elementTop + window.pageYOffset - offset;
    
    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth'
    });
  }, []);

  // Función mejorada para manejo de navegación por secciones
  const handleSectionClick = useCallback((event, sectionId) => {
    event.preventDefault();
    closeMenu();

    const attemptScroll = (retriesLeft = RETRY_ATTEMPTS) => {
      const targetElement = document.getElementById(sectionId);
      
      if (targetElement) {
        smoothScrollWithOffset(targetElement);
      } else if (retriesLeft > 0) {
        setTimeout(() => attemptScroll(retriesLeft - 1), RETRY_DELAY);
      } else {
        // Fallback: scroll al inicio si no se encuentra la sección
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    };

    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => attemptScroll(), RETRY_DELAY);
    } else {
      attemptScroll();
    }
  }, [closeMenu, location.pathname, navigate, smoothScrollWithOffset]);

  // Cálculo memoizado del path activo
  const activePath = useMemo(() => {
    return location.pathname + location.hash;
  }, [location.pathname, location.hash]);

  // Estilos memoizados para mejor rendimiento
  const navbarStyles = useMemo(() => ({
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    zIndex: 100,
    backdropFilter: 'blur(12px)',
    background: dark 
      ? 'rgba(24, 27, 38, 0.85)' 
      : 'rgba(255, 255, 255, 0.85)',
    boxShadow: scrolled 
      ? '0 2px 16px rgba(0, 0, 0, 0.08)' 
      : 'none',
    transition: 'background 0.3s ease, box-shadow 0.3s ease'
  }), [dark, scrolled]);

  const containerStyles = useMemo(() => ({
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    maxWidth: '100vw',
    margin: 0,
    padding: isMobile ? '0 0.5rem' : '0 1.5rem',
    height: isMobile ? 48 : 64,
    gap: isMobile ? 8 : 16
  }), [isMobile]);

  const brandStyles = useMemo(() => ({
    display: 'flex',
    alignItems: 'center',
    gap: isMobile ? 6 : 12,
    justifyContent: 'center',
    flexShrink: 0,
    minWidth: 0,
    maxWidth: isMobile ? '40%' : 'none'
  }), [isMobile]);

  const logoStyles = useMemo(() => ({
    width: isMobile ? 20 : 30,
    height: isMobile ? 20 : 30,
    borderRadius: '50%',
    boxShadow: '0 2px 8px rgba(114, 137, 218, 0.33)',
    flexShrink: 0
  }), [isMobile]);

  const brandTextStyles = useMemo(() => ({
    fontWeight: 800,
    fontSize: isMobile ? 16 : 22,
    color: dark ? '#fff' : '#23272a',
    letterSpacing: 1,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    maxWidth: isMobile ? 120 : 'none'
  }), [dark, isMobile]);

  // Función para renderizar enlaces de navegación
  const renderNavigationLink = useCallback((link, index) => {
    const isActive = activePath.includes(link.section);
    
    const linkStyles = {
      display: 'inline-flex',
      alignItems: 'center',
      gap: isMobile ? 4 : 6,
      padding: isMobile ? '4px 8px' : '6px 12px',
      borderRadius: 8,
      fontWeight: 500,
      color: dark ? '#fff' : '#23272a',
      background: isActive ? 'rgba(114, 137, 218, 0.12)' : 'none',
      border: isActive ? '2px solid #7289da' : 'none',
      fontSize: isMobile ? 13 : 15,
      textDecoration: 'none',
      transition: 'background 0.2s ease',
      position: 'relative',
      boxShadow: isActive ? '0 2px 8px rgba(114, 137, 218, 0.22)' : 'none',
      flexShrink: 0,
      whiteSpace: 'nowrap'
    };

    return (
      <a
        key={index}
        href={link.to}
        className={`nav-link${isActive ? ' active' : ''}`}
        style={linkStyles}
        onClick={(e) => {
          handleSectionClick(e, link.section);
          closeMenu();
        }}
      >
        {link.icon} {link.label}
        {isActive && (
          <span style={{
            position: 'absolute',
            left: 0,
            bottom: -2,
            width: '100%',
            height: 3,
            background: '#7289da',
            borderRadius: 2
          }} />
        )}
      </a>
    );
  }, [activePath, dark, handleSectionClick, closeMenu]);

  // Función para renderizar el componente de usuario/login
  const renderUserSection = useCallback(() => {
    if (loading) {
      return (
        <div style={{
          width: isMobile ? 60 : 100,
          height: 36,
          background: dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
          borderRadius: 8,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}>
          <span style={{ 
            color: dark ? '#fff' : '#23272a', 
            fontSize: isMobile ? 10 : 12,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}>
            {isMobile ? '...' : 'Cargando...'}
          </span>
        </div>
      );
    }

    if (user) {
      return (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: isMobile ? 2 : 6,
          flexShrink: 0,
          minWidth: 0,
          maxWidth: isMobile ? 120 : 200,
          position: 'relative',
          zIndex: 1002
        }}>
          <a
            href="/panel"
            title="Panel"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: isMobile ? 2 : 6,
              textDecoration: 'none',
              background: 'rgba(114, 137, 218, 0.15)',
              border: '1px solid #7289da',
              padding: isMobile ? '3px 6px' : '4px 8px',
              borderRadius: 6,
              boxShadow: '0 2px 8px rgba(114, 137, 218, 0.22)',
              minWidth: 0,
              flexShrink: 1,
              maxWidth: isMobile ? 80 : 150,
              position: 'relative',
              zIndex: 1002
            }}
          >
            <img
              src={`https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`}
              alt="Avatar de usuario"
              style={{
                width: isMobile ? 16 : 20,
                height: isMobile ? 16 : 20,
                borderRadius: '50%',
                border: '1px solid #7289da',
                objectFit: 'cover',
                boxShadow: '0 2px 8px rgba(114, 137, 218, 0.33)',
                flexShrink: 0
              }}
            />
            <span style={{
              fontWeight: 600,
              color: '#7289da',
              fontSize: isMobile ? 10 : 12,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: isMobile ? 40 : 80
            }}>
              {isMobile ? user.username.substring(0, 6) + '...' : user.username}
            </span>
          </a>
          {!isMobile && (
            <button
              onClick={async () => {
                try {
                  // Limpiar token del cliente
                  localStorage.removeItem('spainrp_token');
                  console.log('[Logout] Token JWT eliminado del cliente');
                  
                  // Disparar evento para refrescar UI
                  window.dispatchEvent(new Event('token-updated'));
                  
                  // Llamar al backend para destruir sesión
                  await fetch(apiUrl('/auth/logout'), { 
                    method: 'POST',
                    credentials: 'include'
                  }).catch(() => {}); // Ignorar errores del backend
                  
                  // Redirigir al inicio
                  window.location.href = '/';
                } catch (e) {
                  console.error('[Logout] Error:', e);
                  // Redirigir de todas formas
                  window.location.href = '/';
                }
              }}
              title="Cerrar sesión"
              style={{
                marginLeft: 4,
                color: '#e74c3c',
                fontWeight: 600,
                fontSize: 12,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                textDecoration: 'none',
                padding: '2px 6px',
                borderRadius: 4,
                flexShrink: 0,
                position: 'relative',
                zIndex: 1002
              }}
            >
              Salir
            </button>
          )}
        </div>
      );
    }

    return (
      <a
        href="/auth/login"
        title="Iniciar sesión con Discord"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: isMobile ? 2 : 6,
          textDecoration: 'none',
          background: 'rgba(114, 137, 218, 0.15)',
          border: '1px solid #7289da',
          padding: isMobile ? '3px 6px' : '4px 8px',
          borderRadius: 6,
          boxShadow: '0 2px 8px rgba(114, 137, 218, 0.22)',
          fontWeight: 600,
          color: '#7289da',
          fontSize: isMobile ? 10 : 12,
          flexShrink: 0,
          position: 'relative',
          zIndex: 1002
        }}
      >
        <FaUserCircle size={isMobile ? 14 : 18} color="#7289da" />
        <span>{isMobile ? 'Login' : 'Iniciar sesión'}</span>
      </a>
    );
  }, [user, loading, dark, isMobile]);

  return (
    <nav 
      className={`navbar-discord ${scrolled ? 'scrolled' : ''} ${dark ? 'dark' : ''}`}
      style={navbarStyles}
    >
      {/* Overlay para el menú móvil */}
      {isMenuOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.32)',
            zIndex: 99
          }}
          onClick={closeMenu}
          aria-hidden="true"
        />
      )}

      <div className="navbar-container" style={containerStyles}>
        {/* Logo y marca */}
        <a 
          href="/#home" 
          className="navbar-brand" 
          style={{
            ...brandStyles,
            textDecoration: 'none',
            color: 'inherit',
            cursor: 'pointer',
            transition: 'transform 0.2s ease'
          }}
          onClick={(e) => {
            e.preventDefault();
            closeMenu();
            closeDropdown();
            
            // Si no estamos en la página principal, navegar primero
            if (location.pathname !== '/') {
              navigate('/');
              // Esperar a que se cargue la página y luego hacer scroll
              setTimeout(() => {
                const homeElement = document.getElementById('home');
                if (homeElement) {
                  smoothScrollWithOffset(homeElement);
                } else {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }
              }, 100);
            } else {
              // Si ya estamos en la página principal, hacer scroll directo
              const homeElement = document.getElementById('home');
              if (homeElement) {
                smoothScrollWithOffset(homeElement);
              } else {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.02)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          <img
            src="/assets/spainrplogo.png"
            alt="SpainRP Logo"
            style={logoStyles}
          />
          <span style={brandTextStyles}>
            SpainRP | Oficial
          </span>
        </a>

        {/* Menú de navegación */}
        <div 
          className={`navbar-menu${isMenuOpen ? ' active' : ''}`}
          style={{
            display: isMobile ? 'none' : 'flex',
            alignItems: 'center',
            gap: isMobile ? 4 : 16,
            flexWrap: 'nowrap',
            minWidth: 0,
            flex: 1,
            justifyContent: 'center',
            maxWidth: '100%'
          }}
        >
          {NAVIGATION_CONFIG.mainLinks.map(renderNavigationLink)}
          
          {/* Dropdown de apps y servicios */}
          <div style={{ position: 'relative', zIndex: 1002 }}>
            <button
              onClick={toggleDropdown}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: isMobile ? 4 : 8,
                padding: isMobile ? '4px 8px' : '8px 16px',
                borderRadius: 8,
                fontWeight: 600,
                color: dark ? '#fff' : '#23272a',
                background: showDropdown ? 'rgba(114, 137, 218, 0.15)' : 'none',
                border: 'none',
                fontSize: isMobile ? 13 : 15,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                flexShrink: 0,
                transition: 'all 0.2s ease',
                textDecoration: 'none',
                minHeight: isMobile ? '32px' : '40px',
                justifyContent: 'center'
              }}
              aria-expanded={showDropdown}
              aria-haspopup="true"
            >
              <FaAppStore size={isMobile ? 14 : 16} /> 
              <span style={{ display: isMobile ? 'none' : 'inline' }}>Apps & Servicios</span>
              <span style={{ display: isMobile ? 'inline' : 'none' }}>Apps</span>
              ▾
            </button>
            
            <NavigationDropdown
              isOpen={showDropdown}
              onClose={closeDropdown}
              links={NAVIGATION_CONFIG.externalLinks}
              dark={dark}
              isMobile={isMobile}
            />
          </div>

          {/* Botón Discord solo visible en menú móvil */}
          {isMenuOpen && (
            <a
              href="https://discord.gg/sMzFgFQHXA"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-discord"
              style={{
                marginTop: 12,
                marginBottom: 8,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 16px',
                background: '#7289da',
                color: '#fff',
                borderRadius: 8,
                fontWeight: 700,
                fontSize: 15,
                textDecoration: 'none'
              }}
            >
              <FaDiscord size={14} /> Unirse
            </a>
          )}

          {/* Botón de login en móvil si el usuario NO está logueado */}
          {isMenuOpen && !user && !loading && (
            <a
              href="/auth/login"
              onClick={() => closeMenu()}
              style={{
                marginTop: 12,
                marginBottom: 8,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 16px',
                background: 'rgba(114, 137, 218, 0.15)',
                color: '#7289da',
                borderRadius: 8,
                fontWeight: 700,
                fontSize: 15,
                border: '1px solid #7289da',
                textDecoration: 'none',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(114, 137, 218, 0.22)',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = '#7289da';
                e.target.style.color = '#fff';
                e.target.style.transform = 'translateY(-1px)';
                e.target.style.boxShadow = '0 4px 12px rgba(114, 137, 218, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'rgba(114, 137, 218, 0.15)';
                e.target.style.color = '#7289da';
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 2px 8px rgba(114, 137, 218, 0.22)';
              }}
            >
              <FaUserCircle size={16} /> Iniciar Sesión
            </a>
          )}

          {/* Botón de logout en móvil si el usuario está logueado */}
          {isMenuOpen && user && (
            <button
              onClick={async () => {
                try {
                  // Limpiar token del cliente
                  localStorage.removeItem('spainrp_token');
                  console.log('[Logout] Token JWT eliminado del cliente');
                  
                  // Disparar evento para refrescar UI
                  window.dispatchEvent(new Event('token-updated'));
                  
                  // Llamar al backend para destruir sesión
                  await fetch(apiUrl('/auth/logout'), { 
                    method: 'POST',
                    credentials: 'include'
                  }).catch(() => {}); // Ignorar errores del backend
                  
                  // Cerrar menú móvil
                  closeMenu();
                  
                  // Redirigir al inicio
                  window.location.href = '/';
                } catch (e) {
                  console.error('[Logout] Error:', e);
                  // Redirigir de todas formas
                  window.location.href = '/';
                }
              }}
              style={{
                marginTop: 8,
                marginBottom: 8,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 16px',
                background: '#e74c3c',
                color: '#fff',
                borderRadius: 8,
                fontWeight: 700,
                fontSize: 15,
                border: 'none',
                cursor: 'pointer',
                textDecoration: 'none',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = '#c0392b';
                e.target.style.transform = 'translateY(-1px)';
                e.target.style.boxShadow = '0 4px 12px rgba(231, 76, 60, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = '#e74c3c';
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = 'none';
              }}
            >
              <FaTimes /> Cerrar Sesión
            </button>
          )}
        </div>

        {/* Sección de acciones */}
        <div className="navbar-actions" style={{
          display: 'flex',
          alignItems: 'center',
          gap: isMobile ? '4px' : '8px',
          justifyContent: 'center',
          flexShrink: 0,
          minWidth: 0,
          maxWidth: isMobile ? '120px' : '200px'
        }}>
          {/* Sección de usuario/login */}
          {renderUserSection()}

          {/* Botón Discord solo visible en desktop */}
          {!isMobile && (
            <a
              href="https://discord.gg/sMzFgFQHXA"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-discord"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                padding: '4px 8px',
                background: '#7289da',
                color: '#fff',
                borderRadius: 6,
                fontWeight: 600,
                fontSize: 12,
                boxShadow: '0 2px 8px rgba(114, 137, 218, 0.33)',
                textDecoration: 'none',
                transition: 'background 0.2s ease',
                marginLeft: 4,
                flexShrink: 0,
                whiteSpace: 'nowrap',
                position: 'relative',
                zIndex: 1002
              }}
            >
              <FaDiscord size={12} /> Unirse
            </a>
          )}

          {/* Botón de cambio de tema */}
          <button
            onClick={toggleTheme}
            style={{
              background: 'none',
              border: 'none',
              padding: isMobile ? 4 : 8,
              borderRadius: 8,
              cursor: 'pointer',
              transition: 'background 0.2s ease',
              flexShrink: 0
            }}
            title={dark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
            aria-label={dark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
          >
            {dark ? (
              <FaSun size={isMobile ? 16 : 20} color="#FFD700" />
            ) : (
              <FaMoon size={isMobile ? 16 : 20} color="#7289da" />
            )}
          </button>
        </div>

        {/* Botón del menú hamburguesa */}
        <button
          className="navbar-toggle"
          onClick={toggleMenu}
          style={{
            marginLeft: isMobile ? 4 : 16,
            background: 'none',
            border: 'none',
            padding: isMobile ? 4 : 8,
            borderRadius: 8,
            cursor: 'pointer',
            zIndex: 101,
            transition: 'background 0.2s ease',
            display: isMobile ? 'flex' : 'none',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}
          aria-expanded={isMenuOpen}
          aria-label={isMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
        >
          {isMenuOpen ? (
            <FaTimes size={isMobile ? 20 : 24} color="#7289da" />
          ) : (
            <FaBars size={isMobile ? 20 : 24} color={dark ? '#fff' : '#7289da'} />
          )}
        </button>
      </div>
    </nav>
  );
};

export default Navbar;