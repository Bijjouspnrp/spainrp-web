import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FaSearch, FaTimes, FaHistory, FaTrendingUp, FaClock } from 'react-icons/fa';
import { apiUrl } from '../utils/api';
import './GlobalSearch.css';

const GlobalSearch = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [searchHistory, setSearchHistory] = useState([]);
  const [trending, setTrending] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  
  const searchRef = useRef(null);
  const inputRef = useRef(null);
  const debounceRef = useRef(null);

  // Cargar historial y trending al montar
  useEffect(() => {
    loadSearchHistory();
    loadTrendingSearches();
  }, []);

  // Cargar historial de búsquedas desde localStorage
  const loadSearchHistory = () => {
    try {
      const history = JSON.parse(localStorage.getItem('searchHistory') || '[]');
      setSearchHistory(history.slice(0, 10)); // Últimas 10 búsquedas
    } catch (error) {
      console.error('Error loading search history:', error);
    }
  };

  // Cargar búsquedas trending
  const loadTrendingSearches = async () => {
    try {
      const response = await fetch(apiUrl('/api/analytics/metrics'));
      const data = await response.json();
      if (data.content?.popularSearches) {
        setTrending(data.content.popularSearches.slice(0, 5));
      }
    } catch (error) {
      console.error('Error loading trending searches:', error);
    }
  };

  // Guardar búsqueda en historial
  const saveToHistory = (searchTerm) => {
    if (!searchTerm.trim()) return;
    
    try {
      const history = JSON.parse(localStorage.getItem('searchHistory') || '[]');
      const newHistory = [searchTerm, ...history.filter(item => item !== searchTerm)].slice(0, 20);
      localStorage.setItem('searchHistory', JSON.stringify(newHistory));
      setSearchHistory(newHistory.slice(0, 10));
    } catch (error) {
      console.error('Error saving search history:', error);
    }
  };

  // Búsqueda con debounce
  const debouncedSearch = useCallback((searchTerm) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    
    debounceRef.current = setTimeout(async () => {
      if (searchTerm.trim().length < 2) {
        setResults([]);
        setSuggestions([]);
        return;
      }

      setLoading(true);
      
      try {
        // Buscar en diferentes categorías
        const searchPromises = [
          searchPages(searchTerm),
          searchUsers(searchTerm),
          searchContent(searchTerm)
        ];
        
        const [pages, users, content] = await Promise.all(searchPromises);
        
        const allResults = [
          ...pages.map(item => ({ ...item, type: 'page' })),
          ...users.map(item => ({ ...item, type: 'user' })),
          ...content.map(item => ({ ...item, type: 'content' }))
        ];
        
        setResults(allResults);
        
        // Generar sugerencias basadas en resultados
        generateSuggestions(searchTerm, allResults);
        
        // Trackear búsqueda para analytics
        trackSearch(searchTerm);
        
      } catch (error) {
        console.error('Error searching:', error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);
  }, []);

  // Buscar páginas
  const searchPages = async (query) => {
    const pages = [
      { id: 'home', title: 'Inicio', url: '/', description: 'Página principal de SpainRP' },
      { id: 'blackmarket', title: 'BlackMarket', url: '/blackmarket', description: 'Mercado negro de items' },
      { id: 'news', title: 'Noticias', url: '/news', description: 'Últimas noticias del servidor' },
      { id: 'stockmarket', title: 'Bolsa', url: '/stockmarket', description: 'Sistema de bolsa de valores' },
      { id: 'apps', title: 'Aplicaciones', url: '/apps', description: 'Aplicaciones del servidor' },
      { id: 'rules', title: 'Reglas', url: '/rules', description: 'Reglas del servidor' },
      { id: 'support', title: 'Soporte', url: '/support', description: 'Centro de soporte' }
    ];
    
    return pages.filter(page => 
      page.title.toLowerCase().includes(query.toLowerCase()) ||
      page.description.toLowerCase().includes(query.toLowerCase())
    );
  };

  // Buscar usuarios (simulado)
  const searchUsers = async (query) => {
    // En una implementación real, esto haría una llamada a la API
    return [
      { id: 'user1', title: 'Usuario Ejemplo', description: 'Miembro del servidor', avatar: null }
    ].filter(user => 
      user.title.toLowerCase().includes(query.toLowerCase())
    );
  };

  // Buscar contenido
  const searchContent = async (query) => {
    // En una implementación real, esto buscaría en noticias, posts, etc.
    return [
      { id: 'content1', title: 'Actualización del Servidor', description: 'Nuevas características añadidas', url: '/news' }
    ].filter(content => 
      content.title.toLowerCase().includes(query.toLowerCase()) ||
      content.description.toLowerCase().includes(query.toLowerCase())
    );
  };

  // Generar sugerencias
  const generateSuggestions = (query, results) => {
    const suggestions = [];
    
    // Agregar resultados como sugerencias
    results.slice(0, 3).forEach(result => {
      suggestions.push({
        text: result.title,
        type: result.type,
        url: result.url
      });
    });
    
    // Agregar búsquedas similares del historial
    const similarHistory = searchHistory.filter(item => 
      item.toLowerCase().includes(query.toLowerCase()) && 
      item !== query
    ).slice(0, 2);
    
    similarHistory.forEach(item => {
      suggestions.push({
        text: item,
        type: 'history',
        url: null
      });
    });
    
    setSuggestions(suggestions);
  };

  // Trackear búsqueda para analytics
  const trackSearch = async (searchTerm) => {
    try {
      await fetch(apiUrl('/api/analytics/search'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ searchTerm })
      });
    } catch (error) {
      console.error('Error tracking search:', error);
    }
  };

  // Manejar cambio de input
  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    setSelectedIndex(-1);
    debouncedSearch(value);
  };

  // Manejar teclas
  const handleKeyDown = (e) => {
    if (!isOpen) return;
    
    const totalItems = suggestions.length + results.length;
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < totalItems - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          const item = selectedIndex < suggestions.length 
            ? suggestions[selectedIndex] 
            : results[selectedIndex - suggestions.length];
          handleItemClick(item);
        } else if (query.trim()) {
          handleSearch(query);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setQuery('');
        setResults([]);
        setSuggestions([]);
        break;
    }
  };

  // Manejar click en item
  const handleItemClick = (item) => {
    if (item.url) {
      window.location.href = item.url;
    } else if (item.type === 'history') {
      setQuery(item.text);
      debouncedSearch(item.text);
    }
    setIsOpen(false);
  };

  // Manejar búsqueda
  const handleSearch = (searchTerm) => {
    if (!searchTerm.trim()) return;
    
    saveToHistory(searchTerm);
    
    // Redirigir a página de resultados o realizar búsqueda
    console.log('Searching for:', searchTerm);
    setIsOpen(false);
  };

  // Limpiar búsqueda
  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setSuggestions([]);
    setSelectedIndex(-1);
    inputRef.current?.focus();
  };

  // Cerrar búsqueda
  const closeSearch = () => {
    setIsOpen(false);
    setQuery('');
    setResults([]);
    setSuggestions([]);
    setSelectedIndex(-1);
  };

  // Abrir búsqueda con Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
        setTimeout(() => inputRef.current?.focus(), 100);
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Cerrar al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  return (
    <>
      {/* Botón de búsqueda */}
      <button
        className="search-trigger"
        onClick={() => setIsOpen(true)}
        title="Buscar (Ctrl+K)"
      >
        <FaSearch />
      </button>

      {/* Modal de búsqueda */}
      {isOpen && (
        <div className="search-overlay">
          <div className="search-modal" ref={searchRef}>
            <div className="search-input-container">
              <FaSearch className="search-icon" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="Buscar páginas, usuarios, contenido..."
                className="search-input"
                autoFocus
              />
              {query && (
                <button
                  className="search-clear"
                  onClick={clearSearch}
                  title="Limpiar"
                >
                  <FaTimes />
                </button>
              )}
            </div>

            {/* Resultados y sugerencias */}
            {(suggestions.length > 0 || results.length > 0 || loading) && (
              <div className="search-results">
                {loading && (
                  <div className="search-loading">
                    <div className="loading-spinner"></div>
                    <span>Buscando...</span>
                  </div>
                )}

                {/* Sugerencias */}
                {suggestions.length > 0 && !loading && (
                  <div className="search-section">
                    <div className="search-section-header">
                      <FaHistory />
                      <span>Sugerencias</span>
                    </div>
                    {suggestions.map((item, index) => (
                      <div
                        key={index}
                        className={`search-item ${selectedIndex === index ? 'selected' : ''}`}
                        onClick={() => handleItemClick(item)}
                      >
                        <div className="search-item-content">
                          <div className="search-item-title">{item.text}</div>
                          <div className="search-item-type">{item.type}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Resultados */}
                {results.length > 0 && !loading && (
                  <div className="search-section">
                    <div className="search-section-header">
                      <FaSearch />
                      <span>Resultados</span>
                    </div>
                    {results.map((item, index) => (
                      <div
                        key={item.id}
                        className={`search-item ${selectedIndex === suggestions.length + index ? 'selected' : ''}`}
                        onClick={() => handleItemClick(item)}
                      >
                        <div className="search-item-content">
                          <div className="search-item-title">{item.title}</div>
                          <div className="search-item-description">{item.description}</div>
                          <div className="search-item-type">{item.type}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Trending */}
                {!query && trending.length > 0 && (
                  <div className="search-section">
                    <div className="search-section-header">
                      <FaTrendingUp />
                      <span>Tendencias</span>
                    </div>
                    {trending.map((item, index) => (
                      <div
                        key={index}
                        className="search-item trending-item"
                        onClick={() => {
                          setQuery(item.term);
                          debouncedSearch(item.term);
                        }}
                      >
                        <div className="search-item-content">
                          <div className="search-item-title">{item.term}</div>
                          <div className="search-item-count">{item.count} búsquedas</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Historial */}
                {!query && searchHistory.length > 0 && (
                  <div className="search-section">
                    <div className="search-section-header">
                      <FaClock />
                      <span>Recientes</span>
                    </div>
                    {searchHistory.map((item, index) => (
                      <div
                        key={index}
                        className="search-item history-item"
                        onClick={() => {
                          setQuery(item);
                          debouncedSearch(item);
                        }}
                      >
                        <div className="search-item-content">
                          <div className="search-item-title">{item}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Footer */}
            <div className="search-footer">
              <div className="search-shortcuts">
                <span>↑↓ navegar</span>
                <span>↵ seleccionar</span>
                <span>esc cerrar</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default GlobalSearch;