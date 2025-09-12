import React, { useState, useEffect, useRef } from 'react';
import './Navbar.css';
import { FaDiscord, FaBars, FaTimes, FaUserCircle, FaMoon, FaSun, FaHome, FaUsers, FaStar, FaNewspaper, FaStore, FaAppStore } from 'react-icons/fa';
import { useLocation, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState(null);
  const [dark, setDark] = useState(() => localStorage.getItem('theme') === 'dark');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 24);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    document.body.classList.toggle('dark', dark);
    localStorage.setItem('theme', dark ? 'dark' : 'light');
  }, [dark]);

  useEffect(() => {
    let mounted = true;
    const load = () => {
      // Suprime el error 401 en consola
      try {
        window.fetch('/auth/me', { credentials: 'include' })
          .then(res => {
            if (res.status === 401) return null;
            return res.ok ? res.json() : null;
          })
          .then(data => {
            if (!mounted) return;
            if (data && data.user) setUser(data.user);
            else setUser(null);
          })
          .catch(() => {/* Silenciar error */ mounted && setUser(null); });
      } catch (e) {
        // Silenciar error
      }
    };
    load();
    const onLogout = () => load();
    window.addEventListener('cookie-consent', onLogout);
    return () => { mounted = false; window.removeEventListener('cookie-consent', onLogout); };
  }, []);

  const toggleMenu = () => {
    setIsOpen((prev) => !prev);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  // Bloquear scroll de fondo cuando el menú está abierto en móvil
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const handleSectionClick = (e, sectionId) => {
    e.preventDefault();
    closeMenu();

    const smoothScrollWithOffset = (el, offset = 80) => {
      const y = (el?.getBoundingClientRect()?.top || 0) + window.pageYOffset - offset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    };

    const attemptScroll = (retries = 12) => {
      const el = document.getElementById(sectionId);
      if (el) {
        smoothScrollWithOffset(el);
      } else if (retries > 0) {
        setTimeout(() => attemptScroll(retries - 1), 100);
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    };

    if (location.pathname !== '/') {
      navigate('/');
      // Intentar scroll hasta que la sección exista
      setTimeout(() => attemptScroll(), 100);
    } else {
      attemptScroll();
    }
  };

  // Links y rutas
  const links = [
    { to: '/#home', label: 'Inicio', icon: <FaHome />, section: 'home' },
    { to: '/#features', label: 'Características', icon: <FaStar />, section: 'features' },
    { to: '/#staff', label: 'Staff', icon: <FaUsers />, section: 'staff' },
    { to: '/#discord', label: 'Discord', icon: <FaDiscord />, section: 'discord' },
    { to: '/#about', label: 'Sobre Nosotros', icon: <FaUsers />, section: 'home' },
  ];
  const externalLinks = [
    { to: '/blackmarket', label: 'Marketplace Negro', icon: <FaStore /> },
    { to: '/news', label: 'Noticias RP', icon: <FaNewspaper /> },
    { to: '/stockmarket', label: 'Bolsa', icon: <FaStore /> },
    { to: '/apps', label: 'Apps RP', icon: <FaAppStore /> },
  ];
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    }
    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showDropdown]);

  // Detectar link activo
  const activePath = location.pathname + location.hash;

  return (
    <nav className={`navbar-discord ${scrolled ? 'scrolled' : ''} ${dark ? 'dark' : ''}`} style={{
      position: 'fixed', top: 0, left: 0, width: '100%', zIndex: 100,
      backdropFilter: 'blur(12px)', background: dark ? 'rgba(24,27,38,0.85)' : 'rgba(255,255,255,0.85)',
      boxShadow: scrolled ? '0 2px 16px rgba(0,0,0,0.08)' : 'none', transition: 'background 0.3s, box-shadow 0.3s'
    }}>
      {/* Overlay móvil */}
      {isOpen && (
        <div
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.32)', zIndex: 99
          }}
          onClick={closeMenu}
        />
      )}
  <div className="navbar-container" style={{display:'flex',alignItems:'center',width:'100%',maxWidth:'100vw',margin:0,padding:'0 1.5rem',height:64,gap:32}}>
        {/* Logo y nombre */}
        <div className="navbar-brand" style={{display:'flex',alignItems:'center',gap:12,justifyContent:'center'}}>
          <img src={import.meta.env.BASE_URL + 'src/assets/spainrplogo.png'} alt="SpainRP Logo" style={{width:30,height:30,borderRadius:'50%',boxShadow:'0 2px 8px #7289da33'}} />
          <span style={{fontWeight:800,fontSize:22,color:dark?'#fff':'#23272a',letterSpacing:1}}>SpainRP | Oficial</span>
        </div>

        {/* Links desktop y móvil */}
        <div className={`navbar-menu${isOpen ? ' active' : ''}`}>
          {links.map((link, i) => (
            <a key={i} href={link.to} className={`nav-link${activePath.includes(link.section) ? ' active' : ''}`} style={{
              display:'inline-flex',alignItems:'center',gap:6,padding:'6px 12px',borderRadius:8,fontWeight:500,
              color:dark?'#fff':'#23272a',background:activePath.includes(link.section)?'rgba(114,137,218,0.12)':'none',
              border:activePath.includes(link.section)?'2px solid #7289da':'none',fontSize:15,
              textDecoration:'none',transition:'background 0.2s',position:'relative',boxShadow:activePath.includes(link.section)?'0 2px 8px #7289da22':'none'
            }} onClick={(e) => { handleSectionClick(e, link.section); closeMenu(); }}>
              {link.icon} {link.label}
              {activePath.includes(link.section) && <span style={{position:'absolute',left:0,bottom:-2,width:'100%',height:3,background:'#7289da',borderRadius:2}}></span>}
            </a>
          ))}
          <div className="nav-dropdown" style={{position:'relative'}} ref={dropdownRef}>
            <button onClick={()=>setShowDropdown(s=>!s)} className="nav-link" style={{display:'inline-flex',alignItems:'center',gap:6,padding:'6px 12px',borderRadius:8,fontWeight:500,color:dark?'#fff':'#23272a',background:'none',border:'none',fontSize:15,cursor:'pointer'}}>
              <FaAppStore /> Apps & Servicios ▾
            </button>
            {showDropdown && (
              <div style={{position:'absolute',top:'110%',left:0,minWidth:180,background:dark?'#23272a':'#fff',boxShadow:'0 2px 12px #7289da22',borderRadius:8,padding:'8px 0',zIndex:1000}}>
                {externalLinks.map((link, i) => (
                  <a key={i} href={link.to} target="_blank" rel="noopener noreferrer" className="nav-link" style={{
                    display:'flex',alignItems:'center',gap:8,padding:'8px 16px',borderRadius:6,fontWeight:500,color:dark?'#fff':'#23272a',background:'none',border:'none',fontSize:15,textDecoration:'none',transition:'background 0.2s',margin:'2px 0'
                  }} onClick={()=>setShowDropdown(false)}>
                    {link.icon} {link.label}
                  </a>
                ))}
              </div>
            )}
          </div>
          {/* Unirse (Discord) solo en menú hamburguesa/móvil */}
          {isOpen && (
            <a href="https://discord.gg/sMzFgFQHXA" target="_blank" rel="noopener noreferrer" className="btn-discord" style={{marginTop:12,marginBottom:8}}>
              <FaDiscord /> Unirse
            </a>
          )}
        </div>

        {/* Acciones: login/avatar/modo oscuro SIEMPRE visibles, Discord solo desktop */}
        <div className="navbar-actions" style={{display:'flex',alignItems:'center',gap:'1rem',justifyContent:'center'}}>
          {/* Iniciar sesión siempre visible */}
          {user ? (
            <>
              <a href="/panel" title="Panel" style={{
                display:'inline-flex',alignItems:'center',gap:8,textDecoration:'none',background:'rgba(114,137,218,0.15)',border:'1px solid #7289da',padding:'6px 12px',borderRadius:8,boxShadow:'0 2px 8px #7289da22'
              }}>
                <img src={`https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`} alt="avatar" style={{width:28,height:28,borderRadius:'50%',border:'2px solid #7289da',objectFit:'cover',boxShadow:'0 2px 8px #7289da33',animation:'borderPulse 1.2s infinite alternate'}} />
                <span style={{fontWeight:700,color:'#7289da',fontSize:15}}>{user.username}</span>
              </a>
              <a href="/logout" title="Cerrar sesión" style={{marginLeft:8,color:'#e74c3c',fontWeight:700,fontSize:15}}>Salir</a>
            </>
          ) : (
            <a href="/auth/login" title="Iniciar sesión con Discord" style={{
              display:'inline-flex',alignItems:'center',gap:8,textDecoration:'none',background:'rgba(114,137,218,0.15)',border:'1px solid #7289da',padding:'6px 12px',borderRadius:8,boxShadow:'0 2px 8px #7289da22',fontWeight:700,color:'#7289da',fontSize:15
            }}>
              <FaUserCircle size={22} color="#7289da" />
              <span>Iniciar sesión</span>
            </a>
          )}
          {/* Discord solo desktop */}
          <a href="https://discord.gg/sMzFgFQHXA" target="_blank" rel="noopener noreferrer" className="btn-discord" style={{display:'inline-flex',alignItems:'center',gap:8,padding:'8px 16px',background:'#7289da',color:'#fff',borderRadius:8,fontWeight:700,fontSize:15,boxShadow:'0 2px 8px #7289da33',textDecoration:'none',transition:'background 0.2s',marginLeft:8,display:window.innerWidth<=900?'none':'inline-flex'}}>
            <FaDiscord /> Unirse
          </a>
          <button onClick={()=>setDark(d=>!d)} style={{background:'none',border:'none',padding:0,cursor:'pointer'}} title={dark?'Modo claro':'Modo oscuro'}>
            {dark ? <FaSun size={20} color="#FFD700" /> : <FaMoon size={20} color="#7289da" />}
          </button>
        </div>

        {/* Menú hamburguesa móvil */}
        <button className="navbar-toggle" onClick={toggleMenu} style={{marginLeft:16,background:'none',border:'none',padding:8,borderRadius:8,cursor:'pointer',zIndex:101}}>
          {isOpen ? <FaTimes size={24} color="#7289da" /> : <FaBars size={24} color={dark?'#fff':'#7289da'} />}
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
