import React, { useState } from 'react';
import { FaSearch, FaFilter, FaPlus } from 'react-icons/fa';
import './WidgetPalette.css';

const WidgetPalette = ({ 
  availableWidgets = [], 
  onAddWidget, 
  isVisible = false 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');

  // Filtrar widgets
  const filteredWidgets = availableWidgets.filter(widget => {
    const matchesSearch = widget.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         widget.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || widget.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  // Obtener categorías únicas
  const categories = ['all', ...new Set(availableWidgets.map(w => w.category).filter(Boolean))];

  const handleAddWidget = (widgetId) => {
    onAddWidget(widgetId);
    setSearchTerm(''); // Limpiar búsqueda después de agregar
  };

  if (!isVisible) return null;

  return (
    <div className="widget-palette">
      <div className="palette-header">
        <h3>Agregar Widgets</h3>
        <div className="palette-controls">
          <div className="search-container">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Buscar widgets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          
          <div className="filter-container">
            <FaFilter className="filter-icon" />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="filter-select"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === 'all' ? 'Todas las categorías' : category}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="palette-grid">
        {filteredWidgets.length === 0 ? (
          <div className="no-widgets">
            <FaSearch className="no-widgets-icon" />
            <p>No se encontraron widgets</p>
            <small>Intenta con otros términos de búsqueda</small>
          </div>
        ) : (
          filteredWidgets.map(widget => {
            const IconComponent = widget.icon;
            return (
              <button
                key={widget.id}
                className="palette-widget"
                onClick={() => handleAddWidget(widget.id)}
                style={{ borderColor: widget.color }}
                title={widget.description}
              >
                <div className="palette-widget-icon">
                  <IconComponent style={{ color: widget.color }} />
                </div>
                <div className="palette-widget-content">
                  <span className="palette-widget-title">{widget.title}</span>
                  {widget.description && (
                    <span className="palette-widget-description">
                      {widget.description}
                    </span>
                  )}
                  <div className="palette-widget-meta">
                    <span className={`palette-widget-size ${widget.size}`}>
                      {widget.size}
                    </span>
                    {widget.category && (
                      <span className="palette-widget-category">
                        {widget.category}
                      </span>
                    )}
                  </div>
                </div>
                <FaPlus className="palette-add-icon" />
              </button>
            );
          })
        )}
      </div>

      <div className="palette-footer">
        <p className="palette-info">
          💡 Arrastra o haz clic para agregar widgets a tu dashboard
        </p>
      </div>
    </div>
  );
};

export default WidgetPalette;
