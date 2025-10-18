import React, { useState, useEffect, useCallback } from 'react';
import { FaChevronLeft, FaChevronRight, FaGift, FaCheckCircle, FaLock, FaSpinner } from 'react-icons/fa';
import { apiUrl } from '../utils/api';
import './ModernCalendar.css';

const WEEKDAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year, month) {
  return new Date(year, month, 1).getDay();
}

function getMonthName(month) {
  return new Date(2025, month, 1).toLocaleString('es-ES', { month: 'long' });
}

function capitalizeFirst(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export default function ModernCalendar() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [claimedDays, setClaimedDays] = useState([]);
  const [streak, setStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);
  const [totalClaims, setTotalClaims] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isClaiming, setIsClaiming] = useState(false);

  // Solo mostrar el día actual
  const currentDay = today.getDate();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  // Cargar datos del calendario
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
      } else {
        throw new Error('Error loading calendar data');
      }
    } catch (error) {
      console.error('Error loading calendar:', error);
      setClaimedDays([]);
      setStreak(0);
      setLongestStreak(0);
      setTotalClaims(0);
    } finally {
      setLoading(false);
    }
  }, [year, month]);

  useEffect(() => {
    loadCalendarData();
  }, [loadCalendarData]);

  // Reclamar día
  const claimDay = async (day) => {
    if (isClaiming) return;
    
    setIsClaiming(true);
    try {
      const today = new Date();
      const claimYear = today.getFullYear();
      const claimMonth = today.getMonth() + 1;
      const claimDay = today.getDate();
      
      console.log('[CALENDAR] Claiming day:', { year: claimYear, month: claimMonth, day: claimDay });
      console.log('[CALENDAR] Current date:', today.toISOString());
      
      const response = await fetch(apiUrl('/api/calendar/claim'), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('spainrp_token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          year: claimYear,
          month: claimMonth,
          day: claimDay
        })
      });

      console.log('[CALENDAR] Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('[CALENDAR] Success data:', data);
        setClaimedDays(prev => [...prev, day]);
        setStreak(data.streak || streak + 1);
        setLongestStreak(data.longestStreak || Math.max(longestStreak, data.streak || streak + 1));
        setTotalClaims(data.totalClaims || totalClaims + 1);
      } else {
        const errorData = await response.json();
        console.error('[CALENDAR] Error response:', errorData);
        
        let errorMessage = errorData.error || 'Error al reclamar el día';
        if (errorData.details) {
          errorMessage += `\n\nDetalles:\nHoy: ${errorData.details.today.year}/${errorData.details.today.month}/${errorData.details.today.day}\nSolicitado: ${errorData.details.requested.year}/${errorData.details.requested.month}/${errorData.details.requested.day}`;
        }
        
        alert(errorMessage);
      }
    } catch (error) {
      console.error('[CALENDAR] Error claiming day:', error);
      alert('Error al reclamar el día');
    } finally {
      setIsClaiming(false);
    }
  };

  // Solo mostrar el día actual
  const isToday = (day) => {
    return day === currentDay && month === currentMonth && year === currentYear;
  };

  const isClaimed = (day) => {
    return claimedDays.includes(day);
  };

  const canClaim = (day) => {
    return isToday(day) && !isClaimed(day) && !isClaiming;
  };

  // Solo mostrar el día actual en el calendario
  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    
    // Crear array de días del mes
    const days = [];
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }

    return (
      <div className="modern-calendar-grid">
        {WEEKDAYS.map(day => (
          <div key={day} className="calendar-weekday">
            {day}
          </div>
        ))}
        
        {/* Espacios vacíos para el primer día del mes */}
        {Array.from({ length: firstDay }, (_, i) => (
          <div key={`empty-${i}`} className="calendar-day empty"></div>
        ))}
        
        {/* Solo mostrar el día actual */}
        {days.map(day => {
          if (!isToday(day)) return null;
          
          return (
            <div
              key={day}
              className={`calendar-day ${isClaimed(day) ? 'claimed' : ''} ${canClaim(day) ? 'claimable' : ''} ${isToday(day) ? 'today' : ''}`}
              onClick={() => canClaim(day) && claimDay(day)}
            >
              <div className="day-number">{day}</div>
              {isClaimed(day) && (
                <div className="day-status">
                  <FaCheckCircle />
                </div>
              )}
              {canClaim(day) && (
                <div className="day-claim">
                  <FaGift />
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="modern-calendar-container">
        <div className="calendar-loading">
          <FaSpinner className="spinner" />
          <p>Cargando calendario...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="modern-calendar-container">
      <div className="calendar-header">
        <h2>Registro Diario</h2>
        <p>Mantén tu racha diaria para obtener recompensas</p>
      </div>

      <div className="calendar-content">
        <div className="calendar-month-header">
          <button 
            className="month-nav-btn"
            onClick={() => {
              const newMonth = month - 1;
              if (newMonth < 0) {
                setMonth(11);
                setYear(year - 1);
              } else {
                setMonth(newMonth);
              }
            }}
            disabled={month === currentMonth && year === currentYear}
          >
            <FaChevronLeft />
          </button>
          
          <h3 className="month-title">
            {capitalizeFirst(getMonthName(month))} {year}
          </h3>
          
          <button 
            className="month-nav-btn"
            onClick={() => {
              const newMonth = month + 1;
              if (newMonth > 11) {
                setMonth(0);
                setYear(year + 1);
              } else {
                setMonth(newMonth);
              }
            }}
          >
            <FaChevronRight />
          </button>
        </div>

        {renderCalendar()}

        <div className="calendar-stats">
          <div className="stat-item">
            <div className="stat-value">{streak}</div>
            <div className="stat-label">Racha actual</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{longestStreak}</div>
            <div className="stat-label">Mejor racha</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{totalClaims}</div>
            <div className="stat-label">Total reclamado</div>
          </div>
        </div>

        {/* Recompensa especial solo el 31 de octubre */}
        {month === 9 && currentDay === 31 && (
          <div className="special-reward">
            <div className="reward-icon">
              <FaGift />
            </div>
            <div className="reward-content">
              <h4>¡Recompensa Especial!</h4>
              <p>Hoy es Halloween - Reclama tu recompensa especial</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
