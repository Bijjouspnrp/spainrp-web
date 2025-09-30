import { apiUrl } from '../../utils/api';
import React, { useState, useEffect } from "react";
import DiscordUserBar from "../DiscordUserBar";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { motion } from "framer-motion";
import { FaUniversity, FaApple, FaBitcoin, FaCarSide, FaEthereum, FaCoffee } from "react-icons/fa";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Catálogo de iconos para los activos (asignación por code)
const assetIcons = {
  BCN: <FaUniversity size={32} color="#f5c518" />,
  AAPL: <FaApple size={32} color="#a2aaad" />,
  BTC: <FaBitcoin size={32} color="#f7931a" />,
  MSUR: <FaCoffee size={32} color="#7289da" />,
  CONC: <FaCarSide size={32} color="#00c3ff" />,
  ETH: <FaEthereum size={32} color="#3c3c3d" />,
};

const StockMarket = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [stocks, setStocks] = useState([]);
  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState("info"); // 'info', 'success', 'error'
  const [pendingAction, setPendingAction] = useState(null); // { type: 'buy'|'sell', stock }
  const [actionQty, setActionQty] = useState(1);
  const [selectedStock, setSelectedStock] = useState(null);
  const [showChartModal, setShowChartModal] = useState(false);
  const [saldo, setSaldo] = useState(null);
  const [cartera, setCartera] = useState({});
  const [historial, setHistorial] = useState([]);

  // Carga usuario, economía y catálogo de activos real (API proxy)
  useEffect(() => {
    let mounted = true;
    let intervalId;
    let progressInterval;
    
    const fetchAll = async () => {
      try {
        // Iniciar barra de progreso de 5 segundos
        setLoadingProgress(0);
        progressInterval = setInterval(() => {
          setLoadingProgress(prev => {
            if (prev >= 100) {
              clearInterval(progressInterval);
              return 100;
            }
            return prev + 2; // Incremento de 2% cada 100ms = 5 segundos total
          });
        }, 100);
        
        // 1. Usuario
        const token = localStorage.getItem('spainrp_token');
        const headers = token ? { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' } : { 'Accept': 'application/json' };
        const resUser = await fetch(apiUrl("/auth/me"), { headers });
        const data = resUser.ok ? await resUser.json() : null;
        if (data && data.user) {
          setUser(data.user);
          console.log('[StockMarket] Usuario cargado:', data.user.id);
          
          // 2. Catálogo de activos
          console.log('[StockMarket] Cargando catálogo de activos...');
          const resActivos = await fetch(apiUrl('/api/proxy/bolsa/activos'));
          if (mounted && resActivos.ok) {
            const activosData = await resActivos.json();
            console.log('[StockMarket] Activos recibidos:', activosData);
            if (activosData && typeof activosData === 'object') {
              const activosArr = Object.values(activosData).map(asset => ({
                ...asset,
                icon: assetIcons[asset.code] || null
              }));
              setStocks(activosArr);
              console.log('[StockMarket] Activos procesados:', activosArr.length);
            }
          } else {
            console.warn('[StockMarket] Error cargando activos:', resActivos.status);
          }
          
          // 3. Saldo y cartera
          console.log('[StockMarket] Cargando saldo...');
          const resSaldo = await fetch(apiUrl(`/api/proxy/bolsa/saldo/${data.user.id}`));
          if (resSaldo.ok) {
            const saldoData = await resSaldo.json();
            console.log('[StockMarket] Saldo recibido:', saldoData);
            setSaldo(saldoData.saldo);
          } else {
            console.warn('[StockMarket] Error cargando saldo:', resSaldo.status);
          }
          
          console.log('[StockMarket] Cargando inversiones...');
          const resInv = await fetch(apiUrl(`/api/proxy/bolsa/inversiones/${data.user.id}`));
          if (resInv.ok) {
            const invData = await resInv.json();
            console.log('[StockMarket] Inversiones recibidas:', invData);
            setCartera(invData.inversiones || {});
          } else {
            console.warn('[StockMarket] Error cargando inversiones:', resInv.status);
          }
        }
      } catch (e) {
        console.error('[StockMarket] Error en fetchAll:', e);
      }
      
      // Esperar exactamente 5 segundos antes de ocultar el loading
      setTimeout(() => {
        if (mounted) {
          clearInterval(progressInterval);
          setLoading(false);
        }
      }, 5000);
    };
    
    fetchAll();
    intervalId = setInterval(fetchAll, 5000); // 5 segundos
    return () => { 
      mounted = false; 
      clearInterval(intervalId); 
      if (progressInterval) clearInterval(progressInterval);
    };
  }, []);


  // Confirmación y ejecución de compra/venta
  const handleInvest = (stock) => {
    setActionQty(1);
    setPendingAction({ type: 'buy', stock });
  };
  const handleSell = (stock) => {
    setActionQty(1);
    setPendingAction({ type: 'sell', stock });
  };

  const executePendingAction = async () => {
    if (!pendingAction || !user) return;
    const { type, stock } = pendingAction;
    const qty = Math.max(1, parseInt(actionQty) || 1);
    setMsgType('info');
    setMsg(type === 'buy' ? 'Procesando compra...' : 'Procesando venta...');
    try {
      let res;
      if (type === 'buy') {
        res = await fetch(apiUrl("/api/proxy/bolsa/comprar"), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.id,
            assetId: stock.code,
            cantidad: qty
          })
        });
        if (res.ok) {
          const data = await res.json();
          setSaldo(data.saldo);
          setCartera(data.inversiones);
          setHistorial([{ action: "Compraste", qty, code: stock.code, price: stock.price }, ...historial]);
          setMsgType('success');
          setMsg(`✅ Has invertido en ${stock.name} (${qty} acciones)`);
        } else {
          const errorData = await res.json();
          throw new Error(errorData.error || 'Error al comprar');
        }
      } else {
        res = await fetch(apiUrl("/api/proxy/bolsa/vender"), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.id,
            assetId: stock.code,
            cantidad: qty
          })
        });
        if (res.ok) {
          const data = await res.json();
          setSaldo(data.saldo);
          setCartera(data.inversiones);
          setHistorial([{ action: "Vendiste", qty, code: stock.code, price: stock.price }, ...historial]);
          setMsgType('success');
          setMsg(`✅ Has vendido ${qty} acción${qty>1?'es':''} de ${stock.name}`);
        } else {
          const errorData = await res.json();
          throw new Error(errorData.error || 'Error al vender');
        }
      }
    } catch (e) {
      setMsgType('error');
      setMsg(e.message || (pendingAction.type === 'buy' ? 'Error al invertir' : 'Error al vender'));
    }
    setPendingAction(null);
    setTimeout(() => setMsg(""), 2200);
  };

  const cancelPendingAction = () => {
    setPendingAction(null);
    setMsg("");
  };

  const openChartModal = (stock) => {
    setSelectedStock(stock);
    setShowChartModal(true);
  };
  const closeChartModal = () => {
    setShowChartModal(false);
    setSelectedStock(null);
  };

  // Precios ya no se simulan en frontend. Solo se muestran los precios iniciales o los que vengan de la API real.

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 25%, #16213e 50%, #0f3460 75%, #533483 100%)',
        color: '#fff',
        fontFamily: 'Inter, Segoe UI, sans-serif',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <DiscordUserBar />
        
        {/* Fondo animado con partículas */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.3) 0%, transparent 50%), radial-gradient(circle at 40% 40%, rgba(120, 219, 255, 0.2) 0%, transparent 50%)',
          animation: 'backgroundShift 8s ease-in-out infinite'
        }} />
        
        {/* Contenedor principal */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10,
          textAlign: 'center',
          padding: '2rem'
        }}>
          
          {/* Logo animado de la bolsa */}
          <div style={{
            position: 'relative',
            marginBottom: '2rem',
            animation: 'logoFloat 3s ease-in-out infinite'
          }}>
            <div style={{
              width: '120px',
              height: '120px',
              background: 'linear-gradient(45deg, #ffd700, #ffed4e, #ffd700)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '4rem',
              boxShadow: '0 0 40px rgba(255, 215, 0, 0.6), 0 0 80px rgba(255, 215, 0, 0.3), inset 0 0 20px rgba(255, 255, 255, 0.2)',
              animation: 'logoGlow 2s ease-in-out infinite alternate',
              position: 'relative'
            }}>
              💹
              {/* Efecto de ondas */}
              <div style={{
                position: 'absolute',
                width: '140px',
                height: '140px',
                border: '2px solid rgba(255, 215, 0, 0.3)',
                borderRadius: '50%',
                animation: 'waveExpand 2s ease-out infinite'
              }} />
              <div style={{
                position: 'absolute',
                width: '160px',
                height: '160px',
                border: '1px solid rgba(255, 215, 0, 0.2)',
                borderRadius: '50%',
                animation: 'waveExpand 2s ease-out infinite 0.5s'
              }} />
            </div>
          </div>
          
          {/* Título principal */}
          <h1 style={{
            fontSize: '3.5rem',
            fontWeight: '900',
            background: 'linear-gradient(45deg, #ffd700, #ffed4e, #ffd700, #ffed4e)',
            backgroundSize: '300% 300%',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            marginBottom: '0.5rem',
            letterSpacing: '3px',
            textShadow: '0 0 30px rgba(255, 215, 0, 0.5)',
            animation: 'titleShine 3s ease-in-out infinite'
          }}>
            BOLSA SPAINRP
          </h1>
          
          {/* Subtítulo */}
          <p style={{
            fontSize: '1.3rem',
            color: '#a0a0a0',
            marginBottom: '3rem',
            fontWeight: '300',
            letterSpacing: '1px'
          }}>
            Iniciando sistema de trading en tiempo real...
          </p>
          
          {/* Gráfico de previsualización animado */}
          <div style={{
            width: '400px',
            height: '200px',
            background: 'rgba(0, 0, 0, 0.3)',
            borderRadius: '20px',
            padding: '1.5rem',
            marginBottom: '2rem',
            border: '1px solid rgba(255, 215, 0, 0.3)',
            backdropFilter: 'blur(10px)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <h3 style={{
              fontSize: '1.1rem',
              color: '#ffd700',
              marginBottom: '1rem',
              textAlign: 'center',
              fontWeight: '600'
            }}>
              📈 Precios en Tiempo Real
            </h3>
            
            {/* Gráfico simulado */}
            <div style={{
              position: 'relative',
              height: '120px',
              background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.1) 0%, rgba(255, 119, 198, 0.1) 100%)',
              borderRadius: '10px',
              overflow: 'hidden'
            }}>
              {/* Línea de precio animada */}
              <svg width="100%" height="100%" style={{ position: 'absolute', top: 0, left: 0 }}>
                <defs>
                  <linearGradient id="priceGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#ffd700" stopOpacity="0.8" />
                    <stop offset="50%" stopColor="#ff6bcb" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#4ecdc4" stopOpacity="0.8" />
                  </linearGradient>
                </defs>
                <path
                  d="M 0,80 Q 50,60 100,40 T 200,20 T 300,30 T 400,10"
                  stroke="url(#priceGradient)"
                  strokeWidth="3"
                  fill="none"
                  style={{
                    strokeDasharray: '1000',
                    strokeDashoffset: '1000',
                    animation: 'drawLine 3s ease-in-out infinite'
                  }}
                />
                {/* Puntos de datos */}
                <circle cx="50" cy="60" r="4" fill="#ffd700" style={{ animation: 'pulse 2s ease-in-out infinite' }} />
                <circle cx="150" cy="20" r="4" fill="#ff6bcb" style={{ animation: 'pulse 2s ease-in-out infinite 0.5s' }} />
                <circle cx="250" cy="30" r="4" fill="#4ecdc4" style={{ animation: 'pulse 2s ease-in-out infinite 1s' }} />
                <circle cx="350" cy="10" r="4" fill="#ffd700" style={{ animation: 'pulse 2s ease-in-out infinite 1.5s' }} />
              </svg>
            </div>
          </div>
          
          {/* Barra de progreso */}
          <div style={{
            width: '300px',
            height: '6px',
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '3px',
            overflow: 'hidden',
            marginBottom: '1rem'
          }}>
            <div style={{
              height: '100%',
              background: 'linear-gradient(90deg, #ffd700, #ffed4e, #ffd700)',
              borderRadius: '3px',
              width: `${loadingProgress}%`,
              transition: 'width 0.1s ease-out',
              boxShadow: '0 0 10px rgba(255, 215, 0, 0.6)'
            }} />
          </div>
          
          {/* Texto de progreso */}
          <div style={{
            fontSize: '1rem',
            color: '#ffd700',
            fontWeight: '600',
            marginBottom: '2rem',
            animation: 'textPulse 2s ease-in-out infinite'
          }}>
            Conectando con servidores de trading... {loadingProgress}%
          </div>
          
          {/* Indicadores de estado */}
          <div style={{
            display: 'flex',
            gap: '2rem',
            alignItems: 'center',
            flexWrap: 'wrap',
            justifyContent: 'center'
          }}>
            {['📊', '💰', '📈', '⚡'].map((icon, index) => (
              <div key={index} style={{
                fontSize: '2rem',
                animation: `iconBounce 2s ease-in-out infinite ${index * 0.2}s`,
                filter: 'drop-shadow(0 0 10px rgba(255, 215, 0, 0.5))'
              }}>
                {icon}
              </div>
            ))}
          </div>
        </div>
        
        {/* Estilos CSS */}
        <style>{`
          @keyframes backgroundShift {
            0%, 100% { transform: translateX(0) translateY(0); }
            25% { transform: translateX(-10px) translateY(-5px); }
            50% { transform: translateX(10px) translateY(5px); }
            75% { transform: translateX(-5px) translateY(10px); }
          }
          
          @keyframes logoFloat {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-10px) rotate(5deg); }
          }
          
          @keyframes logoGlow {
            0% { box-shadow: 0 0 40px rgba(255, 215, 0, 0.6), 0 0 80px rgba(255, 215, 0, 0.3), inset 0 0 20px rgba(255, 255, 255, 0.2); }
            100% { box-shadow: 0 0 60px rgba(255, 215, 0, 0.8), 0 0 120px rgba(255, 215, 0, 0.5), inset 0 0 30px rgba(255, 255, 255, 0.3); }
          }
          
          @keyframes waveExpand {
            0% { transform: scale(1); opacity: 1; }
            100% { transform: scale(1.5); opacity: 0; }
          }
          
          @keyframes titleShine {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
          
          @keyframes drawLine {
            0% { stroke-dashoffset: 1000; }
            100% { stroke-dashoffset: 0; }
          }
          
          @keyframes pulse {
            0%, 100% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.2); opacity: 0.8; }
          }
          
          
          @keyframes textPulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.7; }
          }
          
          @keyframes iconBounce {
            0%, 100% { transform: translateY(0px) scale(1); }
            50% { transform: translateY(-10px) scale(1.1); }
          }
        `}</style>
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{
        minHeight:'100vh',
        display:'flex',
        flexDirection:'column',
        alignItems:'center',
        justifyContent:'center',
        background:'linear-gradient(120deg,#23272a 60%,#7289da 100%)',
        color:'#fff',
        fontFamily:'Inter,Segoe UI,sans-serif',
        animation:'fadein 1.2s',
        padding:'0'
      }}>
        <div style={{
          background:'rgba(44,47,51,0.98)',
          borderRadius:24,
          boxShadow:'0 8px 32px #23272a88',
          padding:'2.7rem 2.2rem',
          minWidth:340,
          maxWidth:420,
          textAlign:'center',
          display:'flex',
          flexDirection:'column',
          alignItems:'center',
          justifyContent:'center',
          animation:'fadein 1.2s',
        }}>
          <img src="https://imgur.com/098iBrX.png" alt="Discord Logo" style={{width:72,height:72,borderRadius:'50%',marginBottom:18,boxShadow:'0 2px 12px #7289da44',background:'#23272a'}} />
          <h2 style={{color:'#7289da',fontWeight:900,fontSize:'2.1rem',marginBottom:10,letterSpacing:1}}>No has iniciado sesión en Discord</h2>
          <p style={{fontSize:'1.18rem',marginBottom:18,color:'#fff',fontWeight:600,opacity:0.92}}>Para acceder a la Bolsa RP, inicia sesión con tu cuenta de Discord.<br/>Así podrás invertir y ver tu cartera.</p>
          <a href="/auth/login" className="btn-primary" style={{fontSize:'1.13rem',padding:'0.7rem 2.2rem',borderRadius:10,background:'linear-gradient(90deg,#7289da,#23272a)',color:'#fff',fontWeight:800,textDecoration:'none',boxShadow:'0 2px 8px #7289da22',marginBottom:14,transition:'background 0.2s'}}>
            <img src="https://imgur.com/098iBrX.png" alt="Discord" style={{width:22,height:22,verticalAlign:'middle',marginRight:8}} />
            Iniciar sesión con Discord
          </a>
          <button onClick={()=>window.location.href='/'} style={{fontSize:'1.08rem',padding:'0.7rem 2.2rem',borderRadius:10,background:'#e74c3c',color:'#fff',fontWeight:800,boxShadow:'0 2px 8px #e74c3c44',border:'none',marginTop:6,cursor:'pointer',transition:'background 0.2s'}}>Volver al inicio</button>
        </div>
        <style>{`
          @keyframes fadein { from { opacity: 0; transform: translateY(30px);} to { opacity: 1; transform: none;} }
        `}</style>
      </div>
    );
  }

  return (
    <div style={{minHeight:'100vh',background:'linear-gradient(120deg,#23272a 60%,#7289da 100%)',color:'#fff',fontFamily:'Inter,Segoe UI,sans-serif',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'flex-start',padding:'0'}}>
      <DiscordUserBar user={user} />
      <div style={{width:'100%',maxWidth:1400,margin:'0 auto',padding:'0',display:'flex',flexDirection:'column',alignItems:'center'}}>
        <div style={{marginTop:48,marginBottom:32,textAlign:'center'}}>
          <span style={{fontSize:'3.2rem',marginBottom:12,display:'block',textShadow:'0 2px 24px #7289da88'}}>💹</span>
          <h1 style={{fontWeight:900,fontSize:'2.7rem',letterSpacing:2,marginBottom:10}}>Bolsa <span style={{color:'#7289da'}}>SpainRP</span></h1>
          <div style={{fontSize:'1.25rem',opacity:0.92,marginBottom:8}}>Invierte en empresas, criptos y negocios RP en tiempo real.</div>
          {/* Apartado de saldo y cartera */}
          <div style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'flex-start',
            gap: '2.5rem',
            marginTop: 24,
            marginBottom: 8,
            flexWrap: 'wrap',
            width: '100%'
          }}>
            {/* Saldo */}
            <div style={{
              background: 'rgba(44,47,51,0.98)',
              borderRadius: 18,
              boxShadow: '0 2px 12px #23272a44',
              padding: '1.5rem 2.2rem',
              minWidth: 220,
              marginBottom: 8,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '1.18rem',
              color: '#fff',
              border: '2px solid #2ecc71',
            }}>
              <span style={{fontSize:'2.1rem',marginBottom:6}}>💰</span>
              Saldo disponible
              <span style={{color:'#2ecc71',fontSize:'1.35rem',marginTop:4}}>
                {saldo !== null ? `€${saldo}` : 'Cargando...'}
              </span>
            </div>
            {/* Cartera */}
            <div style={{
              background: 'rgba(44,47,51,0.98)',
              borderRadius: 18,
              boxShadow: '0 2px 12px #23272a44',
              padding: '1.5rem 2.2rem',
              minWidth: 320,
              marginBottom: 8,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '1.18rem',
              color: '#fff',
              border: '2px solid #7289da',
            }}>
              <span style={{fontSize:'2.1rem',marginBottom:6}}>📦</span>
              Mi Cartera
              <table style={{width:'100%',marginTop:8,fontSize:'1.08rem',color:'#fff',borderCollapse:'collapse'}}>
                <thead>
                  <tr style={{color:'#7289da',fontWeight:900,fontSize:'1.05rem'}}>
                    <th style={{padding:'0.3rem 0.7rem',textAlign:'left'}}>Activo</th>
                    <th style={{padding:'0.3rem 0.7rem',textAlign:'right'}}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(cartera).length === 0 && (
                    <tr><td colSpan={2} style={{color:'#aaa',fontWeight:600,padding:'0.5rem'}}>No tienes inversiones</td></tr>
                  )}
                  {Object.entries(cartera).map(([code, qty]) => {
                    const stock = stocks.find(s => s.code === code);
                    return (
                      <tr key={code}>
                        <td style={{padding:'0.3rem 0.7rem',fontWeight:700}}>{stock ? stock.name : code}</td>
                        <td style={{padding:'0.3rem 0.7rem',textAlign:'right',fontWeight:700}}>{qty}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
          {/* Mensaje feedback animado */}
          {msg && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.35 }}
              style={{
                marginTop: 10,
                fontWeight: 800,
                fontSize: '1.1rem',
                color: msgType === 'success' ? '#2ecc71' : msgType === 'error' ? '#e74c3c' : '#7289da',
                background: 'rgba(44,47,51,0.98)',
                borderRadius: 12,
                padding: '0.7rem 1.5rem',
                boxShadow: '0 2px 12px #23272a44',
                minWidth: 180,
                textAlign: 'center',
                letterSpacing: 1,
                zIndex: 10
              }}
            >
              {msg}
            </motion.div>
          )}
        </div>
        <div style={{width:'100%',maxWidth:1200,marginBottom:'2.7rem',display:'flex',flexDirection:'column',alignItems:'center',gap:'2.5rem'}}>
          <div style={{background:'rgba(44,47,51,0.98)',borderRadius:28,boxShadow:'0 8px 32px #23272a88',padding:'2.5rem 2rem',minWidth:360,animation:'fadein 1.2s',width:'100%'}}>
            <h2 style={{fontWeight:800,fontSize:'1.45rem',marginBottom:18,letterSpacing:1,textAlign:'center',color:'#fff'}}>Activos disponibles</h2>
            <div style={{display:'flex',flexWrap:'wrap',justifyContent:'center',gap:'2.2rem',width:'100%'}}>
              {stocks.map(stock => {
                const acciones = cartera[stock.code] || 0;
                return (
                  <div key={stock.id} style={{background:selectedStock&&selectedStock.id===stock.id?'#23272a':'rgba(44,47,51,0.98)',boxShadow:selectedStock&&selectedStock.id===stock.id?'0 2px 12px #7289da44':'0 2px 8px #7289da11',borderRadius:18,padding:'1.5rem 1.2rem',margin:'0.5rem',minWidth:260,maxWidth:280,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',transition:'background 0.2s',cursor:'pointer'}}>
                    <span style={{fontSize:'2.2rem',filter:'drop-shadow(0 2px 8px #7289da88)',marginBottom:8}}>{stock.icon}</span>
                    <span style={{fontWeight:800,color:'#fff',fontSize:'1.25rem',marginBottom:4}}>{stock.name}</span>
                    <span style={{fontWeight:600,fontSize:'1.08rem',color:'#7289da',marginBottom:4}}>{stock.type}</span>
                    <span style={{fontWeight:700,fontSize:'1.08rem',color:'#fff',marginBottom:4}}>{stock.code}</span>
                    <span style={{fontWeight:800,color:stock.price>stock.history[stock.history.length-2]?'#2ecc71':'#e74c3c',fontSize:'1.15rem',marginBottom:8}}>
                      {stock.type==='Cripto'?`$${stock.price}`:`€${stock.price}`}
                    </span>
                    <span style={{fontWeight:700, color:'#fff', fontSize:'1.05rem', marginBottom:6}}>
                      Acciones: {acciones}
                    </span>
                    <div style={{display:'flex',gap:'0.4rem',marginTop:6,flexWrap:'wrap',justifyContent:'center'}}>
                      <motion.button
                        whileTap={{ scale: 0.96 }}
                        whileHover={{ scale: 1.04 }}
                        onClick={()=>handleInvest(stock)}
                        style={{background:'linear-gradient(90deg,#7289da,#23272a)',color:'#fff',border:'none',borderRadius:9,padding:'0.38rem 0.85rem',fontWeight:800,fontSize:'0.98rem',cursor:'pointer',boxShadow:'0 2px 8px #7289da22',transition:'transform 0.2s',letterSpacing:1,minWidth:80}}
                        disabled={saldo !== null && saldo < stock.price}
                      >
                        <span style={{fontSize:'1.1rem',marginRight:5}}>💸</span>Invertir
                      </motion.button>
                      <motion.button
                        whileTap={{ scale: 0.96 }}
                        whileHover={{ scale: 1.04 }}
                        onClick={()=>openChartModal(stock)}
                        style={{background:'#fff',color:'#7289da',border:'2px solid #7289da',borderRadius:9,padding:'0.38rem 0.85rem',fontWeight:800,fontSize:'0.98rem',cursor:'pointer',boxShadow:'0 2px 8px #7289da11',transition:'background 0.2s',letterSpacing:1,minWidth:80}}
                      >
                        <span style={{fontSize:'1.1rem',marginRight:5}}>📈</span>Gráfico
                      </motion.button>
                      <motion.button
                        whileTap={{ scale: 0.96 }}
                        whileHover={{ scale: 1.04 }}
                        onClick={()=>handleSell(stock)}
                        style={{background:'#e74c3c',color:'#fff',border:'none',borderRadius:9,padding:'0.38rem 0.85rem',fontWeight:800,fontSize:'0.98rem',cursor:'pointer',boxShadow:'0 2px 8px #e74c3c22',transition:'background 0.2s',letterSpacing:1,minWidth:80}}
                        disabled={acciones < 1}
                      >
                        <span style={{fontSize:'1.1rem',marginRight:5}}>💰</span>Vender
                      </motion.button>
          {/* Modal de confirmación para invertir/vender con input de cantidad */}
          {pendingAction && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.25 }}
              style={{
                position: 'fixed',
                top: 0, left: 0, width: '100vw', height: '100vh',
                background: 'rgba(0,0,0,0.55)',
                zIndex: 99999,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <motion.div
                initial={{ y: 40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 40, opacity: 0 }}
                transition={{ duration: 0.25 }}
                style={{
                  background: 'rgba(44,47,51,0.98)',
                  borderRadius: 22,
                  boxShadow: '0 8px 32px #23272a88',
                  padding: '2.2rem 2.2rem',
                  minWidth: 340,
                  maxWidth: 420,
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                  color: '#fff',
                  fontWeight: 800,
                  fontSize: '1.13rem',
                  zIndex: 100000,
                }}
              >
                <div style={{fontSize:'2.2rem',marginBottom:10}}>{pendingAction.type==='buy'?'💸':'💰'}</div>
                {pendingAction.type === 'buy' ? (
                  <>
                    ¿Cuántas acciones quieres invertir en <span style={{color:'#7289da'}}>{pendingAction.stock.name}</span>?
                  </>
                ) : (
                  <>
                    ¿Cuántas acciones quieres vender de <span style={{color:'#7289da'}}>{pendingAction.stock.name}</span>?
                  </>
                )}
                <input
                  type="number"
                  min={1}
                  max={pendingAction.type==='sell' ? (cartera[pendingAction.stock.code]||1) : 9999}
                  value={actionQty}
                  onChange={e => {
                    let v = e.target.value.replace(/[^0-9]/g,"");
                    if (v === "") v = 1;
                    let n = Math.max(1, parseInt(v));
                    if (pendingAction.type==='sell') n = Math.min(n, cartera[pendingAction.stock.code]||1);
                    setActionQty(n);
                  }}
                  style={{margin:'1.2rem 0 0.5rem 0',padding:'0.5rem 1.2rem',fontSize:'1.15rem',borderRadius:8,border:'2px solid #7289da',fontWeight:900,background:'#23272a',color:'#fff',textAlign:'center',width:120,outline:'none',boxShadow:'0 2px 8px #7289da22'}}
                  autoFocus
                />
                <div style={{fontSize:'1.05rem',marginBottom:8}}>
                  {pendingAction.type==='buy'
                    ? <>Total: <span style={{color:'#2ecc71'}}>€{(pendingAction.stock.price * (actionQty||1)).toLocaleString()}</span></>
                    : <>Recibirás: <span style={{color:'#2ecc71'}}>€{(pendingAction.stock.price * (actionQty||1)).toLocaleString()}</span></>
                  }
                </div>
                <div style={{display:'flex',gap:'1.2rem',marginTop:18,justifyContent:'center'}}>
                  <motion.button
                    whileTap={{ scale: 0.96 }}
                    whileHover={{ scale: 1.04 }}
                    onClick={executePendingAction}
                    style={{background:'#2ecc71',color:'#fff',border:'none',borderRadius:9,padding:'0.55rem 1.5rem',fontWeight:900,fontSize:'1.08rem',cursor:'pointer',boxShadow:'0 2px 8px #2ecc7144',letterSpacing:1,minWidth:90}}
                  >Confirmar</motion.button>
                  <motion.button
                    whileTap={{ scale: 0.96 }}
                    whileHover={{ scale: 1.04 }}
                    onClick={cancelPendingAction}
                    style={{background:'#e74c3c',color:'#fff',border:'none',borderRadius:9,padding:'0.55rem 1.5rem',fontWeight:900,fontSize:'1.08rem',cursor:'pointer',boxShadow:'0 2px 8px #e74c3c44',letterSpacing:1,minWidth:90}}
                  >Cancelar</motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          {/* Modal para el gráfico */}
          {showChartModal && selectedStock && (
            <div style={{position:'fixed',top:0,left:0,width:'100vw',height:'100vh',background:'rgba(0,0,0,0.7)',zIndex:9999,display:'flex',alignItems:'center',justifyContent:'center'}}>
              <div style={{background:'rgba(44,47,51,0.98)',borderRadius:28,boxShadow:'0 8px 32px #23272a88',padding:'2.5rem 2rem',minWidth:340,maxWidth:500,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',animation:'fadein 0.5s'}}>
                <h2 style={{fontWeight:800,fontSize:'1.35rem',marginBottom:18,letterSpacing:1,textAlign:'center',color:'#fff'}}>Precio de {selectedStock.name}</h2>
                <div style={{width:'100%',maxWidth:420,background:'linear-gradient(120deg,#7289da 60%,#23272a 100%)',borderRadius:18,padding:'1.2rem',boxShadow:'0 2px 12px #7289da22'}}>
                  <Line
                    data={{
                      labels: selectedStock.history.map((_, i) => `T${i + 1}`),
                      datasets: [
                        {
                          label: selectedStock.name,
                          data: selectedStock.history,
                          borderColor:selectedStock.price>selectedStock.history.at(-2)?"#2ecc71":"#e74c3c",
                          backgroundColor: "rgba(114,137,218,0.18)",
                          tension: 0.38,
                          pointRadius: 7,
                          pointBackgroundColor: "#fff",
                          fill: true,
                          borderWidth: 5,
                          pointBorderColor: '#7289da',
                          pointHoverRadius: 11,
                        },
                      ],
                    }}
                    options={{
                      responsive: true,
                      plugins: {
                        legend: { display: false },
                        title: { display: false },
                        tooltip: {
                          backgroundColor: '#23272a',
                          titleColor: '#fff',
                          bodyColor: '#fff',
                          borderColor: '#7289da',
                          borderWidth: 2,
                        },
                      },
                      scales: {
                        x: { ticks: { color: "#fff",fontSize:16 }, grid: { color: "#7289da" } },
                        y: { ticks: { color: "#fff",fontSize:16 }, grid: { color: "#7289da" } },
                      },
                    }}
                  />
                </div>
                <button onClick={closeChartModal} style={{marginTop:24,padding:'0.7rem 2.2rem',background:'#e74c3c',color:'#fff',border:'none',borderRadius:12,fontWeight:800,fontSize:'1.13rem',cursor:'pointer',boxShadow:'0 2px 8px #e74c3c44',letterSpacing:1}}>Cerrar</button>
              </div>
            </div>
          )}
          {/* Historial de inversiones (desplegable) */}
          <details style={{background:'rgba(44,47,51,0.98)',border:'1.5px solid #7289da',borderRadius:22,padding:'1.2rem 1.5rem',boxShadow:'0 4px 18px #23272a66',width:'100%',maxWidth:700,margin:'0 auto',animation:'fadein 1.4s',marginBottom:32,marginTop:8}}>
            <summary style={{fontWeight:900,fontSize:'1.22rem',color:'#fff',letterSpacing:1,textAlign:'center',outline:'none',cursor:'pointer',padding:'0.5rem 0',userSelect:'none'}}>Historial de inversiones</summary>
            <ul style={{fontSize:16, color:'#fff', marginLeft:0, paddingLeft:0,fontWeight:600,marginTop:18}}>
              {historial.length === 0 && (
                <li style={{color:'#aaa',fontWeight:600,padding:'0.7rem'}}>No hay movimientos recientes</li>
              )}
              {historial.map((h, idx) => (
                <li key={idx} style={{marginBottom:'0.7rem',background:'#23272a',borderRadius:12,padding:'0.7rem 1.1rem',boxShadow:'0 2px 8px #7289da22',fontSize:'1.03rem',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                  <span style={{fontWeight:800,color:'#7289da',marginRight:8,fontSize:'1.08rem',display:'flex',alignItems:'center',gap:8}}><span style={{fontSize:'1.1rem'}}>💸</span>{h.action}</span>
                  <span style={{color:'#fff',fontSize:'1.03rem'}}>{h.qty} acciones de <b>{h.code}</b> a <span style={{color:'#2ecc71'}}>€{h.price}</span></span>
                </li>
              ))}
            </ul>
          </details>
        </div>
      </div>
      <div style={{marginTop:0,padding:'1.7rem 0',background:'linear-gradient(90deg,#7289da,#23272a)',color:'#fff',textAlign:'center',fontWeight:900,letterSpacing:2,fontSize:'1.22rem',boxShadow:'0 -2px 12px #23272a33',width:'100%',borderRadius:'0 0 28px 28px'}}>Bolsa RP en tiempo real. Powered by SpainRP.</div>
      <style>{`
        @keyframes fadein { from { opacity: 0; transform: translateY(30px);} to { opacity: 1; transform: none;} }
      `}</style>
    </div>
  );
};

export default StockMarket;
