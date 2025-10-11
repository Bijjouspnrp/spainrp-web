# 🎯 Dashboard Administrativo con Drag & Drop

## 📋 Descripción

Sistema de dashboard personalizable con funcionalidad de drag & drop exclusivo para el administrador (ID: 710112055985963090). Permite reorganizar widgets arrastrándolos y soltándolos, con persistencia del layout en localStorage.

## 🚀 Características

### ✨ Funcionalidades Principales
- **Drag & Drop Intuitivo**: Arrastra y suelta widgets para reorganizar el dashboard
- **Persistencia**: El layout se guarda automáticamente en localStorage
- **Modo Edición**: Activa/desactiva el modo de edición para reorganizar
- **Pantalla Completa**: Modo fullscreen para mejor visualización
- **Búsqueda de Widgets**: Filtra widgets por categoría y nombre
- **Responsive**: Adaptable a diferentes tamaños de pantalla

### 🎨 Widgets Disponibles

#### 📊 Analytics
- **Estadísticas Generales**: Métricas clave del sistema
- **Top Performers**: Ranking de usuarios con mejor rendimiento

#### 👥 Usuarios
- **Actividad de Usuarios**: Actividad reciente en el sistema

#### 💰 Finanzas
- **Resumen Financiero**: Análisis de transacciones

#### 🔒 Seguridad
- **Alertas de Seguridad**: Notificaciones de seguridad

#### 🖥️ Sistema
- **Estado de Base de Datos**: Métricas de rendimiento
- **Logs del Sistema**: Registro de eventos
- **Notificaciones**: Centro de notificaciones

#### 🕵️ Inteligencia
- **Reportes CNI**: Reportes de inteligencia

## 🛠️ Componentes

### `DashboardAdmin.jsx`
Componente principal que maneja el estado del dashboard y la lógica de drag & drop.

### `DashboardWidget.jsx`
Componente genérico para renderizar widgets individuales con funcionalidad de drag & drop.

### `WidgetPalette.jsx`
Paleta de widgets disponibles para agregar al dashboard con búsqueda y filtros.

### `useDragAndDrop.js`
Hook personalizado que encapsula toda la lógica de drag & drop.

## 🎯 Uso

### Acceso
El dashboard solo es visible para el usuario con ID `710112055985963090`.

### Modo Edición
1. Haz clic en el botón "Editar" en la esquina superior derecha
2. Los widgets se vuelven arrastrables
3. Arrastra los widgets para reorganizarlos
4. Haz clic en "Guardar" para persistir los cambios

### Agregar Widgets
1. Activa el modo edición
2. En la paleta inferior, busca el widget deseado
3. Haz clic en el widget para agregarlo al dashboard

### Pantalla Completa
Haz clic en el botón de pantalla completa para una vista optimizada.

## 🔧 Configuración

### Agregar Nuevo Widget
1. Agrega la configuración en `availableWidgets`:

```javascript
{
  id: 'mi-widget',
  title: 'Mi Widget',
  description: 'Descripción del widget',
  icon: MiIcono,
  color: '#FF5733',
  size: 'medium', // 'small', 'medium', 'large'
  category: 'mi-categoria',
  component: 'MiWidget'
}
```

2. Implementa el contenido en `renderWidgetContent()`:

```javascript
case 'mi-widget':
  return (
    <div className="mi-widget-content">
      {/* Contenido del widget */}
    </div>
  );
```

### Personalizar Categorías
Modifica las categorías en la configuración de `availableWidgets` y actualiza los filtros en `WidgetPalette.jsx`.

## 🎨 Estilos

### CSS Principal
- `DashboardAdmin.css`: Estilos del dashboard principal
- `DashboardWidget.css`: Estilos de widgets individuales
- `WidgetPalette.css`: Estilos de la paleta de widgets

### Variables CSS
```css
:root {
  --primary-color: #00d4ff;
  --secondary-color: #3b82f6;
  --success-color: #10b981;
  --warning-color: #f59e0b;
  --danger-color: #ef4444;
}
```

## 📱 Responsive Design

### Breakpoints
- **Desktop**: > 768px - Grid completo
- **Tablet**: 768px - Grid adaptativo
- **Mobile**: < 768px - Una columna

### Adaptaciones
- Widgets grandes se convierten en una columna en móvil
- Controles se apilan verticalmente en pantallas pequeñas
- Paleta de widgets se adapta al ancho disponible

## 🔒 Seguridad

### Restricciones de Acceso
- Solo visible para ID específico: `710112055985963090`
- Verificación en el componente `MDTPolicial.jsx`

### Persistencia Segura
- Datos guardados en localStorage del navegador
- Clave única por usuario: `dashboard_layout_${userId}`

## 🚀 Mejoras Futuras

### Funcionalidades Planificadas
- [ ] **Temas Personalizables**: Múltiples temas de color
- [ ] **Widgets Dinámicos**: Widgets que se actualizan en tiempo real
- [ ] **Exportar Layout**: Guardar/importar configuraciones
- [ ] **Atajos de Teclado**: Navegación con teclado
- [ ] **Animaciones Avanzadas**: Transiciones más suaves
- [ ] **Widgets Personalizados**: Crear widgets desde la interfaz

### Optimizaciones
- [ ] **Lazy Loading**: Cargar widgets bajo demanda
- [ ] **Virtual Scrolling**: Para listas largas
- [ ] **Web Workers**: Procesamiento en background
- [ ] **Service Workers**: Funcionamiento offline

## 🐛 Solución de Problemas

### Widgets No Se Mueven
- Verifica que el modo edición esté activado
- Asegúrate de que el navegador soporte HTML5 Drag & Drop

### Layout No Se Guarda
- Verifica que localStorage esté habilitado
- Comprueba la consola del navegador por errores

### Widgets No Se Ven
- Verifica que el usuario tenga el ID correcto
- Comprueba que los widgets estén configurados correctamente

## 📝 Notas de Desarrollo

### Arquitectura
- **React Hooks**: Para manejo de estado
- **CSS Grid**: Para layout responsivo
- **HTML5 Drag API**: Para funcionalidad de arrastrar
- **localStorage**: Para persistencia

### Patrones Utilizados
- **Compound Components**: Para widgets modulares
- **Custom Hooks**: Para lógica reutilizable
- **Render Props**: Para contenido dinámico
- **Higher-Order Components**: Para funcionalidad compartida

---

**Desarrollado para SpainRP** 🎮  
**Versión**: 1.0.0  
**Última actualización**: Enero 2025
