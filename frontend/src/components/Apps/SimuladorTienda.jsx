import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";

const SHOP_SIMULATOR_URL = import.meta.env.VITE_SHOP_URL || "https://tu-shop.onrender.com";

const SimuladorTienda = () => {
  const [modo, setModo] = useState(null); // "local" | "online"
  const [salaId, setSalaId] = useState("");
  const [username, setUsername] = useState("");
  const [discordUser, setDiscordUser] = useState(null);
  const [inSala, setInSala] = useState(false);
  const [salaState, setSalaState] = useState(null);
  const [error, setError] = useState("");
  const [showReglas, setShowReglas] = useState(false);
  const [npcInteractuando, setNpcInteractuando] = useState(null);
  const [productosDisponibles, setProductosDisponibles] = useState([]);
  const [carritoVenta, setCarritoVenta] = useState([]);
  const [showDialogo, setShowDialogo] = useState(false);
  const [dialogoActual, setDialogoActual] = useState("");
  
  const socketRef = useRef(null);
  const canvasRef = useRef(null);
  const gameStateRef = useRef({
    jugadores: [],
    npcs: [],
    estantes: {},
    cajaRegistradora: {},
    tiempoRestante: 300,
    estado: 'esperando'
  });

  // Obtener usuario de Discord
  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch("/api/auth/me", { credentials: "include" });
        if (res.ok) {
          const user = await res.json();
          setDiscordUser(user);
          setUsername(user.username);
        }
      } catch (e) {
        console.error('Error fetching user:', e);
      }
    }
    fetchUser();
  }, []);

  // Configurar Socket.IO
  useEffect(() => {
    if (modo === "online" && !socketRef.current) {
      socketRef.current = io(SHOP_SIMULATOR_URL);
      
      socketRef.current.on('unidoSala', (data) => {
        if (data.success) {
          setInSala(true);
          setError("");
        } else {
          setError(data.error);
        }
      });

      socketRef.current.on('juegoIniciado', (data) => {
        if (data.success) {
          setError("");
        } else {
          setError(data.error);
        }
      });

      socketRef.current.on('estadoTienda', (estado) => {
        setSalaState(estado);
        gameStateRef.current = estado;
        dibujarJuego();
      });

      socketRef.current.on('npcInteractuado', (data) => {
        if (data.success !== false) {
          setNpcInteractuando(data.npc);
          setProductosDisponibles(data.productosDisponibles);
          setDialogoActual(data.dialogo);
          setShowDialogo(true);
        } else {
          setError(data.mensaje || "No se pudo interactuar con el NPC");
        }
      });

      socketRef.current.on('ventaRealizada', (data) => {
        if (data.exito) {
          setError("");
          // Mostrar mensaje de éxito
          setTimeout(() => {
            setNpcInteractuando(null);
            setShowDialogo(false);
            setCarritoVenta([]);
          }, 2000);
        } else {
          setError(data.mensaje || "No se pudo realizar la venta");
        }
      });
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [modo]);

  // Configurar canvas
  useEffect(() => {
    if (modo && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      
      // Configurar tamaño del canvas
      canvas.width = 800;
      canvas.height = 600;
      
      // Dibujar fondo
      dibujarFondo(ctx);
    }
  }, [modo]);

  const dibujarFondo = (ctx) => {
    // Fondo de la tienda
    ctx.fillStyle = '#f5f5f5';
    ctx.fillRect(0, 0, 800, 600);
    
    // Suelo con patrón
    ctx.fillStyle = '#e8e8e8';
    for (let x = 0; x < 800; x += 40) {
      for (let y = 0; y < 600; y += 40) {
        if ((x + y) % 80 === 0) {
          ctx.fillRect(x, y, 40, 40);
        }
      }
    }
    
    // Paredes
    ctx.fillStyle = '#d4d4d4';
    ctx.fillRect(0, 0, 800, 20);
    ctx.fillRect(0, 0, 20, 600);
    ctx.fillRect(780, 0, 20, 600);
    ctx.fillRect(0, 580, 800, 20);
    
    // Puerta de entrada
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(20, 250, 30, 100);
    ctx.fillStyle = '#FFD700';
    ctx.fillRect(25, 255, 20, 90);
    
    // Caja registradora
    ctx.fillStyle = '#2c2c2c';
    ctx.fillRect(700, 250, 80, 100);
    ctx.fillStyle = '#00ff00';
    ctx.fillRect(710, 260, 60, 20);
    ctx.fillStyle = '#fff';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('CAJA', 740, 275);
  };

  const dibujarEstantes = (ctx, estantes) => {
    Object.values(estantes).forEach(estante => {
      const { x, y, nombre } = estante;
      
      // Estante
      ctx.fillStyle = '#8B4513';
      ctx.fillRect(x - 40, y - 20, 80, 40);
      
      // Productos en el estante
      ctx.fillStyle = '#fff';
      ctx.fillRect(x - 35, y - 15, 70, 30);
      
      // Nombre del estante
      ctx.fillStyle = '#000';
      ctx.font = '10px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(nombre, x, y + 35);
    });
  };

  const dibujarJugador = (ctx, jugador) => {
    const { x, y, enCaja } = jugador;
    
    // Sombra
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(x - 8, y + 15, 16, 8);
    
    // Cuerpo del jugador
    ctx.fillStyle = enCaja ? '#00ff00' : '#4A90E2';
    ctx.fillRect(x - 12, y - 25, 24, 35);
    
    // Cabeza
    ctx.fillStyle = '#FFDBAC';
    ctx.fillRect(x - 10, y - 30, 20, 20);
    
    // Ojos
    ctx.fillStyle = '#000';
    ctx.fillRect(x - 6, y - 25, 3, 3);
    ctx.fillRect(x + 3, y - 25, 3, 3);
    
    // Nombre
    ctx.fillStyle = '#000';
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(jugador.username, x, y - 40);
    
    // Indicador de caja
    if (enCaja) {
      ctx.fillStyle = '#00ff00';
      ctx.fillRect(x - 15, y - 45, 30, 5);
    }
  };

  const dibujarNPC = (ctx, npc) => {
    const { x, y, icon, estado, dialogoActual, tiempoEspera, paciencia } = npc;
    
    // Sombra
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(x - 6, y + 12, 12, 6);
    
    // Cuerpo del NPC
    let colorCuerpo = '#FFB6C1';
    if (estado === 'comprando') colorCuerpo = '#90EE90';
    else if (estado === 'yendo') colorCuerpo = '#D3D3D3';
    
    ctx.fillStyle = colorCuerpo;
    ctx.fillRect(x - 8, y - 15, 16, 25);
    
    // Cabeza
    ctx.fillStyle = '#FFDBAC';
    ctx.fillRect(x - 6, y - 20, 12, 12);
    
    // Icono del NPC
    ctx.font = '14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(icon, x, y - 15);
    
    // Barra de paciencia
    if (estado === 'esperando') {
      const porcentaje = Math.max(0, (paciencia - tiempoEspera) / paciencia);
      ctx.fillStyle = porcentaje > 0.5 ? '#00FF00' : porcentaje > 0.2 ? '#FFFF00' : '#FF0000';
      ctx.fillRect(x - 15, y - 30, 30 * porcentaje, 4);
    }
    
    // Diálogo
    if (dialogoActual) {
      ctx.fillStyle = 'rgba(0,0,0,0.8)';
      ctx.fillRect(x - 50, y - 50, 100, 25);
      ctx.fillStyle = '#fff';
      ctx.font = '10px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(dialogoActual, x, y - 35);
    }
  };

  const dibujarJuego = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // Limpiar canvas
    ctx.clearRect(0, 0, 800, 600);
    
    // Dibujar fondo
    dibujarFondo(ctx);
    
    // Dibujar estantes
    if (gameStateRef.current.estantes) {
      dibujarEstantes(ctx, gameStateRef.current.estantes);
    }
    
    // Dibujar jugadores
    if (gameStateRef.current.jugadores) {
      gameStateRef.current.jugadores.forEach(jugador => {
        dibujarJugador(ctx, jugador);
      });
    }
    
    // Dibujar NPCs
    if (gameStateRef.current.npcs) {
      gameStateRef.current.npcs.forEach(npc => {
        dibujarNPC(ctx, npc);
      });
    }
  };

  const crearSala = () => {
    if (!discordUser) {
      setError("Debes iniciar sesión con Discord para jugar online");
      return;
    }
    
    const id = Math.random().toString(36).slice(2, 8);
    setSalaId(id);
    
    if (socketRef.current) {
      socketRef.current.emit('unirseSala', { salaId: id, username: discordUser.username });
    }
  };

  const unirseSala = () => {
    if (!discordUser) {
      setError("Debes iniciar sesión con Discord para jugar online");
      return;
    }
    
    if (!salaId) {
      setError("Debes introducir un ID de sala válido");
      return;
    }
    
    if (socketRef.current) {
      socketRef.current.emit('unirseSala', { salaId, username: discordUser.username });
    }
  };

  const iniciarJuego = () => {
    if (socketRef.current) {
      socketRef.current.emit('iniciarJuego', { salaId });
    }
  };

  const interactuarConNPC = (npcId) => {
    if (socketRef.current) {
      socketRef.current.emit('interactuarNPC', { salaId, npcId });
    }
  };

  const venderProductos = (npcId, productos) => {
    if (socketRef.current) {
      socketRef.current.emit('venderProductos', { salaId, npcId, productos });
    }
  };

  const moverJugador = (x, y) => {
    if (socketRef.current) {
      socketRef.current.emit('moverJugador', { salaId, x, y });
    }
  };

  const salirSala = () => {
    if (socketRef.current) {
      socketRef.current.emit('leaveSala', { salaId });
    }
    setInSala(false);
    setSalaState(null);
    setSalaId("");
    setNpcInteractuando(null);
    setShowDialogo(false);
  };

  // Manejar clics en el canvas
  const handleCanvasClick = (e) => {
    if (!inSala || !salaState) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Mover jugador
    moverJugador(x, y);
    
    // Verificar si se hizo clic en un NPC
    const npcClickeado = salaState.npcs?.find(npc => {
      const dx = x - npc.posicion.x;
      const dy = y - npc.posicion.y;
      return Math.sqrt(dx * dx + dy * dy) < 25;
    });
    
    if (npcClickeado && npcClickeado.estado === 'esperando') {
      interactuarConNPC(npcClickeado.id);
    }
  };

  // Agregar producto al carrito de venta
  const agregarAlCarrito = (producto) => {
    const existente = carritoVenta.find(item => item.producto === producto.producto);
    if (existente) {
      if (existente.cantidad < producto.cantidadDisponible) {
        setCarritoVenta(carritoVenta.map(item => 
          item.producto === producto.producto 
            ? { ...item, cantidad: item.cantidad + 1 }
            : item
        ));
      }
    } else {
      setCarritoVenta([...carritoVenta, { 
        producto: producto.producto, 
        cantidad: 1, 
        precio: producto.precio,
        nombre: producto.nombre
      }]);
    }
  };

  // Remover producto del carrito
  const removerDelCarrito = (producto) => {
    setCarritoVenta(carritoVenta.filter(item => item.producto !== producto));
  };

  // Procesar venta
  const procesarVenta = () => {
    if (carritoVenta.length > 0 && npcInteractuando) {
      venderProductos(npcInteractuando.id, carritoVenta);
      setCarritoVenta([]);
      setNpcInteractuando(null);
      setShowDialogo(false);
    }
  };

  if (!modo) {
    return (
      <div style={{textAlign:'center',marginTop:'2rem'}}>
        <h2 className="comic-title" style={{color:'#FFD700',fontSize:'2rem',marginBottom:'2rem'}}>Simulador de Tienda</h2>
        <p style={{color:'#fff',fontSize:'1.1rem',marginBottom:'2rem'}}>
          Gestiona tu tienda, atiende clientes y maximiza tus ganancias en tiempo real
        </p>
        <button className="comic-title" style={{margin:'0 1rem 1.5rem 0',background:'#7289da',color:'#fff',border:'none',borderRadius:12,padding:'0.7rem 1.5rem',fontWeight:900,fontSize:'1.1rem',cursor:'pointer',boxShadow:'0 2px 12px #FFD70033',letterSpacing:1,textShadow:'1px 1px 0 #23272a'}} onClick={()=>setModo('online')}>Jugar Online</button>
        <button className="comic-title" style={{background:'#23272a',color:'#FFD700',border:'none',borderRadius:12,padding:'0.7rem 1.5rem',fontWeight:900,fontSize:'1.1rem',cursor:'pointer',boxShadow:'0 2px 12px #FFD70033',letterSpacing:1,textShadow:'1px 1px 0 #23272a'}} onClick={()=>setShowReglas(true)}>Reglas</button>
        
        {showReglas && (
          <div style={{background:'#fff',color:'#23272a',borderRadius:16,padding:'2rem',maxWidth:500,margin:'2rem auto',boxShadow:'0 2px 12px #7289da33',position:'relative',zIndex:10}}>
            <h3 className="comic-title" style={{color:'#7289da',fontSize:'1.3rem',marginBottom:'1rem'}}>Reglas del Simulador de Tienda</h3>
            <ul style={{textAlign:'left',fontSize:16,lineHeight:1.7}}>
              <li><strong>Objetivo:</strong> Maximizar ganancias en 5 minutos</li>
              <li><strong>Clientes:</strong> Diferentes tipos con necesidades específicas</li>
              <li><strong>Productos:</strong> Gestiona tu inventario y vende lo que necesitan</li>
              <li><strong>Paciencia:</strong> Los clientes se van si esperan demasiado</li>
              <li><strong>Satisfacción:</strong> Vende los productos correctos para ganar más</li>
              <li><strong>Multijugador:</strong> Compite con otros jugadores en tiempo real</li>
            </ul>
            <button className="comic-title" style={{marginTop:'1.2rem',background:'#7289da',color:'#fff',border:'none',borderRadius:12,padding:'0.7rem 1.5rem',fontWeight:900,fontSize:'1.1rem',cursor:'pointer',boxShadow:'0 2px 12px #FFD70033',letterSpacing:1,textShadow:'1px 1px 0 #23272a'}} onClick={()=>setShowReglas(false)}>Cerrar</button>
          </div>
        )}
      </div>
    );
  }

  if (modo === "online") {
    return (
      <div className="shop-bg" style={{background:'#181a20',borderRadius:24,padding:'2.5rem 1.5rem',marginTop:'2.5rem',boxShadow:'0 8px 32px #7289da33, 0 2px 0 #FFD700 inset',border:'3px solid #FFD700',color:'#fff',position:'relative'}}>
        <button className="comic-title" style={{marginBottom:'1.5rem',background:'#FFD700',color:'#23272a',border:'none',borderRadius:12,padding:'0.7rem 1.5rem',fontWeight:900,fontSize:'1.1rem',cursor:'pointer',boxShadow:'0 2px 12px #7289da33',letterSpacing:1,textShadow:'1px 1px 0 #23272a'}} onClick={()=>setModo(null)}>← Volver</button>
        
        {error && (
          <div style={{background:'#e74c3c',color:'#fff',padding:'1rem',borderRadius:10,marginBottom:18,fontWeight:700}}>{error}</div>
        )}
        
        {!inSala ? (
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
            <input type="text" placeholder="ID de sala" value={salaId} onChange={e=>setSalaId(e.target.value)} style={{padding:'0.6rem',borderRadius:8,border:'1px solid #eee',margin:'0 0.5rem',width:120}} disabled={!discordUser} />
            <button className="comic-title" style={{background:'#FFD700',color:'#23272a',border:'none',borderRadius:8,padding:'0.7rem 1.5rem',fontWeight:700}} onClick={unirseSala} disabled={!discordUser}>Unirse</button>
          </div>
        ) : (
          <div>
            <div style={{marginBottom:16, display:'flex', alignItems:'center', justifyContent:'space-between'}}>
              <div style={{display:'flex', alignItems:'center', gap:16}}>
                <span className="comic-title" style={{color:'#FFD700',fontSize:'1.1rem'}}>Sala: <b>{salaId}</b></span>
                <button className="comic-title" style={{background:'#e74c3c',color:'#fff',border:'none',borderRadius:8,padding:'0.5rem 1.2rem',fontWeight:700}} onClick={salirSala}>Salir</button>
              </div>
              
              {salaState && (
                <div style={{display:'flex', alignItems:'center', gap:16}}>
                  <span className="comic-title" style={{color:'#FFD700',fontSize:'1.1rem'}}>
                    Tiempo: {Math.floor(salaState.tiempoRestante / 60)}:{(salaState.tiempoRestante % 60).toString().padStart(2, '0')}
                  </span>
                  <span className="comic-title" style={{color:'#7289da',fontSize:'1.1rem'}}>
                    Jugadores: {salaState.jugadores?.length || 0}/4
                  </span>
                </div>
              )}
            </div>
            
            <div style={{display:'flex', gap:'1rem'}}>
              <div style={{flex: 1}}>
                <canvas
                  ref={canvasRef}
                  onClick={handleCanvasClick}
                  style={{
                    border: '2px solid #FFD700',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    background: '#f0f0f0'
                  }}
                />
                <p style={{textAlign:'center',marginTop:'0.5rem',fontSize:'0.9rem',color:'#ccc'}}>
                  Haz clic para moverte y haz clic en NPCs para atenderlos
                </p>
              </div>
              
              <div style={{width:'300px'}}>
                {salaState && (
                  <div>
                    <h4 className="comic-title" style={{color:'#FFD700',fontSize:'1.1rem',marginBottom:'1rem'}}>Jugadores</h4>
                    {salaState.jugadores?.map(jugador => (
                      <div key={jugador.id} style={{background:'#2c2c2c',padding:'0.5rem',borderRadius:'8px',marginBottom:'0.5rem'}}>
                        <div style={{color:'#fff',fontWeight:'bold'}}>{jugador.username}</div>
                        <div style={{color:'#FFD700',fontSize:'0.9rem'}}>💰 ${jugador.dinero}</div>
                        <div style={{color:'#7289da',fontSize:'0.8rem'}}>Clientes: {jugador.clientesAtendidos}</div>
                        {jugador.enCaja && <div style={{color:'#00ff00',fontSize:'0.8rem'}}>📍 En caja</div>}
                      </div>
                    ))}
                    
                    <h4 className="comic-title" style={{color:'#FFD700',fontSize:'1.1rem',marginBottom:'1rem',marginTop:'1rem'}}>NPCs en la tienda</h4>
                    {salaState.npcs?.map(npc => (
                      <div key={npc.id} style={{background:'#2c2c2c',padding:'0.5rem',borderRadius:'8px',marginBottom:'0.5rem'}}>
                        <div style={{color:'#fff',fontWeight:'bold'}}>{npc.icon} {npc.nombre}</div>
                        <div style={{color:'#ccc',fontSize:'0.8rem'}}>{npc.tipo}</div>
                        <div style={{color:'#FFD700',fontSize:'0.8rem'}}>Presupuesto: ${npc.presupuesto}</div>
                        <div style={{color:'#7289da',fontSize:'0.8rem'}}>Estado: {npc.estado}</div>
                      </div>
                    ))}
                    
                    {salaState.estado === 'esperando' && salaState.jugadores?.length >= 1 && (
                      <button className="comic-title" style={{background:'#00cdbc',color:'#fff',border:'none',borderRadius:8,padding:'0.7rem 1.5rem',fontWeight:700,width:'100%',marginTop:'1rem'}} onClick={iniciarJuego}>
                        Iniciar Juego
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
            
            {/* Modal de diálogo con NPC */}
            {showDialogo && npcInteractuando && (
              <div style={{position:'fixed',top:0,left:0,width:'100vw',height:'100vh',background:'rgba(0,0,0,0.7)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center'}}>
                <div style={{background:'#fff',borderRadius:18,padding:'2rem',boxShadow:'0 8px 32px #7289da33',maxWidth:600,width:'90%',maxHeight:'80vh',overflow:'auto'}}>
                  <div style={{display:'flex',alignItems:'center',marginBottom:'1rem'}}>
                    <span style={{fontSize:'2rem',marginRight:'1rem'}}>{npcInteractuando.icon}</span>
                    <div>
                      <h3 className="comic-title" style={{color:'#7289da',fontSize:'1.5rem',margin:0}}>{npcInteractuando.nombre}</h3>
                      <p style={{color:'#666',margin:0}}>{npcInteractuando.tipo}</p>
                    </div>
                  </div>
                  
                  <div style={{background:'#f0f0f0',padding:'1rem',borderRadius:8,marginBottom:'1rem'}}>
                    <p style={{margin:0,fontStyle:'italic'}}>"{dialogoActual}"</p>
                  </div>
                  
                  <h4 className="comic-title" style={{color:'#FFD700',fontSize:'1.2rem',marginBottom:'1rem'}}>Productos disponibles</h4>
                  <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit, minmax(200px, 1fr))',gap:'0.5rem',marginBottom:'1rem'}}>
                    {productosDisponibles.map((producto, index) => (
                      <div key={index} style={{background:'#2c2c2c',padding:'0.5rem',borderRadius:8,color:'#fff'}}>
                        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                          <div>
                            <div style={{fontWeight:'bold'}}>{producto.icon} {producto.nombre}</div>
                            <div style={{fontSize:'0.8rem',color:'#ccc'}}>${producto.precio} c/u</div>
                            <div style={{fontSize:'0.8rem',color:'#FFD700'}}>Stock: {producto.cantidadDisponible}</div>
                            <div style={{fontSize:'0.8rem',color:'#7289da'}}>Quiere: {producto.cantidadDeseada}</div>
                          </div>
                          <button 
                            className="comic-title"
                            style={{background:'#00cdbc',color:'#fff',border:'none',borderRadius:4,padding:'0.3rem 0.6rem',fontSize:'0.8rem',cursor:'pointer'}}
                            onClick={() => agregarAlCarrito(producto)}
                          >
                            +
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {carritoVenta.length > 0 && (
                    <div style={{background:'#2c2c2c',padding:'1rem',borderRadius:8,marginBottom:'1rem'}}>
                      <h5 className="comic-title" style={{color:'#FFD700',fontSize:'1rem',marginBottom:'0.5rem'}}>Carrito de venta</h5>
                      {carritoVenta.map((item, index) => (
                        <div key={index} style={{display:'flex',justifyContent:'space-between',alignItems:'center',color:'#fff',marginBottom:'0.3rem'}}>
                          <span>{item.nombre} x{item.cantidad}</span>
                          <div style={{display:'flex',alignItems:'center',gap:'0.5rem'}}>
                            <span>${item.precio * item.cantidad}</span>
                            <button 
                              style={{background:'#e74c3c',color:'#fff',border:'none',borderRadius:4,padding:'0.2rem 0.4rem',fontSize:'0.7rem',cursor:'pointer'}}
                              onClick={() => removerDelCarrito(item.producto)}
                            >
                              -
                            </button>
                          </div>
                        </div>
                      ))}
                      <div style={{borderTop:'1px solid #555',paddingTop:'0.5rem',marginTop:'0.5rem',color:'#FFD700',fontWeight:'bold'}}>
                        Total: ${carritoVenta.reduce((sum, item) => sum + (item.precio * item.cantidad), 0)}
                      </div>
                    </div>
                  )}
                  
                  <div style={{display:'flex',gap:'1rem',justifyContent:'flex-end'}}>
                    <button 
                      className="comic-title"
                      style={{background:'#e74c3c',color:'#fff',border:'none',borderRadius:8,padding:'0.7rem 1.5rem',fontWeight:700,cursor:'pointer'}}
                      onClick={() => {
                        setShowDialogo(false);
                        setNpcInteractuando(null);
                        setCarritoVenta([]);
                      }}
                    >
                      Cancelar
                    </button>
                    <button 
                      className="comic-title"
                      style={{background:'#00cdbc',color:'#fff',border:'none',borderRadius:8,padding:'0.7rem 1.5rem',fontWeight:700,cursor:'pointer'}}
                      onClick={procesarVenta}
                      disabled={carritoVenta.length === 0}
                    >
                      Vender
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        
        <style>{`
          .shop-bg { animation: fadeInShop 0.7s; }
          @keyframes fadeInShop {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}</style>
      </div>
    );
  }
};

export default SimuladorTienda;
