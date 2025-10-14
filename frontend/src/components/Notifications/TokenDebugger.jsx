import React, { useState, useEffect } from 'react';
import { FaKey, FaExclamationTriangle, FaCheckCircle, FaInfoCircle } from 'react-icons/fa';

const TokenDebugger = () => {
  const [tokenInfo, setTokenInfo] = useState(null);
  const [isValid, setIsValid] = useState(false);
  const [error, setError] = useState(null);

  const checkToken = () => {
    const token = localStorage.getItem('spainrp_token');
    
    if (!token) {
      setTokenInfo({
        exists: false,
        length: 0,
        preview: 'No token found'
      });
      setIsValid(false);
      setError('No hay token en localStorage');
      return;
    }

    try {
      // Decodificar el token JWT
      const parts = token.split('.');
      if (parts.length !== 3) {
        throw new Error('Token JWT inválido');
      }

      const payload = JSON.parse(atob(parts[1]));
      const now = Math.floor(Date.now() / 1000);
      
      setTokenInfo({
        exists: true,
        length: token.length,
        preview: token.substring(0, 20) + '...',
        payload: {
          id: payload.id,
          username: payload.username,
          isAdmin: payload.isAdmin,
          exp: payload.exp,
          iat: payload.iat
        },
        isExpired: payload.exp < now,
        expiresAt: new Date(payload.exp * 1000).toLocaleString(),
        issuedAt: new Date(payload.iat * 1000).toLocaleString()
      });

      setIsValid(!payload.exp || payload.exp > now);
      setError(payload.exp < now ? 'Token expirado' : null);
    } catch (err) {
      setTokenInfo({
        exists: true,
        length: token.length,
        preview: token.substring(0, 20) + '...',
        invalid: true
      });
      setIsValid(false);
      setError('Token inválido: ' + err.message);
    }
  };

  useEffect(() => {
    checkToken();
  }, []);

  const clearToken = () => {
    localStorage.removeItem('spainrp_token');
    checkToken();
  };

  const testAPI = async () => {
    try {
      const response = await fetch('/api/notifications', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('spainrp_token')}`
        }
      });
      
      console.log('API Test Response:', {
        status: response.status,
        ok: response.ok,
        headers: Object.fromEntries(response.headers.entries())
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('API Test Data:', data);
        alert('✅ API funcionando correctamente');
      } else {
        const errorData = await response.json();
        console.error('API Test Error:', errorData);
        alert(`❌ Error de API: ${errorData.error}`);
      }
    } catch (err) {
      console.error('API Test Error:', err);
      alert(`❌ Error de conexión: ${err.message}`);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
      border: '2px solid #7289da',
      borderRadius: '12px',
      padding: '20px',
      maxWidth: '400px',
      color: '#fff',
      zIndex: 10000,
      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginBottom: '16px'
      }}>
        <FaKey color="#7289da" />
        <h3 style={{ margin: 0, fontSize: '16px' }}>Token Debugger</h3>
      </div>

      {tokenInfo && (
        <div style={{ marginBottom: '16px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '8px'
          }}>
            {isValid ? (
              <FaCheckCircle color="#10b981" />
            ) : (
              <FaExclamationTriangle color="#ef4444" />
            )}
            <span style={{ fontWeight: '600' }}>
              {isValid ? 'Token Válido' : 'Token Inválido'}
            </span>
          </div>

          <div style={{ fontSize: '12px', color: '#b0b0b0' }}>
            <div>Existe: {tokenInfo.exists ? 'Sí' : 'No'}</div>
            <div>Longitud: {tokenInfo.length} caracteres</div>
            <div>Preview: {tokenInfo.preview}</div>
            
            {tokenInfo.payload && (
              <>
                <div>Usuario: {tokenInfo.payload.username}</div>
                <div>ID: {tokenInfo.payload.id}</div>
                <div>Admin: {tokenInfo.payload.isAdmin ? 'Sí' : 'No'}</div>
                <div>Expira: {tokenInfo.expiresAt}</div>
                <div>Emitido: {tokenInfo.issuedAt}</div>
                {tokenInfo.isExpired && (
                  <div style={{ color: '#ef4444', fontWeight: '600' }}>
                    ⚠️ TOKEN EXPIRADO
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {error && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid #ef4444',
          borderRadius: '8px',
          padding: '8px',
          marginBottom: '16px',
          fontSize: '12px',
          color: '#fca5a5'
        }}>
          <FaInfoCircle style={{ marginRight: '4px' }} />
          {error}
        </div>
      )}

      <div style={{
        display: 'flex',
        gap: '8px',
        flexWrap: 'wrap'
      }}>
        <button
          onClick={checkToken}
          style={{
            background: '#7289da',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            padding: '6px 12px',
            fontSize: '12px',
            cursor: 'pointer'
          }}
        >
          🔄 Verificar
        </button>
        
        <button
          onClick={clearToken}
          style={{
            background: '#ef4444',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            padding: '6px 12px',
            fontSize: '12px',
            cursor: 'pointer'
          }}
        >
          🗑️ Limpiar
        </button>
        
        <button
          onClick={testAPI}
          style={{
            background: '#10b981',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            padding: '6px 12px',
            fontSize: '12px',
            cursor: 'pointer'
          }}
        >
          🧪 Test API
        </button>
      </div>
    </div>
  );
};

export default TokenDebugger;
