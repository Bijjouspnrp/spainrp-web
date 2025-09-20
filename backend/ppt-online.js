// Piedra, Papel o Tijera Online - Backend Express + Socket.IO
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: [
      'https://spainrp-oficial.onrender.com',
      'http://127.0.0.1:5173',
      process.env.FRONTEND_URL || 'https://spainrp-oficial.onrender.com'
    ].filter(Boolean),
    methods: ['GET', 'POST']
  }
});

app.use(cors());
app.get('/', (req, res) => res.send('PPT Online API'));

// Estado de salas en memoria
const salas = {};

io.on('connection', (socket) => {
  // Unirse a una sala
  socket.on('joinSala', ({ salaId, username }) => {
    if (!salas[salaId]) {
      salas[salaId] = { jugadores: [], jugadas: {}, scores: {}, ready: false };
    }
    if (salas[salaId].jugadores.length < 2 && !salas[salaId].jugadores.includes(username)) {
      salas[salaId].jugadores.push(username);
      salas[salaId].scores[username] = 0;
      socket.join(salaId);
      io.to(salaId).emit('salaUpdate', salas[salaId]);
      if (salas[salaId].jugadores.length === 2) {
        salas[salaId].ready = true;
        io.to(salaId).emit('salaReady', salas[salaId]);
      }
    }
  });

  // Recibir jugada
  socket.on('jugar', ({ salaId, username, jugada }) => {
    if (!salas[salaId]) return;
    salas[salaId].jugadas[username] = jugada;
    io.to(salaId).emit('jugadaUpdate', salas[salaId].jugadas);
    // Si ambos han jugado
    if (Object.keys(salas[salaId].jugadas).length === 2) {
      const [p1, p2] = salas[salaId].jugadores;
      const j1 = salas[salaId].jugadas[p1];
      const j2 = salas[salaId].jugadas[p2];
      let resultado = {};
      if (j1 === j2) {
        resultado = { empate: true };
      } else if (
        (j1 === 'Piedra' && j2 === 'Tijera') ||
        (j1 === 'Papel' && j2 === 'Piedra') ||
        (j1 === 'Tijera' && j2 === 'Papel')
      ) {
        salas[salaId].scores[p1]++;
        resultado = { ganador: p1 };
      } else {
        salas[salaId].scores[p2]++;
        resultado = { ganador: p2 };
      }
      io.to(salaId).emit('resultado', { ...resultado, scores: salas[salaId].scores, jugadas: { [p1]: j1, [p2]: j2 } });
      // Reset jugadas para la siguiente ronda
      salas[salaId].jugadas = {};
    }
  });

  // Salir de sala
  socket.on('leaveSala', ({ salaId, username }) => {
    if (salas[salaId]) {
      salas[salaId].jugadores = salas[salaId].jugadores.filter(j => j !== username);
      delete salas[salaId].scores[username];
      if (salas[salaId].jugadores.length === 0) delete salas[salaId];
      else io.to(salaId).emit('salaUpdate', salas[salaId]);
    }
    socket.leave(salaId);
  });

  socket.on('disconnecting', () => {
    for (const salaId of socket.rooms) {
      if (salas[salaId]) {
        salas[salaId].jugadores = salas[salaId].jugadores.filter(j => j !== socket.id);
        if (salas[salaId].jugadores.length === 0) delete salas[salaId];
      }
    }
  });
});

const PORT = process.env.PORT || 4001;
server.listen(PORT, () => console.log('PPT Online backend listening on port', PORT));
