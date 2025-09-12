import React from 'react';
import './Features.css';
import { 
  FaDiscord, 
  FaRobot, 
  FaIdCard, 
  FaMoneyBillAlt, 
  FaUserShield, 
  FaGamepad, 
  FaGavel,
  FaShieldAlt,
  FaUsers,
  FaCog,
  FaChartLine,
  FaHeadset
} from 'react-icons/fa';

const Features = () => {
  const features = [
    {
      icon: <FaDiscord />,
      title: 'Integración Discord',
      description: 'Conecta tu cuenta de Discord y accede a canales exclusivos, roles automáticos y notificaciones personalizadas.',
      color: '#7289da'
    },
    {
      icon: <FaRobot />,
      title: 'Bot Inteligente',
      description: 'Nuestro bot automatiza tareas, gestiona eventos y proporciona herramientas avanzadas para la comunidad.',
      color: '#4a90e2'
    },
    {
      icon: <FaIdCard />,
      title: 'Sistema de DNIs',
      description: 'Gestiona tus documentos de identidad digitales para el roleplay de forma segura y eficiente.',
      color: '#fbbf24'
    },
    {
      icon: <FaMoneyBillAlt />,
      title: 'Gestión de Multas',
      description: 'Consulta y paga tus multas de forma sencilla con nuestro sistema integrado de pagos.',
      color: '#4ade80'
    },
    {
      icon: <FaUserShield />,
      title: 'Sistema de Arrestos',
      description: 'Historial completo de arrestos y sistema de gestión policial integrado.',
      color: '#f87171'
    },
    {
      icon: <FaGamepad />,
      title: 'Minijuegos',
      description: 'Disfruta de juegos interactivos y minijuegos exclusivos para la comunidad SpainRP.',
      color: '#a855f7'
    },
    {
      icon: <FaGavel />,
      title: 'Poder Judicial',
      description: 'Acceso completo al sistema judicial, juicios y expedientes legales del servidor.',
      color: '#f59e0b'
    },
    {
      icon: <FaShieldAlt />,
      title: 'Seguridad Avanzada',
      description: 'Protección contra hackers y sistema de moderación automática para mantener la comunidad segura.',
      color: '#10b981'
    },
    {
      icon: <FaUsers />,
      title: 'Comunidad Activa',
      description: 'Únete a una comunidad vibrante con eventos regulares y actividades para todos los gustos.',
      color: '#8b5cf6'
    },
    {
      icon: <FaCog />,
      title: 'Personalización',
      description: 'Personaliza tu experiencia con configuraciones avanzadas y opciones de personalización.',
      color: '#6b7280'
    },
    {
      icon: <FaChartLine />,
      title: 'Estadísticas en Tiempo Real',
      description: 'Accede a estadísticas detalladas del servidor y tu actividad personal.',
      color: '#06b6d4'
    },
    {
      icon: <FaHeadset />,
      title: 'Soporte 24/7',
      description: 'Equipo de soporte disponible las 24 horas para ayudarte con cualquier problema.',
      color: '#ec4899'
    }
  ];

  return (
    <section id="features" className="features">
      <div className="container">
        <div className="features-header">
          <h2 className="features-title">
            Características <span className="highlight">Únicas</span>
          </h2>
          <p className="features-subtitle">
            Descubre todo lo que hace especial a SpainRP y por qué somos la mejor opción para tu experiencia de roleplay.
          </p>
        </div>

        <div className="features-grid">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="feature-card"
              style={{ '--feature-color': feature.color }}
            >
              <div className="feature-icon">
                {feature.icon}
              </div>
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-description">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features; 