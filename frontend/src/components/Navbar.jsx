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

  // Estilos dinámicos basados en si es móvil o no
  const dropdownStyles = {
    position: isMobile ? 'static' : 'absolute',
    top: isMobile ? 'auto' : '100%',
    left: isMobile ? 'auto' : 0,
    minWidth: isMobile ? '100%' : 200,
    background: dark ? 'rgba(35, 39, 42, 0.95)' : 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    boxShadow: isMobile ? 'none' : '0 8px 32px rgba(114, 137, 218, 0.3), 0 0 0 1px rgba(114, 137, 218, 0.1)',
    borderRadius: 12,
    padding: '12px 0',
    zIndex: 1002,
    border: isMobile ? '1px solid rgba(114, 137, 218, 0.1)' : '1px solid rgba(114, 137, 218, 0.2)',
    marginTop: isMobile ? 0 : 8,
    width: isMobile ? '100%' : 'auto',
  };

  const linkStyles = {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: isMobile ? '10px 16px' : '12px 20px',
    borderRadius: 8,
    fontWeight: 600,
    color: dark ? '#fff' : '#23272a',
    background: 'none',
    border: 'none',
    fontSize: 15,
    textDecoration: 'none',
    transition: 'all 0.2s ease',
    margin: isMobile ? '2px 0' : '2px 8px',
    width: isMobile ? '100%' : 'calc(100% - 16px)',
    position: 'relative',
  };

  return (
    <div ref={dropdownRef} style={{ position: 'relative', width: isMobile ? '100%' : 'auto' }}>
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
          maxWidth: isMobile ? 120 : 200
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
              maxWidth: isMobile ? 80 : 150
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
                flexShrink: 0
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
          flexShrink: 0
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
          <div className="nav-dropdown" style={{ position: 'relative', zIndex: 1002 }}>
            <button
              onClick={toggleDropdown}
              className="nav-link"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 12px',
                borderRadius: 8,
                fontWeight: 600,
                color: dark ? '#fff' : '#23272a',
                background: showDropdown ? 'rgba(114, 137, 218, 0.15)' : 'none',
                border: 'none',
                fontSize: 14,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                flexShrink: 0,
                transition: 'all 0.2s ease'
              }}
              aria-expanded={showDropdown}
              aria-haspopup="true"
            >
              <FaAppStore size={16} /> Apps & Servicios ▾
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
                textDecoration: 'none'
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
                gap: 6,
                padding: '6px 12px',
                background: '#7289da',
                color: '#fff',
                borderRadius: 6,
                fontWeight: 600,
                fontSize: 13,
                boxShadow: '0 2px 8px rgba(114, 137, 218, 0.33)',
                textDecoration: 'none',
                transition: 'background 0.2s ease',
                marginLeft: 4,
                flexShrink: 0,
                whiteSpace: 'nowrap'
              }}
            >
              <FaDiscord size={14} /> Unirse
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