# Configuración del frontend (spainrp-oficial) en Render

En Render el frontend se despliega como **Static Site** (sitio estático), no como Web Service.

---

## 1. Tipo de servicio

Al crear un nuevo servicio en Render, elige **Static Site** (no "Web Service").

---

## 2. Conectar el repositorio

- **Repository**: el mismo repo que el backend (ej. `Bijjouspnrp/spainrp-web` o el que uses).
- **Branch**: `main`.

---

## 3. Configuración básica

| Campo | Valor |
|-------|--------|
| **Name** | `spainrp-oficial` (o el nombre que quieras; será la URL: `https://spainrp-oficial-1uly.onrender.com`) |
| **Region** | Oregon (US West) o la que prefieras |

---

## 4. Root Directory

El frontend está en la carpeta `frontend` del repo:

| Campo | Valor |
|-------|--------|
| **Root Directory** | `frontend` |

---

## 5. Build

| Campo | Valor |
|-------|--------|
| **Build Command** | `npm install && npm run build` |

(O con Yarn: `yarn && yarn build`.)

Vite genera la build en la carpeta `dist/`.

---

## 6. Publicar la build

| Campo | Valor |
|-------|--------|
| **Publish Directory** | `dist` |

Render servirá los archivos que están dentro de `dist` después del build.

---

## 7. Rewrite para SPA (React Router)

Para que las rutas del frontend (ej. `/soporte`, `/panel`) no den 404 al recargar o entrar directo por URL:

- En la sección **Rewrite Rules** (o **Redirects/Rewrites**) añade:

| Tipo | Source | Destination |
|------|--------|--------------|
| Rewrite | `/*` | `/index.html` |

Así todas las rutas se sirve `index.html` y React Router maneja la ruta.

(Si Render solo te deja poner “Redirect”, usa **Rewrite** si está disponible; si no, en muchos planes de Static Site ya aplican esto por defecto.)

---

## 8. Environment Variables (importante)

Estas variables se usan **en tiempo de build** (Vite las incrusta en el JS). Configúralas en Render **antes** del primer deploy.

| NAME | VALUE | Descripción |
|------|--------|-------------|
| **VITE_API_URL** | `https://spainrp-web-pqog.onrender.com` | **URL del backend (API).** Sustituye `spainrp-web` por la URL real de tu backend en Render. |
| **VITE_BOT_URL** | `https://spainrp-web-pqog.onrender.com` | Misma URL del backend si el bot usa la misma API. |
| **VITE_SHOP_URL** | `https://spainrp-oficial-1uly.onrender.com` | URL de la tienda (puede ser la del frontend si está aquí). |
| **VITE_PPT_URL** | `https://spainrp-oficial-1uly.onrender.com` | URL del PPT si lo tienes en el mismo frontend. |

Si tu backend tiene otra URL (ej. `https://spainrp-api.onrender.com`), pon esa en **VITE_API_URL** y **VITE_BOT_URL**.

---

## 9. Orden recomendado de despliegue

1. Despliega primero el **backend** (spainrp-web) y anota su URL.
2. En el **frontend**, en Environment Variables pon **VITE_API_URL** = URL del backend (ej. `https://spainrp-web-pqog.onrender.com`).
3. Despliega el **frontend** (spainrp-oficial).
4. En el **backend**, en Environment Variables pon **FRONTEND_URL** y **PUBLIC_BASE_URL** = URL del frontend (ej. `https://spainrp-oficial-1uly.onrender.com`).

Así CORS y login de Discord quedan bien configurados.

---

## Resumen rápido

| Campo | Valor |
|-------|--------|
| Tipo | **Static Site** |
| Root Directory | `frontend` |
| Build Command | `npm install && npm run build` |
| Publish Directory | `dist` |
| Rewrite | `/*` → `/index.html` |
| VITE_API_URL | URL de tu backend (ej. `https://spainrp-web-pqog.onrender.com`) |

Si cambias la URL del backend o del frontend, actualiza las variables y haz **Manual Deploy** en el frontend para que se vuelva a construir con las nuevas URLs.
