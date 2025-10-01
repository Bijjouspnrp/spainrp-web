import React, { useState, useEffect } from 'react';
import { 
  FaDiscord, 
  FaTelegram, 
  FaEnvelope, 
  FaQuestionCircle, 
  FaHeadset, 
  FaBug, 
  FaCog, 
  FaShieldAlt, 
  FaGamepad, 
  FaComments,
  FaTicketAlt,
  FaUserSecret,
  FaGavel,
  FaBuilding,
  FaMoneyBillWave,
  FaCar,
  FaUserTie,
  FaExclamationTriangle,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaVideo,
  FaStream,
  FaYoutube,
  FaTwitch
} from 'react-icons/fa';
import './Support.css';

const Support = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [activeTab, setActiveTab] = useState('general');

  // Detección de móvil
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const supportOptions = [
    {
      id: 'discord',
      title: 'Discord',
      description: 'Servidor principal de SpainRP con soporte en tiempo real y canales especializados',
      icon: <FaDiscord />,
      color: '#7289da',
      action: 'Unirse al Discord',
      link: 'https://discord.gg/sMzFgFQHXA',
      popular: true,
      features: ['Soporte 24/7', 'Canales de ayuda', 'Tickets automáticos', 'Comunidad activa']
    },
    {
      id: 'tickets',
      title: 'Sistema de Tickets',
      description: 'Crea tickets para reportar problemas, sanciones o solicitar ayuda específica',
      icon: <FaTicketAlt />,
      color: '#f39c12',
      action: 'Crear Ticket',
      link: '#tickets',
      popular: false,
      features: ['Reporte de bugs', 'Apelaciones', 'Solicitudes especiales', 'Seguimiento en tiempo real']
    },
    {
      id: 'email',
      title: 'Email de Emergencia',
      description: 'Para casos urgentes o problemas críticos que requieren atención inmediata',
      icon: <FaEnvelope />,
      color: '#e74c3c',
      action: 'Enviar Email',
      link: 'mailto:admin@spainrp.com',
      popular: false,
      features: ['Respuesta rápida', 'Casos urgentes', 'Problemas técnicos', 'Contacto directo']
    }
  ];

  const helpCategories = [
    {
      id: 'general',
      title: 'General',
      icon: <FaQuestionCircle />,
      color: '#3498db',
      items: [
        '¿Cómo me uno al servidor de ERLC?',
        '¿Cuáles son las reglas de SpainRP?',
        '¿Cómo obtengo el rol de Criminal?',
        '¿Problemas de conexión al servidor?',
        '¿Cómo funciona el sistema de roles?'
      ]
    },
    {
      id: 'roleplay',
      title: 'Roleplay',
      icon: <FaUserSecret />,
      color: '#9b59b6',
      items: [
        '¿Qué es MetaGaming y PowerGaming?',
        '¿Cómo funciona el sistema de PK/PKT/CK?',
        '¿Cuáles son las reglas de conducción?',
        '¿Cómo reporto a un jugador?',
        '¿Qué hacer tras una muerte en rol?'
      ]
    },
    {
      id: 'economy',
      title: 'Economía',
      icon: <FaMoneyBillWave />,
      color: '#2ecc71',
      items: [
        '¿Cómo funciona el sistema de trabajo?',
        '¿Cómo compro vehículos y propiedades?',
        '¿Cómo gestiono mi empresa?',
        '¿Cómo pago multas?',
        '¿Cómo funciona el sistema de sueldos?'
      ]
    },
    {
      id: 'technical',
      title: 'Técnico',
      icon: <FaCog />,
      color: '#f39c12',
      items: [
        'Problemas con FiveM',
        'Errores de instalación de mods',
        'Problemas de rendimiento',
        'Configuración de audio y micrófono',
        'Problemas con el launcher'
      ]
    },
    {
      id: 'moderation',
      title: 'Moderación',
      icon: <FaShieldAlt />,
      color: '#e74c3c',
      items: [
        '¿Cómo apelo una sanción?',
        '¿Cómo reporto un bug?',
        '¿Cómo solicito un desban?',
        '¿Cómo contacto con staff?',
        '¿Qué hacer si me banean injustamente?'
      ]
    },
    {
      id: 'jobs',
      title: 'Trabajos y Empresas',
      icon: <FaBuilding />,
      color: '#34495e',
      items: [
        '¿Cómo creo una empresa?',
        '¿Cuáles son los requisitos para empresas?',
        '¿Cómo contrato empleados?',
        '¿Cómo gestiono sueldos y gastos?',
        '¿Qué trabajos están disponibles?'
      ]
    }
  ];

  const faqItems = [
    {
      question: '¿Cómo me uno al servidor de ERLC SpainRP?',
      answer: 'Necesitas tener FiveM instalado, unirse a nuestro Discord, obtener el rol de Criminal y seguir las instrucciones de conexión en el canal #conexion.'
    },
    {
      question: '¿Cuáles son los requisitos para jugar?',
      answer: 'FiveM actualizado, Discord, micrófono funcional, edad mínima de 13 años y seguir todas las reglas del servidor.'
    },
    {
      question: '¿Cómo obtengo el rol de Criminal?',
      answer: 'Ve al canal #roles en Discord, lee las reglas y reacciona con el emoji correspondiente. El staff verificará tu solicitud.'
    },
    {
      question: '¿Qué es MetaGaming y PowerGaming?',
      answer: 'MetaGaming es usar información OOC (fuera del rol) en IC (dentro del rol). PowerGaming es forzar acciones irreales en el roleplay. Ambos están prohibidos.'
    },
    {
      question: '¿Cómo funciona el sistema de PK/PKT/CK?',
      answer: 'PK: Pierdes memoria del rol actual (35min espera). PKT: Pierdes memoria específica (1 día sin volver al grupo). CK: Muerte total del personaje (requiere aprobación staff).'
    },
    {
      question: '¿Cómo creo una empresa?',
      answer: 'Abre un ticket en Discord, completa la plantilla de empresa, cumple los requisitos (jefe ≥17 años, no tapadera ilegal) y espera la aprobación del staff.'
    },
    {
      question: '¿Qué hago si me banean injustamente?',
      answer: 'Crea un ticket de apelación en Discord con pruebas y explicación detallada. El staff revisará tu caso en un plazo de 24-48 horas.'
    },
    {
      question: '¿Cómo reporto bugs o problemas técnicos?',
      answer: 'Usa el comando /report en el juego, crea un ticket en Discord o contacta directamente con el equipo técnico en el canal #soporte-tecnico.'
    }
  ];

  const liveStreams = [
    {
      platform: 'YouTube',
      icon: <FaYoutube />,
      color: '#ff0000',
      title: 'SpainRP Oficial',
      description: 'Eventos en vivo, tutoriales y contenido exclusivo',
      link: 'https://youtube.com/@spainrp',
      schedule: 'Lunes, Miércoles, Viernes 20:00 CET'
    },
    {
      platform: 'Twitch',
      icon: <FaTwitch />,
      color: '#9146ff',
      title: 'SpainRP Live',
      description: 'Streams diarios del servidor y eventos especiales',
      link: 'https://twitch.tv/spainrp',
      schedule: 'Todos los días 18:00-22:00 CET'
    }
  ];

  const quickActions = [
    {
      title: 'Crear Ticket',
      icon: <FaTicketAlt />,
      color: '#f39c12',
      description: 'Reportar problemas o solicitar ayuda',
      action: () => window.open('https://discord.gg/sMzFgFQHXA', '_blank')
    },
    {
      title: 'Ver Reglas',
      icon: <FaGavel />,
      color: '#e74c3c',
      description: 'Consultar normativas del servidor',
      action: () => window.location.href = '/rules'
    },
    {
      title: 'Estado del Servidor',
      icon: <FaCheckCircle />,
      color: '#2ecc71',
      description: 'Verificar si el servidor está online',
      action: () => window.open('https://discord.gg/sMzFgFQHXA', '_blank')
    },
    {
      title: 'BlackMarket',
      icon: <FaUserSecret />,
      color: '#9b59b6',
      description: 'Acceder al mercado negro',
      action: () => window.location.href = '/blackmarket'
    }
  ];

  return (
    <div className="support-container">
      {/* Header */}
      <div className="support-header">
        <div className="support-header-content">
          <h1 className="support-title">
            <FaHeadset className="support-title-icon" />
            Centro de Soporte SpainRP
          </h1>
          <p className="support-subtitle">
            Servidor de Roleplay ERLC - Encuentra ayuda, contacta con nuestro equipo y resuelve tus dudas
          </p>
          <div className="support-badges">
            <span className="badge">ERLC Roleplay</span>
            <span className="badge">24/7 Online</span>
            <span className="badge">Comunidad Activa</span>
          </div>
        </div>
      </div>

      {/* Acciones Rápidas */}
      <div className="support-section">
        <h2 className="section-title">Acciones Rápidas</h2>
        <div className="quick-actions-grid">
          {quickActions.map((action, index) => (
            <div 
              key={index} 
              className="quick-action-card"
              onClick={action.action}
              style={{ '--accent-color': action.color }}
            >
              <div className="quick-action-icon" style={{ color: action.color }}>
                {action.icon}
              </div>
              <h3 className="quick-action-title">{action.title}</h3>
              <p className="quick-action-description">{action.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Canales de Contacto */}
      <div className="support-section">
        <h2 className="section-title">Canales de Contacto</h2>
        <div className="contact-grid">
          {supportOptions.map((option) => (
            <div 
              key={option.id} 
              className={`contact-card ${option.popular ? 'popular' : ''}`}
              style={{ '--accent-color': option.color }}
            >
              {option.popular && <div className="popular-badge">Más Popular</div>}
              <div className="contact-icon" style={{ color: option.color }}>
                {option.icon}
              </div>
              <h3 className="contact-title">{option.title}</h3>
              <p className="contact-description">{option.description}</p>
              <div className="contact-features">
                {option.features.map((feature, index) => (
                  <span key={index} className="feature-tag">{feature}</span>
                ))}
              </div>
              <a 
                href={option.link} 
                target="_blank" 
                rel="noopener noreferrer"
                className="contact-button"
                style={{ backgroundColor: option.color }}
              >
                {option.action}
              </a>
            </div>
          ))}
        </div>
      </div>

      {/* Categorías de Ayuda */}
      <div className="support-section">
        <h2 className="section-title">Categorías de Ayuda</h2>
        <div className="help-grid">
          {helpCategories.map((category) => (
            <div key={category.id} className="help-card">
              <div className="help-icon" style={{ color: category.color }}>
                {category.icon}
              </div>
              <h3 className="help-title">{category.title}</h3>
              <ul className="help-list">
                {category.items.map((item, index) => (
                  <li key={index} className="help-item">{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <div className="support-section">
        <h2 className="section-title">Preguntas Frecuentes</h2>
        <div className="faq-container">
          {faqItems.map((item, index) => (
            <div key={index} className="faq-item">
              <div className="faq-question">
                <FaComments className="faq-icon" />
                <span>{item.question}</span>
              </div>
              <div className="faq-answer">
                <p>{item.answer}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Streams en Vivo */}
      <div className="support-section">
        <h2 className="section-title">
          <FaVideo className="section-icon" />
          Contenido en Vivo
        </h2>
        <p className="section-subtitle">
          Sigue nuestros streams oficiales para eventos, tutoriales y contenido exclusivo
        </p>
        <div className="streams-grid">
          {liveStreams.map((stream, index) => (
            <div 
              key={index} 
              className="stream-card"
              style={{ '--accent-color': stream.color }}
            >
              <div className="stream-header">
                <div className="stream-icon" style={{ color: stream.color }}>
                  {stream.icon}
                </div>
                <div className="stream-info">
                  <h3 className="stream-title">{stream.title}</h3>
                  <p className="stream-platform">{stream.platform}</p>
                </div>
                <div className="live-indicator">
                  <span className="live-dot"></span>
                  <span>EN VIVO</span>
                </div>
              </div>
              <p className="stream-description">{stream.description}</p>
              <div className="stream-schedule">
                <FaClock className="schedule-icon" />
                <span>{stream.schedule}</span>
              </div>
              <a 
                href={stream.link} 
                target="_blank" 
                rel="noopener noreferrer"
                className="stream-button"
                style={{ backgroundColor: stream.color }}
              >
                <FaStream />
                Ver Ahora
              </a>
            </div>
          ))}
        </div>
      </div>

      {/* Footer de Soporte */}
      <div className="support-footer">
        <div className="support-footer-content">
          <h3>¿No encuentras lo que buscas?</h3>
          <p>Nuestro equipo está disponible 24/7 para ayudarte</p>
          <div className="support-footer-actions">
            <a 
              href="https://discord.gg/spainrp" 
              target="_blank" 
              rel="noopener noreferrer"
              className="footer-button primary"
            >
              <FaDiscord />
              Discord
            </a>
            <a 
              href="mailto:soporte@spainrp.com"
              className="footer-button secondary"
            >
              <FaEnvelope />
              Email
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Support;