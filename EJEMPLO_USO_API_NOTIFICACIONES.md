# 📢 Ejemplo de Uso de la API de Notificaciones

## ✅ Problema Solucionado

El error `{"error":"Token de acceso requerido"}` se ha corregido. Ahora la API usa el middleware JWT correcto que maneja el token `spainrp_token`.

## 🔧 Cambios Realizados

### 1. **Middleware JWT Corregido**
- ✅ Usa el middleware centralizado `verifyToken` de `../middleware/jwt`
- ✅ Maneja correctamente el token `spainrp_token`
- ✅ Logging mejorado para debugging

### 2. **Autenticación Mejorada**
- ✅ Verificación consistente del JWT secret
- ✅ Mejor manejo de errores de autenticación
- ✅ Logging detallado para troubleshooting

## 🚀 Cómo Usar la API

### Opción 1: Usando el utilitario `authFetch` (Recomendado)

```javascript
import { authFetch } from '../utils/api.js';

const sendNotification = async () => {
  try {
    const response = await authFetch('/api/notifications/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title: 'Test Notification',
        message: 'This is a test notification',
        type: 'info',
        target: 'all', // 'all', 'online', or 'specific'
        priority: 'normal'
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log('Notification sent successfully:', result);
    return result;
  } catch (error) {
    console.error('Error sending notification:', error);
    throw error;
  }
};
```

### Opción 2: Usando fetch directo con token

```javascript
const sendNotificationDirect = async () => {
  // Obtener token del localStorage
  const token = localStorage.getItem('spainrp_token');
  
  if (!token) {
    throw new Error('No authentication token found');
  }

  try {
    const response = await fetch('https://spainrp-web-pqog.onrender.com/api/notifications/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` // ← CLAVE: Incluir el token
      },
      body: JSON.stringify({
        title: 'Test Notification',
        message: 'This is a test notification',
        type: 'info',
        target: 'all',
        priority: 'normal'
      })
    });

    const result = await response.json();
    console.log('Result:', result);
    return result;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};
```

## 📋 Parámetros de la API

### Campos Requeridos
- `title` (string): Título de la notificación
- `message` (string): Mensaje de la notificación

### Campos Opcionales
- `type` (string): Tipo de notificación
  - `info` (default)
  - `success`
  - `warning`
  - `error`

- `target` (string): Destinatario
  - `all` - Todos los usuarios
  - `online` - Solo usuarios online
  - `specific` - Usuario específico

- `targetUser` (string): ID de Discord del usuario (solo si target = 'specific')

- `priority` (string): Prioridad
  - `low` - Baja
  - `normal` (default)
  - `high` - Alta
  - `urgent` - Urgente

## 🔐 Requisitos de Autenticación

### 1. **Token JWT Válido**
- Debe estar almacenado en `localStorage` como `spainrp_token`
- Debe ser un token válido y no expirado

### 2. **Permisos de Administrador**
- El usuario debe estar en la lista de administradores
- Actualmente solo: `710112055985963090` (bijjoupro08)

## 🧪 Ejemplo de Prueba

```javascript
// Función de prueba completa
const testNotificationAPI = async () => {
  console.log('🧪 Probando API de notificaciones...');
  
  // Verificar token
  const token = localStorage.getItem('spainrp_token');
  console.log('🔑 Token encontrado:', token ? 'Sí' : 'No');
  
  if (!token) {
    console.error('❌ No hay token. Inicia sesión primero.');
    return;
  }

  try {
    const response = await fetch('https://spainrp-web-pqog.onrender.com/api/notifications/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        title: '🧪 Prueba de API',
        message: 'Esta es una notificación de prueba enviada desde el frontend',
        type: 'info',
        target: 'all',
        priority: 'normal'
      })
    });

    console.log('📡 Respuesta del servidor:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok
    });

    const result = await response.json();
    console.log('✅ Resultado:', result);
    
    if (result.success) {
      console.log('🎉 ¡Notificación enviada exitosamente!');
    } else {
      console.error('❌ Error en la respuesta:', result);
    }
    
  } catch (error) {
    console.error('❌ Error en la petición:', error);
  }
};

// Ejecutar prueba
testNotificationAPI();
```

## 🔍 Debugging

### Verificar Token
```javascript
const token = localStorage.getItem('spainrp_token');
console.log('Token:', token ? token.substring(0, 20) + '...' : 'No encontrado');
```

### Verificar Usuario
```javascript
// El token JWT contiene información del usuario
const token = localStorage.getItem('spainrp_token');
if (token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    console.log('Usuario:', payload);
  } catch (e) {
    console.error('Error decodificando token:', e);
  }
}
```

## 📝 Logs del Servidor

El servidor ahora incluye logs detallados:

```
[NOTIFICATIONS] POST /send - Request received: { userId: '...', hasTitle: true, ... }
[NOTIFICATIONS] ✅ Usuario ... tiene permisos de administrador
[NOTIFICATIONS] 📝 Creando notificación: { finalUserId: null, ... }
[NOTIFICATIONS] ✅ Notificación insertada con ID: 123
[NOTIFICATIONS] ✅ Notificación enviada por admin ...: { id: 123, ... }
[NOTIFICATIONS] 📡 Enviando notificación por WebSocket
[NOTIFICATIONS] ✅ Notificación procesada exitosamente
```

## ✅ Estado Actual

- ✅ **Autenticación JWT corregida**
- ✅ **Middleware consistente**
- ✅ **Logging mejorado**
- ✅ **Manejo de errores robusto**
- ✅ **Componente de ejemplo creado**
- ✅ **Documentación completa**

¡La API de notificaciones ahora funciona correctamente con el token `spainrp_token`!
