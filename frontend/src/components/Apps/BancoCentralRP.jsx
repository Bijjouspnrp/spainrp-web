import React, { useState, useEffect } from 'react';
import { apiUrl, authFetch } from '../../utils/api';
import DiscordUserBar from '../DiscordUserBar';
import './BancoCentralRP.css';

// Iconos modernos para el banco
const BankIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M3 21h18"/>
    <path d="M5 21V7l8-4v18"/>
    <path d="M19 21V11l-6-4"/>
    <path d="M9 9v.01"/>
    <path d="M9 12v.01"/>
    <path d="M9 15v.01"/>
    <path d="M9 18v.01"/>
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

const ShieldIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);

const TrendingUpIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
    <polyline points="17 6 23 6 23 12"/>
  </svg>
);

const LockIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
    <circle cx="12" cy="16" r="1"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
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
  const [loadingBalance, setLoadingBalance] = useState(false);
  const [loadingTransactions, setLoadingTransactions] = useState(false);
  const [actionLoading, setActionLoading] = useState({
    deposit: false,
    withdraw: false,
    transfer: false,
    work: false,
    salary: false
  });
  
  // Estados para formularios
  const [transferData, setTransferData] = useState({ toId: '', amount: '', note: '' });
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [workCooldown, setWorkCooldown] = useState(0);
  const [salaryCooldown, setSalaryCooldown] = useState(0);
  
  // Estados para la tarjeta de crédito
  const [cardFlipped, setCardFlipped] = useState(false);
  const [cardInserted, setCardInserted] = useState(false);
  const [showCardInsert, setShowCardInsert] = useState(false);
  const [cardInserting, setCardInserting] = useState(false);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        setLoading(true);
        showLoadingMessage('Conectando con el banco...');
        
        const response = await authFetch('/auth/me');
        const data = await response.json();
        
        if (data && data.user) {
          setUser(data.user);
          showLoadingMessage('Cargando información de cuenta...');
          await Promise.all([
            loadBalance(data.user.id, false),
            loadTransactions(data.user.id, false)
          ]);
          showMessage('Bienvenido al Banco Central RP', 'success', 2000);
        } else {
          showMessage('Error al cargar datos de usuario', 'error');
        }
      } catch (error) {
        console.error('Error loading user data:', error);
        showMessage('Error de conexión. Intenta recargar la página.', 'error');
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, []);

  const loadBalance = async (userId, showToast = false) => {
    try {
      setLoadingBalance(true);
      if (showToast) {
        showLoadingMessage('Actualizando saldo...');
      }
      
      console.log('[BANCO-FRONTEND] 🏦 Cargando saldo para usuario:', userId);
      
      const response = await authFetch(`/api/proxy/balance/${userId}`);
      const data = await response.json();
      console.log('[BANCO-FRONTEND] 📊 Datos recibidos:', data);
      
      if (data.success && data.balance) {
        console.log('[BANCO-FRONTEND] ✅ Saldo cargado correctamente:', data.balance);
        setBalance(data.balance);
        if (showToast) {
          showMessage('Saldo actualizado correctamente', 'success', 2000);
        }
      } else {
        console.warn('[BANCO-FRONTEND] ⚠️ No se pudo cargar el saldo:', data);
        setBalance({ cash: 0, bank: 0 });
        if (showToast) {
          showMessage('No se pudo cargar el saldo. Intenta más tarde.', 'error');
        }
      }
    } catch (error) {
      console.error('[BANCO-FRONTEND] ❌ Error cargando saldo:', error);
      setBalance({ cash: 0, bank: 0 });
      if (showToast) {
        showMessage('Error de conexión al cargar saldo', 'error');
      }
    } finally {
      setLoadingBalance(false);
    }
  };

  const loadTransactions = async (userId, showToast = false) => {
    try {
      setLoadingTransactions(true);
      if (showToast) {
        showLoadingMessage('Cargando transacciones...');
      }
      
      console.log('[BANCO-FRONTEND] 📊 Cargando transacciones para usuario:', userId);
      
      // Primero intentar cargar desde localStorage
      const localTransactions = localStorage.getItem(`transactions_${userId}`);
      if (localTransactions) {
        const parsed = JSON.parse(localTransactions);
        console.log('[BANCO-FRONTEND] ✅ Transacciones cargadas desde localStorage:', parsed.length);
        setTransactions(parsed.map(tx => ({
          ...tx,
          icon: getTransactionIcon(tx.type)
        })));
        if (showToast) {
          showMessage(`${parsed.length} transacciones cargadas`, 'info', 2000);
        }
        return;
      }
      
      // Si no hay en localStorage, intentar desde la API
      const response = await authFetch(`/api/proxy/transactions/${userId}`);
      const data = await response.json();
      
      if (data.success && data.transactions && data.transactions.length > 0) {
        console.log('[BANCO-FRONTEND] ✅ Transacciones cargadas desde API:', data.transactions.length);
        const transactionsWithIcons = data.transactions.map(tx => ({
          ...tx,
          icon: getTransactionIcon(tx.type)
        }));
        setTransactions(transactionsWithIcons);
        // Guardar en localStorage para futuras cargas
        localStorage.setItem(`transactions_${userId}`, JSON.stringify(transactionsWithIcons));
        if (showToast) {
          showMessage(`${data.transactions.length} transacciones cargadas`, 'success', 2000);
        }
      } else {
        console.log('[BANCO-FRONTEND] ⚠️ No hay transacciones disponibles');
        setTransactions([]);
        if (showToast) {
          showMessage('No hay transacciones disponibles', 'info', 2000);
        }
      }
    } catch (error) {
      console.error('[BANCO-FRONTEND] ❌ Error cargando transacciones:', error);
      setTransactions([]);
      if (showToast) {
        showMessage('Error al cargar transacciones', 'error');
      }
    } finally {
      setLoadingTransactions(false);
    }
  };

  const addTransaction = (transaction) => {
    const newTransaction = {
      ...transaction,
      id: Date.now(),
      icon: getTransactionIcon(transaction.type)
    };
    
    setTransactions(prev => {
      const updated = [newTransaction, ...prev.slice(0, 9)]; // Mantener solo 10 transacciones
      
      // Guardar en localStorage si hay un usuario
      if (user?.id) {
        localStorage.setItem(`transactions_${user.id}`, JSON.stringify(updated));
      }
      
      return updated;
    });
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
      console.log('[BANCO-FRONTEND] 🔍 Obteniendo roles reales para usuario:', userId);
      
      const response = await authFetch(`/api/discord/user-roles/${userId}`);
      const data = await response.json();
      
      if (data.success && data.roles) {
        console.log('[BANCO-FRONTEND] ✅ Roles obtenidos:', data.roles);
        return data.roles;
      } else {
        console.log('[BANCO-FRONTEND] ⚠️ No se pudieron obtener roles del usuario');
        return [];
      }
    } catch (error) {
      console.error('[BANCO-FRONTEND] ❌ Error obteniendo roles:', error);
      return [];
    }
  };

  const showMessage = (msg, type = 'success', duration = 4000) => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(''), duration);
  };

  const showLoadingMessage = (msg) => {
    setMessage(msg);
    setMessageType('loading');
  };

  // Funciones para la tarjeta de crédito
  const handleCardFlip = () => {
    setCardFlipped(!cardFlipped);
  };

  const handleCardInsert = async () => {
    if (cardInserting) return;
    
    setCardInserting(true);
    setShowCardInsert(true);
    
    // Simular inserción de tarjeta
    setTimeout(() => {
      setCardInserted(true);
      setCardInserting(false);
      setShowCardInsert(false);
      showMessage('Tarjeta insertada correctamente. Bienvenido al Banco Central RP', 'success');
    }, 2000);
  };

  const handleCardEject = () => {
    setCardInserted(false);
    setCardFlipped(false);
    showMessage('Tarjeta expulsada. Gracias por usar nuestros servicios', 'success');
  };

  const handleDeposit = async () => {
    if (!user || !depositAmount || depositAmount <= 0) {
      showMessage('Ingresa una cantidad válida', 'error');
      return;
    }
    
    if (parseInt(depositAmount) > balance.cash) {
      showMessage('No tienes suficiente efectivo', 'error');
      return;
    }
    
    setActionLoading(prev => ({ ...prev, deposit: true }));
    setLoadingAction(true);
    showLoadingMessage('Procesando depósito...');
    
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
        showLoadingMessage('Actualizando saldo...');
        await loadBalance(user.id, false);
        addTransaction({
          type: 'deposit',
          amount: amount,
          description: 'Depósito a cuenta bancaria',
          date: new Date().toISOString()
        });
        showMessage(`✅ Depósito de ${formatCurrency(amount)} realizado correctamente`, 'success');
        setDepositAmount('');
        setShowDeposit(false);
      } else {
        console.error('[BANCO-FRONTEND] ❌ Error en depósito:', data.error);
        showMessage(data.error || 'Error al realizar depósito', 'error');
      }
    } catch (error) {
      console.error('[BANCO-FRONTEND] ❌ Error en depósito:', error);
      showMessage('Error de conexión al realizar depósito', 'error');
    } finally {
      setActionLoading(prev => ({ ...prev, deposit: false }));
      setLoadingAction(false);
    }
  };

  const handleWithdraw = async () => {
    if (!user || !withdrawAmount || withdrawAmount <= 0) {
      showMessage('Ingresa una cantidad válida', 'error');
      return;
    }
    
    if (parseInt(withdrawAmount) > balance.bank) {
      showMessage('No tienes suficiente saldo en el banco', 'error');
      return;
    }
    
    setActionLoading(prev => ({ ...prev, withdraw: true }));
    setLoadingAction(true);
    showLoadingMessage('Procesando retiro...');
    
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
        showLoadingMessage('Actualizando saldo...');
        await loadBalance(user.id, false);
        addTransaction({
          type: 'withdraw',
          amount: -amount,
          description: 'Retiro de cuenta bancaria',
          date: new Date().toISOString()
        });
        showMessage(`✅ Retiro de ${formatCurrency(amount)} realizado correctamente`, 'success');
        setWithdrawAmount('');
        setShowWithdraw(false);
      } else {
        console.error('[BANCO-FRONTEND] ❌ Error en retiro:', data.error);
        showMessage(data.error || 'Error al realizar retiro', 'error');
      }
    } catch (error) {
      console.error('[BANCO-FRONTEND] ❌ Error en retiro:', error);
      showMessage('Error de conexión al realizar retiro', 'error');
    } finally {
      setActionLoading(prev => ({ ...prev, withdraw: false }));
      setLoadingAction(false);
    }
  };

  const handleTransfer = async () => {
    if (!user || !transferData.toId || !transferData.amount || transferData.amount <= 0) {
      showMessage('Completa todos los campos correctamente', 'error');
      return;
    }
    
    if (parseInt(transferData.amount) > balance.bank) {
      showMessage('No tienes suficiente saldo en el banco', 'error');
      return;
    }
    
    setActionLoading(prev => ({ ...prev, transfer: true }));
    setLoadingAction(true);
    showLoadingMessage('Verificando destinatario...');
    
    try {
      const amount = parseInt(transferData.amount);
      console.log('[BANCO-FRONTEND] ↔️ Realizando transferencia:', { 
        fromId: user.id, 
        toId: transferData.toId, 
        amount 
      });
      
      showLoadingMessage('Procesando transferencia...');
      
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
        showLoadingMessage('Actualizando saldo...');
        await loadBalance(user.id, false);
        addTransaction({
          type: 'transfer',
          amount: -amount,
          description: `Transferencia a ${transferData.toId}${transferData.note ? ` - ${transferData.note}` : ''}`,
          date: new Date().toISOString()
        });
        showMessage(`✅ Transferencia de ${formatCurrency(amount)} a ${transferData.toId} realizada correctamente`, 'success');
        setTransferData({ toId: '', amount: '', note: '' });
        setShowTransfer(false);
      } else {
        console.error('[BANCO-FRONTEND] ❌ Error en transferencia:', data.error);
        showMessage(data.error || 'Error al realizar transferencia', 'error');
      }
    } catch (error) {
      console.error('[BANCO-FRONTEND] ❌ Error en transferencia:', error);
      showMessage('Error de conexión al realizar transferencia', 'error');
    } finally {
      setActionLoading(prev => ({ ...prev, transfer: false }));
      setLoadingAction(false);
    }
  };

  const handleWork = async () => {
    if (!user) return;
    
    setActionLoading(prev => ({ ...prev, work: true }));
    setLoadingAction(true);
    showLoadingMessage('Buscando trabajo disponible...');
    
    try {
      console.log('[BANCO-FRONTEND] 💼 Realizando trabajo:', { userId: user.id, username: user.username });
      
      showLoadingMessage('Realizando trabajo...');
      
      const response = await authFetch(`/api/proxy/trabajar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, username: user.username })
      });
      
      const data = await response.json();
      console.log('[BANCO-FRONTEND] 📊 Datos recibidos:', data);
      
      if (data.success) {
        console.log('[BANCO-FRONTEND] ✅ Trabajo exitoso');
        const reward = data.reward || 300;
        showLoadingMessage('Procesando pago...');
        await loadBalance(user.id, false);
        addTransaction({
          type: 'work',
          amount: reward,
          description: 'Trabajo realizado',
          date: new Date().toISOString()
        });
        showMessage(`✅ Trabajo completado. Ganaste ${formatCurrency(reward)}`, 'success');
        setWorkCooldown(90 * 60); // 90 minutos en segundos
        setShowWork(false);
      } else {
        console.error('[BANCO-FRONTEND] ❌ Error en trabajo:', data.error);
        if (data.error === 'Cooldown') {
          const minutes = Math.ceil(data.left / 60);
          showMessage(`⏰ Debes esperar ${minutes} minutos para trabajar de nuevo`, 'error');
        } else {
          showMessage(data.error || 'Error al realizar trabajo', 'error');
        }
      }
    } catch (error) {
      console.error('[BANCO-FRONTEND] ❌ Error en trabajo:', error);
      showMessage('Error de conexión al realizar trabajo', 'error');
    } finally {
      setActionLoading(prev => ({ ...prev, work: false }));
      setLoadingAction(false);
    }
  };

  const handleSalary = async () => {
    if (!user) return;
    
    setActionLoading(prev => ({ ...prev, salary: true }));
    setLoadingAction(true);
    showLoadingMessage('Verificando roles de Discord...');
    
    try {
      // Obtener roles reales del usuario desde Discord
      const roles = await getUserRoles(user.id);
      
      if (!roles || roles.length === 0) {
        showMessage('No se pudieron verificar tus roles. Intenta más tarde.', 'error');
        return;
      }
      
      console.log('[BANCO-FRONTEND] 💳 Cobrando nómina:', { userId: user.id, roles });
      
      showLoadingMessage('Calculando nómina según tus roles...');
      
      const response = await authFetch(`/api/proxy/cobrar-nomina`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, roles })
      });
      
      const data = await response.json();
      console.log('[BANCO-FRONTEND] 📊 Datos recibidos:', data);
      
      if (data.success) {
        console.log('[BANCO-FRONTEND] ✅ Nómina exitosa');
        const neto = data.neto || 1000;
        showLoadingMessage('Procesando pago de nómina...');
        await loadBalance(user.id, false);
        await loadTransactions(user.id, false); // Recargar transacciones reales
        showMessage(`✅ Nómina cobrada. Recibiste ${formatCurrency(neto)}`, 'success');
        setSalaryCooldown(48 * 60 * 60); // 48 horas en segundos
        setShowSalary(false);
      } else {
        console.error('[BANCO-FRONTEND] ❌ Error en nómina:', data.error);
        if (data.error === 'Cooldown') {
          const hours = Math.ceil(data.restante / (60 * 60 * 1000));
          showMessage(`⏰ Debes esperar ${hours} horas para cobrar nómina de nuevo`, 'error');
        } else {
          showMessage(data.error || 'Error al cobrar nómina', 'error');
        }
      }
    } catch (error) {
      console.error('[BANCO-FRONTEND] ❌ Error en nómina:', error);
      showMessage('Error de conexión al cobrar nómina', 'error');
    } finally {
      setActionLoading(prev => ({ ...prev, salary: false }));
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
        <div className="loading-screen">
          <div className="loading-content">
            <div className="bank-logo">
              <BankIcon />
              <span>SpainRP</span>
            </div>
            <div className="loading-spinner">
              <div className="spinner"></div>
              <p>Cargando servicios bancarios...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="banco-container">
      <DiscordUserBar />
      
      {/* Header con logo SpainRP */}
      <div className="banco-header">
        <div className="header-content">
          <div className="bank-logo">
            <BankIcon />
            <div className="logo-text">
              <span className="bank-name">Banco Central</span>
              <span className="bank-subtitle">SpainRP</span>
            </div>
          </div>
          <div className="header-actions">
            <div className="bank-badge">
              <BankIcon />
              <span>Banco Central SpainRP</span>
            </div>
            <div className="security-badge">
              <ShieldIcon />
              <span>Seguro SSL</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tarjeta de crédito principal */}
      <div className="card-section">
        <div className="card-container">
          <div 
            className={`credit-card ${cardFlipped ? 'flipped' : ''} ${cardInserted ? 'inserted' : ''}`}
            onClick={handleCardFlip}
          >
            <div className="card-front">
              <div className="card-header">
                <div className="card-chip"></div>
                <div className="card-logo">SpainRP Bank</div>
              </div>
              <div className="card-number">
                <span>****</span>
                <span>****</span>
                <span>****</span>
                <span>1234</span>
              </div>
              <div className="card-footer">
                <div className="card-holder">
                  <span className="label">TITULAR</span>
                  <span className="name">{user?.username || 'USUARIO'}</span>
                </div>
                <div className="card-expiry">
                  <span className="label">VENCE</span>
                  <span className="date">12/25</span>
                </div>
              </div>
            </div>
            <div className="card-back">
              <div className="card-stripe"></div>
              <div className="card-magnetic-stripe"></div>
              <div className="card-hologram">
                <div className="hologram-pattern"></div>
                <div className="hologram-text">SpainRP</div>
              </div>
              <div className="card-signature-section">
                <div className="card-signature">
                  <span className="label">AUTHORIZED SIGNATURE</span>
                  <div className="signature-line">
                    <div className="signature-pattern"></div>
                  </div>
                </div>
                <div className="card-cvv">
                  <span className="label">CVV</span>
                  <div className="cvv-box">
                    <span className="cvv-number">123</span>
                  </div>
                </div>
              </div>
              <div className="card-contact-info">
                <div className="contact-line">
                  <span className="contact-label">CALL</span>
                  <span className="contact-value">+34 900 123 456</span>
                </div>
                <div className="contact-line">
                  <span className="contact-label">WEB</span>
                  <span className="contact-value">www.spainrp-bank.com</span>
                </div>
              </div>
              <div className="card-security-features">
                <div className="security-chip-small"></div>
                <div className="security-dots">
                  <span className="dot"></span>
                  <span className="dot"></span>
                  <span className="dot"></span>
                </div>
              </div>
            </div>
          </div>
          
          {!cardInserted && (
            <div className="card-insert-section">
              <button 
                className="insert-card-btn"
                onClick={handleCardInsert}
                disabled={cardInserting}
              >
                {cardInserting ? (
                  <>
                    <div className="inserting-animation"></div>
                    <span>Insertando tarjeta...</span>
                  </>
                ) : (
                  <>
                    <CreditCardIcon />
                    <span>Insertar Tarjeta</span>
                  </>
                )}
              </button>
            </div>
          )}
          
          {cardInserted && (
            <div className="card-eject-section">
              <button 
                className="eject-card-btn"
                onClick={handleCardEject}
              >
                <LockIcon />
                <span>Expulsar Tarjeta</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Balance Cards - Solo visible si la tarjeta está insertada */}
      {cardInserted && (
        <div className="balance-section">
          <div className="section-header">
            <h2>Estado de Cuenta</h2>
            <div className="balance-trend">
              <TrendingUpIcon />
              <span>+2.5% este mes</span>
            </div>
          </div>
          
          <div className="balance-grid">
            <div className="balance-card total">
              <div className="card-header">
                <div className="balance-icon">
                  <DollarSignIcon />
                </div>
                <div className="balance-badge">Total</div>
              </div>
              <div className="balance-amount">
                {formatCurrency(balance.cash + balance.bank)}
              </div>
              <div className="balance-subtitle">Saldo disponible</div>
            </div>
            
            <div className="balance-card cash">
              <div className="card-header">
                <div className="balance-icon">
                  <DollarSignIcon />
                </div>
                <div className="balance-badge cash">Efectivo</div>
              </div>
              <div className="balance-amount">
                {formatCurrency(balance.cash)}
              </div>
              <div className="balance-subtitle">En tu bolsillo</div>
            </div>
            
            <div className="balance-card bank">
              <div className="card-header">
                <div className="balance-icon">
                  <CreditCardIcon />
                </div>
                <div className="balance-badge bank">Banco</div>
              </div>
              <div className="balance-amount">
                {formatCurrency(balance.bank)}
              </div>
              <div className="balance-subtitle">En cuenta bancaria</div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions - Solo visible si la tarjeta está insertada */}
      {cardInserted && (
        <div className="actions-section">
          <div className="section-header">
            <h2>Servicios Bancarios</h2>
            <div className="section-subtitle">Gestiona tu dinero de forma segura</div>
          </div>
          
          <div className="actions-grid">
            <button 
              className={`action-btn deposit ${actionLoading.deposit ? 'loading' : ''}`}
              onClick={() => setShowDeposit(true)}
              disabled={loadingAction || actionLoading.deposit}
            >
              <div className="btn-icon">
                {actionLoading.deposit ? (
                  <div className="btn-spinner"></div>
                ) : (
                  <ArrowUpIcon />
                )}
              </div>
              <div className="btn-content">
                <span className="btn-title">
                  {actionLoading.deposit ? 'Procesando...' : 'Depositar'}
                </span>
                <span className="btn-subtitle">Efectivo → Banco</span>
              </div>
            </button>
            
            <button 
              className={`action-btn withdraw ${actionLoading.withdraw ? 'loading' : ''}`}
              onClick={() => setShowWithdraw(true)}
              disabled={loadingAction || actionLoading.withdraw}
            >
              <div className="btn-icon">
                {actionLoading.withdraw ? (
                  <div className="btn-spinner"></div>
                ) : (
                  <ArrowDownIcon />
                )}
              </div>
              <div className="btn-content">
                <span className="btn-title">
                  {actionLoading.withdraw ? 'Procesando...' : 'Retirar'}
                </span>
                <span className="btn-subtitle">Banco → Efectivo</span>
              </div>
            </button>
            
            <button 
              className={`action-btn transfer ${actionLoading.transfer ? 'loading' : ''}`}
              onClick={() => setShowTransfer(true)}
              disabled={loadingAction || actionLoading.transfer}
            >
              <div className="btn-icon">
                {actionLoading.transfer ? (
                  <div className="btn-spinner"></div>
                ) : (
                  <ArrowRightIcon />
                )}
              </div>
              <div className="btn-content">
                <span className="btn-title">
                  {actionLoading.transfer ? 'Procesando...' : 'Transferir'}
                </span>
                <span className="btn-subtitle">A otro usuario</span>
              </div>
            </button>
            
            <button 
              className={`action-btn work ${actionLoading.work ? 'loading' : ''}`}
              onClick={() => setShowWork(true)}
              disabled={loadingAction || workCooldown > 0 || actionLoading.work}
            >
              <div className="btn-icon">
                {actionLoading.work ? (
                  <div className="btn-spinner"></div>
                ) : (
                  <BriefcaseIcon />
                )}
              </div>
              <div className="btn-content">
                <span className="btn-title">
                  {actionLoading.work ? 'Trabajando...' : workCooldown > 0 ? `Esperar ${formatTime(workCooldown)}` : 'Trabajar'}
                </span>
                <span className="btn-subtitle">Gana dinero trabajando</span>
              </div>
            </button>
            
            <button 
              className={`action-btn salary ${actionLoading.salary ? 'loading' : ''}`}
              onClick={() => setShowSalary(true)}
              disabled={loadingAction || salaryCooldown > 0 || actionLoading.salary}
            >
              <div className="btn-icon">
                {actionLoading.salary ? (
                  <div className="btn-spinner"></div>
                ) : (
                  <DollarSignIcon />
                )}
              </div>
              <div className="btn-content">
                <span className="btn-title">
                  {actionLoading.salary ? 'Calculando...' : salaryCooldown > 0 ? `Esperar ${formatTime(salaryCooldown)}` : 'Nómina'}
                </span>
                <span className="btn-subtitle">Cobra según tu rol</span>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Transactions - Solo visible si la tarjeta está insertada */}
      {cardInserted && (
        <div className="transactions-section">
          <div className="section-header">
            <h2>Historial de Transacciones</h2>
            <div className="section-subtitle">Últimas operaciones realizadas</div>
          </div>
          
          <div className="transactions-list">
            {transactions.length === 0 ? (
              <div className="no-transactions">
                <div className="no-transactions-icon">
                  <CreditCardIcon />
                </div>
                <h3>No hay transacciones</h3>
                <p>Realiza tu primera operación para ver el historial aquí</p>
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
                    <span className="amount-symbol">{transaction.amount > 0 ? '+' : ''}</span>
                    <span className="amount-value">{formatCurrency(Math.abs(transaction.amount))}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

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
                disabled={actionLoading.deposit || !depositAmount || depositAmount <= 0 || parseInt(depositAmount) > balance.cash}
              >
                {actionLoading.deposit ? (
                  <>
                    <div className="btn-spinner-small"></div>
                    <span>Procesando...</span>
                  </>
                ) : (
                  'Depositar'
                )}
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
                disabled={actionLoading.withdraw || !withdrawAmount || withdrawAmount <= 0 || parseInt(withdrawAmount) > balance.bank}
              >
                {actionLoading.withdraw ? (
                  <>
                    <div className="btn-spinner-small"></div>
                    <span>Procesando...</span>
                  </>
                ) : (
                  'Retirar'
                )}
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
                disabled={actionLoading.transfer || !transferData.toId || !transferData.amount || parseInt(transferData.amount) > balance.bank}
              >
                {actionLoading.transfer ? (
                  <>
                    <div className="btn-spinner-small"></div>
                    <span>Procesando...</span>
                  </>
                ) : (
                  'Transferir'
                )}
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
                disabled={actionLoading.work || workCooldown > 0}
              >
                {actionLoading.work ? (
                  <>
                    <div className="btn-spinner-small"></div>
                    <span>Trabajando...</span>
                  </>
                ) : (
                  'Trabajar'
                )}
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
                disabled={actionLoading.salary || salaryCooldown > 0}
              >
                {actionLoading.salary ? (
                  <>
                    <div className="btn-spinner-small"></div>
                    <span>Calculando nómina...</span>
                  </>
                ) : (
                  'Cobrar Nómina'
                )}
              </button>
          </div>
        </div>
      </div>
      )}

      {/* Animación de inserción de tarjeta */}
      {showCardInsert && (
        <div className="card-insert-animation">
          <div className="insert-animation-content">
            <div className="card-slot">
              <div className="card-inserting"></div>
            </div>
            <div className="insert-text">
              <h3>Insertando tarjeta...</h3>
              <p>Verificando identidad y conectando con el banco</p>
            </div>
          </div>
        </div>
      )}

      {/* Términos Bancarios */}
      <div className="banking-terms">
        <div className="terms-content">
          <div className="terms-section">
            <h4>Información Legal</h4>
            <p>Banco Central es una entidad financiera virtual regulada por las leyes del servidor SpainRP. Todos los servicios están sujetos a términos y condiciones.</p>
          </div>
          <div className="terms-section">
            <h4>Seguridad</h4>
            <p>Utilizamos tecnología SSL de 256 bits para proteger todas las transacciones. Sus datos están seguros y encriptados.</p>
          </div>
          <div className="terms-section">
            <h4>Servicios</h4>
            <p>Ofrecemos servicios de depósito, retiro, transferencias, trabajo y nóminas. Todas las operaciones son instantáneas y seguras.</p>
          </div>
          <div className="terms-section">
            <h4>Contacto</h4>
            <p>Para soporte técnico, contacte con BijjouPro08 en el servidor SpainRP a través de Discord.</p>
          </div>
        </div>
        <div className="terms-footer">
          <p>© 2025 Banco Central SpainRP. Todos los derechos reservados. | Servidor: SpainRP | Versión: 2.0</p>
        </div>
      </div>

      {/* Message Toast Mejorado */}
      {message && (
        <div className={`message-toast ${messageType}`}>
          <div className="toast-content">
            <div className="toast-icon">
              {messageType === 'loading' ? (
                <div className="toast-spinner"></div>
              ) : messageType === 'success' ? (
                '✓'
              ) : messageType === 'error' ? (
                '✕'
              ) : messageType === 'info' ? (
                'ℹ'
              ) : (
                '⚠'
              )}
            </div>
            <span>{message}</span>
          </div>
        </div>
      )}
      
      {/* Indicadores de carga en botones */}
      {loadingBalance && (
        <div className="loading-overlay-balance">
          <div className="loading-spinner-small"></div>
          <span>Actualizando saldo...</span>
        </div>
      )}
      
      {loadingTransactions && (
        <div className="loading-overlay-transactions">
          <div className="loading-spinner-small"></div>
          <span>Cargando transacciones...</span>
        </div>
      )}
    </div>
  );
};

export default BancoCentralRP;
