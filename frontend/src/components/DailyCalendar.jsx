import { apiUrl } from '../utils/api';
import React, { useState, useEffect, useCallback } from 'react';
import { 
  FaGift, 
  FaCheckCircle, 
  FaLock, 
  FaCalendarAlt, 
  FaChevronLeft, 
  FaChevronRight,
  FaSpinner,
  FaFire,
  FaTrophy,
  FaStar,
  FaTimes,
  FaCrown,
  FaGem
} from 'react-icons/fa';
import './DailyCalendar.css';

// Recompensas de racha
const STREAK_REWARDS = [
  { days: 15, reward: '💰 10.000 dinero', emoji: '💰', description: 'Recibe 10.000€ en tu cuenta', unlocked: false },
  { days: 30, reward: '👤 Segundo personaje', emoji: '👤', description: 'Segundo personaje durante 10 días', unlocked: false },
  { days: 45, reward: '🔫 AK-47 o PPSH', emoji: '🔫', description: 'Arma especial durante 3 días', unlocked: false },
  { days: 60, reward: '⭐ Basic Premium', emoji: '⭐', description: 'Basic Premium permanente', unlocked: false },
  { days: 90, reward: '💎 Ultra Premium', emoji: '💎', description: 'Ultra Premium 1 mes', unlocked: false },
  { days: 120, reward: '💠 Diamond Premium', emoji: '💠', description: 'Diamond Premium', unlocked: false },
  { days: 200, reward: '👑 Legend Premium', emoji: '👑', description: 'Legend Premium', unlocked: false },
  { days: 290, reward: '⚫ Obsidian Premium', emoji: '⚫', description: 'Obsidian Premium permanente', unlocked: false }
];

const WEEKDAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year, month) {
  return new Date(year, month, 1).getDay();
}

function getRandomReward() {
  return REWARDS[Math.floor(Math.random() * REWARDS.length)];
}

function getMonthName(month) {
  return new Date(2025, month, 1).toLocaleString('es-ES', { month: 'long' });
}

function capitalizeFirst(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export default function DailyCalendar() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [claimedDays, setClaimedDays] = useState([]);
  const [showReward, setShowReward] = useState(null);
  const [streak, setStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);
  const [totalClaims, setTotalClaims] = useState(0);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [isClaiming, setIsClaiming] = useState(false);
  const [toast, setToast] = useState(null);
  const [showRewardsPanel, setShowRewardsPanel] = useState(true);

  // Cargar progreso desde backend
  const loadCalendarData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(apiUrl(`/api/calendar?year=${year}&month=${month+1}`), {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('spainrp_token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setClaimedDays(data.claimedDays || []);
        setStreak(data.streak || 0);
        setLongestStreak(data.longestStreak || 0);
        setTotalClaims(data.totalClaims || 0);
        setProgress(data.progress || 0);
      } else {
        throw new Error('Error loading calendar data');
      }
    } catch (error) {
      console.error('Error loading calendar:', error);
      setClaimedDays([]);
      setStreak(0);
      setLongestStreak(0);
      setTotalClaims(0);
      setProgress(0);
    } finally {
      setLoading(false);
    }
  }, [year, month]);

  useEffect(() => {
    loadCalendarData();
  }, [loadCalendarData]);

  // Reclamar día y guardar en backend
  const handleClaim = async (day) => {
    // Validación estricta: solo permitir reclamar el día de hoy
    const todayDate = new Date();
    const isToday = year === todayDate.getFullYear() && 
                    month === todayDate.getMonth() && 
                    day === todayDate.getDate();
    
    if (claimedDays.includes(day) || isClaiming || !isToday) {
      if (!isToday) {
        showToast('❌ Solo puedes reclamar el día de hoy', 'error', 3000);
      }
      return;
    }

    setIsClaiming(true);
    showToast('⏳ Procesando reclamación...', 'loading', 2000);
    
    try {
      const response = await fetch(apiUrl('/api/calendar/claim'), {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${localStorage.getItem('spainrp_token')}`,
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({ year, month: month+1, day })
      });

      if (response.ok) {
        const data = await response.json();
        setClaimedDays(data.claimedDays || []);
        setStreak(data.streak || 0);
        setLongestStreak(data.longestStreak || 0);
        setTotalClaims(data.totalClaims || 0);
        setProgress(data.progress || 0);
        
        // Mostrar toast de éxito
        showToast(`✅ ¡Día reclamado! Racha: ${data.streak} días 🔥`, 'success', 4000);
        
        // Mostrar recompensa de racha si se alcanzó un hito
        if (data.streakReward) {
          const reward = data.streakReward;
          setTimeout(() => {
            showToast(
              `🎉 ¡FELICIDADES! ${reward.emoji} Has alcanzado ${reward.days} días de racha!\n${reward.reward}`,
              'reward',
              8000
            );
            setShowReward(reward);
          }, 1500);
        } else if (data.reward) {
          // Recompensa diaria normal - solo toast, no modal
          setTimeout(() => {
            showToast(`✅ ${data.reward}`, 'success', 3000);
          }, 500);
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Error claiming day:', errorData.error || 'Error desconocido');
        showToast(`❌ ${errorData.error || 'Error al reclamar el día'}`, 'error', 4000);
      }
    } catch (error) {
      console.error('Error claiming day:', error);
      showToast('❌ Error de conexión. Inténtalo de nuevo.', 'error', 4000);
    } finally {
      setIsClaiming(false);
    }
  };

  // Navegación de meses
  const handlePrevMonth = () => {
    if (month === 0) {
      setYear(year - 1);
      setMonth(11);
    } else {
      setMonth(month - 1);
    }
  };

  const handleNextMonth = () => {
    if (month === 11) {
      setYear(year + 1);
      setMonth(0);
    } else {
      setMonth(month + 1);
    }
  };

  // Generar días del calendario
  const generateCalendarDays = () => {
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const days = [];
    
    // Días vacíos del mes anterior
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    
    // Días del mes actual
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }
    
    return days;
  };

  const calendarDays = generateCalendarDays();
  const isCurrentMonth = year === today.getFullYear() && month === today.getMonth();

  // Cerrar modal de recompensa
  const closeRewardModal = () => {
    setShowReward(null);
  };

  // Mostrar toast mejorado
  const showToast = (message, type = 'success', duration = 4000) => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => setToast(null), duration);
  };

  // Obtener recompensas desbloqueadas
  const getUnlockedRewards = () => {
    return STREAK_REWARDS.map(reward => ({
      ...reward,
      unlocked: streak >= reward.days,
      next: streak < reward.days && (streak >= reward.days - 5 || streak === 0)
    }));
  };

  const unlockedRewards = getUnlockedRewards();

  return (
    <div className="daily-calendar-container">
      {/* Toast Notifications */}
      {toast && (
        <div className={`calendar-toast calendar-toast-${toast.type}`}>
          <div className="toast-content">
            <div className="toast-icon">
              {toast.type === 'loading' ? (
                <FaSpinner className="fa-spin" />
              ) : toast.type === 'error' ? (
                '❌'
              ) : toast.type === 'reward' ? (
                '🎉'
              ) : (
                '✅'
              )}
            </div>
            <div className="toast-message">{toast.message}</div>
            <button className="toast-close" onClick={() => setToast(null)}>
              <FaTimes />
            </button>
          </div>
        </div>
      )}

      {/* Panel de Recompensas de Racha */}
      {showRewardsPanel && (
        <div className="calendar-rewards-panel">
          <div className="rewards-panel-header">
            <h3>
              <FaTrophy /> Recompensas de Racha
            </h3>
            <button 
              className="rewards-panel-toggle"
              onClick={() => setShowRewardsPanel(false)}
              title="Ocultar panel"
            >
              <FaTimes />
            </button>
          </div>
          <div className="rewards-list">
            {unlockedRewards.map((reward, index) => (
              <div 
                key={reward.days} 
                className={`reward-item ${reward.unlocked ? 'unlocked' : reward.next ? 'next' : 'locked'}`}
              >
                <div className="reward-emoji">{reward.emoji}</div>
                <div className="reward-info">
                  <div className="reward-days">
                    {reward.days} días {reward.unlocked && '✓'}
                  </div>
                  <div className="reward-name">{reward.reward}</div>
                  <div className="reward-description">{reward.description}</div>
                  {!reward.unlocked && (
                    <div className="reward-progress">
                      {streak < reward.days ? (
                        <span className="progress-text">
                          {reward.days - streak} días restantes
                        </span>
                      ) : null}
                      <div className="progress-bar">
                        <div 
                          className="progress-fill" 
                          style={{ width: `${Math.min((streak / reward.days) * 100, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!showRewardsPanel && (
        <button 
          className="show-rewards-btn"
          onClick={() => setShowRewardsPanel(true)}
          title="Mostrar recompensas"
        >
          <FaTrophy /> Ver Recompensas
        </button>
      )}

      <div className="daily-calendar">
        {/* Header del calendario */}
        <div className="calendar-header">
        <button 
          className="calendar-nav" 
          onClick={handlePrevMonth} 
          title="Mes anterior"
          disabled={loading}
        >
          <FaChevronLeft />
        </button>
        <h3 className="calendar-title">
          <FaCalendarAlt />
          {capitalizeFirst(getMonthName(month))} {year}
        </h3>
        <button 
          className="calendar-nav" 
          onClick={handleNextMonth} 
          title="Mes siguiente"
          disabled={loading}
        >
          <FaChevronRight />
        </button>
      </div>

      {/* Barra de progreso */}
      <div className="calendar-progress-bar">
        <div className="calendar-progress" style={{width: `${progress}%`}}></div>
        <span className="calendar-progress-label">{progress}% completado</span>
      </div>

      {/* Días de la semana */}
      <div className="calendar-weekdays">
        {WEEKDAYS.map(day => (
          <div key={day} className="calendar-weekday">
            {day}
          </div>
        ))}
      </div>

      {/* Grid del calendario */}
      <div className="calendar-grid">
        {calendarDays.map((day, index) => {
          if (day === null) {
            return <div key={`empty-${index}`} className="calendar-day locked" />;
          }

          const isToday = isCurrentMonth && day === today.getDate();
          const claimed = claimedDays.includes(day);
          const isReward = REWARD_DAYS.includes(day);
          const canClaim = isToday && !claimed && !isClaiming;
          const isLocked = !isToday && !claimed;

          return (
            <div
              key={day}
              className={`calendar-day ${
                claimed ? 'claimed' : 
                isToday ? 'today' : 
                isReward ? 'reward' : 
                isLocked ? 'locked' : ''
              }`}
              title={
                isReward ? `¡Día de regalo especial!` : 
                claimed ? `Día ${day}: Reclamado` : 
                canClaim ? `Día ${day}: ¡Reclama hoy!` : 
                isLocked ? `Día ${day}: Bloqueado` : 
                `Día ${day}`
              }
              onClick={() => canClaim && handleClaim(day)}
              tabIndex={canClaim ? 0 : -1}
              role={canClaim ? "button" : "gridcell"}
              aria-label={
                isReward ? `Día ${day}: regalo especial` : 
                claimed ? `Día ${day}: reclamado` : 
                canClaim ? `Día ${day}: reclama hoy` : 
                `Día ${day}: bloqueado`
              }
            >
              {claimed ? (
                <FaCheckCircle className="calendar-icon" />
              ) : isReward ? (
                <FaGift className="calendar-icon pulse" />
              ) : isToday ? (
                isClaiming ? (
                  <FaSpinner className="calendar-icon fa-spin" />
                ) : (
                  <FaGift className="calendar-icon pulse" />
                )
              ) : (
                <FaLock className="calendar-icon" />
              )}
              
              <span className="calendar-day-number">{day}</span>
              
              {isReward && <span className="calendar-reward-label">✨</span>}
              {isToday && !claimed && <span className="calendar-today-label">Hoy</span>}
            </div>
          );
        })}
      </div>

      {/* Información de racha */}
      <div className="calendar-streak">
        <div className="streak-info">
          <div className="streak-item">
            <FaFire className="streak-icon" />
            <span className="streak-label">Racha actual</span>
            <span className="streak-value">{streak} días</span>
          </div>
          <div className="streak-item">
            <FaTrophy className="streak-icon" />
            <span className="streak-label">Mejor racha</span>
            <span className="streak-value">{longestStreak} días</span>
          </div>
          <div className="streak-item">
            <FaStar className="streak-icon" />
            <span className="streak-label">Total reclamado</span>
            <span className="streak-value">{totalClaims} días</span>
          </div>
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="calendar-loading">
          <div className="spinner"></div>
          <p>Cargando calendario...</p>
        </div>
      )}

      {/* Modal de recompensa mejorado */}
      {showReward && typeof showReward === 'object' && showReward.emoji && (
        <div className="calendar-reward-modal" onClick={closeRewardModal}>
          <div className="calendar-reward-content" onClick={(e) => e.stopPropagation()}>
            <button className="calendar-reward-close" onClick={closeRewardModal}>
              <FaTimes />
            </button>
            <div className="calendar-reward-emoji-large">{showReward.emoji}</div>
            <div className="calendar-reward-text">
              <div className="calendar-reward-title">🎉 ¡FELICIDADES! 🎉</div>
              <div className="calendar-reward-subtitle">Has alcanzado {showReward.days} días de racha</div>
              <div className="calendar-reward-description">{showReward.reward}</div>
              {showReward.description && (
                <div className="calendar-reward-details">{showReward.description}</div>
              )}
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
