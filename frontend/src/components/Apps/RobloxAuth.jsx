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
      }
    } catch (err) {
      console.error('Error verificando PIN:', err);
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

    try {
      const token = localStorage.getItem('spainrp_token');
      const response = await fetch(apiUrl('/api/roblox/verify-user'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ username: robloxUsername })
      });

      const data = await response.json();

      if (response.ok) {
        setRobloxUser(data.user);
        if (isFirstTime) {
          setStep('pin-setup');
        } else {
          setStep('pin-verify');
        }
        setSuccess('Usuario de Roblox verificado correctamente');
      } else {
        setError(data.message || 'Error verificando usuario de Roblox');
      }
    } catch (err) {
      setError('Error de conexión. Inténtalo de nuevo.');
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
                  {loading ? 'Verificando...' : 'Verificar Usuario'}
                </button>
                <button type="button" className="auth-btn auth-btn-secondary" onClick={onCancel}>
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
