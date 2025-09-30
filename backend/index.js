
// backend/index.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const authRoutes = require('./auth');
const discordRoutes = require('./routes/discord');
const multiroleRoutes = require('./routes/multirole');
const tinderRoutes = require('./routes/tinder');
const robloxRoutes = require('./routes/roblox');
const adminRecordsRoutes = require('./routes/adminRecords');
const notificationRoutes = require('./routes/notifications');
const session = require('express-session');
const passport = require('passport');
const multer = require('multer');

// Declaraciones de multer para uploads
const uploadNews = multer({ dest: path.join(__dirname, '../uploads/news') });
const uploadAnnouncements = multer({ dest: path.join(__dirname, '../uploads/news') });
const uploadDM = multer();

// --- DISCORD BOT INTEGRATION ---
const { Client, GatewayIntentBits, ChannelType, PermissionsBitField } = require('discord.js');
const { Partials } = require('discord.js');

const TOKEN = process.env.DISCORD_BOT_TOKEN;

const discordClient = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.DirectMessageReactions,
    GatewayIntentBits.DirectMessageTyping,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildMessageTyping,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildInvites,
    GatewayIntentBits.GuildIntegrations,
    GatewayIntentBits.GuildWebhooks,
    GatewayIntentBits.GuildEmojisAndStickers,
    GatewayIntentBits.GuildScheduledEvents
  ],
  partials: [Partials.Channel]
});

// Variables globales para el bot
let staffLogs = [];
let dmReplies = {};
let dmCollector = [];
let commandLogs = [];
let internalNotes = {};
let calendarData = {};
// Solo una inicialización de app:

const app = express();

// Configuración de CORS al principio
app.use(cors({
  origin: [
    'https://spainrp-oficial.onrender.com', 
    'https://spainrp-web.onrender.com',
    'http://127.0.0.1:5173',
    process.env.PUBLIC_BASE_URL || 'https://spainrp-oficial.onrender.com'
  ].filter(Boolean),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Cookie', 'Accept', 'Origin']
}));

// Middleware adicional para manejar preflight OPTIONS
app.options('*', (req, res) => {
  console.log('[CORS] Preflight OPTIONS request:', {
    origin: req.headers.origin,
    method: req.headers['access-control-request-method'],
    headers: req.headers['access-control-request-headers'],
    timestamp: new Date().toISOString()
  });
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Cookie, Accept, Origin');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.status(200).end();
});

app.use(express.json());

// Configuración mejorada de sesiones
app.use(session({
  secret: process.env.SESSION_SECRET || 'i5vVTN3rl757mW5dMFkwV8nwAnkbVk1B',
  resave: true, // Forzar guardado en cada request
  saveUninitialized: true, // Guardar sesiones no inicializadas
  rolling: true, // renueva caducidad en cada interacción
  cookie: {
    httpOnly: true, // Seguridad
    secure: true, // Habilitado para sameSite: 'none'
    sameSite: 'none', // Para cross-domain
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días
    domain: '.onrender.com' // Habilitado para compartir entre subdominios
  },
  name: 'spainrp.sid' // Nombre específico para evitar conflictos
}));

// Middleware para renovar maxAge en cada request autenticado
app.use((req, res, next) => {
  if (req.session && req.isAuthenticated && req.isAuthenticated()) {
    req.session.cookie.maxAge = 7 * 24 * 60 * 60 * 1000;
    req.session.touch && req.session.touch();
  }
  next();
});

app.use(passport.initialize());
app.use(passport.session());

// Registrar rutas protegidas DESPUÉS de session/passport
app.use('/api/tinder', tinderRoutes);
app.use('/api/roblox', robloxRoutes);
app.use('/api/admin-records', adminRecordsRoutes);
app.use('/api/notifications', notificationRoutes);

// --- SOCKET.IO para notificaciones en tiempo real ---
const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io');

// Configurar Socket.IO
const io = new Server(server, {
  cors: {
    origin: [
      'https://spainrp-oficial.onrender.com', 
      'https://spainrp-web.onrender.com',
      'http://127.0.0.1:5173',
      process.env.PUBLIC_BASE_URL || 'https://spainrp-oficial.onrender.com'
    ].filter(Boolean),
    credentials: true
  }
});

// Manejar conexiones WebSocket
io.on('connection', (socket) => {
  console.log('[WEBSOCKET] Usuario conectado:', socket.id);
  
  // Unirse a la sala de notificaciones
  socket.join('notifications');
  
  socket.on('disconnect', () => {
    console.log('[WEBSOCKET] Usuario desconectado:', socket.id);
  });
});

// Función para enviar notificaciones a todos los usuarios conectados
const broadcastNotification = (notification) => {
  io.to('notifications').emit('notification', {
    type: 'notification',
    notification: notification
  });
  console.log('[WEBSOCKET] Notificación enviada a todos los usuarios:', notification.title);
};

// Exportar la función para usar en las rutas
global.broadcastNotification = broadcastNotification;
const nodemailer = require('nodemailer');

// --- Subscriptores de mantenimiento (almacenados en JSON) ---
const DATA_DIR = path.join(__dirname, 'data');
const MAINT_SUBS_FILE = path.join(DATA_DIR, 'maintenance-subscribers.json');
try { if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true }); } catch {}
function readMaintSubs(){
  try { if (!fs.existsSync(MAINT_SUBS_FILE)) return []; return JSON.parse(fs.readFileSync(MAINT_SUBS_FILE,'utf8')); } catch { return []; }
}
function writeMaintSubs(arr){
  try { fs.writeFileSync(MAINT_SUBS_FILE, JSON.stringify(arr, null, 2), 'utf8'); } catch {}
}

// --- Nodemailer transporter (desde variables de entorno) ---
let mailTransporter = null;
// Fallback hardcoded (temporal). Sustituye por tus credenciales reales
const HARDCODED_SMTP = {
  host: 'smtp.gmail.com',
  port: 587,
  user: 'bijjou433@gmail.com',           // <- cambia esto
  pass: 'owps bpyt fvpp jstf'  // <- cambia esto (App Password)
};
function getTransporter(){
  if (mailTransporter) return mailTransporter;
  // Preferir variables de entorno si existen
  let host = process.env.SMTP_HOST;
  let port = parseInt(process.env.SMTP_PORT || '587', 10);
  let user = process.env.SMTP_USER;
  let pass = process.env.SMTP_PASS;
  // Si no hay .env configurado, usar hardcode temporal
  if (!host || !user || !pass) {
    host = HARDCODED_SMTP.host;
    port = HARDCODED_SMTP.port;
    user = HARDCODED_SMTP.user;
    pass = HARDCODED_SMTP.pass;
  }
  if (!host || !user || !pass || user.includes('TU_CORREO')) {
    console.warn('[MAIL] Transporter no configurado (faltan credenciales). Define .env o actualiza HARDCODED_SMTP.');
    return null;
  }
  console.log('[MAIL] Configurando transporter SMTP', { host, port, user: `${String(user).slice(0,2)}***` });
  mailTransporter = nodemailer.createTransport({ host, port, auth: { user, pass } });
  return mailTransporter;
}

// Emitir evento de mantenimiento a todos los clientes conectados
function emitMaintenanceState() {
  const isOn = fs.existsSync(MAINTENANCE_FILE);
  io.emit('maintenance', { maintenance: isOn });
}

// Vigilar cambios en el archivo de mantenimiento
function notifyMaintenanceEnded() {
  try {
    console.log('[MAINT] Detectado fin de mantenimiento. Preparando notificaciones...');
    // limpiar startedAt
    if (fs.existsSync(MAINTENANCE_START_FILE)) {
      try { fs.unlinkSync(MAINTENANCE_START_FILE); } catch {}
    }
    const subs = readMaintSubs();
    const transporter = getTransporter();
    if (!transporter) {
      console.warn('[MAINT][MAIL] Transporter no configurado (revisa SMTP en .env). No se enviarán emails.');
      return;
    }
    if (!Array.isArray(subs) || subs.length === 0) {
      console.log('[MAINT][MAIL] No hay suscriptores para notificar.');
      return;
    }
    const recipients = subs.map(s => s.email).filter(Boolean);
    if (recipients.length === 0) {
      console.log('[MAINT][MAIL] Lista de suscriptores sin emails válidos.');
      return;
    }
    const baseUrl = process.env.PUBLIC_BASE_URL || 'https://spainrp-oficial.onrender.com';
    const subject = '🚀 SpainRP vuelve a estar online';
    const text = `Hola,\n\n¡Buenas noticias! Hemos finalizado el mantenimiento y SpainRP ya está disponible de nuevo.\n\nNovedades:\n• Mejoras de rendimiento y estabilidad\n• Corrección de errores reportados\n• Preparativos para nuevas funciones\n\nEntra ahora: ${baseUrl}\nUnirte a Discord: https://discord.gg/spainrp\n\nGracias por tu paciencia.\n— Equipo SpainRP`;
    const html = `<!doctype html><html lang="es"><head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" /><title>SpainRP vuelve online</title><style>.btn{display:inline-block;padding:12px 20px;border-radius:10px;font-weight:700;text-decoration:none}</style></head><body style="margin:0;background:#0f1115;font-family:system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,'Helvetica Neue',sans-serif;color:#e5e7eb;"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;margin:0 auto;background:#151823;border:1px solid #202434;border-radius:14px;overflow:hidden"><tr><td style="padding:22px 22px 8px 22px;text-align:center;background:linear-gradient(135deg,#23153c 0,#160a10 100%)"><div style="font-size:24px;font-weight:900;color:#ffd54a;letter-spacing:.5px;text-shadow:0 0 14px rgba(255,213,74,.35)">SpainRP</div><div style="color:#b8b8b8;margin-top:6px">Mantenimiento finalizado</div></td></tr><tr><td style="padding:24px"><h1 style="margin:0 0 8px 0;color:#ffffff;font-size:22px;line-height:1.3">¡Ya estamos de vuelta! 🚀</h1><p style="margin:0 0 14px 0;color:#cbd5e1;font-size:15px;line-height:1.6">Hemos completado el mantenimiento y la web de <strong>SpainRP</strong> vuelve a estar disponible. Gracias por tu paciencia.</p><div style="background:#0f131b;border:1px solid #202434;border-radius:12px;padding:14px 16px;margin:12px 0"><div style="color:#9aa4b2;font-weight:700;margin-bottom:8px">Novedades</div><ul style="margin:0;color:#cbd5e1;padding-left:18px"><li>Mejoras de rendimiento y estabilidad</li><li>Corrección de errores reportados</li><li>Preparativos para nuevas funciones</li></ul></div><div style="text-align:center;margin:18px 0 6px 0"><a href="${baseUrl}" class="btn" style="background:#ff1744;color:#fff" target="_blank" rel="noopener">Entrar en SpainRP</a><a href="https://discord.gg/spainrp" class="btn" style="background:#232a3a;color:#e5e7eb;margin-left:8px;border:1px solid #334155" target="_blank" rel="noopener">Unirme a Discord</a></div><p style="margin:16px 0 0 0;color:#94a3b8;font-size:13px;line-height:1.6">Si no esperabas este correo, puedes ignorarlo. Este aviso se envió porque te suscribiste durante el mantenimiento.</p><p style="margin:12px 0 0 0;color:#64748b;font-size:12px">© ${new Date().getFullYear()} SpainRP. Todos los derechos reservados.</p></td></tr></table></body></html>`;
    const mailOptions = {
      from: process.env.MAIL_FROM || process.env.SMTP_USER || HARDCODED_SMTP.user,
      to: recipients.join(','),
      subject,
      text,
      html
    };
    console.log('[MAINT][MAIL] Enviando emails a:', recipients);
    transporter.sendMail(mailOptions).then((info)=>{
      console.log('[MAINT][MAIL] OK messageId=', info.messageId, 'response=', info.response);
      try {
        const LOG_DIR = path.join(__dirname, 'logs');
        if (!fs.existsSync(LOG_DIR)) fs.mkdirSync(LOG_DIR, { recursive: true });
        const EMAIL_LOG = path.join(LOG_DIR, 'email.log');
        fs.appendFileSync(EMAIL_LOG, `[${new Date().toISOString()}] OK recipients=${recipients.join(',')} messageId=${info.messageId || '-'}\n`);
      } catch {}
      // limpiar suscriptores
      writeMaintSubs([]);
    }).catch(err=>{
      console.error('[MAINT][MAIL] ERROR enviando emails:', err && (err.stack || err.message || String(err)));
      try {
        const LOG_DIR = path.join(__dirname, 'logs');
        if (!fs.existsSync(LOG_DIR)) fs.mkdirSync(LOG_DIR, { recursive: true });
        const EMAIL_LOG = path.join(LOG_DIR, 'email.log');
        fs.appendFileSync(EMAIL_LOG, `[${new Date().toISOString()}] ERR ${err && (err.stack || err.message || String(err))}\n`);
      } catch {}
    });
  } catch (e) {
    console.error('[MAINT] Error en notifyMaintenanceEnded:', e && (e.stack || e.message || String(e)));
  }
}

// watcher se define más abajo, tras declarar constantes

// Emitir estado actual al conectar
io.on('connection', (socket) => {
  socket.emit('maintenance', { maintenance: fs.existsSync(MAINTENANCE_FILE) });
});

// --- MODO MANTENIMIENTO GLOBAL ---
const MAINTENANCE_FILE = path.join(__dirname, 'maintenance.lock');
const MAINTENANCE_START_FILE = path.join(__dirname, 'maintenance.start');

// Iniciar watcher ahora que las constantes existen
try {
  fs.watchFile(MAINTENANCE_FILE, { interval: 500 }, () => {
    emitMaintenanceState();
    if (!fs.existsSync(MAINTENANCE_FILE)) {
      notifyMaintenanceEnded();
    }
  });
  console.log('[MAINT] watchFile activado sobre maintenance.lock');
} catch (e) { console.error('[MAINT] fs.watchFile error:', e); }
// Middleware de mantenimiento: debe ir ANTES de servir estáticos y rutas
app.use((req, res, next) => {
  if (fs.existsSync(MAINTENANCE_FILE)) {
    // Si no existe el archivo de inicio, créalo
    if (!fs.existsSync(MAINTENANCE_START_FILE)) {
      try { fs.writeFileSync(MAINTENANCE_START_FILE, Date.now().toString()); } catch {}
    }
    // Permitir acceso a /admin/maintenance-off, /api/maintenance (incluye /subscribe) y /socket.io
    if (
      req.path === '/admin/maintenance-off' ||
      req.path.startsWith('/api/maintenance') ||
      req.path.startsWith('/socket.io')
    ) {
      return next();
    }
    res.status(503).send(`
      <html style="background:#181a20;height:100%"><head><title>En mantenimiento</title>
      <meta name="viewport" content="width=device-width,initial-scale=1">
      <style>
        body { background: linear-gradient(135deg,#23272a 60%,#7289da 100%); min-height:100vh; display:flex; flex-direction:column; align-items:center; justify-content:center; color:#fff; font-family:'Bangers',Impact,sans-serif; }
        .emoji { font-size:5rem; animation: bounce 1.2s infinite alternate cubic-bezier(.2,.9,.2,1); }
        @keyframes bounce { 0%{transform:translateY(0);} 100%{transform:translateY(-18px) scale(1.08);} }
        h1 { font-size:3rem; color:#FFD700; text-shadow:2px 2px 0 #23272a,0 0 16px #7289da; margin-bottom:1.2rem; }
        .msg { font-size:1.5rem; color:#fff; margin-bottom:2rem; }
        .spin { display:inline-block; animation:spin 1.5s linear infinite; }
        @keyframes spin { 0%{transform:rotate(0deg);} 100%{transform:rotate(360deg);} }
      </style></head><body>
      <div class="emoji">🚧</div>
      <h1>Estado: En mantenimiento</h1>
      <div class="msg">Estamos actualizando la web.<br>Vuelve en unos minutos.<br><span class="spin"></span></div>
      </body></html>
    `);
    return;
  } else {
    // Mantenimiento desactivado: solo limpiar started file (notificaciones se envían vía watcher)
    try {
      if (fs.existsSync(MAINTENANCE_START_FILE)) {
        try { fs.unlinkSync(MAINTENANCE_START_FILE); } catch {}
      }
    } catch (e) {
      console.error('[MAINT] Error limpiando maintenance.start:', e);
    }
  }
  next();
});
// Endpoint para que el frontend consulte el estado de mantenimiento
app.get('/api/maintenance', (req, res) => {
  const isOn = fs.existsSync(MAINTENANCE_FILE);
  let startedAt = null;
  if (isOn && fs.existsSync(MAINTENANCE_START_FILE)) {
    try {
      startedAt = parseInt(fs.readFileSync(MAINTENANCE_START_FILE, 'utf8'), 10);
      if (isNaN(startedAt)) startedAt = null;
    } catch { startedAt = null; }
  }
  res.json({ maintenance: isOn, startedAt });
});
// Suscripción a aviso de mantenimiento (email o web push token)
app.post('/api/maintenance/subscribe', express.json(), (req, res) => {
  const { email, token } = req.body || {};
  // Validación básica de correo
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
  if (!email && !token) return res.status(400).json({ error: 'Proporciona email o token' });
  if (email && !emailRegex.test(String(email))) return res.status(400).json({ error: 'Email inválido' });
  const subs = readMaintSubs();
  const exists = subs.find(s => (email && s.email === email) || (token && s.token === token));
  if (exists) return res.json({ success: true, message: 'Ya suscrito' });
  const entry = { email: email || null, token: token || null, createdAt: new Date().toISOString() };
  subs.push(entry);
  writeMaintSubs(subs);
  res.json({ success: true });
});
// Servir imágenes de noticias
app.use('/uploads/news', express.static(path.join(__dirname, '../uploads/news')));

// El frontend se sirve desde spainrp-oficial.onrender.com

// Utilidad para fetchRoblox (igual que fetchDiscord)
const fetchRoblox = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));


// --- PROXY API BOLSA ---
const BOLSA_API_URL = process.env.BOLSA_API_URL || 'http://37.27.21.91:5021';
const fetchBolsa = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

// Consultar saldo del usuario
app.get('/api/proxy/bolsa/saldo/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const response = await fetchBolsa(`${BOLSA_API_URL}/api/bolsa/saldo/${encodeURIComponent(userId)}`);
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (e) {
    res.status(502).json({ error: 'Proxy error', details: String(e) });
  }
});
// Proxy: ban de Discord hacia el bot (localhost:3020)
app.post('/api/proxy/discord/ban', express.json(), async (req, res) => {
  try {
    const botRes = await fetchRoblox(`${process.env.BOT_API_URL || 'https://spainrp-web.onrender.com/'}/api/discord/ban`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body)
    });
    const data = await botRes.json();
    res.status(botRes.status).json(data);
  } catch (e) {
    res.status(502).json({ error: 'Proxy error', details: String(e) });
  }
});
// Proxy: actualizar precio de un activo (admin o sistema)
app.post('/api/proxy/bolsa/actualizar-precio', express.json(), async (req, res) => {
  try {
    const response = await fetchBolsa(`${BOLSA_API_URL}/api/bolsa/actualizar-precio`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body)
    });
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (e) {
    res.status(502).json({ error: 'Proxy error', details: String(e) });
  }
});
// --- PROXY: catálogo de activos desde localhost:3050 ---
app.get('/api/proxy/bolsa/activos', async (req, res) => {
  try {
    const response = await fetchBolsa(`${BOLSA_API_URL}/api/bolsa/activos`);
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (e) {
    res.status(502).json({ error: 'Proxy error', details: String(e) });
  }
});

// Proxy: actualizar varios precios de golpe
app.post('/api/proxy/bolsa/actualizar-precios', express.json(), async (req, res) => {
  try {
    const response = await fetchBolsa(`${BOLSA_API_URL}/api/bolsa/actualizar-precios`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body)
    });
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (e) {
    res.status(502).json({ error: 'Proxy error', details: String(e) });
  }
});

// Proxy: fluctuación automática de precios
app.post('/api/proxy/bolsa/fluctuar', express.json(), async (req, res) => {
  try {
    const response = await fetchBolsa(`${BOLSA_API_URL}/api/bolsa/fluctuar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body)
    });
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (e) {
    res.status(502).json({ error: 'Proxy error', details: String(e) });
  }
});
// Comprar activos
app.post('/api/proxy/bolsa/comprar', express.json(), async (req, res) => {
  try {
    const response = await fetchBolsa(`${BOLSA_API_URL}/api/bolsa/comprar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body)
    });
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (e) {
    res.status(502).json({ error: 'Proxy error', details: String(e) });
  }
});

// Vender activos
app.post('/api/proxy/bolsa/vender', express.json(), async (req, res) => {
  try {
    const response = await fetchBolsa(`${BOLSA_API_URL}/api/bolsa/vender`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body)
    });
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (e) {
    res.status(502).json({ error: 'Proxy error', details: String(e) });
  }
});

// Consultar inversiones del usuario
app.get('/api/proxy/bolsa/inversiones/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const response = await fetchBolsa(`${BOLSA_API_URL}/api/bolsa/inversiones/${encodeURIComponent(userId)}`);
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (e) {
    res.status(502).json({ error: 'Proxy error', details: String(e) });
  }
});


// Logger simple de peticiones (solo errores y rutas importantes)
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    // Solo loguear errores 4xx/5xx o rutas auth
    if (res.statusCode >= 400 || req.url.includes('/auth/')) {
    const ms = Date.now() - start;
      console.log(`[${res.statusCode >= 400 ? 'ERROR' : 'AUTH'}] ${req.method} ${req.url} -> ${res.statusCode} ${ms}ms`);
    }
  });
  next();
});



// Endpoint Discord widget público
app.get('/api/backend/discord/widget', async (req, res) => {
  try {
    const fetchDiscord = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
    const response = await fetchDiscord('https://discord.com/api/guilds/1212556680911650866/widget.json');
    const contentType = response.headers.get('content-type');
    if (!response.ok || !contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      console.error('[DISCORD WIDGET] Respuesta no JSON:', text);
      return res.json({ presence_count: 0, members: [] });
    }
    const data = await response.json();
    res.json(data);
  } catch (e) {
    console.error('[DISCORD WIDGET] Error:', e);
    res.json({ presence_count: 0, members: [] });
  }
});

// Seguimiento de sesiones activas y utilidades
const activeSessions = new Map(); // memoria (fallback)
const GUILD_ID = process.env.DISCORD_GUILD_ID || '1351991000903004241';

function getClientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    const parts = Array.isArray(forwarded) ? forwarded : String(forwarded).split(',');
    return parts[0].trim();
  }
  return req.ip || req.connection?.remoteAddress || '0.0.0.0';
}

app.use((req, res, next) => {
  try {
    const sessionId = req.sessionID;
    if (sessionId) {
      const ip = getClientIp(req);
      const userAgent = req.headers['user-agent'] || 'unknown';
      const user = req.user || {};
      const now = Date.now();
      activeSessions.set(sessionId, { userId: user.id || null, username: user.username || null, avatar: user.avatar || null, ip, userAgent, lastSeen: now });
      // Persistir en SQLite
      db.run(
        `INSERT INTO sessions (sessionId, userId, username, avatar, ip, userAgent, lastSeen)
         VALUES (?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(sessionId) DO UPDATE SET
           userId=excluded.userId,
           username=excluded.username,
           avatar=excluded.avatar,
           ip=excluded.ip,
           userAgent=excluded.userAgent,
           lastSeen=excluded.lastSeen`,
        [sessionId, user.id || null, user.username || null, user.avatar || null, ip, userAgent, now]
      );
    }
  } catch (e) {
    // noop
  }
  next();
});
// MongoDB connection
// mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/spainrp', {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// });

// SQLite connection
const db = new sqlite3.Database('./spainrp.db', (err) => {
  if (err) {
    console.error('Error opening SQLite DB:', err.message);
  } else {
    console.log('Connected to SQLite database.');
    // Configurar timeout y modo WAL para mejor rendimiento
    db.configure("busy_timeout", 30000);
    db.run("PRAGMA journal_mode=WAL");
    db.run("PRAGMA synchronous=NORMAL");
    db.run("PRAGMA cache_size=1000");
    db.run("PRAGMA temp_store=MEMORY");
  }
});

// Tabla de bans
db.serialize(() => {
  // Migración: agregar columna 'images' si no existe
  db.get("PRAGMA table_info(announcements)", (err, columns) => {
    if (!err && Array.isArray(columns) && !columns.some(col => col.name === 'images')) {
      db.run("ALTER TABLE announcements ADD COLUMN images TEXT", (err2) => {
        if (err2) console.error('[DB MIGRATION] Error añadiendo columna images:', err2.message);
        else console.log('[DB MIGRATION] Columna images añadida a announcements');
      });
    }
  });
  db.run(`CREATE TABLE IF NOT EXISTS bans (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ip TEXT,
    userId TEXT,
    reason TEXT,
    createdAt TEXT
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS sessions (
    sessionId TEXT PRIMARY KEY,
    userId TEXT,
    username TEXT,
    avatar TEXT,
    ip TEXT,
    userAgent TEXT,
    lastSeen INTEGER
  )`);
  // Semilla: insertar una sesión de prueba si la tabla está vacía
  db.get('SELECT COUNT(*) as n FROM sessions', [], (err, row) => {
    if (!err && row && row.n === 0) {
      const now = Date.now();
      db.run(
        'INSERT INTO sessions (sessionId, userId, username, avatar, ip, userAgent, lastSeen) VALUES (?, ?, ?, ?, ?, ?, ?)',
        ['sample-session', '710112055985963090', 'DemoAdmin', null, '127.0.0.1', 'Demo UA', now]
      );
    }
  });
  // Anuncios y encuestas
  db.run(`CREATE TABLE IF NOT EXISTS announcements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    body TEXT,
    authorId TEXT,
    authorName TEXT,
    createdAt TEXT,
    images TEXT,
    company TEXT,
    tags TEXT
  )`);
  // Comentarios persistentes por noticia
  db.run(`CREATE TABLE IF NOT EXISTS news_comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    newsId INTEGER,
    userId TEXT,
    username TEXT,
    text TEXT,
    createdAt TEXT
  )`);
  // Reacciones persistentes por noticia y usuario
  db.run(`CREATE TABLE IF NOT EXISTS news_reactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    newsId INTEGER,
    userId TEXT,
    emoji TEXT,
    createdAt TEXT,
    UNIQUE(newsId, userId, emoji)
  )`);
// --- ENDPOINTS COMENTARIOS Y REACCIONES DE NOTICIAS ---
// GET: comentarios de una noticia
app.get('/api/announcements/:id/comments', (req, res) => {
  const newsId = req.params.id;
  db.all('SELECT * FROM news_comments WHERE newsId = ? ORDER BY createdAt ASC', [newsId], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Error leyendo comentarios' });
    res.json({ comments: rows || [] });
  });
});
// Proxy: exportar DNI como imagen PNG desde el bot externo (GET y HEAD)
const handleDNIExport = async (req, res) => {
  const { discordId } = req.params;
  const DNI_BOT_URL = process.env.DNI_BOT_URL || 'http://37.27.21.91:5021';
  const isHeadRequest = req.method === 'HEAD';
  
  console.log(`[DNI PROXY] ${req.method} request para DiscordID: ${discordId}`);
  console.log(`[DNI PROXY] URL del bot: ${DNI_BOT_URL}/dni/${discordId}/exportar`);
  
  try {
    const fetchDNI = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
    const response = await fetchDNI(`${DNI_BOT_URL}/dni/${encodeURIComponent(discordId)}/exportar`, {
      method: req.method
    });
    
    console.log(`[DNI PROXY] Respuesta del bot: ${response.status} ${response.statusText}`);
    
    if (!response.ok) {
      console.error(`[DNI PROXY] Bot respondió con error: ${response.status}`);
      return res.status(response.status).json({ error: 'No existe ese DNI o error en el bot externo' });
    }
    
    // Para HEAD, solo enviar headers
    if (isHeadRequest) {
    res.set('Content-Type', response.headers.get('content-type') || 'image/png');
      return res.status(200).end();
    }
    
    // Para GET, enviar la imagen completa
    const buffer = await response.buffer();
    const contentType = response.headers.get('content-type') || 'image/png';
    
    console.log(`[DNI PROXY] Imagen recibida (${buffer.length} bytes) para ${discordId}`);
    
    res.set('Content-Type', contentType);
    res.send(buffer);
    
    console.log(`[DNI PROXY] Exportación exitosa para ${discordId}`);
  } catch (e) {
    console.error(`[DNI PROXY] Error de conexión:`, e.message);
    res.status(502).json({ error: 'Error conectando con el bot de DNI', details: e.message });
  }
};

app.get('/api/proxy/dni/:discordId/exportar', handleDNIExport);
app.head('/api/proxy/dni/:discordId/exportar', handleDNIExport);

// ===== PROXY BLACKMARKET =====
const BLACKMARKET_BOT_URL = process.env.BLACKMARKET_BOT_URL || 'http://37.27.21.91:5021';

// Proxy: obtener catálogo de items del BlackMarket
app.get('/api/proxy/blackmarket/items', async (req, res) => {
  try {
    console.log('[BLACKMARKET PROXY] ===== INICIO CATÁLOGO =====');
    console.log('[BLACKMARKET PROXY] GET /api/proxy/blackmarket/items');
    console.log('[BLACKMARKET PROXY] URL del bot:', `${BLACKMARKET_BOT_URL}/api/blackmarket/items`);
    
    const fetchBM = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
    const response = await fetchBM(`${BLACKMARKET_BOT_URL}/api/blackmarket/items`);
    
    console.log('[BLACKMARKET PROXY] Response status:', response.status);
    console.log('[BLACKMARKET PROXY] Response headers:', Object.fromEntries(response.headers.entries()));
    
    const data = await response.json();
    console.log('[BLACKMARKET PROXY] Response data keys:', Object.keys(data));
    console.log('[BLACKMARKET PROXY] Response data length:', Object.keys(data).length);
    
    if (!response.ok) {
      console.error(`[BLACKMARKET PROXY] Bot respondió con error: ${response.status}`);
      console.error('[BLACKMARKET PROXY] Error details:', data);
      
      // Mejorar mensajes de error para el frontend
      let errorMessage = 'Error obteniendo catálogo del BlackMarket';
      if (response.status === 503) {
        errorMessage = 'El BlackMarket está temporalmente fuera de servicio';
      } else if (response.status === 500) {
        errorMessage = 'Error interno del servidor de economía';
      }
      
      return res.status(response.status).json({ 
        error: errorMessage, 
        details: data,
        statusCode: response.status,
        userMessage: errorMessage
      });
    }
    
    console.log(`[BLACKMARKET PROXY] ✅ Catálogo obtenido exitosamente: ${Object.keys(data).length} items`);
    console.log('[BLACKMARKET PROXY] ===== FIN CATÁLOGO =====');
    res.json(data);
  } catch (e) {
    console.error('[BLACKMARKET PROXY] ===== ERROR CATÁLOGO =====');
    console.error(`[BLACKMARKET PROXY] Error de conexión:`, e.message);
    console.error('[BLACKMARKET PROXY] Stack trace:', e.stack);
    console.error('[BLACKMARKET PROXY] ===== FIN ERROR =====');
    res.status(502).json({ error: 'Error conectando con el bot de BlackMarket', details: e.message });
  }
});

// Proxy: obtener saldo del usuario en BlackMarket
app.get('/api/proxy/blackmarket/saldo/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    console.log('[BLACKMARKET PROXY] ===== INICIO SALDO =====');
    console.log(`[BLACKMARKET PROXY] GET /api/proxy/blackmarket/saldo/${userId}`);
    console.log('[BLACKMARKET PROXY] URL del bot:', `${BLACKMARKET_BOT_URL}/api/blackmarket/saldo/${encodeURIComponent(userId)}`);
    
    const fetchBM = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
    const response = await fetchBM(`${BLACKMARKET_BOT_URL}/api/blackmarket/saldo/${encodeURIComponent(userId)}`);
    
    console.log('[BLACKMARKET PROXY] Response status:', response.status);
    console.log('[BLACKMARKET PROXY] Response headers:', Object.fromEntries(response.headers.entries()));
    
    const data = await response.json();
    console.log('[BLACKMARKET PROXY] Response data:', data);
    
    if (!response.ok) {
      console.error(`[BLACKMARKET PROXY] Bot respondió con error: ${response.status}`);
      console.error('[BLACKMARKET PROXY] Error details:', data);
      console.log('[BLACKMARKET PROXY] ===== FIN SALDO (ERROR) =====');
      
      // Mejorar mensajes de error para el frontend
      let errorMessage = 'Error obteniendo saldo del BlackMarket';
      if (response.status === 404) {
        errorMessage = 'Usuario no encontrado en el sistema de economía';
      } else if (response.status === 403) {
        errorMessage = 'No tienes permisos para consultar este saldo';
      }
      
      return res.status(response.status).json({ 
        error: errorMessage, 
        details: data,
        statusCode: response.status,
        userMessage: errorMessage
      });
    }
    
    console.log(`[BLACKMARKET PROXY] ✅ Saldo obtenido exitosamente para ${userId}:`, data);
    console.log('[BLACKMARKET PROXY] ===== FIN SALDO =====');
    res.json(data);
  } catch (e) {
    console.error('[BLACKMARKET PROXY] ===== ERROR SALDO =====');
    console.error(`[BLACKMARKET PROXY] Error de conexión:`, e.message);
    console.error('[BLACKMARKET PROXY] Stack trace:', e.stack);
    console.error('[BLACKMARKET PROXY] ===== FIN ERROR =====');
    res.status(502).json({ error: 'Error conectando con el bot de BlackMarket', details: e.message });
  }
});

// Proxy: comprar item en BlackMarket
app.post('/api/proxy/blackmarket/purchase', async (req, res) => {
  try {
    const { userId, itemId } = req.body;
    console.log('[BLACKMARKET PROXY] ===== INICIO COMPRA =====');
    console.log(`[BLACKMARKET PROXY] POST /api/proxy/blackmarket/purchase`);
    console.log('[BLACKMARKET PROXY] Request body:', { userId, itemId });
    console.log('[BLACKMARKET PROXY] URL del bot:', `${BLACKMARKET_BOT_URL}/api/blackmarket/purchase`);
    
    const fetchBM = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
    const response = await fetchBM(`${BLACKMARKET_BOT_URL}/api/blackmarket/purchase`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, itemId })
    });
    
    console.log('[BLACKMARKET PROXY] Response status:', response.status);
    console.log('[BLACKMARKET PROXY] Response headers:', Object.fromEntries(response.headers.entries()));
    
    const data = await response.json();
    console.log('[BLACKMARKET PROXY] Response data:', data);
    
    if (!response.ok) {
      console.error(`[BLACKMARKET PROXY] Bot respondió con error: ${response.status}`);
      console.error('[BLACKMARKET PROXY] Error details:', data);
      console.log('[BLACKMARKET PROXY] ===== FIN COMPRA (ERROR) =====');
      
      // Mejorar mensajes de error para el frontend
      let errorMessage = 'Error realizando compra en BlackMarket';
      if (response.status === 403) {
        errorMessage = data.error || 'Saldo insuficiente para realizar la compra';
      } else if (response.status === 404) {
        errorMessage = 'Item no encontrado en el catálogo';
      } else if (response.status === 400) {
        errorMessage = data.error || 'Datos de compra inválidos';
      }
      
      return res.status(response.status).json({ 
        error: errorMessage, 
        details: data,
        statusCode: response.status,
        userMessage: errorMessage
      });
    }
    
    console.log(`[BLACKMARKET PROXY] ✅ Compra exitosa para ${userId}:`, data);
    console.log('[BLACKMARKET PROXY] ===== FIN COMPRA =====');
    res.json(data);
  } catch (e) {
    console.error('[BLACKMARKET PROXY] ===== ERROR COMPRA =====');
    console.error(`[BLACKMARKET PROXY] Error de conexión:`, e.message);
    console.error('[BLACKMARKET PROXY] Stack trace:', e.stack);
    console.error('[BLACKMARKET PROXY] ===== FIN ERROR =====');
    res.status(502).json({ error: 'Error conectando con el bot de BlackMarket', details: e.message });
  }
});

// Proxy: obtener inventario del usuario en BlackMarket
app.get('/api/proxy/blackmarket/inventario/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    console.log(`[BLACKMARKET PROXY] GET /api/proxy/blackmarket/inventario/${userId}`);
    
    const fetchBM = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
    const response = await fetchBM(`${BLACKMARKET_BOT_URL}/api/blackmarket/inventario/${encodeURIComponent(userId)}`);
    const data = await response.json();
    
    if (!response.ok) {
      console.error(`[BLACKMARKET PROXY] Bot respondió con error: ${response.status}`);
      return res.status(response.status).json({ error: 'Error obteniendo inventario del BlackMarket', details: data });
    }
    
    console.log(`[BLACKMARKET PROXY] Inventario obtenido para ${userId}:`, data);
    res.json(data);
  } catch (e) {
    console.error(`[BLACKMARKET PROXY] Error de conexión:`, e.message);
    res.status(502).json({ error: 'Error conectando con el bot de BlackMarket', details: e.message });
  }
});

// Proxy: vender un item del inventario
app.post('/api/proxy/blackmarket/sellone', async (req, res) => {
  try {
    const { userId, itemId, amount } = req.body;
    console.log(`[BLACKMARKET PROXY] POST /api/proxy/blackmarket/sellone - userId: ${userId}, itemId: ${itemId}, amount: ${amount}`);
    
    const fetchBM = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
    const response = await fetchBM(`${BLACKMARKET_BOT_URL}/api/blackmarket/sellone`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, itemId, amount })
    });
    const data = await response.json();
    
    if (!response.ok) {
      console.error(`[BLACKMARKET PROXY] Bot respondió con error: ${response.status}`);
      return res.status(response.status).json({ error: 'Error vendiendo item en BlackMarket', details: data });
    }
    
    console.log(`[BLACKMARKET PROXY] Venta exitosa para ${userId}:`, data);
    res.json(data);
  } catch (e) {
    console.error(`[BLACKMARKET PROXY] Error de conexión:`, e.message);
    res.status(502).json({ error: 'Error conectando con el bot de BlackMarket', details: e.message });
  }
});

// Proxy: vender todos los items del inventario
app.post('/api/proxy/blackmarket/sell', async (req, res) => {
  try {
    const { userId, items } = req.body;
    console.log(`[BLACKMARKET PROXY] POST /api/proxy/blackmarket/sell - userId: ${userId}, items: ${items.length}`);
    
    const fetchBM = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
    const response = await fetchBM(`${BLACKMARKET_BOT_URL}/api/blackmarket/sell`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, items })
    });
    const data = await response.json();
    
    if (!response.ok) {
      console.error(`[BLACKMARKET PROXY] Bot respondió con error: ${response.status}`);
      return res.status(response.status).json({ error: 'Error vendiendo inventario en BlackMarket', details: data });
    }
    
    console.log(`[BLACKMARKET PROXY] Venta masiva exitosa para ${userId}:`, data);
    res.json(data);
  } catch (e) {
    console.error(`[BLACKMARKET PROXY] Error de conexión:`, e.message);
    res.status(502).json({ error: 'Error conectando con el bot de BlackMarket', details: e.message });
  }
});

// Proxy: verificar si usuario tiene rol específico - Usar endpoint local
app.get('/api/proxy/discord/hasrole/:userId/:roleId', async (req, res) => {
  try {
    const { userId, roleId } = req.params;
    console.log('[DISCORD PROXY] ===== INICIO HASROLE (LOCAL) =====');
    console.log(`[DISCORD PROXY] GET /api/proxy/discord/hasrole/${userId}/${roleId}`);
    
    // Verificar si el bot de Discord está disponible
    if (!discordClient.readyAt) {
      console.warn('[DISCORD PROXY] ⚠️ Bot de Discord no disponible, devolviendo hasRole: false');
      return res.json({ hasRole: false, botUnavailable: true });
    }
    
    // Usar el endpoint local directamente
    const guildId = process.env.DISCORD_GUILD_ID || '1212556680911650866';
    console.log(`[DISCORD PROXY] Guild ID: ${guildId}, User ID: ${userId}, Role ID: ${roleId}`);
    
    const guild = discordClient.guilds.cache.get(guildId);
    if (!guild) {
      console.error(`[DISCORD PROXY] ❌ Servidor no encontrado: ${guildId}`);
      return res.status(404).json({ error: 'Servidor no encontrado', hasRole: false });
    }
    
    await guild.members.fetch();
    const member = guild.members.cache.get(userId);
    if (!member) {
      console.log(`[DISCORD PROXY] ❌ Usuario no encontrado: ${userId}`);
      return res.json({ hasRole: false, isMember: false });
    }
    
    const hasRole = member.roles.cache.has(roleId);
    const payload = { hasRole, isMember: true };
    
    console.log(`[DISCORD PROXY] ✅ Result for ${userId}/${roleId}:`, payload);
    console.log('[DISCORD PROXY] ===== FIN HASROLE (LOCAL) =====');
    res.json(payload);
  } catch (e) {
    console.error('[DISCORD PROXY] ===== ERROR HASROLE (LOCAL) =====');
    console.error(`[DISCORD PROXY] Error:`, e.message);
    console.error(`[DISCORD PROXY] Stack trace:`, e.stack);
    console.log('[DISCORD PROXY] ===== FIN ERROR =====');
    res.status(500).json({ 
      error: 'Error verificando rol', 
      details: e.message,
      hasRole: false 
    });
  }
});

// Proxy: verificar si usuario es administrador - Usar endpoint local
app.get('/api/proxy/admin/isadmin/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    console.log('[ADMIN PROXY] ===== INICIO ISADMIN (LOCAL) =====');
    console.log(`[ADMIN PROXY] GET /api/proxy/admin/isadmin/${userId}`);
    
    // Verificar si el bot de Discord está disponible
    if (!discordClient.readyAt) {
      console.warn('[ADMIN PROXY] ⚠️ Bot de Discord no disponible, devolviendo isAdmin: false');
      return res.json({ isAdmin: false, botUnavailable: true });
    }
    
    // Usar el endpoint local directamente
    const guildId = process.env.DISCORD_GUILD_ID || '1212556680911650866';
    const adminRoleId = '1384340649205301359';
    console.log(`[ADMIN PROXY] Guild ID: ${guildId}, User ID: ${userId}, Admin Role ID: ${adminRoleId}`);
    
    const guild = discordClient.guilds.cache.get(guildId);
    if (!guild) {
      console.error(`[ADMIN PROXY] ❌ Servidor no encontrado: ${guildId}`);
      return res.status(404).json({ error: 'Servidor no encontrado', isAdmin: false });
    }
    
    await guild.members.fetch();
    const member = guild.members.cache.get(userId);
    if (!member) {
      console.log(`[ADMIN PROXY] ❌ Usuario no encontrado: ${userId}`);
      return res.json({ isAdmin: false, isMember: false });
    }
    
    const hasAdminRole = member.roles.cache.has(adminRoleId);
    const hasAdminPerms = member.permissions.has(PermissionsBitField.Flags.Administrator);
    const isAdmin = hasAdminRole || hasAdminPerms;
    const payload = { isAdmin, isMember: true, hasAdminRole, hasAdminPerms };
    
    console.log(`[ADMIN PROXY] ✅ Result for ${userId}:`, payload);
    console.log('[ADMIN PROXY] ===== FIN ISADMIN (LOCAL) =====');
    res.json(payload);
  } catch (e) {
    console.error('[ADMIN PROXY] ===== ERROR ISADMIN (LOCAL) =====');
    console.error(`[ADMIN PROXY] Error:`, e.message);
    console.error(`[ADMIN PROXY] Stack trace:`, e.stack);
    console.log('[ADMIN PROXY] ===== FIN ERROR =====');
    res.status(500).json({ 
      error: 'Error verificando administrador', 
      details: e.message,
      isAdmin: false 
    });
  }
});
// POST: agregar comentario a una noticia
app.post('/api/announcements/:id/comments', express.json(), (req, res) => {
  const newsId = req.params.id;
  const { userId, username, text } = req.body || {};
  if (!userId || !text) return res.status(400).json({ error: 'Faltan datos' });
  // Cooldown: 25 minutos por usuario por noticia
  const now = Date.now();
  db.get('SELECT createdAt FROM news_comments WHERE newsId = ? AND userId = ? ORDER BY createdAt DESC LIMIT 1', [newsId, userId], (err, row) => {
    if (row && now - new Date(row.createdAt).getTime() < 25*60*1000) {
      return res.status(429).json({ error: 'Debes esperar 25 minutos entre comentarios.' });
    }
    db.run('INSERT INTO news_comments (newsId, userId, username, text, createdAt) VALUES (?, ?, ?, ?, ?)', [newsId, userId, username, text, new Date(now).toISOString()], function(err2) {
      if (err2) return res.status(500).json({ error: 'No se pudo comentar' });
      res.json({ success: true, id: this.lastID });
    });
  });
});

// GET: reacciones de una noticia
app.get('/api/announcements/:id/reactions', (req, res) => {
  const newsId = req.params.id;
  db.all('SELECT emoji, COUNT(*) as count FROM news_reactions WHERE newsId = ? GROUP BY emoji', [newsId], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Error leyendo reacciones' });
    res.json({ reactions: rows || [] });
  });
});

// POST: agregar reacción a una noticia
app.post('/api/announcements/:id/reactions', express.json(), (req, res) => {
  const newsId = req.params.id;
  const { userId, emoji } = req.body || {};
  if (!userId || !emoji) return res.status(400).json({ error: 'Faltan datos' });
  // Solo una reacción por emoji por usuario por noticia
  db.get('SELECT id FROM news_reactions WHERE newsId = ? AND userId = ? AND emoji = ?', [newsId, userId, emoji], (err, row) => {
    if (row) return res.status(409).json({ error: 'Ya reaccionaste con ese emoji.' });
    db.run('INSERT INTO news_reactions (newsId, userId, emoji, createdAt) VALUES (?, ?, ?, ?)', [newsId, userId, emoji, new Date().toISOString()], function(err2) {
      if (err2) return res.status(500).json({ error: 'No se pudo reaccionar' });
      res.json({ success: true, id: this.lastID });
    });
  });
});
  db.run(`CREATE TABLE IF NOT EXISTS polls (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    question TEXT,
    options TEXT, -- JSON array
    authorId TEXT,
    authorName TEXT,
    createdAt TEXT
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS poll_votes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    pollId INTEGER,
    userId TEXT,
    optionIndex INTEGER,
    createdAt TEXT,
    UNIQUE(pollId, userId)
  )`);
  // Preferencias por usuario (clave/valor)
  db.run(`CREATE TABLE IF NOT EXISTS preferences (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId TEXT,
    key TEXT,
    value TEXT,
    updatedAt INTEGER,
    UNIQUE(userId, key)
  )`);

  // Progreso de calendario diario
  db.run(`CREATE TABLE IF NOT EXISTS calendar_progress (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId TEXT,
    year INTEGER,
    month INTEGER,
    claimedDays TEXT, -- JSON array
    streak INTEGER,
    updatedAt INTEGER,
    UNIQUE(userId, year, month)
  )`);
// --- ENDPOINTS CALENDARIO DIARIO ---
// GET: progreso del calendario
app.get('/api/backend/calendar', (req, res) => {
  if (!req.isAuthenticated || !req.isAuthenticated() || !req.user) {
    return res.status(401).json({ error: 'No autenticado' });
  }
  const userId = req.user?.id;
  const year = parseInt(req.query.year, 10) || new Date().getFullYear();
  const month = parseInt(req.query.month, 10) || (new Date().getMonth() + 1);
  db.get('SELECT claimedDays, streak FROM calendar_progress WHERE userId = ? AND year = ? AND month = ?', [userId, year, month], (err, row) => {
    if (err) return res.status(500).json({ error: 'DB error' });
    let claimedDays = [];
    let streak = 0;
    if (row) {
      try { claimedDays = JSON.parse(row.claimedDays || '[]'); } catch { claimedDays = []; }
      streak = row.streak || 0;
    }
    res.json({ claimedDays, streak });
  });
});

// POST: reclamar día
app.post('/api/backend/calendar/claim', (req, res) => {
  if (!req.isAuthenticated || !req.isAuthenticated() || !req.user) {
    return res.status(401).json({ error: 'No autenticado' });
  }
  const userId = req.user?.id;
  const { year, month, day } = req.body || {};
  const now = Date.now();
  const y = parseInt(year, 10) || new Date().getFullYear();
  const m = parseInt(month, 10) || (new Date().getMonth() + 1);
  const d = parseInt(day, 10) || new Date().getDate();
  db.get('SELECT claimedDays FROM calendar_progress WHERE userId = ? AND year = ? AND month = ?', [userId, y, m], (err, row) => {
    let claimedDays = [];
    if (row) {
      try { claimedDays = JSON.parse(row.claimedDays || '[]'); } catch { claimedDays = []; }
    }
    if (claimedDays.includes(d)) {
      // Ya reclamado
      return db.get('SELECT claimedDays, streak FROM calendar_progress WHERE userId = ? AND year = ? AND month = ?', [userId, y, m], (err2, row2) => {
        let streak = row2?.streak || 0;
        res.json({ claimedDays, streak });
      });
    }
    claimedDays.push(d);
    // Calcular racha
    let streakCount = 0;
    for (let i = d; i > 0; i--) {
      if (claimedDays.includes(i)) streakCount++;
      else break;
    }
    db.run('INSERT INTO calendar_progress (userId, year, month, claimedDays, streak, updatedAt) VALUES (?, ?, ?, ?, ?, ?) ON CONFLICT(userId, year, month) DO UPDATE SET claimedDays=excluded.claimedDays, streak=excluded.streak, updatedAt=excluded.updatedAt', [userId, y, m, JSON.stringify(claimedDays), streakCount, now], function(err2) {
      if (err2) return res.status(500).json({ error: 'DB error' });
      res.json({ claimedDays, streak: streakCount });
    });
  });
});
});

app.use('/auth', authRoutes);
app.use('/api/discord', discordRoutes);
app.use('/api/discord', multiroleRoutes);

// Endpoint para exponer el usuario autenticado de Discord
app.get('/api/auth/me', (req, res) => {
  if (req.isAuthenticated && req.isAuthenticated() && req.user) {
    const { id, username, discriminator, avatar } = req.user;
    console.log(`[AUTH/ME] Usuario autenticado: ${username}#${discriminator} (${id})`);
    res.json({ id, username, discriminator, avatar });
  } else {
    console.warn('[AUTH/ME] Acceso no autenticado o sesión inválida');
    res.status(401).json({ error: 'No autenticado' });
  }
});

// Ruta adicional para compatibilidad con el frontend
app.get('/auth/me', (req, res) => {
  if (req.isAuthenticated && req.isAuthenticated() && req.user) {
    const { id, username, discriminator, avatar } = req.user;
    console.log(`[AUTH/ME] Usuario autenticado: ${username}#${discriminator} (${id})`);
    res.json({ id, username, discriminator, avatar });
  } else {
    console.warn('[AUTH/ME] Acceso no autenticado o sesión inválida');
    res.status(401).json({ error: 'No autenticado' });
  }
});
// Middleware global de ban
app.use((req, res, next) => {
  const ip = getClientIp(req);
  const userId = req.user?.id || null;
  db.all('SELECT id FROM bans WHERE (ip = ? AND ip IS NOT NULL) OR (userId = ? AND userId IS NOT NULL) LIMIT 1', [ip, userId], (err, rows) => {
    if (err) {
      console.error('[BAN CHECK] Error:', err);
      return next();
    }
    if (rows && rows.length > 0) {
      return res.status(403).json({ error: 'Acceso bloqueado por ban' });
    }
    next();
  });
});

app.get('/', (req, res) => {
  res.send('Backend SpainRP funcionando');
});

// Endpoint para obtener miembros de Discord usando el bot
// Middleware simple de autenticación para proteger endpoints del panel
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated && req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({ error: 'No autenticado' });
}

function hasAdminPermissions(user) {
  try {
    const guilds = user?.guilds || [];
    const g = guilds.find(gg => gg.id === GUILD_ID);
    if (!g) return false;
    if (g.owner) return true;
    const perms = g.permissions || 0;
    return Boolean(perms & 0x8) || Boolean(perms & 0x20) || Boolean(perms & 0x4);
  } catch (e) { return false; }
}

function ensureAdmin(req, res, next) {
  if (!req.isAuthenticated || !req.isAuthenticated() || !req.user) {
    return res.status(401).json({ error: 'No autenticado' });
  }
  if (!hasAdminPermissions(req.user)) {
    return res.status(403).json({ error: 'No autorizado' });
  }
  return next();
}

// Middleware combinado para autenticación y admin
function ensureAuthAndAdmin(req, res, next) {
  if (!req.isAuthenticated || !req.isAuthenticated() || !req.user) {
    return res.status(401).json({ error: 'No autenticado' });
  }
  if (!hasAdminPermissions(req.user)) {
    return res.status(403).json({ error: 'No autorizado' });
  }
  return next();
}

// Endpoint para obtener miembros de Discord usando el bot (protegido)
app.get('/api/discord/members', ensureAuthenticated, async (req, res) => {
  try {
    const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
    const response = await fetch('https://discord.com/api/guilds/1212556680911650866/widget.json');
    const data = await response.json();
    console.log('[DISCORD MEMBERS] Datos recibidos:', data);
    res.json({ count: data.presence_count || data.members?.length || 0 });
  } catch (e) {
    console.error('[DISCORD MEMBERS] Error:', e);
    res.json({ count: 0 });
  }
});

// Endpoint para obtener miembros del servidor con roles
app.get('/api/discord/members-with-roles', ensureAuthenticated, async (req, res) => {
  try {
    const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
    
    // Obtener información del widget del servidor
    const widgetResponse = await fetch('https://discord.com/api/guilds/1212556680911650866/widget.json');
    const widgetData = await widgetResponse.json();
    
    // Simular datos de miembros con roles (en producción usarías la API de Discord)
    const membersWithRoles = [
      {
        id: '123456789',
        username: 'Admin1',
        avatar: 'https://cdn.discordapp.com/embed/avatars/0.png',
        status: 'online',
        roles: ['Owner', 'Administrator'],
        joinedAt: '2023-01-15'
      },
      {
        id: '987654321',
        username: 'Mod1',
        avatar: 'https://cdn.discordapp.com/embed/avatars/1.png',
        status: 'idle',
        roles: ['Moderator'],
        joinedAt: '2023-03-20'
      },
      {
        id: '456789123',
        username: 'Helper1',
        avatar: 'https://cdn.discordapp.com/embed/avatars/2.png',
        status: 'offline',
        roles: ['Helper'],
        joinedAt: '2023-06-10'
      }
    ];
    
    res.json({
      totalMembers: widgetData.presence_count || 0,
      onlineMembers: widgetData.members?.length || 0,
      members: membersWithRoles
    });
  } catch (e) {
    console.error('[DISCORD MEMBERS WITH ROLES] Error:', e);
    res.status(500).json({ error: 'No se pudo obtener la información de miembros' });
  }
});

// Endpoint para obtener el widget completo de Discord
// Widget puede permanecer público, lo usa la portada

// Endpoint para obtener el total real de miembros usando el bot
app.get('/api/discord/membercount', async (req, res) => {
  try {
    const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
    const botApiUrl = `${process.env.BOT_API_URL || 'https://spainrp-web.onrender.com/'}/api/membercount`;
    const response = await fetch(botApiUrl);
    if (!response.ok) {
      const errText = await response.text();
      console.error('[DISCORD MEMBERCOUNT] Bot API error:', errText);
      return res.status(500).json({ error: 'No se pudo consultar el bot', details: errText });
    }
    const data = await response.json();
    res.json({ memberCount: data.memberCount || 0 });
  } catch (e) {
    console.error('[DISCORD MEMBERCOUNT] Error:', e);
    res.status(500).json({ error: 'No se pudo obtener el total de miembros', details: String(e) });
  }
});

// Proxy: is member - Usar endpoint local en lugar de HTTP externo
app.get('/api/proxy/discord/ismember/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    console.log('[DISCORD PROXY] ===== INICIO ISMEMBER (LOCAL) =====');
    console.log(`[DISCORD PROXY] GET /api/proxy/discord/ismember/${userId}`);
    
    // Verificar si el bot de Discord está disponible
    if (!discordClient.readyAt) {
      console.warn('[DISCORD PROXY] ⚠️ Bot de Discord no disponible, devolviendo isMember: false');
      return res.json({ isMember: false, botUnavailable: true });
    }
    
    // Usar el endpoint local directamente en lugar de hacer HTTP request
    const guildId = process.env.DISCORD_GUILD_ID || '1212556680911650866';
    console.log(`[DISCORD PROXY] Guild ID: ${guildId}, User ID: ${userId}`);
    
    const guild = discordClient.guilds.cache.get(guildId);
    if (!guild) {
      console.error(`[DISCORD PROXY] ❌ Servidor no encontrado: ${guildId}`);
      return res.status(404).json({ error: 'Servidor no encontrado', isMember: false });
    }
    
    await guild.members.fetch();
    const member = guild.members.cache.get(userId);
    const payload = { isMember: Boolean(member) };
    
    console.log(`[DISCORD PROXY] ✅ Result for ${userId}:`, payload);
    console.log('[DISCORD PROXY] ===== FIN ISMEMBER (LOCAL) =====');
    res.json(payload);
  } catch (e) {
    console.error('[DISCORD PROXY] ===== ERROR ISMEMBER (LOCAL) =====');
    console.error(`[DISCORD PROXY] Error:`, e.message);
    console.error(`[DISCORD PROXY] Stack trace:`, e.stack);
    console.log('[DISCORD PROXY] ===== FIN ERROR =====');
    res.status(500).json({ 
      error: 'Error verificando membresía', 
      details: e.message,
      isMember: false 
    });
  }
});
// Proxy: ver inventario de cualquier usuario (solo administradores)
async function proxyGetAdminInventory(userId) {
    const response = await fetch(`${process.env.ECONOMIA_API_URL || 'http://37.27.21.91:5021'}/api/admin/inventory/${encodeURIComponent(userId)}`);
  return await response.json();
}

// Proxy: agregar items al inventario de un usuario (solo administradores)
async function proxyAddAdminItem(userId, itemId, amount) {
    const response = await fetch(`${process.env.ECONOMIA_API_URL || 'http://37.27.21.91:5021'}/api/admin/additem`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, itemId, amount })
  });
  return await response.json();
}

// Proxy: retirar items del inventario de un usuario (solo administradores)
async function proxyRemoveAdminItem(userId, itemId, amount) {
    const response = await fetch(`${process.env.ECONOMIA_API_URL || 'http://37.27.21.91:5021'}/api/admin/removeitem`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, itemId, amount })
  });
  return await response.json();
}

// Proxy: ver saldo de cualquier usuario (solo administradores)
async function proxyGetAdminBalance(userId) {
    const response = await fetch(`${process.env.ECONOMIA_API_URL || 'http://37.27.21.91:5021'}/api/admin/balance/${encodeURIComponent(userId)}`);
  return await response.json();
}

// Proxy: modificar saldo de un usuario (solo administradores)
async function proxySetAdminBalance(userId, cash, bank) {
    const response = await fetch(`${process.env.ECONOMIA_API_URL || 'http://37.27.21.91:5021'}/api/admin/setbalance`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, cash, bank })
  });
  return await response.json();
}

// Widget Discord (público)
app.get('/api/discord/widget', async (req, res) => {
  try {
    const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
    const response = await fetch('https://discord.com/api/guilds/1212556680911650866/widget.json');
    if (!response.ok) {
      const errText = await response.text();
      console.error('[DISCORD WIDGET] Discord API error:', errText);
      // Widget desactivado o error: devolver objeto vacío para evitar romper el frontend
      return res.json({ presence_count: 0, members: [] });
    }
    const data = await response.json();
    console.log('[DISCORD WIDGET] Datos recibidos:', data);
    res.json(data);
  } catch (e) {
    console.error('[DISCORD WIDGET] Error:', e);
    // Si hay error, devolver objeto vacío para evitar error en frontend
    res.json({ presence_count: 0, members: [] });
  }
});
// Proxy para obtener datos de miembro desde el bot
const BOT_API_URL = process.env.BOT_API_URL || 'https://spainrp-web.onrender.com/';
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

app.get('/api/backend/member/:guildId/:userId', async (req, res) => {
  const { guildId, userId } = req.params;
  try {
    const response = await fetch(`${BOT_API_URL}/api/member/${guildId}/${userId}`);
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (e) {
    res.status(500).json({ error: 'Error al consultar el bot', details: String(e) });
  }
});
// Preferences endpoints (persist adblock dismissal for logged users)
app.get('/api/preferences/adblock', ensureAuthenticated, (req, res) => {
  const uid = req.user?.id;
  if (!uid) return res.status(401).json({ error: 'No autenticado' });
  db.get('SELECT value FROM preferences WHERE userId = ? AND key = ?', [uid, 'adblock_dismissed'], (err, row) => {
    if (err) return res.status(500).json({ error: 'DB error' });
    res.json({ dismissed: Boolean(row && row.value === '1') });
  });
});

app.post('/api/preferences/adblock', ensureAuthenticated, express.json(), (req, res) => {
  const uid = req.user?.id;
  if (!uid) return res.status(401).json({ error: 'No autenticado' });
  const { dismissed } = req.body || {};
  const val = dismissed ? '1' : '0';
  const now = Date.now();
  db.run('INSERT INTO preferences (userId, key, value, updatedAt) VALUES (?, ?, ?, ?) ON CONFLICT(userId, key) DO UPDATE SET value=excluded.value, updatedAt=excluded.updatedAt', [uid, 'adblock_dismissed', val, now], function(err){
    if (err) return res.status(500).json({ error: 'DB error' });
    res.json({ success: true, dismissed: dismissed });
  });
});
// Endpoint para obtener la URL real del avatar de Roblox (sin CORS)
app.get('/api/backend/roblox/avatar/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const robloxRes = await fetchRoblox(`https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${userId}&size=150x150&format=Png`);
    const data = await robloxRes.json();
    if (data && data.data && data.data[0] && data.data[0].imageUrl) {
      return res.json({ url: data.data[0].imageUrl });
    }
    return res.status(404).json({ url: null });
  } catch {
    return res.status(500).json({ url: null });
  }
});

// Proxy: BlackMarket purchase hacia API externa para evitar CORS
app.post('/api/proxy/blackmarket/purchase', async (req, res) => {
  try {
    const payload = req.body || {};
    console.log('[PROXY] POST /api/proxy/blackmarket/purchase -> forwarding', payload);
    const response = await fetch(`${process.env.ECONOMIA_API_URL || 'http://37.27.21.91:5021'}/api/blackmarket/purchase`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const text = await response.text();
    let data;
    try { data = JSON.parse(text); } catch { data = { raw: text }; }
    console.log('[PROXY] Response from 5021', { status: response.status, data });
    res.status(response.status).json(data);
  } catch (e) {
    console.error('[PROXY] Error forwarding to 5021:', e);
    res.status(502).json({ error: 'Proxy error', details: String(e) });
  }
});

// Proxy: vender item del inventario (economía externa)
app.post('/api/proxy/blackmarket/sell', async (req, res) => {
  try {
    const payload = req.body || {};
    console.log('[PROXY] POST /api/proxy/blackmarket/sell -> forwarding', payload);
    const response = await fetch(`${process.env.ECONOMIA_API_URL || 'http://37.27.21.91:5021'}/api/blackmarket/sell`, {
        method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
        const text = await response.text();
    let data; try { data = JSON.parse(text); } catch { data = { raw: text }; }
    console.log('[PROXY] Sell response from 5021', { status: response.status, data });
    res.status(response.status).json(data);
    } catch (e) {
    console.error('[PROXY] Error forwarding sell to 5021:', e);
    res.status(502).json({ error: 'Proxy error', details: String(e) });
  }
});

// Proxy: vender 1 unidad de un item (economía externa)
app.post('/api/proxy/blackmarket/sellone', async (req, res) => {
  try {
    const payload = req.body || {};
    console.log('[PROXY] POST /api/proxy/blackmarket/sellone -> forwarding', payload);
    const response = await fetch(`${process.env.ECONOMIA_API_URL || 'http://37.27.21.91:5021'}/api/blackmarket/sellone`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const text = await response.text();
    let data; try { data = JSON.parse(text); } catch { data = { raw: text }; }
    console.log('[PROXY] SellOne response from 5021', { status: response.status, data });
    res.status(response.status).json(data);
  } catch (e) {
    console.error('[PROXY] Error forwarding sellone to 5021:', e);
    res.status(502).json({ error: 'Proxy error', details: String(e) });
  }
});

// Proxy: catálogo de items BlackMarket
app.get('/api/proxy/blackmarket/items', async (req, res) => {
  try {
    console.log('[PROXY] GET /api/proxy/blackmarket/items');
    const response = await fetch(`${process.env.ECONOMIA_API_URL || 'http://37.27.21.91:5021'}/api/blackmarket/items`);
    const text = await response.text();
    let data; try { data = JSON.parse(text); } catch { data = { raw: text }; }
    console.log('[PROXY] Items from 5021', { status: response.status, count: Array.isArray(data) ? data.length : Object.keys(data||{}).length });
    res.status(response.status).json(data);
  } catch (e) {
    console.error('[PROXY] Error fetching items:', e);
    res.status(502).json({ error: 'Proxy error', details: String(e) });
  }
});

// Proxy: inventario del usuario
app.get('/api/proxy/blackmarket/inventario/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    console.log('[PROXY] GET /api/proxy/blackmarket/inventario', { userId });
    const response = await fetch(`${process.env.ECONOMIA_API_URL || 'http://37.27.21.91:5021'}/api/blackmarket/inventario/${encodeURIComponent(userId)}`);
    const text = await response.text();
    let data; try { data = JSON.parse(text); } catch { data = { raw: text }; }
    console.log('[PROXY] Inventario from 5021', { status: response.status });
    res.status(response.status).json(data);
  } catch (e) {
    console.error('[PROXY] Error fetching inventario:', e);
    res.status(502).json({ error: 'Proxy error', details: String(e) });
  }
});

// Proxy: saldo del usuario en BlackMarket
app.get('/api/proxy/blackmarket/saldo/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    console.log('[PROXY] GET /api/proxy/blackmarket/saldo', { userId });
    const response = await fetch(`${process.env.ECONOMIA_API_URL || 'http://37.27.21.91:5021'}/api/blackmarket/saldo/${encodeURIComponent(userId)}`);
    const text = await response.text();
    let data; try { data = JSON.parse(text); } catch { data = { raw: text }; }
    console.log('[PROXY] Saldo from 5021', { status: response.status });
    res.status(response.status).json(data);
  } catch (e) {
    console.error('[PROXY] Error fetching saldo:', e);
    res.status(502).json({ error: 'Proxy error', details: String(e) });
  }
});

// Endpoint para eliminar un canal por ID
app.delete('/api/canales/:id', (req, res) => {
  const canalId = req.params.id;
  const canalesPath = path.join(__dirname, '../frontend/src/assets/canales.json');
  fs.readFile(canalesPath, 'utf8', (err, data) => {
    if (err) return res.status(500).json({ error: 'Error leyendo canales.json' });
    let canales = [];
    try {
      canales = JSON.parse(data);
    } catch (e) {
      return res.status(500).json({ error: 'Error parseando canales.json' });
    }
    const nuevosCanales = canales.filter(c => c.id !== canalId);
    fs.writeFile(canalesPath, JSON.stringify(nuevosCanales, null, 2), err2 => {
      if (err2) return res.status(500).json({ error: 'Error guardando canales.json' });
      res.json({ success: true });
    });
  });
});

// Endpoint para actualizar el array completo de canales (orden definitivo)
app.put('/api/canales', express.json(), (req, res) => {
  const nuevosCanales = req.body;
  const canalesPath = path.join(__dirname, '../frontend/src/assets/canales.json');
  fs.writeFile(canalesPath, JSON.stringify(nuevosCanales, null, 2), err => {
    if (err) return res.status(500).json({ error: 'Error guardando canales.json' });
    res.json({ success: true });
  });
});

// Endpoints admin de seguridad
app.get('/admin/sessions', ensureAuthAndAdmin, (req, res) => {
  const ttlMs = 24 * 60 * 60 * 1000;
  const threshold = Date.now() - ttlMs;
  // Limpiar expiradas en BD
  db.run('DELETE FROM sessions WHERE lastSeen < ?', [threshold], (/*err*/) => {
    // Leer vigentes
    db.all('SELECT * FROM sessions WHERE lastSeen >= ? ORDER BY lastSeen DESC', [threshold], (err, rows) => {
      if (err) {
        console.error('[SESSIONS] Error:', err);
        // fallback a memoria
        const sessions = Array.from(activeSessions.entries()).map(([sessionId, data]) => ({ sessionId, ...data }))
          .filter(s => s.lastSeen >= threshold)
          .sort((a,b)=>b.lastSeen-a.lastSeen);
        return res.json({ sessions });
      }
      res.json({ sessions: rows || [] });
    });
  });
});


// --- PROXY BOLSA (StockMarket) ---
// Proxy para catálogo de activos
app.get('/api/proxy/bolsa/activos', async (req, res) => {
  try {
    console.log('[BOLSA PROXY] GET /api/proxy/bolsa/activos - Consultando catálogo de activos');
    const botUrl = 'http://37.27.21.91:5021/api/bolsa/activos';
    console.log(`[BOLSA PROXY] URL del bot: ${botUrl}`);
    
    const response = await fetch(botUrl);
    const data = await response.json();
    
    console.log(`[BOLSA PROXY] Response status: ${response.status}`);
    console.log(`[BOLSA PROXY] Response data:`, data);
    
    res.status(response.status).json(data);
  } catch (error) {
    console.error('[BOLSA PROXY] ❌ Error getting activos:', error);
    res.status(500).json({ error: 'Error al obtener catálogo de activos', details: error.message });
  }
});

// Proxy para saldo del usuario
app.get('/api/proxy/bolsa/saldo/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    console.log('[BOLSA PROXY] GET /api/proxy/bolsa/saldo/' + userId);
    const botUrl = `http://37.27.21.91:5021/api/bolsa/saldo/${userId}`;
    console.log(`[BOLSA PROXY] URL del bot: ${botUrl}`);
    
    const response = await fetch(botUrl);
    const data = await response.json();
    
    console.log(`[BOLSA PROXY] Response status: ${response.status}`);
    console.log(`[BOLSA PROXY] Response data:`, data);
    
    res.status(response.status).json(data);
  } catch (error) {
    console.error('[BOLSA PROXY] ❌ Error getting saldo:', error);
    res.status(500).json({ error: 'Error al obtener saldo', details: error.message });
  }
});

// Proxy para inversiones del usuario
app.get('/api/proxy/bolsa/inversiones/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    console.log('[BOLSA PROXY] GET /api/proxy/bolsa/inversiones/' + userId);
    const botUrl = `http://37.27.21.91:5021/api/bolsa/inversiones/${userId}`;
    console.log(`[BOLSA PROXY] URL del bot: ${botUrl}`);
    
    const response = await fetch(botUrl);
    const data = await response.json();
    
    console.log(`[BOLSA PROXY] Response status: ${response.status}`);
    console.log(`[BOLSA PROXY] Response data:`, data);
    
    res.status(response.status).json(data);
  } catch (error) {
    console.error('[BOLSA PROXY] ❌ Error getting inversiones:', error);
    res.status(500).json({ error: 'Error al obtener inversiones', details: error.message });
  }
});

// Proxy para comprar activos
app.post('/api/proxy/bolsa/comprar', express.json(), async (req, res) => {
  try {
    const { userId, assetId, cantidad } = req.body;
    console.log('[BOLSA PROXY] POST /api/proxy/bolsa/comprar', { userId, assetId, cantidad });
    const botUrl = 'http://37.27.21.91:5021/api/bolsa/comprar';
    console.log(`[BOLSA PROXY] URL del bot: ${botUrl}`);
    
    const response = await fetch(botUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, assetId, cantidad })
    });
    
    const data = await response.json();
    
    console.log(`[BOLSA PROXY] Response status: ${response.status}`);
    console.log(`[BOLSA PROXY] Response data:`, data);
    
    res.status(response.status).json(data);
  } catch (error) {
    console.error('[BOLSA PROXY] ❌ Error comprando:', error);
    res.status(500).json({ error: 'Error al comprar activo', details: error.message });
  }
});

// Proxy para vender activos
app.post('/api/proxy/bolsa/vender', express.json(), async (req, res) => {
  try {
    const { userId, assetId, cantidad } = req.body;
    console.log('[BOLSA PROXY] POST /api/proxy/bolsa/vender', { userId, assetId, cantidad });
    const botUrl = 'http://37.27.21.91:5021/api/bolsa/vender';
    console.log(`[BOLSA PROXY] URL del bot: ${botUrl}`);
    
    const response = await fetch(botUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, assetId, cantidad })
    });
    
    const data = await response.json();
    
    console.log(`[BOLSA PROXY] Response status: ${response.status}`);
    console.log(`[BOLSA PROXY] Response data:`, data);
    
    res.status(response.status).json(data);
  } catch (error) {
    console.error('[BOLSA PROXY] ❌ Error vendiendo:', error);
    res.status(500).json({ error: 'Error al vender activo', details: error.message });
  }
});

// --- Anuncios con imágenes ---
// Declaraciones de multer movidas al inicio del archivo

// Endpoint de prueba para crear anuncio
app.post('/api/announcements/test', (req, res) => {
  console.log('[ANNOUNCEMENTS] POST /api/announcements/test - Creando anuncio de prueba');
  const testAnnouncement = {
    title: 'Anuncio de Prueba',
    body: 'Este es un anuncio de prueba para verificar que el sistema funciona correctamente.',
    authorName: 'Sistema',
    createdAt: new Date().toISOString(),
    images: JSON.stringify([])
  };
  
  db.run('INSERT INTO announcements (title, body, authorId, authorName, createdAt, images) VALUES (?, ?, ?, ?, ?, ?)', 
    [testAnnouncement.title, testAnnouncement.body, null, testAnnouncement.authorName, testAnnouncement.createdAt, testAnnouncement.images], 
    function(err) {
      if (err) {
        console.error('[ANNOUNCEMENTS] Error creando anuncio de prueba:', err.message);
        return res.status(500).json({ error: 'Error creando anuncio de prueba' });
      }
      console.log('[ANNOUNCEMENTS] Anuncio de prueba creado con ID:', this.lastID);
      res.json({ success: true, id: this.lastID, message: 'Anuncio de prueba creado correctamente' });
    }
  );
});

// GET: noticias en vivo
app.get('/api/announcements', (req, res) => {
  console.log('[ANNOUNCEMENTS] GET /api/announcements - Consultando anuncios');
  db.all('SELECT * FROM announcements ORDER BY id DESC LIMIT 100', [], (err, rows) => {
    if (err) {
      console.error('[ANNOUNCEMENTS] Error:', err.message);
      return res.status(500).json({ error: 'Error leyendo anuncios' });
    }
    console.log(`[ANNOUNCEMENTS] Encontrados ${rows ? rows.length : 0} anuncios`);
    // Parsear imágenes
    const anns = (rows || []).map(row => {
      let images = [];
      try { images = JSON.parse(row.images || '[]'); } catch {}
      return { ...row, images };
    });
    res.json({ announcements: anns });
  });
});

// DELETE: eliminar noticia (solo usuarios con rol especial)
app.delete('/api/announcements/:id', async (req, res) => {
  const userId = req.body.userId || req.query.userId;
  const newsId = req.params.id;
  if (!userId || !newsId) return res.status(400).json({ error: 'Faltan datos' });
  try {
    const BOT_API_URL = process.env.BOT_API_URL || 'https://spainrp-web.onrender.com/';
    const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
    const resp = await fetch(`${BOT_API_URL}/api/discord/candeletenews/${encodeURIComponent(userId)}`);
    const data = await resp.json();
    if (!data.canDelete) return res.status(403).json({ error: 'No tienes permisos para eliminar noticias.' });
    db.run('DELETE FROM announcements WHERE id = ?', [newsId], function(err){
      if (err) return res.status(500).json({ error: 'No se pudo eliminar' });
      res.json({ success: true });
    });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar noticia', details: err.message });
  }
});

// PUT: editar noticia (solo autor o reportero oficial)
app.put('/api/announcements/:id', express.json(), async (req, res) => {
  const userId = req.body.userId || req.query.userId;
  const newsId = req.params.id;
  const { title, body, images, company, tags } = req.body;
  if (!userId || !newsId) return res.status(400).json({ error: 'Faltan datos' });
  try {
    const BOT_API_URL = process.env.BOT_API_URL || 'https://spainrp-web.onrender.com/';
    const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
    const news = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM announcements WHERE id = ?', [newsId], (err, row) => {
        if (err) reject(err); else resolve(row);
      });
    });
    if (!news) return res.status(404).json({ error: 'Noticia no encontrada' });
    // Verificar si el usuario es el autor o tiene rol de reportero
    let canEdit = false;
    if (news.authorId === userId) {
      canEdit = true;
    } else {
      const resp = await fetch(`${BOT_API_URL}/api/discord/canpostnews/${encodeURIComponent(userId)}`);
      const data = await resp.json();
      canEdit = !!data.canPost;
    }
    if (!canEdit) return res.status(403).json({ error: 'No tienes permisos para editar esta noticia.' });
    db.run('UPDATE announcements SET title = ?, body = ?, images = ?, company = ?, tags = ? WHERE id = ?', [title, body, JSON.stringify(images || []), company, JSON.stringify(tags || []), newsId], function(err){
      if (err) return res.status(500).json({ error: 'No se pudo editar' });
      res.json({ success: true });
    });
  } catch (err) {
    res.status(500).json({ error: 'Error al editar noticia', details: err.message });
  }
});

// POST: crear noticia (con imágenes)
app.post('/api/announcements', uploadAnnouncements.fields([
  { name: 'images', maxCount: 5 }
]), async (req, res) => {
  // Verificación de rol Discord usando discordClient local
  try {
    const userId = req.body.userId || req.body.authorId || req.body.author || req.body.authorName;
    if (!userId) return res.status(400).json({ error: 'Falta userId para verificación de rol' });
    
    // Verificar si el bot de Discord está disponible
    if (!discordClient.readyAt) {
      console.warn('[ANNOUNCEMENTS] ⚠️ Bot de Discord no disponible');
      return res.status(503).json({ error: 'Bot de Discord no disponible' });
    }
    
    // Verificar permisos usando discordClient local
    const guildId = process.env.DISCORD_GUILD_ID || '1212556680911650866';
    const reporteroRoleId = process.env.REPORTERO_ROLE_ID || '1384340819590512700';
    const guild = discordClient.guilds.cache.get(guildId);
    if (!guild) {
      console.error(`[ANNOUNCEMENTS] ❌ Servidor no encontrado: ${guildId}`);
      return res.status(404).json({ error: 'Servidor no encontrado' });
    }
    
    await guild.members.fetch();
    const member = guild.members.cache.get(userId);
    if (!member) {
      console.error(`[ANNOUNCEMENTS] ❌ Usuario no encontrado: ${userId}`);
      return res.status(404).json({ error: 'Usuario no encontrado en el servidor' });
    }
    
    const canPost = member.roles.cache.has(reporteroRoleId);
    if (!canPost) {
      console.warn(`[ANNOUNCEMENTS] ❌ Usuario ${userId} no tiene rol de reportero`);
      return res.status(403).json({ error: 'No tienes permisos para publicar noticias' });
    }
    
    console.log(`[ANNOUNCEMENTS] ✅ Usuario ${userId} autorizado para publicar noticias`);
    // --- lógica original ---
    const { title, body, authorName, company, tags } = req.body || {};
    let imageUrls = [];
    if (Array.isArray(req.body['imageUrls[]'])) {
      imageUrls = req.body['imageUrls[]'];
    } else if (req.body['imageUrls[]']) {
      imageUrls = [req.body['imageUrls[]']];
    }
    // Archivos subidos
    let fileImages = [];
    if (req.files && req.files['images']) {
      fileImages = req.files['images'].map(f => '/uploads/news/' + f.filename);
    }
    const images = [...imageUrls, ...fileImages];
  const createdAt = new Date().toISOString();
    db.run('INSERT INTO announcements (title, body, authorId, authorName, createdAt, images) VALUES (?, ?, ?, ?, ?, ?)', [title, body, null, authorName, createdAt, JSON.stringify(images)], function(err) {
      if (err) {
        console.error('[ANNOUNCEMENTS][SQLITE]', err.message, err);
        return res.status(500).json({ error: 'No se pudo crear', details: err.message });
      }
      // --- Enviar webhook a Discord con logs ---
      // https://discord.com/api/webhooks/1414345705081929898/mK_KNr6_DzhV5UfipyWBodDjISXRvgNyv8h0tRtn5bK8-ITShLbDul7ttSVMRoQ3P2so
      (async () => {
        try {
          const WEBHOOK_URL = 'https://discord.com/api/webhooks/1414345705081929898/mK_KNr6_DzhV5UfipyWBodDjISXRvgNyv8h0tRtn5bK8-ITShLbDul7ttSVMRoQ3P2so';
          let imageUrl = images[0] ? (images[0].startsWith('http') ? images[0] : `${process.env.PUBLIC_BASE_URL || 'https://spainrp.com'}${images[0]}`) : null;
          // Mejorar el embed: noticia real
          const embed = {
            title: `📰 ${title}`,
            description: body,
            color: 0x5865F2,
            author: {
              name: authorName || 'Desconocido',
              icon_url: 'https://cdn.discordapp.com/embed/avatars/0.png'
            },
            timestamp: createdAt,
            image: imageUrl ? { url: imageUrl } : undefined,
            footer: {
              text: 'Publicado en SpainRP',
              icon_url: 'https://spainrp.com/favicon.ico'
            },
            fields: []
          };
          // Campos extra: empresa y etiquetas
          if (company) {
            embed.fields.push({ name: 'Empresa', value: company, inline: true });
          }
          if (tags && Array.isArray(tags) && tags.length > 0) {
            embed.fields.push({ name: 'Etiquetas', value: tags.join(' '), inline: true });
          }
          const payload = {
            username: 'SpainRP Noticias',
            avatar_url: 'https://spainrp.com/favicon.ico',
            embeds: [embed]
          };
          // Enviar el embed (si es imagen local, adjuntar como archivo)
          if (images[0] && !images[0].startsWith('http')) {
            const fs = require('fs');
            const path = require('path');
            const FormData = require('form-data');
            const filePath = path.join(__dirname, '../', images[0]);
            if (fs.existsSync(filePath)) {
              const formData = new FormData();
              formData.append('payload_json', JSON.stringify(payload));
              formData.append('file', fs.createReadStream(filePath), { filename: 'noticia.jpg' });
              const webhookResp = await fetch(WEBHOOK_URL, {
                method: 'POST',
                body: formData
              });
              const webhookText = await webhookResp.text();
              console.log(`[DISCORD WEBHOOK] Status: ${webhookResp.status}`);
              if (webhookResp.ok) {
                console.log('[DISCORD WEBHOOK] Enviado correctamente:', webhookText);
              } else {
                console.error('[DISCORD WEBHOOK] Error al enviar:', webhookText);
              }
              return;
            }
          }
          // Si la imagen es URL, enviar solo el embed
          const webhookResp = await fetch(WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
          const webhookText = await webhookResp.text();
          console.log(`[DISCORD WEBHOOK] Status: ${webhookResp.status}`);
          if (webhookResp.ok) {
            console.log('[DISCORD WEBHOOK] Enviado correctamente:', webhookText);
          } else {
            console.error('[DISCORD WEBHOOK] Error al enviar:', webhookText);
          }
        } catch (e) {
          console.error('[DISCORD WEBHOOK] Error enviando noticia:', e);
        }
      })();
      // --- Fin webhook ---
      res.json({ id: this.lastID, title, body, authorName, createdAt, images });
    });
  } catch (err) {
    res.status(500).json({ error: 'Error al publicar noticia', details: err.message });
  }
});

app.delete('/admin/announcements/:id', ensureAuthAndAdmin, (req, res) => {
  db.run('DELETE FROM announcements WHERE id = ?', [req.params.id], function(err){
    if (err) return res.status(500).json({ error: 'No se pudo eliminar' });
    res.json({ success: true });
  });
});

// --- Encuestas ---
function serializePoll(row, votes = []) {
  let options = [];
  try { options = JSON.parse(row.options || '[]'); } catch(_) { options = []; }
  const counts = new Array(options.length).fill(0);
  votes.forEach(v => { if (counts[v.optionIndex] !== undefined) counts[v.optionIndex]++; });
  return { id: row.id, question: row.question, options, counts, createdAt: row.createdAt, authorId: row.authorId, authorName: row.authorName };
}

app.get('/api/polls', (req, res) => {
  db.all('SELECT * FROM polls ORDER BY id DESC LIMIT 20', [], (err, polls) => {
    if (err) return res.status(500).json({ error: 'Error leyendo encuestas' });
    if (!polls || polls.length === 0) return res.json({ polls: [] });
    const ids = polls.map(p => p.id);
    db.all(`SELECT pollId, optionIndex FROM poll_votes WHERE pollId IN (${ids.map(()=>'?').join(',')})`, ids, (err2, votes) => {
      if (err2) return res.json({ polls: polls.map(p => serializePoll(p, [])) });
      const grouped = ids.reduce((acc,id)=>{ acc[id]=[]; return acc; }, {});
      (votes||[]).forEach(v => { if (grouped[v.pollId]) grouped[v.pollId].push(v); });
      res.json({ polls: polls.map(p => serializePoll(p, grouped[p.id]||[])) });
    });
  });
});

app.post('/admin/polls', ensureAuthAndAdmin, (req, res) => {
  const { question, options } = req.body || {};
  if (!question || !Array.isArray(options) || options.length < 2) return res.status(400).json({ error: 'Pregunta u opciones inválidas' });
  const createdAt = new Date().toISOString();
  const authorId = req.user?.id || null;
  const authorName = req.user?.username || null;
  db.run('INSERT INTO polls (question, options, authorId, authorName, createdAt) VALUES (?, ?, ?, ?, ?)', [question, JSON.stringify(options), authorId, authorName, createdAt], function(err){
    if (err) return res.status(500).json({ error: 'No se pudo crear la encuesta' });
    res.json({ id: this.lastID, question, options, authorId, authorName, createdAt, counts: new Array(options.length).fill(0) });
  });
});

app.post('/api/polls/:id/vote', ensureAuthenticated, (req, res) => {
  const pollId = parseInt(req.params.id, 10);
  const { optionIndex } = req.body || {};
  const userId = req.user?.id;
  if (Number.isNaN(pollId) || typeof optionIndex !== 'number') return res.status(400).json({ error: 'Datos inválidos' });
  const createdAt = new Date().toISOString();
  db.run('INSERT OR REPLACE INTO poll_votes (id, pollId, userId, optionIndex, createdAt) VALUES ((SELECT id FROM poll_votes WHERE pollId = ? AND userId = ?), ?, ?, ?, ?)', [pollId, userId, pollId, userId, optionIndex, createdAt], function(err){
    if (err) return res.status(500).json({ error: 'No se pudo votar' });
    // devolver resultados agregados
    db.get('SELECT * FROM polls WHERE id = ?', [pollId], (err2, poll) => {
      if (err2 || !poll) return res.json({ success: true });
      db.all('SELECT optionIndex FROM poll_votes WHERE pollId = ?', [pollId], (err3, votes) => {
        if (err3) return res.json({ success: true });
        const ser = serializePoll(poll, votes || []);
        res.json({ poll: ser });
      });
    });
  });
});

app.get('/admin/bans', ensureAuthAndAdmin, (req, res) => {
  db.all('SELECT * FROM bans ORDER BY id DESC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Error leyendo bans' });
    res.json({ bans: rows });
  });
});

app.post('/admin/bans', ensureAuthAndAdmin, (req, res) => {
  const { ip, userId, reason } = req.body || {};
  if (!ip && !userId) return res.status(400).json({ error: 'Debes proporcionar ip o userId' });
  const createdAt = new Date().toISOString();
  db.run('INSERT INTO bans (ip, userId, reason, createdAt) VALUES (?, ?, ?, ?)', [ip || null, userId || null, reason || null, createdAt], function(err) {
    if (err) return res.status(500).json({ error: 'No se pudo crear el ban' });
    res.json({ id: this.lastID, ip, userId, reason, createdAt });
  });
});

app.delete('/admin/bans/:id', ensureAuthAndAdmin, (req, res) => {
  const id = req.params.id;
  db.run('DELETE FROM bans WHERE id = ?', [id], function(err) {
    if (err) return res.status(500).json({ error: 'No se pudo eliminar el ban' });
    res.json({ success: true });
  });
});

const PORT = process.env.PORT || 3001;
// --- ENDPOINTS BACKEND PARA PROXY ---
app.post('/api/backend/roblox/resolve', async (req, res) => {
  console.log('[ROBLOX RESOLVE] POST /api/backend/roblox/resolve', req.body);
  if (!fetchRoblox) {
    console.error('[ROBLOX RESOLVE] fetchRoblox not defined');
    return res.status(500).json({ error: 'node-fetch not installed' });
  }
  const { username } = req.body;
  if (!username) {
    console.warn('[ROBLOX RESOLVE] Username required');
    return res.status(400).json({ error: 'Username required' });
  }
  try {
    // Modern Roblox API: https://users.roblox.com/v1/usernames/users
    const robloxRes = await fetchRoblox('https://users.roblox.com/v1/usernames/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usernames: [username], excludeBannedUsers: true })
    });
    const contentType = robloxRes.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await robloxRes.text();
      console.error('[ROBLOX API] Respuesta no JSON:', text);
      return res.status(502).json({ error: 'Roblox API no responde JSON', details: text });
    }
    const data = await robloxRes.json();
    console.log('[ROBLOX RESOLVE] Roblox API response:', data);
    if (data && data.data && data.data[0] && data.data[0].id && /^\d+$/.test(String(data.data[0].id))) {
      console.log('[ROBLOX RESOLVE] Resolved ID:', data.data[0].id);
      return res.json({ id: String(data.data[0].id) });
    }
    console.warn('[ROBLOX RESOLVE] User not found or invalid ID:', username);
    return res.status(404).json({ error: 'User not found or invalid ID' });
  } catch (e) {
    console.error('[ROBLOX API] Error:', e);
    return res.status(500).json({ error: 'Roblox API error', details: String(e) });
  }
});


// ===== PROXY PARA ADMINISTRADORES TOTALES =====
// --- LOGGING Y LOGS PAGE ---
const LOG_DIR = path.join(__dirname, 'logs');
if (!fs.existsSync(LOG_DIR)) fs.mkdirSync(LOG_DIR);
const ACCESS_LOG = path.join(LOG_DIR, 'access.log');
const ERROR_LOG = path.join(LOG_DIR, 'error.log');

function logAccess(req, user) {
  const line = `[${new Date().toISOString()}] ${req.method} ${req.originalUrl} - ${user ? user.id : 'anon'}\n`;
  fs.appendFile(ACCESS_LOG, line, () => {});
}
function logError(err, req, user) {
  const line = `[${new Date().toISOString()}] ${req.method} ${req.originalUrl} - ${user ? user.id : 'anon'} - ERROR: ${err.message}\n`;
  fs.appendFile(ERROR_LOG, line, () => {});
}

// Middleware para loguear accesos
app.use((req, res, next) => {
  // Solo loguea rutas importantes
  if (!req.originalUrl.startsWith('/static') && !req.originalUrl.startsWith('/uploads')) {
    logAccess(req, req.user);
  }
  next();
});

// Ruta secreta de logs solo para admins (usa middlewares globales robustos)
app.get('/logs', ensureAuthAndAdmin, (req, res) => {
  try {
    const access = fs.existsSync(ACCESS_LOG) ? fs.readFileSync(ACCESS_LOG, 'utf8') : '';
    const error = fs.existsSync(ERROR_LOG) ? fs.readFileSync(ERROR_LOG, 'utf8') : '';
    res.set('Content-Type', 'text/html');
    res.send(`
      <html><head><title>Logs SpainRP</title><style>body{background:#181818;color:#fff;font-family:monospace;padding:2rem;}h2{color:#FFD700;}pre{background:#23272a;padding:1rem;border-radius:8px;max-height:300px;overflow:auto;}a{color:#FFD700;}</style></head><body>
      <h2>Access Log</h2><pre>${access || 'Sin registros.'}</pre>
      <h2>Error Log</h2><pre>${error || 'Sin errores.'}</pre>
      <a href="/">Volver al panel</a>
      </body></html>
    `);
  } catch (e) {
    res.status(500).send('Error mostrando logs');
  }
});

// Middleware global para loguear errores
app.use((err, req, res, next) => {
  logError(err, req, req.user);
  next(err);
});


// Buscar usuarios por nombre (solo administradores) - Usar endpoint local
app.get('/api/proxy/admin/search/:query', async (req, res) => {
  try {
    const { query } = req.params;
    const { adminUserId } = req.query;
    console.log('[ADMIN PROXY] ===== INICIO SEARCH (LOCAL) =====');
    console.log(`[ADMIN PROXY] GET /api/proxy/admin/search/${query}?adminUserId=${adminUserId}`);
    
    // Verificar si el bot de Discord está disponible
    if (!discordClient.readyAt) {
      console.warn('[ADMIN PROXY] ⚠️ Bot de Discord no disponible, devolviendo lista vacía');
      return res.json({ users: [], message: 'Bot de Discord no disponible' });
    }
    
    // Usar el endpoint local directamente
    const guildId = process.env.DISCORD_GUILD_ID || '1212556680911650866';
    console.log(`[ADMIN PROXY] Guild ID: ${guildId}, Query: ${query}, Admin User ID: ${adminUserId}`);
    
    const guild = discordClient.guilds.cache.get(guildId);
    if (!guild) {
      console.error(`[ADMIN PROXY] ❌ Servidor no encontrado: ${guildId}`);
      return res.status(404).json({ error: 'Servidor no encontrado', users: [] });
    }
    
    await guild.members.fetch();
    const adminMember = guild.members.cache.get(adminUserId);
    if (!adminMember) {
      console.error(`[ADMIN PROXY] ❌ Admin no encontrado: ${adminUserId}`);
      return res.status(404).json({ error: 'Admin no encontrado', users: [] });
    }
    
    const hasAdminRole = adminMember.roles.cache.has('1384340649205301359');
    const hasAdminPerms = adminMember.permissions.has(PermissionsBitField.Flags.Administrator);
    if (!hasAdminRole && !hasAdminPerms) {
      console.error(`[ADMIN PROXY] ❌ Sin permisos de admin: ${adminUserId}`);
      return res.status(403).json({ error: 'No tienes permisos de administrador', users: [] });
    }
    
    // Buscar usuarios por nombre de usuario o display name
    const members = guild.members.cache.filter(member => 
      member.user.username.toLowerCase().includes(query.toLowerCase()) ||
      (member.displayName && member.displayName.toLowerCase().includes(query.toLowerCase()))
    );
    
    const results = members.map(member => ({
      id: member.user.id,
      username: member.user.username,
      displayName: member.displayName,
      discriminator: member.user.discriminator,
      avatar: member.user.avatar,
      joinedAt: member.joinedAt
    })).slice(0, 20); // Limitar a 20 resultados
    
    const payload = { users: results };
    console.log(`[ADMIN PROXY] ✅ Search result for "${query}": ${results.length} users found`);
    console.log('[ADMIN PROXY] ===== FIN SEARCH (LOCAL) =====');
    res.json(payload);
  } catch (e) {
    console.error('[ADMIN PROXY] ===== ERROR SEARCH (LOCAL) =====');
    console.error(`[ADMIN PROXY] Error:`, e.message);
    console.error(`[ADMIN PROXY] Stack trace:`, e.stack);
    console.log('[ADMIN PROXY] ===== FIN ERROR =====');
    res.status(500).json({ 
      error: 'Error al buscar usuarios', 
      details: e.message,
      users: [] 
    });
  }
});

// Ver inventario de cualquier usuario (solo administradores) - PROXY CORREGIDO
app.get('/api/proxy/admin/inventory/:targetUserId', async (req, res) => {
  try {
    const { targetUserId } = req.params;
    const { adminUserId } = req.query;
    console.log(`[ADMIN PROXY] ===== INICIO INVENTARIO =====`);
    console.log(`[ADMIN PROXY] GET /api/proxy/admin/inventory/${targetUserId}?adminUserId=${adminUserId}`);
    
    // Verificar si el bot de Discord está disponible
    if (!discordClient.readyAt) {
      console.warn('[ADMIN PROXY] ⚠️ Bot de Discord no disponible');
      return res.status(503).json({ error: 'Bot de Discord no disponible' });
    }
    
    // Verificar permisos de admin usando discordClient local
    const guildId = process.env.DISCORD_GUILD_ID || '1212556680911650866';
    console.log(`[ADMIN PROXY] Guild ID: ${guildId}, Target User ID: ${targetUserId}, Admin User ID: ${adminUserId}`);
    
    const guild = discordClient.guilds.cache.get(guildId);
    if (!guild) {
      console.error(`[ADMIN PROXY] ❌ Servidor no encontrado: ${guildId}`);
      return res.status(404).json({ error: 'Servidor no encontrado' });
    }
    
    await guild.members.fetch();
    const adminMember = guild.members.cache.get(adminUserId);
    if (!adminMember) {
      console.error(`[ADMIN PROXY] ❌ Admin no encontrado: ${adminUserId}`);
      return res.status(404).json({ error: 'Admin no encontrado' });
    }
    
    const hasAdminRole = adminMember.roles.cache.has('1384340649205301359');
    const hasAdminPerms = adminMember.permissions.has(PermissionsBitField.Flags.Administrator);
    if (!hasAdminRole && !hasAdminPerms) {
      console.error(`[ADMIN PROXY] ❌ Sin permisos de admin: ${adminUserId}`);
      return res.status(403).json({ error: 'No tienes permisos de administrador' });
    }
    
    console.log(`[ADMIN PROXY] ✅ Permisos verificados para admin: ${adminUserId}`);
    
    // Llamar directamente a la API externa del bot
    const botUrl = `http://37.27.21.91:5021/api/blackmarket/admin/inventory/${targetUserId}`;
    console.log(`[ADMIN PROXY] URL del bot: ${botUrl}`);
    
    const response = await fetch(botUrl);
    const data = await response.json();
    
    console.log(`[ADMIN PROXY] Response status: ${response.status}`);
    console.log(`[ADMIN PROXY] Response data:`, data);
    console.log(`[ADMIN PROXY] ===== FIN INVENTARIO =====`);
    
    res.status(response.status).json(data);
  } catch (error) {
    console.error('[ADMIN PROXY] ❌ Error getting inventory:', error);
    res.status(500).json({ error: 'Error al obtener inventario', details: error.message });
  }
});

// Ver saldo de cualquier usuario (solo administradores) - IMPLEMENTACIÓN LOCAL
app.get('/api/proxy/admin/balance/:targetUserId', async (req, res) => {
  try {
    const { targetUserId } = req.params;
    const { adminUserId } = req.query;
    console.log(`[ADMIN PROXY] ===== INICIO BALANCE =====`);
    console.log(`[ADMIN PROXY] GET /api/proxy/admin/balance/${targetUserId}?adminUserId=${adminUserId}`);
    
    // Verificar si el bot de Discord está disponible
    if (!discordClient.readyAt) {
      console.warn('[ADMIN PROXY] ⚠️ Bot de Discord no disponible');
      return res.status(503).json({ error: 'Bot de Discord no disponible' });
    }
    
    // Verificar permisos de admin usando discordClient local
    const guildId = process.env.DISCORD_GUILD_ID || '1212556680911650866';
    console.log(`[ADMIN PROXY] Guild ID: ${guildId}, Target User ID: ${targetUserId}, Admin User ID: ${adminUserId}`);
    
    const guild = discordClient.guilds.cache.get(guildId);
    if (!guild) {
      console.error(`[ADMIN PROXY] ❌ Servidor no encontrado: ${guildId}`);
      return res.status(404).json({ error: 'Servidor no encontrado' });
    }
    
    await guild.members.fetch();
    const adminMember = guild.members.cache.get(adminUserId);
    if (!adminMember) {
      console.error(`[ADMIN PROXY] ❌ Admin no encontrado: ${adminUserId}`);
      return res.status(404).json({ error: 'Admin no encontrado' });
    }
    
    const hasAdminRole = adminMember.roles.cache.has('1384340649205301359');
    const hasAdminPerms = adminMember.permissions.has(PermissionsBitField.Flags.Administrator);
    if (!hasAdminRole && !hasAdminPerms) {
      console.error(`[ADMIN PROXY] ❌ Sin permisos de admin: ${adminUserId}`);
      return res.status(403).json({ error: 'No tienes permisos de administrador' });
    }
    
    console.log(`[ADMIN PROXY] ✅ Permisos verificados para admin: ${adminUserId}`);
    
    // Llamar directamente a la API externa del bot
    const botUrl = `http://37.27.21.91:5021/api/blackmarket/admin/balance/${targetUserId}`;
    console.log(`[ADMIN PROXY] URL del bot: ${botUrl}`);
    
    const response = await fetch(botUrl);
    const data = await response.json();
    
    console.log(`[ADMIN PROXY] Response status: ${response.status}`);
    console.log(`[ADMIN PROXY] Response data:`, data);
    console.log(`[ADMIN PROXY] ===== FIN BALANCE =====`);
    
    res.status(response.status).json(data);
  } catch (error) {
    console.error('[ADMIN PROXY] ❌ Error getting balance:', error);
    res.status(500).json({ error: 'Error al obtener balance', details: error.message });
  }
});

// Agregar items al inventario de un usuario (solo administradores)
app.post('/api/proxy/admin/additem', express.json(), async (req, res) => {
  try {
    const { targetUserId, itemId, amount, adminUserId } = req.body;
    console.log(`[PROXY] [additem] Request body:`, req.body);
    // El API externo espera 'userId', no 'targetUserId'
    const payload = { userId: targetUserId, itemId, amount, adminUserId };
    console.log(`[PROXY] [additem] Forwarding payload:`, payload);
    const response = await fetch(`${process.env.BOT_API_URL || 'https://spainrp-web.onrender.com/'}/api/admin/additem`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    console.log(`[PROXY] [additem] Response status:`, response.status);
    const text = await response.text();
    console.log(`[PROXY] [additem] Raw response:`, text);
    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      console.error(`[PROXY] [additem] JSON parse error:`, e);
      data = { error: 'Error al agregar item', details: text };
    }
    console.log(`[PROXY] [additem] Final result:`, data);
    res.json(data);
  } catch (error) {
    console.error('[PROXY] [additem] Exception:', error);
    res.status(500).json({ error: 'Error al agregar item', details: String(error) });
  }
});

// Retirar items del inventario de un usuario (solo administradores)
app.post('/api/proxy/admin/removeitem', express.json(), async (req, res) => {
  try {
    const { targetUserId, itemId, amount, adminUserId } = req.body;
    console.log(`[PROXY] [removeitem] Request body:`, req.body);
    const payload = { userId: targetUserId, itemId, amount, adminUserId };
    console.log(`[PROXY] [removeitem] Forwarding payload:`, payload);
    const response = await fetch(`${process.env.BOT_API_URL || 'https://spainrp-web.onrender.com/'}/api/admin/removeitem`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    console.log(`[PROXY] [removeitem] Response status:`, response.status);
    const text = await response.text();
    console.log(`[PROXY] [removeitem] Raw response:`, text);
    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      console.error(`[PROXY] [removeitem] JSON parse error:`, e);
      data = { error: 'Error al retirar item', details: text };
    }
    console.log(`[PROXY] [removeitem] Final result:`, data);
    res.json(data);
  } catch (error) {
    console.error('[PROXY] [removeitem] Exception:', error);
    res.status(500).json({ error: 'Error al retirar item', details: String(error) });
  }
});


// Utilidad para validar admin en tiempo real usando discordClient local
async function isAdminUser(userId) {
  try {
    // Verificar si el bot de Discord está disponible
    if (!discordClient.readyAt) {
      console.warn('[ISADMIN USER] Bot de Discord no disponible');
      return false;
    }
    
    const guildId = process.env.DISCORD_GUILD_ID || '1212556680911650866';
    const adminRoleId = '1384340649205301359';
    
    const guild = discordClient.guilds.cache.get(guildId);
    if (!guild) return false;
    
    await guild.members.fetch();
    const member = guild.members.cache.get(userId);
    if (!member) return false;
    
    const hasAdminRole = member.roles.cache.has(adminRoleId);
    const hasAdminPerms = member.permissions.has(PermissionsBitField.Flags.Administrator);
    return hasAdminRole || hasAdminPerms;
  } catch (e) {
    console.error('[ISADMIN USER] Error:', e.message);
    return false;
  }
}


// --- DISCORD BOT EVENTS ---
discordClient.once('ready', () => {
  console.log(`Bot Discord iniciado como ${discordClient.user.tag}`);
  console.log('Intents activos:', discordClient.options.intents.bitfield.toString());
  
  // Exponer el cliente globalmente para otros módulos
  global.discordClient = discordClient;
});

// Eventos de staff logs
discordClient.on('guildBanAdd', async (ban) => {
  staffLogs.push({ 
    action: 'Ban', 
    user: ban.executor?.tag || 'Desconocido', 
    target: ban.user.id, 
    timestamp: new Date().toISOString() 
  });
});

discordClient.on('guildMemberRemove', async (member) => {
  staffLogs.push({ 
    action: 'Kick/Leave', 
    user: member.user.tag, 
    target: member.user.id, 
    timestamp: new Date().toISOString() 
  });
});

discordClient.on('guildMemberUpdate', async (oldMember, newMember) => {
  // Detecta cambios de roles
  const added = newMember.roles.cache.filter(r => !oldMember.roles.cache.has(r.id));
  const removed = oldMember.roles.cache.filter(r => !newMember.roles.cache.has(r.id));
  added.forEach(role => staffLogs.push({ 
    action: 'Role Added', 
    user: newMember.user.tag, 
    target: role.name, 
    timestamp: new Date().toISOString() 
  }));
  removed.forEach(role => staffLogs.push({ 
    action: 'Role Removed', 
    user: newMember.user.tag, 
    target: role.name, 
    timestamp: new Date().toISOString() 
  }));
  
  // Detecta mute/desmute por rol
  const muteRoleId = process.env.DISCORD_MUTE_ROLE_ID || 'MUTE_ROLE_ID';
  if (!oldMember.roles.cache.has(muteRoleId) && newMember.roles.cache.has(muteRoleId)) {
    staffLogs.push({ 
      action: 'Mute', 
      user: newMember.user.tag, 
      target: newMember.user.id, 
      timestamp: new Date().toISOString() 
    });
  }
  if (oldMember.roles.cache.has(muteRoleId) && !newMember.roles.cache.has(muteRoleId)) {
    staffLogs.push({ 
      action: 'Unmute', 
      user: newMember.user.tag, 
      target: newMember.user.id, 
      timestamp: new Date().toISOString() 
    });
  }
});

// Evento para recoger DMs
discordClient.on('messageCreate', (msg) => {
  if (msg.channel.type === ChannelType.DM && !msg.author.bot) {
    console.log(`📩 DM recibido de ${msg.author.tag}: ${msg.content}`);
    dmCollector.push({
      authorId: msg.author.id,
      authorTag: msg.author.tag,
      content: msg.content,
      messageId: msg.id,
      createdTimestamp: msg.createdTimestamp,
      receivedAt: new Date().toISOString()
    });
    if (!dmReplies[msg.author.id]) dmReplies[msg.author.id] = [];
    dmReplies[msg.author.id].push({
      content: msg.content,
      timestamp: new Date().toISOString(),
      messageId: msg.id
    });
  }
});

// --- DISCORD BOT ENDPOINTS ---

// Endpoint para verificar si un usuario puede publicar noticias (rol reportero)
app.get('/api/discord/canpostnews/:userId', async (req, res) => {
  try {
    const guildId = process.env.DISCORD_GUILD_ID || '1212556680911650866';
    const reporteroRoleId = process.env.REPORTERO_ROLE_ID || '1384340819590512700';
    const { userId } = req.params;
    const guild = discordClient.guilds.cache.get(guildId);
    if (!guild) return res.status(404).json({ error: 'Servidor no encontrado' });
    await guild.members.fetch();
    const member = guild.members.cache.get(userId);
    if (!member) return res.status(404).json({ error: 'Usuario no encontrado en el servidor' });
    const canPost = member.roles.cache.has(reporteroRoleId);
    res.json({ canPost });
  } catch (err) {
    res.status(500).json({ error: 'Error al verificar permisos para publicar', details: err.message });
  }
});

// Endpoint para verificar si el usuario puede eliminar noticias (rol especial)
app.get('/api/discord/candeletenews/:userId', async (req, res) => {
  try {
    const guildId = process.env.DISCORD_GUILD_ID || '1212556680911650866';
    const deleteRoleId = '1384340649205301359';
    const { userId } = req.params;
    const guild = discordClient.guilds.cache.get(guildId);
    if (!guild) return res.status(404).json({ error: 'Servidor no encontrado' });
    await guild.members.fetch();
    const member = guild.members.cache.get(userId);
    if (!member) return res.status(404).json({ error: 'Usuario no encontrado en el servidor' });
    const canDelete = member.roles.cache.has(deleteRoleId);
    res.json({ canDelete });
  } catch (err) {
    res.status(500).json({ error: 'Error al verificar permisos para eliminar', details: err.message });
  }
});

// Endpoint para miembros activos (widget)
app.get('/api/widget', async (req, res) => {
  try {
    const guildId = process.env.DISCORD_GUILD_ID || '1212556680911650866';
    const guild = discordClient.guilds.cache.get(guildId);
    if (!guild) return res.status(404).json({ error: 'Servidor no encontrado' });
    await guild.members.fetch();
    // Filtra miembros con estado online, idle, dnd
    const presence_count = guild.members.cache.filter(m => m.presence && ['online','idle','dnd'].includes(m.presence.status)).size;
    res.json({ presence_count });
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener widget', details: err.message });
  }
});

// Endpoint para verificar si el usuario es admin
app.get('/api/discord/isadmin/:userId', async (req, res) => {
  try {
    const guildId = process.env.DISCORD_GUILD_ID || '1212556680911650866';
    const adminRoleId = process.env.DISCORD_ADMIN_ROLE_ID || 'ADMIN_ROLE_ID';
    const { userId } = req.params;
    const guild = discordClient.guilds.cache.get(guildId);
    if (!guild) return res.status(404).json({ error: 'Servidor no encontrado' });
    await guild.members.fetch();
    const member = guild.members.cache.get(userId);
    if (!member) return res.status(404).json({ error: 'Usuario no encontrado en el servidor' });
    const isAdmin = member.roles.cache.has(adminRoleId);
    res.json({ isAdmin });
  } catch (err) {
    res.status(500).json({ error: 'Error al verificar admin', details: err.message });
  }
});

// Endpoint: verificar si un usuario es miembro del servidor
app.get('/api/discord/ismember/:userId', async (req, res) => {
  try {
    const guildId = process.env.DISCORD_GUILD_ID || '1212556680911650866';
    const { userId } = req.params;
    console.log('[BOT API][ISMEMBER] Query', { guildId, userId });
    const guild = discordClient.guilds.cache.get(guildId);
    if (!guild) return res.status(404).json({ error: 'Servidor no encontrado' });
    await guild.members.fetch();
    const member = guild.members.cache.get(userId);
    const payload = { isMember: Boolean(member) };
    console.log('[BOT API][ISMEMBER] Result', payload);
    res.json(payload);
  } catch (err) {
    console.error('[BOT API][ISMEMBER] Error', err);
    res.status(500).json({ error: 'Error al verificar membresía', details: err.message });
  }
});

// Endpoint: verificar si un usuario tiene un rol específico
app.get('/api/discord/hasrole/:userId/:roleId', async (req, res) => {
  try {
    const guildId = process.env.DISCORD_GUILD_ID || '1212556680911650866';
    const { userId, roleId } = req.params;
    console.log('[BOT API][HASROLE] Query', { guildId, userId, roleId });
    const guild = discordClient.guilds.cache.get(guildId);
    if (!guild) return res.status(404).json({ error: 'Servidor no encontrado' });
    await guild.members.fetch();
    const member = guild.members.cache.get(userId);
    if (!member) return res.json({ hasRole: false, isMember: false });
    const hasRole = member.roles.cache.has(roleId);
    const payload = { hasRole, isMember: true };
    console.log('[BOT API][HASROLE] Result', payload);
    res.json(payload);
  } catch (err) {
    console.error('[BOT API][HASROLE] Error', err);
    res.status(500).json({ error: 'Error al verificar rol', details: err.message });
  }
});


// Endpoint para obtener el número total de miembros de la guild
app.get('/api/membercount', async (req, res) => {
  try {
    const guildId = process.env.DISCORD_GUILD_ID || '1212556680911650866';
    const guild = discordClient.guilds.cache.get(guildId);
    if (!guild) return res.status(404).json({ error: 'Servidor no encontrado' });
    await guild.members.fetch(); // Asegura que la caché esté poblada
    res.json({ memberCount: guild.memberCount });
  } catch (err) {
    console.error('[BOT API] Error en membercount:', err);
    res.status(500).json({ error: 'Error interno en el bot', details: err.message });
  }
});

// Endpoint para banear usuario
app.post('/api/discord/ban', express.json(), async (req, res) => {
  try {
    const guildId = process.env.DISCORD_GUILD_ID || '1212556680911650866';
    const { userId, reason } = req.body;
    if (!userId) return res.status(400).json({ error: 'Falta userId' });
    const guild = discordClient.guilds.cache.get(guildId);
    if (!guild) return res.status(404).json({ error: 'Servidor no encontrado' });
    await guild.members.fetch();
    const member = guild.members.cache.get(userId);
    if (!member) return res.status(404).json({ error: 'Usuario no encontrado en el servidor' });
    await member.ban({ reason: reason || 'Baneado desde panel admin' });
    res.json({ success: true, message: `Usuario ${userId} baneado.` });
  } catch (err) {
    console.error('[BOT API] Error en ban:', err);
    res.status(500).json({ error: 'Error al banear usuario', details: err.message });
  }
});

// Endpoint para desbanear usuario
app.post('/api/discord/unban', express.json(), async (req, res) => {
  try {
    const guildId = process.env.DISCORD_GUILD_ID || '1212556680911650866';
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: 'Falta userId' });
    const guild = discordClient.guilds.cache.get(guildId);
    if (!guild) return res.status(404).json({ error: 'Servidor no encontrado' });
    await guild.bans.fetch();
    await guild.members.unban(userId);
    res.json({ success: true, message: `Usuario ${userId} desbaneado.` });
  } catch (err) {
    console.error('[BOT API] Error en unban:', err);
    res.status(500).json({ error: 'Error al desbanear usuario', details: err.message });
  }
});

// Endpoint para kickear usuario
app.post('/api/discord/kick', express.json(), async (req, res) => {
  try {
    const guildId = process.env.DISCORD_GUILD_ID || '1212556680911650866';
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: 'Falta userId' });
    const guild = discordClient.guilds.cache.get(guildId);
    if (!guild) return res.status(404).json({ error: 'Servidor no encontrado' });
    await guild.members.fetch();
    const member = guild.members.cache.get(userId);
    if (!member) return res.status(404).json({ error: 'Usuario no encontrado en el servidor' });
    await member.kick('Kickeado desde panel admin');
    res.json({ success: true, message: `Usuario ${userId} kickeado.` });
  } catch (err) {
    console.error('[BOT API] Error en kick:', err);
    res.status(500).json({ error: 'Error al kickear usuario', details: err.message });
  }
});

// Endpoint para mutear usuario (requiere rol mute)
app.post('/api/discord/mute', express.json(), async (req, res) => {
  try {
    const guildId = process.env.DISCORD_GUILD_ID || '1212556680911650866';
    const { userId, time } = req.body;
    if (!userId || !time) return res.status(400).json({ error: 'Faltan datos' });
    const guild = discordClient.guilds.cache.get(guildId);
    if (!guild) return res.status(404).json({ error: 'Servidor no encontrado' });
    await guild.members.fetch();
    const member = guild.members.cache.get(userId);
    if (!member) return res.status(404).json({ error: 'Usuario no encontrado en el servidor' });

    // Buscar rol mute por nombre o ID
    let muteRoleId = process.env.DISCORD_MUTE_ROLE_ID;
    let muteRole = muteRoleId ? guild.roles.cache.get(muteRoleId) : guild.roles.cache.find(r => r.name.toLowerCase() === 'muted');

    // Si no existe, créalo
    if (!muteRole) {
      muteRole = await guild.roles.create({
        name: 'Muted',
        color: '#888',
        reason: 'Rol para silenciar usuarios',
        permissions: []
      });
      muteRoleId = muteRole.id;
      // Opcional: poner permisos en todos los canales
      for (const channel of guild.channels.cache.values()) {
        if (channel.type === 0 || channel.type === 2) { // 0: GUILD_TEXT, 2: GUILD_VOICE
          await channel.permissionOverwrites.edit(muteRole, {
            SendMessages: false,
            Speak: false,
            Connect: false,
            AddReactions: false
          });
        }
      }
    } else {
      muteRoleId = muteRole.id;
    }

    await member.roles.add(muteRoleId);
    setTimeout(async () => {
      try { await member.roles.remove(muteRoleId); } catch {}
    }, parseInt(time) * 60000);
    res.json({ success: true, message: `Usuario ${userId} muteado por ${time} minutos.` });
  } catch (err) {
    console.error('[BOT API] Error en mute:', err);
    res.status(500).json({ error: 'Error al mutear usuario', details: err.message });
  }
});

// Endpoint para cambiar roles
app.post('/api/discord/role', express.json(), async (req, res) => {
  try {
    const guildId = process.env.DISCORD_GUILD_ID || '1212556680911650866';
    const { userId, roleId, action } = req.body;
    if (!userId || !roleId || !action) return res.status(400).json({ error: 'Faltan datos' });
    const guild = discordClient.guilds.cache.get(guildId);
    if (!guild) return res.status(404).json({ error: 'Servidor no encontrado' });
    await guild.members.fetch();
    const member = guild.members.cache.get(userId);
    if (!member) return res.status(404).json({ error: 'Usuario no encontrado en el servidor' });
    if (action === 'add') await member.roles.add(roleId);
    else if (action === 'remove') await member.roles.remove(roleId);
    else return res.status(400).json({ error: 'Acción inválida' });
    res.json({ success: true, message: `Rol actualizado para usuario ${userId}.` });
  } catch (err) {
    console.error('[BOT API] Error en role:', err);
    res.status(500).json({ error: 'Error al cambiar rol', details: err.message });
  }
});

// Endpoint para obtener lista de roles del servidor
app.get('/api/discord/roles', async (req, res) => {
  try {
    const guildId = process.env.DISCORD_GUILD_ID || '1212556680911650866';
    const guild = discordClient.guilds.cache.get(guildId);
    if (!guild) return res.status(404).json({ error: 'Servidor no encontrado' });
    await guild.roles.fetch();
    const roles = guild.roles.cache.map(role => ({ id: role.id, name: role.name }));
    res.json({ roles });
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener roles', details: err.message });
  }
});

// Endpoint para ver lista de baneados
app.get('/api/discord/banned', async (req, res) => {
  try {
    const guildId = process.env.DISCORD_GUILD_ID || '1212556680911650866';
    const guild = discordClient.guilds.cache.get(guildId);
    if (!guild) return res.status(404).json({ error: 'Servidor no encontrado' });
    const bans = await guild.bans.fetch();
    res.json({ bans: Array.from(bans.values()) });
  } catch (err) {
    console.error('[BOT API] Error en banned:', err);
    res.status(500).json({ error: 'Error al obtener baneados', details: err.message });
  }
});

// Endpoint para logs de staff reales
app.get('/api/discord/logs', async (req, res) => {
  res.json({ logs: staffLogs.slice(-50).reverse() }); // últimos 50 logs, ordenados recientes primero
});

// Endpoint para obtener datos de miembro y roles
app.get('/api/member/:guildId/:userId', async (req, res) => {
  try {
    const { guildId, userId } = req.params;
    const guild = discordClient.guilds.cache.get(guildId);
    if (!guild) return res.status(404).json({ error: 'Servidor no encontrado' });
    await guild.members.fetch(); // Asegura que la caché esté poblada
    const member = guild.members.cache.get(userId);
    if (!member) return res.status(404).json({ error: 'Usuario no encontrado en el servidor' });
    const roles = member.roles.cache.map(r => ({ id: r.id, name: r.name }));
    res.json({
      id: member.user.id,
      username: member.user.username,
      discriminator: member.user.discriminator,
      avatar: member.user.avatar,
      joined_at: member.joinedAt,
      roles
    });
  } catch (err) {
    console.error('[BOT API] Error:', err);
    res.status(500).json({ error: 'Error interno en el bot', details: err.message });
  }
});

// Endpoint para enviar MD privado por el bot
app.post('/api/discord/senddm', uploadDM.single('file'), async (req, res) => {
  try {
    console.log('[SENDDM] Content-Type:', req.headers['content-type']);
    if (!req.body) {
      console.error('[SENDDM] req.body es undefined');
      return res.status(400).json({ error: 'Cuerpo de la petición vacío o malformado' });
    }
    // Si viene como string (por ejemplo, desde FormData), intenta parsear
    let body = req.body;
    if (typeof req.body === 'string') {
      try {
        body = JSON.parse(req.body);
      } catch (e) {
        console.error('[SENDDM] Error al parsear req.body string:', e);
        return res.status(400).json({ error: 'Body malformado (no es JSON válido)' });
      }
    }
    const { userId, type, message, embed, imageUrl } = body;
    console.log('[SENDDM] body:', body);
    console.log('[SENDDM] file:', req.file);
    if (!userId || !type) {
      console.error('[SENDDM] Faltan datos: userId o type');
      return res.status(400).json({ error: 'Faltan datos' });
    }
    await discordClient.users.fetch(userId).catch(err => {
      console.error('[SENDDM] Error al hacer fetch del usuario:', err);
      throw err;
    });
    const user = discordClient.users.cache.get(userId);
    if (!user) {
      console.error('[SENDDM] Usuario no encontrado:', userId);
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    let files = [];
    if (imageUrl) files.push(imageUrl);
    if (req.file) files.push({
      attachment: req.file.buffer,
      name: req.file.originalname
    });
    if (type === 'text') {
      if (!message) {
        console.error('[SENDDM] Faltan datos: message');
        return res.status(400).json({ error: 'Falta mensaje de texto' });
      }
      const options = { content: message };
      if (files.length > 0) options.files = files;
      await user.send(options).catch(err => {
        console.error('[SENDDM] Error al enviar DM de texto:', err);
        throw err;
      });
      res.json({ success: true });
    } else if (type === 'embed') {
      if (!embed || !embed.title || !embed.description) {
        console.error('[SENDDM] Faltan datos del embed:', embed);
        return res.status(400).json({ error: 'Faltan datos del embed' });
      }
      const options = { embeds: [{ title: embed.title, description: embed.description, color: 0x7289da }] };
      if (files.length > 0) options.files = files;
      await user.send(options).catch(err => {
        console.error('[SENDDM] Error al enviar DM embed:', err);
        throw err;
      });
      res.json({ success: true });
    } else {
      console.error('[SENDDM] Tipo de mensaje inválido:', type);
      res.status(400).json({ error: 'Tipo de mensaje inválido' });
    }
  } catch (err) {
    console.error('[SENDDM] Error general:', err);
    res.status(500).json({ error: 'Error al enviar MD', details: err.message });
  }
});

// Endpoint para ver respuestas a MDs
app.get('/api/discord/dmreplies/:userId', async (req, res) => {
  const { userId } = req.params;
  console.log('[DMREPLIES] [QUERY] Consulta de respuestas para userId:', userId);
  if (!userId || typeof userId !== 'string' || userId.length < 5) {
    console.log('[DMREPLIES] [QUERY] userId inválido:', userId);
    return res.status(200).json({ replies: [] });
  }
  const replies = Array.isArray(dmReplies[userId]) ? dmReplies[userId] : [];
  console.log(`[DMREPLIES] [QUERY] Respuestas encontradas para userId ${userId}:`, replies.length);
  if (replies.length > 0) {
    console.log('[DMREPLIES] [QUERY] Primer mensaje:', replies[0]);
  }
  res.status(200).json({ replies });
});

// Endpoint para listar todos los userId con mensajes DM guardados
app.get('/api/discord/dmreplies', async (req, res) => {
  const userIds = Object.keys(dmReplies);
  console.log('[DMREPLIES] [QUERY] Consulta de todos los userId con mensajes DM:', userIds);
  res.status(200).json({ userIds });
});

// Endpoint para ver todos los mensajes DM recibidos (recolector global)
app.get('/api/discord/dmcollector', async (req, res) => {
  console.log('[DMREPLIES] [COLLECTOR] Consulta de todos los mensajes DM recibidos. Total:', dmCollector.length);
  res.status(200).json({ messages: dmCollector });
});

// ===== ADMINISTRADORES TOTALES (ROL: 1384340649205301359) =====

// Verificar si un usuario es administrador total
app.get('/api/admin/isadmin/:userId', async (req, res) => {
  try {
    const guildId = process.env.DISCORD_GUILD_ID || '1212556680911650866';
    const adminRoleId = '1384340649205301359';
    const { userId } = req.params;
    console.log('[ADMIN API][ISADMIN] Query', { guildId, userId, adminRoleId });
    
    const guild = discordClient.guilds.cache.get(guildId);
    if (!guild) return res.status(404).json({ error: 'Servidor no encontrado' });
    
    await guild.members.fetch();
    const member = guild.members.cache.get(userId);
    if (!member) return res.json({ isAdmin: false, isMember: false });
    
    const hasAdminRole = member.roles.cache.has(adminRoleId);
    const hasAdminPerms = member.permissions.has(PermissionsBitField.Flags.Administrator);
    const isAdmin = hasAdminRole || hasAdminPerms;
    
    const payload = { isAdmin, isMember: true, hasAdminRole, hasAdminPerms };
    console.log('[ADMIN API][ISADMIN] Result', payload);
    res.json(payload);
  } catch (err) {
    console.error('[ADMIN API][ISADMIN] Error', err);
    res.status(500).json({ error: 'Error al verificar admin', details: err.message });
  }
});

// Buscar usuarios por nombre (solo administradores)
app.get('/api/admin/search/:query', async (req, res) => {
  try {
    const guildId = process.env.DISCORD_GUILD_ID || '1212556680911650866';
    const { query } = req.params;
    const { adminUserId } = req.query;
    
    console.log('[ADMIN API][SEARCH] Query', { guildId, query, adminUserId });
    
    // Verificar que el que hace la consulta sea admin
    const guild = discordClient.guilds.cache.get(guildId);
    if (!guild) return res.status(404).json({ error: 'Servidor no encontrado' });
    
    await guild.members.fetch();
    const adminMember = guild.members.cache.get(adminUserId);
    if (!adminMember) return res.status(404).json({ error: 'Admin no encontrado' });
    
    const hasAdminRole = adminMember.roles.cache.has('1384340649205301359');
    const hasAdminPerms = adminMember.permissions.has(PermissionsBitField.Flags.Administrator);
    if (!hasAdminRole && !hasAdminPerms) {
      return res.status(403).json({ error: 'No tienes permisos de administrador' });
    }
    
    // Buscar usuarios por nombre de usuario o display name
    const members = guild.members.cache.filter(member => 
      member.user.username.toLowerCase().includes(query.toLowerCase()) ||
      (member.displayName && member.displayName.toLowerCase().includes(query.toLowerCase()))
    );
    
    const results = members.map(member => ({
      id: member.user.id,
      username: member.user.username,
      displayName: member.displayName,
      discriminator: member.user.discriminator,
      avatar: member.user.avatar,
      joinedAt: member.joinedAt
    })).slice(0, 20); // Limitar a 20 resultados
    
    console.log('[ADMIN API][SEARCH] Results', { found: results.length });
    res.json({ users: results });
  } catch (err) {
    console.error('[ADMIN API][SEARCH] Error', err);
    res.status(500).json({ error: 'Error al buscar usuarios', details: err.message });
  }
});

// Ver inventario de cualquier usuario (solo administradores)
app.get('/api/admin/inventory/:targetUserId', async (req, res) => {
  try {
    const { targetUserId } = req.params;
    const { adminUserId } = req.query;
    console.log('[ADMIN API][INVENTORY] Proxy', { targetUserId, adminUserId });
    // Verificar permisos de admin
    const guildId = process.env.DISCORD_GUILD_ID || '1212556680911650866';
    const guild = discordClient.guilds.cache.get(guildId);
    if (!guild) return res.status(404).json({ error: 'Servidor no encontrado' });
    await guild.members.fetch();
    const adminMember = guild.members.cache.get(adminUserId);
    if (!adminMember) return res.status(404).json({ error: 'Admin no encontrado' });
    const hasAdminRole = adminMember.roles.cache.has('1384340649205301359');
    const hasAdminPerms = adminMember.permissions.has(PermissionsBitField.Flags.Administrator);
    if (!hasAdminRole && !hasAdminPerms) {
      return res.status(403).json({ error: 'No tienes permisos de administrador' });
    }
    // Proxy a la API externa
    const response = await fetch(`${process.env.ECONOMIA_API_URL || 'http://37.27.21.91:5021'}/api/admin/inventory/${targetUserId}`);
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (err) {
    console.error('[ADMIN API][INVENTORY] Error', err);
    res.status(500).json({ error: 'Error al obtener inventario', details: err.message });
  }
});

// Agregar items al inventario de un usuario (solo administradores)
app.post('/api/admin/additem', express.json(), async (req, res) => {
  try {
    const { targetUserId, itemId, amount, adminUserId } = req.body;
    console.log('[ADMIN API][ADDITEM] Proxy', { targetUserId, itemId, amount, adminUserId });
    // Verificar permisos de admin
    const guildId = process.env.DISCORD_GUILD_ID || '1212556680911650866';
    const guild = discordClient.guilds.cache.get(guildId);
    if (!guild) return res.status(404).json({ error: 'Servidor no encontrado' });
    await guild.members.fetch();
    const adminMember = guild.members.cache.get(adminUserId);
    if (!adminMember) return res.status(404).json({ error: 'Admin no encontrado' });
    const hasAdminRole = adminMember.roles.cache.has('1384340649205301359');
    const hasAdminPerms = adminMember.permissions.has(PermissionsBitField.Flags.Administrator);
    if (!hasAdminRole && !hasAdminPerms) {
      return res.status(403).json({ error: 'No tienes permisos de administrador' });
    }
    // Proxy a la API externa
    const response = await fetch(`${process.env.ECONOMIA_API_URL || 'http://37.27.21.91:5021'}/api/admin/additem`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: targetUserId, itemId, amount })
    });
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (err) {
    console.error('[ADMIN API][ADDITEM] Error', err);
    res.status(500).json({ error: 'Error al agregar item', details: err.message });
  }
});

// Retirar items del inventario de un usuario (solo administradores)
app.post('/api/admin/removeitem', express.json(), async (req, res) => {
  try {
    const { targetUserId, itemId, amount, adminUserId } = req.body;
    console.log('[ADMIN API][REMOVEITEM] Proxy', { targetUserId, itemId, amount, adminUserId });
    // Verificar permisos de admin
    const guildId = process.env.DISCORD_GUILD_ID || '1212556680911650866';
    const guild = discordClient.guilds.cache.get(guildId);
    if (!guild) return res.status(404).json({ error: 'Servidor no encontrado' });
    await guild.members.fetch();
    const adminMember = guild.members.cache.get(adminUserId);
    if (!adminMember) return res.status(404).json({ error: 'Admin no encontrado' });
    const hasAdminRole = adminMember.roles.cache.has('1384340649205301359');
    const hasAdminPerms = adminMember.permissions.has(PermissionsBitField.Flags.Administrator);
    if (!hasAdminRole && !hasAdminPerms) {
      return res.status(403).json({ error: 'No tienes permisos de administrador' });
    }
    // Proxy a la API externa
    const response = await fetch(`${process.env.ECONOMIA_API_URL || 'http://37.27.21.91:5021'}/api/admin/removeitem`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: targetUserId, itemId, amount })
    });
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (err) {
    console.error('[ADMIN API][REMOVEITEM] Error', err);
    res.status(500).json({ error: 'Error al retirar item', details: err.message });
  }
});

// Ver saldo de cualquier usuario (solo administradores)
app.get('/api/admin/balance/:targetUserId', async (req, res) => {
  try {
    const { targetUserId } = req.params;
    const { adminUserId } = req.query;
    console.log('[ADMIN API][BALANCE] Proxy', { targetUserId, adminUserId });
    // Verificar permisos de admin
    const guildId = process.env.DISCORD_GUILD_ID || '1212556680911650866';
    const guild = discordClient.guilds.cache.get(guildId);
    if (!guild) return res.status(404).json({ error: 'Servidor no encontrado' });
    await guild.members.fetch();
    const adminMember = guild.members.cache.get(adminUserId);
    if (!adminMember) return res.status(404).json({ error: 'Admin no encontrado' });
    const hasAdminRole = adminMember.roles.cache.has('1384340649205301359');
    const hasAdminPerms = adminMember.permissions.has(PermissionsBitField.Flags.Administrator);
    if (!hasAdminRole && !hasAdminPerms) {
      return res.status(403).json({ error: 'No tienes permisos de administrador' });
    }
    // Proxy a la API externa
    const response = await fetch(`${process.env.ECONOMIA_API_URL || 'http://37.27.21.91:5021'}/api/admin/balance/${targetUserId}`);
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (err) {
    console.error('[ADMIN API][BALANCE] Error', err);
    res.status(500).json({ error: 'Error al obtener saldo', details: err.message });
  }
});

// Modificar saldo de un usuario (solo administradores) - PROXY
app.post('/api/proxy/admin/setbalance', express.json(), async (req, res) => {
  try {
    const { targetUserId, userId, cash, bank, adminUserId } = req.body;
    const actualTargetUserId = targetUserId || userId;
    console.log(`[ADMIN PROXY] ===== INICIO SETBALANCE =====`);
    console.log(`[ADMIN PROXY] POST /api/proxy/admin/setbalance`, { targetUserId, userId, actualTargetUserId, cash, bank, adminUserId });
    
    // Verificar si el bot de Discord está disponible
    if (!discordClient.readyAt) {
      console.warn('[ADMIN PROXY] ⚠️ Bot de Discord no disponible');
      return res.status(503).json({ error: 'Bot de Discord no disponible' });
    }
    
    // Verificar permisos de admin usando discordClient local
    const guildId = process.env.DISCORD_GUILD_ID || '1212556680911650866';
    console.log(`[ADMIN PROXY] Guild ID: ${guildId}, Target User ID: ${targetUserId}, Admin User ID: ${adminUserId}`);
    
    const guild = discordClient.guilds.cache.get(guildId);
    if (!guild) {
      console.error(`[ADMIN PROXY] ❌ Servidor no encontrado: ${guildId}`);
      return res.status(404).json({ error: 'Servidor no encontrado' });
    }
    
    await guild.members.fetch();
    const adminMember = guild.members.cache.get(adminUserId);
    if (!adminMember) {
      console.error(`[ADMIN PROXY] ❌ Admin no encontrado: ${adminUserId}`);
      return res.status(404).json({ error: 'Admin no encontrado' });
    }
    
    const hasAdminRole = adminMember.roles.cache.has('1384340649205301359');
    const hasAdminPerms = adminMember.permissions.has(PermissionsBitField.Flags.Administrator);
    if (!hasAdminRole && !hasAdminPerms) {
      console.error(`[ADMIN PROXY] ❌ Sin permisos de admin: ${adminUserId}`);
      return res.status(403).json({ error: 'No tienes permisos de administrador' });
    }
    
    console.log(`[ADMIN PROXY] ✅ Permisos verificados para admin: ${adminUserId}`);
    
    // Llamar directamente a la API externa del bot
    const botUrl = `http://37.27.21.91:5021/api/blackmarket/admin/setbalance`;
    console.log(`[ADMIN PROXY] URL del bot: ${botUrl}`);
    
    const response = await fetch(botUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: targetUserId, cash, bank })
    });
    
    const data = await response.json();
    
    console.log(`[ADMIN PROXY] Response status: ${response.status}`);
    console.log(`[ADMIN PROXY] Response data:`, data);
    console.log(`[ADMIN PROXY] ===== FIN SETBALANCE =====`);
    
    res.status(response.status).json(data);
  } catch (error) {
    console.error('[ADMIN PROXY] ❌ Error setting balance:', error);
    res.status(500).json({ error: 'Error al modificar saldo', details: error.message });
  }
});

// Modificar saldo de un usuario (solo administradores)
app.post('/api/admin/setbalance', express.json(), async (req, res) => {
  try {
    const { targetUserId, cash, bank, adminUserId } = req.body;
    console.log('[ADMIN API][SETBALANCE] Proxy', { targetUserId, cash, bank, adminUserId });
    // Verificar permisos de admin
    const guildId = process.env.DISCORD_GUILD_ID || '1212556680911650866';
    const guild = discordClient.guilds.cache.get(guildId);
    if (!guild) return res.status(404).json({ error: 'Servidor no encontrado' });
    await guild.members.fetch();
    const adminMember = guild.members.cache.get(adminUserId);
    if (!adminMember) return res.status(404).json({ error: 'Admin no encontrado' });
    const hasAdminRole = adminMember.roles.cache.has('1384340649205301359');
    const hasAdminPerms = adminMember.permissions.has(PermissionsBitField.Flags.Administrator);
    if (!hasAdminRole && !hasAdminPerms) {
      return res.status(403).json({ error: 'No tienes permisos de administrador' });
    }
    // Proxy a la API externa
    const response = await fetch(`${process.env.ECONOMIA_API_URL || 'http://37.27.21.91:5021'}/api/admin/setbalance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: targetUserId, cash, bank })
    });
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (err) {
    console.error('[ADMIN API][SETBALANCE] Error', err);
    res.status(500).json({ error: 'Error al modificar saldo', details: err.message });
  }
});

// El frontend se sirve desde spainrp-oficial.onrender.com

// ===== MODO MANTENIMIENTO =====
const maintenanceFile = path.join(__dirname, 'maintenance.lock');

// Función para verificar si está en mantenimiento
const isMaintenanceMode = () => {
  return fs.existsSync(maintenanceFile) || process.env.MAINTENANCE_MODE === 'true';
};


// Middleware de mantenimiento (después de la ruta API)
app.use((req, res, next) => {
  if (isMaintenanceMode()) {
    console.log('🔧 MODO MANTENIMIENTO ACTIVADO - Bloqueando:', req.path);
    return res.status(503).json({ 
      maintenance: true, 
      message: 'El sitio está en mantenimiento',
      startedAt: new Date().toISOString()
    });
  }
  next();
});

// Iniciar el servidor y el bot
server.listen(PORT, () => {
  console.log(`Backend SpainRP escuchando en puerto ${PORT}`);
  
  // Iniciar el bot de Discord solo si hay token
  if (TOKEN) {
  discordClient.login(TOKEN).catch(err => {
    console.error('Error iniciando el bot de Discord:', err);
  });
  } else {
    console.warn('⚠️ DISCORD_BOT_TOKEN no configurado. Funcionalidades de Discord deshabilitadas.');
  }
});
