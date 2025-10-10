# Sistema de Backup Automático en GitHub

Este sistema mantiene una copia de seguridad automática de la base de datos SQLite en GitHub, solucionando el problema de pérdida de datos al reiniciar Render.

## 🔧 Configuración

### 1. Crear Token de GitHub

1. Ve a [GitHub.com](https://github.com) > Settings > Developer settings > Personal access tokens
2. Haz clic en "Generate new token (classic)"
3. Selecciona los siguientes permisos:
   - `repo` (acceso completo a repositorios)
   - `workflow` (opcional, para futuras mejoras)
4. Copia el token generado

### 2. Configurar Variables de Entorno

Añade estas variables a tu archivo `.env` o a las variables de entorno de Render:

```bash
# Token de GitHub (OBLIGATORIO)
GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Configuración del repositorio (opcional)
GITHUB_OWNER=Bijjouspnrp
GITHUB_REPO=spainrp-web
GITHUB_BRANCH=main
GITHUB_BACKUP_PATH=database-backups/spainrp-backup.json

# Configuración de backup (opcional)
BACKUP_INTERVAL_MINUTES=5
BACKUP_ENABLED=true
```

### 3. Configurar en Render

1. Ve a tu servicio en Render Dashboard
2. Ve a "Environment" 
3. Añade la variable `GITHUB_TOKEN` con tu token
4. Reinicia el servicio

## 🚀 Funcionamiento

### Backup Automático
- **Cada 5 minutos**: Se crea un backup automático
- **Después de cambios**: Backup inmediato al registrar/actualizar empresas
- **Al iniciar**: Intenta restaurar el último backup

### Archivos de Backup
- **Ubicación**: `database-backups/spainrp-backup.json` en GitHub
- **Formato**: JSON con todas las tablas y datos
- **Historial**: Se mantiene el último backup (se sobrescribe)

### Endpoints Disponibles

```bash
# Crear backup manual
POST /api/backup/create

# Restaurar backup manual
POST /api/backup/restore
```

## 📊 Tablas Incluidas en Backup

- `sessions` - Sesiones de usuario
- `announcements` - Anuncios
- `polls` - Encuestas
- `poll_votes` - Votos de encuestas
- `notifications` - Notificaciones
- `access_logs` - Logs de acceso
- `error_logs` - Logs de errores
- `maintenance_subscribers` - Suscriptores de mantenimiento
- `news_comments` - Comentarios de noticias
- `news_reactions` - Reacciones de noticias
- `calendar_claims` - Reclamaciones de calendario
- `calendar_streaks` - Racha de calendario
- `web_bans` - Bans web
- `ip_tracking` - Seguimiento de IPs
- `empresas` - Empresas CNI
- `visitas_empresas` - Visitas de empresas

## 🔍 Logs de Backup

El sistema genera logs detallados:

```
[BACKUP] 🔄 Iniciando backup de base de datos...
[BACKUP] ✅ Backup completado exitosamente
[BACKUP] 🔄 Restaurando backup desde GitHub...
[BACKUP] ✅ Backup restaurado desde GitHub
```

## ⚠️ Consideraciones Importantes

1. **Token de GitHub**: Debe tener permisos de escritura en el repositorio
2. **Límites de GitHub**: Máximo 1000 requests/hora para tokens personales
3. **Tamaño de backup**: Se recomienda limpiar datos antiguos periódicamente
4. **Seguridad**: El token se almacena como variable de entorno

## 🛠️ Solución de Problemas

### Error: "GITHUB_TOKEN no configurado"
- Verifica que la variable de entorno esté configurada
- Reinicia el servicio después de añadir la variable

### Error: "Error subiendo a GitHub"
- Verifica que el token tenga permisos de `repo`
- Comprueba que el repositorio existe y es accesible

### Error: "Error restaurando backup"
- Normal en el primer inicio (no hay backup previo)
- El sistema continuará con base de datos vacía

## 📈 Beneficios

- ✅ **Persistencia de datos** entre reinicios de Render
- ✅ **Backup automático** sin intervención manual
- ✅ **Restauración automática** al iniciar
- ✅ **Historial de cambios** en GitHub
- ✅ **Sin migración de base de datos** necesaria
