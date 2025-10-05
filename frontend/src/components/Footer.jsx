import React from 'react';
import './Footer.css';
import { FaDiscord, FaTwitter, FaYoutube, FaInstagram, FaTiktok, FaHeart } from 'react-icons/fa';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    'Servidor': [
      { name: 'Inicio', href: '#home' },
      { name: 'Características', href: '#features' },
      { name: 'Discord', href: '#discord' },
      { name: 'Sobre Nosotros', href: '#about' }
    ],
    'Comunidad': [
      { name: 'Reglas', href: '/rules' },
      { name: 'Eventos', href: '#events' },
      { name: 'Soporte', href: '#support' },
      { name: 'FAQ', href: '#faq' }
    ],
    'Legal': [
      { name: 'Términos de Servicio', href: '/terms' },
      { name: 'Política de Privacidad', href: '/terms#privacy' },
      { name: 'Cookies', href: '/cookies' }
    ]
  };

  const socialLinks = [
    { icon: <FaDiscord />, href: 'https://discord.gg/sMzFgFQHXA', label: 'Discord', enabled: true },
    { icon: <FaInstagram />, href: 'https://www.instagram.com/spainrp_oficial/', label: 'Instagram', enabled: true },
    { icon: <FaTiktok />, href: 'https://www.tiktok.com/@spainrpoficialv21?_t=ZN-90IhRLfCMze&_r=1', label: 'TikTok', enabled: true },
    { icon: <FaTwitter />, href: '#', label: 'Twitter', enabled: false },
    { icon: <FaYoutube />, href: '#', label: 'YouTube', enabled: false }
  ];

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-brand">
            <div className="footer-logo">
              <img 
                src="/assets/spainrplogo.png" 
                alt="SpainRP Logo" 
                className="footer-logo-img"
              />
              <div>
                <h3>SpainRP</h3>
                <p>El mejor servidor de roleplay en España</p>
              </div>
            </div>
            
            <p className="footer-description">
              Únete a la comunidad más grande de roleplay en ERLC. 
              Vive experiencias únicas y forma parte de historias épicas.
            </p>
            
            <div className="footer-social">
              {socialLinks.map((social, index) => (
                social.enabled ? (
                  <a 
                    key={index}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="social-link"
                    aria-label={social.label}
                  >
                    {social.icon}
                  </a>
                ) : (
                  <span 
                    key={index}
                    className="social-link disabled"
                    aria-label={`${social.label} - No disponible`}
                    title={`${social.label} - No disponible`}
                  >
                    {social.icon}
                  </span>
                )
              ))}
            </div>
          </div>
          
          <div className="footer-links">
            {Object.entries(footerLinks).map(([category, links]) => (
              <div key={category} className="footer-section">
                <h4>{category}</h4>
                <ul>
                  {links.map((link, index) => (
                    <li key={index}>
                      <a href={link.href}>{link.name}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        
        <div className="footer-bottom">
          <div className="footer-bottom-content">
            <p className="footer-copyright">
              © {currentYear} SpainRP. Todos los derechos reservados.
            </p>
            <p className="footer-made-with">
              Hecho con <FaHeart className="heart-icon" /> en España
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 