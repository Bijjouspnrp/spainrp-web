import { apiUrl } from '../utils/api';
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import './Navbar.css';
import { 
  FaDiscord, FaBars, FaTimes, FaUserCircle, FaMoon, FaSun, 
  FaHome, FaUsers, FaStar, FaNewspaper, FaStore, FaAppStore, FaHandPointer, FaServer 
} from 'react-icons/fa';
import { useLocation, useNavigate } from 'react-router-dom';

// Constantes extraídas para mejor mantenibilidad
const SCROLL_THRESHOLD = 24;
const SCROLL_OFFSET = 80;
const RETRY_ATTEMPTS = 12;
const RETRY_DELAY = 100;

// Sistema de breakpoints mejorado para máxima responsividad
const BREAKPOINTS = {
  mobile: 480,
  tablet: 768,
  desktop: 1024,
  large: 1200,
  xlarge: 1440
};

// Hook mejorado para detección de dispositivos con más granularidad
const useResponsive = () => {
  const [screenSize, setScreenSize] = useState(() => {
    const width = window.innerWidth;
    if (width <= BREAKPOINTS.mobile) return 'mobile';
    if (width <= BREAKPOINTS.tablet) return 'tablet';
    if (width <= BREAKPOINTS.desktop) return 'desktop';
    if (width <= BREAKPOINTS.large) return 'large';
    return 'xlarge';
  });

  const [isMobile, setIsMobile] = useState(window.innerWidth <= BREAKPOINTS.tablet);
  const [isTablet, setIsTablet] = useState(
    window.innerWidth > BREAKPOINTS.mobile && window.innerWidth <= BREAKPOINTS.desktop
  );
  const [isDesktop, setIsDesktop] = useState(window.innerWidth > BREAKPOINTS.desktop);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const newScreenSize = width <= BREAKPOINTS.mobile ? 'mobile' : 
                           width <= BREAKPOINTS.tablet ? 'tablet' :
                           width <= BREAKPOINTS.desktop ? 'desktop' :
                           width <= BREAKPOINTS.large ? 'large' : 'xlarge';
      
      setScreenSize(newScreenSize);
      setIsMobile(width <= BREAKPOINTS.tablet);
      setIsTablet(width > BREAKPOINTS.mobile && width <= BREAKPOINTS.desktop);
      setIsDesktop(width > BREAKPOINTS.desktop);
    };

    // Debounce mejorado para mejor rendimiento
    let timeoutId;
    const debouncedResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(handleResize, 50);
    };

    window.addEventListener('resize', debouncedResize);
    return () => {
      window.removeEventListener('resize', debouncedResize);
      clearTimeout(timeoutId);
    };
  }, []);

  return { screenSize, isMobile, isTablet, isDesktop };
};

// Configuración de enlaces centralizada
const NAVIGATION_CONFIG = {
  mainLinks: [
    { to: '/#home', label: 'Inicio', icon: <FaHome />, section: 'home' },
    { to: '/#features', label: 'Características', icon: <FaStar />, section: 'features' },
    { to: '/#staff', label: 'Staff', icon: <FaUsers />, section: 'staff' },
    { to: '/#erlc', label: 'ERLC Server', icon: <FaServer />, section: 'erlc' },
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

// Hook mejorado para detección de zoom y viewport
const useViewport = () => {
  const [viewport, setViewport] = useState(() => ({
    width: window.innerWidth,
    height: window.innerHeight,
    devicePixelRatio: window.devicePixelRatio || 1,
    zoom: Math.round(window.devicePixelRatio * 100) / 100
  }));

  useEffect(() => {
    const handleResize = () => {
      setViewport({
        width: window.innerWidth,
        height: window.innerHeight,
        devicePixelRatio: window.devicePixelRatio || 1,
        zoom: Math.round(window.devicePixelRatio * 100) / 100
      });
    };

    // Throttle para mejor rendimiento
    let timeoutId;
    const throttledResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(handleResize, 16); // ~60fps
    };

    window.addEventListener('resize', throttledResize);
    window.addEventListener('orientationchange', handleResize);
    
    return () => {
      window.removeEventListener('resize', throttledResize);
      window.removeEventListener('orientationchange', handleResize);
      clearTimeout(timeoutId);
    };
  }, []);

  return viewport;
};

// Componente para el dropdown mejorado con responsividad
const NavigationDropdown = ({ isOpen, onClose, links, dark, screenSize, viewport }) => {
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      const handleClickOutside = (event) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
          onClose();
        }
      };

      const handleEscape = (event) => {
        if (event.key === 'Escape') {
          onClose();
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('keydown', handleEscape);
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Cálculo dinámico de estilos basado en el tamaño de pantalla
  const getDropdownStyles = () => {
    const baseStyles = {
      position: 'absolute',
      top: '100%',
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
    };

    // Ajustes responsivos
    switch (screenSize) {
      case 'mobile':
        return {
          ...baseStyles,
          left: '50%',
          transform: 'translateX(-50%)',
          minWidth: '280px',
          maxWidth: `${Math.min(viewport.width - 32, 320)}px`,
          width: 'auto'
        };
      case 'tablet':
        return {
          ...baseStyles,
          left: 0,
          minWidth: '300px',
          maxWidth: `${Math.min(viewport.width * 0.8, 400)}px`
        };
      default:
        return {
          ...baseStyles,
          left: 0,
          minWidth: '320px',
          maxWidth: '400px'
        };
    }
  };

  return (
    <div 
      ref={dropdownRef}
      style={getDropdownStyles()}
    >
      {links.map((link, index) => (
        <a
          key={index}
          href={link.to}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: screenSize === 'mobile' ? '8px' : '12px',
            padding: screenSize === 'mobile' ? '12px 16px' : '14px 20px',
            borderRadius: '10px',
            fontWeight: 600,
            color: dark ? '#fff' : '#23272a',
            background: 'none',
            border: 'none',
            fontSize: screenSize === 'mobile' ? '14px' : '15px',
            textDecoration: 'none',
            transition: 'all 0.2s ease',
            margin: '4px 12px',
            width: 'calc(100% - 24px)',
            position: 'relative',
            minHeight: screenSize === 'mobile' ? '40px' : '44px',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => {
            e.target.style.background = 'rgba(114, 137, 218, 0.15)';
            e.target.style.color = '#7289da';
            e.target.style.transform = screenSize === 'mobile' ? 'translateX(3px)' : 'translateX(6px)';
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

  // Hooks personalizados mejorados
  const { dark, toggleTheme } = useTheme();
  const { user, loading } = useAuth();
  const scrolled = useScrollDetection();
  const { screenSize, isMobile, isTablet, isDesktop } = useResponsive();
  const viewport = useViewport();

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

  // Efecto para mejorar el scroll cuando el menú móvil está abierto
  useEffect(() => {
    if (isMenuOpen) {
      // Permitir scroll pero con mejor UX
      document.body.style.overflow = 'auto';
      document.body.style.paddingRight = '0px'; // Evitar saltos de layout
    } else {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    }

    return () => {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
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

  // Estilos memoizados mejorados con responsividad completa
  const navbarStyles = useMemo(() => {
    const baseHeight = screenSize === 'mobile' ? 48 : screenSize === 'tablet' ? 56 : 64;
    const paddingX = screenSize === 'mobile' ? '0.5rem' : screenSize === 'tablet' ? '1rem' : '1.5rem';
    
    return {
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      zIndex: 100,
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      background: dark 
        ? 'rgba(24, 27, 38, 0.85)' 
        : 'rgba(255, 255, 255, 0.85)',
      boxShadow: scrolled 
        ? '0 2px 16px rgba(0, 0, 0, 0.08)' 
        : 'none',
      transition: 'background 0.3s ease, box-shadow 0.3s ease',
      minHeight: `${baseHeight}px`,
      maxHeight: `${baseHeight}px`
    };
  }, [dark, scrolled, screenSize]);

  const containerStyles = useMemo(() => {
    const baseHeight = screenSize === 'mobile' ? 48 : screenSize === 'tablet' ? 56 : 64;
    const paddingX = screenSize === 'mobile' ? '0.5rem' : screenSize === 'tablet' ? '1rem' : '1.5rem';
    const gap = screenSize === 'mobile' ? 8 : screenSize === 'tablet' ? 12 : 16;
    
    return {
      display: 'flex',
      alignItems: 'center',
      width: '100%',
      maxWidth: '100vw',
      margin: 0,
      padding: `0 ${paddingX}`,
      height: `${baseHeight}px`,
      gap: `${gap}px`,
      overflow: 'hidden',
      flexWrap: 'nowrap'
    };
  }, [screenSize]);

  const brandStyles = useMemo(() => {
    const gap = screenSize === 'mobile' ? 6 : screenSize === 'tablet' ? 8 : 12;
    const maxWidth = screenSize === 'mobile' ? '40%' : screenSize === 'tablet' ? '50%' : 'none';
    
    return {
      display: 'flex',
      alignItems: 'center',
      gap: `${gap}px`,
      justifyContent: 'center',
      flexShrink: 0,
      minWidth: 0,
      maxWidth: maxWidth
    };
  }, [screenSize]);

  const logoStyles = useMemo(() => {
    const size = screenSize === 'mobile' ? 20 : screenSize === 'tablet' ? 24 : 30;
    
    return {
      width: `${size}px`,
      height: `${size}px`,
      borderRadius: '50%',
      boxShadow: '0 2px 8px rgba(114, 137, 218, 0.33)',
      flexShrink: 0,
      objectFit: 'cover'
    };
  }, [screenSize]);

  const brandTextStyles = useMemo(() => {
    const fontSize = screenSize === 'mobile' ? 16 : screenSize === 'tablet' ? 18 : 22;
    const maxWidth = screenSize === 'mobile' ? 120 : screenSize === 'tablet' ? 150 : 'none';
    
    return {
      fontWeight: 800,
      fontSize: `${fontSize}px`,
      color: dark ? '#fff' : '#23272a',
      letterSpacing: 1,
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      maxWidth: maxWidth === 'none' ? 'none' : `${maxWidth}px`
    };
  }, [dark, screenSize]);

  // Función para renderizar enlaces de navegación mejorada
  const renderNavigationLink = useCallback((link, index) => {
    // Deshabilitar marcado de elementos activos - ningún elemento debe brillar
    const isActive = false;
    
    // Cálculo dinámico de estilos basado en el tamaño de pantalla
    const getLinkStyles = () => {
      const baseStyles = {
        display: 'inline-flex',
        alignItems: 'center',
        borderRadius: 8,
        fontWeight: 500,
        color: dark ? '#fff' : '#23272a',
        background: isActive ? 'rgba(114, 137, 218, 0.12)' : 'none',
        border: isActive ? '2px solid #7289da' : 'none',
        textDecoration: 'none',
        transition: 'background 0.2s ease',
        position: 'relative',
        boxShadow: isActive ? '0 2px 8px rgba(114, 137, 218, 0.22)' : 'none',
        flexShrink: 0,
        whiteSpace: 'nowrap'
      };

      // Ajustes responsivos
      switch (screenSize) {
        case 'mobile':
          return {
            ...baseStyles,
            gap: '4px',
            padding: '4px 8px',
            fontSize: '13px'
          };
        case 'tablet':
          return {
            ...baseStyles,
            gap: '5px',
            padding: '5px 10px',
            fontSize: '14px'
          };
        default:
          return {
            ...baseStyles,
            gap: '6px',
            padding: '6px 12px',
            fontSize: '15px'
          };
      }
    };
    
    const linkStyles = getLinkStyles();

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
  }, [dark, handleSectionClick, closeMenu, screenSize]);

  // Función para renderizar el componente de usuario/login mejorada
  const renderUserSection = useCallback(() => {
    if (loading) {
      const loadingWidth = screenSize === 'mobile' ? 60 : screenSize === 'tablet' ? 80 : 100;
      const loadingHeight = screenSize === 'mobile' ? 32 : screenSize === 'tablet' ? 36 : 40;
      const fontSize = screenSize === 'mobile' ? 10 : screenSize === 'tablet' ? 11 : 12;
      const loadingText = screenSize === 'mobile' ? '...' : screenSize === 'tablet' ? 'Cargando...' : 'Cargando...';
      
      return (
        <div style={{
          width: `${loadingWidth}px`,
          height: `${loadingHeight}px`,
          background: dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
          borderRadius: 8,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}>
          <span style={{ 
            color: dark ? '#fff' : '#23272a', 
            fontSize: `${fontSize}px`,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}>
            {loadingText}
          </span>
        </div>
      );
    }

    if (user) {
      // Cálculo dinámico de estilos para usuario logueado
      const userGap = screenSize === 'mobile' ? 2 : screenSize === 'tablet' ? 4 : 6;
      const userPadding = screenSize === 'mobile' ? '3px 6px' : screenSize === 'tablet' ? '3px 7px' : '4px 8px';
      const userMaxWidth = screenSize === 'mobile' ? 120 : screenSize === 'tablet' ? 160 : 200;
      const avatarSize = screenSize === 'mobile' ? 16 : screenSize === 'tablet' ? 18 : 20;
      const fontSize = screenSize === 'mobile' ? 10 : screenSize === 'tablet' ? 11 : 12;
      const usernameMaxWidth = screenSize === 'mobile' ? 40 : screenSize === 'tablet' ? 60 : 80;
      const displayUsername = screenSize === 'mobile' ? 
        user.username.substring(0, 6) + '...' : 
        screenSize === 'tablet' ? 
        user.username.substring(0, 8) + '...' : 
        user.username;
      
      return (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: `${userGap}px`,
          flexShrink: 0,
          minWidth: 0,
          maxWidth: `${userMaxWidth}px`,
          position: 'relative',
          zIndex: 1002
        }}>
          <a
            href="/panel"
            title="Panel"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: `${userGap}px`,
              textDecoration: 'none',
              background: 'rgba(114, 137, 218, 0.15)',
              border: '1px solid #7289da',
              padding: userPadding,
              borderRadius: 6,
              boxShadow: '0 2px 8px rgba(114, 137, 218, 0.22)',
              minWidth: 0,
              flexShrink: 1,
              maxWidth: screenSize === 'mobile' ? '80px' : screenSize === 'tablet' ? '120px' : '150px',
              position: 'relative',
              zIndex: 1002
            }}
          >
            <img
              src={`https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`}
              alt="Avatar de usuario"
              style={{
                width: `${avatarSize}px`,
                height: `${avatarSize}px`,
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
              fontSize: `${fontSize}px`,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: `${usernameMaxWidth}px`
            }}>
              {displayUsername}
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
                fontSize: screenSize === 'tablet' ? 11 : 12,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                textDecoration: 'none',
                padding: screenSize === 'tablet' ? '2px 5px' : '2px 6px',
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

    // Cálculo dinámico de estilos para botón de login
    const loginGap = screenSize === 'mobile' ? 2 : screenSize === 'tablet' ? 4 : 6;
    const loginPadding = screenSize === 'mobile' ? '3px 6px' : screenSize === 'tablet' ? '3px 7px' : '4px 8px';
    const loginFontSize = screenSize === 'mobile' ? 10 : screenSize === 'tablet' ? 11 : 12;
    const loginIconSize = screenSize === 'mobile' ? 14 : screenSize === 'tablet' ? 16 : 18;
    const loginText = screenSize === 'mobile' ? 'Login' : screenSize === 'tablet' ? 'Login' : 'Iniciar sesión';
    
    return (
      <a
        href="/auth/login"
        title="Iniciar sesión con Discord"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: `${loginGap}px`,
          textDecoration: 'none',
          background: 'rgba(114, 137, 218, 0.15)',
          border: '1px solid #7289da',
          padding: loginPadding,
          borderRadius: 6,
          boxShadow: '0 2px 8px rgba(114, 137, 218, 0.22)',
          fontWeight: 600,
          color: '#7289da',
          fontSize: `${loginFontSize}px`,
          flexShrink: 0,
          position: 'relative',
          zIndex: 1002
        }}
      >
        <FaUserCircle size={loginIconSize} color="#7289da" />
        <span>{loginText}</span>
      </a>
    );
  }, [user, loading, dark, screenSize]);

  return (
    <nav 
      className={`navbar-discord ${scrolled ? 'scrolled' : ''} ${dark ? 'dark' : ''}`}
      style={navbarStyles}
    >
      {/* Overlay para el menú móvil - mejorado para permitir scroll */}
      {isMenuOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.2)',
            zIndex: 99,
            backdropFilter: 'blur(2px)',
            WebkitBackdropFilter: 'blur(2px)',
            transition: 'opacity 0.3s ease, backdrop-filter 0.3s ease',
            pointerEvents: 'auto'
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

        {/* Menú de navegación mejorado */}
        <div 
          className={`navbar-menu${isMenuOpen ? ' active' : ''}`}
          style={{
            display: isMobile ? 'none' : 'flex',
            alignItems: 'center',
            gap: screenSize === 'mobile' ? 4 : screenSize === 'tablet' ? 8 : 16,
            flexWrap: 'nowrap',
            minWidth: 0,
            flex: 1,
            justifyContent: 'center',
            maxWidth: '100%'
          }}
        >
          {/* Enlaces de navegación - solo en desktop */}
          {!isMobile && NAVIGATION_CONFIG.mainLinks.map(renderNavigationLink)}
          
          {/* Contenedor con scroll para móvil */}
          {isMobile && isMenuOpen && (
            <div className="mobile-menu-content">
              {NAVIGATION_CONFIG.mainLinks.map(renderNavigationLink)}
            </div>
          )}
          
          {/* Dropdown de apps y servicios mejorado */}
          <div style={{ position: 'relative', zIndex: 1002 }} data-tutorial="apps-dropdown">
            <button
              onClick={toggleDropdown}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: screenSize === 'mobile' ? 4 : screenSize === 'tablet' ? 6 : 8,
                padding: screenSize === 'mobile' ? '4px 8px' : screenSize === 'tablet' ? '6px 12px' : '8px 16px',
                borderRadius: 8,
                fontWeight: 600,
                color: dark ? '#fff' : '#23272a',
                background: showDropdown ? 'rgba(114, 137, 218, 0.15)' : 'none',
                border: 'none',
                fontSize: screenSize === 'mobile' ? 13 : screenSize === 'tablet' ? 14 : 15,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                flexShrink: 0,
                transition: 'all 0.2s ease',
                textDecoration: 'none',
                minHeight: screenSize === 'mobile' ? '32px' : screenSize === 'tablet' ? '36px' : '40px',
                justifyContent: 'center'
              }}
              aria-expanded={showDropdown}
              aria-haspopup="true"
            >
              <FaAppStore size={screenSize === 'mobile' ? 14 : screenSize === 'tablet' ? 15 : 16} /> 
              <span style={{ display: isMobile ? 'none' : 'inline' }}>
                {screenSize === 'tablet' ? 'Apps' : 'Apps & Servicios'}
              </span>
              <span style={{ display: isMobile ? 'inline' : 'none' }}>Apps</span>
              ▾
            </button>
            
            <NavigationDropdown
              isOpen={showDropdown}
              onClose={closeDropdown}
              links={NAVIGATION_CONFIG.externalLinks}
              dark={dark}
              screenSize={screenSize}
              viewport={viewport}
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

          {/* Botón de Panel en móvil si el usuario está logueado */}
          {isMenuOpen && user && (
            <a
              href="/panel"
              onClick={() => closeMenu()}
              style={{
                marginTop: 12,
                marginBottom: 8,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 16px',
                background: 'linear-gradient(135deg, #7289da, #5865f2)',
                color: '#fff',
                borderRadius: 8,
                fontWeight: 700,
                fontSize: 15,
                border: 'none',
                textDecoration: 'none',
                cursor: 'pointer',
                boxShadow: '0 4px 15px rgba(114, 137, 218, 0.3)',
                transition: 'all 0.3s ease',
                position: 'relative',
                overflow: 'hidden'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'linear-gradient(135deg, #5865f2, #7289da)';
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 6px 20px rgba(114, 137, 218, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'linear-gradient(135deg, #7289da, #5865f2)';
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 15px rgba(114, 137, 218, 0.3)';
              }}
            >
              <FaUserCircle size={16} /> Panel de Usuario
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
                background: 'linear-gradient(135deg, #e74c3c, #c0392b)',
                color: '#fff',
                borderRadius: 8,
                fontWeight: 700,
                fontSize: 15,
                border: 'none',
                cursor: 'pointer',
                textDecoration: 'none',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 15px rgba(231, 76, 60, 0.3)',
                position: 'relative',
                overflow: 'hidden'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'linear-gradient(135deg, #c0392b, #a93226)';
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 6px 20px rgba(231, 76, 60, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'linear-gradient(135deg, #e74c3c, #c0392b)';
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 15px rgba(231, 76, 60, 0.3)';
              }}
            >
              <FaTimes /> Cerrar Sesión
            </button>
          )}
        </div>

        {/* Sección de acciones mejorada */}
        <div className="navbar-actions" style={{
          display: 'flex',
          alignItems: 'center',
          gap: screenSize === 'mobile' ? '4px' : screenSize === 'tablet' ? '6px' : '8px',
          justifyContent: 'center',
          flexShrink: 0,
          minWidth: 0,
          maxWidth: screenSize === 'mobile' ? '120px' : screenSize === 'tablet' ? '160px' : '200px'
        }}>
          {/* Sección de usuario/login */}
          <div data-tutorial="user-panel">
            {renderUserSection()}
          </div>

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
                padding: screenSize === 'tablet' ? '3px 6px' : '4px 8px',
                background: '#7289da',
                color: '#fff',
                borderRadius: 6,
                fontWeight: 600,
                fontSize: screenSize === 'tablet' ? 11 : 12,
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
              <FaDiscord size={screenSize === 'tablet' ? 11 : 12} /> Unirse
            </a>
          )}

          {/* Botón de cambio de tema mejorado */}
          <button
            onClick={toggleTheme}
            style={{
              background: 'none',
              border: 'none',
              padding: screenSize === 'mobile' ? 4 : screenSize === 'tablet' ? 6 : 8,
              borderRadius: 8,
              cursor: 'pointer',
              transition: 'background 0.2s ease',
              flexShrink: 0
            }}
            title={dark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
            aria-label={dark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
          >
            {dark ? (
              <FaSun size={screenSize === 'mobile' ? 16 : screenSize === 'tablet' ? 18 : 20} color="#FFD700" />
            ) : (
              <FaMoon size={screenSize === 'mobile' ? 16 : screenSize === 'tablet' ? 18 : 20} color="#7289da" />
            )}
          </button>

          {/* Botón de tutorial mejorado */}
          <button
            onClick={() => {
              // Disparar evento para abrir tutorial
              window.dispatchEvent(new CustomEvent('open-tutorial'));
            }}
            style={{
              background: 'none',
              border: 'none',
              padding: screenSize === 'mobile' ? 4 : screenSize === 'tablet' ? 6 : 8,
              borderRadius: 8,
              cursor: 'pointer',
              transition: 'background 0.2s ease',
              flexShrink: 0,
              color: '#7289da'
            }}
            title="Ver tutorial interactivo"
            aria-label="Ver tutorial interactivo"
          >
            <FaHandPointer size={screenSize === 'mobile' ? 16 : screenSize === 'tablet' ? 18 : 20} />
          </button>
        </div>

        {/* Botón del menú hamburguesa mejorado */}
        <button
          className="navbar-toggle"
          onClick={toggleMenu}
          style={{
            marginLeft: screenSize === 'mobile' ? 4 : screenSize === 'tablet' ? 8 : 16,
            background: 'none',
            border: 'none',
            padding: screenSize === 'mobile' ? 4 : screenSize === 'tablet' ? 6 : 8,
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
            <FaTimes size={screenSize === 'mobile' ? 20 : screenSize === 'tablet' ? 22 : 24} color="#7289da" />
          ) : (
            <FaBars size={screenSize === 'mobile' ? 20 : screenSize === 'tablet' ? 22 : 24} color={dark ? '#fff' : '#7289da'} />
          )}
        </button>
      </div>
    </nav>
  );
};

export default Navbar;