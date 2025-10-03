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
  FaStar
} from 'react-icons/fa';
import './DailyCalendar.css';

const REWARD_DAYS = [7, 14, 21, 30];
const REWARDS = [
  'Monedas extra',
  'Badge especial',
  'Acceso VIP',
  'Rol Discord',
  'Minijuego desbloqueado',
  'Sorteo mensual',
  'Multiplicador de XP',
  'Caja misteriosa',
  'Skin exclusiva',
  'Poder especial',
  'Descuento en tienda',
  'Experiencia bonus'
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
    if (claimedDays.includes(day) || isClaiming ||
      year !== today.getFullYear() || month !== today.getMonth() || day !== today.getDate()) {
      return;
    }

    setIsClaiming(true);
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
        
        // Mostrar recompensa si se proporciona
        if (data.reward) {
          setShowReward(data.reward);
          setTimeout(() => setShowReward(null), 5000);
        }
      } else {
        throw new Error('Error claiming day');
      }
    } catch (error) {
      console.error('Error claiming day:', error);
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

  return (
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

      {/* Modal de recompensa */}
      {showReward && (
        <div className="calendar-reward-modal" onClick={closeRewardModal}>
          <div className="calendar-reward-content" onClick={(e) => e.stopPropagation()}>
            <FaGift className="calendar-reward-icon" />
            <div className="calendar-reward-text">
              <div className="calendar-reward-title">¡Recompensa desbloqueada!</div>
              <div className="calendar-reward-description">{showReward}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
