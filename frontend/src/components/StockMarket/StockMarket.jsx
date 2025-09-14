import React, { useState, useEffect } from "react";
import axios from "axios";
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
    const fetchAll = async () => {
      try {
        // 1. Usuario
        const resUser = await fetch("/auth/me", { credentials: "include" });
        const data = resUser.ok ? await resUser.json() : null;
        if (data && data.user) {
          setUser(data.user);
          // 2. Catálogo de activos
          const resActivos = await axios.get(`/api/proxy/bolsa/activos`);
          if (mounted && resActivos.data && typeof resActivos.data === 'object') {
            const activosArr = Object.values(resActivos.data).map(asset => ({
              ...asset,
              icon: assetIcons[asset.code] || null
            }));
            setStocks(activosArr);
          }
          // 3. Saldo y cartera
          const resSaldo = await axios.get(`/api/proxy/bolsa/saldo/${data.user.id}`);
          setSaldo(resSaldo.data.saldo);
          const resInv = await axios.get(`/api/proxy/bolsa/inversiones/${data.user.id}`);
          setCartera(resInv.data.inversiones || {});
        }
      } catch (e) {}
      setLoading(false);
    };
    fetchAll();
  intervalId = setInterval(fetchAll, 5000); // 5 segundos
    return () => { mounted = false; clearInterval(intervalId); };
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
        res = await axios.post("/api/proxy/bolsa/comprar", {
          userId: user.id,
          assetId: stock.code,
          cantidad: qty
        });
        setSaldo(res.data.saldo);
        setCartera(res.data.inversiones);
        setHistorial([{ action: "Compraste", qty, code: stock.code, price: stock.price }, ...historial]);
        setMsgType('success');
        setMsg(`✅ Has invertido en ${stock.name} (${qty} acciones)`);
      } else {
        res = await axios.post("/api/proxy/bolsa/vender", {
          userId: user.id,
          assetId: stock.code,
          cantidad: qty
        });
        setSaldo(res.data.saldo);
        setCartera(res.data.inversiones);
        setHistorial([{ action: "Vendiste", qty, code: stock.code, price: stock.price }, ...historial]);
        setMsgType('success');
        setMsg(`✅ Has vendido ${qty} acción${qty>1?'es':''} de ${stock.name}`);
      }
    } catch (e) {
      setMsgType('error');
      setMsg(e.response?.data?.error || (pendingAction.type === 'buy' ? 'Error al invertir' : 'Error al vender'));
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
      <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center">
        <DiscordUserBar />
        <div className="flex flex-col items-center gap-6">
          <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <h2 className="text-2xl font-bold">Cargando Bolsa...</h2>
        </div>
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
