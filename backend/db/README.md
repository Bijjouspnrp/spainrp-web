# Base de Datos - SpainRP

## ⚠️ IMPORTANTE - SEGURIDAD

**NUNCA subas archivos de base de datos a GitHub o Render.**

Los archivos de base de datos contienen información sensible y deben mantenerse privados.

## 📁 Archivos Excluidos

Los siguientes archivos están en `.gitignore` y NO deben subirse:

```
*.db
*.sqlite
*.sqlite3
*.db-journal
*.db-wal
*.db-shm
backend/spainrp.db
backend/spainrp.db-journal
backend/spainrp.db-wal
backend/spainrp.db-shm
```

## 🚀 Configuración en Producción

### Render.com
1. La base de datos se crea automáticamente al iniciar la aplicación
2. Los datos se almacenan en el sistema de archivos temporal de Render
3. **IMPORTANTE**: Los datos se pierden al reiniciar el servicio

### Para Persistencia en Producción
Considera usar:
- **PostgreSQL** (recomendado para Render)
- **MongoDB Atlas**
- **SQLite con almacenamiento persistente**

## 🔧 Desarrollo Local

### Inicialización
```bash
# La base de datos se crea automáticamente al iniciar el servidor
npm start
```

### Estructura de Tablas
Las tablas se crean automáticamente usando:
- `backend/db/database.js` - Configuración principal
- `backend/db/init.js` - Inicialización
- `backend/db/migrate.js` - Migraciones

### Tablas Principales
- `sessions` - Sesiones de usuario
- `announcements` - Anuncios
- `polls` - Encuestas
- `notifications` - Notificaciones
- `access_logs` - Logs de acceso
- `error_logs` - Logs de errores
- `ip_tracking` - Seguimiento de IPs
- `empresas` - Registros empresariales CNI
- `visitas_empresas` - Visitas de inspección CNI

## 🛡️ Seguridad

### Datos Sensibles
- **NUNCA** commits archivos `.db`
- **NUNCA** subas credenciales de base de datos
- **SIEMPRE** usa variables de entorno para configuración

### Backup
```bash
# Crear backup (solo en desarrollo)
cp backend/spainrp.db backend/db/backups/spainrp_$(date +%Y%m%d_%H%M%S).db
```

## 🔄 Migraciones

### Aplicar Migraciones
```bash
node backend/db/migrate.js
```

### Crear Nueva Migración
1. Edita `backend/db/migrate.js`
2. Añade la lógica de migración
3. Ejecuta la migración

## 📊 Monitoreo

### Logs de Base de Datos
Los logs se encuentran en:
- `backend/logs/database.log`
- `backend/logs/error.log`

### Verificar Estado
```bash
# Verificar conexión
node -e "const db = require('./database'); console.log('DB OK');"
```

## 🚨 Solución de Problemas

### Error: "Database is locked"
```bash
# Eliminar archivos de lock
rm backend/spainrp.db-journal
rm backend/spainrp.db-wal
rm backend/spainrp.db-shm
```

### Error: "No such table"
```bash
# Recrear base de datos
rm backend/spainrp.db
npm start
```

## 📝 Notas Importantes

1. **SQLite** es para desarrollo y testing
2. **PostgreSQL** es recomendado para producción
3. **Los datos se pierden** al reiniciar Render
4. **Usa variables de entorno** para configuración
5. **NUNCA** subas archivos de base de datos a Git
