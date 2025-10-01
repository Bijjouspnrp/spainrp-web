import React, { useState, useEffect } from 'react';
import { FaUserFriends, FaComments, FaUsers, FaCog, FaSignOutAlt } from 'react-icons/fa';
import ModeratorChatPanel from './ModeratorChatPanel';
import './ModeratorDashboard.css';

const ModeratorDashboard = () => {
  const [user, setUser] = useState(null);
  const [isModerator, setIsModerator] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('chats');

  // Verificar si el usuario es moderador
  useEffect(() => {
    const checkModeratorStatus = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setLoading(false);
          return;
        }

        // Obtener información del usuario
        const userResponse = await fetch('https://spainrp-web.onrender.com/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (userResponse.ok) {
          const userData = await userResponse.json();
          setUser(userData.user);

          // Verificar si es moderador (esto se haría con una API específica)
          // Por ahora, asumimos que si está logueado es moderador
          // En producción, verificarías contra Discord
          setIsModerator(true);
        }
      } catch (error) {
        console.error('Error verificando estado de moderador:', error);
      } finally {
        setLoading(false);
      }
    };

    checkModeratorStatus();
  }, []);

  if (loading) {
    return (
      <div className="moderator-dashboard">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Verificando permisos de moderador...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="moderator-dashboard">
        <div className="access-denied">
          <h2>⚠️ Acceso Temporal</h2>
          <p>Panel de moderadores en modo de prueba.</p>
          <p>Puedes acceder sin iniciar sesión temporalmente.</p>
          <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button 
              onClick={() => window.location.href = '/auth/login'}
              className="login-button"
            >
              Iniciar Sesión
            </button>
            <button 
              onClick={() => {
                setUser({ username: 'Usuario Demo', id: 'demo' });
                setIsModerator(true);
              }}
              className="demo-button"
            >
              Continuar como Demo
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Temporalmente permitir acceso a todos los usuarios logueados
  if (!isModerator) {
    return (
      <div className="moderator-dashboard">
        <div className="access-denied">
          <h2>Acceso Restringido</h2>
          <p>No tienes permisos de moderador para acceder a este panel.</p>
          <p>Si crees que esto es un error, contacta con un administrador.</p>
          <button 
            onClick={() => window.location.href = '/support'}
            className="support-button"
          >
            Ir a Soporte
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="moderator-dashboard">
      {/* Header */}
      <div className="moderator-header">
        <div className="moderator-header-content">
          <div className="moderator-info">
            <div className="moderator-avatar">
              <FaUserFriends />
            </div>
            <div className="moderator-details">
              <h1>Panel de Moderadores</h1>
              <p>Bienvenido, {user.username}</p>
            </div>
          </div>
          <div className="moderator-actions">
            <button 
              onClick={() => window.location.href = '/support'}
              className="action-button"
            >
              <FaComments />
              Ver Soporte
            </button>
            <button 
              onClick={() => window.location.href = '/'}
              className="action-button"
            >
              <FaSignOutAlt />
              Salir
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="moderator-nav">
        <button 
          className={`nav-tab ${activeTab === 'chats' ? 'active' : ''}`}
          onClick={() => setActiveTab('chats')}
        >
          <FaComments />
          Chats en Vivo
        </button>
        <button 
          className={`nav-tab ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          <FaUsers />
          Usuarios
        </button>
        <button 
          className={`nav-tab ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          <FaCog />
          Configuración
        </button>
      </div>

      {/* Content Area */}
      <div className="moderator-content">
        {activeTab === 'chats' && <ModeratorChatPanel />}
        {activeTab === 'users' && (
          <div className="tab-content">
            <h2>Gestión de Usuarios</h2>
            <p>Esta funcionalidad estará disponible próximamente.</p>
          </div>
        )}
        {activeTab === 'settings' && (
          <div className="tab-content">
            <h2>Configuración del Panel</h2>
            <p>Esta funcionalidad estará disponible próximamente.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ModeratorDashboard;
