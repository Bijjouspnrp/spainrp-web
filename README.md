# SpainRP Web

Este proyecto contiene:
- Frontend: `/frontend` (Vite + React, JavaScript)
- Backend: `/backend` (Node.js + Express, JavaScript)
- Base de datos: MongoDB y SQL (DB Browser)

## Primeros pasos

1. El frontend se ejecuta con Vite (`npm run dev` en `/frontend`).
2. El backend se creará en `/backend` y se conectará a las bases de datos.
3. El objetivo es integrar Discord, Roblox, bot, DNIs, multas, arrestos y juegos interactivos.

## Estructura
- `/frontend`: Interfaz de usuario (Vite + React)
- `/backend`: API y lógica de negocio (Node.js + Express)
- `/bot.js`: Bot de Discord
- `/backend/shop-simulator.js`: Simulador de Tienda multijugador

## Servicios y Puertos
- **Frontend**: `http://localhost:5173` (Vite)
- **Backend Principal**: `http://localhost:3001` (Express)
- **Bot Discord**: `http://localhost:3020` (API del bot)
- **Simulador de Tienda**: `http://localhost:4002` (Socket.IO)
- **PPT Online**: `http://localhost:4001` (Juego PPT)

## Cómo ejecutar

### 1. Backend Principal
```bash
cd backend
npm install
npm run dev
```

### 2. Simulador de Tienda
```bash
cd backend
npm run shop
```

### 3. Frontend
```bash
cd frontend
npm install
npm run dev
```

### 4. Bot de Discord
```bash
node bot.js
```

## Juegos Disponibles
- **Simulador de Tienda**: Gestiona tu tienda, atiende clientes y maximiza ganancias
- **Piedra, Papel o Tijera**: Juega partidas rápidas contra otros jugadores
- **PPT Online**: Juego de Piedra, Papel o Tijera multijugador

## Próximos pasos
- Añadir más minijuegos 2D
- Implementar sistema de rankings
- Crear torneos y eventos
- Añadir más funcionalidades de RP
