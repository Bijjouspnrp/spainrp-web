# 🔧 Debug: Problemas de Token JWT

## ❌ Problema Identificado

Error 500 en la API de notificaciones con mensaje:
```
Failed to load resource: the server responded with a status of 500 ()
[ADMIN-NOTIFICATIONS] Error: Error: Error enviando notificación
```

## 🔍 Diagnóstico

### **Posibles Causas:**
1. **Token no existe** - Usuario no está logueado
2. **Token expirado** - JWT ha caducado (7 días)
3. **Token inválido** - JWT malformado o corrupto
4. **Permisos insuficientes** - Usuario no es admin
5. **Error del servidor** - Problema en el backend

## ✅ Soluciones Implementadas

### **1. Frontend Mejorado (AdminNotificationSender.jsx)**
- ✅ Verificación de token antes de enviar petición
- ✅ Logging detallado para debugging
- ✅ Manejo específico de errores HTTP (401, 403, 500)
- ✅ Limpieza automática de tokens inválidos
- ✅ Mensajes de error más descriptivos

### **2. Backend Mejorado (notifications.js)**
- ✅ Logging detallado de requests
- ✅ Manejo específico de tipos de error
- ✅ Códigos de estado HTTP apropiados
- ✅ Información de debugging en desarrollo

### **3. TokenDebugger Component**
- ✅ Verificación visual del estado del token
- ✅ Información detallada del JWT
- ✅ Test de conectividad con la API
- ✅ Herramientas para limpiar tokens

## 🛠️ Cómo Usar el TokenDebugger

### **Importar el Componente:**
```jsx
import TokenDebugger from './components/Notifications/TokenDebugger';

// En tu componente principal
function App() {
  return (
    <div>
      {/* Tu contenido */}
      <TokenDebugger />
    </div>
  );
}
```

### **Funciones del TokenDebugger:**
- **🔄 Verificar**: Comprueba el estado actual del token
- **🗑️ Limpiar**: Elimina el token del localStorage
- **🧪 Test API**: Prueba la conectividad con la API

## 🔧 Pasos para Solucionar Problemas

### **Paso 1: Verificar Token**
```javascript
// En la consola del navegador
const token = localStorage.getItem('spainrp_token');
console.log('Token:', token ? 'Presente' : 'Ausente');

if (token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    console.log('Token payload:', payload);
    console.log('Expira:', new Date(payload.exp * 1000));
    console.log('Es admin:', payload.isAdmin);
  } catch (e) {
    console.error('Token inválido:', e);
  }
}
```

### **Paso 2: Verificar Permisos de Admin**
```javascript
// Verificar si el usuario es admin
const token = localStorage.getItem('spainrp_token');
if (token) {
  const payload = JSON.parse(atob(token.split('.')[1]));
  console.log('Es admin:', payload.isAdmin);
  console.log('User ID:', payload.id);
  
  // Lista de admins permitidos
  const adminIds = ['710112055985963090']; // bijjoupro08
  console.log('Es admin permitido:', adminIds.includes(payload.id));
}
```

### **Paso 3: Test de API Manual**
```javascript
// Test directo de la API
fetch('/api/notifications', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('spainrp_token')}`
  }
})
.then(response => {
  console.log('Status:', response.status);
  return response.json();
})
.then(data => console.log('Data:', data))
.catch(error => console.error('Error:', error));
```

## 🚨 Errores Comunes y Soluciones

### **Error 401: "Token requerido"**
```bash
# Solución: Iniciar sesión nuevamente
localStorage.removeItem('spainrp_token');
// Redirigir al login
```

### **Error 401: "Token inválido o expirado"**
```bash
# Solución: Token expirado, renovar sesión
localStorage.removeItem('spainrp_token');
// Redirigir al login
```

### **Error 403: "No tienes permisos de administrador"**
```bash
# Solución: Verificar que el usuario esté en la lista de admins
# En backend/routes/notifications.js línea 218-221
const adminUserIds = [
  '710112055985963090', // bijjoupro08
  // Agregar más IDs aquí
];
```

### **Error 500: "Error interno del servidor"**
```bash
# Solución: Verificar logs del servidor
# Revisar backend/logs/error.log
# Verificar conexión a base de datos
```

## 📊 Logging Mejorado

### **Frontend Logs:**
```javascript
[ADMIN-NOTIFICATIONS] 🔍 Verificando token: { hasToken: true, tokenPreview: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." }
[ADMIN-NOTIFICATIONS] 📤 Enviando notificación: { payload: {...}, hasToken: true, target: "all" }
[ADMIN-NOTIFICATIONS] 📡 Respuesta del servidor: { status: 200, statusText: "OK", ok: true }
[ADMIN-NOTIFICATIONS] ✅ Notificación enviada exitosamente: { success: true, notificationId: 123 }
```

### **Backend Logs:**
```javascript
[NOTIFICATIONS] POST /send - Request received: { userId: "710112055985963090", hasTitle: true, hasMessage: true, type: "info", target: "all", priority: "normal", authHeader: "Present", contentType: "application/json", bodyKeys: ["title", "message", "type", "target", "priority"], timestamp: "2024-01-15T10:30:00.000Z" }
[NOTIFICATIONS] ✅ Usuario 710112055985963090 tiene permisos de administrador
[NOTIFICATIONS] 📝 Creando notificación: { finalUserId: null, title: "Test", message: "Test message...", type: "info", priority: "normal", isGlobal: true }
[NOTIFICATIONS] ✅ Notificación insertada con ID: 123
[NOTIFICATIONS] ✅ Notificación enviada por admin 710112055985963090: { id: 123, title: "Test", message: "Test message...", type: "info", target: "all", targetUser: null, isGlobal: true }
[NOTIFICATIONS] 📡 Enviando notificación por WebSocket
[NOTIFICATIONS] ✅ Notificación procesada exitosamente
```

## 🧪 Testing

### **Test Completo de Notificaciones:**
```javascript
// Función de test completa
const testNotifications = async () => {
  console.log('🧪 Iniciando test de notificaciones...');
  
  // 1. Verificar token
  const token = localStorage.getItem('spainrp_token');
  if (!token) {
    console.error('❌ No hay token');
    return;
  }
  
  // 2. Decodificar token
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    console.log('✅ Token válido:', payload);
    
    if (payload.exp < Math.floor(Date.now() / 1000)) {
      console.error('❌ Token expirado');
      return;
    }
  } catch (e) {
    console.error('❌ Token inválido:', e);
    return;
  }
  
  // 3. Test de API
  try {
    const response = await fetch('/api/notifications/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        title: 'Test Notification',
        message: 'This is a test notification',
        type: 'info',
        target: 'all',
        priority: 'normal'
      })
    });
    
    console.log('📡 Respuesta:', response.status, response.statusText);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Test exitoso:', data);
    } else {
      const error = await response.json();
      console.error('❌ Error:', error);
    }
  } catch (error) {
    console.error('❌ Error de conexión:', error);
  }
};

// Ejecutar test
testNotifications();
```

## ✅ Estado Final

- ✅ **Frontend mejorado** con mejor manejo de errores
- ✅ **Backend mejorado** con logging detallado
- ✅ **TokenDebugger** para debugging visual
- ✅ **Documentación completa** de troubleshooting
- ✅ **Tests automatizados** para verificar funcionamiento

¡El sistema de notificaciones ahora tiene debugging completo y manejo robusto de errores!
