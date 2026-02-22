# Sistema de Chat en Vivo - SpainRP

## 📋 Descripción General

Sistema completo de chat en tiempo real para soporte técnico de SpainRP, integrado con Discord para verificación de roles de moderadores. Permite a los usuarios iniciar chats directos con moderadores y a los moderadores gestionar múltiples conversaciones simultáneamente.

## 🏗️ Arquitectura del Sistema

### Backend (Node.js + Socket.IO)
- **Base de datos**: SQLite con tablas para chats, mensajes y moderadores
- **WebSocket**: Socket.IO para comunicación en tiempo real
- **Discord Bot**: Verificación de roles de moderadores
- **API REST**: Endpoints para autenticación y gestión

### Frontend (React)
- **Support.jsx**: Interfaz principal de chat para usuarios
- **ModeratorChatPanel.jsx**: Panel de gestión para moderadores
- **Socket.IO Client**: Conexión en tiempo real

## 🗄️ Base de Datos

### Tablas Principales

#### `live_chats`
```sql
CREATE TABLE live_chats (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  user_name TEXT NOT NULL,
  status TEXT DEFAULT 'active',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  closed_at DATETIME NULL,
  assigned_moderator TEXT NULL
);
```

#### `chat_messages`
```sql
CREATE TABLE chat_messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  chat_id INTEGER NOT NULL,
  sender_type TEXT NOT NULL,
  sender_id TEXT NOT NULL,
  sender_name TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (chat_id) REFERENCES live_chats (id)
);
```

#### `moderators_online`
```sql
CREATE TABLE moderators_online (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  user_name TEXT NOT NULL,
  last_seen DATETIME DEFAULT CURRENT_TIMESTAMP,
  is_online INTEGER DEFAULT 1
);
```

## 🔧 Configuración

### Variables de Entorno

#### Backend
```env
DISCORD_GUILD_ID=1212556680911650866
DISCORD_BOT_TOKEN=tu_token_del_bot
MODERATOR_ROLE_ID=1384340649205301359
REACT_APP_API_URL=https://spainrp-web-pqog.onrender.com
```

#### Frontend
```env
REACT_APP_API_URL=https://spainrp-web-pqog.onrender.com
```

### Dependencias

#### Backend
```json
{
  "socket.io": "^4.7.5",
  "discord.js": "^14.14.1",
  "sqlite3": "^5.1.6"
}
```

#### Frontend
```json
{
  "socket.io-client": "^4.7.5",
  "react-icons": "^4.12.0"
}
```

## 🚀 Instalación y Configuración

### 1. Backend

```bash
cd backend
npm install
```

Configurar variables de entorno y ejecutar:
```bash
npm start
```

### 2. Frontend

```bash
cd frontend
npm install
npm start
```

## 📡 Eventos Socket.IO

### Eventos del Cliente (Frontend)

#### `start_chat`
Inicia un nuevo chat
```javascript
socket.emit('start_chat', {
  userId: 'user_discord_id',
  userName: 'nombre_usuario'
});
```

#### `chat_message`
Envía un mensaje
```javascript
socket.emit('chat_message', {
  chatId: 'chat_id',
  message: 'contenido_mensaje',
  senderType: 'user',
  senderId: 'user_id',
  senderName: 'nombre_usuario'
});
```

#### `close_chat`
Cierra un chat
```javascript
socket.emit('close_chat', {
  chatId: 'chat_id'
});
```

#### `moderator_join`
Moderador se conecta
```javascript
socket.emit('moderator_join', {
  userId: 'moderator_id',
  userName: 'moderator_name'
});
```

### Eventos del Servidor (Backend)

#### `chat_started`
Chat iniciado exitosamente
```javascript
socket.emit('chat_started', {
  chatId: 'generated_chat_id',
  message: 'Chat iniciado correctamente'
});
```

#### `new_message`
Nuevo mensaje recibido
```javascript
socket.emit('new_message', {
  chatId: 'chat_id',
  senderType: 'user|moderator',
  senderId: 'sender_id',
  senderName: 'sender_name',
  message: 'message_content',
  timestamp: '2024-01-01T00:00:00.000Z'
});
```

#### `chat_closed`
Chat cerrado
```javascript
socket.emit('chat_closed', {
  chatId: 'chat_id'
});
```

## 🔐 Verificación de Moderadores

### Proceso de Verificación

1. **Conexión del Bot**: El bot de Discord debe estar conectado y autenticado
2. **Verificación de Servidor**: Se verifica que el servidor Discord existe
3. **Obtención del Miembro**: Se busca el miembro en el servidor
4. **Verificación de Roles**: Se comprueba si tiene el rol de moderador (`1384340649205301359`)
5. **Verificación de Permisos**: Se verifica si tiene permisos de administrador

### Código de Verificación

```javascript
function isModerator(userId) {
  return new Promise((resolve, reject) => {
    const guildId = process.env.DISCORD_GUILD_ID || '1212556680911650866';
    const moderatorRoleId = '1384340649205301359';
    
    if (!global.discordClient || !global.discordClient.readyAt) {
      resolve(false);
      return;
    }

    const guild = global.discordClient.guilds.cache.get(guildId);
    if (!guild) {
      resolve(false);
      return;
    }

    guild.members.fetch(userId).then(member => {
      const hasModeratorRole = member.roles.cache.has(moderatorRoleId);
      const hasAdminPerms = member.permissions.has(PermissionsBitField.Flags.Administrator);
      resolve(hasModeratorRole || hasAdminPerms);
    }).catch(err => {
      console.error(`Error verificando moderador ${userId}:`, err);
      resolve(false);
    });
  });
}
```

## 📊 Sistema de Logs

### Logs del Backend

#### Estructura de Logs
```
[CHAT][isModerator] Verificando moderador: {userId} en servidor: {guildId}
[CHAT][isModerator] Servidor encontrado: {guildName} ({guildId})
[CHAT][isModerator] Miembro encontrado: {username} ({userId})
[CHAT][isModerator] Tiene rol moderador ({roleId}): {boolean}
[CHAT][isModerator] Tiene permisos admin: {boolean}
[CHAT][isModerator] Roles del usuario: [{roles}]
[CHAT][isModerator] Resultado final: {ES MODERADOR|NO ES MODERADOR}
```

#### Logs de Chat
```
[CHAT] Usuario conectado: {socketId}
[CHAT] Chat iniciado - ID: {chatId}, Usuario: {userName}
[CHAT] Mensaje enviado en chat {chatId}: {message}
[CHAT] Chat cerrado: {chatId}
[CHAT] Moderador conectado: {userName}
```

### Logs del Frontend

#### Estructura de Logs
```
[SUPPORT] Inicializando Socket.IO para usuario: {username}
[SUPPORT][Socket] ✅ Conectado a Socket.IO
[SUPPORT][Socket] ID de conexión: {socketId}
[SUPPORT][Chat] ✅ Chat iniciado exitosamente
[SUPPORT][Chat] ID del chat: {chatId}
[SUPPORT][Chat] 📨 Nuevo mensaje recibido
[SUPPORT][sendMessage] ✅ Mensaje enviado exitosamente
```

## 🎯 Flujo de Uso

### Para Usuarios

1. **Acceso**: Navegar a `/support`
2. **Autenticación**: Iniciar sesión con Discord
3. **Inicio de Chat**: Hacer clic en "Chat en Vivo"
4. **Identificación**: Introducir nombre o nickname
5. **Conversación**: Enviar mensajes y recibir respuestas
6. **Cierre**: Cerrar chat cuando termine

### Para Moderadores

1. **Acceso**: Navegar a `/moderator-chat` (ruta protegida)
2. **Verificación**: El sistema verifica automáticamente el rol de Discord
3. **Conexión**: Se conecta al panel de moderadores
4. **Gestión**: Ver lista de chats activos
5. **Respuesta**: Seleccionar chat y responder mensajes
6. **Cierre**: Cerrar chats cuando sea necesario

## 🛠️ Mantenimiento y Debugging

### Verificación del Sistema

#### 1. Verificar Conexión del Bot
```javascript
console.log('Bot conectado:', global.discordClient?.readyAt);
console.log('Servidores:', global.discordClient?.guilds?.cache?.size);
```

#### 2. Verificar Base de Datos
```sql
-- Ver chats activos
SELECT * FROM live_chats WHERE status = 'active';

-- Ver mensajes recientes
SELECT * FROM chat_messages ORDER BY created_at DESC LIMIT 10;

-- Ver moderadores online
SELECT * FROM moderators_online WHERE is_online = 1;
```

#### 3. Verificar Socket.IO
```javascript
// En el navegador (consola)
console.log('Socket conectado:', socket?.connected);
console.log('Socket ID:', socket?.id);
```

### Problemas Comunes

#### 1. Moderador no puede acceder
- **Causa**: Bot de Discord no conectado o rol incorrecto
- **Solución**: Verificar conexión del bot y roles del usuario

#### 2. Chat no se inicia
- **Causa**: Socket.IO no conectado o usuario no autenticado
- **Solución**: Verificar conexión y autenticación

#### 3. Mensajes no se envían
- **Causa**: Chat no activo o conexión perdida
- **Solución**: Verificar estado del chat y reconectar

## 🔒 Seguridad

### Medidas Implementadas

1. **Autenticación JWT**: Verificación de tokens para acceso
2. **Verificación de Roles**: Solo moderadores pueden acceder al panel
3. **Validación de Datos**: Sanitización de mensajes y datos
4. **Rate Limiting**: Prevención de spam (implementar si es necesario)
5. **Logs de Auditoría**: Registro de todas las acciones

### Recomendaciones

1. **HTTPS**: Usar conexiones seguras en producción
2. **Validación Backend**: Validar todos los datos en el servidor
3. **Monitoreo**: Implementar alertas para errores críticos
4. **Backup**: Respaldar base de datos regularmente

## 📈 Monitoreo y Métricas

### Métricas Importantes

- **Chats Activos**: Número de conversaciones en curso
- **Tiempo de Respuesta**: Tiempo promedio de respuesta de moderadores
- **Usuarios Conectados**: Número de usuarios en línea
- **Errores**: Frecuencia y tipo de errores

### Dashboard de Moderadores

El panel de moderadores muestra:
- Lista de chats activos
- Estado de conexión
- Historial de mensajes
- Estadísticas básicas

## 🚀 Despliegue

### Producción

1. **Configurar Variables de Entorno**
2. **Configurar Base de Datos**
3. **Configurar Bot de Discord**
4. **Desplegar Backend**
5. **Desplegar Frontend**
6. **Verificar Funcionamiento**

### Docker (Opcional)

```dockerfile
# Backend Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

## 📝 Changelog

### v1.0.0
- ✅ Sistema básico de chat en vivo
- ✅ Verificación de moderadores con Discord
- ✅ Panel de moderadores
- ✅ Persistencia en base de datos
- ✅ Logs detallados
- ✅ Manejo de errores robusto

## 🤝 Contribución

Para contribuir al proyecto:

1. Fork el repositorio
2. Crear rama de feature
3. Implementar cambios
4. Agregar tests
5. Crear Pull Request

## 📞 Soporte

Para soporte técnico:
- **Discord**: SpainRP Server
- **Email**: spainrpoficial@proton.me
- **Issues**: GitHub Issues

---

**Desarrollado para SpainRP - Emergency Response: Liberty County**
