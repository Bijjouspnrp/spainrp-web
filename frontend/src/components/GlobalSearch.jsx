import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { FaSearch, FaNewspaper, FaHome, FaAppStore, FaShieldAlt, FaChevronRight, FaKeyboard } from 'react-icons/fa';

// Configuración de enlaces y categorías
const SEARCH_CATEGORIES = {
  navigation: {
    title: 'Navegación',
    icon: <FaHome />,
    color: '#7289da',
    items: [
      { label: 'Inicio', href: '/#home', description: 'Página principal de SpainRP' },
      { label: 'Características', href: '/#features', description: 'Funciones y servicios' },
      { label: 'Staff', href: '/#staff', description: 'Equipo de moderación' },
      { label: 'Discord', href: '/#discord', description: 'Servidor de Discord' },
      { label: 'Sobre Nosotros', href: '/#about', description: 'Información del servidor' }
    ]
  },
  apps: {
    title: 'Apps & Servicios',
    icon: <FaAppStore />,
    color: '#FFD700',
    items: [
      { label: 'TinderRP', href: '/apps/tinder', description: 'App de citas virtual' },
      { label: 'BlackMarket', href: '/blackmarket', description: 'Marketplace virtual' },
      { label: 'StockMarket', href: '/stockmarket', description: 'Trading de acciones' },
      { label: 'Minijuegos', href: '/apps/minijuegos', description: 'Juegos y competencias' },
      { label: 'Panel de Usuario', href: '/panel', description: 'Gestión de perfil' }
    ]
  },
  content: {
    title: 'Contenido',
    icon: <FaNewspaper />,
    color: '#e74c3c',
    items: [
      { label: 'Noticias RP', href: '/news', description: 'Últimas noticias del servidor' },
      { label: 'Reglas', href: '/rules', description: 'Normas y regulaciones' },
      { label: 'Términos y Condiciones', href: '/terms', description: 'Términos de uso' },
      { label: 'Política de Cookies', href: '/cookies', description: 'Gestión de cookies' },
      { label: 'Soporte', href: '/support', description: 'Ayuda y soporte técnico' }
    ]
  },
  admin: {
    title: 'Administración',
    icon: <FaShieldAlt />,
    color: '#9b59b6',
    items: [
      { label: 'Panel de Admin', href: '/admin', description: 'Panel de administración' },
      { label: 'Moderador Dashboard', href: '/moderator-dashboard', description: 'Panel de moderación' },
      { label: 'Logs del Sistema', href: '/logs', description: 'Registros de actividad' }
    ]
  }
};

// Atajos de teclado
const KEYBOARD_SHORTCUTS = [
  { key: 'Ctrl+K', description: 'Abrir búsqueda' },
  { key: 'Esc', description: 'Cerrar búsqueda' },
  { key: '↑↓', description: 'Navegar resultados' },
  { key: 'Enter', description: 'Seleccionar resultado' },
  { key: 'Tab', description: 'Cambiar categoría' }
];

export default function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [recentSearches, setRecentSearches] = useState([]);
  const [showShortcuts, setShowShortcuts] = useState(false);
  
  const dialogRef = useRef(null);
  const inputRef = useRef(null);
  const resultsRef = useRef(null);

  // Cargar búsquedas recientes del localStorage
  useEffect(() => {
    const saved = localStorage.getItem('spainrp_recent_searches');
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch (e) {
        console.warn('Error cargando búsquedas recientes:', e);
      }
    }
  }, []);

  // Guardar búsquedas recientes
  const saveRecentSearch = useCallback((searchTerm) => {
    if (!searchTerm.trim()) return;
    
    const newRecent = [searchTerm, ...recentSearches.filter(s => s !== searchTerm)].slice(0, 5);
    setRecentSearches(newRecent);
    localStorage.setItem('spainrp_recent_searches', JSON.stringify(newRecent));
  }, [recentSearches]);

  // Manejo de atajos de teclado
  useEffect(() => {
    const onKey = (e) => {
      const isMac = navigator.platform.toUpperCase().includes('MAC');
      const cmd = isMac ? e.metaKey : e.ctrlKey;
      
      if (cmd && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen(true);
      } else if (e.key === 'Escape') {
        setOpen(false);
        setShowShortcuts(false);
      } else if (open) {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          setSelectedIndex(prev => Math.min(prev + 1, filteredResults.length - 1));
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          setSelectedIndex(prev => Math.max(prev - 1, 0));
        } else if (e.key === 'Enter') {
          e.preventDefault();
          if (filteredResults[selectedIndex]) {
            handleResultClick(filteredResults[selectedIndex]);
          }
        } else if (e.key === 'Tab') {
          e.preventDefault();
          const categories = Object.keys(SEARCH_CATEGORIES);
          const currentIndex = categories.indexOf(selectedCategory);
          const nextIndex = (currentIndex + 1) % categories.length;
          setSelectedCategory(categories[nextIndex]);
        } else if (e.key === '?') {
          e.preventDefault();
          setShowShortcuts(!showShortcuts);
        }
      }
    };
    
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, selectedIndex, selectedCategory, showShortcuts]);

  // Focus en input cuando se abre
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 0);
    } else {
      setQuery('');
      setSelectedIndex(0);
      setSelectedCategory('all');
    }
  }, [open]);

  // Filtrar resultados basado en query y categoría
  const filteredResults = useMemo(() => {
    if (!query.trim()) {
      // Mostrar búsquedas recientes si no hay query
      return recentSearches.map(term => ({
        label: term,
        href: '#',
        description: 'Búsqueda reciente',
        category: 'recent',
        isRecent: true
      }));
    }

    const allItems = [];
    Object.entries(SEARCH_CATEGORIES).forEach(([categoryKey, category]) => {
      if (selectedCategory === 'all' || selectedCategory === categoryKey) {
        category.items.forEach(item => {
          if (item.label.toLowerCase().includes(query.toLowerCase()) ||
              item.description.toLowerCase().includes(query.toLowerCase())) {
            allItems.push({
              ...item,
              category: categoryKey,
              categoryTitle: category.title,
              categoryColor: category.color,
              categoryIcon: category.icon
            });
          }
        });
      }
    });

    return allItems;
  }, [query, selectedCategory, recentSearches]);

  // Manejar clic en resultado
  const handleResultClick = useCallback((result) => {
    if (result.isRecent) {
      setQuery(result.label);
      return;
    }
    
    saveRecentSearch(result.label);
    setOpen(false);
    
    if (result.href.startsWith('#')) {
      // Navegación por secciones
      const sectionId = result.href.replace('#', '');
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      // Navegación a páginas
      window.location.href = result.href;
    }
  }, [saveRecentSearch]);

  // Renderizar resultado individual
  const renderResult = (result, index) => {
    const isSelected = index === selectedIndex;
    const isRecent = result.isRecent;
    
    return (
      <li key={`${result.category}-${index}`}>
        <a
          href={result.href}
          onClick={(e) => {
            e.preventDefault();
            handleResultClick(result);
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '12px 16px',
            borderRadius: 8,
            color: isSelected ? '#fff' : '#e5e7eb',
            textDecoration: 'none',
            background: isSelected ? 'rgba(114, 137, 218, 0.2)' : 'transparent',
            border: isSelected ? '1px solid rgba(114, 137, 218, 0.3)' : '1px solid transparent',
            transition: 'all 0.2s ease',
            cursor: 'pointer'
          }}
          onMouseEnter={() => setSelectedIndex(index)}
        >
          <div style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: isRecent ? '#9ca3af' : (result.categoryColor || '#7289da'),
            flexShrink: 0
          }} />
          
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginBottom: 4
            }}>
              {result.categoryIcon && (
                <span style={{ color: result.categoryColor, fontSize: 14 }}>
                  {result.categoryIcon}
                </span>
              )}
              <span style={{
                fontWeight: 600,
                fontSize: 15,
                color: isSelected ? '#fff' : '#e5e7eb'
              }}>
                {result.label}
              </span>
              {isRecent && (
                <span style={{
                  background: 'rgba(156, 163, 175, 0.2)',
                  color: '#9ca3af',
                  fontSize: 10,
                  padding: '2px 6px',
                  borderRadius: 4,
                  fontWeight: 500
                }}>
                  RECIENTE
                </span>
              )}
            </div>
            
            <div style={{
              fontSize: 13,
              color: isSelected ? '#d1d5db' : '#9ca3af',
              lineHeight: 1.4
            }}>
              {result.description}
            </div>
            
            {result.categoryTitle && (
              <div style={{
                fontSize: 11,
                color: result.categoryColor,
                fontWeight: 500,
                marginTop: 4
              }}>
                {result.categoryTitle}
              </div>
            )}
          </div>
          
          <FaChevronRight size={12} style={{ color: '#6b7280' }} />
        </a>
      </li>
    );
  };

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Búsqueda global"
      ref={dialogRef}
      onClick={(e) => {
        if (e.target === dialogRef.current) {
          setOpen(false);
          setShowShortcuts(false);
        }
      }}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.75)',
        zIndex: 2000,
        display: 'grid',
        placeItems: 'center',
        padding: '1rem',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)'
      }}
    >
      <div style={{
        width: 'min(800px, 95vw)',
        maxHeight: '80vh',
        background: '#111827',
        color: '#fff',
        border: '1px solid #374151',
        borderRadius: 16,
        boxShadow: '0 25px 80px rgba(0, 0, 0, 0.5)',
        overflow: 'hidden',
        animation: 'slideInUp 0.3s ease-out'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '16px 20px',
          borderBottom: '1px solid #1f2937',
          background: 'linear-gradient(135deg, #1f2937 0%, #111827 100%)'
        }}>
          <FaSearch size={18} style={{ color: '#7289da' }} />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar páginas, secciones, apps, reglas..."
            aria-label="Buscar" 
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: '#fff',
              fontSize: 16,
              fontWeight: 500
            }}
          />
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button
              onClick={() => setShowShortcuts(!showShortcuts)}
              style={{
                background: 'rgba(114, 137, 218, 0.1)',
                border: '1px solid rgba(114, 137, 218, 0.3)',
                color: '#7289da',
                padding: '6px 10px',
                borderRadius: 6,
                fontSize: 11,
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'rgba(114, 137, 218, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'rgba(114, 137, 218, 0.1)';
              }}
            >
              <FaKeyboard size={12} />
              ?
            </button>
            <span style={{
              color: '#9ca3af',
              fontSize: 12,
              background: '#1f2937',
              border: '1px solid #374151',
              padding: '4px 8px',
              borderRadius: 6,
              fontWeight: 500
            }}>
              Esc
            </span>
          </div>
        </div>

        {/* Categorías */}
        <div style={{
          display: 'flex',
          gap: 8,
          padding: '12px 20px',
          borderBottom: '1px solid #1f2937',
          background: '#1f2937',
          overflowX: 'auto',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none'
        }}>
          <button
            onClick={() => setSelectedCategory('all')}
            style={{
              background: selectedCategory === 'all' ? '#7289da' : 'rgba(114, 137, 218, 0.1)',
              border: '1px solid rgba(114, 137, 218, 0.3)',
              color: selectedCategory === 'all' ? '#fff' : '#7289da',
              padding: '6px 12px',
              borderRadius: 20,
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}
          >
            <FaSearch size={10} />
            Todas
          </button>
          
          {Object.entries(SEARCH_CATEGORIES).map(([key, category]) => (
            <button
              key={key}
              onClick={() => setSelectedCategory(key)}
              style={{
                background: selectedCategory === key ? category.color : 'rgba(255, 255, 255, 0.1)',
                border: `1px solid ${selectedCategory === key ? category.color : 'rgba(255, 255, 255, 0.2)'}`,
                color: selectedCategory === key ? '#fff' : '#e5e7eb',
                padding: '6px 12px',
                borderRadius: 20,
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: 6
              }}
            >
              {category.icon}
              {category.title}
            </button>
          ))}
        </div>

        {/* Resultados */}
        <div style={{ maxHeight: 400, overflow: 'auto' }}>
          {filteredResults.length === 0 ? (
            <div style={{
              padding: '32px 20px',
              textAlign: 'center',
              color: '#9ca3af'
            }}>
              <FaSearch size={32} style={{ marginBottom: 12, opacity: 0.5 }} />
              <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>
                {query.trim() ? 'Sin resultados' : 'Comienza a escribir para buscar'}
              </div>
              <div style={{ fontSize: 14, opacity: 0.7 }}>
                {query.trim() 
                  ? `No se encontraron resultados para "${query}"`
                  : 'Busca páginas, secciones, apps y más'
                }
              </div>
            </div>
          ) : (
            <ul style={{
              listStyle: 'none',
              margin: 0,
              padding: 8
            }}>
              {filteredResults.map((result, index) => renderResult(result, index))}
            </ul>
          )}
        </div>

        {/* Footer con atajos */}
        <div style={{
          padding: '12px 20px',
          borderTop: '1px solid #1f2937',
          background: '#1f2937',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: 12,
          color: '#9ca3af'
        }}>
          <div style={{ display: 'flex', gap: 16 }}>
            <span>↑↓ Navegar</span>
            <span>Enter Seleccionar</span>
            <span>Tab Categorías</span>
          </div>
          <div>
            {filteredResults.length} resultado{filteredResults.length !== 1 ? 's' : ''}
          </div>
        </div>
      </div>

      {/* Modal de atajos */}
      {showShortcuts && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          zIndex: 2001,
          display: 'grid',
          placeItems: 'center',
          padding: '2rem'
        }}>
          <div style={{
            background: '#111827',
            border: '1px solid #374151',
            borderRadius: 12,
            padding: '24px',
            maxWidth: '500px',
            width: '100%',
            boxShadow: '0 25px 80px rgba(0, 0, 0, 0.5)'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 20
            }}>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>
                Atajos de Teclado
              </h3>
              <button
                onClick={() => setShowShortcuts(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#9ca3af',
                  cursor: 'pointer',
                  fontSize: 20,
                  padding: 4
                }}
              >
                ×
              </button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {KEYBOARD_SHORTCUTS.map((shortcut, index) => (
                <div key={index} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '8px 0'
                }}>
                  <span style={{ color: '#e5e7eb' }}>{shortcut.description}</span>
                  <span style={{
                    background: '#374151',
                    color: '#fff',
                    padding: '4px 8px',
                    borderRadius: 4,
                    fontSize: 11,
                    fontWeight: 600,
                    fontFamily: 'monospace'
                  }}>
                    {shortcut.key}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Estilos CSS */}
      <style>{`
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        
        /* Scrollbar personalizado */
        div::-webkit-scrollbar {
          width: 4px;
        }
        
        div::-webkit-scrollbar-track {
          background: transparent;
        }
        
        div::-webkit-scrollbar-thumb {
          background: rgba(114, 137, 218, 0.3);
          border-radius: 2px;
        }
        
        div::-webkit-scrollbar-thumb:hover {
          background: rgba(114, 137, 218, 0.5);
        }
      `}</style>
    </div>
  );
}


