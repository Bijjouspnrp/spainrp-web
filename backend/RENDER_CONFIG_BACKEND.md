# Cómo configurar el backend (spainrp-web) en Render

Rellena el formulario de **New Web Service** con estos valores.

---

## 1. Configuración básica

| Campo | Valor |
|-------|--------|
| **Name** | `spainrp-web` (o el que quieras) |
| **Language** | **Node** |
| **Branch** | `main` |
| **Region** | Oregon (US West) o la que prefieras |

---

## 2. Root Directory (importante)

Como el backend está dentro de la carpeta `backend` del repo:

| Campo | Valor |
|-------|--------|
| **Root Directory** | `backend` |

Si no pones esto, Render intentará ejecutar desde la raíz y no encontrará `package.json` ni `index.js`.

---

## 3. Build & Start

| Campo | Valor |
|-------|--------|
| **Build Command** | `npm install` |
| **Start Command** | `npm start` |

(O si usas Yarn: **Build** = `yarn`, **Start** = `yarn start`.)

---

## 4. Instance Type

- **Free**: para pruebas (se duerme tras inactividad).
- **Starter ($7/mes)** o superior: si quieres que no se duerma y mejor rendimiento.

---

## 5. Environment Variables

Añade estas variables en **Environment Variables** (usa “Add Environment Variable” para cada una).

### Obligatorias (sin ellas falla auth/Discord)

| NAME | VALUE | Notas |
|------|--------|--------|
| `NODE_ENV` | `production` | |
| `SESSION_SECRET` | Una frase larga y aleatoria | Ej: genera una en [randomkeygen](https://randomkeygen.com/) |
| `JWT_SECRET` | Otra frase larga y aleatoria | Diferente a SESSION_SECRET |
| `DISCORD_CLIENT_ID` | ID de tu aplicación Discord | Developer Portal → Application |
| `DISCORD_CLIENT_SECRET` | Secret de la aplicación Discord | Developer Portal → Application |
| `DISCORD_CALLBACK_URL` | `https://TU-BACKEND.onrender.com/auth/discord/callback` | **Sustituye TU-BACKEND** por la URL que te dé Render (ej: `spainrp-web`) → será `https://spainrp-web-pqog.onrender.com/auth/discord/callback` |
| `FRONTEND_URL` | `https://TU-FRONTEND.onrender.com` | URL del frontend cuando lo despliegues (ej: `https://spainrp-oficial-1uly.onrender.com`) |
| `PUBLIC_BASE_URL` | Igual que FRONTEND_URL | Misma URL del frontend |

### Discord bot y guild

| NAME | VALUE |
|------|--------|
| `DISCORD_BOT_TOKEN` | Token del bot (Developer Portal → Bot) |
| `DISCORD_GUILD_ID` | ID del servidor de Discord |
| `ADMIN_USER_IDS` | ID de Discord del admin (ej: `710112055985963090`). Varios separados por coma. |
| `DISCORD_ADMIN_ROLE_ID` | (Opcional) ID del rol admin |
| `DISCORD_MUTE_ROLE_ID` | (Opcional) ID del rol mute |
| `REPORTERO_ROLE_ID` | (Opcional) ID del rol reportero |

### URLs de tus otros servicios (ajusta si cambian)

| NAME | VALUE |
|------|--------|
| `BOT_API_URL` | `https://TU-BACKEND.onrender.com` (esta misma API; sin barra final) |
| `ECONOMIA_API_URL` | `http://37.27.21.91:5021` (o la URL de tu servicio economía) |
| `BOLSA_API_URL` | `http://37.27.21.91:5021` (o la URL de bolsa) |
| `DNI_BOT_URL` | (Opcional) Si usas DNI bot |
| `BLACKMARKET_BOT_URL` | (Opcional) Si usas blackmarket bot |

### Base de datos (opcional)

| NAME | VALUE |
|------|--------|
| `MONGO_URI` | Si usas MongoDB (cadena de conexión) |

### Email (opcional: notificaciones / soporte)

| NAME | VALUE |
|------|--------|
| `SENDGRID_API_KEY` | API Key de SendGrid |
| O bien SMTP: `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `MAIL_FROM` | |

### Backup a GitHub (opcional)

| NAME | VALUE |
|------|--------|
| `GITHUB_TOKEN` | Token con permisos repo |

### Otros

| NAME | VALUE |
|------|--------|
| `ECONOMIA_API_KEY` | Si tu API de economía requiere API key |
| `MAINTENANCE_MODE` | `false` (o `true` para poner en mantenimiento) |
| `DEBUG_IP_TRACKING` | (Opcional) `true` solo para depurar |
| `DEBUG_BAN_CHECK` | (Opcional) `true` solo para depurar |

---

## 6. Después de crear el servicio

1. **Anota la URL** que te da Render (ej: `https://spainrp-web-pqog.onrender.com`).
2. **Actualiza en Render** la variable `DISCORD_CALLBACK_URL`:
   - `https://spainrp-web-pqog.onrender.com/auth/discord/callback`
   (o la URL que te haya salido).
3. **En Discord Developer Portal**:
   - Application → OAuth2 → Redirects → añade exactamente esa misma URL en “Redirect URLs”.
4. **Frontend**: cuando lo despliegues, en sus variables pon:
   - `VITE_API_URL` = `https://spainrp-web-pqog.onrender.com` (la URL de este backend).

---

## Resumen rápido

- **Root Directory**: `backend`
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- Variables mínimas: `NODE_ENV`, `SESSION_SECRET`, `JWT_SECRET`, `DISCORD_*`, `FRONTEND_URL`, `PUBLIC_BASE_URL`, `DISCORD_CALLBACK_URL` (con la URL final del backend).

Si algo falla, revisa los **Logs** del servicio en Render; ahí suele salir el error de arranque o de variables faltantes.
