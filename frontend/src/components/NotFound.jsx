import React from 'react';
import spainLogo from '/assets/spainrplogo.png';

const NotFound = ({ logs }) => (
  <div style={{
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg,#23272a 0%,#7289da 100%)',
    color: '#fff',
    fontFamily: 'inherit',
    textAlign: 'center',
    padding: '2rem'
  }}>
    <img src={spainLogo} alt="SpainRP Logo" style={{width:96,height:96,borderRadius:'50%',boxShadow:'0 2px 12px #FFD70033',marginBottom:24}} />
    <h1 style={{fontSize:'4rem',fontWeight:900,color:'#FFD700',marginBottom:'1rem'}}>404</h1>
    <h2 style={{fontSize:'2rem',fontWeight:700,color:'#fff',marginBottom:'2rem'}}>Página no encontrada</h2>
    <div style={{marginBottom:'2rem',color:'#FFD700',fontWeight:600,fontSize:'1.2rem'}}>¿No encuentras lo que buscas?</div>
    <a href="https://discord.gg/sMzFgFQHXA" style={{background:'#FFD700',color:'#23272a',borderRadius:8,padding:'0.7rem 1.5rem',fontWeight:700,textDecoration:'none',fontSize:'1.2rem'}}>Unirse a SpainRP</a>
    {logs && logs.length > 0 && (
      <div style={{marginTop:'2rem',background:'rgba(255,255,255,0.08)',borderRadius:12,padding:'1rem',maxWidth:600}}>
        <b style={{color:'#FFD700'}}>Logs recientes:</b>
        <ul style={{color:'#fff',fontSize:'1rem',marginLeft:18}}>
          {logs.map((log,i)=>(
            <li key={i}>{typeof log === 'string' ? log : JSON.stringify(log)}</li>
          ))}
        </ul>
      </div>
    )}
  </div>
);

export default NotFound;
