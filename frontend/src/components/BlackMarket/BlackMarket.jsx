import React, { useState } from 'react';
import { FaLock, FaSkull, FaPills, FaMoneyBillWave, FaUserSecret, FaLaptopCode, FaSkullCrossbones, FaChartLine } from 'react-icons/fa';
import { GiPistolGun, GiChemicalDrop, GiAbbotMeeple, GiAbdominalArmor, GiKnifeFork, GiKnifeThrust, GiSentryGun } from 'react-icons/gi';
import './BlackMarket.css';
import DiscordUserBar from '../DiscordUserBar';
import { apiUrl, authFetch } from '../../utils/api';

// Definición de temas
const THEMES = {
  hacking: {
    name: 'Hacking',
    icon: '💻',
    description: 'Tema de hacking y ciberseguridad',
    colors: {
      primary: '#00ff99',
      secondary: '#0ea5e9',
      accent: '#f59e0b',
      background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #0f0f0f 100%)',
      surface: 'rgba(0, 255, 153, 0.05)',
      text: '#ffffff',
      border: '#00ff99'
    }
  },
  darkness: {
    name: 'Oscuridad',
    icon: '🌑',
    description: 'Tema oscuro y misterioso',
    colors: {
      primary: '#8b5cf6',
      secondary: '#a855f7',
      accent: '#ec4899',
      background: 'linear-gradient(135deg, #000000 0%, #1a0a1a 50%, #000000 100%)',
      surface: 'rgba(139, 92, 246, 0.1)',
      text: '#e5e7eb',
      border: '#8b5cf6'
    }
  },
  terror: {
    name: 'Terror',
    icon: '👻',
    description: 'Tema de terror y horror',
    colors: {
      primary: '#ef4444',
      secondary: '#dc2626',
      accent: '#f59e0b',
      background: 'linear-gradient(135deg, #1a0000 0%, #2d0000 50%, #0a0000 100%)',
      surface: 'rgba(239, 68, 68, 0.1)',
      text: '#fca5a5',
      border: '#ef4444'
    }
  }
};

// Define ITEMS array above the component
const ITEMS = [
  {
    category: 'Armas ERLC',
    icon: <GiPistolGun />,
    options: [
      { 
        itemId: 'bm_beretta_m9', 
        name: 'Beretta M9', 
        price: 1900, 
        icon: <GiPistolGun />,
        description: 'Pistola semiautomática italiana de 9mm Parabellum. Diseño clásico con excelente ergonomía y fiabilidad probada en combate. Ideal para operaciones tácticas y defensa personal.',
        image: 'https://media.discordapp.net/attachments/1361508961307725887/1426627331685879979/beretta.webp.webp?ex=68ebe9bd&is=68ea983d&hm=c54cfe7b3a4576e8860356e7f8a356f518b763d9134d02f5cf39fe0a5a06b14e&=&format=webp',
        stock: 12,
        maxStock: 15,
        quality: 'standard',
        effects: ['+15% precisión', '+10% daño', 'Fiabilidad extrema']
      },
      { 
        itemId: 'bm_remington_870', 
        name: 'Remington 870', 
        price: 24000, 
        icon: <GiPistolGun />,
        description: 'Escopeta de corredera legendaria. Devastadora a corta distancia con capacidad de munición versátil. La elección de fuerzas especiales y unidades tácticas.',
        image: 'https://media.discordapp.net/attachments/1361508961307725887/1426627334189875210/Remington_870.webp.webp?ex=68ebe9bd&is=68ea983d&hm=1f9ba4e65a7e2b8b3775e280376f85443037c6e7a0e59cfd3a1ac800650741f6&=&format=webp',
        stock: 5,
        maxStock: 8,
        effects: ['+50% daño corta distancia', 'Disparo múltiple', 'Resistencia extrema']
      },
      { 
        itemId: 'bm_ak_47', 
        name: 'AK-47', 
        price: 125000, 
        icon: <GiPistolGun />,
        description: 'Rifle de asalto soviético legendario. Resistente, confiable y devastador. Su diseño simple lo hace prácticamente indestructible en cualquier condición climática.',
        image: 'https://media.discordapp.net/attachments/1361508961307725887/1426627333875564544/AK47.webp.webp?ex=68ebe9bd&is=68ea983d&hm=8f76a586a20ca7168493515aad54ac13dc87199760cfb304a110c81342898dd1&=&format=webp',
        stock: 2,
        maxStock: 3,
        effects: ['+40% daño', '+25% cadencia', 'Resistente a daños', 'Indestructible']
      },
      { 
        itemId: 'bm_desert_eagle', 
        name: 'Desert Eagle', 
        price: 25000, 
        icon: <GiPistolGun />,
        description: 'Pistola de gran calibre .50 AE. Potencia devastadora con retroceso controlable. Diseño icónico que combina elegancia y letalidad extrema.',
        image: 'https://media.discordapp.net/attachments/1361508961307725887/1426627333380378794/Desert_Eagle.webp.webp?ex=68ebe9bd&is=68ea983d&hm=903abc2aca51ded107e3b0ba19afd78986dcafdcd70bfd66fc0af8d3d415103a&=&format=webp',
        stock: 3,
        maxStock: 5,
        effects: ['+80% daño', '+30% penetración', 'Retroceso controlado', 'Letalidad extrema']
      },
      { 
        itemId: 'bm_lmt_l129a1', 
        name: 'LMT L129A1', 
        price: 50000, 
        icon: <GiPistolGun />,
        description: 'Rifle de precisión británico de 7.62mm. Diseñado para francotiradores de élite. Letalidad extrema a larga distancia con precisión milimétrica.',
        image: 'https://media.discordapp.net/attachments/1361508961307725887/1426627331979477084/LMT_L129A1.webp.webp?ex=68ebe9bd&is=68ea983d&hm=fe8d8069c602706ccf871b273f448839f18abeb090662badae9389c52f5093da&=&format=webp',
        stock: 1,
        maxStock: 2,
        effects: ['+100% precisión', '+200% alcance', 'Daño crítico', 'Precisión milimétrica']
      },
      { 
        itemId: 'bm_cuchillo_erlc', 
        name: 'Cuchillo Táctico', 
        price: 800, 
        icon: <GiKnifeThrust />,
        description: 'Cuchillo de combate silencioso. Letal en combate cuerpo a cuerpo.',
        stock: 20,
        maxStock: 25,
        quality: 'basic',
        effects: ['Silencioso', '+25% daño cuerpo a cuerpo', 'Velocidad de ataque']
      },
      { 
        itemId: 'bm_m249', 
        name: 'M249 SAW', 
        price: 140000, 
        icon: <GiSentryGun />,
        description: 'Ametralladora ligera de 5.56mm. Supresión de fuego masiva con cadencia de 750 disparos por minuto. Dominio total del campo de batalla.',
        image: 'https://media.discordapp.net/attachments/1361508961307725887/1426627332969463950/M249.webp.webp?ex=68ebe9bd&is=68ea983d&hm=62df5f4a48bc1c6b3dd27b7f56947f1150d37ca622bec39ccdc66b6c0fc9d767&=&format=webp',
        stock: 1,
        maxStock: 1,
        effects: ['+200% cadencia', '+150% daño', 'Supresión de fuego', 'Dominio total']
      },
    ]
  },
  {
    category: 'Sustancias ',
    icon: <FaPills />,
    options: [
      { 
        itemId: 'bm_cafe_magico', 
        name: 'Café Mágico', 
        price: 4000,
        description: 'Café especial con propiedades energizantes únicas.',
        stock: 15,
        maxStock: 20,
        quality: 'standard',
        effects: ['+30% energía', '+20% concentración', 'Sin adicción']
      },
      { 
        itemId: 'bm_marihuana', 
        name: 'Marihuana Medicinal', 
        price: 1200,
        description: 'Cannabis de alta calidad. Efecto relajante y analgésico.',
        stock: 25,
        maxStock: 30,
        quality: 'basic',
        effects: ['+25% relajación', '-20% dolor', 'Efecto calmante']
      },
      { 
        itemId: 'bm_lsd', 
        name: 'LSD', 
        price: 2500,
        description: 'Ácido lisérgico de alta pureza. Experiencia psicodélica intensa.',
        stock: 8,
        maxStock: 12,
        quality: 'advanced',
        effects: ['+100% percepción', 'Experiencia psicodélica', 'Riesgo de mal viaje']
      },
      { 
        itemId: 'bm_extasis', 
        name: 'Éxtasis', 
        price: 1800,
        description: 'MDMA de alta pureza. Efecto estimulante y empatógeno.',
        stock: 12,
        maxStock: 18,
        quality: 'standard',
        effects: ['+40% energía', '+50% sociabilidad', 'Efecto temporal']
      },
      { 
        itemId: 'bm_metanfetamina', 
        name: 'Metanfetamina', 
        price: 3500,
        description: 'Estimulante extremadamente potente. Altamente adictivo.',
        stock: 6,
        maxStock: 10,
        quality: 'elite',
        effects: ['+80% energía', '+60% resistencia', 'Adicción alta']
      },
      { 
        itemId: 'bm_heroina', 
        name: 'Heroína', 
        price: 5000,
        description: 'Sustancia altamente adictiva. Efecto eufórico intenso.',
        stock: 3,
        maxStock: 5,
        quality: 'elite',
        effects: ['+100% euforia', 'Adicción extrema', 'Riesgo de sobredosis']
      },
    ]
  },
  {
    category: 'Servicios',
    icon: <FaUserSecret />,
    options: [
      { 
        itemId: 'bm_dni_falso_7d', 
        name: 'DNI Falso (7 días)', 
        price: 3000,
        description: 'Documento de identidad falsificado válido por 7 días. Incluye verificación en bases de datos.',
        stock: 5,
        maxStock: 8,
        quality: 'advanced',
        effects: ['Nueva identidad temporal', 'Acceso a servicios', 'Riesgo de detección']
      },
      { 
        itemId: 'bm_eliminar_multa', 
        name: 'Eliminación de Multa', 
        price: 28000,
        description: 'Servicio para eliminar una multa de tráfico del sistema. Conexiones internas en la policía.',
        stock: 3,
        maxStock: 5,
        quality: 'elite',
        effects: ['Elimina 1 multa', 'Conexiones internas', 'Riesgo alto']
      },
      { 
        itemId: 'bm_borrar_antecedente', 
        name: 'Borrar Antecedente', 
        price: 95000,
        description: 'Elimina un antecedente penal del registro. Requiere acceso a sistemas judiciales.',
        stock: 1,
        maxStock: 2,
        quality: 'legendary',
        effects: ['Elimina antecedente penal', 'Acceso judicial', 'Riesgo extremo']
      },
      { 
        itemId: 'bm_acceso_panel_policia', 
        name: 'Acceso Panel Policía', 
        price: 9000000,
        description: 'Acceso completo al panel interno de la policía. Información clasificada y controles del sistema.',
        stock: 1,
        maxStock: 1,
        quality: 'legendary',
        effects: ['Acceso total policía', 'Información clasificada', 'Control del sistema']
      },
    ]
  },
  {
    category: 'Dinero',
    icon: <FaMoneyBillWave />,
    options: [
      { 
        itemId: 'bm_dinero_falso', 
        name: 'Dinero Falso', 
        price: 2000,
        description: 'Billetes falsos de alta calidad. Difícil de detectar. Incluye diferentes denominaciones.',
        stock: 8,
        maxStock: 12,
        quality: 'advanced',
        effects: ['+100% dinero temporal', 'Riesgo de detección', 'Valor variable']
      },
      { 
        itemId: 'bm_transferencia_oculta', 
        name: 'Transferencia Oculta', 
        price: 5000,
        description: 'Transferencia bancaria sin rastro. Dinero limpio que no puede ser rastreado.',
        stock: 5,
        maxStock: 8,
        quality: 'elite',
        effects: ['Dinero limpio', 'Sin rastro', 'Transferencia segura']
      },
      { 
        itemId: 'bm_lavado_dinero', 
        name: 'Lavado de Dinero', 
        price: 9000,
        description: 'Servicio profesional para lavar dinero sucio. Convierte dinero ilegal en legal.',
        stock: 3,
        maxStock: 5,
        quality: 'elite',
        effects: ['Dinero legalizado', 'Sin rastro', 'Comisión 20%']
      },
    ]
  },
  {
    category: 'Hacking',
    icon: <FaLaptopCode />,
    options: [
      { 
        itemId: 'bm_vpn_premium', 
        name: 'VPN Premium', 
        price: 2500,
        description: 'VPN de alta seguridad con servidores en múltiples países. Anonimato total y velocidad alta.',
        stock: 15,
        maxStock: 20,
        quality: 'standard',
        effects: ['Anonimato total', 'Servidores globales', 'Velocidad alta']
      },
      { 
        itemId: 'bm_movil_seguro', 
        name: 'Móvil Seguro', 
        price: 12000,
        description: 'Dispositivo móvil completamente irrastreable. Modificado para evitar cualquier tipo de seguimiento.',
        stock: 4,
        maxStock: 6,
        quality: 'elite',
        effects: ['Irrastreable', 'Comunicación segura', 'Anti-espionaje']
      },
      { 
        itemId: 'bm_keylogger', 
        name: 'Keylogger', 
        price: 4000,
        description: 'Software espía para capturar contraseñas y datos. Instalación remota y oculta.',
        stock: 8,
        maxStock: 12,
        quality: 'advanced',
        effects: ['Captura de contraseñas', 'Instalación remota', 'Oculto']
      },
      { 
        itemId: 'bm_md_anonimos', 
        name: 'Mensajes Anónimos', 
        price: 7000,
        description: 'Acceso a sistema de mensajes anónimos mediante bot. Comunicación completamente privada.',
        stock: 6,
        maxStock: 10,
        quality: 'advanced',
        effects: ['Mensajes anónimos', 'Comunicación privada', 'Bot automatizado']
      },
      { 
        itemId: 'bm_root_servidor', 
        name: 'Acceso Root Servidor', 
        price: 25000,
        description: 'Acceso completo de administrador a servidores. Control total del sistema.',
        stock: 1,
        maxStock: 2,
        quality: 'legendary',
        effects: ['Control total servidor', 'Acceso administrativo', 'Poder ilimitado']
      },
    ]
  },
  {
    category: 'Sustancias',
    icon: <GiChemicalDrop />,
    options: [
      { 
        itemId: 'bm_cocaina', 
        name: 'Cocaína Premium', 
        price: 8000, 
        icon: <GiChemicalDrop />,
        description: 'Cocaína de alta pureza (95%). Efecto energizante extremo. Peligroso pero muy rentable.',
        stock: 5,
        maxStock: 8,
        quality: 'elite',
        effects: ['+50% velocidad', '+30% resistencia', 'Adicción alta']
      },
      { 
        itemId: 'bm_extasis_2', 
        name: 'Éxtasis Premium', 
        price: 4000, 
        icon: <FaPills />,
        description: 'MDMA de pureza extrema. Efecto estimulante y empatógeno de larga duración.',
        stock: 10,
        maxStock: 15,
        quality: 'advanced',
        effects: ['+60% energía', '+70% sociabilidad', 'Duración extendida']
      },
      { 
        itemId: 'bm_veneno', 
        name: 'Veneno Letal', 
        price: 6000, 
        icon: <FaSkullCrossbones />,
        description: 'Sustancia tóxica mortal. Efecto letal en dosis pequeñas. Solo para uso profesional.',
        stock: 2,
        maxStock: 3,
        quality: 'legendary',
        effects: ['Efecto letal', 'Dosis pequeña', 'Riesgo extremo']
      },
    ]
  },
  {
    category: 'Servicios',
    icon: <FaLaptopCode />,
    options: [
      { 
        itemId: 'bm_hackeo', 
        name: 'Servicio de Hackeo', 
        price: 15000, 
        icon: <FaLaptopCode />,
        description: 'Servicio profesional de hacking. Acceso a sistemas informáticos vulnerables.',
        stock: 3,
        maxStock: 5,
        quality: 'elite',
        effects: ['Hackeo profesional', 'Acceso a sistemas', 'Riesgo alto']
      },
      { 
        itemId: 'bm_falsificacion', 
        name: 'Servicio de Falsificación', 
        price: 10000, 
        icon: <FaUserSecret />,
        description: 'Servicio completo de falsificación de documentos. Calidad profesional garantizada.',
        stock: 4,
        maxStock: 6,
        quality: 'advanced',
        effects: ['Documentos falsos', 'Calidad profesional', 'Riesgo medio']
      },
      { 
        itemId: 'bm_lavado_dinero_2', 
        name: 'Lavado de Dinero Premium', 
        price: 20000, 
        icon: <FaMoneyBillWave />,
        description: 'Servicio premium de lavado de dinero. Convierte grandes cantidades de dinero ilegal en legal.',
        stock: 2,
        maxStock: 3,
        quality: 'legendary',
        effects: ['Lavado masivo', 'Dinero legalizado', 'Comisión 15%']
      },
    ]
  },
  
];

// ...existing code...
  // ...existing code...
// Bolsa Negra Stocks
const STOCKS = [
  { name: 'CryptoCoin', price: 320, color: '#22d3ee' },
  { name: 'Armas', price: 180, color: '#ef4444' },
  { name: 'Sustancias', price: 90, color: '#a3e635' },
  { name: 'Servicios', price: 210, color: '#f59e42' },
];
export default function BlackMarket() {
  console.log('[BlackMarket] 🚀 Componente iniciando...');
  
  const [userBalance, setUserBalanceState] = useState(null);
  const [user, setUser] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  
  // Debug logging for BlackMarket component
  React.useEffect(() => {
    console.log('[BlackMarket] 🏪 Component mounted');
    console.log('[BlackMarket] 📍 Current URL:', window.location.href);
    console.log('[BlackMarket] 📍 Pathname:', window.location.pathname);
    console.log('[BlackMarket] 📍 Search:', window.location.search);
    console.log('[BlackMarket] 📍 Hash:', window.location.hash);
    console.log('[BlackMarket] 📍 Referrer:', document.referrer);
    console.log('[BlackMarket] 📍 Timestamp:', new Date().toISOString());
  }, []);

  // Detección de móvil y responsive mejorada
  React.useEffect(() => {
    const checkMobile = () => {
      const width = window.innerWidth;
      const mobile = width <= 768;
      const smallMobile = width <= 480;
      const tablet = width > 768 && width <= 1024;
      
      setIsMobile(mobile);
      
      // Log para debugging
      console.log('[BlackMarket] 📱 Device detection:', {
        width,
        mobile,
        smallMobile,
        tablet,
        userAgent: navigator.userAgent.includes('Mobile')
      });
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  const [showModal, setShowModal] = React.useState(false);
  const [modalItem, setModalItem] = React.useState(null);
  const [showToast, setShowToast] = React.useState(false);
  const [showInventory, setShowInventory] = React.useState(false);
  const [inventory, setInventory] = React.useState([]);
  const [inventoryLoading, setInventoryLoading] = React.useState(false);
  const [inventoryError, setInventoryError] = React.useState('');
  const [catalog, setCatalog] = React.useState({}); // mapa itemId -> { name, price }
  const [catalogLoaded, setCatalogLoaded] = React.useState(false);
  const [stockData, setStockData] = React.useState({}); // mapa itemId -> { stock, price, name }
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

  const closeQuickBalanceWarning = () => {
    setShowQuickBalanceWarning(false);
  };

  const confirmQuickBalanceAccess = () => {
    setShowQuickBalanceWarning(false);
    setShowQuickBalance(true);
  };

  // Funciones para manejar descripciones desplegables
  const toggleItemDescription = (itemId) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  };

  // Funciones para menús móviles
  const toggleMobileMenu = () => {
    setShowMobileMenu(!showMobileMenu);
  };

  const closeMobileMenu = () => {
    setShowMobileMenu(false);
  };

  const toggleMobileInventory = () => {
    setShowMobileInventory(!showMobileInventory);
    if (isMobile) {
      setShowMobileMenu(false);
    }
  };

  const toggleMobileAdmin = () => {
    setShowMobileAdmin(!showMobileAdmin);
    if (isMobile) {
      setShowMobileMenu(false);
    }
  };
  const [authorized, setAuthorized] = React.useState(false);
  const [roleChecking, setRoleChecking] = React.useState(true);
  const [roleToast, setRoleToast] = React.useState('');
  
  // Estados para administración
  const [isAdmin, setIsAdmin] = React.useState(false);
  const [adminChecking, setAdminChecking] = React.useState(false);
  const [showAdminPanel, setShowAdminPanel] = React.useState(false);
  const [adminSearchQuery, setAdminSearchQuery] = React.useState('');
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

  // Quick balance admin panel states
  const [showQuickBalance, setShowQuickBalance] = useState(false);
  const [showQuickBalanceWarning, setShowQuickBalanceWarning] = useState(false);
  const [quickId, setQuickId] = useState('');
  const [quickCash, setQuickCash] = useState('');
  const [quickBank, setQuickBank] = useState('');
  const [quickLoading, setQuickLoading] = useState(false);
  const [quickResult, setQuickResult] = useState('');
  
  // Estados para descripciones desplegables
  const [expandedItems, setExpandedItems] = useState(new Set());
  
  // Estados para responsive y móvil
  const [isMobile, setIsMobile] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showMobileInventory, setShowMobileInventory] = useState(false);
  const [showMobileAdmin, setShowMobileAdmin] = useState(false);
  
  // Estados para descripciones desplegables del modal de advertencia
  const [showConsequences, setShowConsequences] = useState(false);
  const [showSanctions, setShowSanctions] = useState(false);
  
  // Estados para sistema de temas
  const [currentTheme, setCurrentTheme] = useState(() => {
    const saved = localStorage.getItem('blackmarket-theme');
    return saved || 'hacking';
  });
  
  // Estados para búsqueda y filtros
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedQuality, setSelectedQuality] = useState('all');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 1000000 });
  const [stockFilter, setStockFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [showFilters, setShowFilters] = useState(false);
  
  // Estados para ventas entre usuarios
  const [userSales, setUserSales] = useState([]);
  const [showUserMarket, setShowUserMarket] = useState(false);
  const [showSellModal, setShowSellModal] = useState(false);
  const [sellItem, setSellItem] = useState(null);
  const [sellAmount, setSellAmount] = useState(1);
  const [sellPrice, setSellPrice] = useState(0);
  
  // Estados para gestión de stock (solo para ID específico)
  const [showStockManager, setShowStockManager] = useState(false);
  const [stockManagerItem, setStockManagerItem] = useState('');
  const [stockManagerAmount, setStockManagerAmount] = useState(0);
  const [stockManagerAction, setStockManagerAction] = useState('add'); // 'add' o 'set'

  // Función para cambiar tema
  const changeTheme = (themeKey) => {
    setCurrentTheme(themeKey);
    localStorage.setItem('blackmarket-theme', themeKey);
  };

  // Función para obtener items filtrados con stock real
  const getFilteredItems = () => {
    // Si hay búsqueda, buscar en todas las secciones
    if (searchQuery) {
      let allItems = [];
      
      // Recopilar todos los items de todas las secciones
      ITEMS.forEach((section, sectionIndex) => {
        section.options.forEach(item => {
          // Obtener datos reales del stock y precio
          const realStockData = stockData[item.itemId];
          const realStock = realStockData ? realStockData.stock : (item.stock || 0);
          const realPrice = realStockData ? realStockData.price : item.price;
          const realName = realStockData ? realStockData.name : item.name;
          
          allItems.push({
            ...item,
            stock: realStock,
            price: realPrice,
            name: realName,
            sectionIndex: sectionIndex,
            sectionName: section.category
          });
        });
      });
      
      // Aplicar filtros a todos los items
      let filtered = allItems.filter(item => {
      // Filtro por búsqueda
        const query = searchQuery.toLowerCase();
        const matchesName = item.name.toLowerCase().includes(query);
        const matchesDescription = item.description?.toLowerCase().includes(query);
        const matchesEffects = item.effects?.some(effect => 
          effect.toLowerCase().includes(query)
        );
        const matchesSection = item.sectionName?.toLowerCase().includes(query);
        if (!matchesName && !matchesDescription && !matchesEffects && !matchesSection) return false;
        
        // Filtro por calidad
        if (selectedQuality !== 'all' && item.quality !== selectedQuality) return false;
        
        // Filtro por precio
        if (item.price < priceRange.min || item.price > priceRange.max) return false;
        
        // Filtro por stock
        if (stockFilter === 'in_stock' && item.stock <= 0) return false;
        if (stockFilter === 'low_stock' && item.stock > 2) return false;
        if (stockFilter === 'out_of_stock' && item.stock > 0) return false;
        
        return true;
      });
      
      // Ordenamiento
      filtered.sort((a, b) => {
        switch (sortBy) {
          case 'price_low':
            return a.price - b.price;
          case 'price_high':
            return b.price - a.price;
          case 'name':
            return a.name.localeCompare(b.name);
          case 'quality':
            const qualityOrder = { basic: 1, standard: 2, advanced: 3, elite: 4, legendary: 5 };
            return (qualityOrder[a.quality] || 0) - (qualityOrder[b.quality] || 0);
          case 'stock':
            return b.stock - a.stock;
          default:
            return 0;
        }
      });
      
      return filtered;
    }
    
    // Si no hay búsqueda, usar la sección actual
    if (!ITEMS[selected] || selected >= ITEMS.length) return [];
    
    let filtered = ITEMS[selected].options.map(item => {
      // Obtener datos reales del stock y precio
      const realStockData = stockData[item.itemId];
      const realStock = realStockData ? realStockData.stock : (item.stock || 0);
      const realPrice = realStockData ? realStockData.price : item.price;
      const realName = realStockData ? realStockData.name : item.name;
      
      return {
        ...item,
        stock: realStock,
        price: realPrice,
        name: realName
      };
    }).filter(item => {
      // Filtro por calidad
      if (selectedQuality !== 'all' && item.quality !== selectedQuality) return false;
      
      // Filtro por precio
      if (item.price < priceRange.min || item.price > priceRange.max) return false;
      
      // Filtro por stock
      if (stockFilter === 'in_stock' && item.stock <= 0) return false;
      if (stockFilter === 'low_stock' && item.stock > 2) return false;
      if (stockFilter === 'out_of_stock' && item.stock > 0) return false;
      
      return true;
    });
    
    // Ordenamiento
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price_low':
          return a.price - b.price;
        case 'price_high':
          return b.price - a.price;
        case 'name':
          return a.name.localeCompare(b.name);
        case 'quality':
          const qualityOrder = { basic: 1, standard: 2, advanced: 3, elite: 4, legendary: 5 };
          return (qualityOrder[a.quality] || 0) - (qualityOrder[b.quality] || 0);
        case 'stock':
          return b.stock - a.stock;
        default:
          return 0;
      }
    });
    
    return filtered;
  };

  // Función para limpiar filtros
  const clearFilters = () => {
    setSearchQuery('');
    setSelectedQuality('all');
    setPriceRange({ min: 0, max: 1000000 });
    setStockFilter('all');
    setSortBy('name');
  };

  // Función para refrescar stock
  const refreshStock = async () => {
    try {
      console.log('[BlackMarket] 🔄 Refrescando stock...');
      const resp = await fetch('https://spainrp-web.onrender.com/api/blackmarket/stock');
      const data = await resp.json();
      
      if (resp.ok && data && data.stock && Array.isArray(data.stock)) {
        const stockMap = {};
        data.stock.forEach(item => {
          stockMap[item.itemId] = {
            stock: item.stock,
            price: item.price,
            name: item.name
          };
        });
        setStockData(stockMap);
        console.log('[BlackMarket] ✅ Stock refrescado:', data.stock.length, 'items');
        setRoleToast('✅ Stock actualizado');
        setTimeout(() => setRoleToast(''), 2000);
      } else {
        console.warn('[BlackMarket] ❌ Error refrescando stock:', data);
        setRoleToast('⚠️ Error actualizando stock');
        setTimeout(() => setRoleToast(''), 3000);
      }
    } catch (e) {
      console.error('[BlackMarket] ❌ Error refrescando stock:', e);
      setRoleToast('⚠️ Error de conexión actualizando stock');
      setTimeout(() => setRoleToast(''), 3000);
    }
  };

  // Función para cargar ventas de usuarios
  const loadUserSales = async () => {
    try {
      console.log('[BlackMarket] 📋 Cargando ventas de usuarios...');
      const resp = await fetch('https://spainrp-web.onrender.com/api/blackmarket/sales');
      const data = await resp.json();
      
      if (resp.ok && data && data.sales && Array.isArray(data.sales)) {
        setUserSales(data.sales);
        console.log('[BlackMarket] ✅ Ventas cargadas:', data.sales.length, 'ventas');
      } else {
        console.warn('[BlackMarket] ❌ Error cargando ventas:', data);
        setUserSales([]);
      }
    } catch (e) {
      console.error('[BlackMarket] ❌ Error cargando ventas:', e);
      setUserSales([]);
    }
  };

  // Función para poner item en venta
  const handleSellToUser = async () => {
    if (!sellItem || !sellAmount || !sellPrice) return;
    
    try {
      console.log('[BlackMarket] 💰 Poniendo item en venta...');
      const resp = await fetch('https://spainrp-web.onrender.com/api/blackmarket/sell-to-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sellerId: user.id,
          itemId: sellItem.itemId,
          amount: sellAmount,
          price: sellPrice
        })
      });
      
      const data = await resp.json();
      
      if (resp.ok && !data.error) {
        setRoleToast('✅ Item puesto en venta exitosamente');
        setTimeout(() => setRoleToast(''), 3000);
        setShowSellModal(false);
        setSellItem(null);
        setSellAmount(1);
        setSellPrice(0);
        // Recargar ventas
        loadUserSales();
      } else {
        setRoleToast('❌ Error: ' + (data.error || 'No se pudo poner en venta'));
        setTimeout(() => setRoleToast(''), 3000);
      }
    } catch (e) {
      console.error('[BlackMarket] ❌ Error vendiendo:', e);
      setRoleToast('❌ Error de conexión');
      setTimeout(() => setRoleToast(''), 3000);
    }
  };

  // Función para comprar de otro usuario
  const handleBuyFromUser = async (saleId, amount) => {
    try {
      console.log('[BlackMarket] 🛒 Comprando de usuario...');
      const resp = await fetch('https://spainrp-web.onrender.com/api/blackmarket/buy-from-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          buyerId: user.id,
          saleId: saleId,
          amount: amount
        })
      });
      
      const data = await resp.json();
      
      if (resp.ok && !data.error) {
        setRoleToast('✅ Compra realizada exitosamente');
        setTimeout(() => setRoleToast(''), 3000);
        // Recargar ventas y inventario
        loadUserSales();
      } else {
        setRoleToast('❌ Error: ' + (data.error || 'No se pudo completar la compra'));
        setTimeout(() => setRoleToast(''), 3000);
      }
    } catch (e) {
      console.error('[BlackMarket] ❌ Error comprando:', e);
      setRoleToast('❌ Error de conexión');
      setTimeout(() => setRoleToast(''), 3000);
    }
  };

  // Función para gestionar stock (solo para ID específico)
  const handleStockManagement = async () => {
    if (!stockManagerItem || stockManagerAmount < 0) return;
    
    try {
      console.log('[BlackMarket] 📦 Gestionando stock...');
      const endpoint = stockManagerAction === 'add' 
        ? 'https://spainrp-web.onrender.com/api/blackmarket/admin/add-stock'
        : 'https://spainrp-web.onrender.com/api/blackmarket/admin/stock';
      
      const body = stockManagerAction === 'add' 
        ? { itemId: stockManagerItem, amount: stockManagerAmount }
        : { itemId: stockManagerItem, newStock: stockManagerAmount };
      
      const resp = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      
      const data = await resp.json();
      
      if (resp.ok && !data.error) {
        setRoleToast(`✅ Stock ${stockManagerAction === 'add' ? 'añadido' : 'modificado'} exitosamente`);
        setTimeout(() => setRoleToast(''), 3000);
        setShowStockManager(false);
        setStockManagerItem('');
        setStockManagerAmount(0);
        // Refrescar stock
        refreshStock();
      } else {
        setRoleToast('❌ Error: ' + (data.error || 'No se pudo gestionar el stock'));
        setTimeout(() => setRoleToast(''), 3000);
      }
    } catch (e) {
      console.error('[BlackMarket] ❌ Error gestionando stock:', e);
      setRoleToast('❌ Error de conexión');
      setTimeout(() => setRoleToast(''), 3000);
    }
  };

  // Quick balance handler con logging y notificaciones
  const handleQuickBalance = async (e) => {
    e.preventDefault();
    setQuickLoading(true);
    setQuickResult('');
    
    // Datos para logging
    const logData = {
      adminId: user?.id,
      adminUsername: user?.username,
      targetUserId: quickId,
      newCash: parseInt(quickCash) || 0,
      newBank: parseInt(quickBank) || 0,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      ip: 'N/A', // Se obtendrá del backend
      action: 'QUICK_BALANCE_MODIFICATION',
      severity: 'CRITICAL'
    };

    try {
      // Obtener saldo actual del usuario antes de modificarlo
      let currentBalance = null;
      try {
        const balanceResp = await fetch(`https://spainrp-web.onrender.com/api/proxy/admin/balance/${quickId}?adminUserId=${user?.id}`);
        if (balanceResp.ok) {
          currentBalance = await balanceResp.json();
        }
      } catch (e) {
        console.warn('[QuickBalance] No se pudo obtener saldo actual:', e);
      }

      // Agregar datos del saldo anterior al log
      const enhancedLogData = {
        ...logData,
        previousCash: currentBalance?.cash || 0,
        previousBank: currentBalance?.bank || 0,
        cashChange: (parseInt(quickCash) || 0) - (currentBalance?.cash || 0),
        bankChange: (parseInt(quickBank) || 0) - (currentBalance?.bank || 0)
      };

      // Email temporalmente desactivado para evitar errores
      console.log('[QuickBalance] 📧 Email desactivado temporalmente');

      // Realizar la modificación del saldo
      const requestData = {
        targetUserId: quickId,  // Cambiar de userId a targetUserId
        cash: parseInt(quickCash) || 0,
        bank: parseInt(quickBank) || 0,
        adminUserId: user?.id
      };
      
      console.log('[QuickBalance] Datos de la petición:', requestData);
      console.log('[QuickBalance] URL:', 'https://spainrp-web.onrender.com/api/proxy/admin/setbalance');
      
      const resp = await fetch('https://spainrp-web.onrender.com/api/proxy/admin/setbalance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData)
      });
      
      console.log('[QuickBalance] Respuesta del servidor:', resp.status, resp.statusText);
      console.log('[QuickBalance] Headers de respuesta:', Object.fromEntries(resp.headers.entries()));
      
      let data;
      try {
        data = await resp.json();
        console.log('[QuickBalance] Datos de respuesta:', data);
      } catch (jsonError) {
        console.error('[QuickBalance] Error parseando JSON:', jsonError);
        const textResponse = await resp.text();
        console.error('[QuickBalance] Respuesta como texto:', textResponse);
        throw new Error(`Error del servidor: ${resp.status} - ${textResponse}`);
      }
      
      if (resp.ok && !data.error) {
        setQuickResult('✅ Saldo actualizado correctamente');
        
        // Log adicional de éxito
        console.log('[QuickBalance] ✅ Operación completada:', {
          admin: user?.username,
          target: quickId,
          changes: {
            cash: `${currentBalance?.cash || 0} → ${parseInt(quickCash) || 0}`,
            bank: `${currentBalance?.bank || 0} → ${parseInt(quickBank) || 0}`
          },
          timestamp: new Date().toISOString()
        });
      } else {
        setQuickResult('❌ Error: ' + (data.error || 'No se pudo actualizar el saldo'));
        
        // Log de error
        console.error('[QuickBalance] ❌ Error en operación:', {
          admin: user?.username,
          target: quickId,
          error: data.error,
          timestamp: new Date().toISOString()
        });
      }
    } catch (err) {
      setQuickResult('❌ Error de red');
      console.error('[QuickBalance] ❌ Error de red:', err);
    } finally {
      setQuickLoading(false);
    }
  };
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
    
    // Timeout para evitar carga infinita
    const timeoutId = setTimeout(() => {
      console.warn('[BlackMarket] ⚠️ Timeout en verificación de roles');
      setLoading(false);
      setRoleChecking(false);
      setAuthorized(false);
    }, 10000); // 10 segundos timeout

    authFetch('/auth/me')
      .then(res => res.ok ? res.json() : null)
      .then(async data => {
        console.log('[BlackMarket] /auth/me data:', data);
        try {
          if (data && data.user) {
            setUser(data.user);
            setRoleChecking(true);
            
            try {
              // Verificar membresía con timeout individual
              const REQUIRED_ROLE_ID = '1384340799013257307';
              console.log('[BlackMarket] 🔍 Verificando membresía...');
              
              const memberRes = await Promise.race([
                fetch(`https://spainrp-web.onrender.com/api/proxy/discord/ismember/${encodeURIComponent(data.user.id)}`),
                new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 5000))
              ]);
              
              const member = await memberRes.json();
              let ok = Boolean(member?.isMember);
              
              console.log('[BlackMarket] 📊 Resultado membresía:', { 
                isMember: member?.isMember, 
                userId: data.user.id,
                username: data.user.username 
              });
              
              if (ok) {
                console.log('[BlackMarket] 🔍 Verificando rol criminal...');
                const roleRes = await Promise.race([
                  fetch(`https://spainrp-web.onrender.com/api/proxy/discord/hasrole/${encodeURIComponent(data.user.id)}/${REQUIRED_ROLE_ID}`),
                  new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 5000))
                ]);
                
                const role = await roleRes.json();
                ok = Boolean(role?.hasRole);
                
                console.log('[BlackMarket] 📊 Resultado rol:', { 
                  hasRole: role?.hasRole, 
                  roleId: REQUIRED_ROLE_ID 
                });
                
                if (ok) {
                  setRoleToast('Rol criminal detectado ✅ Acceso concedido.');
                  setTimeout(() => setRoleToast(''), 2500);
                } else {
                  setRoleToast('❌ No tienes el rol Criminal requerido');
                  setTimeout(() => setRoleToast(''), 3000);
                }
              } else {
                setRoleToast('❌ No eres miembro del servidor Discord');
                setTimeout(() => setRoleToast(''), 3000);
              }
              
              setAuthorized(ok);
              console.log('[BlackMarket] membership/role check:', { isMember: member?.isMember, hasRole: ok });
              
              // Cargar saldo del usuario solo si está autorizado
              if (ok) {
                try {
                  console.log('[BlackMarket] 💰 Cargando saldo...');
                  const saldoRes = await Promise.race([
                    fetch(`https://spainrp-web.onrender.com/api/proxy/blackmarket/saldo/${encodeURIComponent(data.user.id)}`),
                    new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 5000))
                  ]);
                  
                  const saldoData = await saldoRes.json();
                  if (saldoRes.ok && saldoData) {
                    setUserBalanceState(saldoData.saldo || 0);
                    console.log('[BlackMarket] saldo cargado:', saldoData);
                  }
                } catch (e) {
                  console.warn('[BlackMarket] error cargando saldo:', e);
                }

                // Verificar si es administrador total
                try {
                  setAdminChecking(true);
                  console.log('[BlackMarket] 🔍 Verificando permisos de admin...');
                  const adminRes = await Promise.race([
                    fetch(`https://spainrp-web.onrender.com/api/proxy/admin/isadmin/${encodeURIComponent(data.user.id)}`),
                    new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 5000))
                  ]);
                  
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
            } catch (e) {
              console.warn('[BlackMarket] user-info error', e);
              setAuthorized(false);
              setRoleToast('❌ Error verificando permisos. Intenta recargar la página.');
              setTimeout(() => setRoleToast(''), 4000);
            } finally {
              setRoleChecking(false);
            }
          } else {
            console.log('[BlackMarket] No user data available');
            setAuthorized(false);
            setRoleChecking(false);
            setRoleToast('❌ No se pudo obtener información del usuario');
            setTimeout(() => setRoleToast(''), 3000);
          }
        } catch (e) {
          console.error('[BlackMarket] Error processing auth data:', e);
          setAuthorized(false);
          setRoleChecking(false);
          setRoleToast('❌ Error procesando datos de autenticación');
          setTimeout(() => setRoleToast(''), 3000);
        } finally {
          clearTimeout(timeoutId);
          setLoading(false);
        }
      })
      .catch((e) => { 
        console.error('[BlackMarket] /auth/me error:', e); 
        clearTimeout(timeoutId);
        setLoading(false);
        setRoleChecking(false);
        setAuthorized(false);
        setRoleToast('❌ Error de conexión. Verifica tu conexión a internet.');
        setTimeout(() => setRoleToast(''), 4000);
      });
  }, []);

  // Cargar catálogo y stock desde API externa (vía proxy backend)
  React.useEffect(() => {
    (async () => {
      try {
        console.log('[BlackMarket] 📦 Fetch catálogo y stock...');
        
        // Cargar catálogo y stock en paralelo
        const [catalogResp, stockResp] = await Promise.allSettled([
          fetch('https://spainrp-web.onrender.com/api/proxy/blackmarket/items'),
          fetch('https://spainrp-web.onrender.com/api/blackmarket/stock')
        ]);
        
        // Procesar catálogo
        if (catalogResp.status === 'fulfilled' && catalogResp.value.ok) {
          const catalogData = await catalogResp.value.json();
          if (catalogData && typeof catalogData === 'object') {
            setCatalog(catalogData);
            console.log('[BlackMarket] ✅ Catálogo cargado:', Object.keys(catalogData).length, 'items');
          }
        } else {
          console.warn('[BlackMarket] ❌ Error catálogo:', catalogResp.reason || 'Unknown error');
        }
        
        // Procesar stock
        if (stockResp.status === 'fulfilled' && stockResp.value.ok) {
          const stockData = await stockResp.value.json();
          if (stockData && stockData.stock && Array.isArray(stockData.stock)) {
            // Crear un mapa de stock para fácil acceso
            const stockMap = {};
            stockData.stock.forEach(item => {
              stockMap[item.itemId] = {
                stock: item.stock,
                price: item.price,
                name: item.name
              };
            });
            setStockData(stockMap);
            console.log('[BlackMarket] ✅ Stock cargado:', stockData.stock.length, 'items');
          }
        } else {
          console.warn('[BlackMarket] ❌ Error stock:', stockResp.reason || 'Unknown error');
        }
        
        if (catalogResp.status === 'rejected' && stockResp.status === 'rejected') {
          setRoleToast('⚠️ Error cargando datos del BlackMarket');
          setTimeout(() => setRoleToast(''), 3000);
        }
      } catch (e) {
        console.error('[BlackMarket] ❌ Error cargando datos:', e);
        setRoleToast('⚠️ Error de conexión cargando datos');
        setTimeout(() => setRoleToast(''), 3000);
      } finally {
        setCatalogLoaded(true);
      }
    })();
  }, []);

  // Cargar ventas de usuarios cuando se selecciona la pestaña del mercado
  React.useEffect(() => {
    if (selected === ITEMS.length + 1) { // +1 para la pestaña de Bolsa Negra, +1 para mercado de usuarios
      loadUserSales();
    }
  }, [selected]);

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
      let response;
      let users = [];
      try {
        response = await fetch(`https://spainrp-web.onrender.com/api/proxy/admin/search/${encodeURIComponent(query)}?adminUserId=${user.id}`);
        if (!response.ok || response.headers.get('content-type')?.includes('text/html')) {
          throw new Error('API externa no disponible');
        }
      } catch (e) {
        console.log('[BlackMarket] API externa no disponible, usando backend local');
        response = await fetch(`https://spainrp-web.onrender.com/api/proxy/admin/search/${encodeURIComponent(query)}?adminUserId=${user.id}`);
      }
      const data = await response.json();
      if (response.ok) {
        // Si la respuesta es un array de usuarios, úsala
        if (Array.isArray(data.users)) {
          users = data.users;
        } else if (Array.isArray(data)) {
          users = data;
        } else if (data.userId) {
          // Si es búsqueda por ID Discord, adaptar a formato de usuario
          users = [{
            id: data.userId,
            username: data.userId,
            balance: data.balance,
            found: data.found,
            type: data.type || 'discord_id'
          }];
        }
        // Si el input parece un ID Discord y no hay resultados, crear resultado manual
        if (users.length === 0 && /^\d{15,21}$/.test(query)) {
          users = [{
            id: query,
            username: `ID Discord: ${query}`,
            balance: null,
            found: false,
            type: 'discord_id'
          }];
        }
        // Si algún usuario tiene type 'discord_id', mostrarlo como ID
        users = users.map(u => ({
          ...u,
          username: u.type === 'discord_id' ? `ID Discord: ${u.id}` : (u.username || u.id)
        }));
        setSearchResults(users);
        if (users.length === 0) setAdminMessage('No se encontraron resultados para la búsqueda.');
        else setAdminMessage('');
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
    // Evitar llamadas duplicadas si el usuario ya está seleccionado
    if (selectedUser && selectedUser.id === user.id) return;
    setSelectedUser(user);
    setAdminLoading(true);
    try {
      // Cargar inventario del usuario
      let inventoryRes;
      try {
        inventoryRes = await fetch(`https://spainrp-web.onrender.com/api/proxy/admin/inventory/${user.id || user.userId}?adminUserId=${user.id || user.userId}`);
        if (!inventoryRes.ok || inventoryRes.headers.get('content-type')?.includes('text/html')) {
          throw new Error('API externa no disponible');
        }
      } catch (e) {
        console.log('[BlackMarket] API externa no disponible para inventario, usando backend local');
        inventoryRes = await fetch(`https://spainrp-web.onrender.com/api/proxy/admin/inventory/${user.id || user.userId}?adminUserId=${user.id || user.userId}`);
      }
      const inventoryData = await inventoryRes.json();
      if (inventoryRes.ok) {
        setUserInventory(inventoryData.inventario || []);
      }

      // Cargar saldo del usuario
      let balanceRes;
      try {
        balanceRes = await fetch(`https://spainrp-web.onrender.com/api/proxy/admin/balance/${user.id || user.userId}?adminUserId=${user.id || user.userId}`);
        if (!balanceRes.ok || balanceRes.headers.get('content-type')?.includes('text/html')) {
          throw new Error('API externa no disponible');
        }
      } catch (e) {
        console.log('[BlackMarket] API externa no disponible para saldo, usando backend local');
        balanceRes = await fetch(`https://spainrp-web.onrender.com/api/proxy/admin/balance/${user.id || user.userId}?adminUserId=${user.id || user.userId}`);
      }
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
    const uid = selectedUser.id || selectedUser.userId;
    try {
      console.log('[BlackMarket] Agregando item:', { targetUserId: uid, itemId, amount, adminUserId: user.id });
      
      const response = await fetch('https://spainrp-web.onrender.com/api/proxy/admin/additem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetUserId: uid,
          itemId,
          amount: parseInt(amount),
          adminUserId: user.id
        })
      });
      
      console.log('[BlackMarket] AddItem response status:', response.status);
      const data = await response.json();
      console.log('[BlackMarket] AddItem response data:', data);
      
      if (response.ok && !data.error) {
        setAdminMessage(`✅ Item agregado exitosamente`);
        // Recargar inventario
        selectUser(selectedUser);
      } else {
        setAdminMessage('❌ Error al agregar item: ' + (data.error || 'Error desconocido'));
      }
    } catch (error) {
      console.error('[BlackMarket] AddItem error:', error);
      setAdminMessage('❌ Error al agregar item: ' + error.message);
    } finally {
      setAdminLoading(false);
    }
  };

  const removeItemFromUser = async (itemId, amount) => {
    if (!selectedUser || !isAdmin) return;
    setAdminLoading(true);
    const uid = selectedUser.id || selectedUser.userId;
    try {
      console.log('[BlackMarket] Retirando item:', { targetUserId: uid, itemId, amount, adminUserId: user.id });
      
      const response = await fetch('https://spainrp-web.onrender.com/api/proxy/admin/removeitem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetUserId: uid,
          itemId,
          amount: parseInt(amount),
          adminUserId: user.id
        })
      });
      
      console.log('[BlackMarket] RemoveItem response status:', response.status);
      const data = await response.json();
      console.log('[BlackMarket] RemoveItem response data:', data);
      
      if (response.ok && !data.error) {
        setAdminMessage(`✅ Item retirado exitosamente`);
        // Recargar inventario
        selectUser(selectedUser);
      } else {
        setAdminMessage('❌ Error al retirar item: ' + (data.error || 'Error desconocido'));
      }
    } catch (error) {
      console.error('[BlackMarket] RemoveItem error:', error);
      setAdminMessage('❌ Error al retirar item: ' + error.message);
    } finally {
      setAdminLoading(false);
    }
  };

  const setUserBalance = async (cash, bank) => {
    if (!selectedUser || !isAdmin) return;
    setAdminLoading(true);
    const uid = selectedUser.id || selectedUser.userId;
    try {
      let response;
      try {
        response = await fetch('https://spainrp-web.onrender.com/api/proxy/admin/setbalance', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: uid,
            cash: parseInt(cash) || 0,
            bank: parseInt(bank) || 0,
            adminUserId: user.id
          })
        });
        if (!response.ok || response.headers.get('content-type')?.includes('text/html')) {
          throw new Error('API externa no disponible');
        }
      } catch (e) {
        console.log('[BlackMarket] API externa no disponible para setbalance, usando backend local');
        response = await fetch('https://spainrp-web.onrender.com/api/proxy/admin/setbalance', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: uid,
            cash: parseInt(cash) || 0,
            bank: parseInt(bank) || 0,
            adminUserId: user.id
          })
        });
      }
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

  // Debug logs para identificar el problema
  console.log('[BlackMarket] 🔍 Estado actual:', { loading, roleChecking, user: !!user, authorized });

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
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div
          style={{
            width: 48,
            height: 48,
            border: '6px solid #0ea5e9',
            borderTop: '6px solid #fff',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            marginBottom: 24
          }}
        />
        <div style={{ color: '#fff', opacity: 0.85, fontSize: '1.05rem' }}>
          {roleChecking ? 'Verificando permisos de Discord...' : 'Cargando BlackMarket...'}
        </div>
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
          <div style={{opacity:0.95, marginBottom: 16}}>
            Debes ser miembro del servidor Discord y tener el rol <b style={{color:'#FFD700'}}>Criminal</b> para acceder al BlackMarket.
          </div>
          {roleToast && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '8px',
              padding: '12px',
              margin: '16px 0',
              color: '#ef4444',
              fontSize: '0.95rem'
            }}>
              {roleToast}
            </div>
          )}
          <div style={{marginTop: 20, display:'flex', gap: 12, justifyContent:'center', flexWrap:'wrap'}}>
            <a href="https://discord.com/invite/sMzFgFQHXA" target="_blank" rel="noopener noreferrer" style={{background:'#7289da',color:'#fff',borderRadius:8,padding:'0.7rem 1.5rem',fontWeight:700,textDecoration:'none',fontSize:'1.05rem',border:'none',cursor:'pointer'}}>
              Unirme al Discord
            </a>
            <a href="https://discord.com/channels/1212556680911650866/1384341523474284574/1388083940337778688" target="_blank" rel="noopener noreferrer" style={{background:'#00ff99',color:'#111',borderRadius:8,padding:'0.7rem 1.5rem',fontWeight:800,textDecoration:'none',fontSize:'1.05rem',border:'none',cursor:'pointer', boxShadow:'0 0 12px #00ff9933'}}>
              Obtener rol Criminal
            </a>
          </div>
          <div style={{marginTop: 16, fontSize: '0.9rem', opacity: 0.7}}>
            Si ya tienes el rol, espera unos minutos y recarga la página.
          </div>
        </div>
        <div className="blackmarket-hack-footer">
          <FaSkull size={18} style={{marginRight:6}} />
          <span>Acceso solo para criminales del servidor.</span>
        </div>
      </div>
    );
  }

  // Fallback para asegurar que siempre se renderice algo
  console.log('[BlackMarket] 🎯 Renderizando contenido principal');
  
  try {
  return (
    <div className={`blackmarket-hack-bg theme-${currentTheme}`}>
      {roleChecking && <div className="role-check-bar" />}
      {roleToast && <div className="role-ok-toast">{roleToast}</div>}
      <DiscordUserBar />
      <div className="blackmarket-hack-header">
        {isMobile && (
          <button 
            className="mobile-menu-toggle"
            onClick={toggleMobileMenu}
            aria-label="Abrir menú"
          >
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
          </button>
        )}
        <FaLock size={isMobile ? 20 : 32} style={{marginRight: isMobile ? 6 : 12}} />
        <span className={isMobile ? "mobile-title" : ""}>BLACKMARKET SPAINRP</span>
        
        
        {isMobile && (
          <div className="mobile-header-actions">
            {user && (
              <button 
                className="mobile-inventory-btn"
                onClick={toggleMobileInventory}
                title="Inventario"
              >
                🎒
              </button>
            )}
            {isAdmin && (
              <button 
                className="mobile-admin-btn"
                onClick={toggleMobileAdmin}
                title="Admin"
              >
                ⚙️
              </button>
            )}
          </div>
        )}
      </div>
      {user && !isMobile && (
        <button
          className="inventory-fab"
          title="Inventario"
          onClick={async () => {
            try {
              setInventoryLoading(true);
              setInventoryError('');
              console.log('[BlackMarket] Fetch inventario for', user.id);
              const resp = await fetch(`https://spainrp-web.onrender.com/api/proxy/blackmarket/inventario/${encodeURIComponent(user.id)}`);
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
      
      {isAdmin && !isMobile && (
        <>
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
          <button
            className="quick-balance-fab"
            title="Solo admins: Modificar saldo por ID Discord"
            onClick={() => setShowQuickBalanceWarning(true)}
            disabled={quickLoading}
            style={{
              position: 'fixed',
              top: '90px',
              left: '20px',
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              background: quickLoading ? 'linear-gradient(135deg, #a3a3a3, #38bdf8)' : 'linear-gradient(135deg, #22d3ee, #0ea5e9)',
              border: 'none',
              color: quickLoading ? '#e0e0e0' : 'white',
              fontSize: '24px',
              cursor: quickLoading ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 15px rgba(34, 211, 238, 0.4)',
              zIndex: 1000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.3s ease',
              opacity: quickLoading ? 0.7 : 1
            }}
          >
            {quickLoading ? <span style={{animation:'spin 1s linear infinite', display:'inline-block'}}>⏳</span> : '💸'}
          </button>
        </>
      )}

      {/* Botón de gestión de stock solo para ID específico */}
      {user && user.id === '710112055985963090' && !isMobile && (
        <button
          className="stock-manager-fab"
          title="Gestión de Stock del BlackMarket"
          onClick={() => setShowStockManager(true)}
          style={{
            position: 'fixed',
            top: '160px',
            left: '20px',
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
            border: 'none',
            color: 'white',
            fontSize: '24px',
            cursor: 'pointer',
            boxShadow: '0 4px 15px rgba(139, 92, 246, 0.4)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.3s ease'
          }}
        >
          📦
        </button>
      )}
      {/* Panel rápido para modificar saldo por ID Discord */}
      {showQuickBalance && (
        <div style={{
          position: 'fixed',
          top: '170px',
          left: '20px',
          width: '340px',
          background: '#fff',
          borderRadius: '18px',
          boxShadow: '0 4px 24px #22d3ee33',
          padding: '1.7rem 1.5rem 1.2rem 1.5rem',
          zIndex: 2000,
          border: quickResult ? (quickResult.startsWith('✅') ? '2px solid #22c55e' : '2px solid #ef4444') : '2px solid #0ea5e9',
          transition: 'border 0.2s'
        }}>
          <h3 style={{marginBottom: '1rem', color: '#0ea5e9', fontWeight:800}}>Modificar saldo por ID Discord</h3>
          <form onSubmit={handleQuickBalance}>
            <div style={{marginBottom: '0.8rem'}}>
              <label style={{fontWeight:700}}>ID Discord</label>
              <input type="text" value={quickId} onChange={e => setQuickId(e.target.value)} style={{width:'100%',padding:'0.6rem',borderRadius:8,border:'1px solid #4b5563',background:'#1a1a1a',color:'#ffffff',marginTop:4,fontWeight:600,fontSize:'1.05rem'}} required disabled={quickLoading} />
            </div>
            <div style={{marginBottom: '0.8rem'}}>
              <label style={{fontWeight:700}}>Efectivo (cash)</label>
              <input type="number" value={quickCash} onChange={e => setQuickCash(e.target.value)} style={{width:'100%',padding:'0.6rem',borderRadius:8,border:'1px solid #4b5563',background:'#1a1a1a',color:'#ffffff',marginTop:4,fontWeight:600,fontSize:'1.05rem'}} required min={0} disabled={quickLoading} />
            </div>
            <div style={{marginBottom: '0.8rem'}}>
              <label style={{fontWeight:700}}>Banco (bank)</label>
              <input type="number" value={quickBank} onChange={e => setQuickBank(e.target.value)} style={{width:'100%',padding:'0.6rem',borderRadius:8,border:'1px solid #4b5563',background:'#1a1a1a',color:'#ffffff',marginTop:4,fontWeight:600,fontSize:'1.05rem'}} required min={0} disabled={quickLoading} />
            </div>
            <button type="submit" disabled={quickLoading || !quickId || !quickCash || !quickBank} style={{
              width:'100%',
              background: quickLoading ? '#a3a3a3' : '#0ea5e9',
              color:'#fff',
              border:'none',
              borderRadius:10,
              padding:'0.9rem',
              fontWeight:800,
              fontSize:'1.15rem',
              marginTop:8,
              boxShadow:'0 2px 8px #22d3ee33',
              cursor: quickLoading ? 'not-allowed' : 'pointer',
              opacity: quickLoading ? 0.7 : 1,
              transition:'background 0.2s, opacity 0.2s'
            }}>{quickLoading ? 'Procesando...' : 'Modificar saldo'}</button>
          </form>
          {quickResult && <div style={{marginTop:'1rem',color:quickResult.startsWith('✅')?'#22c55e':'#ef4444',fontWeight:700,transition:'color 0.2s'}}>{quickResult}</div>}
          <button onClick={()=>setShowQuickBalance(false)} style={{marginTop:'1.2rem',background:'#eee',color:'#0ea5e9',border:'none',borderRadius:8,padding:'0.7rem 1.2rem',fontWeight:700,cursor:'pointer'}}>Cerrar</button>
        </div>
      )}

      {/* Modal de advertencia para Quick Balance - Versión mejorada y responsive */}
      {showQuickBalanceWarning && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 3000,
          animation: 'fadeIn 0.3s ease-out',
          padding: '1rem'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
            borderRadius: isMobile ? '12px' : '16px',
            padding: isMobile ? '1.2rem' : '1.5rem',
            maxWidth: isMobile ? '95%' : '420px',
            width: '100%',
            maxHeight: isMobile ? '90vh' : '80vh',
            border: '2px solid #ef4444',
            boxShadow: '0 20px 40px rgba(239, 68, 68, 0.3)',
            animation: 'slideInScale 0.4s ease-out',
            position: 'relative',
            overflow: 'hidden',
            overflowY: 'auto'
          }}>
            {/* Efecto de parpadeo de advertencia */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '3px',
              background: 'linear-gradient(90deg, #ef4444, #f59e0b, #ef4444)',
              animation: 'warningPulse 1s ease-in-out infinite'
            }} />
            
            {/* Header compacto */}
            <div style={{
              textAlign: 'center',
              marginBottom: '1rem'
            }}>
              <div style={{
                fontSize: isMobile ? '2.5rem' : '3rem',
                animation: 'warningBounce 0.6s ease-in-out infinite alternate',
                marginBottom: '0.5rem'
              }}>
                ⚠️
              </div>
              <h2 style={{
                color: '#ef4444',
                fontSize: isMobile ? '1.3rem' : '1.5rem',
                fontWeight: '800',
                margin: 0,
                textShadow: '0 0 10px rgba(239, 68, 68, 0.5)'
              }}>
                ADVERTENCIA CRÍTICA
              </h2>
            </div>

            {/* Contenido principal con descripciones desplegables */}
            <div style={{
              color: '#fff',
              lineHeight: '1.5',
              marginBottom: '1.5rem'
            }}>
              <p style={{
                fontSize: isMobile ? '0.95rem' : '1rem',
                marginBottom: '1rem',
                fontWeight: '600',
                textAlign: 'center'
              }}>
                Función <strong style={{color: '#ef4444'}}>EXTREMADAMENTE PELIGROSA</strong>
              </p>
              
              {/* Descripción desplegable 1 - Consecuencias */}
              <div style={{
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '8px',
                marginBottom: '0.8rem',
                overflow: 'hidden'
              }}>
                <button
                  onClick={() => setShowConsequences(!showConsequences)}
                  style={{
                    width: '100%',
                    background: 'none',
                    border: 'none',
                    color: '#f59e0b',
                    padding: '0.8rem',
                    fontSize: isMobile ? '0.9rem' : '1rem',
                    fontWeight: '700',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    textAlign: 'left'
                  }}
                >
                  <span>⚠️ Consecuencias Graves</span>
                  <span style={{
                    transform: showConsequences ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.3s ease',
                    fontSize: '0.8rem'
                  }}>
                    ▼
                  </span>
                </button>
                {showConsequences && (
                  <div style={{
                    padding: '0 0.8rem 0.8rem 0.8rem',
                    fontSize: isMobile ? '0.8rem' : '0.85rem',
                    lineHeight: '1.4'
                  }}>
                    <ul style={{ margin: 0, paddingLeft: '1rem' }}>
                      <li>Modificación directa de saldos</li>
                      <li>Acceso a datos financieros</li>
                      <li>Desequilibrio económico del servidor</li>
                      <li>Impacto en experiencia de juego</li>
                    </ul>
                  </div>
                )}
              </div>

              {/* Descripción desplegable 2 - Sanciones */}
              <div style={{
                background: 'rgba(245, 158, 11, 0.1)',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                borderRadius: '8px',
                marginBottom: '1rem',
                overflow: 'hidden'
              }}>
                <button
                  onClick={() => setShowSanctions(!showSanctions)}
                  style={{
                    width: '100%',
                    background: 'none',
                    border: 'none',
                    color: '#f59e0b',
                    padding: '0.8rem',
                    fontSize: isMobile ? '0.9rem' : '1rem',
                    fontWeight: '700',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    textAlign: 'left'
                  }}
                >
                  <span>🚨 Sanciones Inmediatas</span>
                  <span style={{
                    transform: showSanctions ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.3s ease',
                    fontSize: '0.8rem'
                  }}>
                    ▼
                  </span>
                </button>
                {showSanctions && (
                  <div style={{
                    padding: '0 0.8rem 0.8rem 0.8rem',
                    fontSize: isMobile ? '0.8rem' : '0.85rem',
                    lineHeight: '1.4'
                  }}>
                    <p style={{ margin: '0 0 0.5rem 0', fontWeight: '600' }}>
                      Uso sin motivos documentados resultará en:
                    </p>
                    <ul style={{ margin: 0, paddingLeft: '1rem' }}>
                      <li>Revocación de permisos de admin</li>
                      <li>Sanción temporal o permanente</li>
                      <li>Investigación de acciones</li>
                      <li>Posible expulsión del staff</li>
                    </ul>
                  </div>
                )}
              </div>

              <p style={{
                fontSize: isMobile ? '0.9rem' : '1rem',
                textAlign: 'center',
                fontWeight: '700',
                color: '#f59e0b',
                margin: 0
              }}>
                ¿Estás seguro de que necesitas usar esta función?
              </p>
            </div>

            {/* Botones de acción responsive */}
            <div style={{
              display: 'flex',
              gap: isMobile ? '0.8rem' : '1rem',
              justifyContent: 'center',
              flexDirection: isMobile ? 'column' : 'row'
            }}>
              <button
                onClick={closeQuickBalanceWarning}
                style={{
                  background: 'linear-gradient(135deg, #6b7280, #4b5563)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: isMobile ? '0.7rem 1.5rem' : '0.8rem 2rem',
                  fontSize: isMobile ? '0.9rem' : '1rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 12px rgba(107, 114, 128, 0.3)',
                  width: isMobile ? '100%' : 'auto'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 6px 16px rgba(107, 114, 128, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 12px rgba(107, 114, 128, 0.3)';
                }}
              >
                Cancelar
              </button>
              
              <button
                onClick={confirmQuickBalanceAccess}
                style={{
                  background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: isMobile ? '0.7rem 1.5rem' : '0.8rem 2rem',
                  fontSize: isMobile ? '0.9rem' : '1rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 12px rgba(239, 68, 68, 0.4)',
                  animation: 'dangerPulse 2s ease-in-out infinite',
                  width: isMobile ? '100%' : 'auto'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 6px 16px rgba(239, 68, 68, 0.6)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.4)';
                }}
              >
                Entiendo los riesgos
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Barra de búsqueda y filtros */}
      <div className="search-filters-container">
        <div className="search-bar">
          <input
            type="text"
            placeholder="🔍 Buscar items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          <button 
            className="refresh-stock-btn"
            onClick={refreshStock}
            title="Refrescar stock"
          >
            🔄
          </button>
          <button 
            className="filters-toggle"
            onClick={() => setShowFilters(!showFilters)}
            title="Mostrar/ocultar filtros"
          >
            ⚙️
          </button>
        </div>
        
        {showFilters && (
          <div className="filters-panel">
            <div className="filter-group">
              <label>Calidad:</label>
              <select 
                value={selectedQuality} 
                onChange={(e) => setSelectedQuality(e.target.value)}
                className="filter-select"
              >
                <option value="all">Todas</option>
                <option value="basic">Básica</option>
                <option value="standard">Estándar</option>
                <option value="advanced">Avanzada</option>
                <option value="elite">Élite</option>
                <option value="legendary">Legendaria</option>
              </select>
            </div>
            
            <div className="filter-group">
              <label>Precio: {priceRange.min}€ - {priceRange.max}€</label>
              <div className="price-range">
                <input
                  type="range"
                  min="0"
                  max="1000000"
                  step="1000"
                  value={priceRange.min}
                  onChange={(e) => setPriceRange(prev => ({ ...prev, min: parseInt(e.target.value) }))}
                  className="range-slider"
                />
                <input
                  type="range"
                  min="0"
                  max="1000000"
                  step="1000"
                  value={priceRange.max}
                  onChange={(e) => setPriceRange(prev => ({ ...prev, max: parseInt(e.target.value) }))}
                  className="range-slider"
                />
              </div>
            </div>
            
            <div className="filter-group">
              <label>Stock:</label>
              <select 
                value={stockFilter} 
                onChange={(e) => setStockFilter(e.target.value)}
                className="filter-select"
              >
                <option value="all">Todos</option>
                <option value="in_stock">En stock</option>
                <option value="low_stock">Stock bajo</option>
                <option value="out_of_stock">Agotado</option>
              </select>
            </div>
            
            <div className="filter-group">
              <label>Ordenar por:</label>
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)}
                className="filter-select"
              >
                <option value="name">Nombre</option>
                <option value="price_low">Precio (menor a mayor)</option>
                <option value="price_high">Precio (mayor a menor)</option>
                <option value="quality">Calidad</option>
                <option value="stock">Stock</option>
              </select>
            </div>
            
            <button 
              className="clear-filters-btn"
              onClick={clearFilters}
            >
              🗑️ Limpiar filtros
            </button>
          </div>
        )}
      </div>

      {/* Tabs solo visibles en desktop y tablet */}
      {!isMobile && (
        <div className="blackmarket-hack-tabs">
          {ITEMS.map((cat, idx) => (
            <button
              key={idx}
              className={`blackmarket-hack-tab${selected === idx ? ' active' : ''}`}
              onClick={() => setSelected(idx)}
            >
              {cat.icon}
              <span>{cat.category}</span>
            </button>
          ))}
          <button
            key={ITEMS.length}
            className={`blackmarket-hack-tab${selected === ITEMS.length ? ' active' : ''}`}
            onClick={() => setSelected(ITEMS.length)}
          >
            <FaChartLine />
            <span>Bolsa Negra</span>
          </button>
          <button
            key={ITEMS.length + 1}
            className={`blackmarket-hack-tab${selected === ITEMS.length + 1 ? ' active' : ''}`}
            onClick={() => setSelected(ITEMS.length + 1)}
          >
            <FaUserSecret />
            <span>Mercado Usuarios</span>
          </button>
        </div>
      )}
      {/* Indicador de categoría actual en móvil */}
      {isMobile && (
        <div className="mobile-category-indicator">
          <div className="current-category">
            {selected < ITEMS.length ? (
              <>
                {ITEMS[selected].icon}
                <span>{ITEMS[selected].category}</span>
              </>
            ) : selected === ITEMS.length ? (
              <>
                <FaChartLine />
                <span>Bolsa Negra</span>
              </>
            ) : (
              <>
                <FaUserSecret />
                <span>Mercado Usuarios</span>
              </>
            )}
          </div>
          <div className="category-stats">
            {selected < ITEMS.length && (
              <span>{ITEMS[selected].options.length} items disponibles</span>
            )}
            {selected === ITEMS.length + 1 && (
              <span>{userSales.length} ventas disponibles</span>
            )}
          </div>
        </div>
      )}

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
      ) : selected === ITEMS.length + 1 ? (
        /* Mercado de Usuarios */
        <div className="blackmarket-hack-list">
          <div className="user-market-header">
            <h3>🏪 Mercado de Usuarios</h3>
            <p>Compra y vende items con otros jugadores</p>
            <div className="market-actions">
              <button 
                className="refresh-sales-btn"
                onClick={loadUserSales}
                title="Refrescar ventas"
              >
                🔄 Refrescar
              </button>
            </div>
          </div>
          
          {userSales.length > 0 ? (
            <div className="user-sales-list">
              {userSales.map((sale) => (
                <div key={sale.saleId} className="user-sale-item">
                  <div className="sale-info">
                    <h4>{sale.itemName}</h4>
                    <p>Cantidad: {sale.amount}</p>
                    <p>Precio: {sale.price.toLocaleString()}€</p>
                    <p>Vendedor: {sale.sellerId}</p>
                    <p>Fecha: {new Date(sale.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="sale-actions">
                    <button 
                      className="buy-from-user-btn"
                      onClick={() => handleBuyFromUser(sale.saleId, 1)}
                    >
                      Comprar 1
                    </button>
                    {sale.amount > 1 && (
                      <button 
                        className="buy-from-user-btn"
                        onClick={() => handleBuyFromUser(sale.saleId, sale.amount)}
                      >
                        Comprar Todo
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-sales">
              <p>No hay ventas disponibles en este momento</p>
            </div>
          )}
        </div>
      ) : (
        <div className="blackmarket-hack-list">
          {/* Contador de resultados */}
          <div className="results-counter">
            {searchQuery ? (
              <>
                {getFilteredItems().length} resultados de búsqueda
                <span className="search-indicator"> (en todas las secciones)</span>
              </>
            ) : (
              <>
            {getFilteredItems().length} de {ITEMS[selected].options.length} items
                {(selectedQuality !== 'all' || stockFilter !== 'all' || priceRange.min > 0 || priceRange.max < 1000000) && (
              <span className="filtered-indicator"> (filtrados)</span>
                )}
              </>
            )}
          </div>
          
          {getFilteredItems().map((item, i) => {
            // Los datos ya vienen procesados con stock real desde getFilteredItems
            const displayName = item.name;
            const displayPrice = item.price;
            const displayStock = item.stock;
            const isOutOfStock = displayStock <= 0;
            
            return (
            <div key={item.name} className={`blackmarket-hack-item ${item.quality || 'basic'} ${isOutOfStock ? 'out-of-stock' : ''}`}>
              <div className="item-header">
                <div className="item-image-container">
                  {item.image ? (
                    <img 
                      src={item.image} 
                      alt={displayName}
                      className="item-image"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div className="item-icon-fallback" style={{display: item.image ? 'none' : 'flex'}}>
                {item.icon && <span className="blackmarket-hack-item-icon">{item.icon}</span>}
                  </div>
                </div>
                <div className="item-info">
                  <span className="blackmarket-hack-item-name">{displayName}</span>
                  <span className="blackmarket-hack-item-price">{Number(displayPrice).toLocaleString()}€</span>
                  {searchQuery && item.sectionName && (
                    <span className="item-section-badge">{item.sectionName}</span>
                  )}
                </div>
                <div className="item-stock">
                  <span className={`stock-dot ${displayStock <= 2 ? 'low' : displayStock <= 5 ? 'medium' : 'high'}`}></span>
                  <span className="stock-text">{displayStock}</span>
                  {isOutOfStock && <span className="out-of-stock-label">AGOTADO</span>}
                </div>
              </div>
              
              {item.description && (
                <div className="item-description-container">
                  <button 
                    className="description-toggle"
                    onClick={() => toggleItemDescription(item.itemId || item.name)}
                  >
                    <span className="description-title">Descripción</span>
                    <span className={`description-arrow ${expandedItems.has(item.itemId || item.name) ? 'expanded' : ''}`}>
                      ▼
                    </span>
                  </button>
                  <div className={`item-description ${expandedItems.has(item.itemId || item.name) ? 'expanded' : ''}`}>
                    <p>{item.description}</p>
                    {item.effects && item.effects.length > 0 && (
                      <div className="item-effects-mini">
                        <div className="effects-label">Efectos:</div>
                        <div className="effects-list">
                          {item.effects.slice(0, 3).map((effect, idx) => (
                            <span key={idx} className={`effect-tag ${effect.includes('+') ? 'positive' : effect.includes('-') ? 'negative' : 'neutral'}`}>
                              {effect}
                            </span>
                          ))}
                          {item.effects.length > 3 && (
                            <span className="effect-tag more">+{item.effects.length - 3} más</span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              <div className="item-actions">
                <button 
                  className={`blackmarket-hack-buy ${isOutOfStock ? 'disabled' : ''}`} 
                  onClick={() => handleBuy({ ...item, name: displayName, price: displayPrice })}
                  disabled={isOutOfStock}
                >
                  {isOutOfStock ? 'Agotado' : 'Comprar'}
                </button>
              </div>
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
                    const resp = await fetch('https://spainrp-web.onrender.com/api/proxy/blackmarket/purchase', {
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
                      
                      // Actualizar stock local después de compra exitosa
                      if (data.stock !== undefined && modalItem.itemId) {
                        setStockData(prev => ({
                          ...prev,
                          [modalItem.itemId]: {
                            ...prev[modalItem.itemId],
                            stock: data.stock
                          }
                        }));
                      }
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
                        const resp = await fetch(`https://spainrp-web.onrender.com/api/proxy/blackmarket/inventario/${encodeURIComponent(user.id)}`);
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
                                <div style={{marginTop:6, display:'flex', justifyContent:'flex-end', gap: '8px'}}>
                                  <button
                                    className="sellone-btn"
                                    onClick={async () => {
                                      try {
                                        setPurchaseState({ visible: true, status: 'loading', message: 'Vendiendo 1 objeto...' });
                                        const resp = await fetch('https://spainrp-web.onrender.com/api/proxy/blackmarket/sellone', {
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
                                            const r2 = await fetch(`https://spainrp-web.onrender.com/api/proxy/blackmarket/inventario/${encodeURIComponent(user.id)}`);
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
                                  
                                  <button
                                    className="sell-to-user-btn"
                                    onClick={() => {
                                      setSellItem({
                                        itemId: it.itemId,
                                        name: it.name,
                                        price: it.price
                                      });
                                      setSellAmount(1);
                                      setSellPrice(Math.floor(it.price * 1.1)); // Precio base + 10%
                                      setShowSellModal(true);
                                    }}
                                    style={{
                                      background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                                      color: 'white',
                                      border: 'none',
                                      borderRadius: '6px',
                                      padding: '4px 8px',
                                      fontSize: '12px',
                                      fontWeight: '600',
                                      cursor: 'pointer',
                                      transition: 'all 0.3s ease'
                                    }}
                                  >Vender a Usuario</button>
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
                        const resp = await fetch('https://spainrp-web.onrender.com/api/proxy/blackmarket/sell', {
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
                            const r2 = await fetch(`https://spainrp-web.onrender.com/api/proxy/blackmarket/inventario/${encodeURIComponent(user.id)}`);
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

      {/* Modal para vender a otros usuarios */}
      {showSellModal && sellItem && (
        <div className={`blackmarket-hack-modal ${modalClosing ? 'modal-leave' : 'modal-enter'}`}>
          <div className={`blackmarket-hack-modal-content ${modalClosing ? 'content-leave' : 'content-enter'}`}>
            <h3>Vender a Otros Usuarios</h3>
            <div style={{marginBottom: '1rem'}}>
              <p><strong>Item:</strong> {sellItem.name}</p>
              <p><strong>Precio original:</strong> {sellItem.price?.toLocaleString()}€</p>
            </div>
            
            <div style={{marginBottom: '1rem'}}>
              <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: '600'}}>
                Cantidad a vender:
              </label>
              <input
                type="number"
                min="1"
                max={sellItem.amount || 1}
                value={sellAmount}
                onChange={(e) => setSellAmount(parseInt(e.target.value) || 1)}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  borderRadius: '6px',
                  border: '1px solid #4b5563',
                  background: '#1a1a1a',
                  color: '#ffffff',
                  fontSize: '1rem'
                }}
              />
            </div>
            
            <div style={{marginBottom: '1rem'}}>
              <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: '600'}}>
                Precio por unidad (máximo +25% del precio original):
              </label>
              <input
                type="number"
                min={sellItem.price || 0}
                max={Math.floor((sellItem.price || 0) * 1.25)}
                value={sellPrice}
                onChange={(e) => setSellPrice(parseInt(e.target.value) || 0)}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  borderRadius: '6px',
                  border: '1px solid #4b5563',
                  background: '#1a1a1a',
                  color: '#ffffff',
                  fontSize: '1rem'
                }}
              />
              <p style={{fontSize: '0.8rem', color: '#9ca3af', marginTop: '0.25rem'}}>
                Precio total: {(sellPrice * sellAmount).toLocaleString()}€
              </p>
            </div>
            
            <div style={{display: 'flex', gap: '1rem', justifyContent: 'flex-end'}}>
              <button 
                onClick={() => {
                  setShowSellModal(false);
                  setSellItem(null);
                  setSellAmount(1);
                  setSellPrice(0);
                }}
                className="blackmarket-hack-cancel"
              >
                Cancelar
              </button>
              <button
                onClick={handleSellToUser}
                disabled={!sellAmount || !sellPrice || sellPrice < sellItem.price || sellPrice > Math.floor(sellItem.price * 1.25)}
                className="blackmarket-hack-confirm"
                style={{
                  opacity: (!sellAmount || !sellPrice || sellPrice < sellItem.price || sellPrice > Math.floor(sellItem.price * 1.25)) ? 0.5 : 1,
                  cursor: (!sellAmount || !sellPrice || sellPrice < sellItem.price || sellPrice > Math.floor(sellItem.price * 1.25)) ? 'not-allowed' : 'pointer'
                }}
              >
                Poner en Venta
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de gestión de stock (solo para ID específico) */}
      {showStockManager && user && user.id === '710112055985963090' && (
        <div className={`blackmarket-hack-modal ${modalClosing ? 'modal-leave' : 'modal-enter'}`}>
          <div className={`blackmarket-hack-modal-content ${modalClosing ? 'content-leave' : 'content-enter'}`}>
            <h3>📦 Gestión de Stock del BlackMarket</h3>
            <p style={{color: '#9ca3af', marginBottom: '1.5rem'}}>
              Solo visible para el administrador principal
            </p>
            
            <div style={{marginBottom: '1rem'}}>
              <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: '600'}}>
                Item ID:
              </label>
              <input
                type="text"
                placeholder="bm_beretta_m9"
                value={stockManagerItem}
                onChange={(e) => setStockManagerItem(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  borderRadius: '6px',
                  border: '1px solid #4b5563',
                  background: '#1a1a1a',
                  color: '#ffffff',
                  fontSize: '1rem'
                }}
              />
            </div>
            
            <div style={{marginBottom: '1rem'}}>
              <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: '600'}}>
                Acción:
              </label>
              <select
                value={stockManagerAction}
                onChange={(e) => setStockManagerAction(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  borderRadius: '6px',
                  border: '1px solid #4b5563',
                  background: '#1a1a1a',
                  color: '#ffffff',
                  fontSize: '1rem'
                }}
              >
                <option value="add">Añadir stock</option>
                <option value="set">Establecer stock</option>
              </select>
            </div>
            
            <div style={{marginBottom: '1.5rem'}}>
              <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: '600'}}>
                {stockManagerAction === 'add' ? 'Cantidad a añadir:' : 'Nueva cantidad:'}
              </label>
              <input
                type="number"
                min="0"
                value={stockManagerAmount}
                onChange={(e) => setStockManagerAmount(parseInt(e.target.value) || 0)}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  borderRadius: '6px',
                  border: '1px solid #4b5563',
                  background: '#1a1a1a',
                  color: '#ffffff',
                  fontSize: '1rem'
                }}
              />
            </div>
            
            <div style={{display: 'flex', gap: '1rem', justifyContent: 'flex-end'}}>
              <button 
                onClick={() => {
                  setShowStockManager(false);
                  setStockManagerItem('');
                  setStockManagerAmount(0);
                  setStockManagerAction('add');
                }}
                className="blackmarket-hack-cancel"
              >
                Cancelar
              </button>
              <button
                onClick={handleStockManagement}
                disabled={!stockManagerItem || stockManagerAmount < 0}
                className="blackmarket-hack-confirm"
                style={{
                  opacity: (!stockManagerItem || stockManagerAmount < 0) ? 0.5 : 1,
                  cursor: (!stockManagerItem || stockManagerAmount < 0) ? 'not-allowed' : 'pointer'
                }}
              >
                {stockManagerAction === 'add' ? 'Añadir Stock' : 'Establecer Stock'}
              </button>
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
                <div className={`admin-search ${isMobile ? 'mobile-search' : ''}`}>
                  <input
                    type="text"
                    placeholder={isMobile ? "Buscar usuario..." : "Buscar por nombre de usuario..."}
                    value={adminSearchQuery}
                    onChange={(e) => setAdminSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && searchUsers(adminSearchQuery)}
                    className={isMobile ? 'mobile-input' : ''}
                  />
                  <button 
                    onClick={() => searchUsers(adminSearchQuery)}
                    disabled={adminLoading}
                    className={isMobile ? 'mobile-search-btn' : ''}
                  >
                    {adminLoading ? '🔍' : (isMobile ? '🔍' : 'Buscar')}
                  </button>
                </div>
                
                {searchResults.length > 0 && (
                  <div className={`search-results ${isMobile ? 'mobile-results' : ''}`}>
                    {searchResults.map((user) => (
                      <div 
                        key={user.id} 
                        className={`user-result ${isMobile ? 'mobile-user-result' : ''}`}
                        onClick={() => selectUser(user)}
                      >
                        <div className={`user-info ${isMobile ? 'mobile-user-info' : ''}`}>
                          <strong className={isMobile ? 'mobile-username' : ''}>{user.username}</strong>
                          {user.displayName && user.displayName !== user.username && (
                            <span className={`display-name ${isMobile ? 'mobile-display-name' : ''}`}>({user.displayName})</span>
                          )}
                        </div>
                        <div className={`user-id ${isMobile ? 'mobile-user-id' : ''}`}>ID: {user.id}</div>
                        {user.balance && (
                          <div className={`user-balance-preview ${isMobile ? 'mobile-balance' : ''}`}>
                            <span>💰 {user.balance.cash}€ / 🏦 {user.balance.bank}€</span>
                          </div>
                        )}
                        {user.type && <div className={`user-type ${isMobile ? 'mobile-user-type' : ''}`}>Tipo: {user.type}</div>}
                        {user.found === false && <div className={`user-notfound ${isMobile ? 'mobile-notfound' : ''}`}>No encontrado</div>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Usuario seleccionado */}
              {selectedUser && (
                <div className={`admin-section ${isMobile ? 'mobile-admin-section' : ''}`}>
                  <h3 className={isMobile ? 'mobile-section-title' : ''}>
                    👤 {isMobile ? 'Usuario:' : 'Usuario Seleccionado:'} {selectedUser.username}
                  </h3>
                  
                  {/* Saldo del usuario */}
                  {userBalance && (
                    <div className={`user-balance ${isMobile ? 'mobile-user-balance' : ''}`}>
                      <h4 className={isMobile ? 'mobile-balance-title' : ''}>💰 Saldo</h4>
                      <div className={`balance-info ${isMobile ? 'mobile-balance-info' : ''}`}>
                        <div className={isMobile ? 'mobile-balance-item' : ''}>Efectivo: {userBalance.cash || 0}€</div>
                        <div className={isMobile ? 'mobile-balance-item' : ''}>Banco: {userBalance.bank || 0}€</div>
                      </div>
                      <div className={`balance-edit ${isMobile ? 'mobile-balance-edit' : ''}`}>
                        <input 
                          type="number" 
                          placeholder="Efectivo" 
                          id="edit-cash" 
                          className={isMobile ? 'mobile-balance-input' : ''}
                        />
                        <input 
                          type="number" 
                          placeholder="Banco" 
                          id="edit-bank" 
                          className={isMobile ? 'mobile-balance-input' : ''}
                        />
                        <button 
                          onClick={() => {
                            const cash = document.getElementById('edit-cash').value;
                            const bank = document.getElementById('edit-bank').value;
                            if (cash || bank) setUserBalance(cash, bank);
                          }}
                          className={isMobile ? 'mobile-balance-btn' : ''}
                        >
                          {isMobile ? 'Actualizar' : 'Actualizar Saldo'}
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {/* Inventario del usuario */}
                  <div className={`user-inventory ${isMobile ? 'mobile-user-inventory' : ''}`}>
                    <h4 className={isMobile ? 'mobile-inventory-title' : ''}>🎒 Inventario</h4>
                    {adminLoading ? (
                      <div className={isMobile ? 'mobile-loading' : ''}>Cargando inventario...</div>
                    ) : userInventory.length > 0 ? (
                      <div className={`inventory-list ${isMobile ? 'mobile-inventory-list' : ''}`}>
                        {userInventory.map((item, idx) => (
                          <div key={idx} className={`inventory-item ${isMobile ? 'mobile-inventory-item' : ''}`}>
                            <div className={`item-info ${isMobile ? 'mobile-item-info' : ''}`}>
                              <strong className={isMobile ? 'mobile-item-name' : ''}>{item.nombre || item.name}</strong>
                              <span className={isMobile ? 'mobile-item-quantity' : ''}>Cantidad: {item.cantidad || item.amount}</span>
                              <span className={isMobile ? 'mobile-item-price' : ''}>Precio: {item.precio || item.price || 'N/A'}€</span>
                            </div>
                            <div className={`item-actions ${isMobile ? 'mobile-item-actions' : ''}`}>
                              <input 
                                type="number" 
                                placeholder={isMobile ? "Cant." : "Cantidad"} 
                                min="1" 
                                id={`remove-${idx}`}
                                className={isMobile ? 'mobile-quantity-input' : ''}
                              />
                              <button 
                                onClick={async () => {
                                  const amount = parseInt(document.getElementById(`remove-${idx}`).value);
                                  if (!amount || amount <= 0) {
                                    setAdminMessage('❌ Cantidad inválida');
                                    return;
                                  }
                                  await removeItemFromUser(item.item_id || item.itemId, amount);
                                }}
                                className={isMobile ? 'mobile-remove-btn' : ''}
                                style={{
                                  background: '#ef4444',
                                  color: '#fff',
                                  border: 'none',
                                  borderRadius: '6px',
                                  padding: '0.5rem 1rem',
                                  cursor: 'pointer',
                                  fontSize: '0.85rem',
                                  fontWeight: '600',
                                  transition: 'all 0.3s ease'
                                }}
                                onMouseEnter={(e) => {
                                  e.target.style.background = '#dc2626';
                                  e.target.style.transform = 'scale(1.05)';
                                }}
                                onMouseLeave={(e) => {
                                  e.target.style.background = '#ef4444';
                                  e.target.style.transform = 'scale(1)';
                                }}
                              >
                                {isMobile ? 'Retirar' : 'Retirar'}
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
                  <div className={`add-items ${isMobile ? 'mobile-add-items' : ''}`}>
                    <h4 className={isMobile ? 'mobile-add-title' : ''}>➕ Agregar Items</h4>
                    <div className={`add-item-form ${isMobile ? 'mobile-add-form' : ''}`}>
                      <select 
                        id="add-item-select" 
                        className={isMobile ? 'mobile-item-select' : ''}
                      >
                        <option value="">{isMobile ? "Seleccionar..." : "Seleccionar item..."}</option>
                        {Object.entries(catalog).map(([itemId, item]) => (
                          <option key={itemId} value={itemId}>
                            {isMobile ? `${item.name} - ${item.price}€` : `${item.name} - ${item.price}€`}
                          </option>
                        ))}
                      </select>
                      <input 
                        type="number" 
                        placeholder={isMobile ? "Cant." : "Cantidad"} 
                        min="1" 
                        id="add-item-amount" 
                        className={isMobile ? 'mobile-amount-input' : ''}
                      />
                      <button 
                        onClick={async () => {
                          const itemId = document.getElementById('add-item-select').value;
                          const amount = parseInt(document.getElementById('add-item-amount').value);
                          if (!itemId || !amount || amount <= 0) {
                            setAdminMessage('❌ Selecciona un item y cantidad válida');
                            return;
                          }
                          await addItemToUser(itemId, amount);
                        }}
                        className={isMobile ? 'mobile-add-btn' : ''}
                        style={{
                          background: '#22c55e',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '0.5rem 1rem',
                          cursor: 'pointer',
                          fontSize: '0.85rem',
                          fontWeight: '600',
                          transition: 'all 0.3s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.background = '#16a34a';
                          e.target.style.transform = 'scale(1.05)';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.background = '#22c55e';
                          e.target.style.transform = 'scale(1)';
                        }}
                      >
                        {isMobile ? 'Agregar' : 'Agregar Item'}
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

      {/* Menú móvil lateral */}
      {isMobile && (
        <>
          {/* Overlay del menú móvil */}
          {showMobileMenu && (
            <div 
              className="mobile-menu-overlay"
              onClick={closeMobileMenu}
            />
          )}
          
          {/* Menú lateral móvil */}
          <div className={`mobile-menu ${showMobileMenu ? 'mobile-menu-open' : ''}`}>
            <div className="mobile-menu-header">
              <h3>Menú BlackMarket</h3>
              <button 
                className="mobile-menu-close"
                onClick={closeMobileMenu}
              >
                ✕
              </button>
            </div>
            
            <div className="mobile-menu-content">
              <div className="mobile-menu-section">
                <h4>🏪 Categorías</h4>
                <div className="mobile-menu-tabs">
                  {ITEMS.map((cat, idx) => (
                    <button
                      key={idx}
                      className={`mobile-menu-tab ${selected === idx ? 'active' : ''}`}
                      onClick={() => {
                        setSelected(idx);
                        closeMobileMenu();
                      }}
                    >
                      {cat.icon}
                      <span>{cat.category}</span>
                      {selected === idx && <span className="active-indicator">✓</span>}
                    </button>
                  ))}
                  <button
                    className={`mobile-menu-tab ${selected === ITEMS.length ? 'active' : ''}`}
                    onClick={() => {
                      setSelected(ITEMS.length);
                      closeMobileMenu();
                    }}
                  >
                    <FaChartLine />
                    <span>Bolsa Negra</span>
                    {selected === ITEMS.length && <span className="active-indicator">✓</span>}
                  </button>
                  <button
                    className={`mobile-menu-tab ${selected === ITEMS.length + 1 ? 'active' : ''}`}
                    onClick={() => {
                      setSelected(ITEMS.length + 1);
                      closeMobileMenu();
                    }}
                  >
                    <FaUserSecret />
                    <span>Mercado Usuarios</span>
                    {selected === ITEMS.length + 1 && <span className="active-indicator">✓</span>}
                  </button>
                </div>
              </div>
              
              <div className="mobile-menu-section">
                <h4>🎨 Temas</h4>
                <div className="mobile-menu-themes">
                  {Object.entries(THEMES).map(([key, theme]) => (
                    <button
                      key={key}
                      className={`mobile-menu-theme ${currentTheme === key ? 'active' : ''}`}
                      onClick={() => {
                        changeTheme(key);
                        closeMobileMenu();
                      }}
                    >
                      <span className="theme-icon">{theme.icon}</span>
                      <span className="theme-name">{theme.name}</span>
                      {currentTheme === key && <span className="active-indicator">✓</span>}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="mobile-menu-section">
                <h4>Acciones</h4>
                <div className="mobile-menu-actions">
                  {user && (
                    <button 
                      className="mobile-menu-action"
                      onClick={toggleMobileInventory}
                    >
                      🎒 Inventario
                    </button>
                  )}
                  {isAdmin && (
                    <>
                      <button 
                        className="mobile-menu-action"
                        onClick={() => {
                          setShowAdminPanel(true);
                          closeMobileMenu();
                        }}
                      >
                        ⚙️ Panel Admin
                      </button>
                      <button 
                        className="mobile-menu-action"
                        onClick={() => {
                          setShowQuickBalanceWarning(true);
                          closeMobileMenu();
                        }}
                      >
                        💸 Quick Balance
                      </button>
                    </>
                  )}
                  {user && user.id === '710112055985963090' && (
                    <button 
                      className="mobile-menu-action"
                      onClick={() => {
                        setShowStockManager(true);
                        closeMobileMenu();
                      }}
                    >
                      📦 Gestión Stock
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Estilos CSS para las animaciones del modal de advertencia */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideInScale {
          from {
            opacity: 0;
            transform: scale(0.8) translateY(-20px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        
        @keyframes warningPulse {
          0%, 100% {
            opacity: 1;
            transform: scaleX(1);
          }
          50% {
            opacity: 0.7;
            transform: scaleX(1.05);
          }
        }
        
        @keyframes warningBounce {
          from {
            transform: scale(1);
          }
          to {
            transform: scale(1.1);
          }
        }
        
        @keyframes dangerPulse {
          0%, 100% {
            box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
          }
          50% {
            box-shadow: 0 4px 20px rgba(239, 68, 68, 0.8);
          }
        }
        
        /* Estilos para el botón de refrescar stock */
        .refresh-stock-btn {
          background: linear-gradient(135deg, #22c55e, #16a34a);
          border: none;
          border-radius: 8px;
          padding: 8px 12px;
          color: white;
          font-size: 16px;
          cursor: pointer;
          transition: all 0.3s ease;
          margin-right: 8px;
          box-shadow: 0 2px 8px rgba(34, 197, 94, 0.3);
        }
        
        .refresh-stock-btn:hover {
          background: linear-gradient(135deg, #16a34a, #15803d);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(34, 197, 94, 0.4);
        }
        
        .refresh-stock-btn:active {
          transform: translateY(0);
        }
        
        /* Estilos para items agotados */
        .blackmarket-hack-item.out-of-stock {
          opacity: 0.6;
          filter: grayscale(0.3);
        }
        
        .out-of-stock-label {
          background: #ef4444;
          color: white;
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 10px;
          font-weight: 700;
          margin-left: 4px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .blackmarket-hack-buy.disabled {
          background: #6b7280 !important;
          cursor: not-allowed !important;
          opacity: 0.6;
        }
        
        .blackmarket-hack-buy.disabled:hover {
          background: #6b7280 !important;
          transform: none !important;
        }
        
        /* Estilos para el mercado de usuarios */
        .user-market-header {
          text-align: center;
          margin-bottom: 2rem;
          padding: 1rem;
          background: rgba(0, 255, 153, 0.1);
          border-radius: 12px;
          border: 1px solid rgba(0, 255, 153, 0.3);
        }
        
        .user-market-header h3 {
          color: #00ff99;
          margin-bottom: 0.5rem;
          font-size: 1.5rem;
        }
        
        .user-market-header p {
          color: #e5e7eb;
          margin-bottom: 1rem;
          opacity: 0.8;
        }
        
        .market-actions {
          display: flex;
          justify-content: center;
          gap: 1rem;
        }
        
        .refresh-sales-btn {
          background: linear-gradient(135deg, #3b82f6, #1d4ed8);
          border: none;
          border-radius: 8px;
          padding: 0.5rem 1rem;
          color: white;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .refresh-sales-btn:hover {
          background: linear-gradient(135deg, #1d4ed8, #1e40af);
          transform: translateY(-2px);
        }
        
        .user-sales-list {
          display: grid;
          gap: 1rem;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        }
        
        .user-sale-item {
          background: rgba(0, 0, 0, 0.3);
          border: 1px solid rgba(0, 255, 153, 0.2);
          border-radius: 12px;
          padding: 1rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          transition: all 0.3s ease;
        }
        
        .user-sale-item:hover {
          border-color: rgba(0, 255, 153, 0.5);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 255, 153, 0.2);
        }
        
        .sale-info h4 {
          color: #00ff99;
          margin-bottom: 0.5rem;
          font-size: 1.1rem;
        }
        
        .sale-info p {
          color: #e5e7eb;
          margin: 0.25rem 0;
          font-size: 0.9rem;
          opacity: 0.8;
        }
        
        .sale-actions {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        
        .buy-from-user-btn {
          background: linear-gradient(135deg, #22c55e, #16a34a);
          border: none;
          border-radius: 6px;
          padding: 0.5rem 1rem;
          color: white;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 0.9rem;
        }
        
        .buy-from-user-btn:hover {
          background: linear-gradient(135deg, #16a34a, #15803d);
          transform: translateY(-1px);
        }
        
        .no-sales {
          text-align: center;
          padding: 3rem;
          color: #9ca3af;
          font-size: 1.1rem;
        }
        
        /* Estilos para el botón de vender a usuario */
        .sell-to-user-btn {
          background: linear-gradient(135deg, #3b82f6, #1d4ed8);
          color: white;
          border: none;
          border-radius: 6px;
          padding: 4px 8px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .sell-to-user-btn:hover {
          background: linear-gradient(135deg, #1d4ed8, #1e40af);
          transform: translateY(-1px);
          box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
        }
        
        .sell-to-user-btn:active {
          transform: translateY(0);
        }
        
        /* Estilos para imágenes de armas */
        .item-image-container {
          position: relative;
          width: 60px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 12px;
          border-radius: 8px;
          overflow: hidden;
          background: linear-gradient(135deg, #1a1a1a, #2d2d2d);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
        }
        
        .item-image {
          width: 100%;
          height: 100%;
          object-fit: contain;
          transition: all 0.3s ease;
          filter: drop-shadow(0 0 8px rgba(255, 255, 255, 0.1));
        }
        
        .item-image:hover {
          transform: scale(1.05);
          filter: drop-shadow(0 0 12px rgba(255, 255, 255, 0.2));
        }
        
        .item-icon-fallback {
          width: 100%;
          height: 100%;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #1a1a1a, #2d2d2d);
        }
        
        /* Mejoras en animaciones de items */
        .blackmarket-hack-item {
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          transform: translateY(0);
        }
        
        .blackmarket-hack-item:hover {
          transform: translateY(-4px) scale(1.02);
          box-shadow: 0 12px 24px rgba(0, 0, 0, 0.4);
        }
        
        .blackmarket-hack-item.out-of-stock {
          opacity: 0.6;
          filter: grayscale(0.8);
        }
        
        .blackmarket-hack-item.out-of-stock:hover {
          transform: translateY(-2px) scale(1.01);
        }
        
        /* Efectos de stock mejorados */
        .stock-dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          display: inline-block;
          margin-right: 8px;
          animation: pulse 2s infinite;
        }
        
        .stock-dot.high {
          background: linear-gradient(135deg, #10b981, #059669);
          box-shadow: 0 0 8px rgba(16, 185, 129, 0.4);
        }
        
        .stock-dot.medium {
          background: linear-gradient(135deg, #f59e0b, #d97706);
          box-shadow: 0 0 8px rgba(245, 158, 11, 0.4);
        }
        
        .stock-dot.low {
          background: linear-gradient(135deg, #ef4444, #dc2626);
          box-shadow: 0 0 8px rgba(239, 68, 68, 0.4);
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        
        /* Efectos de descripción mejorados */
        .item-description {
          background: linear-gradient(135deg, rgba(0, 0, 0, 0.8), rgba(20, 20, 20, 0.9));
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 16px;
          margin-top: 12px;
          transition: all 0.3s ease;
        }
        
        .item-description p {
          line-height: 1.6;
          color: #e5e7eb;
          font-size: 14px;
          margin-bottom: 12px;
        }
        
        .item-effects-mini {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-top: 8px;
        }
        
        .effect-tag {
          background: linear-gradient(135deg, #3b82f6, #1d4ed8);
          color: white;
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 600;
          box-shadow: 0 2px 4px rgba(59, 130, 246, 0.3);
          transition: all 0.3s ease;
        }
        
        .effect-tag:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 8px rgba(59, 130, 246, 0.4);
        }
        
        /* Animaciones de botones mejoradas */
        .blackmarket-hack-buy-btn {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
        }
        
        .blackmarket-hack-buy-btn::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
          transition: left 0.5s;
        }
        
        .blackmarket-hack-buy-btn:hover::before {
          left: 100%;
        }
        
        .blackmarket-hack-buy-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
        }
        
        .blackmarket-hack-buy-btn:active {
          transform: translateY(0);
        }
        
        /* Efectos de carga mejorados */
        .loading-spinner {
          animation: spin 1s linear infinite;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top: 2px solid #ffffff;
          border-radius: 50%;
          width: 20px;
          height: 20px;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        /* Mejoras en el header del item */
        .item-header {
          display: flex;
          align-items: center;
          padding: 16px;
          background: linear-gradient(135deg, rgba(0, 0, 0, 0.3), rgba(20, 20, 20, 0.5));
          border-radius: 12px;
          transition: all 0.3s ease;
        }
        
        .item-header:hover {
          background: linear-gradient(135deg, rgba(0, 0, 0, 0.4), rgba(30, 30, 30, 0.6));
        }
        
        .item-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        
        .blackmarket-hack-item-name {
          font-size: 16px;
          font-weight: 700;
          color: #ffffff;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
        }
        
        .blackmarket-hack-item-price {
          font-size: 14px;
          color: #10b981;
          font-weight: 600;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
        }
        
        .item-stock {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          font-weight: 600;
        }
        
        .stock-text {
          color: #e5e7eb;
          min-width: 20px;
          text-align: center;
        }
        
        .out-of-stock-label {
          background: linear-gradient(135deg, #ef4444, #dc2626);
          color: white;
          padding: 2px 6px;
          border-radius: 8px;
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          animation: pulse 1.5s infinite;
        }
        
        /* Estilos para búsqueda global */
        .search-indicator {
          color: #3b82f6;
          font-weight: 600;
          font-size: 0.9em;
        }
        
        .item-section-badge {
          background: linear-gradient(135deg, #6366f1, #4f46e5);
          color: white;
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 10px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-top: 4px;
          display: inline-block;
          box-shadow: 0 2px 4px rgba(99, 102, 241, 0.3);
        }
        
        .filtered-indicator {
          color: #f59e0b;
          font-weight: 600;
          font-size: 0.9em;
        }
        
        /* Estilos para sistema de calidad */
        .blackmarket-hack-item.basic {
          border-left: 4px solid #6b7280;
          background: linear-gradient(135deg, rgba(107, 114, 128, 0.1), rgba(75, 85, 99, 0.05));
        }
        
        .blackmarket-hack-item.standard {
          border-left: 4px solid #10b981;
          background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(5, 150, 105, 0.05));
        }
        
        .blackmarket-hack-item.advanced {
          border-left: 4px solid #3b82f6;
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(29, 78, 216, 0.05));
        }
        
        .blackmarket-hack-item.elite {
          border-left: 4px solid #8b5cf6;
          background: linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(124, 58, 237, 0.05));
        }
        
        .blackmarket-hack-item.legendary {
          border-left: 4px solid #f59e0b;
          background: linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(217, 119, 6, 0.05));
          box-shadow: 0 0 20px rgba(245, 158, 11, 0.2);
        }
      `}</style>
    </div>
    );
  } catch (error) {
    console.error('[BlackMarket] ❌ Error en renderizado:', error);
    return (
      <div className="blackmarket-hack-bg">
        <DiscordUserBar />
        <div className="blackmarket-hack-header">
          <FaLock size={32} style={{marginRight:12}} />
          <span>BLACKMARKET SPAINRP</span>
        </div>
        <div style={{textAlign:'center',marginTop:'120px',color:'#fff'}}>
          <h2>Error cargando el BlackMarket</h2>
          <p>Por favor, recarga la página o contacta al administrador.</p>
          <button
            style={{background:'#7289da',color:'#fff',borderRadius:8,padding:'0.7rem 1.5rem',fontWeight:700,textDecoration:'none',fontSize:'1.2rem',border:'none',cursor:'pointer'}}
            onClick={() => window.location.reload()}
          >
            Recargar página
          </button>
        </div>
        <div className="blackmarket-hack-footer">
          <FaSkull size={18} style={{marginRight:6}} />
          <span>Error técnico - Contacta al administrador</span>
        </div>
    </div>
  );
  }
}