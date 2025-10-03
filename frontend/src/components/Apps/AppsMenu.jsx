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
    desc: 'Conoce gente y rolea en el mundo SpainRP.'
  },
  {
    name: 'Banco Central RP',
    icon: <FaPiggyBank style={{ color: '#00cdbc' }} />,
    url: '/apps/banco',
    color: '#00cdbc',
    desc: 'Gestiona tu dinero RP, deposita y retira fondos.'
  },
  {
    name: 'Minijuegos RP',
    icon: <FaGamepad style={{ color: '#7289da' }} />,
    url: '/apps/minijuegos',
    color: '#7289da',
    desc: 'Juega minijuegos solo o con otros usuarios de Discord.'
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
    <div className="apps-bg" style={{minHeight:'100vh',background:'#181a20',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'2rem 0'}}>
      <DiscordUserBar />
      <div className="phone-mockup">
        <div className="phone-notch" />
        <div className="phone-content">
          <div className="apps-header">
            <span>APPS SPAINRP</span>
          </div>
          {!user ? (
            <div className="apps-login-block">
              <h2>Debes iniciar sesión con Discord para acceder a las Apps.</h2>
              <a href="/auth/login" className="apps-login-btn">Iniciar sesión</a>
              <div className="apps-footer">
                <span>Acceso solo para usuarios logueados Discord. Apps avanzadas.</span>
              </div>
            </div>
          ) : (
            <div className="apps-menu-list">
              <h2 className="apps-menu-title">Apps RP</h2>
              <ul className="apps-menu-ul">
                {appList.map(app => (
                  <li key={app.name} className="apps-menu-li">
                    <a href={app.url} target="_blank" rel="noopener noreferrer" className="apps-menu-link" style={{'--app-color': app.color}}>
                      <span className="apps-menu-icon" style={{display:'flex',alignItems:'center',fontSize:'2.1rem'}}>{app.icon}</span>
                      <span className="apps-menu-info">
                        <span className="apps-menu-name">{app.name}</span>
                        <span className="apps-menu-desc">{app.desc}</span>
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
      <style>{`
        .phone-mockup {
          width: 340px;
          max-width: 95vw;
          background: #23272a;
          border-radius: 32px;
          box-shadow: 0 8px 32px #0008, 0 1.5px 0 #fff2 inset;
          border: 2.5px solid #23272a;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          align-items: stretch;
          min-height: 600px;
        }
        .phone-notch {
          width: 120px;
          height: 18px;
          background: #181a20;
          border-radius: 0 0 16px 16px;
          margin: 0 auto 8px auto;
        }
        .phone-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: flex-start;
          align-items: stretch;
          padding: 1.5rem 1.2rem 1.2rem 1.2rem;
        }
        .apps-header {
          text-align: center;
          font-size: 1.3rem;
          font-weight: 700;
          color: #fff;
          margin-bottom: 1.2rem;
          letter-spacing: 1.5px;
        }
        .apps-login-block {
          text-align: center;
          color: #fff;
          margin-top: 80px;
        }
        .apps-login-btn {
          display: inline-block;
          background: #7289da;
          color: #fff;
          border-radius: 8px;
          padding: 0.7rem 1.5rem;
          font-weight: 700;
          text-decoration: none;
          font-size: 1.2rem;
          margin-top: 1.2rem;
          transition: background 0.2s;
        }
        .apps-login-btn:hover {
          background: #5865f2;
        }
        .apps-footer {
          margin-top: 2.5rem;
          color: #b9bbbe;
          font-size: 0.95rem;
        }
        .apps-menu-list {
          margin-top: 0.5rem;
        }
        .apps-menu-title {
          color: #fff;
          font-size: 1.2rem;
          font-weight: 700;
          margin-bottom: 1.2rem;
          text-align: center;
        }
        .apps-menu-ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        .apps-menu-li {
          margin-bottom: 1.1rem;
        }
        .apps-menu-link {
          display: flex;
          align-items: center;
          background: #23272a;
          border-radius: 16px;
          padding: 1rem 1.1rem;
          color: #fff;
          text-decoration: none;
          box-shadow: 0 2px 8px #0002;
          border: 2px solid var(--app-color, #7289da);
          transition: box-shadow 0.18s, border 0.18s, background 0.18s;
        }
        .apps-menu-link:hover {
          background: var(--app-color, #7289da);
          color: #fff;
          box-shadow: 0 4px 16px var(--app-color, #7289da33);
        }
        .apps-menu-icon {
          font-size: 2.1rem;
          margin-right: 1.1rem;
          flex-shrink: 0;
        }
        .apps-menu-info {
          display: flex;
          flex-direction: column;
        }
        .apps-menu-name {
          font-size: 1.1rem;
          font-weight: 600;
        }
        .apps-menu-desc {
          font-size: 0.97rem;
          color: #b9bbbe;
        }
        @media (max-width: 500px) {
          .phone-mockup {
            width: 99vw;
            min-height: 90vh;
            border-radius: 0;
            box-shadow: none;
            border: none;
          }
          .phone-content {
            padding: 1.1rem 0.5rem 1.1rem 0.5rem;
          }
        }
      `}</style>
    </div>
  );
};

export default AppsMenu;
