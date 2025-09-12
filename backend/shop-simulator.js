// backend/shop-simulator.js
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: [
      "http://localhost:5173", 
      "http://127.0.0.1:5173",
      process.env.FRONTEND_URL || "http://localhost:5173"
    ].filter(Boolean),
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

// Persistencia en JSON (partidas, ranking e inventarios)
const DATA_DIR = path.join(__dirname, 'data');
const SAVE_FILE = path.join(DATA_DIR, 'shop-state.json');
try {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
} catch (e) {
  console.error('[SHOP] Error creando directorio de datos:', e);
}

function safeReadJSON(file) {
  try {
    if (!fs.existsSync(file)) return null;
    const raw = fs.readFileSync(file, 'utf-8');
    return JSON.parse(raw);
  } catch (e) {
    console.error('[SHOP] Error leyendo JSON:', file, e);
    return null;
  }
}

function safeWriteJSON(file, data) {
  try {
    fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf-8');
  } catch (e) {
    console.error('[SHOP] Error escribiendo JSON:', file, e);
  }
}

// NPCs con personalidades y diálogos reales
const NPC_TYPES = {
  'maria_gonzalez': {
    nombre: 'María González',
    tipo: 'Ama de casa',
    icon: '👩',
    sprite: 'woman_1',
    personalidad: 'amigable',
    presupuesto: { min: 15, max: 35 },
    productos_favoritos: ['fruta', 'pan', 'leche', 'huevos'],
    productos_evita: ['alcohol', 'cigarrillos'],
    paciencia: 25,
    diálogos: {
      entrada: [
        "¡Hola! ¿Cómo está el día?",
        "Buenos días, necesito hacer algunas compras",
        "¡Qué tienda tan bonita!",
        "Hola, ¿tienen frutas frescas?"
      ],
      compra: [
        "Perfecto, me llevo esto",
        "¡Excelente precio!",
        "Justo lo que necesitaba",
        "¿Puede ser un poco más barato?"
      ],
      despedida: [
        "¡Gracias! Que tenga buen día",
        "Hasta la próxima",
        "¡Adiós!",
        "Que le vaya bien"
      ]
    }
  },
  'carlos_rodriguez': {
    nombre: 'Carlos Rodríguez',
    tipo: 'Ejecutivo',
    icon: '👨‍💼',
    sprite: 'man_1',
    personalidad: 'apresurado',
    presupuesto: { min: 20, max: 50 },
    productos_favoritos: ['cafe', 'sandwich', 'periodico', 'energizante'],
    productos_evita: ['dulces', 'juguetes'],
    paciencia: 12,
    diálogos: {
      entrada: [
        "Necesito algo rápido, estoy apurado",
        "¿Tienen café?",
        "Solo paso a comprar algo",
        "¿Cuánto tiempo va a tardar?"
      ],
      compra: [
        "Dame lo más rápido",
        "¿Tienen algo más barato?",
        "Está bien, me lo llevo",
        "¿Puede ser más rápido?"
      ],
      despedida: [
        "Gracias, tengo prisa",
        "Hasta luego",
        "Adiós"
      ]
    }
  },
  'ana_martinez': {
    nombre: 'Ana Martínez',
    tipo: 'Estudiante',
    icon: '👩‍🎓',
    sprite: 'woman_2',
    personalidad: 'curiosa',
    presupuesto: { min: 5, max: 15 },
    productos_favoritos: ['snack', 'bebida', 'revista', 'dulce'],
    productos_evita: ['alcohol', 'cigarrillos'],
    paciencia: 20,
    diálogos: {
      entrada: [
        "¡Hola! ¿Qué tal?",
        "¿Tienen algo barato?",
        "¡Qué linda tienda!",
        "¿Cuánto cuesta esto?"
      ],
      compra: [
        "¿Puede ser más barato?",
        "¡Genial!",
        "¿Tienen descuento para estudiantes?",
        "Está bien, me lo llevo"
      ],
      despedida: [
        "¡Gracias! ¡Hasta luego!",
        "¡Adiós!",
        "¡Que tengas buen día!"
      ]
    }
  },
  'jose_lopez': {
    nombre: 'José López',
    tipo: 'Anciano',
    icon: '👴',
    sprite: 'man_2',
    personalidad: 'tranquilo',
    presupuesto: { min: 10, max: 25 },
    productos_favoritos: ['medicina', 'fruta', 'periodico', 'pan'],
    productos_evita: ['energizante', 'alcohol'],
    paciencia: 30,
    diálogos: {
      entrada: [
        "Buenos días, joven",
        "¿Cómo está?",
        "Necesito mis medicinas",
        "¿Tienen el periódico de hoy?"
      ],
      compra: [
        "Muy bien, me lo llevo",
        "¿Cuánto es en total?",
        "Está bien el precio",
        "¿Puede ayudarme con el cambio?"
      ],
      despedida: [
        "Muchas gracias, joven",
        "Que Dios lo bendiga",
        "Hasta la próxima",
        "Cuídese mucho"
      ]
    }
  },
  'sofia_hernandez': {
    nombre: 'Sofía Hernández',
    tipo: 'Madre con niños',
    icon: '👩‍👧‍👦',
    sprite: 'woman_3',
    personalidad: 'estresada',
    presupuesto: { min: 25, max: 45 },
    productos_favoritos: ['leche', 'pan', 'fruta', 'juguete', 'dulce'],
    productos_evita: ['alcohol', 'cigarrillos'],
    paciencia: 15,
    diálogos: {
      entrada: [
        "¡Ay, por fin! Necesito muchas cosas",
        "Los niños están inquietos",
        "¿Tienen juguetes baratos?",
        "Necesito hacer compras rápidas"
      ],
      compra: [
        "Perfecto, me llevo todo esto",
        "¿Puede ser más rápido?",
        "Los niños no pueden esperar",
        "Está bien, gracias"
      ],
      despedida: [
        "¡Gracias! Los niños están felices",
        "Hasta la próxima",
        "¡Adiós!"
      ]
    }
  }
};

// Productos realistas de tienda
const PRODUCTOS = {
  'pan': { nombre: 'Pan', precio: 2, stock: 20, icon: '🍞', categoria: 'panaderia', descripcion: 'Pan fresco del día' },
  'leche': { nombre: 'Leche', precio: 3, stock: 15, icon: '🥛', categoria: 'lacteos', descripcion: 'Leche entera 1L' },
  'huevos': { nombre: 'Huevos', precio: 4, stock: 12, icon: '🥚', categoria: 'lacteos', descripcion: 'Docena de huevos frescos' },
  'fruta': { nombre: 'Frutas', precio: 5, stock: 18, icon: '🍎', categoria: 'frutas', descripcion: 'Mezcla de frutas frescas' },
  'cafe': { nombre: 'Café', precio: 6, stock: 25, icon: '☕', categoria: 'bebidas', descripcion: 'Café colombiano molido' },
  'sandwich': { nombre: 'Sandwich', precio: 8, stock: 10, icon: '🥪', categoria: 'comida', descripcion: 'Sandwich de jamón y queso' },
  'periodico': { nombre: 'Periódico', precio: 1, stock: 30, icon: '📰', categoria: 'prensa', descripcion: 'Periódico del día' },
  'revista': { nombre: 'Revista', precio: 4, stock: 8, icon: '📖', categoria: 'prensa', descripcion: 'Revista de moda' },
  'medicina': { nombre: 'Medicina', precio: 15, stock: 5, icon: '💊', categoria: 'farmacia', descripcion: 'Analgésico genérico' },
  'dulce': { nombre: 'Dulces', precio: 3, stock: 22, icon: '🍭', categoria: 'dulces', descripcion: 'Caramelos variados' },
  'juguete': { nombre: 'Juguete', precio: 12, stock: 6, icon: '🧸', categoria: 'juguetes', descripcion: 'Peluche pequeño' },
  'energizante': { nombre: 'Energizante', precio: 5, stock: 15, icon: '⚡', categoria: 'bebidas', descripcion: 'Bebida energética' },
  'alcohol': { nombre: 'Cerveza', precio: 8, stock: 8, icon: '🍺', categoria: 'alcohol', descripcion: 'Cerveza nacional' },
  'cigarrillos': { nombre: 'Cigarrillos', precio: 20, stock: 3, icon: '🚬', categoria: 'tabaco', descripcion: 'Cajetilla de cigarrillos' }
};

// Estantes de la tienda
const ESTANTES = {
  'panaderia': { nombre: 'Panadería', posicion: { x: 150, y: 200 }, productos: ['pan'] },
  'lacteos': { nombre: 'Lácteos', posicion: { x: 300, y: 200 }, productos: ['leche', 'huevos'] },
  'frutas': { nombre: 'Frutas y Verduras', posicion: { x: 450, y: 200 }, productos: ['fruta'] },
  'bebidas': { nombre: 'Bebidas', posicion: { x: 600, y: 200 }, productos: ['cafe', 'energizante', 'alcohol'] },
  'comida': { nombre: 'Comida Rápida', posicion: { x: 150, y: 350 }, productos: ['sandwich'] },
  'prensa': { nombre: 'Prensa', posicion: { x: 300, y: 350 }, productos: ['periodico', 'revista'] },
  'farmacia': { nombre: 'Farmacia', posicion: { x: 450, y: 350 }, productos: ['medicina'] },
  'dulces': { nombre: 'Dulces', posicion: { x: 600, y: 350 }, productos: ['dulce'] },
  'juguetes': { nombre: 'Juguetes', posicion: { x: 150, y: 500 }, productos: ['juguete'] },
  'tabaco': { nombre: 'Tabaco', posicion: { x: 300, y: 500 }, productos: ['cigarrillos'] }
};

// Salas de juego
const salas = new Map();

function serializeState() {
  return {
    salas: Array.from(salas.values()).map(s => s.serialize())
  };
}

function loadState() {
  const json = safeReadJSON(SAVE_FILE);
  if (!json || !json.salas) return;
  json.salas.forEach(s => {
    const sala = new SalaTienda(s.id);
    sala.hydrate(s);
    salas.set(sala.id, sala);
  });
  console.log(`[SHOP] Estado cargado: ${salas.size} sala(s)`);
}

function saveState() {
  const snapshot = serializeState();
  safeWriteJSON(SAVE_FILE, snapshot);
}

class SalaTienda {
  constructor(id) {
    this.id = id;
    this.jugadores = new Map();
    this.npcs = []; // NPCs en la tienda
    this.tiempoRestante = 300; // 5 minutos
    this.estado = 'esperando'; // esperando, jugando, terminado
    this.ranking = [];
    this.timer = null;
    this.estantes = { ...ESTANTES };
    this.cajaRegistradora = { x: 700, y: 300, ocupada: false, jugador: null };
  }

  serialize() {
    return {
      id: this.id,
      jugadores: Array.from(this.jugadores.values()),
      npcs: this.npcs,
      tiempoRestante: this.tiempoRestante,
      estado: this.estado,
      ranking: this.ranking,
      estantes: this.estantes,
      cajaRegistradora: this.cajaRegistradora
    };
  }

  hydrate(data) {
    try {
      this.npcs = Array.isArray(data.npcs) ? data.npcs : [];
      this.tiempoRestante = Number.isFinite(data.tiempoRestante) ? data.tiempoRestante : 300;
      this.estado = data.estado || 'esperando';
      this.ranking = Array.isArray(data.ranking) ? data.ranking : [];
      this.estantes = data.estantes || this.estantes;
      this.cajaRegistradora = data.cajaRegistradora || this.cajaRegistradora;
      if (Array.isArray(data.jugadores)) {
        data.jugadores.forEach(j => this.jugadores.set(j.id, j));
      }
    } catch (e) {
      console.error('[SHOP] Error hidratando sala', this.id, e);
    }
  }

  agregarJugador(socketId, username) {
    if (this.jugadores.size >= 4) return false;
    
    this.jugadores.set(socketId, {
      id: socketId,
      username,
      dinero: 1000, // Dinero inicial
      inventario: this.crearInventarioInicial(),
      clientesAtendidos: 0,
      satisfaccion: 0,
      posicion: { x: 100, y: 300 },
      enCaja: false,
      productosEnMano: [],
      estado: 'caminando' // caminando, atendiendo, en_caja
    });
    
    return true;
  }

  crearInventarioInicial() {
    const inventario = {};
    for (const [key, producto] of Object.entries(PRODUCTOS)) {
      inventario[key] = { ...producto, stock: Math.floor(Math.random() * 10) + 5 };
    }
    return inventario;
  }

  removerJugador(socketId) {
    const jugador = this.jugadores.get(socketId);
    if (jugador && jugador.enCaja) {
      this.cajaRegistradora.ocupada = false;
      this.cajaRegistradora.jugador = null;
    }
    this.jugadores.delete(socketId);
  }

  iniciarJuego() {
    if (this.jugadores.size < 1) return false;
    
    this.estado = 'jugando';
    this.tiempoRestante = 300;
    
    // Generar NPCs iniciales
    this.generarNPC();
    
    // Timer del juego
    this.timer = setInterval(() => {
      this.tiempoRestante--;
      
      if (this.tiempoRestante <= 0) {
        this.terminarJuego();
      } else {
        // Generar NPC cada 5-15 segundos
        if (Math.random() < 0.2) {
          this.generarNPC();
        }
        
        this.actualizarNPCs();
        this.emitirEstado();
      }
    }, 1000);
    
    return true;
  }

  generarNPC() {
    if (this.npcs.length >= 6) return; // Máximo 6 NPCs
    
    const tiposNPC = Object.keys(NPC_TYPES);
    const tipo = tiposNPC[Math.floor(Math.random() * tiposNPC.length)];
    const npcData = NPC_TYPES[tipo];
    
    const npc = {
      id: Date.now() + Math.random(),
      tipo,
      ...npcData,
      posicion: { x: 50, y: 300 + Math.random() * 100 },
      tiempoLlegada: Date.now(),
      estado: 'entrando', // entrando, caminando, esperando, comprando, yendo
      productosDeseados: this.generarListaCompras(npcData),
      presupuesto: Math.floor(Math.random() * (npcData.presupuesto.max - npcData.presupuesto.min + 1)) + npcData.presupuesto.min,
      carrito: [],
      destino: null,
      dialogoActual: null,
      tiempoEspera: 0
    };
    
    this.npcs.push(npc);
  }

  generarListaCompras(npcData) {
    const lista = [];
    const cantidad = Math.floor(Math.random() * 4) + 1; // 1-4 productos
    
    // Añadir productos favoritos
    for (let i = 0; i < cantidad && i < npcData.productos_favoritos.length; i++) {
      const producto = npcData.productos_favoritos[i];
      if (Math.random() < 0.8) { // 80% de probabilidad
        lista.push({
          producto,
          cantidad: Math.floor(Math.random() * 3) + 1,
          prioridad: 'alta'
        });
      }
    }
    
    // Añadir productos aleatorios
    const productosDisponibles = Object.keys(PRODUCTOS).filter(p => 
      !npcData.productos_evita.includes(p) && !lista.some(l => l.producto === p)
    );
    
    while (lista.length < cantidad && productosDisponibles.length > 0) {
      const producto = productosDisponibles[Math.floor(Math.random() * productosDisponibles.length)];
      lista.push({
        producto,
        cantidad: Math.floor(Math.random() * 2) + 1,
        prioridad: 'media'
      });
      productosDisponibles.splice(productosDisponibles.indexOf(producto), 1);
    }
    
    return lista;
  }

  actualizarNPCs() {
    const ahora = Date.now();
    
    this.npcs.forEach(npc => {
      switch (npc.estado) {
        case 'entrando':
          npc.posicion.x += 2;
          if (npc.posicion.x > 100) {
            npc.estado = 'caminando';
            npc.destino = this.obtenerDestinoAleatorio();
          }
          break;
          
        case 'caminando':
          if (npc.destino) {
            const dx = npc.destino.x - npc.posicion.x;
            const dy = npc.destino.y - npc.posicion.y;
            const distancia = Math.sqrt(dx * dx + dy * dy);
            
            if (distancia < 5) {
              npc.estado = 'esperando';
              npc.tiempoEspera = 0;
            } else {
              npc.posicion.x += (dx / distancia) * 1.5;
              npc.posicion.y += (dy / distancia) * 1.5;
            }
          }
          break;
          
        case 'esperando':
          npc.tiempoEspera++;
          if (npc.tiempoEspera > npc.paciencia) {
            npc.estado = 'yendo';
            npc.destino = { x: 50, y: npc.posicion.y };
          }
          break;
          
        case 'yendo':
          const dx = npc.destino.x - npc.posicion.x;
          const dy = npc.destino.y - npc.posicion.y;
          const distancia = Math.sqrt(dx * dx + dy * dy);
          
          if (distancia < 5) {
            // NPC se va
            this.npcs = this.npcs.filter(n => n.id !== npc.id);
          } else {
            npc.posicion.x += (dx / distancia) * 1.5;
            npc.posicion.y += (dy / distancia) * 1.5;
          }
          break;
      }
    });
  }

  obtenerDestinoAleatorio() {
    const estantes = Object.values(this.estantes);
    const estante = estantes[Math.floor(Math.random() * estantes.length)];
    return { x: estante.posicion.x, y: estante.posicion.y };
  }

  interactuarConNPC(socketId, npcId) {
    const jugador = this.jugadores.get(socketId);
    const npc = this.npcs.find(n => n.id === npcId);
    
    if (!jugador || !npc || npc.estado !== 'esperando') return false;
    
    // Mostrar diálogo de entrada
    const dialogos = npc.diálogos.entrada;
    npc.dialogoActual = dialogos[Math.floor(Math.random() * dialogos.length)];
    
    // Cambiar estado del NPC
    npc.estado = 'comprando';
    npc.tiempoEspera = 0;
    
    return {
      npc: npc,
      dialogo: npc.dialogoActual,
      productosDisponibles: this.obtenerProductosDisponibles(jugador, npc)
    };
  }

  obtenerProductosDisponibles(jugador, npc) {
    const disponibles = [];
    
    for (const item of npc.productosDeseados) {
      const producto = jugador.inventario[item.producto];
      if (producto && producto.stock > 0) {
        disponibles.push({
          ...PRODUCTOS[item.producto],
          cantidadDisponible: producto.stock,
          cantidadDeseada: item.cantidad,
          prioridad: item.prioridad
        });
      }
    }
    
    return disponibles;
  }

  venderProductos(socketId, npcId, productosVendidos) {
    const jugador = this.jugadores.get(socketId);
    const npc = this.npcs.find(n => n.id === npcId);
    
    if (!jugador || !npc || npc.estado !== 'comprando') return false;
    
    let totalVenta = 0;
    let satisfaccion = 0;
    
    for (const venta of productosVendidos) {
      const producto = jugador.inventario[venta.producto];
      if (producto && producto.stock >= venta.cantidad) {
        const precio = PRODUCTOS[venta.producto].precio;
        const subtotal = precio * venta.cantidad;
        totalVenta += subtotal;
        
        // Reducir stock
        producto.stock -= venta.cantidad;
        
        // Calcular satisfacción
        const itemDeseado = npc.productosDeseados.find(p => p.producto === venta.producto);
        if (itemDeseado) {
          const porcentajeCantidad = Math.min(venta.cantidad / itemDeseado.cantidad, 1);
          satisfaccion += porcentajeCantidad * (itemDeseado.prioridad === 'alta' ? 30 : 20);
        }
      }
    }
    
    // Verificar presupuesto
    if (totalVenta > npc.presupuesto) {
      npc.dialogoActual = "Es demasiado caro para mí...";
      return { exito: false, mensaje: "El NPC no tiene suficiente dinero" };
    }
    
    // Aplicar satisfacción
    if (satisfaccion >= 80) {
      totalVenta *= 1.2; // 20% bonus
      npc.dialogoActual = npc.diálogos.compra[Math.floor(Math.random() * npc.diálogos.compra.length)];
    } else if (satisfaccion >= 50) {
      totalVenta *= 1.1; // 10% bonus
      npc.dialogoActual = "Está bien, me lo llevo";
    } else {
      npc.dialogoActual = "No es exactamente lo que quería...";
    }
    
    // Actualizar jugador
    jugador.dinero += Math.floor(totalVenta);
    jugador.clientesAtendidos++;
    jugador.satisfaccion += satisfaccion;
    
    // NPC se va
    npc.estado = 'yendo';
    npc.destino = { x: 50, y: npc.posicion.y };
    npc.dialogoActual = npc.diálogos.despedida[Math.floor(Math.random() * npc.diálogos.despedida.length)];
    
    return { exito: true, totalVenta: Math.floor(totalVenta), satisfaccion };
  }

  moverJugador(socketId, x, y) {
    const jugador = this.jugadores.get(socketId);
    if (!jugador) return;
    
    jugador.posicion.x = Math.max(50, Math.min(750, x));
    jugador.posicion.y = Math.max(100, Math.min(550, y));
    
    // Verificar si está cerca de la caja registradora
    const distanciaCaja = Math.sqrt(
      Math.pow(jugador.posicion.x - this.cajaRegistradora.x, 2) + 
      Math.pow(jugador.posicion.y - this.cajaRegistradora.y, 2)
    );
    
    if (distanciaCaja < 30 && !this.cajaRegistradora.ocupada) {
      jugador.enCaja = true;
      this.cajaRegistradora.ocupada = true;
      this.cajaRegistradora.jugador = socketId;
    } else if (distanciaCaja >= 30 && jugador.enCaja) {
      jugador.enCaja = false;
      this.cajaRegistradora.ocupada = false;
      this.cajaRegistradora.jugador = null;
    }
  }

  terminarJuego() {
    this.estado = 'terminado';
    clearInterval(this.timer);
    
    // Calcular ranking
    this.ranking = Array.from(this.jugadores.values())
      .sort((a, b) => b.dinero - a.dinero)
      .map((jugador, index) => ({
        ...jugador,
        posicion: index + 1
      }));
  }

  emitirEstado() {
    const estado = {
      id: this.id,
      jugadores: Array.from(this.jugadores.values()),
      npcs: this.npcs,
      estantes: this.estantes,
      cajaRegistradora: this.cajaRegistradora,
      tiempoRestante: this.tiempoRestante,
      estado: this.estado,
      ranking: this.ranking
    };
    
    io.to(this.id).emit('estadoTienda', estado);
  }
}

// Socket.IO events
io.on('connection', (socket) => {
  console.log('Cliente conectado al Simulador de Tienda:', socket.id);

  socket.on('unirseSala', (data) => {
    const { salaId, username } = data;
    
    if (!salas.has(salaId)) {
      salas.set(salaId, new SalaTienda(salaId));
    }
    
    const sala = salas.get(salaId);
    
    if (sala.agregarJugador(socket.id, username)) {
      socket.join(salaId);
      socket.emit('unidoSala', { success: true, salaId });
      sala.emitirEstado();
      saveState();
    } else {
      socket.emit('unidoSala', { success: false, error: 'Sala llena' });
    }
  });

  socket.on('iniciarJuego', (data) => {
    const { salaId } = data;
    const sala = salas.get(salaId);
    
    if (sala && sala.jugadores.has(socket.id)) {
      if (sala.iniciarJuego()) {
        socket.emit('juegoIniciado', { success: true });
        saveState();
      } else {
        socket.emit('juegoIniciado', { success: false, error: 'No se pudo iniciar el juego' });
      }
    }
  });

  socket.on('interactuarNPC', (data) => {
    const { salaId, npcId } = data;
    const sala = salas.get(salaId);
    
    if (sala && sala.jugadores.has(socket.id)) {
      const resultado = sala.interactuarConNPC(socket.id, npcId);
      if (resultado) {
        socket.emit('npcInteractuado', resultado);
        saveState();
      } else {
        socket.emit('npcInteractuado', { success: false, mensaje: 'No se puede interactuar con este NPC' });
      }
    }
  });

  socket.on('venderProductos', (data) => {
    const { salaId, npcId, productos } = data;
    const sala = salas.get(salaId);
    
    if (sala && sala.jugadores.has(socket.id)) {
      const resultado = sala.venderProductos(socket.id, npcId, productos);
      socket.emit('ventaRealizada', resultado);
      saveState();
    }
  });

  socket.on('moverJugador', (data) => {
    const { salaId, x, y } = data;
    const sala = salas.get(salaId);
    
    if (sala && sala.jugadores.has(socket.id)) {
      sala.moverJugador(socket.id, x, y);
      sala.emitirEstado();
    }
  });

  socket.on('disconnect', () => {
    console.log('Cliente desconectado:', socket.id);
    
    // Remover de todas las salas
    for (const [salaId, sala] of salas) {
      if (sala.jugadores.has(socket.id)) {
        sala.removerJugador(socket.id);
        sala.emitirEstado();
        saveState();
        
        // Si no hay jugadores, eliminar sala
        if (sala.jugadores.size === 0) {
          salas.delete(salaId);
        }
        break;
      }
    }
  });
});

// Cargar estado al iniciar
loadState();

// Guardado periódico
setInterval(() => {
  try { saveState(); } catch (e) { console.error('[SHOP] Error guardado periódico:', e); }
}, 10000);

// Guardar al cerrar
process.on('SIGINT', () => { try { saveState(); } catch {} process.exit(0); });
process.on('SIGTERM', () => { try { saveState(); } catch {} process.exit(0); });

const PORT = process.env.PORT || 4002;
server.listen(PORT, () => {
  console.log(`Simulador de Tienda escuchando en puerto ${PORT}`);
});

module.exports = { app, server, io };
