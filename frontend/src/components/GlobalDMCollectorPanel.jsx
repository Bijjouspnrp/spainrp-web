import React, { useEffect, useState } from 'react';

function GlobalDMCollectorPanel() {
  const [dmMessages, setDmMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('');
  const [userFilter, setUserFilter] = useState('');

  useEffect(() => {
    setLoading(true);
    fetch('/api/discord/dmcollector')
      .then(res => res.json())
      .then(data => {
        setDmMessages(data.messages || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Filtro por contenido y usuario
  const filtered = dmMessages.filter(msg =>
    (!filter || msg.content.toLowerCase().includes(filter.toLowerCase())) &&
    (!userFilter || msg.userId === userFilter)
  );

  return (
    <div style={{margin:'2rem 0',background:'rgba(255,255,255,0.07)',borderRadius:16,padding:'2rem'}}>
      <h3 style={{color:'#FFD700',fontWeight:800,fontSize:'1.2rem',marginBottom:'1.2rem'}}>Mensajes DM globales recolectados</h3>
      <div style={{display:'flex',gap:16,marginBottom:16}}>
        <input
          type="text"
          value={filter}
          onChange={e => setFilter(e.target.value)}
          placeholder="Filtrar por contenido..."
          style={{padding:'8px 12px',borderRadius:8,border:'none',width:'50%'}}
        />
        <input
          type="text"
          value={userFilter}
          onChange={e => setUserFilter(e.target.value)}
          placeholder="Filtrar por ID de usuario..."
          style={{padding:'8px 12px',borderRadius:8,border:'none',width:'40%'}}
        />
      </div>
      {loading ? (
        <div style={{color:'#7289da',fontWeight:700}}>Cargando mensajes...</div>
      ) : filtered.length > 0 ? (
        <ul style={{color:'#fff',fontSize:'1rem',marginLeft:18,maxHeight:260,overflowY:'auto',background:'rgba(0,0,0,0.08)',borderRadius:8,padding:'1rem'}}>
          {filtered.map((msg, i) => (
            <li key={msg.messageId || i} style={{marginBottom:8,padding:'6px 0',borderBottom:'1px solid #444'}}>
              <div><span style={{color:'#FFD700'}}>{new Date(msg.timestamp).toLocaleString()}</span></div>
              <div><b>ID usuario:</b> <span style={{color:'#7289da'}}>{msg.userId}</span></div>
              <div style={{fontSize:'0.98rem'}}>{msg.content}</div>
            </li>
          ))}
        </ul>
      ) : (
        <div style={{color:'#888',fontWeight:700}}>No hay mensajes DM globales.</div>
      )}
    </div>
  );
}

export default GlobalDMCollectorPanel;
