# Integración del Bot de Discord en el Backend

## Cambios Realizados

Se ha integrado completamente el bot de Discord (`bot.js`) en el archivo principal del backend (`backend/index.js`). Esto simplifica significativamente el despliegue en Render ya que ahora solo necesitas un servicio en lugar de dos.

### Beneficios de la Integración

1. **Despliegue Simplificado**: Solo necesitas desplegar un servicio en Render
2. **Menor Consumo de Recursos**: Un solo proceso Node.js en lugar de dos
3. **Configuración Unificada**: Todas las variables de entorno en un solo lugar
4. **Mantenimiento Más Fácil**: Un solo archivo para mantener

### Funcionalidades Integradas

El bot ahora incluye todas las funcionalidades originales:

- ✅ Verificación de permisos para publicar noticias
- ✅ Verificación de permisos para eliminar noticias
- ✅ Gestión de miembros del servidor
- ✅ Sistema de bans y kicks
- ✅ Sistema de mute temporal
- ✅ Gestión de roles
- ✅ Envío de mensajes directos
- ✅ Recolección de DMs
- ✅ Logs de staff
- ✅ APIs de administración total
- ✅ Gestión de inventario y saldos
- ✅ Sistema de calendario

### Configuración para Render

Se ha creado un archivo `backend/render.yaml` con toda la configuración necesaria. Las variables de entorno que necesitas configurar en Render son:

#### Variables Obligatorias
- `DISCORD_BOT_TOKEN`: Token del bot de Discord
- `DISCORD_ADMIN_ROLE_ID`: ID del rol de administrador
- `DISCORD_MUTE_ROLE_ID`: ID del rol de mute (opcional)

#### Variables de Email (Opcionales)
- `SMTP_HOST`: Servidor SMTP
- `SMTP_USER`: Usuario SMTP
- `SMTP_PASS`: Contraseña SMTP
- `MAIL_FROM`: Email de origen

### Cómo Desplegar

1. **Conecta tu repositorio a Render**
2. **Crea un nuevo Web Service**
3. **Configura las variables de entorno** usando los valores del `render.yaml`
4. **El servicio se iniciará automáticamente** con el bot integrado

### Estructura del Servicio

```
Backend SpainRP (Puerto 3001)
├── API REST (Express)
├── Bot de Discord (discord.js)
├── Base de datos SQLite
├── Sistema de archivos
└── Socket.IO para notificaciones
```

### Endpoints Disponibles

Todos los endpoints del bot están disponibles bajo `/api/discord/` y `/api/admin/`:

- `/api/discord/canpostnews/:userId` - Verificar permisos de noticias
- `/api/discord/ismember/:userId` - Verificar membresía
- `/api/discord/ban` - Banear usuario
- `/api/discord/kick` - Kickear usuario
- `/api/discord/mute` - Mutear usuario
- `/api/admin/isadmin/:userId` - Verificar admin total
- `/api/admin/search/:query` - Buscar usuarios
- Y muchos más...

### Notas Importantes

1. **El bot se inicia automáticamente** cuando el servidor Express se levanta
2. **Todas las funcionalidades están preservadas** exactamente como estaban
3. **Los logs se mantienen** en memoria durante la sesión
4. **El sistema de archivos** sigue funcionando para uploads y mantenimiento

### Migración desde Servicios Separados

Si tenías el bot y el backend como servicios separados:

1. **Elimina el servicio del bot** en Render
2. **Actualiza las URLs** en el frontend para apuntar solo al backend
3. **Configura las variables de entorno** en el servicio del backend
4. **Reinicia el servicio** para aplicar los cambios

¡El bot ahora está completamente integrado y listo para usar! 🚀
