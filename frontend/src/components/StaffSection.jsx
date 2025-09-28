import { apiUrl } from '../utils/api';
import React from 'react';
import './StaffSection.css';
import { FaCrown, FaShieldAlt, FaUserTie, FaUsers } from 'react-icons/fa';
// Importa tus imágenes de avatares locales en assets y pon el nombre de cada staff
// Ejemplo:
// import adminAvatar from '../assets/admin.png';
// import modAvatar from '../assets/mod.png';
// ...

// Permite usar nombre o ID. Si es nombre, busca el ID en la API de Roblox

import { useEffect, useState } from 'react';

// Mueve staffMembers fuera del componente para evitar recreación en cada render
const staffMembers = [
  {
    name: "Dueño",
    role: "BijjouPro08",
    robloxUserId: "BijjouPro08", // Cambia este ID por el del usuario de Roblox
    color: "#ffd700",
    icon: <FaCrown />
  },
  {
    name: "Co-Dueño",
    role: "Mimi_YTgamer100",
    robloxUserId: "1400001231", // Cambia este ID por el del usuario de Roblox
    color: "#ff6b6b",
    icon: <FaShieldAlt />
  },
  {
    name: "Co-Dueño",
    role: "Sergiojpni",
    robloxUserId: "Sergiojpni",
    color: "#4ecdc4",
    icon: <FaUserTie />
  },
  {
    name: "Fundador",
    role: "gamessss5025",
    robloxUserId: "gamessss5025",
    color: "#030968ff",
    icon: <FaUsers />
  },
  {
    name: "Vacio",
    role: "Vacio",
    robloxUserId: "Vacio",
    color: "#96ceb4",
    icon: <FaUsers />
  },
  {
    name: "Vacio",
    role: "Vacio",
    robloxUserId: "",
    color: "#feca57",
    icon: <FaUsers />
  }
];


// Devuelve la URL real del avatar usando el endpoint backend (sin CORS)
async function fetchRobloxAvatarUrl(userId) {
  try {
    const res = await fetch(`/api/backend/roblox/avatar/${userId}`);
    const data = await res.json();
    if (data && data.url) return data.url;
  } catch {}
  return null;
}

// Hook para obtener el userId si se pasa nombre
function useRobloxUserId(identifier) {
  const [resolvedId, setResolvedId] = useState(null);

  useEffect(() => {
    if (/^\d+$/.test(identifier)) {
      setResolvedId(identifier);
      return;
    }
    // Si es nombre, consulta el backend
    const fetchId = async () => {
      try {
        const res = await fetch(apiUrl('/api/backend/roblox/resolve'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: identifier })
        });
        const data = await res.json();
        if (data && data.id && /^\d+$/.test(data.id)) {
          setResolvedId(data.id);
        } else {
          setResolvedId(null);
        }
      } catch (e) {
        setResolvedId(null);
      }
    };
    fetchId();
  }, [identifier]);
  return resolvedId;
}
const StaffSection = () => {
  const getRoleColor = (role) => {
    const roleColors = {
      'BijjouPro08': '#ffd700',
      'Mimi_YTgamer100': '#17ccc0ff',
      'Sergiojpni': '#17ccc0ff',
      'Soporte': '#45b7d1',
      'Eventos': '#96ceb4',
      'Constructor': '#feca57'
    };
    return roleColors[role] || '#7289da';
  };

  // Resolver todos los IDs de Roblox (por nombre o ID) solo una vez, de forma robusta
  const [resolvedIds, setResolvedIds] = useState({});

  useEffect(() => {
    async function resolveAllStaffIds() {
      const results = {};
      await Promise.all(
        staffMembers.map(async member => {
          const identifier = member.robloxUserId;
          if (/^\d+$/.test(identifier)) {
            results[identifier] = identifier;
          } else {
            try {
              const res = await fetch(apiUrl('/api/backend/roblox/resolve'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: identifier })
              });
              const data = await res.json();
              if (data && data.id && /^\d+$/.test(data.id)) {
                results[identifier] = data.id;
              } else {
                results[identifier] = null;
              }
            } catch {
              results[identifier] = null;
            }
          }
        })
      );
      setResolvedIds(results);
    }
    resolveAllStaffIds();
  }, []);

  return (
    <section id="staff" className="staff-section">
      <div className="container">
        <div className="staff-header">
          <h2 className="staff-title">
            Nuestro <span className="highlight">Equipo</span>
          </h2>
          <p className="staff-subtitle">
            Conoce a los miembros del staff que hacen posible SpainRP
          </p>
        </div>

        <div className="staff-grid">
          {staffMembers.map((member, index) => {
            const identifier = member.robloxUserId;
            const resolvedId = resolvedIds[identifier];
            const [avatarUrl, setAvatarUrl] = React.useState(null);

            React.useEffect(() => {
              let mounted = true;
              if (resolvedId && /^\d+$/.test(resolvedId) && resolvedId.length < 12) {
                fetchRobloxAvatarUrl(resolvedId).then(url => {
                  if (mounted) setAvatarUrl(url);
                });
              } else {
                setAvatarUrl(null);
              }
              return () => { mounted = false; };
            }, [resolvedId]);

            return (
              <div
                key={index}
                className="staff-card"
                style={{ '--role-color': getRoleColor(member.role) }}
              >
                <div className="staff-avatar-container">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={`Avatar de Roblox de ${member.name}`}
                      className="staff-avatar"
                      onError={e => {
                        e.target.onerror = null;
                        e.target.src = '/vite.svg';
                      }}
                    />
                  ) : (
                    <div className="staff-avatar staff-avatar-placeholder">
                      {member.name.charAt(0)}
                    </div>
                  )}
                  <div className="staff-role-badge">
                    {member.icon}
                  </div>
                </div>
                <div className="staff-info">
                  <h3 className="staff-name">{member.name}</h3>
                  <span className="staff-role">{member.role}</span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="staff-cta">
          <p>¿Quieres formar parte de nuestro equipo?</p>
          <a 
            href="https://discord.gg/sMzFgFQHXA" 
            target="_blank" 
            rel="noopener noreferrer"
            className="btn btn-secondary"
          >
            Únete a Discord
          </a>
        </div>
      </div>
    </section>
  );
};

export default StaffSection; 