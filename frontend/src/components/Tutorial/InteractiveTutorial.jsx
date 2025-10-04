import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaArrowRight, 
  FaArrowLeft, 
  FaTimes, 
  FaPlay, 
  FaPause, 
  FaHome, 
  FaAppStore, 
  FaUser, 
  FaBell,
  FaGamepad,
  FaStore,
  FaNewspaper,
  FaDiscord,
  FaChevronRight,
  FaHandPointer,
  FaMousePointer,
  FaKeyboard,
  FaMobile
} from 'react-icons/fa';
import './InteractiveTutorial.css';

// Hook para detectar el tamaño de pantalla
const useScreenSize = () => {
  const [screenSize, setScreenSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
    isMobile: window.innerWidth <= 768,
    isTablet: window.innerWidth > 768 && window.innerWidth <= 1024,
    isDesktop: window.innerWidth > 1024
  });

  useEffect(() => {
    const handleResize = () => {
      setScreenSize({
        width: window.innerWidth,
        height: window.innerHeight,
        isMobile: window.innerWidth <= 768,
        isTablet: window.innerWidth > 768 && window.innerWidth <= 1024,
        isDesktop: window.innerWidth > 1024
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return screenSize;
};

const InteractiveTutorial = ({ isOpen, onClose, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showHand, setShowHand] = useState(false);
  const [highlightedElement, setHighlightedElement] = useState(null);
  const overlayRef = useRef(null);
  const handRef = useRef(null);
  const screenSize = useScreenSize();

  // Datos del tutorial
  const tutorialSteps = [
    {
      id: 'welcome',
      title: '¡Bienvenido a SpainRP!',
      description: 'Te vamos a enseñar las funciones principales de nuestra plataforma',
      icon: <FaHome />,
      type: 'welcome',
      position: 'center',
      action: null
    },
    {
      id: 'navbar',
      title: 'Barra de Navegación',
      description: 'Aquí puedes navegar por las diferentes secciones de la página',
      icon: <FaMousePointer />,
      type: 'highlight',
      position: 'top',
      action: 'highlight-navbar',
      target: '.navbar-container',
      handPosition: { x: 50, y: 20 }
    },
    {
      id: 'apps-menu',
      title: 'Menú de Apps',
      description: 'Accede a todas las aplicaciones RP: Tinder, Banco, Minijuegos, MDT Policial',
      icon: <FaAppStore />,
      type: 'highlight',
      position: 'top-right',
      action: 'highlight-apps',
      target: '[data-tutorial="apps-dropdown"]',
      handPosition: { x: 80, y: 15 }
    },
    {
      id: 'user-panel',
      title: 'Panel de Usuario',
      description: 'Gestiona tu perfil, ve tus estadísticas y configura tu cuenta',
      icon: <FaUser />,
      type: 'highlight',
      position: 'top-right',
      action: 'highlight-user',
      target: '[data-tutorial="user-panel"]',
      handPosition: { x: 85, y: 20 }
    },
    {
      id: 'notifications',
      title: 'Sistema de Notificaciones',
      description: 'Recibe alertas importantes y mantente al día con la comunidad',
      icon: <FaBell />,
      type: 'highlight',
      position: 'top-right',
      action: 'highlight-notifications',
      target: '[data-tutorial="notifications"]',
      handPosition: { x: 90, y: 25 }
    },
    {
      id: 'main-features',
      title: 'Características Principales',
      description: 'Descubre las funciones únicas de SpainRP: BlackMarket, StockMarket, Minijuegos',
      icon: <FaGamepad />,
      type: 'highlight',
      position: 'center',
      action: 'highlight-features',
      target: '#features',
      handPosition: { x: 50, y: 60 }
    },
    {
      id: 'discord-integration',
      title: 'Integración con Discord',
      description: 'Conecta tu cuenta de Discord para acceder a todas las funciones',
      icon: <FaDiscord />,
      type: 'highlight',
      position: 'center',
      action: 'highlight-discord',
      target: '#discord',
      handPosition: { x: 50, y: 80 }
    },
    {
      id: 'mobile-tips',
      title: 'Consejos para Móvil',
      description: 'En móvil, usa el menú hamburguesa para acceder a todas las funciones',
      icon: <FaMobile />,
      type: 'tip',
      position: 'center',
      action: 'highlight-mobile',
      target: '.navbar-toggle',
      handPosition: { x: 20, y: 15 }
    },
    {
      id: 'complete',
      title: '¡Tutorial Completado!',
      description: 'Ya conoces las funciones principales. ¡Disfruta explorando SpainRP!',
      icon: <FaChevronRight />,
      type: 'complete',
      position: 'center',
      action: null
    }
  ];

  // Definir currentStepData antes de usarlo
  const currentStepData = tutorialSteps[currentStep];

  // Función para detectar elementos de forma robusta
  const detectElement = (selector) => {
    if (!selector) return null;
    
    // Intentar múltiples métodos de detección
    let element = document.querySelector(selector);
    
    // Si no se encuentra, intentar con data-tutorial
    if (!element) {
      element = document.querySelector(`[data-tutorial="${selector}"]`);
    }
    
    // Si aún no se encuentra, intentar con ID
    if (!element && selector.startsWith('#')) {
      element = document.getElementById(selector.substring(1));
    }
    
    // Si aún no se encuentra, intentar con clase
    if (!element && selector.startsWith('.')) {
      element = document.querySelector(selector);
    }
    
    return element;
  };

  // Definir nextStep antes de usarlo en useEffect
  const nextStep = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(prev => prev + 1);
      setShowHand(false);
      setHighlightedElement(null);
      
      // Mostrar mano después de un breve delay
      setTimeout(() => {
        setShowHand(true);
      }, 300);
    } else {
      completeTutorial();
    }
  };

  // Efectos de animación
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0);
      setIsPlaying(false);
      setShowHand(false);
      setHighlightedElement(null);
    }
  }, [isOpen]);

  // Auto-play del tutorial
  useEffect(() => {
    if (isPlaying && currentStep < tutorialSteps.length - 1) {
      const timer = setTimeout(() => {
        nextStep();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [isPlaying, currentStep, nextStep, tutorialSteps.length]);

  // Efecto de la mano y detección de elementos
  useEffect(() => {
    if (showHand && handRef.current) {
      const hand = handRef.current;
      hand.style.opacity = '1';
      hand.style.transform = 'scale(1)';
      
      // Animación de apuntar
      setTimeout(() => {
        hand.style.animation = 'pointing 1s ease-in-out infinite';
      }, 500);
    }

    // Detectar y destacar elementos
    if (currentStepData && currentStepData.target) {
      const element = detectElement(currentStepData.target);
      if (element) {
        const rect = element.getBoundingClientRect();
        setHighlightedElement({
          top: rect.top + window.scrollY,
          left: rect.left + window.scrollX,
          width: rect.width,
          height: rect.height
        });
      } else {
        setHighlightedElement(null);
      }
    } else {
      setHighlightedElement(null);
    }
  }, [showHand, currentStepData]);

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
      setShowHand(false);
      setHighlightedElement(null);
      
      setTimeout(() => {
        setShowHand(true);
      }, 300);
    }
  };

  const completeTutorial = () => {
    localStorage.setItem('spainrp_tutorial_completed', 'true');
    localStorage.setItem('spainrp_tutorial_completed_date', new Date().toISOString());
    onComplete();
    onClose();
  };

  const skipTutorial = () => {
    localStorage.setItem('spainrp_tutorial_skipped', 'true');
    localStorage.setItem('spainrp_tutorial_skipped_date', new Date().toISOString());
    onClose();
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const progress = ((currentStep + 1) / tutorialSteps.length) * 100;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="tutorial-overlay"
        ref={overlayRef}
      >
        {/* Overlay de fondo */}
        <div className="tutorial-backdrop" />
        
        {/* Elemento destacado */}
        {highlightedElement && (
          <div 
            className="tutorial-highlight"
            style={{
              position: 'absolute',
              top: highlightedElement.top,
              left: highlightedElement.left,
              width: highlightedElement.width,
              height: highlightedElement.height,
              borderRadius: '8px',
              border: '3px solid #7289da',
              boxShadow: '0 0 20px rgba(114, 137, 218, 0.5)',
              zIndex: 1001,
              pointerEvents: 'none'
            }}
          />
        )}

        {/* Mano apuntadora */}
        {showHand && (
          <motion.div
            ref={handRef}
            className="tutorial-hand"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{
              position: 'absolute',
              left: `${currentStepData.handPosition?.x || 50}%`,
              top: `${currentStepData.handPosition?.y || 50}%`,
              transform: 'translate(-50%, -50%)',
              zIndex: 1002,
              pointerEvents: 'none'
            }}
          >
            <FaHandPointer size={32} color="#7289da" />
          </motion.div>
        )}

        {/* Panel del tutorial */}
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.9 }}
          className="tutorial-panel"
          style={{
            position: 'absolute',
            top: screenSize.isMobile ? 
                 (currentStepData.position === 'top' ? '10%' : 
                  currentStepData.position === 'center' ? '50%' : '80%') :
                 (currentStepData.position === 'top' ? '15%' : 
                  currentStepData.position === 'center' ? '50%' : '75%'),
            left: screenSize.isMobile ? '50%' :
                  currentStepData.position === 'top-right' ? '65%' : '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 1003,
            maxHeight: screenSize.isMobile ? '85vh' : '80vh',
            overflowY: 'auto',
            width: screenSize.isMobile ? '95vw' : 
                   screenSize.isTablet ? '90vw' : '500px'
          }}
        >
          {/* Header del tutorial */}
          <div className="tutorial-header">
            <div className="tutorial-icon">
              {currentStepData.icon}
            </div>
            <div className="tutorial-title-section">
              <h2 className="tutorial-title">{currentStepData.title}</h2>
              <div className="tutorial-progress">
                <div className="progress-bar">
                  <div 
                    className="progress-fill"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <span className="progress-text">
                  {currentStep + 1} de {tutorialSteps.length}
                </span>
              </div>
            </div>
            <button 
              className="tutorial-close"
              onClick={skipTutorial}
              title="Saltar tutorial"
            >
              <FaTimes />
            </button>
          </div>

          {/* Contenido del tutorial */}
          <div className="tutorial-content">
            <p className="tutorial-description">
              {currentStepData.description}
            </p>

            {/* Indicadores visuales */}
            {currentStepData.type === 'highlight' && (
              <div className="tutorial-indicators">
                <div className="indicator-item">
                  <FaMousePointer />
                  <span>Haz clic aquí</span>
                </div>
                {currentStepData.action === 'highlight-apps' && (
                  <div className="indicator-item">
                    <FaAppStore />
                    <span>Explora las apps</span>
                  </div>
                )}
              </div>
            )}

            {currentStepData.type === 'tip' && (
              <div className="tutorial-tip">
                <div className="tip-icon">💡</div>
                <div className="tip-content">
                  <strong>Consejo:</strong> En móvil, desliza hacia la derecha para abrir el menú
                </div>
              </div>
            )}
          </div>

          {/* Controles del tutorial */}
          <div className="tutorial-controls">
            <div className="tutorial-buttons">
              <button
                className="tutorial-btn secondary"
                onClick={prevStep}
                disabled={currentStep === 0}
              >
                <FaArrowLeft />
                Anterior
              </button>

              <button
                className="tutorial-btn play-pause"
                onClick={togglePlayPause}
                title={isPlaying ? 'Pausar' : 'Reproducir automáticamente'}
              >
                {isPlaying ? <FaPause /> : <FaPlay />}
                {isPlaying ? 'Pausar' : 'Auto-play'}
              </button>

              <button
                className="tutorial-btn primary"
                onClick={currentStep === tutorialSteps.length - 1 ? completeTutorial : nextStep}
              >
                {currentStep === tutorialSteps.length - 1 ? 'Finalizar' : 'Siguiente'}
                <FaArrowRight />
              </button>
            </div>

            <div className="tutorial-actions">
              <button
                className="tutorial-skip"
                onClick={skipTutorial}
              >
                Saltar tutorial
              </button>
            </div>
          </div>
        </motion.div>

        {/* Puntos de navegación */}
        <div className="tutorial-dots">
          {tutorialSteps.map((_, index) => (
            <button
              key={index}
              className={`tutorial-dot ${index === currentStep ? 'active' : ''}`}
              onClick={() => setCurrentStep(index)}
            />
          ))}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default InteractiveTutorial;
