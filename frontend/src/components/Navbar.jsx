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
    { to: '/#discord', label: 'Discord', icon: <FaDiscord />, section: 'discord' },
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
        const response = await fetch(apiUrl('/auth/me'), { credentials: 'include' });
        
        if (!mounted) return;
        
        if (response.status === 401) {
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
    
    return () => {
      mounted = false;
      window.removeEventListener('cookie-consent', handleAuthEvent);
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
const NavigationDropdown = ({ isOpen, onClose, links, dark }) => {
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, onClose]);

  const dropdownStyles = {
    position: 'absolute',
    top: '110%',
    left: 0,
    minWidth: 200,
    background: dark ? 'rgba(35, 39, 42, 0.95)' : 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    boxShadow: '0 8px 32px rgba(114, 137, 218, 0.3), 0 0 0 1px rgba(114, 137, 218, 0.1)',
    borderRadius: 12,
    padding: '12px 0',
    zIndex: 1001,
    border: '1px solid rgba(114, 137, 218, 0.2)',
  };

  const linkStyles = {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '12px 20px',
    borderRadius: 8,
    fontWeight: 600,
    color: dark ? '#fff' : '#23272a',
    background: 'none',
    border: 'none',
    fontSize: 15,
    textDecoration: 'none',
    transition: 'all 0.2s ease',
    margin: '2px 8px',
    width: 'calc(100% - 16px)',
    position: 'relative',
  };

  return (
    <div ref={dropdownRef} style={{ position: 'relative' }}>
      {isOpen && (
        <div style={dropdownStyles}>
          {links.map((link, index) => (
            <a
              key={index}
              href={link.to}
              className="nav-link"
              style={linkStyles}
              onClick={(e) => {
                e.preventDefault();
                onClose();
                // Navegar usando React Router
                window.location.href = link.to;
              }}
            >
              {link.icon} {link.label}
            </a>
          ))}
        </div>
      )}
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
    padding: '0 1.5rem',
    height: 64,
    gap: 32
  }), []);

  const brandStyles = useMemo(() => ({
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    justifyContent: 'center'
  }), []);

  const logoStyles = useMemo(() => ({
    width: 30,
    height: 30,
    borderRadius: '50%',
    boxShadow: '0 2px 8px rgba(114, 137, 218, 0.33)'
  }), []);

  const brandTextStyles = useMemo(() => ({
    fontWeight: 800,
    fontSize: 22,
    color: dark ? '#fff' : '#23272a',
    letterSpacing: 1
  }), [dark]);

  // Función para renderizar enlaces de navegación
  const renderNavigationLink = useCallback((link, index) => {
    const isActive = activePath.includes(link.section);
    
    const linkStyles = {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      padding: '6px 12px',
      borderRadius: 8,
      fontWeight: 500,
      color: dark ? '#fff' : '#23272a',
      background: isActive ? 'rgba(114, 137, 218, 0.12)' : 'none',
      border: isActive ? '2px solid #7289da' : 'none',
      fontSize: 15,
      textDecoration: 'none',
      transition: 'background 0.2s ease',
      position: 'relative',
      boxShadow: isActive ? '0 2px 8px rgba(114, 137, 218, 0.22)' : 'none'
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
          width: 120,
          height: 40,
          background: dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
          borderRadius: 8,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <span style={{ color: dark ? '#fff' : '#23272a', fontSize: 14 }}>
            Cargando...
          </span>
        </div>
      );
    }

    if (user) {
      return (
        <>
          <a
            href="/panel"
            title="Panel"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              textDecoration: 'none',
              background: 'rgba(114, 137, 218, 0.15)',
              border: '1px solid #7289da',
              padding: '6px 12px',
              borderRadius: 8,
              boxShadow: '0 2px 8px rgba(114, 137, 218, 0.22)'
            }}
          >
            <img
              src={`https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`}
              alt="Avatar de usuario"
              style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                border: '2px solid #7289da',
                objectFit: 'cover',
                boxShadow: '0 2px 8px rgba(114, 137, 218, 0.33)',
                animation: 'borderPulse 1.2s infinite alternate'
              }}
            />
            <span style={{
              fontWeight: 700,
              color: '#7289da',
              fontSize: 15
            }}>
              {user.username}
            </span>
          </a>
          <a
            href="/logout"
            title="Cerrar sesión"
            style={{
              marginLeft: 8,
              color: '#e74c3c',
              fontWeight: 700,
              fontSize: 15,
              textDecoration: 'none'
            }}
          >
            Salir
          </a>
        </>
      );
    }

    return (
      <a
        href="/auth/login"
        title="Iniciar sesión con Discord"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          textDecoration: 'none',
          background: 'rgba(114, 137, 218, 0.15)',
          border: '1px solid #7289da',
          padding: '6px 12px',
          borderRadius: 8,
          boxShadow: '0 2px 8px rgba(114, 137, 218, 0.22)',
          fontWeight: 700,
          color: '#7289da',
          fontSize: 15
        }}
      >
        <FaUserCircle size={22} color="#7289da" />
        <span>Iniciar sesión</span>
      </a>
    );
  }, [user, loading, dark]);

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
        <div className="navbar-brand" style={brandStyles}>
          <img
            src="/assets/spainrplogo.png"
            alt="SpainRP Logo"
            style={logoStyles}
          />
          <span style={brandTextStyles}>
            SpainRP | Oficial
          </span>
        </div>

        {/* Menú de navegación */}
        <div className={`navbar-menu${isMenuOpen ? ' active' : ''}`}>
          {NAVIGATION_CONFIG.mainLinks.map(renderNavigationLink)}
          
          {/* Dropdown de apps y servicios */}
          <div className="nav-dropdown" style={{ position: 'relative' }}>
            <button
              onClick={toggleDropdown}
              className="nav-link"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 12px',
                borderRadius: 8,
                fontWeight: 500,
                color: dark ? '#fff' : '#23272a',
                background: 'none',
                border: 'none',
                fontSize: 15,
                cursor: 'pointer'
              }}
              aria-expanded={showDropdown}
              aria-haspopup="true"
            >
              <FaAppStore /> Apps & Servicios ▾
            </button>
            
            <NavigationDropdown
              isOpen={showDropdown}
              onClose={closeDropdown}
              links={NAVIGATION_CONFIG.externalLinks}
              dark={dark}
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
              <FaDiscord /> Unirse
            </a>
          )}
        </div>

        {/* Sección de acciones */}
        <div className="navbar-actions" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          justifyContent: 'center'
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
                gap: 8,
                padding: '8px 16px',
                background: '#7289da',
                color: '#fff',
                borderRadius: 8,
                fontWeight: 700,
                fontSize: 15,
                boxShadow: '0 2px 8px rgba(114, 137, 218, 0.33)',
                textDecoration: 'none',
                transition: 'background 0.2s ease',
                marginLeft: 8
              }}
            >
              <FaDiscord /> Unirse
            </a>
          )}

          {/* Botón de cambio de tema */}
          <button
            onClick={toggleTheme}
            style={{
              background: 'none',
              border: 'none',
              padding: 8,
              borderRadius: 8,
              cursor: 'pointer',
              transition: 'background 0.2s ease'
            }}
            title={dark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
            aria-label={dark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
          >
            {dark ? (
              <FaSun size={20} color="#FFD700" />
            ) : (
              <FaMoon size={20} color="#7289da" />
            )}
          </button>
        </div>

        {/* Botón del menú hamburguesa */}
        <button
          className="navbar-toggle"
          onClick={toggleMenu}
          style={{
            marginLeft: 16,
            background: 'none',
            border: 'none',
            padding: 8,
            borderRadius: 8,
            cursor: 'pointer',
            zIndex: 101,
            transition: 'background 0.2s ease'
          }}
          aria-expanded={isMenuOpen}
          aria-label={isMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
        >
          {isMenuOpen ? (
            <FaTimes size={24} color="#7289da" />
          ) : (
            <FaBars size={24} color={dark ? '#fff' : '#7289da'} />
          )}
        </button>
      </div>
    </nav>
  );
};

export default Navbar;