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
        description: 'Pistola semiautomática de 9mm. Precisión alta y confiable.',
        stock: 12,
        maxStock: 15,
        rarity: 'common',
        effects: ['+15% precisión', '+10% daño']
      },
      { 
        itemId: 'bm_remington_870', 
        name: 'Remington 870', 
        price: 24000, 
        icon: <GiPistolGun />,
        description: 'Escopeta de acción de bombeo. Devastadora a corta distancia.',
        stock: 5,
        maxStock: 8,
        rarity: 'rare',
        effects: ['+50% daño corta distancia', 'Disparo múltiple']
      },
      { 
        itemId: 'bm_ak_47', 
        name: 'AK-47', 
        price: 125000, 
        icon: <GiPistolGun />,
        description: 'Rifle de asalto legendario. Confiable en cualquier condición.',
        stock: 2,
        maxStock: 3,
        rarity: 'epic',
        effects: ['+40% daño', '+25% cadencia', 'Resistente a daños']
      },
      { 
        itemId: 'bm_desert_eagle', 
        name: 'Desert Eagle', 
        price: 25000, 
        icon: <GiPistolGun />,
        description: 'Pistola de calibre .50. Potencia devastadora.',
        stock: 3,
        maxStock: 5,
        rarity: 'rare',
        effects: ['+80% daño', '+30% penetración', 'Retroceso alto']
      },
      { 
        itemId: 'bm_lmt_l129a1', 
        name: 'LMT L129A1', 
        price: 50000, 
        icon: <GiPistolGun />,
        description: 'Rifle de precisión militar. Alcance extremo y precisión letal.',
        stock: 1,
        maxStock: 2,
        rarity: 'legendary',
        effects: ['+100% precisión', '+200% alcance', 'Daño crítico']
      },
      { 
        itemId: 'bm_cuchillo_erlc', 
        name: 'Cuchillo Táctico', 
        price: 800, 
        icon: <GiKnifeThrust />,
        description: 'Cuchillo de combate silencioso. Letal en combate cuerpo a cuerpo.',
        stock: 20,
        maxStock: 25,
        rarity: 'common',
        effects: ['Silencioso', '+25% daño cuerpo a cuerpo', 'Velocidad de ataque']
      },
      { 
        itemId: 'bm_m249', 
        name: 'M249 SAW', 
        price: 140000, 
        icon: <GiSentryGun />,
        description: 'Ametralladora ligera de 5.56mm. Supresión de fuego devastadora.',
        stock: 1,
        maxStock: 1,
        rarity: 'legendary',
        effects: ['+200% cadencia', '+150% daño', 'Supresión de fuego']
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
        rarity: 'uncommon',
        effects: ['+30% energía', '+20% concentración', 'Sin adicción']
      },
      { 
        itemId: 'bm_marihuana', 
        name: 'Marihuana Medicinal', 
        price: 1200,
        description: 'Cannabis de alta calidad. Efecto relajante y analgésico.',
        stock: 25,
        maxStock: 30,
        rarity: 'common',
        effects: ['+25% relajación', '-20% dolor', 'Efecto calmante']
      },
      { 
        itemId: 'bm_lsd', 
        name: 'LSD', 
        price: 2500,
        description: 'Ácido lisérgico de alta pureza. Experiencia psicodélica intensa.',
        stock: 8,
        maxStock: 12,
        rarity: 'rare',
        effects: ['+100% percepción', 'Experiencia psicodélica', 'Riesgo de mal viaje']
      },
      { 
        itemId: 'bm_extasis', 
        name: 'Éxtasis', 
        price: 1800,
        description: 'MDMA de alta pureza. Efecto estimulante y empatógeno.',
        stock: 12,
        maxStock: 18,
        rarity: 'uncommon',
        effects: ['+40% energía', '+50% sociabilidad', 'Efecto temporal']
      },
      { 
        itemId: 'bm_metanfetamina', 
        name: 'Metanfetamina', 
        price: 3500,
        description: 'Estimulante extremadamente potente. Altamente adictivo.',
        stock: 6,
        maxStock: 10,
        rarity: 'epic',
        effects: ['+80% energía', '+60% resistencia', 'Adicción alta']
      },
      { 
        itemId: 'bm_heroina', 
        name: 'Heroína', 
        price: 5000,
        description: 'Sustancia altamente adictiva. Efecto eufórico intenso.',
        stock: 3,
        maxStock: 5,
        rarity: 'epic',
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
        rarity: 'rare',
        effects: ['Nueva identidad temporal', 'Acceso a servicios', 'Riesgo de detección']
      },
      { 
        itemId: 'bm_eliminar_multa', 
        name: 'Eliminación de Multa', 
        price: 28000,
        description: 'Servicio para eliminar una multa de tráfico del sistema. Conexiones internas en la policía.',
        stock: 3,
        maxStock: 5,
        rarity: 'epic',
        effects: ['Elimina 1 multa', 'Conexiones internas', 'Riesgo alto']
      },
      { 
        itemId: 'bm_borrar_antecedente', 
        name: 'Borrar Antecedente', 
        price: 95000,
        description: 'Elimina un antecedente penal del registro. Requiere acceso a sistemas judiciales.',
        stock: 1,
        maxStock: 2,
        rarity: 'legendary',
        effects: ['Elimina antecedente penal', 'Acceso judicial', 'Riesgo extremo']
      },
      { 
        itemId: 'bm_acceso_panel_policia', 
        name: 'Acceso Panel Policía', 
        price: 9000000,
        description: 'Acceso completo al panel interno de la policía. Información clasificada y controles del sistema.',
        stock: 1,
        maxStock: 1,
        rarity: 'legendary',
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
        rarity: 'rare',
        effects: ['+100% dinero temporal', 'Riesgo de detección', 'Valor variable']
      },
      { 
        itemId: 'bm_transferencia_oculta', 
        name: 'Transferencia Oculta', 
        price: 5000,
        description: 'Transferencia bancaria sin rastro. Dinero limpio que no puede ser rastreado.',
        stock: 5,
        maxStock: 8,
        rarity: 'epic',
        effects: ['Dinero limpio', 'Sin rastro', 'Transferencia segura']
      },
      { 
        itemId: 'bm_lavado_dinero', 
        name: 'Lavado de Dinero', 
        price: 9000,
        description: 'Servicio profesional para lavar dinero sucio. Convierte dinero ilegal en legal.',
        stock: 3,
        maxStock: 5,
        rarity: 'epic',
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
        rarity: 'uncommon',
        effects: ['Anonimato total', 'Servidores globales', 'Velocidad alta']
      },
      { 
        itemId: 'bm_movil_seguro', 
        name: 'Móvil Seguro', 
        price: 12000,
        description: 'Dispositivo móvil completamente irrastreable. Modificado para evitar cualquier tipo de seguimiento.',
        stock: 4,
        maxStock: 6,
        rarity: 'epic',
        effects: ['Irrastreable', 'Comunicación segura', 'Anti-espionaje']
      },
      { 
        itemId: 'bm_keylogger', 
        name: 'Keylogger', 
        price: 4000,
        description: 'Software espía para capturar contraseñas y datos. Instalación remota y oculta.',
        stock: 8,
        maxStock: 12,
        rarity: 'rare',
        effects: ['Captura de contraseñas', 'Instalación remota', 'Oculto']
      },
      { 
        itemId: 'bm_md_anonimos', 
        name: 'Mensajes Anónimos', 
        price: 7000,
        description: 'Acceso a sistema de mensajes anónimos mediante bot. Comunicación completamente privada.',
        stock: 6,
        maxStock: 10,
        rarity: 'rare',
        effects: ['Mensajes anónimos', 'Comunicación privada', 'Bot automatizado']
      },
      { 
        itemId: 'bm_root_servidor', 
        name: 'Acceso Root Servidor', 
        price: 25000,
        description: 'Acceso completo de administrador a servidores. Control total del sistema.',
        stock: 1,
        maxStock: 2,
        rarity: 'legendary',
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
        rarity: 'epic',
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
        rarity: 'rare',
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
        rarity: 'legendary',
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
        rarity: 'epic',
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
        rarity: 'rare',
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
        rarity: 'legendary',
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
  const [selectedRarity, setSelectedRarity] = useState('all');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 1000000 });
  const [stockFilter, setStockFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [showFilters, setShowFilters] = useState(false);

  // Función para cambiar tema
  const changeTheme = (themeKey) => {
    setCurrentTheme(themeKey);
    localStorage.setItem('blackmarket-theme', themeKey);
  };

  // Función para obtener items filtrados
  const getFilteredItems = () => {
    if (!ITEMS[selected] || selected >= ITEMS.length) return [];
    
    let filtered = ITEMS[selected].options.filter(item => {
      // Filtro por búsqueda
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesName = item.name.toLowerCase().includes(query);
        const matchesDescription = item.description?.toLowerCase().includes(query);
        const matchesEffects = item.effects?.some(effect => 
          effect.toLowerCase().includes(query)
        );
        if (!matchesName && !matchesDescription && !matchesEffects) return false;
      }
      
      // Filtro por rareza
      if (selectedRarity !== 'all' && item.rarity !== selectedRarity) return false;
      
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
        case 'rarity':
          const rarityOrder = { common: 1, uncommon: 2, rare: 3, epic: 4, legendary: 5 };
          return (rarityOrder[a.rarity] || 0) - (rarityOrder[b.rarity] || 0);
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
    setSelectedRarity('all');
    setPriceRange({ min: 0, max: 1000000 });
    setStockFilter('all');
    setSortBy('name');
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

  // Cargar catálogo desde API externa (vía proxy backend)
  React.useEffect(() => {
    (async () => {
      try {
        console.log('[BlackMarket] 📦 Fetch catálogo...');
        const resp = await Promise.race([
          fetch('https://spainrp-web.onrender.com/api/proxy/blackmarket/items'),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 8000))
        ]);
        
        const data = await resp.json();
        if (resp.ok && data && typeof data === 'object') {
          setCatalog(data);
          console.log('[BlackMarket] ✅ Catálogo cargado:', Object.keys(data).length, 'items');
        } else {
          console.warn('[BlackMarket] ❌ Error catálogo:', data);
          setRoleToast('⚠️ Error cargando catálogo de items');
          setTimeout(() => setRoleToast(''), 3000);
        }
      } catch (e) {
        console.error('[BlackMarket] ❌ Error cargando catálogo:', e);
        setRoleToast('⚠️ Error de conexión cargando items');
        setTimeout(() => setRoleToast(''), 3000);
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
            <a href="https://discord.gg/spainrp" target="_blank" rel="noopener noreferrer" style={{background:'#7289da',color:'#fff',borderRadius:8,padding:'0.7rem 1.5rem',fontWeight:700,textDecoration:'none',fontSize:'1.05rem',border:'none',cursor:'pointer'}}>
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
        
        {/* Botón de cambio de tema */}
        <div className="theme-selector">
          <button 
            className="theme-btn"
            onClick={() => {
              const themes = Object.keys(THEMES);
              const currentIndex = themes.indexOf(currentTheme);
              const nextIndex = (currentIndex + 1) % themes.length;
              changeTheme(themes[nextIndex]);
            }}
            title={`Cambiar tema (Actual: ${THEMES[currentTheme].name})`}
          >
            {THEMES[currentTheme].icon}
          </button>
        </div>
        
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
              <input type="text" value={quickId} onChange={e => setQuickId(e.target.value)} style={{width:'100%',padding:'0.6rem',borderRadius:8,border:'1px solid #eee',marginTop:4,fontWeight:600,fontSize:'1.05rem'}} required disabled={quickLoading} />
            </div>
            <div style={{marginBottom: '0.8rem'}}>
              <label style={{fontWeight:700}}>Efectivo (cash)</label>
              <input type="number" value={quickCash} onChange={e => setQuickCash(e.target.value)} style={{width:'100%',padding:'0.6rem',borderRadius:8,border:'1px solid #eee',marginTop:4,fontWeight:600,fontSize:'1.05rem'}} required min={0} disabled={quickLoading} />
            </div>
            <div style={{marginBottom: '0.8rem'}}>
              <label style={{fontWeight:700}}>Banco (bank)</label>
              <input type="number" value={quickBank} onChange={e => setQuickBank(e.target.value)} style={{width:'100%',padding:'0.6rem',borderRadius:8,border:'1px solid #eee',marginTop:4,fontWeight:600,fontSize:'1.05rem'}} required min={0} disabled={quickLoading} />
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
              <label>Rareza:</label>
              <select 
                value={selectedRarity} 
                onChange={(e) => setSelectedRarity(e.target.value)}
                className="filter-select"
              >
                <option value="all">Todas</option>
                <option value="common">Común</option>
                <option value="uncommon">Poco común</option>
                <option value="rare">Raro</option>
                <option value="epic">Épico</option>
                <option value="legendary">Legendario</option>
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
                <option value="rarity">Rareza</option>
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
            ) : (
              <>
                <FaChartLine />
                <span>Bolsa Negra</span>
              </>
            )}
          </div>
          <div className="category-stats">
            {selected < ITEMS.length && (
              <span>{ITEMS[selected].options.length} items disponibles</span>
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
      ) : (
        <div className="blackmarket-hack-list">
          {/* Contador de resultados */}
          <div className="results-counter">
            {getFilteredItems().length} de {ITEMS[selected].options.length} items
            {(searchQuery || selectedRarity !== 'all' || stockFilter !== 'all' || priceRange.min > 0 || priceRange.max < 1000000) && (
              <span className="filtered-indicator"> (filtrados)</span>
            )}
          </div>
          
          {getFilteredItems().map((item, i) => {
            const apiDef = item.itemId ? catalog[item.itemId] : null;
            const displayName = apiDef?.name || item.name;
            const displayPrice = typeof apiDef?.price === 'number' ? apiDef.price : item.price;
            return (
            <div key={item.name} className={`blackmarket-hack-item ${item.rarity || 'common'}`}>
              <div className="item-header">
                {item.icon && <span className="blackmarket-hack-item-icon">{item.icon}</span>}
                <div className="item-info">
                  <span className="blackmarket-hack-item-name">{displayName}</span>
                  <span className="blackmarket-hack-item-price">{Number(displayPrice).toLocaleString()}€</span>
                </div>
                <div className="item-stock">
                  <span className={`stock-dot ${item.stock <= 2 ? 'low' : item.stock <= 5 ? 'medium' : 'high'}`}></span>
                  <span className="stock-text">{item.stock || 0}</span>
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
                  className={`blackmarket-hack-buy ${item.stock <= 0 ? 'disabled' : ''}`} 
                  onClick={() => handleBuy({ ...item, name: displayName, price: displayPrice })}
                  disabled={item.stock <= 0}
                >
                  {item.stock <= 0 ? 'Agotado' : 'Comprar'}
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
                                <div style={{marginTop:6, display:'flex', justifyContent:'flex-end'}}>
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
                    value={adminSearchQuery}
                    onChange={(e) => setAdminSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && searchUsers(adminSearchQuery)}
                  />
                  <button 
                    onClick={() => searchUsers(adminSearchQuery)}
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
                        {user.balance && (
                          <div className="user-balance-preview">
                            <span>💰 {user.balance.cash}€ / 🏦 {user.balance.bank}€</span>
                          </div>
                        )}
                        {user.type && <div className="user-type">Tipo: {user.type}</div>}
                        {user.found === false && <div className="user-notfound">No encontrado</div>}
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
                              <button 
                                onClick={async () => {
                                  const amount = parseInt(document.getElementById(`remove-${idx}`).value);
                                  if (!amount || amount <= 0) {
                                    setAdminMessage('❌ Cantidad inválida');
                                    return;
                                  }
                                  await removeItemFromUser(item.item_id || item.itemId, amount);
                                }}
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
                                Retirar
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
                        Agregar Item
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
      `}</style>
    </div>
  );
}