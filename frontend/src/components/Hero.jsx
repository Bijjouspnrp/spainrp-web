import React from 'react';
import './Hero.css';
import { FaDiscord, FaUsers, FaArrowRight } from 'react-icons/fa';

const Hero = ({ memberCount, loading }) => {
  return (
    <section id="home" className="hero">
      <div className="hero-background">
        <div className="hero-particles"></div>
      </div>
      
      <div className="container">
        <div className="hero-content">
          <div className="hero-left">
            <div className="hero-badge">
              <FaUsers />
              <span>Servidor Oficial</span>
            </div>
            
            <h1 className="hero-title">
              El Mejor Servidor de
              <span className="hero-highlight"> Roleplay</span>
              <br />
              en España
            </h1>
            
            <p className="hero-description">
              Únete a la comunidad más grande de roleplay en ERLC. 
              Vive experiencias únicas, forma parte de historias épicas 
              y conoce a jugadores de toda España.
            </p>
            
            <div className="hero-stats">
              <div className="stat-item">
                <div className="stat-number">
                  {loading ? (
                    <div className="loading-dots">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  ) : (
                    memberCount.toLocaleString()
                  )}
                </div>
                <div className="stat-label">Miembros Activos</div>
              </div>
              
              <div className="stat-item">
                <div className="stat-number">24/7</div>
                <div className="stat-label">Servidor Online</div>
              </div>
              
              <div className="stat-item">
                <div className="stat-number">100+</div>
                <div className="stat-label">Roles Únicos</div>
              </div>
            </div>
            
            <div className="hero-actions">
              <a 
                href="https://discord.gg/sMzFgFQHXA" 
                target="_blank" 
                rel="noopener noreferrer"
                className="btn btn-primary hero-btn-primary"
              >
                <FaDiscord />
                Unirse a Discord
                <FaArrowRight />
              </a>
              
              <a href="#features" className="btn btn-secondary hero-btn-secondary">
                Ver Características
              </a>
            </div>
          </div>
          
          <div className="hero-right" id="support">
            <div className="hero-visual">
              <div className="welcome-avatar-container">
                <img 
                  src="https://i.imgur.com/a4M49st.png" 
                  alt="Bienvenidos a SpainRP" 
                  className="welcome-avatar"
                />
                <div className="welcome-message">
                  <h3>¡Bienvenidos a SpainRP!</h3>
                  <p>El mejor servidor de roleplay en España</p>
                </div>
              </div>
              
              <div className="hero-card">
                <img 
                  src="https://images-ext-1.discordapp.net/external/9AUl789BvvLPVrMc3ke0P1xErcf9j2yCaRv5xW9kYik/%3Fsize%3D4096/https/cdn.discordapp.com/icons/1212556680911650866/621541c6d893bed04084ae171e5f1efc.png?format=webp&quality=lossless" 
                  alt="SpainRP Server" 
                  className="hero-server-icon"
                />
                <div className="hero-card-content">
                  <h3>SpainRP ERLC</h3>
                  <p>Servidor de Roleplay</p>
                  <div className="hero-card-status">
                    <div className="status-dot online"></div>
                    <span>Online</span>
                  </div>
                </div>
              </div>
              
              <div className="floating-elements">
                <div className="floating-card float-card-1">
                  <FaUsers />
                  <span>Comunidad Activa</span>
                </div>
                <div className="floating-card float-card-2">
                  <FaDiscord />
                  <span>Integración Total</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero; 