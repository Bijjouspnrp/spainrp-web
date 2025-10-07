import React, { useState, useEffect } from 'react';
import { FaUser, FaLock, FaEye, FaEyeSlash, FaShieldAlt, FaCheckCircle, FaTimes } from 'react-icons/fa';
import { apiUrl } from '../../utils/api';
import './RobloxAuth.css';

const RobloxAuth = ({ onSuccess, onCancel, isCNI = false }) => {
  const [step, setStep] = useState('username'); // 'username', 'pin-setup', 'pin-verify'
  const [robloxUsername, setRobloxUsername] = useState('');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [robloxUser, setRobloxUser] = useState(null);
  const [isFirstTime, setIsFirstTime] = useState(false);

  // Verificar si el usuario ya tiene PIN configurado
  useEffect(() => {
    checkExistingPin();
  }, []);

  const checkExistingPin = async () => {
    try {
      const token = localStorage.getItem('spainrp_token');
      if (!token) {
        console.log('No token found, skipping PIN check');
        setIsFirstTime(true);
        return;
      }

      // Modo instantáneo - saltar verificación de PIN
      const isInstantMode = process.env.NODE_ENV === 'development' || window.location.hostname === 'localhost' || window.location.hostname.includes('render.com');
      
      if (isInstantMode) {
        console.log('⚡ Modo instantáneo - saltando verificación de PIN');
        setIsFirstTime(true);
        return;
      }

      const response = await fetch(apiUrl('/api/roblox/check-pin'), {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.hasPin) {
          setStep('pin-verify');
        } else {
          setIsFirstTime(true);
        }
      } else if (response.status === 401) {
        console.log('Token inválido, usuario necesita autenticación');
        setIsFirstTime(true);
      } else {
        console.log('Error verificando PIN, continuando sin autenticación previa');
        setIsFirstTime(true);
      }
    } catch (err) {
      console.error('Error verificando PIN:', err);
      setIsFirstTime(true);
    }
  };

  const handleUsernameSubmit = async (e) => {
    e.preventDefault();
    if (!robloxUsername.trim()) {
      setError('Por favor, introduce tu nombre de usuario de Roblox');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('spainrp_token');
      if (!token) {
        setError('Sesión expirada. Por favor, recarga la página.');
        setLoading(false);
        return;
      }

      console.log('🔐 Token encontrado, verificando usuario Roblox:', robloxUsername);

      // Modo instantáneo para desarrollo
      const isInstantMode = process.env.NODE_ENV === 'development' || window.location.hostname === 'localhost' || window.location.hostname.includes('render.com');
      
      if (isInstantMode) {
        console.log('⚡ Modo instantáneo activado');
        
        // Simular delay mínimo para UX
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Mock de datos de usuario con avatar placeholder
        const mockUserId = Math.floor(Math.random() * 1000000);
        const mockUser = {
          id: mockUserId,
          username: robloxUsername,
          displayName: robloxUsername,
          avatar: null // Sin avatar para evitar problemas de carga
        };
        
        console.log('✅ Usuario mock verificado:', mockUser);
        setRobloxUser(mockUser);
        if (isFirstTime) {
          setStep('pin-setup');
        } else {
          setStep('pin-verify');
        }
        setSuccess('Usuario de Roblox verificado correctamente');
        setLoading(false);
        return;
      }

      // Timeout más corto para hacerlo más rápido
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        console.log('⏰ Timeout en verificación de usuario');
        controller.abort();
      }, 5000);

      const response = await fetch(apiUrl('/api/roblox/verify-user'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify({ username: robloxUsername }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      
      console.log('📡 Respuesta recibida:', response.status, response.statusText);

      if (response.status === 401) {
        setError('Sesión expirada. Por favor, recarga la página e inicia sesión de nuevo.');
        return;
      }

      const data = await response.json();

      if (response.ok) {
        console.log('✅ Usuario verificado:', data.user);
        setRobloxUser(data.user);
        if (isFirstTime) {
          setStep('pin-setup');
        } else {
          setStep('pin-verify');
        }
        setSuccess('Usuario de Roblox verificado correctamente');
      } else {
        console.error('❌ Error en respuesta:', data);
        setError(data.message || 'Error verificando usuario de Roblox');
      }
    } catch (err) {
      console.error('❌ Error en verificación:', err);
      if (err.name === 'AbortError') {
        setError('Timeout: La verificación tardó demasiado. Inténtalo de nuevo.');
      } else if (err.name === 'TypeError' && err.message.includes('fetch')) {
        setError('Error de conexión. Verifica tu conexión a internet.');
      } else {
        setError('Error de conexión. Inténtalo de nuevo.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePinSetup = async (e) => {
    e.preventDefault();
    
    if (pin.length < 4) {
      setError('El PIN debe tener al menos 4 dígitos');
      return;
    }
    
    if (pin !== confirmPin) {
      setError('Los PINs no coinciden');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('spainrp_token');
      
      // Modo instantáneo para desarrollo
      const isInstantMode = process.env.NODE_ENV === 'development' || window.location.hostname === 'localhost' || window.location.hostname.includes('render.com');
      
      if (isInstantMode) {
        console.log('⚡ Modo instantáneo - configurando PIN sin API');
        
        // Simular delay mínimo para UX
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Guardar PIN en localStorage para modo instantáneo
        localStorage.setItem('roblox_pin_mock', pin);
        localStorage.setItem('roblox_user_mock', JSON.stringify(robloxUser));
        
        setSuccess('PIN configurado correctamente');
        setTimeout(() => {
          onSuccess(robloxUser);
        }, 1000);
        setLoading(false);
        return;
      }

      const response = await fetch(apiUrl('/api/roblox/setup-pin'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          username: robloxUsername,
          pin: pin,
          userData: robloxUser
        })
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('PIN configurado correctamente');
        setTimeout(() => {
          onSuccess(robloxUser);
        }, 1500);
      } else {
        setError(data.message || 'Error configurando PIN');
      }
    } catch (err) {
      setError('Error de conexión. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handlePinVerify = async (e) => {
    e.preventDefault();
    
    if (pin.length < 4) {
      setError('El PIN debe tener al menos 4 dígitos');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('spainrp_token');
      
      // Modo instantáneo para desarrollo
      const isInstantMode = process.env.NODE_ENV === 'development' || window.location.hostname === 'localhost' || window.location.hostname.includes('render.com');
      
      if (isInstantMode) {
        console.log('⚡ Modo instantáneo - verificando PIN sin API');
        
        // Simular delay mínimo para UX
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Verificar PIN guardado en localStorage
        const savedPin = localStorage.getItem('roblox_pin_mock');
        const savedUser = localStorage.getItem('roblox_user_mock');
        
        if (savedPin === pin && savedUser) {
          const userData = JSON.parse(savedUser);
          setSuccess('Acceso autorizado');
          setTimeout(() => {
            onSuccess(userData);
          }, 1000);
        } else {
          setError('PIN incorrecto');
        }
        setLoading(false);
        return;
      }

      const response = await fetch(apiUrl('/api/roblox/verify-pin'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ pin: pin })
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Acceso autorizado');
        setTimeout(() => {
          onSuccess(data.user);
        }, 1000);
      } else {
        setError(data.message || 'PIN incorrecto');
      }
    } catch (err) {
      setError('Error de conexión. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setRobloxUsername('');
    setPin('');
    setConfirmPin('');
    setError('');
    setSuccess('');
    setStep('username');
  };

  return (
    <div className="roblox-auth-overlay">
      <div className="roblox-auth-container">
        <div className="roblox-auth-header">
          <div className="auth-icon">
            <FaShieldAlt />
          </div>
          <h2>Acceso Restringido</h2>
          <p>Solo personal autorizado</p>
          <p className="auth-subtitle">
            {isCNI ? 'Solicita el PIN a un alto mando CNI' : 'Solicita el PIN a un alto mando policial'}
          </p>
        </div>

        <div className="roblox-auth-content">
          {step === 'username' && (
            <form onSubmit={handleUsernameSubmit} className="auth-form">
              <div className="form-group">
                <label htmlFor="roblox-username">
                  <FaUser /> Nombre de usuario de Roblox
                </label>
                <input
                  type="text"
                  id="roblox-username"
                  value={robloxUsername}
                  onChange={(e) => setRobloxUsername(e.target.value)}
                  placeholder="Introduce tu usuario de Roblox"
                  className="auth-input"
                  disabled={loading}
                />
              </div>
              
              <div className="auth-actions">
                <button type="submit" className="auth-btn auth-btn-primary" disabled={loading}>
                  {loading ? (
                    <>
                      <div className="auth-spinner"></div>
                      Verificando usuario en Roblox...
                    </>
                  ) : (
                    'Verificar Usuario'
                  )}
                </button>
                <button type="button" className="auth-btn auth-btn-secondary" onClick={onCancel} disabled={loading}>
                  Cancelar
                </button>
              </div>
            </form>
          )}

          {step === 'pin-setup' && robloxUser && (
            <form onSubmit={handlePinSetup} className="auth-form">
              <div className="user-info">
                <div className="user-avatar">
                  <img 
                    src={robloxUser.avatar} 
                    alt={robloxUser.username}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                  <div className="avatar-placeholder">
                    <FaUser />
                  </div>
                </div>
                <div className="user-details">
                  <h3>{robloxUser.username}</h3>
                  <p>Usuario de Roblox verificado</p>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="pin">
                  <FaLock /> Crear PIN de Seguridad
                </label>
                <div className="pin-input-container">
                  <input
                    type={showPin ? 'text' : 'password'}
                    id="pin"
                    value={pin}
                    onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 8))}
                    placeholder="Introduce tu PIN (4-8 dígitos)"
                    className="auth-input"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    className="pin-toggle"
                    onClick={() => setShowPin(!showPin)}
                  >
                    {showPin ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="confirm-pin">
                  <FaLock /> Confirmar PIN
                </label>
                <div className="pin-input-container">
                  <input
                    type={showPin ? 'text' : 'password'}
                    id="confirm-pin"
                    value={confirmPin}
                    onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, '').slice(0, 8))}
                    placeholder="Confirma tu PIN"
                    className="auth-input"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    className="pin-toggle"
                    onClick={() => setShowPin(!showPin)}
                  >
                    {showPin ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              <div className="pin-help">
                <p>El PIN debe tener entre 4 y 8 dígitos</p>
                <p>Guárdalo en un lugar seguro</p>
              </div>
              
              <div className="auth-actions">
                <button type="submit" className="auth-btn auth-btn-primary" disabled={loading}>
                  {loading ? 'Configurando...' : 'Configurar PIN'}
                </button>
                <button type="button" className="auth-btn auth-btn-secondary" onClick={resetForm}>
                  Volver
                </button>
              </div>
            </form>
          )}

          {step === 'pin-verify' && (
            <form onSubmit={handlePinVerify} className="auth-form">
              <div className="user-info">
                <div className="user-avatar">
                  <img 
                    src={robloxUser?.avatar || '/default-avatar.png'} 
                    alt={robloxUser?.username || 'Usuario'}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                  <div className="avatar-placeholder">
                    <FaUser />
                  </div>
                </div>
                <div className="user-details">
                  <h3>{robloxUser?.username || 'Usuario'}</h3>
                  <p>Introduce tu PIN para continuar</p>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="pin-verify">
                  <FaLock /> PIN de Seguridad
                </label>
                <div className="pin-input-container">
                  <input
                    type={showPin ? 'text' : 'password'}
                    id="pin-verify"
                    value={pin}
                    onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 8))}
                    placeholder="Introduce tu PIN"
                    className="auth-input"
                    disabled={loading}
                    autoFocus
                  />
                  <button
                    type="button"
                    className="pin-toggle"
                    onClick={() => setShowPin(!showPin)}
                  >
                    {showPin ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>
              
              <div className="auth-actions">
                <button type="submit" className="auth-btn auth-btn-primary" disabled={loading}>
                  {loading ? 'Verificando...' : 'Acceder'}
                </button>
                <button type="button" className="auth-btn auth-btn-secondary" onClick={onCancel}>
                  Cancelar
                </button>
              </div>
            </form>
          )}

          {error && (
            <div className="auth-message auth-error">
              <FaTimes />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="auth-message auth-success">
              <FaCheckCircle />
              <span>{success}</span>
            </div>
          )}
        </div>

        <div className="auth-footer">
          <p>Fecha y hora: {new Date().toLocaleString('es-ES')}</p>
        </div>
      </div>
    </div>
  );
};

export default RobloxAuth;
