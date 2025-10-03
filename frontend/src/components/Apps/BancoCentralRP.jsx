import React, { useState, useEffect } from 'react';
import { apiUrl, authFetch } from '../../utils/api';
import DiscordUserBar from '../DiscordUserBar';
import './BancoCentralRP.css';

// Iconos como componentes
const WalletIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/>
    <path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/>
    <circle cx="18" cy="12" r="2"/>
  </svg>
);

const CreditCardIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
    <line x1="1" y1="10" x2="23" y2="10"/>
  </svg>
);

const ArrowUpIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="12" y1="19" x2="12" y2="5"/>
    <polyline points="5,12 12,5 19,12"/>
  </svg>
);

const ArrowDownIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="12" y1="5" x2="12" y2="19"/>
    <polyline points="19,12 12,19 5,12"/>
  </svg>
);

const ArrowRightIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="5" y1="12" x2="19" y2="12"/>
    <polyline points="12,5 19,12 12,19"/>
  </svg>
);

const BriefcaseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
  </svg>
);

const DollarSignIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="12" y1="1" x2="12" y2="23"/>
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
  </svg>
);

const ClockIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10"/>
    <polyline points="12,6 12,12 16,14"/>
  </svg>
);

const XIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

const BancoCentralRP = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [balance, setBalance] = useState({ cash: 0, bank: 0 });
  const [transactions, setTransactions] = useState([]);
  const [showTransfer, setShowTransfer] = useState(false);
  const [showWork, setShowWork] = useState(false);
  const [showSalary, setShowSalary] = useState(false);
  const [showDeposit, setShowDeposit] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success');
  const [loadingAction, setLoadingAction] = useState(false);
  
  // Estados para formularios
  const [transferData, setTransferData] = useState({ toId: '', amount: '', note: '' });
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
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
      console.log('[BANCO-FRONTEND] 🏦 Cargando saldo para usuario:', userId);
      
      const response = await authFetch(`/api/proxy/balance/${userId}`);
      const data = await response.json();
      console.log('[BANCO-FRONTEND] 📊 Datos recibidos:', data);
      
      if (data.success && data.balance) {
        console.log('[BANCO-FRONTEND] ✅ Saldo cargado correctamente:', data.balance);
        setBalance(data.balance);
      } else {
        console.warn('[BANCO-FRONTEND] ⚠️ No se pudo cargar el saldo:', data);
        setBalance({ cash: 0, bank: 0 });
      }
    } catch (error) {
      console.error('[BANCO-FRONTEND] ❌ Error cargando saldo:', error);
      setBalance({ cash: 0, bank: 0 });
    }
  };

  const loadTransactions = async (userId) => {
    // Por ahora simulamos transacciones, pero aquí se conectaría con la API real
    const mockTransactions = [
      { 
        id: 1, 
        type: 'deposit', 
        amount: 500, 
        description: 'Depósito inicial', 
        date: new Date().toISOString(),
        icon: '💰'
      },
      { 
        id: 2, 
        type: 'work', 
        amount: 300, 
        description: 'Trabajo realizado', 
        date: new Date(Date.now() - 86400000).toISOString(),
        icon: '💼'
      },
      { 
        id: 3, 
        type: 'transfer', 
        amount: -100, 
        description: 'Transferencia a Juan', 
        date: new Date(Date.now() - 172800000).toISOString(),
        icon: '↔️'
      }
    ];
    setTransactions(mockTransactions);
  };

  const addTransaction = (transaction) => {
    const newTransaction = {
      ...transaction,
      id: Date.now(),
      icon: getTransactionIcon(transaction.type)
    };
    setTransactions(prev => [newTransaction, ...prev.slice(0, 9)]); // Mantener solo 10 transacciones
  };

  const getTransactionIcon = (type) => {
    switch (type) {
      case 'deposit': return '💰';
      case 'withdraw': return '💸';
      case 'work': return '💼';
      case 'salary': return '💳';
      case 'transfer': return '↔️';
      default: return '💵';
    }
  };

  const getUserRoles = async (userId) => {
    try {
      // En producción, esto haría una llamada a la API para obtener los roles del usuario
      // Por ahora simulamos algunos roles comunes
      console.log('[BANCO-FRONTEND] 🔍 Obteniendo roles para usuario:', userId);
      
      // Simular roles del usuario (en producción vendría del backend)
      const mockRoles = [
        '1384340649205301359', // Admin role
        '123456789012345678',  // Staff role
        '987654321098765432'   // VIP role
      ];
      
      // Asegurar que todos los roles sean strings
      const rolesAsStrings = mockRoles.map(role => String(role));
      
      console.log('[BANCO-FRONTEND] 📋 Roles obtenidos:', rolesAsStrings);
      return rolesAsStrings;
    } catch (error) {
      console.error('[BANCO-FRONTEND] ❌ Error obteniendo roles:', error);
      // Devolver array vacío si hay error
      return [];
    }
  };

  const showMessage = (msg, type = 'success') => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(''), 3000);
  };

  const handleDeposit = async () => {
    if (!user || !depositAmount || depositAmount <= 0) {
      showMessage('Ingresa una cantidad válida', 'error');
      return;
    }
    
    setLoadingAction(true);
    try {
      const amount = parseInt(depositAmount);
      console.log('[BANCO-FRONTEND] 💰 Realizando depósito:', { userId: user.id, amount });
      
      const response = await authFetch(`/api/proxy/deposit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, amount })
      });
      
      const data = await response.json();
      console.log('[BANCO-FRONTEND] 📊 Datos recibidos:', data);
      
      if (data.success) {
        console.log('[BANCO-FRONTEND] ✅ Depósito exitoso');
        await loadBalance(user.id);
        addTransaction({
          type: 'deposit',
          amount: amount,
          description: 'Depósito a cuenta bancaria',
          date: new Date().toISOString()
        });
        showMessage(`Depósito de ${formatCurrency(amount)} realizado correctamente`, 'success');
        setDepositAmount('');
        setShowDeposit(false);
      } else {
        console.error('[BANCO-FRONTEND] ❌ Error en depósito:', data.error);
        showMessage(data.error || 'Error al realizar depósito', 'error');
      }
    } catch (error) {
      console.error('[BANCO-FRONTEND] ❌ Error en depósito:', error);
      showMessage('Error al realizar depósito', 'error');
    } finally {
      setLoadingAction(false);
    }
  };

  const handleWithdraw = async () => {
    if (!user || !withdrawAmount || withdrawAmount <= 0) {
      showMessage('Ingresa una cantidad válida', 'error');
      return;
    }
    
    setLoadingAction(true);
    try {
      const amount = parseInt(withdrawAmount);
      console.log('[BANCO-FRONTEND] 💸 Realizando retiro:', { userId: user.id, amount });
      
      const response = await authFetch(`/api/proxy/withdraw`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, amount })
      });
      
      const data = await response.json();
      console.log('[BANCO-FRONTEND] 📊 Datos recibidos:', data);
      
      if (data.success) {
        console.log('[BANCO-FRONTEND] ✅ Retiro exitoso');
        await loadBalance(user.id);
        addTransaction({
          type: 'withdraw',
          amount: -amount,
          description: 'Retiro de cuenta bancaria',
          date: new Date().toISOString()
        });
        showMessage(`Retiro de ${formatCurrency(amount)} realizado correctamente`, 'success');
        setWithdrawAmount('');
        setShowWithdraw(false);
      } else {
        console.error('[BANCO-FRONTEND] ❌ Error en retiro:', data.error);
        showMessage(data.error || 'Error al realizar retiro', 'error');
      }
    } catch (error) {
      console.error('[BANCO-FRONTEND] ❌ Error en retiro:', error);
      showMessage('Error al realizar retiro', 'error');
    } finally {
      setLoadingAction(false);
    }
  };

  const handleTransfer = async () => {
    if (!user || !transferData.toId || !transferData.amount || transferData.amount <= 0) {
      showMessage('Completa todos los campos correctamente', 'error');
      return;
    }
    
    setLoadingAction(true);
    try {
      const amount = parseInt(transferData.amount);
      console.log('[BANCO-FRONTEND] ↔️ Realizando transferencia:', { 
        fromId: user.id, 
        toId: transferData.toId, 
        amount 
      });
      
      const response = await authFetch(`/api/proxy/transfer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          fromId: user.id, 
          toId: transferData.toId, 
          amount,
          origen: 'banco'
        })
      });
      
      const data = await response.json();
      console.log('[BANCO-FRONTEND] 📊 Datos recibidos:', data);
      
      if (data.success) {
        console.log('[BANCO-FRONTEND] ✅ Transferencia exitosa');
        await loadBalance(user.id);
        addTransaction({
          type: 'transfer',
          amount: -amount,
          description: `Transferencia a ${transferData.toId}`,
          date: new Date().toISOString()
        });
        showMessage(`Transferencia de ${formatCurrency(amount)} realizada correctamente`, 'success');
        setTransferData({ toId: '', amount: '', note: '' });
        setShowTransfer(false);
      } else {
        console.error('[BANCO-FRONTEND] ❌ Error en transferencia:', data.error);
        showMessage(data.error || 'Error al realizar transferencia', 'error');
      }
    } catch (error) {
      console.error('[BANCO-FRONTEND] ❌ Error en transferencia:', error);
      showMessage('Error al realizar transferencia', 'error');
    } finally {
      setLoadingAction(false);
    }
  };

  const handleWork = async () => {
    if (!user) return;
    
    setLoadingAction(true);
    try {
      console.log('[BANCO-FRONTEND] 💼 Realizando trabajo:', { userId: user.id, username: user.username });
      
      const response = await authFetch(`/api/proxy/trabajar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, username: user.username })
      });
      
      const data = await response.json();
      console.log('[BANCO-FRONTEND] 📊 Datos recibidos:', data);
      
      if (data.success) {
        console.log('[BANCO-FRONTEND] ✅ Trabajo exitoso');
        await loadBalance(user.id);
        addTransaction({
          type: 'work',
          amount: data.reward || 300,
          description: 'Trabajo realizado',
          date: new Date().toISOString()
        });
        showMessage(`Trabajo completado. Ganaste ${formatCurrency(data.reward || 300)}`, 'success');
        setWorkCooldown(90 * 60); // 90 minutos en segundos
        setShowWork(false);
      } else {
        console.error('[BANCO-FRONTEND] ❌ Error en trabajo:', data.error);
        if (data.error === 'Cooldown') {
          const minutes = Math.ceil(data.left / 60);
          showMessage(`Debes esperar ${minutes} minutos para trabajar de nuevo`, 'error');
        } else {
          showMessage(data.error || 'Error al realizar trabajo', 'error');
        }
      }
    } catch (error) {
      console.error('[BANCO-FRONTEND] ❌ Error en trabajo:', error);
      showMessage('Error al realizar trabajo', 'error');
    } finally {
      setLoadingAction(false);
    }
  };

  const handleSalary = async () => {
    if (!user) return;
    
    setLoadingAction(true);
    try {
      // Obtener roles del usuario desde Discord (simulado por ahora)
      // En producción, esto vendría de una API que consulte los roles del usuario
      const roles = await getUserRoles(user.id);
      
      console.log('[BANCO-FRONTEND] 💳 Cobrando nómina:', { userId: user.id, roles });
      
      const response = await authFetch(`/api/proxy/cobrar-nomina`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, roles })
      });
      
      const data = await response.json();
      console.log('[BANCO-FRONTEND] 📊 Datos recibidos:', data);
      
      if (data.success) {
        console.log('[BANCO-FRONTEND] ✅ Nómina exitosa');
        await loadBalance(user.id);
        addTransaction({
          type: 'salary',
          amount: data.neto || 1000,
          description: 'Nómina cobrada',
          date: new Date().toISOString()
        });
        showMessage(`Nómina cobrada. Recibiste ${formatCurrency(data.neto || 1000)}`, 'success');
        setSalaryCooldown(48 * 60 * 60); // 48 horas en segundos
        setShowSalary(false);
      } else {
        console.error('[BANCO-FRONTEND] ❌ Error en nómina:', data.error);
        if (data.error === 'Cooldown') {
          const hours = Math.ceil(data.restante / (60 * 60 * 1000));
          showMessage(`Debes esperar ${hours} horas para cobrar nómina de nuevo`, 'error');
        } else {
          showMessage(data.error || 'Error al cobrar nómina', 'error');
        }
      }
    } catch (error) {
      console.error('[BANCO-FRONTEND] ❌ Error en nómina:', error);
      showMessage('Error al cobrar nómina', 'error');
    } finally {
      setLoadingAction(false);
    }
  };

  // Cooldown timers
  useEffect(() => {
    if (workCooldown > 0) {
      const timer = setTimeout(() => setWorkCooldown(workCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [workCooldown]);

  useEffect(() => {
    if (salaryCooldown > 0) {
      const timer = setTimeout(() => setSalaryCooldown(salaryCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [salaryCooldown]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
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

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  if (loading) {
    return (
      <div className="banco-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Cargando banco...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="banco-container">
      <DiscordUserBar />
      
      {/* Header */}
      <div className="banco-header">
        <div className="banco-title">
          <CreditCardIcon />
          <h1>Banco Central RP</h1>
        </div>
        <div className="banco-subtitle">
          Gestiona tu dinero de forma segura
        </div>
      </div>

      {/* Balance Cards */}
      <div className="balance-section">
        <div className="balance-card total">
          <div className="balance-icon">
            <WalletIcon />
          </div>
          <div className="balance-info">
            <h3>Saldo Total</h3>
            <p className="balance-amount">{formatCurrency(balance.cash + balance.bank)}</p>
          </div>
        </div>
        
        <div className="balance-cards">
          <div className="balance-card cash">
            <div className="balance-icon">
              <DollarSignIcon />
            </div>
            <div className="balance-info">
              <h4>Efectivo</h4>
              <p>{formatCurrency(balance.cash)}</p>
            </div>
          </div>
          
          <div className="balance-card bank">
            <div className="balance-icon">
              <CreditCardIcon />
            </div>
            <div className="balance-info">
              <h4>Banco</h4>
              <p>{formatCurrency(balance.bank)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="actions-section">
        <h2>Acciones Rápidas</h2>
        <div className="actions-grid">
          <button 
            className="action-btn deposit" 
            onClick={() => setShowDeposit(true)}
            disabled={loadingAction}
          >
            <ArrowUpIcon />
            <span>Depositar</span>
          </button>
          
          <button 
            className="action-btn withdraw" 
            onClick={() => setShowWithdraw(true)}
            disabled={loadingAction}
          >
            <ArrowDownIcon />
            <span>Retirar</span>
          </button>
          
          <button 
            className="action-btn transfer" 
            onClick={() => setShowTransfer(true)}
            disabled={loadingAction}
          >
            <ArrowRightIcon />
            <span>Transferir</span>
          </button>
          
          <button 
            className="action-btn work" 
            onClick={() => setShowWork(true)}
            disabled={loadingAction || workCooldown > 0}
          >
            <BriefcaseIcon />
            <span>
              {workCooldown > 0 ? `Esperar ${formatTime(workCooldown)}` : 'Trabajar'}
            </span>
          </button>
          
          <button 
            className="action-btn salary" 
            onClick={() => setShowSalary(true)}
            disabled={loadingAction || salaryCooldown > 0}
          >
            <DollarSignIcon />
            <span>
              {salaryCooldown > 0 ? `Esperar ${formatTime(salaryCooldown)}` : 'Nómina'}
            </span>
          </button>
        </div>
      </div>

      {/* Transactions */}
      <div className="transactions-section">
        <h2>Últimas Transacciones</h2>
        <div className="transactions-list">
          {transactions.length === 0 ? (
            <div className="no-transactions">
              <p>No hay transacciones recientes</p>
            </div>
          ) : (
            transactions.map(transaction => (
              <div key={transaction.id} className="transaction-item">
                <div className="transaction-icon">
                  {transaction.icon}
                </div>
                <div className="transaction-info">
                  <h4>{transaction.description}</h4>
                  <p className="transaction-date">{formatDate(transaction.date)}</p>
                </div>
                <div className={`transaction-amount ${transaction.amount > 0 ? 'positive' : 'negative'}`}>
                  {transaction.amount > 0 ? '+' : ''}{formatCurrency(transaction.amount)}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modals */}
      {showDeposit && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Depositar Dinero</h3>
              <button onClick={() => setShowDeposit(false)} className="close-btn">
                <XIcon />
              </button>
            </div>
            <div className="modal-body">
              <p>Ingresa la cantidad que deseas depositar de efectivo a tu cuenta bancaria.</p>
              <div className="input-group">
                <label>Cantidad (€)</label>
                <input
                  type="number"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  placeholder="0"
                  min="1"
                  max={balance.cash}
                />
              </div>
              <div className="balance-info">
                <p>Efectivo disponible: {formatCurrency(balance.cash)}</p>
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={() => setShowDeposit(false)} className="btn-secondary">
                Cancelar
              </button>
              <button 
                onClick={handleDeposit} 
                className="btn-primary"
                disabled={loadingAction || !depositAmount || depositAmount <= 0}
              >
                {loadingAction ? 'Procesando...' : 'Depositar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showWithdraw && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Retirar Dinero</h3>
              <button onClick={() => setShowWithdraw(false)} className="close-btn">
                <XIcon />
              </button>
            </div>
            <div className="modal-body">
              <p>Ingresa la cantidad que deseas retirar de tu cuenta bancaria a efectivo.</p>
              <div className="input-group">
                <label>Cantidad (€)</label>
                <input
                  type="number"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  placeholder="0"
                  min="1"
                  max={balance.bank}
                />
              </div>
              <div className="balance-info">
                <p>Saldo bancario disponible: {formatCurrency(balance.bank)}</p>
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={() => setShowWithdraw(false)} className="btn-secondary">
                Cancelar
              </button>
              <button 
                onClick={handleWithdraw} 
                className="btn-primary"
                disabled={loadingAction || !withdrawAmount || withdrawAmount <= 0}
              >
                {loadingAction ? 'Procesando...' : 'Retirar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showTransfer && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Transferir Dinero</h3>
              <button onClick={() => setShowTransfer(false)} className="close-btn">
                <XIcon />
              </button>
            </div>
            <div className="modal-body">
              <div className="input-group">
                <label>ID del Destinatario</label>
                <input
                  type="text"
                  value={transferData.toId}
                  onChange={(e) => setTransferData({...transferData, toId: e.target.value})}
                  placeholder="ID de Discord del destinatario"
                />
            </div>
              <div className="input-group">
                <label>Cantidad (€)</label>
            <input
              type="number"
                  value={transferData.amount}
                  onChange={(e) => setTransferData({...transferData, amount: e.target.value})}
                  placeholder="0"
                  min="1"
                />
              </div>
              <div className="input-group">
                <label>Nota (opcional)</label>
                <input
                  type="text"
                  value={transferData.note}
                  onChange={(e) => setTransferData({...transferData, note: e.target.value})}
                  placeholder="Descripción de la transferencia"
                />
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={() => setShowTransfer(false)} className="btn-secondary">
                Cancelar
              </button>
              <button
                onClick={handleTransfer} 
                className="btn-primary"
                disabled={loadingAction || !transferData.toId || !transferData.amount}
              >
                {loadingAction ? 'Procesando...' : 'Transferir'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showWork && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Trabajar</h3>
              <button onClick={() => setShowWork(false)} className="close-btn">
                <XIcon />
              </button>
            </div>
            <div className="modal-body">
              <p>Realiza trabajo para ganar dinero. Tienes un cooldown de 90 minutos entre trabajos.</p>
              {workCooldown > 0 && (
                <div className="cooldown-info">
                  <ClockIcon />
                  <span>Debes esperar {formatTime(workCooldown)} para trabajar de nuevo</span>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button onClick={() => setShowWork(false)} className="btn-secondary">
                Cancelar
              </button>
              <button
                onClick={handleWork} 
                className="btn-primary"
                disabled={loadingAction || workCooldown > 0}
              >
                {loadingAction ? 'Trabajando...' : 'Trabajar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showSalary && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Cobrar Nómina</h3>
              <button onClick={() => setShowSalary(false)} className="close-btn">
                <XIcon />
              </button>
            </div>
            <div className="modal-body">
              <p>Cobra tu nómina según tus roles en el servidor. Tienes un cooldown de 48 horas entre cobros.</p>
              {salaryCooldown > 0 && (
                <div className="cooldown-info">
                  <ClockIcon />
                  <span>Debes esperar {formatTime(salaryCooldown)} para cobrar nómina de nuevo</span>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button onClick={() => setShowSalary(false)} className="btn-secondary">
                Cancelar
              </button>
              <button 
                onClick={handleSalary} 
                className="btn-primary"
                disabled={loadingAction || salaryCooldown > 0}
              >
                {loadingAction ? 'Procesando...' : 'Cobrar Nómina'}
              </button>
          </div>
        </div>
      </div>
      )}

      {/* Message Toast */}
      {message && (
        <div className={`message-toast ${messageType}`}>
          {message}
        </div>
      )}
    </div>
  );
};

export default BancoCentralRP;
