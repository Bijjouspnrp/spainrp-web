import { apiUrl } from './utils/api';
import React, { useState, useEffect } from "react";
import DiscordUserBar from '../DiscordUserBar';

const BancoCentralRP = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saldo, setSaldo] = useState(1500);
  const [msg, setMsg] = useState("");
  const [monto, setMonto] = useState("");

  useEffect(() => {
    fetch(apiUrl('/auth/me'), { credentials: 'include' })
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data && data.user) setUser(data.user);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleDepositar = () => {
    const cantidad = parseInt(monto);
    if (isNaN(cantidad) || cantidad <= 0) {
      setMsg('Introduce una cantidad válida');
      setTimeout(() => setMsg(''), 2000);
      return;
    }
    setSaldo(saldo + cantidad);
    setMsg(`Has depositado €${cantidad}`);
    setMonto("");
    setTimeout(() => setMsg(''), 2000);
  };

  const handleRetirar = () => {
    const cantidad = parseInt(monto);
    if (isNaN(cantidad) || cantidad <= 0 || cantidad > saldo) {
      setMsg('Cantidad inválida o insuficiente');
      setTimeout(() => setMsg(''), 2000);
      return;
    }
    setSaldo(saldo - cantidad);
    setMsg(`Has retirado €${cantidad}`);
    setMonto("");
    setTimeout(() => setMsg(''), 2000);
  };

  if (loading) return null;
  if (!user) {
    return (
      <div className="banco-bg">
        <DiscordUserBar />
        <div className="banco-header">
          <span>BANCO CENTRAL RP SPAINRP</span>
        </div>
        <div style={{textAlign:'center',marginTop:'120px',color:'#fff'}}>
          <h2>Debes iniciar sesión con Discord para acceder al Banco Central RP.</h2>
          <a href="/auth/login" style={{background:'#7289da',color:'#fff',borderRadius:8,padding:'0.7rem 1.5rem',fontWeight:700,textDecoration:'none',fontSize:'1.2rem'}}>Iniciar sesión</a>
        </div>
        <div className="banco-footer">
          <span>Acceso solo para usuarios logueados Discord. Gestiona tu dinero RP.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="banco-bg">
      <DiscordUserBar />
      <div style={{minHeight:'100vh', background:'linear-gradient(135deg,#f4f4f7 60%,#7289da10 100%)', color:'#222', padding:'2rem 0'}}>
        <div style={{maxWidth:400, margin:'0 auto', padding:'2rem'}}>
          <h1 style={{textAlign:'center', fontSize:'2.3rem', fontWeight:800, marginBottom:'2rem', letterSpacing:1, color:'#7289da'}}>Banco Central RP</h1>
          <div style={{background:'#fff', borderRadius:18, padding:'2rem', boxShadow:'0 4px 16px #7289da22'}}>
            <strong style={{fontSize:'1.1rem'}}>Tu saldo:</strong>
            <div style={{fontSize:'2rem', color:'#00cdbc', fontWeight:700, margin:'1.2rem 0'}}>
              €{saldo}
            </div>
            <input
              type="number"
              placeholder="Cantidad..."
              value={monto}
              onChange={e => setMonto(e.target.value)}
              style={{width:'100%', margin:'0.7rem 0', padding:'0.7rem', borderRadius:8, border:'1px solid #ccc'}}
            />
            <div style={{display:'flex', gap:'1rem', marginTop:'1rem', justifyContent:'center'}}>
              <button
                style={{background:'#00cdbc', color:'#fff', border:'none', borderRadius:8, padding:'0.7rem 1.5rem', fontWeight:700, cursor:'pointer'}}
                onClick={handleDepositar}
              >Depositar</button>
              <button
                style={{background:'#e74c3c', color:'#fff', border:'none', borderRadius:8, padding:'0.7rem 1.5rem', fontWeight:700, cursor:'pointer'}}
                onClick={handleRetirar}
              >Retirar</button>
            </div>
            {msg && <div style={{background:'#7289da', color:'#fff', borderRadius:8, padding:'0.7rem', textAlign:'center', marginTop:'1rem', fontWeight:600}}>{msg}</div>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BancoCentralRP;
