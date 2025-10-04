import React, { useEffect, useState } from 'react';
import BannedPage from './BannedPage';

const BanErrorHandler = ({ children }) => {
  const [banData, setBanData] = useState(null);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    checkBanStatus();
  }, []);

  const checkBanStatus = async () => {
    try {
      // Verificar si hay datos de ban en localStorage (enviados desde el backend)
      const banError = localStorage.getItem('ban_error');
      if (banError) {
        const ban = JSON.parse(banError);
        setBanData(ban);
        setIsChecking(false);
        return;
      }

      // Si no hay datos de ban, continuar normalmente
      setIsChecking(false);
    } catch (error) {
      console.error('Error checking ban status:', error);
      setIsChecking(false);
    }
  };

  // Si está baneado, mostrar la página de ban
  if (banData) {
    return <BannedPage banData={banData} />;
  }

  // Si está verificando, mostrar loading
  if (isChecking) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: '#f8fafc'
      }}>
        <div style={{
          textAlign: 'center',
          padding: '2rem',
          background: 'white',
          borderRadius: '12px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid #e2e8f0',
            borderTop: '4px solid #3b82f6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem auto'
          }}></div>
          <p style={{ margin: 0, color: '#64748b' }}>Verificando acceso...</p>
        </div>
      </div>
    );
  }

  // Si no está baneado, renderizar el contenido normal
  return children;
};

export default BanErrorHandler;
