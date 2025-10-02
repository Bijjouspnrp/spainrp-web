import React, { useState, useEffect } from 'react';
import { apiUrl, authFetch } from '../../utils/api';
import DiscordUserBar from '../DiscordUserBar';
import './BancoCentralRP.css';

const BancoCentralRP = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [balance, setBalance] = useState({ cash: 0, bank: 0 });
  const [transactions, setTransactions] = useState([]);
  const [showTransfer, setShowTransfer] = useState(false);
  const [showWork, setShowWork] = useState(false);
  const [showSalary, setShowSalary] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success');
  const [loadingAction, setLoadingAction] = useState(false);
  
  // Estados para formularios
  const [transferData, setTransferData] = useState({ toId: '', amount: '', note: '' });
  const [workCooldown, setWorkCooldown] = useState(0);
  const [salaryCooldown, setSalaryCooldown] = useState(0);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        setLoading(true);
        const response = await authFetch('/auth/me');
        const data = await response.json();
        
        if (data && data.user) {
          setUser(data.user);
          await loadBalance(data.user.id);
          await loadTransactions(data.user.id);
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, []);

  const loadBalance = async (userId) => {
    try {
      const response = await authFetch(`/api/proxy/admin/balance/${userId}`);
      const data = await response.json();
      if (data.success) {
        setBalance(data.balance);
      }
    } catch (error) {
      console.error('Error loading balance:', error);
    }
  };

  const loadTransactions = async (userId) => {
    // Simular transacciones por ahora
    const mockTransactions = [
      { id: 1, type: 'deposit', amount: 500, description: 'Depósito inicial', date: new Date().toISOString() },
      { id: 2, type: 'work', amount: 300, description: 'Trabajo realizado', date: new Date(Date.now() - 86400000).toISOString() },
      { id: 3, type: 'transfer', amount: -100, description: 'Transferencia a Juan', date: new Date(Date.now() - 172800000).toISOString() }
    ];
    setTransactions(mockTransactions);
  };

  const showMessage = (msg, type = 'success') => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(''), 3000);
  };

  const handleDeposit = async () => {
    if (!user) return;
    setLoadingAction(true);
    try {
      // Simular depósito por ahora
      const newBalance = { ...balance, bank: balance.bank + 500 };
      setBalance(newBalance);
      showMessage('Depósito realizado correctamente');
    } catch (error) {
      showMessage('Error al realizar el depósito', 'error');
    } finally {
      setLoadingAction(false);
    }
  };

  const handleWithdraw = async () => {
    if (!user) return;
    setLoadingAction(true);
    try {
      // Simular retiro por ahora
      const newBalance = { ...balance, bank: Math.max(0, balance.bank - 500) };
      setBalance(newBalance);
      showMessage('Retiro realizado correctamente');
    } catch (error) {
      showMessage('Error al realizar el retiro', 'error');
    } finally {
      setLoadingAction(false);
    }
  };

  const handleTransfer = async () => {
    if (!user || !transferData.toId || !transferData.amount) return;
    setLoadingAction(true);
    try {
      const response = await authFetch('/api/proxy/admin/transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fromId: user.id,
          toId: transferData.toId,
          amount: parseInt(transferData.amount),
          origen: 'banco'
        })
      });
      
      const data = await response.json();
      if (data.success) {
        showMessage(`Transferencia de €${transferData.amount} realizada`);
        setTransferData({ toId: '', amount: '', note: '' });
        setShowTransfer(false);
        await loadBalance(user.id);
      } else {
        showMessage(data.error || 'Error en la transferencia', 'error');
      }
    } catch (error) {
      showMessage('Error al realizar la transferencia', 'error');
    } finally {
      setLoadingAction(false);
    }
  };

  const handleWork = async () => {
    if (!user) return;
    setLoadingAction(true);
    try {
      const response = await authFetch('/api/proxy/admin/trabajar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          username: user.username
        })
      });
      
      const data = await response.json();
      if (data.success) {
        showMessage(`Trabajo completado. Ganaste €${data.reward}`);
        setWorkCooldown(90 * 60); // 90 minutos en segundos
        await loadBalance(user.id);
      } else {
        if (data.error === 'Cooldown') {
          setWorkCooldown(data.left);
          showMessage(`Debes esperar ${Math.ceil(data.left / 60)} minutos`, 'error');
        } else {
          showMessage(data.error || 'Error al trabajar', 'error');
        }
      }
    } catch (error) {
      showMessage('Error al realizar el trabajo', 'error');
    } finally {
      setLoadingAction(false);
    }
  };

  const handleSalary = async () => {
    if (!user) return;
    setLoadingAction(true);
    try {
      // Simular roles por ahora
      const roles = ['1384340649205301359']; // Rol de admin
      const response = await authFetch('/api/proxy/admin/cobrar-nomina', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          roles: roles
        })
      });
      
      const data = await response.json();
      if (data.success) {
        showMessage(`Nómina cobrada: €${data.neto} (neto de €${data.salarioTotal})`);
        setSalaryCooldown(48 * 60 * 60); // 48 horas en segundos
        await loadBalance(user.id);
      } else {
        if (data.error === 'Cooldown') {
          setSalaryCooldown(data.restante);
          showMessage(`Debes esperar ${Math.ceil(data.restante / (60 * 60 * 24))} días`, 'error');
        } else {
          showMessage(data.error || 'Error al cobrar nómina', 'error');
        }
      }
    } catch (error) {
      showMessage('Error al cobrar nómina', 'error');
    } finally {
      setLoadingAction(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="banco-container">
        <div className="banco-loading">
          <div className="loading-spinner"></div>
          <p>Cargando tu cuenta...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="banco-container">
        <DiscordUserBar />
        <div className="banco-login">
          <div className="banco-card">
            <h1>Banco Central RP</h1>
            <p>Inicia sesión para acceder a tu cuenta bancaria</p>
            <a href="/auth/login" className="banco-btn-primary">
              Iniciar Sesión
            </a>
        </div>
        </div>
      </div>
    );
  }

  return (
    <div className="banco-container">
      <DiscordUserBar />
      
      {/* Header */}
      <div className="banco-header">
        <div className="banco-header-content">
          <h1>Banco Central RP</h1>
          <div className="banco-user-info">
            <span className="banco-username">{user.username}</span>
            <div className="banco-status-indicator"></div>
          </div>
        </div>
      </div>

      {/* Balance Card */}
      <div className="banco-balance-card">
        <div className="banco-balance-header">
          <h2>Saldo Total</h2>
          <div className="banco-balance-amount">
            {formatCurrency(balance.cash + balance.bank)}
          </div>
        </div>
        <div className="banco-balance-breakdown">
          <div className="banco-balance-item">
            <span className="banco-balance-label">Efectivo</span>
            <span className="banco-balance-value">{formatCurrency(balance.cash)}</span>
          </div>
          <div className="banco-balance-item">
            <span className="banco-balance-label">Banco</span>
            <span className="banco-balance-value">{formatCurrency(balance.bank)}</span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="banco-actions">
        <button 
          className="banco-action-btn banco-action-primary"
          onClick={handleDeposit}
          disabled={loadingAction}
        >
          <span className="banco-action-icon">💰</span>
          <span>Depositar</span>
        </button>
        
        <button 
          className="banco-action-btn banco-action-secondary"
          onClick={handleWithdraw}
          disabled={loadingAction}
        >
          <span className="banco-action-icon">💸</span>
          <span>Retirar</span>
        </button>
        
        <button 
          className="banco-action-btn banco-action-outline"
          onClick={() => setShowTransfer(true)}
        >
          <span className="banco-action-icon">↔️</span>
          <span>Transferir</span>
        </button>
        
        <button 
          className="banco-action-btn banco-action-outline"
          onClick={() => setShowWork(true)}
          disabled={workCooldown > 0 || loadingAction}
        >
          <span className="banco-action-icon">💼</span>
          <span>
            {workCooldown > 0 ? `Esperar ${Math.ceil(workCooldown / 60)}m` : 'Trabajar'}
          </span>
        </button>
        
        <button 
          className="banco-action-btn banco-action-outline"
          onClick={() => setShowSalary(true)}
          disabled={salaryCooldown > 0 || loadingAction}
        >
          <span className="banco-action-icon">💳</span>
          <span>
            {salaryCooldown > 0 ? `Esperar ${Math.ceil(salaryCooldown / (60 * 60 * 24))}d` : 'Nómina'}
          </span>
        </button>
      </div>

      {/* Transactions */}
      <div className="banco-transactions">
        <h3>Últimas Transacciones</h3>
        <div className="banco-transactions-list">
          {transactions.map(transaction => (
            <div key={transaction.id} className="banco-transaction">
              <div className="banco-transaction-icon">
                {transaction.type === 'deposit' ? '💰' : 
                 transaction.type === 'work' ? '💼' : 
                 transaction.type === 'transfer' ? '↔️' : '💳'}
              </div>
              <div className="banco-transaction-details">
                <div className="banco-transaction-description">{transaction.description}</div>
                <div className="banco-transaction-date">{formatDate(transaction.date)}</div>
              </div>
              <div className={`banco-transaction-amount ${transaction.amount > 0 ? 'positive' : 'negative'}`}>
                {transaction.amount > 0 ? '+' : ''}{formatCurrency(transaction.amount)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Transfer Modal */}
      {showTransfer && (
        <div className="banco-modal-overlay" onClick={() => setShowTransfer(false)}>
          <div className="banco-modal" onClick={e => e.stopPropagation()}>
            <div className="banco-modal-header">
              <h3>Transferir Dinero</h3>
              <button className="banco-modal-close" onClick={() => setShowTransfer(false)}>×</button>
            </div>
            <div className="banco-modal-body">
              <div className="banco-form-group">
                <label>ID del Destinatario</label>
                <input
                  type="text"
                  value={transferData.toId}
                  onChange={e => setTransferData({...transferData, toId: e.target.value})}
                  placeholder="ID de Discord del destinatario"
                />
              </div>
              <div className="banco-form-group">
                <label>Cantidad</label>
            <input
              type="number"
                  value={transferData.amount}
                  onChange={e => setTransferData({...transferData, amount: e.target.value})}
                  placeholder="0"
                  min="1"
                />
              </div>
              <div className="banco-form-group">
                <label>Nota (opcional)</label>
                <input
                  type="text"
                  value={transferData.note}
                  onChange={e => setTransferData({...transferData, note: e.target.value})}
                  placeholder="Descripción de la transferencia"
                />
              </div>
            </div>
            <div className="banco-modal-footer">
              <button className="banco-btn-secondary" onClick={() => setShowTransfer(false)}>
                Cancelar
              </button>
              <button 
                className="banco-btn-primary" 
                onClick={handleTransfer}
                disabled={loadingAction || !transferData.toId || !transferData.amount}
              >
                {loadingAction ? 'Transferiendo...' : 'Transferir'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Work Modal */}
      {showWork && (
        <div className="banco-modal-overlay" onClick={() => setShowWork(false)}>
          <div className="banco-modal" onClick={e => e.stopPropagation()}>
            <div className="banco-modal-header">
              <h3>Realizar Trabajo</h3>
              <button className="banco-modal-close" onClick={() => setShowWork(false)}>×</button>
            </div>
            <div className="banco-modal-body">
              <p>¿Estás seguro de que quieres realizar un trabajo? Ganarás entre €300-500.</p>
              {workCooldown > 0 && (
                <p className="banco-cooldown-warning">
                  Debes esperar {Math.ceil(workCooldown / 60)} minutos antes de trabajar nuevamente.
                </p>
              )}
            </div>
            <div className="banco-modal-footer">
              <button className="banco-btn-secondary" onClick={() => setShowWork(false)}>
                Cancelar
              </button>
              <button
                className="banco-btn-primary" 
                onClick={handleWork}
                disabled={loadingAction || workCooldown > 0}
              >
                {loadingAction ? 'Trabajando...' : 'Trabajar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Salary Modal */}
      {showSalary && (
        <div className="banco-modal-overlay" onClick={() => setShowSalary(false)}>
          <div className="banco-modal" onClick={e => e.stopPropagation()}>
            <div className="banco-modal-header">
              <h3>Cobrar Nómina</h3>
              <button className="banco-modal-close" onClick={() => setShowSalary(false)}>×</button>
            </div>
            <div className="banco-modal-body">
              <p>¿Estás seguro de que quieres cobrar tu nómina? El salario se calculará según tus roles.</p>
              {salaryCooldown > 0 && (
                <p className="banco-cooldown-warning">
                  Debes esperar {Math.ceil(salaryCooldown / (60 * 60 * 24))} días antes de cobrar nuevamente.
                </p>
              )}
            </div>
            <div className="banco-modal-footer">
              <button className="banco-btn-secondary" onClick={() => setShowSalary(false)}>
                Cancelar
              </button>
              <button
                className="banco-btn-primary" 
                onClick={handleSalary}
                disabled={loadingAction || salaryCooldown > 0}
              >
                {loadingAction ? 'Cobrando...' : 'Cobrar Nómina'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Message Toast */}
      {message && (
        <div className={`banco-toast ${messageType}`}>
          {message}
      </div>
      )}
    </div>
  );
};

export default BancoCentralRP;