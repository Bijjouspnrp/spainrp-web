import React from 'react';
import { FaTimes, FaGripVertical } from 'react-icons/fa';
import './DashboardWidget.css';

const DashboardWidget = ({ 
  widget, 
  config, 
  isEditing = false, 
  onRemove, 
  dragProps = {},
  children 
}) => {
  const IconComponent = config?.icon;

  return (
    <div
      className={`dashboard-widget ${config?.size || 'medium'} ${isEditing ? 'editable' : ''}`}
      {...dragProps}
      style={{
        borderColor: isEditing ? config?.color : 'transparent',
        ...dragProps.style
      }}
    >
      <div className="widget-header">
        <div className="widget-title">
          {IconComponent && (
            <IconComponent 
              className="widget-icon" 
              style={{ color: config.color }} 
            />
          )}
          <span>{config?.title || 'Widget'}</span>
        </div>
        
        {isEditing && (
          <div className="widget-controls">
            <div className="drag-handle" title="Arrastrar para reordenar">
              <FaGripVertical />
            </div>
            <button 
              className="widget-remove"
              onClick={() => onRemove?.(widget.id)}
              title="Eliminar widget"
            >
              <FaTimes />
            </button>
          </div>
        )}
      </div>
      
      <div className="widget-content">
        {children}
      </div>
    </div>
  );
};

export default DashboardWidget;
