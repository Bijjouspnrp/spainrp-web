import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaDesktop, FaMobile, FaExclamationTriangle, FaRocket } from 'react-icons/fa';
import './MobileBetaWarning.css';

const MobileBetaWarning = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Detectar si es móvil o tablet
    const checkDevice = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
      const isTablet = /ipad|android(?!.*mobile)/i.test(userAgent);
      const screenWidth = window.innerWidth;
      
      // Considerar móvil si es menor a 1024px o es un dispositivo móvil/tablet
      const isMobileOrTablet = isMobileDevice || isTablet || screenWidth < 1024;
      
      setIsMobile(isMobileOrTablet);
      
      // Verificar si ya se mostró el aviso
      const hasSeenWarning = localStorage.getItem('spainrp_mobile_beta_warning_seen');
      
      if (isMobileOrTablet && !hasSeenWarning) {
        // Pequeño delay para que la página se cargue
        setTimeout(() => {
          setIsVisible(true);
        }, 1500);
      }
    };

    checkDevice();
    
    // Escuchar cambios de tamaño de pantalla
    const handleResize = () => {
      checkDevice();
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    // Marcar como visto para no mostrar de nuevo
    localStorage.setItem('spainrp_mobile_beta_warning_seen', 'true');
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="mobile-beta-overlay"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 50 }}
          transition={{ 
            type: "spring", 
            stiffness: 300, 
            damping: 30 
          }}
          className="mobile-beta-modal"
        >
          {/* Header del modal */}
          <div className="mobile-beta-header">
            <div className="mobile-beta-icon">
              <FaExclamationTriangle />
            </div>
            <h2 className="mobile-beta-title">
              Versión Beta - Dispositivo Móvil Detectado
            </h2>
            <button 
              className="mobile-beta-close"
              onClick={handleClose}
              aria-label="Cerrar aviso"
            >
              <FaTimes />
            </button>
          </div>

          {/* Contenido del modal */}
          <div className="mobile-beta-content">
            <div className="mobile-beta-warning">
              <FaRocket className="warning-icon" />
              <p className="warning-text">
                <strong>BijjouPro08</strong>, propietario de SpainRP, te informa que la página web está actualmente en <strong>versión beta</strong>.
              </p>
            </div>

            <div className="mobile-beta-info">
              <div className="info-item">
                <FaMobile className="info-icon mobile-icon" />
                <div className="info-content">
                  <h3>Dispositivo Móvil/Tablet</h3>
                  <p>Has accedido desde un dispositivo móvil o tablet. La experiencia puede no ser óptima.</p>
                </div>
              </div>

              <div className="info-item">
                <FaDesktop className="info-icon desktop-icon" />
                <div className="info-content">
                  <h3>Recomendación</h3>
                  <p>Para la mejor experiencia, te recomendamos usar la página desde un <strong>ordenador de escritorio</strong> o <strong>laptop</strong>.</p>
                </div>
              </div>
            </div>

            <div className="mobile-beta-features">
              <h4>¿Por qué usar en PC?</h4>
              <ul>
                <li>✅ Interfaz completa y optimizada</li>
                <li>✅ Mejor rendimiento y velocidad</li>
                <li>✅ Todas las funciones disponibles</li>
                <li>✅ Experiencia de usuario superior</li>
              </ul>
            </div>

            <div className="mobile-beta-note">
              <p>
                <strong>Nota:</strong> Puedes continuar usando la página en tu dispositivo actual, 
                pero algunas funciones pueden no estar disponibles o funcionar de manera limitada.
              </p>
            </div>
          </div>

          {/* Footer del modal */}
          <div className="mobile-beta-footer">
            <button 
              className="mobile-beta-continue"
              onClick={handleClose}
            >
              Entendido, continuar en móvil
            </button>
            <button 
              className="mobile-beta-desktop"
              onClick={() => {
                // Abrir en nueva ventana con mensaje
                window.open(window.location.href, '_blank');
                handleClose();
              }}
            >
              Abrir en PC
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default MobileBetaWarning;
