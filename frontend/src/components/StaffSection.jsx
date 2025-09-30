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
    robloxUserId: "Vacio",
    color: "#feca57",
    icon: <FaUsers />
  }
];


// Devuelve la URL real del avatar usando el endpoint backend (sin CORS)
async function fetchRobloxAvatarUrl(userId) {
  try {
    const res = await fetch(apiUrl(`/api/backend/roblox/avatar/${userId}`));
    if (!res.ok) {
      console.warn(`[StaffSection] Error obteniendo avatar para ${userId}:`, res.status);
      return null;
    }
    const data = await res.json();
    if (data && data.url) {
      console.log(`[StaffSection] Avatar obtenido para ${userId}:`, data.url);
      return data.url;
    }
  } catch (e) {
    console.error(`[StaffSection] Error en fetchRobloxAvatarUrl para ${userId}:`, e);
  }
  return null;
}

// Hook para obtener el userId si se pasa nombre
function useRobloxUserId(identifier) {
  const [resolvedId, setResolvedId] = useState(null);

  useEffect(() => {
    if (!identifier || identifier.trim() === '') {
      setResolvedId(null);
      return;
    }
    
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

// Componente separado para cada miembro del staff
function StaffMemberCard({ member, resolvedId, getRoleColor }) {
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [avatarLoading, setAvatarLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    
    if (resolvedId && /^\d+$/.test(resolvedId)) {
      console.log(`[StaffSection] Obteniendo avatar para ${member.name} (ID: ${resolvedId})`);
      setAvatarLoading(true);
      
      fetchRobloxAvatarUrl(resolvedId).then(url => {
        if (mounted) {
          console.log(`[StaffSection] Avatar para ${member.name}:`, url);
          setAvatarUrl(url);
          setAvatarLoading(false);
        }
      }).catch(e => {
        console.error(`[StaffSection] Error obteniendo avatar para ${member.name}:`, e);
        if (mounted) {
          setAvatarUrl(null);
          setAvatarLoading(false);
        }
      });
    } else {
      console.log(`[StaffSection] No hay ID resuelto para ${member.name}`);
      setAvatarUrl(null);
      setAvatarLoading(false);
    }
    
    return () => { mounted = false; };
  }, [resolvedId, member.name]);

  return (
    <div
      className="staff-card"
      style={{ '--role-color': getRoleColor(member.role) }}
    >
      <div className="staff-avatar-container">
        {avatarLoading ? (
          <div className="staff-avatar staff-avatar-loading">
            <div style={{ 
              width: '20px', 
              height: '20px', 
              border: '2px solid #f3f3f3',
              borderTop: '2px solid #7289da',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }}></div>
          </div>
        ) : avatarUrl ? (
          <img
            src={avatarUrl}
            alt={`Avatar de Roblox de ${member.name}`}
            className="staff-avatar"
            onError={e => {
              console.warn(`[StaffSection] Error cargando imagen para ${member.name}`);
              e.target.onerror = null;
              e.target.src = '/vite.svg';
            }}
            onLoad={() => console.log(`[StaffSection] Avatar cargado para ${member.name}`)}
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
        {resolvedId && (
          <small style={{ color: '#666', fontSize: '0.8rem' }}>
            ID: {resolvedId}
          </small>
        )}
      </div>
    </div>
  );
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function resolveAllStaffIds() {
      console.log('[StaffSection] Iniciando resolución de IDs de Roblox...');
      const results = {};
      
      for (const member of staffMembers) {
        const identifier = member.robloxUserId;
        console.log(`[StaffSection] Procesando miembro: ${member.name} (${identifier})`);
        
        if (!identifier || identifier.trim() === '' || identifier === 'Vacio') {
          console.log(`[StaffSection] Saltando ${member.name} - identificador vacío`);
          results[identifier] = null;
          continue;
        }
        
        if (/^\d+$/.test(identifier)) {
          console.log(`[StaffSection] ${member.name} ya tiene ID numérico: ${identifier}`);
          results[identifier] = identifier;
        } else {
          try {
            console.log(`[StaffSection] Resolviendo nombre de usuario: ${identifier}`);
            const res = await fetch(apiUrl('/api/backend/roblox/resolve'), {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ username: identifier })
            });
            
            if (!res.ok) {
              console.warn(`[StaffSection] Error HTTP al resolver ${identifier}:`, res.status);
              results[identifier] = null;
              continue;
            }
            
            const data = await res.json();
            console.log(`[StaffSection] Respuesta para ${identifier}:`, data);
            
            if (data && data.id && /^\d+$/.test(data.id)) {
              console.log(`[StaffSection] ${identifier} resuelto a ID: ${data.id}`);
              results[identifier] = data.id;
            } else {
              console.warn(`[StaffSection] No se pudo resolver ${identifier}:`, data);
              results[identifier] = null;
            }
          } catch (e) {
            console.error(`[StaffSection] Error resolviendo ${identifier}:`, e);
            results[identifier] = null;
          }
        }
      }
      
      console.log('[StaffSection] IDs resueltos:', results);
      setResolvedIds(results);
      setLoading(false);
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
          {loading ? (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '2rem' }}>
              <div style={{ 
                display: 'inline-block', 
                width: '40px', 
                height: '40px', 
                border: '4px solid #f3f3f3',
                borderTop: '4px solid #7289da',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }}></div>
              <p style={{ marginTop: '1rem', color: '#666' }}>Cargando avatares de Roblox...</p>
            </div>
          ) : (
            staffMembers.map((member, index) => (
              <StaffMemberCard 
                key={index} 
                member={member} 
                resolvedId={resolvedIds[member.robloxUserId]}
                getRoleColor={getRoleColor}
              />
            ))
          )}
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
      
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        .staff-avatar-loading {
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f0f0f0;
          border-radius: 50%;
        }
      `}</style>
    </section>
  );
};

export default StaffSection; 