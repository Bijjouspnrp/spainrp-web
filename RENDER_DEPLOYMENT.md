# Guía de Despliegue en Render

Esta guía te ayudará a desplegar tu aplicación SpainRP en Render.

## Servicios Necesarios

Necesitarás desplegar los siguientes servicios en Render:

1. **Backend Principal** (`spainrp-backend`)
2. **Frontend** (`spainrp-frontend`) 
3. **Simulador de Tienda** (`spainrp-shop-simulator`)
4. **Bot Discord** (si tienes uno separado)
5. **API de Economía** (si tienes una separada)
6. **API de Bolsa** (si tienes una separada)

## Pasos para el Despliegue

### 1. Preparar el Repositorio

1. Sube tu código a GitHub
2. Asegúrate de que todos los archivos de configuración estén incluidos

### 2. Desplegar el Backend

1. En Render, crea un nuevo **Web Service**
2. Conecta tu repositorio de GitHub
3. Configura:
   - **Name**: `spainrp-backend`
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

4. Configura las variables de entorno:
   ```
   NODE_ENV=production
   PORT=3001
   PUBLIC_BASE_URL=https://spainrp-frontend.onrender.com
   BOT_API_URL=https://tu-bot.onrender.com
   BOLSA_API_URL=https://tu-bolsa.onrender.com
   ECONOMIA_API_URL=https://tu-economia.onrender.com
   DISCORD_CLIENT_ID=tu_discord_client_id
   DISCORD_CLIENT_SECRET=tu_discord_client_secret
   DISCORD_REDIRECT_URI=https://spainrp-backend.onrender.com/auth/callback
   DISCORD_GUILD_ID=tu_guild_id
   DATABASE_URL=postgresql://usuario:password@host:puerto/database
   JWT_SECRET=tu_jwt_secret_muy_seguro
   SESSION_SECRET=tu_session_secret_muy_seguro
   ```

### 3. Desplegar el Frontend

1. En Render, crea un nuevo **Static Site**
2. Conecta tu repositorio de GitHub
3. Configura:
   - **Name**: `spainrp-frontend`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`

4. Configura las variables de entorno:
   ```
   VITE_API_URL=https://spainrp-backend.onrender.com
   VITE_BOT_URL=https://tu-bot.onrender.com
   VITE_SHOP_URL=https://spainrp-shop-simulator.onrender.com
   VITE_PPT_URL=https://tu-ppt.onrender.com
   ```

### 4. Desplegar el Simulador de Tienda

1. En Render, crea un nuevo **Web Service**
2. Conecta tu repositorio de GitHub
3. Configura:
   - **Name**: `spainrp-shop-simulator`
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node start-shop-simulator.js`

4. Configura las variables de entorno:
   ```
   NODE_ENV=production
   PORT=4002
   FRONTEND_URL=https://spainrp-frontend.onrender.com
   ```

### 5. Configurar Discord OAuth

1. Ve a [Discord Developer Portal](https://discord.com/developers/applications)
2. Selecciona tu aplicación
3. Ve a OAuth2 > General
4. Actualiza la **Redirect URI** a: `https://spainrp-backend.onrender.com/auth/callback`

### 6. Configurar Base de Datos

Si usas PostgreSQL (recomendado para producción):
1. En Render, crea un **PostgreSQL** database
2. Copia la **External Database URL**
3. Úsala como `DATABASE_URL` en tu backend

### 7. Verificar el Despliegue

1. Verifica que todos los servicios estén funcionando
2. Prueba las conexiones entre servicios
3. Verifica que la autenticación de Discord funcione
4. Prueba las funcionalidades principales

## Notas Importantes

- **Free Tier**: Los servicios gratuitos de Render se "duermen" después de 15 minutos de inactividad
- **Cold Start**: El primer acceso después de dormir puede tardar 30-60 segundos
- **Variables de Entorno**: Asegúrate de configurar todas las variables necesarias
- **CORS**: Los dominios están configurados para permitir las conexiones necesarias
- **HTTPS**: Render proporciona HTTPS automáticamente

## Troubleshooting

### Error de CORS
- Verifica que las URLs en las variables de entorno sean correctas
- Asegúrate de que el backend incluya el dominio del frontend en CORS

### Error de Conexión
- Verifica que las URLs de los servicios sean correctas
- Asegúrate de que los servicios estén desplegados y funcionando

### Error de Base de Datos
- Verifica que la `DATABASE_URL` sea correcta
- Asegúrate de que la base de datos esté accesible

## Estructura de URLs

Después del despliegue, tendrás:
- Frontend: `https://spainrp-frontend.onrender.com`
- Backend: `https://spainrp-backend.onrender.com`
- Simulador: `https://spainrp-shop-simulator.onrender.com`
