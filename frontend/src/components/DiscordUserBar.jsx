import { apiUrl } from '../utils/api';
import React, { useEffect, useState } from 'react';
import { FaDiscord, FaChevronDown, FaChevronUp, FaUser, FaCog, FaSignOutAlt, FaHome } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

export default function DiscordUserBar() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

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

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        style={{
          position: 'absolute',
          top: 18,
          right: 24,
          zIndex: 1001,
          background: 'rgba(32,34,37,0.85)',
          borderRadius: 12,
          padding: '8px 18px',
          boxShadow: '0 2px 8px #23272a33',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(114, 137, 218, 0.2)'
        }}
      >
        <div style={{
          width: 32,
          height: 32,
          borderRadius: '50%',
          background: 'linear-gradient(45deg, #7289da, #5865f2)',
          animation: 'pulse 1.5s ease-in-out infinite'
        }} />
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, type: "spring", stiffness: 100 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        position: 'absolute',
        top: 18,
        right: 24,
        zIndex: 1001,
        maxWidth: 'calc(100vw - 120px)',
        overflow: 'visible'
      }}
    >
      {/* Barra principal */}
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsExpanded(!isExpanded)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: isMobile ? 8 : 12,
          background: isHovered 
            ? 'rgba(32,34,37,0.95)' 
            : 'rgba(32,34,37,0.85)',
          borderRadius: 12,
          padding: isMobile ? '6px 12px' : '8px 18px',
          boxShadow: isHovered 
            ? '0 4px 20px rgba(114, 137, 218, 0.3)' 
            : '0 2px 8px #23272a33',
          backdropFilter: 'blur(10px)',
          border: isHovered 
            ? '1px solid rgba(114, 137, 218, 0.4)' 
            : '1px solid rgba(114, 137, 218, 0.2)',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          minHeight: isMobile ? 40 : 48,
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Efecto de brillo en hover */}
        <motion.div
          style={{
            position: 'absolute',
            top: 0,
            left: '-100%',
            width: '100%',
            height: '100%',
            background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent)',
            zIndex: 1
          }}
          animate={{
            x: isHovered ? ['0%', '200%'] : '0%'
          }}
          transition={{ duration: 0.6 }}
        />

        {/* Contenido principal */}
        <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 8 : 12, position: 'relative', zIndex: 2 }}>
          {/* Icono Discord animado */}
          <motion.div
            animate={{ 
              rotate: isHovered ? [0, 5, -5, 0] : 0,
              scale: isHovered ? 1.1 : 1
            }}
            transition={{ duration: 0.3 }}
          >
            <FaDiscord 
              size={isMobile ? 18 : 24} 
              color="#7289da" 
              style={{ filter: 'drop-shadow(0 2px 4px rgba(114, 137, 218, 0.3))' }}
            />
          </motion.div>

          {/* Avatar */}
          <motion.div
            whileHover={{ scale: 1.1 }}
            transition={{ duration: 0.2 }}
            style={{ position: 'relative' }}
          >
            <img 
              src={user ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png` : '/default-avatar.png'} 
              alt="avatar" 
              style={{
                width: isMobile ? 28 : 36,
                height: isMobile ? 28 : 36,
                borderRadius: '50%',
                border: '2px solid #7289da',
                boxShadow: '0 2px 8px rgba(114, 137, 218, 0.3)',
                objectFit: 'cover'
              }} 
            />
            {/* Indicador de estado online */}
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              style={{
                position: 'absolute',
                bottom: -2,
                right: -2,
                width: 12,
                height: 12,
                borderRadius: '50%',
                background: '#2ecc71',
                border: '2px solid #2c2f33',
                boxShadow: '0 0 8px rgba(46, 204, 113, 0.5)'
              }}
            />
          </motion.div>

          {/* Nombre de usuario (solo en desktop o cuando está expandido) */}
          <AnimatePresence>
            {(!isMobile || isExpanded) && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.3 }}
                style={{
                  fontWeight: 700,
                  color: '#fff',
                  fontSize: isMobile ? '0.85rem' : '1rem',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: isMobile ? 120 : 200
                }}
              >
                {user ? `${user.username}#${user.discriminator}` : 'No has iniciado sesión'}
              </motion.span>
            )}
          </AnimatePresence>

          {/* Botón de expansión */}
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.3 }}
            style={{ marginLeft: isMobile ? 4 : 8 }}
          >
            <FaChevronDown 
              size={isMobile ? 12 : 14} 
              color="#7289da" 
              style={{ opacity: 0.7 }}
            />
          </motion.div>
        </div>
      </motion.div>

      {/* Menú desplegable */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2, type: "spring", stiffness: 300 }}
            style={{
              position: 'absolute',
              top: '100%',
              right: 0,
              marginTop: 8,
              background: 'rgba(32,34,37,0.95)',
              borderRadius: 12,
              padding: '8px 0',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(114, 137, 218, 0.3)',
              minWidth: 200,
              overflow: 'hidden',
              zIndex: 1002
            }}
          >
            {/* Opciones del menú */}
            {user ? (
              <>
                <motion.a
                  href="/"
                  whileHover={{ backgroundColor: 'rgba(114, 137, 218, 0.1)' }}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '12px 16px',
                    color: '#fff',
                    textDecoration: 'none',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    transition: 'all 0.2s ease'
                  }}
                >
                  <FaHome size={16} color="#7289da" />
                  Inicio
                </motion.a>
                
                <motion.a
                  href="/profile"
                  whileHover={{ backgroundColor: 'rgba(114, 137, 218, 0.1)' }}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '12px 16px',
                    color: '#fff',
                    textDecoration: 'none',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    transition: 'all 0.2s ease'
                  }}
                >
                  <FaUser size={16} color="#7289da" />
                  Perfil
                </motion.a>
                
                <motion.a
                  href="/settings"
                  whileHover={{ backgroundColor: 'rgba(114, 137, 218, 0.1)' }}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '12px 16px',
                    color: '#fff',
                    textDecoration: 'none',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    transition: 'all 0.2s ease'
                  }}
                >
                  <FaCog size={16} color="#7289da" />
                  Configuración
                </motion.a>
                
                <div style={{
                  height: 1,
                  background: 'rgba(114, 137, 218, 0.2)',
                  margin: '8px 0'
                }} />
                
                <motion.a
                  href="/logout"
                  whileHover={{ backgroundColor: 'rgba(231, 76, 60, 0.1)' }}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '12px 16px',
                    color: '#e74c3c',
                    textDecoration: 'none',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    transition: 'all 0.2s ease'
                  }}
                >
                  <FaSignOutAlt size={16} color="#e74c3c" />
                  Cerrar sesión
                </motion.a>
              </>
            ) : (
              <motion.a
                href="/auth/login"
                whileHover={{ backgroundColor: 'rgba(114, 137, 218, 0.1)' }}
                whileTap={{ scale: 0.98 }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '12px 16px',
                  color: '#fff',
                  textDecoration: 'none',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  transition: 'all 0.2s ease'
                }}
              >
                <FaDiscord size={16} color="#7289da" />
                Iniciar sesión
              </motion.a>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Estilos CSS */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </motion.div>
  );
}
