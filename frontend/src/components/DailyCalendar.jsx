import { apiUrl } from '../utils/api';

import React, { useState, useEffect } from 'react';
import { FaGift, FaCheckCircle, FaLock, FaCalendarAlt, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
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
  'Caja misteriosa'
];

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function getRandomReward() {
  return REWARDS[Math.floor(Math.random() * REWARDS.length)];
}

function getMonthName(month) {
  return new Date(2025, month, 1).toLocaleString('es-ES', { month: 'long' });
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

  // Responsive: ajustar columnas según pantalla
  const [columns, setColumns] = useState(7);
  useEffect(() => {
    function handleResize() {
      setColumns(window.innerWidth < 600 ? 4 : 7);
    }
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Cargar progreso desde backend
  useEffect(() => {
    setLoading(true);
    fetch(apiUrl(`/api/calendar?year=${year}&month=${month+1}`), {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('spainrp_token')}`,
        'Content-Type': 'application/json'
      }
    })
      .then(res => res.json())
      .then(data => {
        setClaimedDays(data.claimedDays || []);
        setStreak(data.streak || 0);
        setLongestStreak(data.longestStreak || 0);
        setTotalClaims(data.totalClaims || 0);
        setLoading(false);
        setProgress(data.progress || 0);
      })
      .catch(() => {
        setClaimedDays([]);
        setStreak(0);
        setLongestStreak(0);
        setTotalClaims(0);
        setLoading(false);
        setProgress(0);
      });
  }, [year, month]);

  // Reclamar día y guardar en backend
  const handleClaim = (day) => {
    if (claimedDays.includes(day) ||
      year !== today.getFullYear() || month !== today.getMonth() || day !== today.getDate()) return;
    setLoading(true);
    fetch(apiUrl('/api/calendar/claim'), {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${localStorage.getItem('spainrp_token')}`,
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify({ year, month: month+1, day })
    })
      .then(res => res.json())
      .then(data => {
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
        setLoading(false);
      })
      .catch(() => setLoading(false));
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

  const daysInMonth = getDaysInMonth(year, month);
  const isCurrentMonth = year === today.getFullYear() && month === today.getMonth();

  return (
    <div className="daily-calendar">
      <div className="calendar-header">
        <button className="calendar-nav" onClick={handlePrevMonth} title="Mes anterior"><FaChevronLeft /></button>
        <h3 className="calendar-title"><FaCalendarAlt style={{marginRight:8}}/> {getMonthName(month)} {year}</h3>
        <button className="calendar-nav" onClick={handleNextMonth} title="Mes siguiente"><FaChevronRight /></button>
      </div>
      <div className="calendar-progress-bar">
        <div className="calendar-progress" style={{width: `${progress}%`}}></div>
        <span className="calendar-progress-label">{progress}% completado</span>
      </div>
      <div className="calendar-grid" style={{gridTemplateColumns: `repeat(${columns}, 1fr)`}}>
        {[...Array(daysInMonth)].map((_, i) => {
          const day = i + 1;
          const isToday = isCurrentMonth && day === today.getDate();
          const claimed = claimedDays.includes(day);
          const isReward = REWARD_DAYS.includes(day);
          return (
            <div
              key={day}
              className={`calendar-day${claimed ? ' claimed' : ''}${isToday ? ' today' : ''}${isReward ? ' reward' : ''}`}
              title={isReward ? `¡Día de regalo!` : claimed ? 'Reclamado' : isToday ? 'Reclama hoy' : 'Bloqueado'}
              onClick={() => handleClaim(day)}
              tabIndex={0}
              aria-label={isReward ? `Día ${day}: regalo especial` : claimed ? `Día ${day}: reclamado` : isToday ? `Día ${day}: reclama hoy` : `Día ${day}: bloqueado`}
            >
              {claimed ? <FaCheckCircle className="calendar-icon" /> : isReward ? <FaGift className="calendar-icon pulse" /> : isToday ? <FaGift className="calendar-icon pulse" /> : <FaLock className="calendar-icon" />}
              <span className="calendar-day-number">{day}</span>
              {isReward && <span className="calendar-reward-label">🎁</span>}
              {isToday && !claimed && <span className="calendar-today-label">Hoy</span>}
            </div>
          );
        })}
      </div>
      <div className="calendar-streak">
        <div className="streak-info">
          <div className="streak-item">
            <span className="streak-label">Racha actual:</span>
            <span className="streak-value">{streak} días</span>
          </div>
          <div className="streak-item">
            <span className="streak-label">Mejor racha:</span>
            <span className="streak-value">{longestStreak} días</span>
          </div>
          <div className="streak-item">
            <span className="streak-label">Total reclamado:</span>
            <span className="streak-value">{totalClaims} días</span>
          </div>
        </div>
      </div>
      {loading && <div className="calendar-loading">Cargando...</div>}
      {showReward && (
        <div className="calendar-reward-modal">
          <FaGift className="calendar-reward-icon" />
          <div className="calendar-reward-text">
            <span className="calendar-reward-title">¡Has desbloqueado un regalo especial!</span><br />
            <b>{showReward}</b>
          </div>
        </div>
      )}
    </div>
  );
}
