import React, { useState, useEffect } from 'react';
import { FaDiscord, FaTelegram, FaEnvelope, FaQuestionCircle, FaHeadset, FaBug, FaCog, FaShieldAlt, FaGamepad, FaComments } from 'react-icons/fa';
import './Support.css';

const Support = () => {
  const [isMobile, setIsMobile] = useState(false);

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
      description: 'Únete a nuestro servidor de Discord para soporte en tiempo real',
      icon: <FaDiscord />,
      color: '#7289da',
      action: 'Unirse al Discord',
      link: 'https://discord.gg/spainrp',
      popular: true
    },
    {
      id: 'telegram',
      title: 'Telegram',
      description: 'Canal oficial de Telegram para noticias y soporte',
      icon: <FaTelegram />,
      color: '#0088cc',
      action: 'Unirse a Telegram',
      link: 'https://t.me/spainrp',
      popular: false
    },
    {
      id: 'email',
      title: 'Email',
      description: 'Contacto directo por correo electrónico',
      icon: <FaEnvelope />,
      color: '#e74c3c',
      action: 'Enviar Email',
      link: 'mailto:soporte@spainrp.com',
      popular: false
    }
  ];

  const helpCategories = [
    {
      id: 'general',
      title: 'General',
      icon: <FaQuestionCircle />,
      color: '#3498db',
      items: [
        '¿Cómo me uno al servidor?',
        '¿Cuáles son las reglas?',
        '¿Cómo obtengo roles?',
        '¿Problemas de conexión?'
      ]
    },
    {
      id: 'technical',
      title: 'Técnico',
      icon: <FaCog />,
      color: '#f39c12',
      items: [
        'Problemas con el launcher',
        'Errores de instalación',
        'Problemas de rendimiento',
        'Configuración de audio'
      ]
    },
    {
      id: 'gameplay',
      title: 'Gameplay',
      icon: <FaGamepad />,
      color: '#2ecc71',
      items: [
        '¿Cómo funciona el sistema de trabajo?',
        '¿Cómo compro vehículos?',
        '¿Cómo funciona la economía?',
        '¿Cómo reporto a un jugador?'
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
        '¿Cómo contacto con staff?'
      ]
    }
  ];

  const faqItems = [
    {
      question: '¿Cómo me uno al servidor de Discord?',
      answer: 'Haz clic en el botón "Unirse al Discord" y sigue las instrucciones para verificar tu cuenta.'
    },
    {
      question: '¿Cuáles son los requisitos del servidor?',
      answer: 'Necesitas tener FiveM instalado, Discord, y seguir las reglas del servidor.'
    },
    {
      question: '¿Cómo obtengo el rol de Criminal?',
      answer: 'Ve al canal #roles en Discord y reacciona con el emoji correspondiente.'
    },
    {
      question: '¿Qué hago si tengo problemas técnicos?',
      answer: 'Contacta con nuestro equipo técnico a través de Discord o crea un ticket de soporte.'
    },
    {
      question: '¿Cómo reporto a un jugador?',
      answer: 'Usa el comando /report en el juego o contacta con un moderador en Discord.'
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
            Encuentra ayuda, contacta con nuestro equipo y resuelve tus dudas
          </p>
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