import React, { useState } from 'react';
import { FaLock, FaSkull, FaPills, FaMoneyBillWave, FaUserSecret, FaLaptopCode, FaSkullCrossbones, FaChartLine } from 'react-icons/fa';
import { GiPistolGun, GiChemicalDrop, GiAbbotMeeple, GiAbdominalArmor, GiKnifeFork, GiKnifeThrust, GiSentryGun } from 'react-icons/gi';
import './BlackMarket.css';
import DiscordUserBar from '../DiscordUserBar';

// Define ITEMS array above the component
const ITEMS = [
  {
    category: 'Armas ERLC',
    icon: <GiPistolGun />,
    options: [
      { itemId: 'bm_beretta_m9', name: 'Beretta M9', price: 1900, icon: <GiPistolGun /> },
      { itemId: 'bm_remington_870', name: 'Remington 870', price: 24000, icon: <GiPistolGun /> },
      { itemId: 'bm_ak_47', name: 'AK-47', price: 125000, icon: <GiPistolGun /> },
      { itemId: 'bm_desert_eagle', name: 'Desert Eagle', price: 25000, icon: <GiPistolGun /> },
      { itemId: 'bm_lmt_l129a1', name: 'LMT_L129A1', price: 50000, icon: <GiPistolGun /> },
      { itemId: 'bm_cuchillo_erlc', name: 'Cuchillo', price: 800, icon: <GiKnifeThrust /> },
      { itemId: 'bm_m249', name: 'M249', price: 140000, icon: <GiSentryGun /> },
    ]
  },
  {
    category: 'Sustancias (Compras se realizan en la Cafeteria)',
    icon: <FaPills />,
    options: [
      { itemId: 'bm_cafe_magico', name: 'Cafe con magia', price: 4000 },
      { itemId: 'bm_marihuana', name: 'Marihuana', price: 1200 },
      { itemId: 'bm_lsd', name: 'LSD', price: 2500 },
      { itemId: 'bm_extasis', name: 'Éxtasis', price: 1800 },
      { itemId: 'bm_metanfetamina', name: 'Metanfetamina', price: 3500 },
      { itemId: 'bm_heroina', name: 'Heroína', price: 5000 },
    ]
  },
  {
    category: 'Servicios',
    icon: <FaUserSecret />,
    options: [
      { itemId: 'bm_dni_falso_7d', name: 'DNI FALSO (7 dias)', price: 3000 },
      { itemId: 'bm_eliminar_multa', name: 'Eliminación 1 multa', price: 28000 },
      { itemId: 'bm_borrar_antecedente', name: 'Borrar 1 antecedente', price: 95000 },
      { itemId: 'bm_acceso_panel_policia', name: 'Acceso panel policía', price: 9000000 },
    ]
  },
  {
    category: 'Dinero',
    icon: <FaMoneyBillWave />,
    options: [
      { itemId: 'bm_dinero_falso', name: 'Dinero falso', price: 2000 },
      { itemId: 'bm_transferencia_oculta', name: 'Transferencia oculta', price: 5000 },
      { itemId: 'bm_lavado_dinero', name: 'Lavado de dinero', price: 9000 },
    ]
  },
  {
    category: 'Hacking',
    icon: <FaLaptopCode />,
    options: [
      { itemId: 'bm_vpn_premium', name: 'VPN Premium', price: 2500 },
      { itemId: 'bm_movil_seguro', name: 'Movil seguro (Irrastreable)', price: 12000 },
      { itemId: 'bm_keylogger', name: 'Keylogger', price: 4000 },
      { itemId: 'bm_md_anonimos', name: 'Acceso a mensajes anonimos mediante bot por MD', price: 7000 },
      { itemId: 'bm_root_servidor', name: 'Acceso root servidor', price: 25000 },
    ]
  },
  {
    category: 'Sustancias',
    icon: <GiChemicalDrop />,
    options: [
      { itemId: 'bm_cocaina', name: 'Cocaína', price: 8000, icon: <GiChemicalDrop /> },
      { itemId: 'bm_extasis_2', name: 'Éxtasis', price: 4000, icon: <FaPills /> },
      { itemId: 'bm_veneno', name: 'Veneno', price: 6000, icon: <FaSkullCrossbones /> },
    ]
  },
  {
    category: 'Servicios',
    icon: <FaLaptopCode />,
    options: [
      { itemId: 'bm_hackeo', name: 'Hackeo', price: 15000, icon: <FaLaptopCode /> },
      { itemId: 'bm_falsificacion', name: 'Falsificación', price: 10000, icon: <FaUserSecret /> },
      { itemId: 'bm_lavado_dinero_2', name: 'Lavado de dinero', price: 20000, icon: <FaMoneyBillWave /> },
    ]
  },
  
];

// Bolsa Negra Stocks
const STOCKS = [
  { name: 'CryptoCoin', price: 320, color: '#22d3ee' },
  { name: 'Armas', price: 180, color: '#ef4444' },
  { name: 'Sustancias', price: 90, color: '#a3e635' },
  { name: 'Servicios', price: 210, color: '#f59e42' },
];
export default function BlackMarket() {
  const [userBalance, setUserBalanceState] = useState(null);
  const [user, setUser] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [showModal, setShowModal] = React.useState(false);
  const [modalItem, setModalItem] = React.useState(null);
  const [showToast, setShowToast] = React.useState(false);
  const [showInventory, setShowInventory] = React.useState(false);
  const [inventory, setInventory] = React.useState([]);
  const [inventoryLoading, setInventoryLoading] = React.useState(false);
  const [inventoryError, setInventoryError] = React.useState('');
  const [catalog, setCatalog] = React.useState({}); // mapa itemId -> { name, price }
  const [catalogLoaded, setCatalogLoaded] = React.useState(false);
  const [purchaseState, setPurchaseState] = React.useState({ visible: false, status: 'idle', message: '' });
  // Estado para la pestaña/categoría seleccionada
  const [selected, setSelected] = React.useState(0);
  // Estados para animaciones de entrada / salida (mount + unmount suave)
  const [modalClosing, setModalClosing] = React.useState(false);
  const [inventoryClosing, setInventoryClosing] = React.useState(false);
  const [adminClosing, setAdminClosing] = React.useState(false);
  const [purchaseClosing, setPurchaseClosing] = React.useState(false);

  // Helpers para cerrar con animación (no usar setShowX directamente en botones)
  const closeModal = () => {
    setModalClosing(true);
    setTimeout(() => {
      setModalClosing(false);
      setShowModal(false);
      setModalItem(null);
    }, 260);
  };

  const closeInventory = () => {
    setInventoryClosing(true);
    setTimeout(() => {
      setInventoryClosing(false);
      setShowInventory(false);
    }, 260);
  };

  const closeAdminPanel = () => {
    setAdminClosing(true);
    setTimeout(() => {
      setAdminClosing(false);
      setShowAdminPanel(false);
    }, 260);
  };

  const closePurchaseOverlay = () => {
    setPurchaseClosing(true);
    setTimeout(() => {
      setPurchaseClosing(false);
      setPurchaseState({ visible: false, status: 'idle', message: '' });
    }, 260);
  };
  const [authorized, setAuthorized] = React.useState(false);
  const [roleChecking, setRoleChecking] = React.useState(true);
  const [roleToast, setRoleToast] = React.useState('');
  
  // Estados para administración
  const [isAdmin, setIsAdmin] = React.useState(false);
  const [adminChecking, setAdminChecking] = React.useState(false);
  const [showAdminPanel, setShowAdminPanel] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [searchResults, setSearchResults] = React.useState([]);
  const [selectedUser, setSelectedUser] = React.useState(null);
  const [userInventory, setUserInventory] = React.useState([]);
  const [adminLoading, setAdminLoading] = React.useState(false);
  const [adminMessage, setAdminMessage] = React.useState('');
  
  // Bolsa Negra minigame state
  const [balance, setBalance] = useState(() => {
    const saved = localStorage.getItem('blackmarket-balance');
    return saved ? parseInt(saved) : 2000;
  });
  const [portfolio, setPortfolio] = useState(() => {
    const saved = localStorage.getItem('blackmarket-portfolio');
    return saved ? JSON.parse(saved) : STOCKS.map(s => ({ name: s.name, amount: 0, buyPrice: 0 }));
  });
  const [stockPrices, setStockPrices] = useState(STOCKS.map(s => s.price));
  const [priceChanges, setPriceChanges] = useState(STOCKS.map(() => 0));
  const [priceFlash, setPriceFlash] = useState(STOCKS.map(() => false));
  // Animación de precios y flash
  React.useEffect(() => {
    const interval = setInterval(() => {
      setStockPrices((prev) => prev.map((p, i) => {
        let change = Math.round((Math.random()-0.5)*Math.max(10, Math.floor(p/20)));
        let newPrice = Math.max(10, p + change);
        setPriceChanges(chs => {
          const arr = [...chs];
          arr[i] = change;
          return arr;
        });
        setPriceFlash(flash => {
          const arr = [...flash];
          arr[i] = true;
          setTimeout(() => {
            setPriceFlash(f => {
              const arr2 = [...f];
              arr2[i] = false;
              return arr2;
            });
          }, 600);
          return arr;
        });
        return newPrice;
      }));
    }, 2500);
    return () => clearInterval(interval);
  }, []);
  // Guardar progreso
  React.useEffect(() => {
    localStorage.setItem('blackmarket-balance', balance);
    localStorage.setItem('blackmarket-portfolio', JSON.stringify(portfolio));
  }, [balance, portfolio]);

  React.useEffect(() => {
    console.log('[BlackMarket] Fetch /auth/me...');
    fetch('/auth/me', { credentials: 'include' })
      .then(res => res.ok ? res.json() : null)
      .then(async data => {
        console.log('[BlackMarket] /auth/me data:', data);
        if (data && data.user) {
          setUser(data.user);
          try {
            setRoleChecking(true);
            // Verificar membresía directa contra el bot API (vía proxy)
            const REQUIRED_ROLE_ID = '1384340799013257307';
            const memberRes = await fetch(`http://localhost:3001/api/proxy/discord/ismember/${encodeURIComponent(data.user.id)}`);
            const member = await memberRes.json();
            let ok = Boolean(member?.isMember);
            if (ok) {
              const roleRes = await fetch(`http://localhost:3001/api/proxy/discord/hasrole/${encodeURIComponent(data.user.id)}/${REQUIRED_ROLE_ID}`);
              const role = await roleRes.json();
              ok = Boolean(role?.hasRole);
              if (ok) {
                setRoleToast('Rol criminal detectado ✅ Acceso concedido.');
                setTimeout(() => setRoleToast(''), 2500);
              }
            }
            setAuthorized(ok);
            console.log('[BlackMarket] membership/role check:', { isMember: member?.isMember, hasRole: ok });
            
            // Verificar si es administrador total
            if (ok) {
              try {
                setAdminChecking(true);
                const adminRes = await fetch(`http://localhost:3001/api/proxy/admin/isadmin/${encodeURIComponent(data.user.id)}`);
                const adminData = await adminRes.json();
                setIsAdmin(Boolean(adminData?.isAdmin));
                console.log('[BlackMarket] admin check:', adminData);
              } catch (e) {
                console.warn('[BlackMarket] admin check error:', e);
                setIsAdmin(false);
              } finally {
                setAdminChecking(false);
              }
            }
            
            setRoleChecking(false);
          } catch (e) {
            console.warn('[BlackMarket] user-info error', e);
            setAuthorized(false);
            setRoleChecking(false);
          }
        }
        setLoading(false);
      })
      .catch((e) => { console.error('[BlackMarket] /auth/me error:', e); setLoading(false); });
  }, []);

  // Cargar catálogo desde API externa (vía proxy backend)
  React.useEffect(() => {
    (async () => {
      try {
        console.log('[BlackMarket] Fetch catálogo...');
        const resp = await fetch('http://localhost:3001/api/proxy/blackmarket/items');
        const data = await resp.json();
        if (resp.ok && data && typeof data === 'object') {
          setCatalog(data);
          console.log('[BlackMarket] Catálogo cargado:', Object.keys(data).length, 'items');
        } else {
          console.warn('[BlackMarket] Error catálogo:', data);
        }
      } catch (e) {
        console.error('[BlackMarket] Error cargando catálogo:', e);
      } finally {
        setCatalogLoaded(true);
      }
    })();
  }, []);

  const handleBuy = (item) => {
    if (!user) {
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2500);
      return;
    }
    setModalItem(item);
    setShowModal(true);
  };

  // Funciones de administración
  const searchUsers = async (query) => {
    if (!query.trim() || !isAdmin) return;
    setAdminLoading(true);
    try {
      const response = await fetch(`http://localhost:3001/api/proxy/admin/search/${encodeURIComponent(query)}?adminUserId=${user.id}`);
      const data = await response.json();
      if (response.ok) {
        setSearchResults(data.users || []);
      } else {
        setAdminMessage('Error al buscar usuarios: ' + (data.error || 'Error desconocido'));
      }
    } catch (error) {
      setAdminMessage('Error al buscar usuarios: ' + error.message);
    } finally {
      setAdminLoading(false);
    }
  };

  const selectUser = async (user) => {
    setSelectedUser(user);
    setAdminLoading(true);
    try {
      // Cargar inventario del usuario
      const inventoryRes = await fetch(`http://localhost:3001/api/proxy/admin/inventory/${user.id}?adminUserId=${user.id}`);
      const inventoryData = await inventoryRes.json();
      if (inventoryRes.ok) {
        setUserInventory(inventoryData.inventario || []);
      }

      // Cargar saldo del usuario
      const balanceRes = await fetch(`http://localhost:3001/api/proxy/admin/balance/${user.id}?adminUserId=${user.id}`);
      const balanceData = await balanceRes.json();
      if (balanceRes.ok) {
        setUserBalance(balanceData);
      }
    } catch (error) {
      setAdminMessage('Error al cargar datos del usuario: ' + error.message);
    } finally {
      setAdminLoading(false);
    }
  };

  const addItemToUser = async (itemId, amount) => {
    if (!selectedUser || !isAdmin) return;
    setAdminLoading(true);
    try {
      const response = await fetch('http://localhost:3001/api/proxy/admin/additem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetUserId: selectedUser.id,
          itemId,
          amount: parseInt(amount),
          adminUserId: user.id
        })
      });
      const data = await response.json();
      if (response.ok) {
        setAdminMessage(`✅ Item agregado exitosamente`);
        // Recargar inventario
        selectUser(selectedUser);
      } else {
        setAdminMessage('❌ Error al agregar item: ' + (data.error || 'Error desconocido'));
      }
    } catch (error) {
      setAdminMessage('❌ Error al agregar item: ' + error.message);
    } finally {
      setAdminLoading(false);
    }
  };

  const removeItemFromUser = async (itemId, amount) => {
    if (!selectedUser || !isAdmin) return;
    setAdminLoading(true);
    try {
      const response = await fetch('http://localhost:3001/api/proxy/admin/removeitem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetUserId: selectedUser.id,
          itemId,
          amount: parseInt(amount),
          adminUserId: user.id
        })
      });
      const data = await response.json();
      if (response.ok) {
        setAdminMessage(`✅ Item retirado exitosamente`);
        // Recargar inventario
        selectUser(selectedUser);
      } else {
        setAdminMessage('❌ Error al retirar item: ' + (data.error || 'Error desconocido'));
      }
    } catch (error) {
      setAdminMessage('❌ Error al retirar item: ' + error.message);
    } finally {
      setAdminLoading(false);
    }
  };

  const setUserBalance = async (cash, bank) => {
    if (!selectedUser || !isAdmin) return;
    setAdminLoading(true);
    try {
      const response = await fetch('http://localhost:3001/api/proxy/admin/setbalance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetUserId: selectedUser.id,
          cash: parseInt(cash) || 0,
          bank: parseInt(bank) || 0,
          adminUserId: user.id
        })
      });
      const data = await response.json();
      if (response.ok) {
        setAdminMessage(`✅ Saldo actualizado exitosamente`);
        // Recargar saldo
        selectUser(selectedUser);
      } else {
        setAdminMessage('❌ Error al actualizar saldo: ' + (data.error || 'Error desconocido'));
      }
    } catch (error) {
      setAdminMessage('❌ Error al actualizar saldo: ' + error.message);
    } finally {
      setAdminLoading(false);
    }
  };

// --- Bloque: feedback de carga centrado (spinner + texto) ---
if (loading || roleChecking) {
  // Si termina de cargar y no hay user, mostrar login en vez de spinner
  if (!loading && !roleChecking && !user) {
    return (
      <div className="blackmarket-hack-bg">
        <DiscordUserBar />
        <div className="blackmarket-hack-header">
          <FaLock size={32} style={{marginRight:12}} />
          <span>BLACKMARKET SPAINRP</span>
        </div>
        <div style={{textAlign:'center',marginTop:'120px',color:'#fff'}}>
          <h2>Debes iniciar sesión con Discord para acceder al BlackMarket.</h2>
          <button
            style={{background:'#7289da',color:'#fff',borderRadius:8,padding:'0.7rem 1.5rem',fontWeight:700,textDecoration:'none',fontSize:'1.2rem',border:'none',cursor:'pointer'}}
            onClick={() => {
              const redirectUrl = `${window.location.origin}/blackmarket`;
              console.log('[BlackMarket] Redirecting to login with returnTo:', redirectUrl);
              window.location.href = `/auth/login?redirect=${encodeURIComponent(redirectUrl)}`;
            }}
          >
            Iniciar sesión
          </button>
        </div>
        {showToast && (
          <div style={{position:'fixed',top:32,right:32,background:'#23272a',color:'#fff',padding:'14px 28px',borderRadius:10,boxShadow:'0 2px 8px #23272a33',fontWeight:700,zIndex:9999}}>
            Debes iniciar sesión para comprar en el BlackMarket.
          </div>
        )}
        <div className="blackmarket-hack-footer">
          <FaSkull size={18} style={{marginRight:6}} />
          <span>Acceso solo para usuarios logueados Discord. Estilo hacking, opciones avanzadas.</span>
        </div>
      </div>
    );
  }
  // Inyecta la animación del spinner solo una vez
  if (typeof window !== 'undefined' && !document.getElementById('blackmarket-spinner-style')) {
    const style = document.createElement('style');
    style.id = 'blackmarket-spinner-style';
    style.innerHTML = `@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`;
    document.head.appendChild(style);
  }

  return (
    <div className="blackmarket-hack-bg">
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        minHeight: '60vh', width: '100%',
      }}>
        <div style={{
          width: 64,
          height: 64,
          border: '7px solid #23272a',
          borderTop: '7px solid #FFD700',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          marginBottom: 24
        }} />
        <div style={{ color: '#FFD700', fontWeight: 800, fontSize: '1.3rem', textShadow: '0 0 8px #FFD70055', marginBottom: 8 }}>
          Entrando al BlackMarket...
        </div>
        <div style={{ color: '#fff', opacity: 0.85, fontSize: '1.05rem' }}>Verificando acceso y permisos</div>
      </div>

      <div className="blackmarket-hack-footer">
        <FaSkull size={18} style={{ marginRight: 6 }} />
        <span>Acceso solo para Criminales en SpainRP.</span>
      </div>
    </div>
  );
}
// --- fin del bloque ---  // Mostrar la página con info de login y toast, sin redirigir
if (!user) {
  return (
    <div className="blackmarket-hack-bg">
      <DiscordUserBar />
      <div className="blackmarket-hack-header">
        <FaLock size={32} style={{marginRight:12}} />
        <span>BLACKMARKET SPAINRP</span>
      </div>
      <div style={{textAlign:'center',marginTop:'120px',color:'#fff'}}>
        <h2>Debes iniciar sesión con Discord para acceder al BlackMarket.</h2>
        <button
          style={{background:'#7289da',color:'#fff',borderRadius:8,padding:'0.7rem 1.5rem',fontWeight:700,textDecoration:'none',fontSize:'1.2rem',border:'none',cursor:'pointer'}}
          onClick={() => {
            const redirectUrl = `${window.location.origin}/blackmarket`;
            console.log('[BlackMarket] Redirecting to login with returnTo:', redirectUrl);
            window.location.href = `/auth/login?redirect=${encodeURIComponent(redirectUrl)}`;
          }}
        >
          Iniciar sesión
        </button>
      </div>
      {showToast && (
        <div style={{position:'fixed',top:32,right:32,background:'#23272a',color:'#fff',padding:'14px 28px',borderRadius:10,boxShadow:'0 2px 8px #23272a33',fontWeight:700,zIndex:9999}}>
          Debes iniciar sesión para comprar en el BlackMarket.
        </div>
      )}
      <div className="blackmarket-hack-footer">
        <FaSkull size={18} style={{marginRight:6}} />
        <span>Acceso solo para usuarios logueados Discord. Estilo hacking, opciones avanzadas.</span>
      </div>
    </div>
  );
}

  // Usuario logueado pero sin el rol requerido → bloquear acceso
  if (!authorized) {
  return (
    <div className="blackmarket-hack-bg">
      <DiscordUserBar />
      <div className="blackmarket-hack-header">
        <FaLock size={32} style={{marginRight:12}} />
        <span>BLACKMARKET SPAINRP</span>
      </div>
        <div style={{textAlign:'center',marginTop:'120px',color:'#fff', maxWidth: 720, padding: '0 16px'}}>
          <h2 style={{color:'#FFD700', marginBottom: 8}}>Acceso restringido</h2>
          <div style={{opacity:0.95}}>Debes ser miembro del servidor y tener el rol <b>Criminal</b> para entrar.</div>
          <div style={{marginTop: 20, display:'flex', gap: 12, justifyContent:'center', flexWrap:'wrap'}}>
            <a href="#discord" style={{background:'#7289da',color:'#fff',borderRadius:8,padding:'0.7rem 1.5rem',fontWeight:700,textDecoration:'none',fontSize:'1.05rem',border:'none',cursor:'pointer'}}>Unirme al Discord</a>
            <a href="https://discord.com/channels/1212556680911650866/1384341523474284574/1388083940337778688" target="_blank" rel="noopener noreferrer" style={{background:'#00ff99',color:'#111',borderRadius:8,padding:'0.7rem 1.5rem',fontWeight:800,textDecoration:'none',fontSize:'1.05rem',border:'none',cursor:'pointer', boxShadow:'0 0 12px #00ff9933'}}>
              Obtener rol Criminal
            </a>
          </div>
        </div>
        <div className="blackmarket-hack-footer">
          <FaSkull size={18} style={{marginRight:6}} />
          <span>Acceso solo para criminales del servidor.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="blackmarket-hack-bg">
      {roleChecking && <div className="role-check-bar" />}
      {roleToast && <div className="role-ok-toast">{roleToast}</div>}
      <DiscordUserBar />
      <div className="blackmarket-hack-header">
        <FaLock size={32} style={{marginRight:12}} />
        <span>BLACKMARKET SPAINRP</span>
      </div>
      {user && (
        <button
          className="inventory-fab"
          title="Inventario"
          onClick={async () => {
            try {
              setInventoryLoading(true);
              setInventoryError('');
              console.log('[BlackMarket] Fetch inventario for', user.id);
              const resp = await fetch(`http://localhost:3001/api/proxy/blackmarket/inventario/${encodeURIComponent(user.id)}`);
              const data = await resp.json();
              if (!resp.ok || data?.error) {
                setInventoryError(data?.error || 'No se pudo recuperar el inventario');
                setInventory([]);
              } else {
                const arr = Array.isArray(data?.inventario) ? data.inventario : [];
                const normalized = arr.map((it) => {
                  const itemId = it.itemId || it.item_id || it.id || null;
                  const apiDef = itemId ? catalog[itemId] : null;
                  const name = it.name || it.nombre || apiDef?.name || itemId || '-';
                  const price = (typeof it.price === 'number' ? it.price : (typeof it.precio === 'number' ? it.precio : (typeof apiDef?.price === 'number' ? apiDef.price : null)));
                  const amount = it.amount ?? it.cantidad ?? 1;
                  return { itemId, name, price, amount };
                });
                setInventory(normalized);
              }
              setShowInventory(true);
            } catch (e) {
              console.error('[BlackMarket] Inventario error:', e);
              setInventoryError('Error de red');
              setShowInventory(true);
            } finally {
              setInventoryLoading(false);
            }
          }}
        >
          <span>🎒</span>
        </button>
      )}
      
      {isAdmin && (
        <button
          className="admin-fab"
          title="Panel de Administración"
          onClick={() => setShowAdminPanel(true)}
          style={{
            position: 'fixed',
            top: '20px',
            left: '20px',
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #ff6b6b, #ee5a24)',
            border: 'none',
            color: 'white',
            fontSize: '24px',
            cursor: 'pointer',
            boxShadow: '0 4px 15px rgba(255, 107, 107, 0.4)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.3s ease'
          }}
        >
          ⚙️
        </button>
      )}
      <div className="blackmarket-hack-tabs">
        {[...ITEMS.map((cat, idx) => (
          <button
            key={idx}
            className={`blackmarket-hack-tab${selected === idx ? ' active' : ''}`}
            onClick={() => setSelected(idx)}
          >
            {cat.icon}
            <span>{cat.category}</span>
          </button>
        )),
        <button
          key={ITEMS.length}
          className={`blackmarket-hack-tab${selected === ITEMS.length ? ' active' : ''}`}
          onClick={() => setSelected(ITEMS.length)}
        >
          <FaChartLine />
          <span>Bolsa Negra</span>
        </button>
        ]}
      </div>
      {/* Render Bolsa Negra minigame if selected */}
      {selected === ITEMS.length ? (
        <div style={{
          display:'flex',alignItems:'center',justifyContent:'center',
          minHeight:'240px',
          color:'#FFD700', fontWeight:800, fontSize:'1.8rem', letterSpacing:'1px',
          textShadow:'0 0 12px #FFD70055'
        }}>
          🚧 Próximamente (En Desarollo)
        </div>
      ) : (
        <div className="blackmarket-hack-list">
          {ITEMS[selected].options.map((item, i) => {
            const apiDef = item.itemId ? catalog[item.itemId] : null;
            const displayName = apiDef?.name || item.name;
            const displayPrice = typeof apiDef?.price === 'number' ? apiDef.price : item.price;
            return (
            <div key={item.name} className="blackmarket-hack-item">
              {item.icon && <span className="blackmarket-hack-item-icon">{item.icon}</span>}
              <span className="blackmarket-hack-item-name">{displayName}</span>
              <span className="blackmarket-hack-item-price">{Number(displayPrice).toLocaleString()}€</span>
              <button className="blackmarket-hack-buy" onClick={() => handleBuy({ ...item, name: displayName, price: displayPrice })}>
                Comprar
              </button>
            </div>
            );
          })}
        </div>
      )}
      {showModal && modalItem && (
        <div className={`blackmarket-hack-modal ${modalClosing ? 'modal-leave' : 'modal-enter'}`}>
          <div className={`blackmarket-hack-modal-content ${modalClosing ? 'content-leave' : 'content-enter'}`}>
            <h3>Confirmar compra</h3>
            <p>¿Seguro que quieres comprar <b>{modalItem.name}</b> por <b>{modalItem.price.toLocaleString()}€</b>?</p>
            <button onClick={closeModal} className="blackmarket-hack-cancel">Cancelar</button>
            <button
              onClick={async () => {
                // Close modal with animation
                closeModal();
                setPurchaseState({ visible: true, status: 'loading', message: 'Procesando compra...' });
                try {
                  if (modalItem.itemId) {
                    const resp = await fetch('http://localhost:3001/api/proxy/blackmarket/purchase', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ userId: user?.id, itemId: modalItem.itemId })
                    });
                    const data = await resp.json();
                    if (!resp.ok || data?.error) {
                      console.warn('[BlackMarket] Purchase error response:', data);
                      setPurchaseState({ visible: true, status: 'error', message: data?.error || 'No se pudo completar la compra.' });
                    } else {
                      console.log('[BlackMarket] Purchase OK:', data);
                      setPurchaseState({ visible: true, status: 'success', message: 'Compra exitosa ✅' });
                    }
                  } else {
                    console.log('[BlackMarket] Simulated purchase for item without API id');
                    setPurchaseState({ visible: true, status: 'success', message: 'Compra simulada ✅' });
                  }
                } catch (e) {
                  console.error('[BlackMarket] Network error on purchase:', e);
                  setPurchaseState({ visible: true, status: 'error', message: 'Error de red al realizar la compra.' });
                }
              }}
              className="blackmarket-hack-confirm"
            >
              Confirmar
            </button>
          </div>
        </div>
      )}
      {purchaseState.visible && (
        <div className={`purchase-overlay ${purchaseClosing ? 'modal-leave' : 'modal-enter'}`}>
          <div className={`purchase-card ${purchaseClosing ? 'content-leave' : 'content-enter'}`}>
            {purchaseState.status === 'loading' && (
              <>
                <div className="purchase-spinner" />
                <div>{purchaseState.message}</div>
              </>
            )}
            {purchaseState.status !== 'loading' && (
              <>
                <div style={{fontSize:'1.1rem', marginBottom: '10px'}}>{purchaseState.message}</div>
                <div className="purchase-actions">
                  <button
                    className="btn-primary"
                    onClick={async () => {
                      // Abrir inventario tras compra
                      try {
                        setInventoryLoading(true);
                        setInventoryError('');
                        const resp = await fetch(`http://localhost:3001/api/proxy/blackmarket/inventario/${encodeURIComponent(user.id)}`);
                        const data = await resp.json();
                        if (!resp.ok || data?.error) {
                          setInventoryError(data?.error || 'No se pudo recuperar el inventario');
                          setInventory([]);
                        } else {
                          const arr = Array.isArray(data?.inventario) ? data.inventario : [];
                          const normalized = arr.map((it) => {
                            const itemId = it.itemId || it.item_id || it.id || null;
                            const apiDef = itemId ? catalog[itemId] : null;
                            const name = it.name || it.nombre || apiDef?.name || itemId || '-';
                            const price = (typeof it.price === 'number' ? it.price : (typeof it.precio === 'number' ? it.precio : (typeof apiDef?.price === 'number' ? apiDef.price : null)));
                            const amount = it.amount ?? it.cantidad ?? 1;
                            return { itemId, name, price, amount };
                          });
                          setInventory(normalized);
                        }
                        setShowInventory(true);
                        } catch (e) {
                        setInventoryError('Error de red');
                        setShowInventory(true);
                      } finally {
                        setInventoryLoading(false);
                        // Close purchase overlay with animation
                        closePurchaseOverlay();
                      }
                    }}
                  >Ver inventario</button>
                  <button
                    className="btn-secondary"
                    onClick={() => closePurchaseOverlay()}
                  >Cerrar</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
      {showInventory && (
        <div className={`blackmarket-hack-modal ${inventoryClosing ? 'modal-leave' : 'modal-enter'}`}>
          <div className={`blackmarket-hack-modal-content ${inventoryClosing ? 'content-leave' : 'content-enter'}`} style={{textAlign:'left'}}>
            <div className="inventory-header">
              <div className="inventory-title">Tu mochila</div>
              <button className="inventory-close" onClick={closeInventory}>Cerrar</button>
            </div>
            <div className="inventory-body">
              {inventoryLoading && <div>Cargando...</div>}
              {!inventoryLoading && inventoryError && <div style={{color:'#ef4444'}}>{inventoryError}</div>}
              {!inventoryLoading && !inventoryError && (
                Array.isArray(inventory) && inventory.length > 0 ? (
                  <table className="inventory-table">
                    <thead>
                      <tr>
                        <th style={{textAlign:'left'}}>Objeto</th>
                        <th style={{textAlign:'right'}}>Precio</th>
                        <th style={{textAlign:'right'}}>Cantidad</th>
                      </tr>
                    </thead>
                    <tbody>
                      {inventory.map((it, idx) => {
                        const sellPrice = typeof it.price === 'number' ? Math.floor(it.price * 0.4) : null;
                        return (
                          <tr key={`${it.itemId || it.name || idx}-${idx}`}>
                            <td>{it.name || it.itemId || '-'}</td>
                            <td style={{textAlign:'right'}}>{typeof it.price === 'number' ? `${it.price.toLocaleString()}€` : '-'}</td>
                            <td style={{textAlign:'right'}}>
                              {it.amount ?? 1}
                              {(it.amount ?? 1) > 0 && it.itemId && typeof sellPrice === 'number' && (
                                <div style={{marginTop:6, display:'flex', justifyContent:'flex-end'}}>
                                  <button
                                    className="sellone-btn"
                                    onClick={async () => {
                                      try {
                                        setPurchaseState({ visible: true, status: 'loading', message: 'Vendiendo 1 objeto...' });
                                        const resp = await fetch('http://localhost:3001/api/proxy/blackmarket/sellone', {
                                          method: 'POST', headers: { 'Content-Type': 'application/json' },
                                          body: JSON.stringify({ userId: user.id, itemId: it.itemId, amount: 1 })
                                        });
                                        const data = await resp.json();
                                        if (!resp.ok || data?.error) {
                                          setPurchaseState({ visible: true, status: 'error', message: data?.error || 'No se pudo vender el item.' });
                                        } else {
                                          setPurchaseState({ visible: true, status: 'success', message: 'Venta realizada ✅' });
                                          // refrescar inventario
                                          try {
                                            setInventoryLoading(true);
                                            const r2 = await fetch(`http://localhost:3001/api/proxy/blackmarket/inventario/${encodeURIComponent(user.id)}`);
                                            const d2 = await r2.json();
                                            const arr = Array.isArray(d2?.inventario) ? d2.inventario : [];
                                            const normalized = arr.map((row) => {
                                              const iid = row.itemId || row.item_id || row.id || null;
                                              const apiDef = iid ? catalog[iid] : null;
                                              const name = row.name || row.nombre || apiDef?.name || iid || '-';
                                              const price = (typeof row.price === 'number' ? row.price : (typeof row.precio === 'number' ? row.precio : (typeof apiDef?.price === 'number' ? apiDef.price : null)));
                                              const amount = row.amount ?? row.cantidad ?? 1;
                                              return { itemId: iid, name, price, amount };
                                            });
                                            setInventory(normalized);
                                          } finally {
                                            setInventoryLoading(false);
                                          }
                                        }
                                      } catch (e) {
                                        setPurchaseState({ visible: true, status: 'error', message: 'Error de red vendiendo.' });
                                      }
                                    }}
                                  >Vender 1 (40%)</button>
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                ) : (
                  <div className="inventory-empty">No hay items en el inventario.</div>
                )
              )}
              {Array.isArray(inventory) && inventory.length > 0 && (
                <div className="inventory-actions">
                  <button
                    className="sell-btn"
                    onClick={async () => {
                      try {
                        // Vender todos los items a 40%
                        const sellList = inventory
                          .filter(it => (it.amount ?? 1) > 0 && (it.itemId))
                          .map(it => ({ itemId: it.itemId, amount: it.amount ?? 1 }));
                        if (sellList.length === 0) return;
                        setPurchaseState({ visible: true, status: 'loading', message: 'Procesando venta...' });
                        const resp = await fetch('http://localhost:3001/api/proxy/blackmarket/sell', {
                          method: 'POST', headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ userId: user.id, items: sellList })
                        });
                        const data = await resp.json();
                        if (!resp.ok || data?.error) {
                          setPurchaseState({ visible: true, status: 'error', message: data?.error || 'No se pudo vender el inventario.' });
                        } else {
                          setPurchaseState({ visible: true, status: 'success', message: 'Venta realizada ✅' });
                          // refrescar inventario
                          try {
                            setInventoryLoading(true);
                            const r2 = await fetch(`http://localhost:3001/api/proxy/blackmarket/inventario/${encodeURIComponent(user.id)}`);
                            const d2 = await r2.json();
                            const arr = Array.isArray(d2?.inventario) ? d2.inventario : [];
                            const normalized = arr.map((it) => {
                              const itemId = it.itemId || it.item_id || it.id || null;
                              const apiDef = itemId ? catalog[itemId] : null;
                              const name = it.name || it.nombre || apiDef?.name || itemId || '-';
                              const price = (typeof it.price === 'number' ? it.price : (typeof it.precio === 'number' ? it.precio : (typeof apiDef?.price === 'number' ? apiDef.price : null)));
                              const amount = it.amount ?? it.cantidad ?? 1;
                              return { itemId, name, price, amount };
                            });
                            setInventory(normalized);
                          } finally {
                            setInventoryLoading(false);
                          }
                        }
                      } catch (e) {
                        setPurchaseState({ visible: true, status: 'error', message: 'Error de red vendiendo.' });
                      }
                    }}
                  >Vender todo (40% valor)</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {showToast && (
        <div style={{position:'fixed',top:32,right:32,background:'#23272a',color:'#fff',padding:'14px 28px',borderRadius:10,boxShadow:'0 2px 8px #23272a33',fontWeight:700,zIndex:9999}}>
          Debes iniciar sesión para comprar en el BlackMarket.
        </div>
      )}
      
      {/* Modal de Administración */}
      {showAdminPanel && (
        <div className={`admin-modal-overlay ${adminClosing ? 'modal-leave' : 'modal-enter'}`} onClick={closeAdminPanel}>
          <div className={`admin-modal ${adminClosing ? 'content-leave' : 'content-enter'}`} onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h2>🔧 Panel de Administración</h2>
              <button 
                className="admin-close-btn"
                onClick={closeAdminPanel}
              >
                ✕
              </button>
            </div>
            
            <div className="admin-content">
              {/* Búsqueda de usuarios */}
              <div className="admin-section">
                <h3>👥 Buscar Usuarios</h3>
                <div className="admin-search">
                  <input
                    type="text"
                    placeholder="Buscar por nombre de usuario..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && searchUsers(searchQuery)}
                  />
                  <button 
                    onClick={() => searchUsers(searchQuery)}
                    disabled={adminLoading}
                  >
                    {adminLoading ? '🔍' : 'Buscar'}
                  </button>
                </div>
                
                {searchResults.length > 0 && (
                  <div className="search-results">
                    {searchResults.map((user) => (
                      <div 
                        key={user.id} 
                        className="user-result"
                        onClick={() => selectUser(user)}
                      >
                        <div className="user-info">
                          <strong>{user.username}</strong>
                          {user.displayName && user.displayName !== user.username && (
                            <span className="display-name">({user.displayName})</span>
                          )}
                        </div>
                        <div className="user-id">ID: {user.id}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Usuario seleccionado */}
              {selectedUser && (
                <div className="admin-section">
                  <h3>👤 Usuario Seleccionado: {selectedUser.username}</h3>
                  
                  {/* Saldo del usuario */}
                  {userBalance && (
                    <div className="user-balance">
                      <h4>💰 Saldo</h4>
                      <div className="balance-info">
                        <div>Efectivo: {userBalance.cash || 0}€</div>
                        <div>Banco: {userBalance.bank || 0}€</div>
                      </div>
                      <div className="balance-edit">
                        <input type="number" placeholder="Efectivo" id="edit-cash" />
                        <input type="number" placeholder="Banco" id="edit-bank" />
                        <button onClick={() => {
                          const cash = document.getElementById('edit-cash').value;
                          const bank = document.getElementById('edit-bank').value;
                          if (cash || bank) setUserBalance(cash, bank);
                        }}>
                          Actualizar Saldo
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {/* Inventario del usuario */}
                  <div className="user-inventory">
                    <h4>🎒 Inventario</h4>
                    {adminLoading ? (
                      <div>Cargando inventario...</div>
                    ) : userInventory.length > 0 ? (
                      <div className="inventory-list">
                        {userInventory.map((item, idx) => (
                          <div key={idx} className="inventory-item">
                            <div className="item-info">
                              <strong>{item.nombre || item.name}</strong>
                              <span>Cantidad: {item.cantidad || item.amount}</span>
                              <span>Precio: {item.precio || item.price || 'N/A'}€</span>
                            </div>
                            <div className="item-actions">
                              <input 
                                type="number" 
                                placeholder="Cantidad" 
                                min="1" 
                                id={`remove-${idx}`}
                              />
                              <button disabled style={{opacity:0.6, cursor:'not-allowed'}}>
                                Retirar (Próximamente)
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div>No hay items en el inventario</div>
                    )}
                  </div>
                  
                  {/* Agregar items */}
                  <div className="add-items">
                    <h4>➕ Agregar Items</h4>
                    <div className="add-item-form">
                      <select id="add-item-select">
                        <option value="">Seleccionar item...</option>
                        {Object.entries(catalog).map(([itemId, item]) => (
                          <option key={itemId} value={itemId}>
                            {item.name} - {item.price}€
                          </option>
                        ))}
                      </select>
                      <input type="number" placeholder="Cantidad" min="1" id="add-item-amount" />
                      <button disabled style={{opacity:0.6, cursor:'not-allowed'}}>
                        Agregar Item (Próximamente)
                      </button>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Mensajes de administración */}
              {adminMessage && (
                <div className="admin-message">
                  {adminMessage}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      <div className="blackmarket-hack-footer">
        <FaSkull size={18} style={{marginRight:6}} />
        <span>Acceso solo para Criminales en SpainRP.</span>
      </div>
    </div>
  );
}