import React, { useState, useEffect, useRef } from "react";
import DiscordUserBar from "../DiscordUserBar";
import { apiUrl } from '../../utils/api';
import SimuladorTienda from "./SimuladorTienda";

const minijuegos = [
  { nombre: "Simulador de Tienda", desc: "Gestiona tu tienda, atiende clientes y maximiza ganancias en tiempo real.", online: true, icon: "🏪" },
  { nombre: "Piedra, Papel o Tijera", desc: "Juega partidas rápidas contra otros jugadores.", online: true, icon: "✊" },
  { nombre: "Carrera de Coches RP", desc: "Compite en carreras por las calles de SpainRP.", online: true, icon: "🏎️" },
  { nombre: "Parkour Urbano", desc: "Salta entre edificios y esquivar obstáculos.", online: true, icon: "🏃" },
  { nombre: "Trivia RP", desc: "Responde preguntas sobre el mundo SpainRP.", online: true, icon: "🧠" },
  { nombre: "Adivina el número", desc: "Compite con otros usuarios para adivinar el número secreto.", online: true, icon: "🔢" }
];

const opciones = [
  { name: "Piedra", icon: "✊", color: "#7289da" },
  { name: "Papel", icon: "✋", color: "#FFD700" },
  { name: "Tijera", icon: "✌️", color: "#e74c3c" }
];

function getRandomOpcion() {
  return opciones[Math.floor(Math.random() * opciones.length)];
}

function getResultado(userPick, housePick) {
  if (userPick === housePick) return "Empate";
  if (
    (userPick === "Piedra" && housePick === "Tijera") ||
    (userPick === "Papel" && housePick === "Piedra") ||
    (userPick === "Tijera" && housePick === "Papel")
  )
    return "¡Ganaste!";
  return "Perdiste";
}


import { io } from "socket.io-client";

const PPT_ONLINE_URL = import.meta.env.VITE_PPT_URL || "https://tu-ppt.onrender.com";

const PiedraPapelTijera = () => {
  // --- Timer sala ---
  const [salaTimer, setSalaTimer] = useState(600); // 10 minutos en segundos
  const [showIdModal, setShowIdModal] = useState(false);
  const timerRef = useRef();

  const [modo, setModo] = useState(null); // "local" | "online"
  const [showReglas, setShowReglas] = useState(false);

  // --- Local ---
  const [score, setScore] = useState(0);
  const [userPick, setUserPick] = useState(null);
  const [housePick, setHousePick] = useState(null);
  const [result, setResult] = useState(null);
  const [anim, setAnim] = useState(false);

  // --- Online ---
  const [salaId, setSalaId] = useState("");
  // Usuario de Discord logueado (fetch desde backend)
  const [discordUser, setDiscordUser] = useState(null);
  const [username, setUsername] = useState("");
  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch(apiUrl("/api/auth/me"), { credentials: "include" });
        if (res.ok) {
          const user = await res.json();
          setDiscordUser(user);
          setUsername(user.username);
        } else {
          setDiscordUser(null);
          setUsername("");
        }
      } catch (e) {
        setDiscordUser(null);
        setUsername("");
      }
    }
    fetchUser();
  }, []);
  const [loginError, setLoginError] = useState("");
  const [multiLoginError, setMultiLoginError] = useState("");
  const [inSala, setInSala] = useState(false);
  const [salaState, setSalaState] = useState(null);
  const [onlinePick, setOnlinePick] = useState(null);
  // El estado esperando debe ser por usuario, no global
  const [esperando, setEsperando] = useState(false);
  const [onlineResult, setOnlineResult] = useState(null);
  const [onlineScores, setOnlineScores] = useState({});
  const socketRef = useRef(null);

  // --- Socket.IO setup ---
  useEffect(() => {
    if (modo === "online" && !socketRef.current) {
      socketRef.current = io(PPT_ONLINE_URL);
      socketRef.current.on("salaUpdate", (sala) => setSalaState(sala));
      socketRef.current.on("salaReady", (sala) => setSalaState(sala));
      // Cuando llega jugadaUpdate, sólo bloquea si tú ya jugaste
      socketRef.current.on("jugadaUpdate", (jugadas) => {
        if (jugadas && username && jugadas[username]) {
          setEsperando(true);
        } else {
          setEsperando(false);
        }
      });
      socketRef.current.on("resultado", (data) => {
        setEsperando(false);
        setOnlineResult(data);
        setOnlineScores(data.scores);
        setTimeout(() => {
          setOnlinePick(null);
          setOnlineResult(null);
        }, 2000);
      });
    }
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [modo, username]);

  // --- Local logic ---
  const handlePick = (opcion) => {
    setUserPick(opcion);
    setAnim(true);
    setTimeout(() => {
      const house = getRandomOpcion();
      setHousePick(house);
      const res = getResultado(opcion.name, house.name);
      setResult(res);
      if (res === "¡Ganaste!") setScore((s) => s + 1);
      setAnim(false);
    }, 900);
  };
  const resetGame = () => {
    setUserPick(null);
    setHousePick(null);
    setResult(null);
    setAnim(false);
  };

  // --- Online logic ---
  const crearSala = () => {
    setLoginError("");
    setMultiLoginError("");
  if (!discordUser || !discordUser.username) {
      setLoginError("Debes iniciar sesión con Discord para jugar online.");
      return;
    }
    const id = Math.random().toString(36).slice(2, 8);
  const user = discordUser.username;
  setUsername(user);
    setSalaId(id);
    setInSala(true);
    setShowIdModal(true);
    setSalaTimer(600);
    if (socketRef.current) {
      socketRef.current.emit("joinSala", { salaId: id, username: user });
    } else {
      console.warn('[PPT] Socket no inicializado al crear sala');
    }
  };
  const unirseSala = () => {
    setLoginError("");
    setMultiLoginError("");
  if (!discordUser || !discordUser.username) {
      setLoginError("Debes iniciar sesión con Discord para jugar online.");
      return;
    }
  const user = discordUser.username;
  setUsername(user);
    if (!salaId) {
      setLoginError("Debes introducir un ID de sala válido.");
      return;
    }
    // Comprobar si ya está en la sala (multi-login)
    if (salaState && salaState.jugadores && salaState.jugadores.includes(user)) {
      setMultiLoginError("Ya tienes una sesión activa en esta sala en otro navegador o pestaña.");
      return;
    }
    setInSala(true);
    setSalaTimer(600);
    if (socketRef.current) {
      socketRef.current.emit("joinSala", { salaId, username: user });
    } else {
      console.warn('[PPT] Socket no inicializado al unirse a sala');
    }
  };
  const salirSala = () => {
    socketRef.current.emit("leaveSala", { salaId, username });
    setInSala(false);
    setSalaState(null);
    setOnlinePick(null);
    setOnlineResult(null);
    setOnlineScores({});
    setSalaTimer(600);
    clearInterval(timerRef.current);
  };
  // --- Temporizador de sala ---
  useEffect(() => {
    if (inSala) {
      timerRef.current = setInterval(() => {
        setSalaTimer((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setInSala(false);
            setSalaState(null);
            setOnlinePick(null);
            setOnlineResult(null);
            setOnlineScores({});
            alert('¡El tiempo de la sala ha terminado!');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timerRef.current);
    } else {
      clearInterval(timerRef.current);
    }
  }, [inSala]);

  // Formato mm:ss
  const formatTime = (s) => {
    const m = Math.floor(s / 60).toString().padStart(2, '0');
    const ss = (s % 60).toString().padStart(2, '0');
    return `${m}:${ss}`;
  };
  const handleOnlinePick = (jugada) => {
    setOnlinePick(jugada);
    setEsperando(true);
    socketRef.current.emit("jugar", { salaId, username, jugada: jugada.name });
  };

  // --- UI ---
  if (!modo) {
    return (
      <div style={{textAlign:'center',marginTop:'2rem'}}>
        <h2 className="comic-title" style={{color:'#FFD700',fontSize:'2rem',marginBottom:'2rem'}}>¿Cómo quieres jugar?</h2>
        <button className="comic-title" style={{margin:'0 1rem 1.5rem 0',background:'#7289da',color:'#fff',border:'none',borderRadius:12,padding:'0.7rem 1.5rem',fontWeight:900,fontSize:'1.1rem',cursor:'pointer',boxShadow:'0 2px 12px #FFD70033',letterSpacing:1,textShadow:'1px 1px 0 #23272a'}} onClick={()=>setModo('local')}>VS Máquina</button>
        <button className="comic-title" style={{margin:'0 1rem 1.5rem 0',background:'#FFD700',color:'#23272a',border:'none',borderRadius:12,padding:'0.7rem 1.5rem',fontWeight:900,fontSize:'1.1rem',cursor:'pointer',boxShadow:'0 2px 12px #7289da33',letterSpacing:1,textShadow:'1px 1px 0 #23272a'}} onClick={()=>setModo('online')}>Online (2 jugadores)</button>
        <button className="comic-title" style={{background:'#23272a',color:'#FFD700',border:'none',borderRadius:12,padding:'0.7rem 1.5rem',fontWeight:900,fontSize:'1.1rem',cursor:'pointer',boxShadow:'0 2px 12px #FFD70033',letterSpacing:1,textShadow:'1px 1px 0 #23272a'}} onClick={()=>setShowReglas(true)}>Reglas</button>
        {showReglas && (
          <div style={{background:'#fff',color:'#23272a',borderRadius:16,padding:'2rem',maxWidth:400,margin:'2rem auto',boxShadow:'0 2px 12px #7289da33',position:'relative',zIndex:10}}>
            <h3 className="comic-title" style={{color:'#7289da',fontSize:'1.3rem',marginBottom:'1rem'}}>Reglas de Piedra, Papel o Tijera</h3>
            <ul style={{textAlign:'left',fontSize:16,lineHeight:1.7}}>
              <li>Elige entre Piedra (✊), Papel (✋) o Tijera (✌️).</li>
              <li>Piedra gana a Tijera, Tijera gana a Papel, Papel gana a Piedra.</li>
              <li>En modo online, crea una sala o únete con el ID. Ambos deben elegir su jugada.</li>
              <li>¡El primero en llegar a 3 puntos gana la partida!</li>
            </ul>
            <button className="comic-title" style={{marginTop:'1.2rem',background:'#7289da',color:'#fff',border:'none',borderRadius:12,padding:'0.7rem 1.5rem',fontWeight:900,fontSize:'1.1rem',cursor:'pointer',boxShadow:'0 2px 12px #FFD70033',letterSpacing:1,textShadow:'1px 1px 0 #23272a'}} onClick={()=>setShowReglas(false)}>Cerrar</button>
          </div>
        )}
      </div>
    );
  }

  if (modo === "local") {
    // ...existing local game UI (igual que antes)...
    return (
      <div className="ppt-bg" style={{background:'#181a20',borderRadius:24,padding:'2.5rem 1.5rem',marginTop:'2.5rem',boxShadow:'0 8px 32px #7289da33, 0 2px 0 #FFD700 inset',border:'3px solid #FFD700',color:'#fff',position:'relative'}}>
        <button className="comic-title" style={{marginBottom:'1.5rem',background:'#FFD700',color:'#23272a',border:'none',borderRadius:12,padding:'0.7rem 1.5rem',fontWeight:900,fontSize:'1.1rem',cursor:'pointer',boxShadow:'0 2px 12px #7289da33',letterSpacing:1,textShadow:'1px 1px 0 #23272a'}} onClick={()=>setModo(null)}>← Volver</button>
        {/* ...existing local game UI... */}
        {/* ...copiar el código de la UI local aquí... */}
        {!userPick ? (
          <div style={{ display: "flex", justifyContent: "center", gap: "2.5rem", margin: "2.5rem 0" }}>
            {opciones.map((opt) => (
              <button
                key={opt.name}
                className="comic-title"
                style={{
                  background: opt.color,
                  color: "#fff",
                  border: "none",
                  borderRadius: "50%",
                  width: 90,
                  height: 90,
                  fontSize: "2.7rem",
                  boxShadow: "0 2px 12px #23272a33",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "transform 0.2s",
                  cursor: "pointer",
                  outline: "none",
                  position: "relative"
                }}
                onClick={() => handlePick(opt)}
                onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.93)")}
                onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
              >
                {opt.icon}
              </button>
            ))}
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", margin: "2.5rem 0" }}>
            <div style={{ display: "flex", gap: "2.5rem", alignItems: "center" }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "1.1rem", color: "#FFD700", marginBottom: 8 }}>Elegiste</div>
                <div
                  style={{
                    fontSize: "3.2rem",
                    background: userPick.color,
                    borderRadius: "50%",
                    width: 100,
                    height: 100,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 2px 12px #23272a33",
                    margin: "0 auto",
                    transition: "transform 0.3s",
                    transform: anim ? "scale(1.1)" : "scale(1)"
                  }}
                >
                  {userPick.icon}
                </div>
                <div style={{ fontWeight: 700, color: "#7289da", marginTop: 8 }}>{userPick.name}</div>
              </div>

              <div style={{ fontSize: "2.5rem", color: "#23272a", fontWeight: 900 }}>VS</div>

              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "1.1rem", color: "#FFD700", marginBottom: 8 }}>La máquina</div>
                <div
                  style={{
                    fontSize: "3.2rem",
                    background: housePick?.color || "#23272a",
                    borderRadius: "50%",
                    width: 100,
                    height: 100,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 2px 12px #23272a33",
                    margin: "0 auto",
                    transition: "transform 0.3s",
                    transform: anim ? "scale(1.1)" : "scale(1)"
                  }}
                >
                  {housePick?.icon || "?"}
                </div>
                <div style={{ fontWeight: 700, color: "#e74c3c", marginTop: 8 }}>{housePick?.name || ""}</div>
              </div>
            </div>

            {result && (
              <div
                style={{
                  marginTop: "2.2rem",
                  fontSize: "2.1rem",
                  fontWeight: 900,
                  color: result === "¡Ganaste!" ? "#00cdbc" : result === "Empate" ? "#FFD700" : "#e74c3c",
                  textShadow: "2px 2px 0 #23272a"
                }}
              >
                {result}
              </div>
            )}

            {result && (
              <button
                className="comic-title"
                style={{
                  marginTop: "1.5rem",
                  background: "#7289da",
                  color: "#fff",
                  border: "none",
                  borderRadius: 12,
                  padding: "0.7rem 1.5rem",
                  fontWeight: 900,
                  fontSize: "1.1rem",
                  cursor: "pointer",
                  boxShadow: "0 2px 12px #FFD70033",
                  letterSpacing: 1,
                  textShadow: "1px 1px 0 #23272a"
                }}
                onClick={resetGame}
              >
                Jugar de nuevo
              </button>
            )}
          </div>
        )}
        <style>{`
          .ppt-bg { animation: fadeInPPT 0.7s; }
          @keyframes fadeInPPT {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}</style>
      </div>
    );
  }

  // --- Online UI ---
  return (
    <div className="ppt-bg" style={{background:'#181a20',borderRadius:24,padding:'2.5rem 1.5rem',marginTop:'2.5rem',boxShadow:'0 8px 32px #7289da33, 0 2px 0 #FFD700 inset',border:'3px solid #FFD700',color:'#fff',position:'relative'}}>
      <button className="comic-title" style={{marginBottom:'1.5rem',background:'#FFD700',color:'#23272a',border:'none',borderRadius:12,padding:'0.7rem 1.5rem',fontWeight:900,fontSize:'1.1rem',cursor:'pointer',boxShadow:'0 2px 12px #7289da33',letterSpacing:1,textShadow:'1px 1px 0 #23272a'}} onClick={()=>setModo(null)}>← Volver</button>
      {/* Avisos de error de login o multi-login */}
      {loginError && (
        <div style={{background:'#e74c3c',color:'#fff',padding:'1rem',borderRadius:10,marginBottom:18,fontWeight:700}}>{loginError}</div>
      )}
      {multiLoginError && (
        <div style={{background:'#FFD700',color:'#23272a',padding:'1rem',borderRadius:10,marginBottom:18,fontWeight:700}}>{multiLoginError}</div>
      )}
      {inSala ? (
        <div style={{textAlign:'center'}}>
          <div style={{marginBottom:16, display:'flex', alignItems:'center', justifyContent:'center', gap:16}}>
            <span className="comic-title" style={{color:'#FFD700',fontSize:'1.1rem'}}>Sala: <b>{salaId}</b></span>
            <button className="comic-title" style={{background:'#e74c3c',color:'#fff',border:'none',borderRadius:8,padding:'0.5rem 1.2rem',fontWeight:700}} onClick={salirSala}>Salir</button>
            <div style={{marginLeft:16, display:'flex', alignItems:'center', gap:8}}>
              <span className="comic-title" style={{color:'#FFD700',fontSize:'1.1rem'}}>Tiempo:</span>
              <div style={{position:'relative',width:60,height:24}}>
                <div style={{position:'absolute',top:0,left:0,width:`${(salaTimer/600)*100}%`,height:'100%',background:'#FFD700',borderRadius:8,transition:'width 1s linear',opacity:0.18}}></div>
                <span style={{position:'relative',zIndex:2,fontWeight:700,color:'#FFD700',textShadow:'1px 1px 0 #23272a'}}>{formatTime(salaTimer)}</span>
              </div>
            </div>
            {discordUser && (
              <span className="comic-title" style={{marginLeft:18,color:'#7289da',fontSize:'1.1rem',display:'flex',alignItems:'center',gap:6}}>
                <img
                  src={
                    discordUser.avatar
                      ? `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png`
                      : `https://cdn.discordapp.com/embed/avatars/${parseInt(discordUser.discriminator) % 5}.png`
                  }
                  alt="avatar"
                  style={{width:28,height:28,borderRadius:'50%',marginRight:6,verticalAlign:'middle',border:'2px solid #FFD700'}}
                />
                {discordUser.username}
              </span>
            )}
          </div>
      {/* Modal bonito para mostrar el ID de sala creada */}
      {showIdModal && (
        <div style={{position:'fixed',top:0,left:0,width:'100vw',height:'100vh',background:'rgba(0,0,0,0.45)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center'}}>
          <div style={{background:'#fff',borderRadius:18,padding:'2.5rem 2rem',boxShadow:'0 8px 32px #7289da33, 0 2px 0 #FFD700 inset',border:'3px solid #FFD700',maxWidth:340,textAlign:'center',position:'relative'}}>
            <h2 className="comic-title" style={{color:'#FFD700',fontSize:'2rem',marginBottom:'1.2rem',textShadow:'1px 1px 0 #23272a'}}>¡Sala creada!</h2>
            <div style={{fontSize:'1.1rem',color:'#23272a',marginBottom:18}}>Comparte este ID con tu amigo:</div>
            <div style={{fontSize:'2.1rem',fontWeight:900,letterSpacing:2,color:'#7289da',background:'#FFD70022',borderRadius:10,padding:'0.7rem 1.2rem',marginBottom:18,boxShadow:'0 2px 8px #FFD70033'}}>{salaId}</div>
            <button className="comic-title" style={{background:'#7289da',color:'#fff',border:'none',borderRadius:12,padding:'0.7rem 1.5rem',fontWeight:900,fontSize:'1.1rem',cursor:'pointer',boxShadow:'0 2px 12px #FFD70033',letterSpacing:1,textShadow:'1px 1px 0 #23272a'}} onClick={()=>setShowIdModal(false)}>OK</button>
          </div>
        </div>
      )}
          {salaState && salaState.jugadores.length === 2 ? (
            <>
              <div style={{marginBottom:12}}>
                <span className="comic-title" style={{color:'#7289da',fontSize:'1.1rem'}}>Jugadores: {salaState.jugadores.join(' vs ')}</span>
              </div>
              <div style={{marginBottom:12}}>
                <span className="comic-title" style={{color:'#FFD700',fontSize:'1.1rem'}}>Puntuación: {Object.entries(onlineScores).map(([k,v])=>`${k}: ${v}`).join(' | ')}</span>
              </div>
              {!onlinePick ? (
                <div style={{ display: "flex", justifyContent: "center", gap: "2.5rem", margin: "2.5rem 0" }}>
                  {opciones.map((opt) => (
                    <button
                      key={opt.name}
                      className="comic-title"
                      style={{
                        background: opt.color,
                        color: "#fff",
                        border: "none",
                        borderRadius: "50%",
                        width: 90,
                        height: 90,
                        fontSize: "2.7rem",
                        boxShadow: "0 2px 12px #23272a33",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        transition: "transform 0.2s",
                        cursor: esperando ? 'not-allowed' : 'pointer',
                        outline: "none",
                        position: "relative",
                        opacity: esperando ? 0.6 : 1
                      }}
                      onClick={() => !esperando && handleOnlinePick(opt)}
                      disabled={esperando}
                    >
                      {opt.icon}
                    </button>
                  ))}
                </div>
              ) : (
                <div style={{margin:'2rem 0',color:'#FFD700',fontWeight:700,fontSize:'1.2rem'}}>Esperando al otro jugador...</div>
              )}
              {onlineResult && (
                <div style={{marginTop:'2.2rem',fontSize:'2.1rem',fontWeight:900,color:onlineResult.ganador===username?'#00cdbc':onlineResult.empate?'#FFD700':'#e74c3c',textShadow:'2px 2px 0 #23272a'}}>
                  {onlineResult.empate ? 'Empate' : onlineResult.ganador ? (onlineResult.ganador === username ? '¡Ganaste!' : 'Perdiste') : ''}
                  <div style={{fontSize:15,color:'#fff',marginTop:8}}>
                    {onlineResult.jugadas && Object.entries(onlineResult.jugadas).map(([k,v])=>(<span key={k}>{k}: {v} &nbsp;</span>))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div style={{margin:'2rem 0',color:'#FFD700',fontWeight:700,fontSize:'1.2rem'}}>
              Esperando a que se una otro jugador a la sala...<br/>
              <span style={{color:'#fff',fontSize:15}}>Comparte este ID: <b>{salaId}</b></span>
            </div>
          )}
        </div>
      ) : (
        <div style={{textAlign:'center'}}>
          <h3 className="comic-title" style={{color:'#FFD700',fontSize:'1.3rem',marginBottom:'1.2rem'}}>Jugar Online</h3>
          {discordUser ? (
            <div style={{marginBottom:12,display:'flex',alignItems:'center',justifyContent:'center',gap:8}}>
              <img
                src={
                  discordUser.avatar
                    ? `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png`
                    : `https://cdn.discordapp.com/embed/avatars/${parseInt(discordUser.discriminator) % 5}.png`
                }
                alt="avatar"
                style={{width:32,height:32,borderRadius:'50%',border:'2px solid #FFD700'}}
              />
              <span className="comic-title" style={{color:'#7289da',fontSize:'1.1rem'}}>{discordUser.username}</span>
            </div>
          ) : (
            <div style={{background:'#e74c3c',color:'#fff',padding:'1rem',borderRadius:10,marginBottom:18,fontWeight:700}}>
              Debes iniciar sesión con Discord para jugar online.
            </div>
          )}
          <button className="comic-title" style={{background:'#7289da',color:'#fff',border:'none',borderRadius:8,padding:'0.7rem 1.5rem',fontWeight:700,margin:'0 0.5rem'}} onClick={crearSala} disabled={!discordUser}>Crear sala nueva</button>
          <input type="text" placeholder="ID de sala" value={salaId} onChange={e=>setSalaId(e.target.value)} style={{padding:'0.6rem',borderRadius:8,border:'1px solid #4b5563',background:'#1a1a1a',color:'#ffffff',margin:'0 0.5rem',width:120}} disabled={!discordUser} />
          <button className="comic-title" style={{background:'#FFD700',color:'#23272a',border:'none',borderRadius:8,padding:'0.7rem 1.5rem',fontWeight:700}} onClick={unirseSala} disabled={!discordUser}>Unirse</button>
        </div>
      )}
      <style>{`
        .ppt-bg { animation: fadeInPPT 0.7s; }
        @keyframes fadeInPPT {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

const MinijuegosRP = () => {
  return (
    <div className="minijuegos-bg">
      <DiscordUserBar />
      <div style={{ maxWidth: 600, margin: '0 auto', padding: '2.5rem 1rem' }}>
        <h1 className="comic-title" style={{ color: "#FFD700", fontSize: "2.5rem", textAlign: 'center', fontWeight: 900, letterSpacing: 2, textShadow: '2px 2px 0 #23272a, 0 0 16px #7289da', marginBottom: '2.2rem' }}>
          ⚡ MINIJUEGOS RP ⚡
        </h1>
        
        {/* Aviso de Mantenimiento */}
        <div style={{
          background: 'linear-gradient(135deg, #f39c12 0%, #e67e22 100%)',
          borderRadius: 24,
          padding: '3rem 2rem',
          boxShadow: '0 8px 32px rgba(243, 156, 18, 0.3), 0 2px 0 #fff inset',
          border: '3px solid #f39c12',
          position: 'relative',
          overflow: 'hidden',
          textAlign: 'center'
        }}>
          {/* Icono de mantenimiento */}
          <div style={{
            fontSize: '4rem',
            marginBottom: '1.5rem',
            animation: 'pulse 2s infinite'
          }}>
            🔧
          </div>
          
          <h2 className="comic-title" style={{
            color: '#fff',
            fontSize: '2rem',
            marginBottom: '1rem',
            textShadow: '2px 2px 0 #23272a'
          }}>
            EN MANTENIMIENTO
          </h2>
          
          <p style={{
            color: '#fff',
            fontSize: '1.2rem',
            marginBottom: '1.5rem',
            fontWeight: 600,
            textShadow: '1px 1px 0 #23272a'
          }}>
            Los minijuegos están siendo desarrollados y mejorados
          </p>
          
          <div style={{
            background: 'rgba(255, 255, 255, 0.2)',
            borderRadius: 16,
            padding: '1.5rem',
            marginBottom: '2rem',
            border: '2px solid rgba(255, 255, 255, 0.3)'
          }}>
            <h3 className="comic-title" style={{
              color: '#fff',
              fontSize: '1.3rem',
              marginBottom: '1rem',
              textShadow: '1px 1px 0 #23272a'
            }}>
              🎮 Próximamente Disponible:
            </h3>
            <ul style={{
              listStyle: 'none',
              padding: 0,
              margin: 0,
              color: '#fff',
              fontSize: '1rem',
              lineHeight: 1.8
            }}>
              <li>🏪 Simulador de Tienda</li>
              <li>✊ Piedra, Papel o Tijera Online</li>
              <li>🏎️ Carrera de Coches RP</li>
              <li>🏃 Parkour Urbano</li>
              <li>🧠 Trivia RP</li>
              <li>🔢 Adivina el número</li>
            </ul>
          </div>
          
          <div style={{
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: 12,
            padding: '1rem',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            <p style={{
              color: '#fff',
              fontSize: '0.9rem',
              margin: 0,
              fontStyle: 'italic',
              textShadow: '1px 1px 0 #23272a'
            }}>
              Estamos trabajando duro para traerte la mejor experiencia de gaming en SpainRP
            </p>
          </div>
        </div>
        
        {/* Botón de regreso */}
        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <a
            href="/apps"
            className="comic-title"
            style={{
              display: 'inline-block',
              background: '#7289da',
              color: '#fff',
              textDecoration: 'none',
              border: 'none',
              borderRadius: 12,
              padding: '0.8rem 2rem',
              fontWeight: 900,
              fontSize: '1.1rem',
              cursor: 'pointer',
              boxShadow: '0 4px 16px rgba(114, 137, 218, 0.3)',
              letterSpacing: 1,
              textShadow: '1px 1px 0 #23272a',
              transition: 'all 0.3s ease'
            }}
            onMouseOver={(e) => {
              e.target.style.background = '#5a6fd8';
              e.target.style.transform = 'translateY(-2px)';
            }}
            onMouseOut={(e) => {
              e.target.style.background = '#7289da';
              e.target.style.transform = 'translateY(0)';
            }}
          >
            ← Volver a Apps
          </a>
        </div>
      </div>
      
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bangers&display=swap');
        .comic-title { font-family: 'Bangers', Impact, sans-serif; letter-spacing: 2px; }
        .minijuegos-bg { 
          background: linear-gradient(135deg, #23272a 60%, #7289da 100%); 
          min-height: 100vh; 
        }
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); }
        }
      `}</style>
    </div>
  );
};

export default MinijuegosRP;
// frontend/src/components/AdvancedLogs.jsx