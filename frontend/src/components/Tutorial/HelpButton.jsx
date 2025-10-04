import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaQuestion, FaHandPointer, FaTimes, FaLightbulb } from 'react-icons/fa';
import './HelpButton.css';

const HelpButton = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    // Mostrar el botón después de 5 segundos de estar en la página
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  const handleClick = () => {
    window.dispatchEvent(new CustomEvent('open-tutorial'));
  };

  const handleMouseEnter = () => {
    setShowTooltip(true);
  };

  const handleMouseLeave = () => {
    setShowTooltip(false);
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0 }}
        className="help-button-container"
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          zIndex: 999
        }}
      >
        {/* Tooltip */}
        <AnimatePresence>
          {showTooltip && (
            <motion.div
              initial={{ opacity: 0, x: 10, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 10, scale: 0.8 }}
              className="help-tooltip"
              style={{
                position: 'absolute',
                bottom: '100%',
                right: '0',
                marginBottom: '10px',
                background: 'linear-gradient(135deg, #23272a, #2c2f33)',
                color: '#fff',
                padding: '12px 16px',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: '600',
                whiteSpace: 'nowrap',
                boxShadow: '0 8px 25px rgba(0, 0, 0, 0.3)',
                border: '1px solid rgba(114, 137, 218, 0.3)',
                maxWidth: '200px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FaLightbulb color="#FFD700" />
                <span>¿Necesitas ayuda?</span>
              </div>
              <div style={{ 
                fontSize: '12px', 
                opacity: 0.8, 
                marginTop: '4px',
                whiteSpace: 'normal'
              }}>
                Haz clic para ver el tutorial interactivo
              </div>
              {/* Flecha del tooltip */}
              <div style={{
                position: 'absolute',
                bottom: '-6px',
                right: '20px',
                width: '12px',
                height: '12px',
                background: '#23272a',
                border: '1px solid rgba(114, 137, 218, 0.3)',
                borderTop: 'none',
                borderLeft: 'none',
                transform: 'rotate(45deg)'
              }} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Botón principal */}
        <motion.button
          className="help-button"
          onClick={handleClick}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #7289da, #5865f2)',
            border: 'none',
            color: '#fff',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px',
            boxShadow: '0 4px 20px rgba(114, 137, 218, 0.4)',
            transition: 'all 0.3s ease',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <FaQuestion />
          
          {/* Efecto de pulso */}
          <motion.div
            className="help-pulse"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.7, 0, 0.7]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.3)',
              pointerEvents: 'none'
            }}
          />
        </motion.button>

        {/* Indicador de nueva funcionalidad */}
        <motion.div
          className="help-badge"
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 5, -5, 0]
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          style={{
            position: 'absolute',
            top: '-5px',
            right: '-5px',
            width: '20px',
            height: '20px',
            borderRadius: '50%',
            background: '#ff4757',
            color: '#fff',
            fontSize: '12px',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '2px solid #fff',
            boxShadow: '0 2px 8px rgba(255, 71, 87, 0.4)'
          }}
        >
          !
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default HelpButton;
