import React, { useEffect, useMemo, useRef, useState } from 'react';
import './Stats.css';
import { FaUsers, FaClock, FaStar, FaTrophy } from 'react-icons/fa';

function useCountUpOnView(endValue, options = {}) {
  const { duration = 900 } = options;
  const ref = useRef(null);
  const [display, setDisplay] = useState(0);
  const [started, setStarted] = useState(false);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      setDisplay(endValue || 0);
      return;
    }
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !started) {
          setStarted(true);
          const startTs = performance.now();
          const startVal = 0;
          const endVal = Number(endValue) || 0;
          const step = (ts) => {
            const t = Math.min(1, (ts - startTs) / duration);
            const eased = 1 - Math.pow(1 - t, 3);
            setDisplay(Math.floor(startVal + (endVal - startVal) * eased));
            if (t < 1) requestAnimationFrame(step);
            else setDisplay(endVal);
          };
          requestAnimationFrame(step);
        }
      });
    }, { threshold: 0.3 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [endValue, duration, started]);
  return { ref, display };
}

function formatNumber(value) {
  const n = Number(value) || 0;
  try {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, '')}K`;
    return new Intl.NumberFormat('es-ES').format(n);
  } catch {
    return String(n);
  }
}

const Stats = ({ memberCount, totalMembers }) => {
  const data = useMemo(() => ([
    { icon: <FaUsers />, value: Number(memberCount) || 0, label: 'Miembros Activos', color: '#4a90e2' },
    { icon: <FaUsers />, value: Number(totalMembers) || 0, label: 'Miembros Totales', color: '#6366f1' },
    { icon: <FaClock />, value: null, label: 'Servidor Online', text: '24/7', color: '#4ade80' },
    { icon: <FaStar />, value: null, label: 'Roles Únicos', text: '100+', color: '#fbbf24' },
    { icon: <FaTrophy />, value: null, label: 'Eventos Mensuales', text: '50+', color: '#f87171' }
  ]), [memberCount, totalMembers]);

  return (
    <section className="stats" aria-label="Estadísticas del servidor">
      <div className="container">
        <div className="stats-grid">
          {data.map((stat, index) => {
            if (stat.value == null) {
              return (
                <div key={index} className="stat-card" style={{ '--stat-color': stat.color }} role="status" aria-label={`${stat.label}: ${stat.text}`}>
                  <div className="stat-icon" aria-hidden>{stat.icon}</div>
                  <div className="stat-number">{stat.text}</div>
                  <div className="stat-label">{stat.label}</div>
                </div>
              );
            }
            const { ref, display } = useCountUpOnView(stat.value, { duration: 900 });
            return (
              <div key={index} ref={ref} className="stat-card" style={{ '--stat-color': stat.color }} role="status" aria-label={`${stat.label}: ${stat.value}`}>
                <div className="stat-icon" aria-hidden>{stat.icon}</div>
                <div className="stat-number">{formatNumber(display)}</div>
                <div className="stat-label">{stat.label}</div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Stats; 