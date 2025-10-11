import React, { useState, useEffect } from 'react';
import { 
  FaChartLine, FaUsers, FaMoneyBillWave, FaShieldAlt, 
  FaDatabase, FaCog, FaEye, FaTrophy, FaBell,
  FaGripVertical, FaSave, FaExpand, FaCompress
} from 'react-icons/fa';
import DashboardWidget from './DashboardWidget';
import WidgetPalette from './WidgetPalette';
import useDragAndDrop from '../../hooks/useDragAndDrop';
import './DashboardAdmin.css';

const DashboardAdmin = ({ userId = '710112055985963090' }) => {
  const [widgets, setWidgets] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Hook de drag & drop
  const {
    draggedItem,
    dragOverIndex,
    isDragging,
    getDragProps
  } = useDragAndDrop(widgets, setWidgets);

  // Widgets disponibles
  const availableWidgets = [
    {
      id: 'stats-overview',
      title: 'Estadísticas Generales',
      description: 'Métricas clave del sistema en tiempo real',
      icon: FaChartLine,
      color: '#3B82F6',
      size: 'large',
      category: 'analytics',
      component: 'StatsOverview'
    },
    {
      id: 'user-activity',
      title: 'Actividad de Usuarios',
      description: 'Actividad reciente de usuarios en el sistema',
      icon: FaUsers,
      color: '#10B981',
      size: 'medium',
      category: 'users',
      component: 'UserActivity'
    },
    {
      id: 'financial-summary',
      title: 'Resumen Financiero',
      description: 'Análisis de transacciones y finanzas',
      icon: FaMoneyBillWave,
      color: '#F59E0B',
      size: 'medium',
      category: 'finance',
      component: 'FinancialSummary'
    },
    {
      id: 'security-alerts',
      title: 'Alertas de Seguridad',
      description: 'Notificaciones de seguridad del sistema',
      icon: FaShieldAlt,
      color: '#EF4444',
      size: 'small',
      category: 'security',
      component: 'SecurityAlerts'
    },
    {
      id: 'database-health',
      title: 'Estado de Base de Datos',
      description: 'Métricas de rendimiento de la base de datos',
      icon: FaDatabase,
      color: '#8B5CF6',
      size: 'small',
      category: 'system',
      component: 'DatabaseHealth'
    },
    {
      id: 'system-logs',
      title: 'Logs del Sistema',
      description: 'Registro de eventos y errores del sistema',
      icon: FaCog,
      color: '#6B7280',
      size: 'large',
      category: 'system',
      component: 'SystemLogs'
    },
    {
      id: 'cni-reports',
      title: 'Reportes CNI',
      description: 'Reportes de inteligencia y análisis',
      icon: FaEye,
      color: '#EC4899',
      size: 'medium',
      category: 'intelligence',
      component: 'CNIReports'
    },
    {
      id: 'top-performers',
      title: 'Top Performers',
      description: 'Ranking de usuarios con mejor rendimiento',
      icon: FaTrophy,
      color: '#F97316',
      size: 'small',
      category: 'analytics',
      component: 'TopPerformers'
    },
    {
      id: 'notifications',
      title: 'Notificaciones',
      description: 'Centro de notificaciones del sistema',
      icon: FaBell,
      color: '#06B6D4',
      size: 'small',
      category: 'system',
      component: 'Notifications'
    }
  ];

  // Cargar layout guardado
  useEffect(() => {
    const savedLayout = localStorage.getItem(`dashboard_layout_${userId}`);
    if (savedLayout) {
      setWidgets(JSON.parse(savedLayout));
    } else {
      // Layout por defecto
      setWidgets([
        { id: 'stats-overview', position: 0 },
        { id: 'user-activity', position: 1 },
        { id: 'financial-summary', position: 2 },
        { id: 'security-alerts', position: 3 },
        { id: 'database-health', position: 4 },
        { id: 'system-logs', position: 5 }
      ]);
    }
  }, [userId]);

  // Guardar layout
  const saveLayout = () => {
    localStorage.setItem(`dashboard_layout_${userId}`, JSON.stringify(widgets));
    setIsEditing(false);
  };

  // Toggle fullscreen
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // Agregar widget
  const addWidget = (widgetId) => {
    const widget = availableWidgets.find(w => w.id === widgetId);
    if (widget && !widgets.find(w => w.id === widgetId)) {
      setWidgets([...widgets, { id: widgetId, position: widgets.length }]);
    }
  };

  // Remover widget
  const removeWidget = (widgetId) => {
    setWidgets(widgets.filter(w => w.id !== widgetId));
  };

  // Obtener widget config
  const getWidgetConfig = (widgetId) => {
    return availableWidgets.find(w => w.id === widgetId);
  };

  // Renderizar widget
  const renderWidget = (widget) => {
    const config = getWidgetConfig(widget.id);
    if (!config) return null;

    const dragProps = isEditing ? getDragProps(widget.id, widget.position) : {};

    return (
      <DashboardWidget
        key={widget.id}
        widget={widget}
        config={config}
        isEditing={isEditing}
        onRemove={removeWidget}
        dragProps={dragProps}
      >
        {renderWidgetContent(widget.id)}
      </DashboardWidget>
    );
  };

  // Contenido de widgets
  const renderWidgetContent = (widgetId) => {
    switch (widgetId) {
      case 'stats-overview':
        return (
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-value">1,234</span>
              <span className="stat-label">Usuarios Activos</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">€45,678</span>
              <span className="stat-label">Transacciones</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">98.5%</span>
              <span className="stat-label">Uptime</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">23</span>
              <span className="stat-label">Alertas</span>
            </div>
          </div>
        );
      
      case 'user-activity':
        return (
          <div className="activity-list">
            <div className="activity-item">
              <div className="activity-dot online"></div>
              <span>Usuario123 se conectó</span>
              <span className="activity-time">2 min</span>
            </div>
            <div className="activity-item">
              <div className="activity-dot warning"></div>
              <span>Nueva multa registrada</span>
              <span className="activity-time">5 min</span>
            </div>
            <div className="activity-item">
              <div className="activity-dot success"></div>
              <span>Transferencia completada</span>
              <span className="activity-time">8 min</span>
            </div>
          </div>
        );
      
      case 'financial-summary':
        return (
          <div className="financial-chart">
            <div className="chart-bar" style={{ height: '60%' }}>
              <span>Ene</span>
            </div>
            <div className="chart-bar" style={{ height: '80%' }}>
              <span>Feb</span>
            </div>
            <div className="chart-bar" style={{ height: '45%' }}>
              <span>Mar</span>
            </div>
            <div className="chart-bar" style={{ height: '90%' }}>
              <span>Abr</span>
            </div>
          </div>
        );
      
      case 'security-alerts':
        return (
          <div className="alerts-list">
            <div className="alert-item high">
              <span className="alert-icon">⚠️</span>
              <span>Intento de acceso no autorizado</span>
            </div>
            <div className="alert-item medium">
              <span className="alert-icon">🔒</span>
              <span>Cambio de contraseña detectado</span>
            </div>
          </div>
        );
      
      case 'database-health':
        return (
          <div className="health-metrics">
            <div className="metric">
              <span className="metric-label">CPU</span>
              <div className="metric-bar">
                <div className="metric-fill" style={{ width: '65%' }}></div>
              </div>
              <span className="metric-value">65%</span>
            </div>
            <div className="metric">
              <span className="metric-label">RAM</span>
              <div className="metric-bar">
                <div className="metric-fill" style={{ width: '42%' }}></div>
              </div>
              <span className="metric-value">42%</span>
            </div>
            <div className="metric">
              <span className="metric-label">Storage</span>
              <div className="metric-bar">
                <div className="metric-fill" style={{ width: '78%' }}></div>
              </div>
              <span className="metric-value">78%</span>
            </div>
          </div>
        );
      
      case 'system-logs':
        return (
          <div className="logs-container">
            <div className="log-entry error">
              <span className="log-time">14:32:15</span>
              <span className="log-message">Error en conexión a base de datos</span>
            </div>
            <div className="log-entry info">
              <span className="log-time">14:30:22</span>
              <span className="log-message">Usuario autenticado correctamente</span>
            </div>
            <div className="log-entry warning">
              <span className="log-time">14:28:45</span>
              <span className="log-message">Alto uso de memoria detectado</span>
            </div>
          </div>
        );
      
      case 'cni-reports':
        return (
          <div className="reports-list">
            <div className="report-item">
              <span className="report-title">Reporte Semanal</span>
              <span className="report-status completed">Completado</span>
            </div>
            <div className="report-item">
              <span className="report-title">Análisis de Seguridad</span>
              <span className="report-status pending">Pendiente</span>
            </div>
          </div>
        );
      
      case 'top-performers':
        return (
          <div className="performers-list">
            <div className="performer-item">
              <span className="performer-rank">1</span>
              <span className="performer-name">Oficial123</span>
              <span className="performer-score">95%</span>
            </div>
            <div className="performer-item">
              <span className="performer-rank">2</span>
              <span className="performer-name">Agente456</span>
              <span className="performer-score">89%</span>
            </div>
          </div>
        );
      
      case 'notifications':
        return (
          <div className="notifications-list">
            <div className="notification-item unread">
              <span className="notification-icon">🔔</span>
              <span className="notification-text">Nueva actualización disponible</span>
            </div>
            <div className="notification-item">
              <span className="notification-icon">📊</span>
              <span className="notification-text">Reporte mensual generado</span>
            </div>
          </div>
        );
      
      default:
        return <div>Widget no encontrado</div>;
    }
  };

  return (
    <div className={`dashboard-admin ${isFullscreen ? 'fullscreen' : ''}`}>
      <div className="dashboard-header">
        <h2>Dashboard Administrativo</h2>
        <div className="dashboard-controls">
          <button 
            className={`edit-btn ${isEditing ? 'active' : ''}`}
            onClick={() => setIsEditing(!isEditing)}
          >
            <FaGripVertical />
            {isEditing ? 'Finalizar' : 'Editar'}
          </button>
          {isEditing && (
            <button className="save-btn" onClick={saveLayout}>
              <FaSave />
              Guardar
            </button>
          )}
          <button 
            className="fullscreen-btn"
            onClick={toggleFullscreen}
            title={isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}
          >
            {isFullscreen ? <FaCompress /> : <FaExpand />}
          </button>
        </div>
      </div>

      <div className="dashboard-grid">
        {widgets
          .sort((a, b) => a.position - b.position)
          .map(renderWidget)
        }
      </div>

      <WidgetPalette
        availableWidgets={availableWidgets}
        onAddWidget={addWidget}
        isVisible={isEditing}
      />
    </div>
  );
};

export default DashboardAdmin;
