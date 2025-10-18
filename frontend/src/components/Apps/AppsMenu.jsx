import { apiUrl } from '../../utils/api';


import React, { useEffect, useState } from "react";
import DiscordUserBar from '../DiscordUserBar';
import { FaHeart, FaPiggyBank, FaGamepad, FaShieldAlt } from 'react-icons/fa';

const appList = [
  {
    name: 'Tinder RP',
    icon: <FaHeart style={{ color: '#ff5e62' }} />,
    url: '/apps/tinder',
    color: '#ff5e62',
    desc: 'Conoce gente de SpainRP (IC).'
  },
  {
    name: 'Banco Central RP',
    icon: <FaPiggyBank style={{ color: '#00cdbc' }} />,
    url: '/apps/banco',
    color: '#00cdbc',
    desc: 'Gestiona tu dinero, deposita y retira fondos. Conectado con la economia de Discord'
  },
  {
    name: 'Minijuegos RP',
    icon: <FaGamepad style={{ color: '#6b7280' }} />,
    url: '/apps/minijuegos',
    color: '#6b7280',
    desc: 'En mantenimiento - Próximamente disponible',
    disabled: true
  },
  {
    name: 'MDT Policial',
    icon: <FaShieldAlt style={{ color: '#1e40af' }} />,
    url: '/apps/mdt',
    color: '#1e40af',
    desc: 'Sistema de gestión policial para multas, antecedentes y DNI.'
  }
];

const AppsMenu = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [clickedApp, setClickedApp] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);

  // Función para reproducir sonido de clic
  const playClickSound = () => {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.1);
    
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.1);
  };

  // Función para reproducir sonido de hover
  const playHoverSound = () => {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(800, audioContext.currentTime + 0.05);
    
    gainNode.gain.setValueAtTime(0.05, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.05);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.05);
  };

  const handleAppClick = (app, e) => {
    if (app.disabled) {
      e.preventDefault();
      return;
    }

    playClickSound();
    setClickedApp(app.name);
    setIsAnimating(true);
    
    // Efecto de vibración si está disponible
    if (navigator.vibrate) {
      navigator.vibrate([50, 30, 50]);
    }

    // Resetear animación después de un tiempo
    setTimeout(() => {
      setIsAnimating(false);
      setClickedApp(null);
    }, 600);
  };

  const handleAppHover = () => {
    playHoverSound();
  };

  useEffect(() => {
    const token = localStorage.getItem('spainrp_token');
    const headers = token ? { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' } : { 'Accept': 'application/json' };
    fetch(apiUrl('/auth/me'), { headers })
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data && data.user) setUser(data.user);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return null;

  return (
    <div className="apps-bg" style={{minHeight:'100vh',background:'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'2rem 0',position:'relative',overflow:'hidden'}}>
      {/* Efectos de fondo animados */}
      <div className="bg-particles">
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
      </div>
      
      <DiscordUserBar />
      <div className={`phone-mockup ${isAnimating ? 'phone-shake' : ''}`}>
        {/* Marco del iPhone */}
        <div className="phone-frame">
          <div className="phone-screen">
            {/* Dynamic Island */}
            <div className="dynamic-island">
              <div className="island-camera"></div>
              <div className="island-speaker"></div>
            </div>
            
            {/* Status Bar */}
            <div className="status-bar">
              <div className="status-left">
                <span className="time">9:41</span>
              </div>
              <div className="status-right">
                <div className="signal-bars">
                  <div className="bar"></div>
                  <div className="bar"></div>
                  <div className="bar"></div>
                  <div className="bar"></div>
                </div>
                <div className="wifi-icon">📶</div>
                <div className="battery">
                  <div className="battery-level"></div>
                  <div className="battery-tip"></div>
                </div>
              </div>
            </div>
            
            <div className="phone-content">
            <div className="apps-header">
              <div className="header-icon">📱</div>
              <span>APPS SPAINRP</span>
              <div className="header-status">
                <div className="status-dot"></div>
                <span>Online</span>
              </div>
            </div>
            {!user ? (
              <div className="apps-login-block">
                <div className="login-icon">🔐</div>
                <h2>Debes iniciar sesión con Discord para acceder a las Apps.</h2>
                <a href="/auth/login" className="apps-login-btn">
                  <span className="btn-icon">🚀</span>
                  Iniciar sesión
                </a>
                <div className="apps-footer">
                  <span>Acceso solo para usuarios logueados Discord. Apps avanzadas.</span>
                </div>
              </div>
            ) : (
              <div className="apps-menu-list">
                <h2 className="apps-menu-title">
                  <span className="title-icon">⚡</span>
                  Apps RP
                </h2>
                <ul className="apps-menu-ul">
                  {appList.map((app, index) => (
                    <li 
                      key={app.name} 
                      className={`apps-menu-li ${clickedApp === app.name ? 'clicked' : ''}`}
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <a 
                        href={app.disabled ? '#' : app.url} 
                        target={app.disabled ? '_self' : '_blank'} 
                        rel="noopener noreferrer" 
                        className={`apps-menu-link ${app.disabled ? 'disabled' : ''} ${clickedApp === app.name ? 'clicked' : ''}`} 
                        style={{'--app-color': app.color}}
                        onClick={(e) => handleAppClick(app, e)}
                        onMouseEnter={handleAppHover}
                      >
                        <div className="app-icon-container">
                          <span className="apps-menu-icon">{app.icon}</span>
                          <div className="icon-glow"></div>
                        </div>
                        <span className="apps-menu-info">
                          <span className="apps-menu-name">{app.name}</span>
                          <span className="apps-menu-desc">{app.desc}</span>
                        </span>
                        <div className="app-arrow">→</div>
                        {clickedApp === app.name && (
                          <div className="click-ripple"></div>
                        )}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            </div>
            
            {/* Home Indicator */}
            <div className="home-indicator">
              <div className="indicator-bar"></div>
            </div>
          </div>
        </div>
      </div>
      <style>{`
        /* Efectos de fondo animados */
        .bg-particles {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 1;
        }
        
        .particle {
          position: absolute;
          width: 4px;
          height: 4px;
          background: rgba(0, 212, 255, 0.3);
          border-radius: 50%;
          animation: float 6s ease-in-out infinite;
        }
        
        .particle:nth-child(1) {
          top: 20%;
          left: 10%;
          animation-delay: 0s;
          animation-duration: 8s;
        }
        
        .particle:nth-child(2) {
          top: 60%;
          left: 80%;
          animation-delay: 2s;
          animation-duration: 6s;
        }
        
        .particle:nth-child(3) {
          top: 80%;
          left: 20%;
          animation-delay: 4s;
          animation-duration: 7s;
        }
        
        .particle:nth-child(4) {
          top: 30%;
          left: 70%;
          animation-delay: 1s;
          animation-duration: 9s;
        }
        
        .particle:nth-child(5) {
          top: 70%;
          left: 50%;
          animation-delay: 3s;
          animation-duration: 5s;
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); opacity: 0.3; }
          50% { transform: translateY(-20px) rotate(180deg); opacity: 0.8; }
        }
        
        /* Mockup del iPhone realista */
        .phone-mockup {
          width: 375px;
          max-width: 95vw;
          height: 812px;
          position: relative;
          z-index: 2;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .phone-mockup:hover {
          transform: translateY(-5px);
        }
        
        .phone-shake {
          animation: shake 0.6s ease-in-out;
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px) rotate(-1deg); }
          75% { transform: translateX(5px) rotate(1deg); }
        }
        
        .phone-frame {
          width: 100%;
          height: 100%;
          background: linear-gradient(145deg, #2c2c2e 0%, #1c1c1e 100%);
          border-radius: 47px;
          padding: 8px;
          box-shadow: 
            0 0 0 1px #000,
            0 0 0 2px #1c1c1e,
            0 20px 60px rgba(0, 0, 0, 0.4),
            inset 0 1px 0 rgba(255, 255, 255, 0.1);
          position: relative;
        }
        
        .phone-frame::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          border-radius: 47px;
          background: linear-gradient(135deg, 
            rgba(255, 255, 255, 0.1) 0%, 
            transparent 20%, 
            transparent 80%, 
            rgba(0, 0, 0, 0.2) 100%);
          pointer-events: none;
        }
        
        .phone-screen {
          width: 100%;
          height: 100%;
          background: #000;
          border-radius: 39px;
          overflow: hidden;
          position: relative;
          display: flex;
          flex-direction: column;
        }
        
        /* Dynamic Island - iPhone 14 Pro style */
        .dynamic-island {
          position: absolute;
          top: 12px;
          left: 50%;
          transform: translateX(-50%);
          width: 126px;
          height: 37px;
          background: #000;
          border-radius: 19px;
          z-index: 10;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.1);
        }
        
        .island-camera {
          width: 8px;
          height: 8px;
          background: #1c1c1e;
          border-radius: 50%;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .island-speaker {
          width: 40px;
          height: 4px;
          background: #1c1c1e;
          border-radius: 2px;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        /* Status Bar */
        .status-bar {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 54px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0 20px;
          z-index: 5;
          background: linear-gradient(180deg, rgba(0, 0, 0, 0.8) 0%, transparent 100%);
        }
        
        .status-left {
          display: flex;
          align-items: center;
        }
        
        .time {
          color: #fff;
          font-size: 17px;
          font-weight: 600;
          font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif;
          letter-spacing: -0.4px;
        }
        
        .status-right {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        
        .signal-bars {
          display: flex;
          align-items: end;
          gap: 2px;
        }
        
        .signal-bars .bar {
          width: 3px;
          background: #fff;
          border-radius: 1px;
        }
        
        .signal-bars .bar:nth-child(1) { height: 4px; }
        .signal-bars .bar:nth-child(2) { height: 6px; }
        .signal-bars .bar:nth-child(3) { height: 8px; }
        .signal-bars .bar:nth-child(4) { height: 10px; }
        
        .wifi-icon {
          font-size: 16px;
          color: #fff;
        }
        
        .battery {
          width: 24px;
          height: 12px;
          border: 1px solid #fff;
          border-radius: 2px;
          position: relative;
          background: transparent;
        }
        
        .battery-level {
          position: absolute;
          top: 1px;
          left: 1px;
          width: 18px;
          height: 8px;
          background: #30d158;
          border-radius: 1px;
        }
        
        .battery-tip {
          position: absolute;
          right: -3px;
          top: 3px;
          width: 2px;
          height: 6px;
          background: #fff;
          border-radius: 0 1px 1px 0;
        }
        
        .phone-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: flex-start;
          align-items: stretch;
          padding: 70px 20px 20px 20px;
          position: relative;
          background: linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 100%);
        }
        
        /* Home Indicator */
        .home-indicator {
          position: absolute;
          bottom: 8px;
          left: 50%;
          transform: translateX(-50%);
          width: 134px;
          height: 5px;
          background: rgba(255, 255, 255, 0.3);
          border-radius: 3px;
          z-index: 10;
        }
        
        .indicator-bar {
          width: 100%;
          height: 100%;
          background: rgba(255, 255, 255, 0.6);
          border-radius: 3px;
          transition: all 0.3s ease;
        }
        
        .home-indicator:hover .indicator-bar {
          background: rgba(0, 212, 255, 0.8);
          box-shadow: 0 0 10px rgba(0, 212, 255, 0.3);
        }
        
        /* Header mejorado */
        .apps-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 25px;
          padding: 15px 20px;
          background: rgba(0, 212, 255, 0.1);
          border-radius: 20px;
          border: 1px solid rgba(0, 212, 255, 0.2);
          backdrop-filter: blur(10px);
          position: relative;
          overflow: hidden;
        }
        
        .apps-header::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(0, 212, 255, 0.1), transparent);
          animation: shimmer 3s ease-in-out infinite;
        }
        
        @keyframes shimmer {
          0% { left: -100%; }
          100% { left: 100%; }
        }
        
        .header-icon {
          font-size: 1.5rem;
          animation: bounce 2s ease-in-out infinite;
        }
        
        .apps-header span {
          font-size: 1.1rem;
          font-weight: 700;
          color: #fff;
          letter-spacing: 1px;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
        }
        
        .header-status {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.8rem;
          color: #2ed573;
          font-weight: 600;
        }
        
        .status-dot {
          width: 8px;
          height: 8px;
          background: #2ed573;
          border-radius: 50%;
          animation: pulse 2s ease-in-out infinite;
          box-shadow: 0 0 10px rgba(46, 213, 115, 0.5);
        }
        
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.2); opacity: 0.7; }
        }
        
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }
        
        /* Login block mejorado */
        .apps-login-block {
          text-align: center;
          color: #fff;
          margin-top: 60px;
          padding: 30px 20px;
          background: rgba(0, 0, 0, 0.3);
          border-radius: 20px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
        }
        
        .login-icon {
          font-size: 3rem;
          margin-bottom: 20px;
          animation: rotate 3s linear infinite;
        }
        
        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        .apps-login-btn {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          background: linear-gradient(135deg, #7289da 0%, #5865f2 100%);
          color: #fff;
          border-radius: 15px;
          padding: 15px 30px;
          font-weight: 700;
          text-decoration: none;
          font-size: 1.1rem;
          margin-top: 20px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 4px 15px rgba(114, 137, 218, 0.3);
          position: relative;
          overflow: hidden;
        }
        
        .apps-login-btn::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
          transition: left 0.5s ease;
        }
        
        .apps-login-btn:hover::before {
          left: 100%;
        }
        
        .apps-login-btn:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 25px rgba(114, 137, 218, 0.4);
        }
        
        .btn-icon {
          font-size: 1.2rem;
          animation: rocket 2s ease-in-out infinite;
        }
        
        @keyframes rocket {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(3px); }
        }
        
        /* Menu list mejorado */
        .apps-menu-list {
          margin-top: 10px;
        }
        
        .apps-menu-title {
          color: #fff;
          font-size: 1.3rem;
          font-weight: 700;
          margin-bottom: 25px;
          text-align: center;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }
        
        .title-icon {
          font-size: 1.5rem;
          animation: flash 1.5s ease-in-out infinite;
        }
        
        @keyframes flash {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        
        .apps-menu-ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        
        .apps-menu-li {
          margin-bottom: 15px;
          animation: slideInUp 0.6s ease-out forwards;
          opacity: 0;
          transform: translateY(30px);
        }
        
        @keyframes slideInUp {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .apps-menu-link {
          display: flex;
          align-items: center;
          background: rgba(0, 0, 0, 0.4);
          border-radius: 20px;
          padding: 20px 25px;
          color: #fff;
          text-decoration: none;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
          border: 2px solid var(--app-color, #7289da);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
          backdrop-filter: blur(10px);
        }
        
        .apps-menu-link::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
          transition: left 0.5s ease;
        }
        
        .apps-menu-link:hover::before {
          left: 100%;
        }
        
        .apps-menu-link:hover {
          background: var(--app-color, #7289da);
          color: #fff;
          transform: translateY(-5px) scale(1.02);
          box-shadow: 0 8px 25px var(--app-color, #7289da33);
          border-color: var(--app-color, #7289da);
        }
        
        .apps-menu-link.clicked {
          animation: clickEffect 0.6s ease-out;
        }
        
        @keyframes clickEffect {
          0% { transform: scale(1); }
          50% { transform: scale(0.95); }
          100% { transform: scale(1); }
        }
        
        .apps-menu-link.disabled {
          opacity: 0.5;
          cursor: not-allowed;
          pointer-events: none;
          background: #2d2d2d;
          border-color: #6b7280;
        }
        
        .app-icon-container {
          position: relative;
          margin-right: 20px;
          flex-shrink: 0;
        }
        
        .apps-menu-icon {
          font-size: 2.2rem;
          position: relative;
          z-index: 2;
          transition: all 0.3s ease;
        }
        
        .icon-glow {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 60px;
          height: 60px;
          background: var(--app-color, #7289da);
          border-radius: 50%;
          opacity: 0;
          filter: blur(10px);
          transition: all 0.3s ease;
        }
        
        .apps-menu-link:hover .icon-glow {
          opacity: 0.3;
          transform: translate(-50%, -50%) scale(1.2);
        }
        
        .apps-menu-info {
          display: flex;
          flex-direction: column;
          flex: 1;
        }
        
        .apps-menu-name {
          font-size: 1.2rem;
          font-weight: 700;
          margin-bottom: 5px;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
        }
        
        .apps-menu-desc {
          font-size: 0.9rem;
          color: #b9bbbe;
          line-height: 1.4;
        }
        
        .app-arrow {
          font-size: 1.5rem;
          opacity: 0;
          transform: translateX(-10px);
          transition: all 0.3s ease;
          color: var(--app-color, #7289da);
        }
        
        .apps-menu-link:hover .app-arrow {
          opacity: 1;
          transform: translateX(0);
        }
        
        .click-ripple {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 0;
          height: 0;
          background: rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          animation: ripple 0.6s ease-out;
        }
        
        @keyframes ripple {
          0% {
            width: 0;
            height: 0;
            opacity: 1;
          }
          100% {
            width: 200px;
            height: 200px;
            opacity: 0;
          }
        }
        
        .apps-footer {
          margin-top: 30px;
          color: #b9bbbe;
          font-size: 0.9rem;
          text-align: center;
          padding: 20px;
          background: rgba(0, 0, 0, 0.2);
          border-radius: 15px;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        /* Responsive design para iPhone */
        @media (max-width: 500px) {
          .phone-mockup {
            width: 100vw;
            height: 100vh;
            max-width: 100vw;
          }
          
          .phone-frame {
            border-radius: 0;
            padding: 0;
            box-shadow: none;
          }
          
          .phone-screen {
            border-radius: 0;
          }
          
          .dynamic-island {
            display: none;
          }
          
          .status-bar {
            background: rgba(0, 0, 0, 0.9);
            height: 44px;
            padding: 0 15px;
          }
          
          .phone-content {
            padding: 60px 15px 20px 15px;
          }
          
          .apps-header {
            padding: 12px 15px;
            margin-bottom: 20px;
          }
          
          .apps-menu-link {
            padding: 15px 20px;
          }
          
          .home-indicator {
            bottom: 20px;
          }
        }
        
        @media (max-width: 375px) {
          .phone-mockup {
            width: 100vw;
            height: 100vh;
          }
          
          .phone-content {
            padding: 50px 10px 15px 10px;
          }
          
          .apps-menu-link {
            padding: 12px 15px;
          }
        }
      `}</style>
    </div>
  );
};

export default AppsMenu;
