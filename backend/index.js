
// backend/index.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');
const sgMail = require('@sendgrid/mail');
const { Server } = require('socket.io');
const http = require('http');
const jwt = require('jsonwebtoken');

const authRoutes = require('./auth');
const discordRoutes = require('./routes/discord');
const multiroleRoutes = require('./routes/multirole');
const tinderRoutes = require('./routes/tinder');
const robloxRoutes = require('./routes/roblox');
const adminRecordsRoutes = require('./routes/adminRecords');
const notificationRoutes = require('./routes/notifications');
const logsRoutes = require('./routes/logs');
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
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Cookie', 'Accept', 'Origin'],
  // Configuración adicional para WebSocket
  optionsSuccessStatus: 200
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
app.use('/api/logs', logsRoutes);

// Ruta para página de cookies
app.get('/cookies', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Política de Cookies - SpainRP</title>
      <style>
        body {
          background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
          color: white;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          margin: 0;
          padding: 2rem;
          min-height: 100vh;
        }
        .container {
          max-width: 800px;
          margin: 0 auto;
          text-align: center;
        }
        h1 {
          color: #FFD700;
          margin-bottom: 2rem;
        }
        .redirect-info {
          background: rgba(114, 137, 218, 0.1);
          border: 1px solid rgba(114, 137, 218, 0.3);
          border-radius: 12px;
          padding: 2rem;
          margin: 2rem 0;
        }
        .redirect-link {
          display: inline-block;
          background: linear-gradient(135deg, #7289da, #5865f2);
          color: white;
          text-decoration: none;
          padding: 12px 24px;
          border-radius: 8px;
          font-weight: 600;
          margin-top: 1rem;
          transition: all 0.3s ease;
        }
        .redirect-link:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(114, 137, 218, 0.4);
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>🍪 Política de Cookies</h1>
        <div class="redirect-info">
          <h2>Redirigiendo a la página de cookies...</h2>
          <p>Esta página se ha movido a la aplicación principal. Serás redirigido automáticamente.</p>
          <a href="/cookies" class="redirect-link">Ir a Política de Cookies</a>
        </div>
        <script>
          // Redirigir automáticamente después de 2 segundos
          setTimeout(() => {
            window.location.href = '/cookies';
          }, 2000);
        </script>
      </div>
    </body>
    </html>
  `);
});

// Ruta para notificaciones de cambios de saldo críticos
app.post('/api/admin/notify-balance-change', async (req, res) => {
  try {
    console.log('📧 [NOTIFY] Petición recibida:', req.method, req.url);
    console.log('📧 [NOTIFY] Headers:', req.headers);
    console.log('📧 [NOTIFY] Body recibido:', req.body);
    
    const logData = req.body;
    
    // Validar datos requeridos
    if (!logData.adminId || !logData.targetUserId) {
      console.log('📧 [NOTIFY] ❌ Datos requeridos faltantes:', {
        adminId: logData.adminId,
        targetUserId: logData.targetUserId
      });
      return res.status(400).json({ error: 'Datos requeridos faltantes' });
    }

    // Obtener IP real del cliente
    const clientIP = req.ip || req.connection.remoteAddress || req.socket.remoteAddress || 'Unknown';
    logData.ip = clientIP;

    // Log en consola del servidor
    console.log('\n🚨 ===== NOTIFICACIÓN CRÍTICA - MODIFICACIÓN DE SALDO =====');
    console.log(`👤 Administrador: ${logData.adminUsername} (${logData.adminId})`);
    console.log(`🎯 Usuario objetivo: ${logData.targetUserId}`);
    console.log(`💰 Cambios de saldo:`);
    console.log(`   Efectivo: ${logData.previousCash}€ → ${logData.newCash}€ (${logData.cashChange >= 0 ? '+' : ''}${logData.cashChange}€)`);
    console.log(`   Banco: ${logData.previousBank}€ → ${logData.newBank}€ (${logData.bankChange >= 0 ? '+' : ''}${logData.bankChange}€)`);
    console.log(`🌐 IP: ${logData.ip}`);
    console.log(`🕐 Timestamp: ${logData.timestamp}`);
    console.log(`📱 User Agent: ${logData.userAgent}`);
    console.log('🚨 ========================================================\n');

    // Configurar el transporter de email (forzar reconexión para debugging)
    if (!mailTransporter || true) { // Temporal: forzar reconexión
      try {
        console.log('📧 Configurando transporter de email...');
        console.log('📧 Host:', HARDCODED_SMTP.host);
        console.log('📧 Port:', HARDCODED_SMTP.port);
        console.log('📧 User:', HARDCODED_SMTP.user);
        console.log('📧 Pass length:', HARDCODED_SMTP.pass ? HARDCODED_SMTP.pass.length : 'undefined');
        
        mailTransporter = nodemailer.createTransport({
          host: HARDCODED_SMTP.host,
          port: HARDCODED_SMTP.port,
          secure: false, // true para 465, false para otros puertos
          auth: {
            user: HARDCODED_SMTP.user,
            pass: HARDCODED_SMTP.pass
          },
          tls: {
            rejectUnauthorized: false // Para evitar problemas de certificados
          },
          connectionTimeout: 60000, // 60 segundos
          greetingTimeout: 30000,   // 30 segundos
          socketTimeout: 60000,     // 60 segundos
          pool: true,               // Usar pool de conexiones
          maxConnections: 1,        // Máximo 1 conexión
          maxMessages: 3,           // Máximo 3 mensajes por conexión
          rateDelta: 20000,         // 20 segundos entre reintentos
          rateLimit: 5              // Máximo 5 mensajes por minuto
        });
        
        // Verificar la conexión
        await mailTransporter.verify();
        console.log('📧 ✅ Transporter de email configurado y verificado correctamente');
      } catch (error) {
        console.error('❌ Error configurando transporter de email:', error);
        console.error('❌ Detalles del error:', error.message);
        console.error('❌ Stack trace:', error.stack);
      }
    } else {
      console.log('📧 Transporter de email ya configurado');
    }

    // Estructura del email
    const emailData = {
      from: `"SpainRP Security" <${SENDGRID_CONFIG.fromEmail}>`,
      to: SENDGRID_CONFIG.toEmail, // Tu email
      subject: '🚨 ACCIÓN CRÍTICA - Modificación de Saldo SpainRP',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #ef4444, #dc2626); color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0; font-size: 24px;">🚨 NOTIFICACIÓN CRÍTICA</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px;">Modificación de Saldo de Usuario</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 20px; border: 1px solid #dee2e6;">
            <h2 style="color: #dc2626; margin-top: 0;">📊 Detalles de la Operación</h2>
            
            <div style="background: white; padding: 15px; border-radius: 8px; margin-bottom: 15px; border-left: 4px solid #ef4444;">
              <h3 style="margin-top: 0; color: #374151;">👤 Administrador</h3>
              <p style="margin: 5px 0;"><strong>Usuario:</strong> ${logData.adminUsername}</p>
              <p style="margin: 5px 0;"><strong>ID Discord:</strong> ${logData.adminId}</p>
              <p style="margin: 5px 0;"><strong>IP:</strong> ${logData.ip}</p>
            </div>
            
            <div style="background: white; padding: 15px; border-radius: 8px; margin-bottom: 15px; border-left: 4px solid #3b82f6;">
              <h3 style="margin-top: 0; color: #374151;">🎯 Usuario Afectado</h3>
              <p style="margin: 5px 0;"><strong>ID Discord:</strong> ${logData.targetUserId}</p>
            </div>
            
            <div style="background: white; padding: 15px; border-radius: 8px; margin-bottom: 15px; border-left: 4px solid #10b981;">
              <h3 style="margin-top: 0; color: #374151;">💰 Cambios de Saldo</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;"><strong>Efectivo:</strong></td>
                  <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${logData.previousCash}€ → ${logData.newCash}€</td>
                  <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; color: ${logData.cashChange >= 0 ? '#10b981' : '#ef4444'};">
                    ${logData.cashChange >= 0 ? '+' : ''}${logData.cashChange}€
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px;"><strong>Banco:</strong></td>
                  <td style="padding: 8px;">${logData.previousBank}€ → ${logData.newBank}€</td>
                  <td style="padding: 8px; color: ${logData.bankChange >= 0 ? '#10b981' : '#ef4444'};">
                    ${logData.bankChange >= 0 ? '+' : ''}${logData.bankChange}€
                  </td>
                </tr>
              </table>
            </div>
            
            <div style="background: white; padding: 15px; border-radius: 8px; border-left: 4px solid #f59e0b;">
              <h3 style="margin-top: 0; color: #374151;">🕐 Información Técnica</h3>
              <p style="margin: 5px 0;"><strong>Timestamp:</strong> ${new Date(logData.timestamp).toLocaleString('es-ES')}</p>
              <p style="margin: 5px 0;"><strong>User Agent:</strong> ${logData.userAgent}</p>
              <p style="margin: 5px 0;"><strong>Severidad:</strong> <span style="color: #ef4444; font-weight: bold;">CRÍTICA</span></p>
            </div>
          </div>
          
          <div style="background: #ef4444; color: white; padding: 15px; text-align: center; border-radius: 0 0 10px 10px;">
            <p style="margin: 0; font-weight: bold;">⚠️ Esta acción ha sido registrada y será monitoreada</p>
          </div>
        </div>
      `
    };

    // Enviar email con SendGrid (recomendado para Render)
    let emailSent = false;
    let emailError = null;
    
    // Intentar SendGrid primero
    if (SENDGRID_CONFIG.apiKey && SENDGRID_CONFIG.apiKey !== 'SG.TU_API_KEY_AQUI') {
      console.log('📧 Usando SendGrid para enviar email...');
      const sendGridResult = await sendEmailWithSendGrid(emailData);
      emailSent = sendGridResult.success;
      emailError = sendGridResult.success ? null : sendGridResult.error;
    } 
    // Fallback a Nodemailer si SendGrid no está configurado
    else if (mailTransporter) {
      try {
        console.log('📧 Usando Nodemailer (fallback)...');
        console.log('📧 To:', emailData.to);
        console.log('📧 Subject:', emailData.subject);
        
        const info = await mailTransporter.sendMail(emailData);
        emailSent = true;
        console.log('📧 ✅ Email enviado correctamente con Nodemailer:', {
          messageId: info.messageId,
          to: emailData.to,
          timestamp: new Date().toISOString(),
          response: info.response
        });
      } catch (error) {
        emailError = error.message;
        console.error('📧 ❌ Error enviando email con Nodemailer:', error);
        console.error('📧 ❌ Error code:', error.code);
        console.error('📧 ❌ Error command:', error.command);
        console.error('📧 ❌ Error response:', error.response);
      }
    } 
    // Solo logging si no hay configuración
    else {
      console.log('📧 📝 Solo logging - No hay configuración de email');
      console.log('📧 📝 Email que se enviaría:');
      console.log('📧 📝   To:', emailData.to);
      console.log('📧 📝   Subject:', emailData.subject);
      console.log('📧 📝   From:', emailData.from);
      console.log('📧 📝   Timestamp:', new Date().toISOString());
      
      // Guardar en archivo de log
      try {
        const logEntry = {
          timestamp: new Date().toISOString(),
          type: 'BALANCE_CHANGE_NOTIFICATION',
          data: {
            admin: logData.adminUsername,
            target: logData.targetUserId,
            changes: {
              cash: `${logData.previousCash}€ → ${logData.newCash}€ (${logData.cashChange >= 0 ? '+' : ''}${logData.cashChange}€)`,
              bank: `${logData.previousBank}€ → ${logData.newBank}€ (${logData.bankChange >= 0 ? '+' : ''}${logData.bankChange}€)`
            },
            ip: logData.ip,
            userAgent: logData.userAgent
          }
        };
        
        const logFile = path.join(__dirname, 'logs', 'balance-notifications.log');
        fs.appendFileSync(logFile, JSON.stringify(logEntry) + '\n');
        console.log('📧 📝 Notificación guardada en log:', logFile);
      } catch (logError) {
        console.warn('📧 ⚠️ Error guardando en log:', logError.message);
      }
      
      emailSent = true; // Marcar como "enviado" para el frontend
      emailError = null;
    }

    res.json({ 
      success: true, 
      message: emailSent ? 'Notificación registrada y email enviado correctamente' : 'Notificación registrada pero email falló',
      logged: true,
      emailSent: emailSent,
      emailError: emailError,
      debug: {
        transporterConfigured: !!mailTransporter,
        emailTo: emailData.to,
        emailSubject: emailData.subject
      }
    });

  } catch (error) {
    console.error('❌ Error en notificación de balance:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// --- SOCKET.IO para notificaciones en tiempo real ---
const server = http.createServer(app);

// Configurar Socket.IO - POLLING Y WEBSOCKET
const io = new Server(server, {
  cors: {
    origin: [
      'https://spainrp-oficial.onrender.com', 
      'https://spainrp-web.onrender.com',
      'http://127.0.0.1:5173',
      process.env.PUBLIC_BASE_URL || 'https://spainrp-oficial.onrender.com'
    ].filter(Boolean),
    credentials: true,
    methods: ['GET', 'POST']
  },
  transports: ['polling', 'websocket'], // POLLING Y WEBSOCKET
  allowEIO3: true,
  pingTimeout: 60000,
  pingInterval: 25000,
  allowUpgrades: true,
  upgrade: true,
  serveClient: false,
  connectTimeout: 45000
});

// Permitir upgrade a WebSocket
io.engine.on('upgrade', (req, socket, head) => {
  console.log('[SOCKET.IO] ✅ Upgrade a WebSocket permitido');
});

// Manejar errores de Socket.IO
io.engine.on('connection_error', (err) => {
  console.error('[SOCKET.IO] Error de conexión:', err.message);
  console.error('[SOCKET.IO] Código:', err.code);
  console.error('[SOCKET.IO] Context:', err.context);
  
  // Si es un error de WebSocket, ignorarlo
  if (err.context && err.context.transport === 'websocket') {
    console.log('[SOCKET.IO] Ignorando error de WebSocket (solo polling permitido)');
    return;
  }
});

// Manejar conexiones WebSocket - CONSOLIDADO
io.on('connection', (socket) => {
  console.log('[SOCKET.IO] Usuario conectado:', socket.id);
  
  // Unirse a la sala de notificaciones
  socket.join('notifications');
  
  // Emitir estado de mantenimiento
  socket.emit('maintenance', { maintenance: fs.existsSync(MAINTENANCE_FILE) });
  
  // =============================================================================
  // SISTEMA DE CHAT EN VIVO
  // =============================================================================
  
  // Manejar inicio de chat
  socket.on('start_chat', async (data) => {
    try {
      const { userId, userName } = data;
      console.log('[CHAT] Iniciando chat para:', userName, userId);
      
      // Verificar si el usuario ya tiene un chat activo
      if (userChats.has(userId)) {
        const existingChat = userChats.get(userId);
        socket.emit('chat_started', { 
          chatId: existingChat.chatId, 
          message: 'Chat ya activo' 
        });
        return;
      }
      
      // Crear nuevo chat
      const chatId = createLiveChat(userId, userName);
      userChats.set(userId, { 
        chatId, 
        socketId: socket.id, 
        userName, 
        status: 'active' 
      });
      
      // Notificar a moderadores
      for (const [modId, modData] of moderatorsOnline.entries()) {
        io.to(modData.socket_id).emit('new_chat', {
          chatId,
          userId,
          userName,
          timestamp: new Date().toISOString()
        });
      }
      
      socket.emit('chat_started', { chatId });
      console.log('[CHAT] Chat iniciado:', chatId, 'para', userName);
      
    } catch (error) {
      console.error('[CHAT] Error iniciando chat:', error);
      socket.emit('chat_error', { message: 'Error iniciando chat' });
    }
  });
  
  // Manejar mensajes del chat
  socket.on('chat_message', async (data) => {
    try {
      const { chatId, message, senderType, senderId, senderName } = data;
      console.log('[CHAT] Mensaje recibido:', { chatId, senderName, message: message.substring(0, 50) });
      
      // Guardar mensaje en base de datos
      await addChatMessage(chatId, senderType, senderId, senderName, message);
      
      // Enviar a moderadores
      for (const [modId, modData] of moderatorsOnline.entries()) {
        io.to(modData.socket_id).emit('chat_message', {
          chatId,
          message,
          senderType,
          senderId,
          senderName,
          timestamp: new Date().toISOString()
        });
      }
      
      // Confirmar al usuario
      socket.emit('message_sent', { chatId, messageId: Date.now() });
      
    } catch (error) {
      console.error('[CHAT] Error enviando mensaje:', error);
      socket.emit('chat_error', { message: 'Error enviando mensaje' });
    }
  });
  
  // Manejar cierre de chat
  socket.on('close_chat', async (data) => {
    try {
      const { chatId } = data;
      console.log('[CHAT] Cerrando chat:', chatId);
      
      // Cerrar en base de datos
      await closeLiveChat(chatId);
      
      // Remover de chats activos
      for (const [userId, chatData] of userChats.entries()) {
        if (chatData.chatId === chatId) {
          userChats.delete(userId);
          break;
        }
      }
      
      // Notificar a moderadores
      for (const [modId, modData] of moderatorsOnline.entries()) {
        io.to(modData.socket_id).emit('chat_closed', { chatId });
      }
      
      socket.emit('chat_closed', { chatId });
      
    } catch (error) {
      console.error('[CHAT] Error cerrando chat:', error);
    }
  });
  
  // Manejar moderadores
  socket.on('moderator_join', async (data) => {
    try {
      const { userId, userName } = data;
      console.log('[CHAT] Moderador conectándose:', userName, userId);
      
      // Verificar si es moderador
      const isMod = await isModerator(userId);
      if (!isMod) {
        socket.emit('moderator_error', { message: 'No tienes permisos de moderador' });
        return;
      }
      
      // Agregar a moderadores online
      moderatorsOnline.set(userId, {
        socket_id: socket.id,
        user_name: userName,
        last_seen: new Date().toISOString()
      });
      
      // Unirse a sala de moderadores
      socket.join('moderators');
      
      // Enviar chats activos
      const activeChatsList = Array.from(userChats.entries()).map(([uid, chatData]) => ({
        chatId: chatData.chatId,
        userId: uid,
        userName: chatData.userName,
        status: chatData.status
      }));
      
      socket.emit('moderator_joined', { 
        message: 'Conectado como moderador',
        activeChats: activeChatsList
      });
      
      console.log('[CHAT] Moderador conectado:', userName);
      
    } catch (error) {
      console.error('[CHAT] Error conectando moderador:', error);
      socket.emit('moderator_error', { message: 'Error conectando como moderador' });
    }
  });
  
  // Manejar solicitud de historial de chat
  socket.on('get_chat_history', async (data) => {
    try {
      const { chatId } = data;
      const messages = await getChatMessages(chatId);
      socket.emit('chat_history', { chatId, messages });
    } catch (error) {
      console.error('[CHAT] Error obteniendo historial:', error);
      socket.emit('chat_error', { message: 'Error obteniendo historial' });
    }
  });
  
  socket.on('disconnect', () => {
    console.log('[SOCKET.IO] Usuario desconectado:', socket.id);
    
    // Remover de moderadores online si estaba conectado
    for (const [userId, data] of moderatorsOnline.entries()) {
      if (data.socket_id === socket.id) {
        moderatorsOnline.delete(userId);
        console.log('[CHAT] Moderador desconectado:', data.user_name);
        break;
      }
    }
    
    // Remover de chats activos si estaba conectado
    for (const [userId, chatData] of userChats.entries()) {
      if (chatData.socketId === socket.id) {
        userChats.delete(userId);
        console.log('[CHAT] Chat cerrado por desconexión:', chatData.chatId);
        break;
      }
    }
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

// =============================================================================
// SISTEMA DE CHAT EN VIVO - SOCKET.IO
// =============================================================================

// Almacenar chats activos y moderadores online
const activeChats = new Map(); // chatId -> { user_id, user_name, socket_id, status }
const moderatorsOnline = new Map(); // user_id -> { socket_id, user_name, last_seen }
const userChats = new Map(); // user_id -> chatId

// Funciones de base de datos para chat
function createLiveChat(userId, userName) {
  return new Promise((resolve, reject) => {
    const sql = `INSERT INTO live_chats (user_id, user_name, status) VALUES (?, ?, 'active')`;
    db.run(sql, [userId, userName], function(err) {
      if (err) {
        console.error('[CHAT] Error creando chat:', err);
        reject(err);
      } else {
        console.log('[CHAT] Chat creado con ID:', this.lastID);
        resolve(this.lastID);
      }
    });
  });
}

function addChatMessage(chatId, senderType, senderId, senderName, message) {
  return new Promise((resolve, reject) => {
    const sql = `INSERT INTO chat_messages (chat_id, sender_type, sender_id, sender_name, message) VALUES (?, ?, ?, ?, ?)`;
    db.run(sql, [chatId, senderType, senderId, senderName, message], function(err) {
      if (err) {
        console.error('[CHAT] Error agregando mensaje:', err);
        reject(err);
      } else {
        resolve(this.lastID);
      }
    });
  });
}

function getChatMessages(chatId) {
  return new Promise((resolve, reject) => {
    const sql = `SELECT * FROM chat_messages WHERE chat_id = ? ORDER BY created_at ASC`;
    db.all(sql, [chatId], (err, rows) => {
      if (err) {
        console.error('[CHAT] Error obteniendo mensajes:', err);
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

function closeLiveChat(chatId) {
  return new Promise((resolve, reject) => {
    const sql = `UPDATE live_chats SET status = 'closed', closed_at = CURRENT_TIMESTAMP WHERE id = ?`;
    db.run(sql, [chatId], function(err) {
      if (err) {
        console.error('[CHAT] Error cerrando chat:', err);
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

function isModerator(userId) {
  return new Promise((resolve, reject) => {
    const guildId = process.env.DISCORD_GUILD_ID || '1212556680911650866';
    const moderatorRoleId = '1384340649205301359'; // ID del rol de moderador
    
    console.log(`[CHAT][isModerator] Verificando moderador: ${userId} en servidor: ${guildId}`);
    
    if (!global.discordClient || !global.discordClient.readyAt) {
      console.warn('[CHAT][isModerator] Bot de Discord no disponible o no conectado');
      resolve(false);
      return;
    }

    const guild = global.discordClient.guilds.cache.get(guildId);
    if (!guild) {
      console.error(`[CHAT][isModerator] Servidor Discord no encontrado: ${guildId}`);
      resolve(false);
      return;
    }

    console.log(`[CHAT][isModerator] Servidor encontrado: ${guild.name} (${guild.id})`);

    guild.members.fetch(userId).then(member => {
      console.log(`[CHAT][isModerator] Miembro encontrado: ${member.user.username} (${member.id})`);
      
      // Verificar si tiene el rol de moderador específico
      const hasModeratorRole = member.roles.cache.has(moderatorRoleId);
      console.log(`[CHAT][isModerator] Tiene rol moderador (${moderatorRoleId}): ${hasModeratorRole}`);
      
      // Verificar si tiene permisos de administrador
      const hasAdminPerms = member.permissions.has(PermissionsBitField.Flags.Administrator);
      console.log(`[CHAT][isModerator] Tiene permisos admin: ${hasAdminPerms}`);
      
      // Listar todos los roles del usuario para debug
      const userRoles = member.roles.cache.map(role => `${role.name} (${role.id})`);
      console.log(`[CHAT][isModerator] Roles del usuario: [${userRoles.join(', ')}]`);
      
      const isMod = hasModeratorRole || hasAdminPerms;
      console.log(`[CHAT][isModerator] Resultado final: ${isMod ? 'ES MODERADOR' : 'NO ES MODERADOR'}`);
      
      resolve(isMod);
    }).catch(err => {
      console.error(`[CHAT][isModerator] Error obteniendo miembro ${userId}:`, err.message);
      console.error(`[CHAT][isModerator] Stack trace:`, err.stack);
      resolve(false);
    });
  });
}

// =============================================================================
// SISTEMA DE CHAT EN VIVO - CONSOLIDADO EN io.on('connection') ARRIBA
// =============================================================================

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

// --- Configuración de Email ---
let mailTransporter = null;

// Configuración SendGrid (recomendado para Render)
const SENDGRID_CONFIG = {
  apiKey: process.env.SENDGRID_API_KEY || 'SG.TU_API_KEY_AQUI', // <- Configurar en Render como variable de entorno
  fromEmail: 'spainrpoficial@proton.me', // <- Email verificado en SendGrid
  toEmail: 'spainrpoficial@proton.me'    // <- Email de destino
};

// Configuración SMTP (fallback)
const HARDCODED_SMTP = {
  host: 'smtp.gmail.com',
  port: 587,
  user: 'bijjou433@gmail.com',
  pass: 'owps bpyt fvpp jstf'
};

// Configurar SendGrid
console.log('📧 [SENDGRID] Verificando configuración...');
console.log('📧 [SENDGRID] API Key from env:', process.env.SENDGRID_API_KEY ? 'SET' : 'NOT SET');
console.log('📧 [SENDGRID] API Key length:', process.env.SENDGRID_API_KEY ? process.env.SENDGRID_API_KEY.length : 0);
console.log('📧 [SENDGRID] Fallback API Key:', SENDGRID_CONFIG.apiKey);

if (SENDGRID_CONFIG.apiKey && SENDGRID_CONFIG.apiKey !== 'SG.TU_API_KEY_AQUI') {
  sgMail.setApiKey(SENDGRID_CONFIG.apiKey);
  console.log('📧 ✅ SendGrid configurado correctamente');
  console.log('📧 ✅ From Email:', SENDGRID_CONFIG.fromEmail);
  console.log('📧 ✅ To Email:', SENDGRID_CONFIG.toEmail);
} else {
  console.log('📧 ⚠️ SendGrid no configurado - usando solo logging');
  console.log('📧 ⚠️ Para configurar SendGrid:');
  console.log('📧 ⚠️ 1. Ve a Render Dashboard → Environment Variables');
  console.log('📧 ⚠️ 2. Agrega SENDGRID_API_KEY = SG.Lsw3MHfQS9K0n1VqcfJSDg...');
  console.log('📧 ⚠️ 3. Redeploy el servicio');
}

// Función para enviar email con SendGrid
async function sendEmailWithSendGrid(emailData) {
  try {
    const msg = {
      to: SENDGRID_CONFIG.toEmail,
      from: SENDGRID_CONFIG.fromEmail,
      subject: emailData.subject,
      html: emailData.html,
    };

    console.log('📧 [SENDGRID] Enviando email...');
    console.log('📧 [SENDGRID] To:', msg.to);
    console.log('📧 [SENDGRID] Subject:', msg.subject);

    const response = await sgMail.send(msg);
    console.log('📧 [SENDGRID] ✅ Email enviado correctamente:', {
      statusCode: response[0].statusCode,
      messageId: response[0].headers['x-message-id'],
      timestamp: new Date().toISOString()
    });

    return { success: true, response };
  } catch (error) {
    console.error('📧 [SENDGRID] ❌ Error enviando email:', error);
    console.error('📧 [SENDGRID] ❌ Error code:', error.code);
    console.error('📧 [SENDGRID] ❌ Error message:', error.message);
    return { success: false, error: error.message };
  }
}
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

// Estado de mantenimiento ya emitido en el io.on('connection') principal

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
    // Permitir acceso a rutas críticas para administradores durante mantenimiento
    if (
      req.path === '/admin/maintenance-off' ||
      req.path.startsWith('/api/maintenance') ||
      req.path.startsWith('/socket.io') ||
      req.path.startsWith('/api/auth/') ||  // Rutas de autenticación JWT
      req.path.startsWith('/api/notifications') ||  // Notificaciones
      req.path.startsWith('/api/widget') ||  // Widget de Discord
      req.path.startsWith('/api/membercount')  // Contador de miembros
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
// Proxy para banear usuario (redirige al endpoint local)
app.post('/api/proxy/discord/ban', express.json(), async (req, res) => {
  try {
    const response = await fetch(`${process.env.BOT_API_URL || 'https://spainrp-web.onrender.com/'}/api/discord/ban`, {
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

// SQLite connection centralizada
const { getDatabase } = require('./db/database');
const db = getDatabase();

// Migración: agregar columna 'images' si no existe
db.get("PRAGMA table_info(announcements)", (err, columns) => {
  if (!err && Array.isArray(columns) && !columns.some(col => col.name === 'images')) {
    db.run("ALTER TABLE announcements ADD COLUMN images TEXT", (err2) => {
      if (err2) console.error('[DB MIGRATION] Error añadiendo columna images:', err2.message);
      else console.log('[DB MIGRATION] Columna images añadida a announcements');
    });
  }
});

// Tabla de bans (específica para este módulo)
db.run(`CREATE TABLE IF NOT EXISTS bans (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ip TEXT,
  userId TEXT,
  reason TEXT,
  createdAt TEXT
)`, (err) => {
  if (err) {
    console.error('[DB] Error creando tabla bans:', err);
  } else {
    console.log('[DB] Tabla bans creada/verificada correctamente');
  }
});
// Las tablas principales se inicializan automáticamente en database.js
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
  const timestamp = req.query.t ? parseInt(req.query.t) : null;
  
  console.log(`[DNI PROXY] ===== INICIO DNI EXPORT =====`);
  console.log(`[DNI PROXY] ${req.method} request para DiscordID: ${discordId}`);
  console.log(`[DNI PROXY] URL del bot: ${DNI_BOT_URL}/api/bolsa/dni/${discordId}/exportar`);
  console.log(`[DNI PROXY] Timestamp: ${new Date().toISOString()}`);
  
  // Importar cache de DNI
  const { getCachedDNI, cacheDNI } = require('./utils/dniCache');
  
  try {
    // Verificar cache primero (solo para GET requests)
    if (!isHeadRequest) {
      const cached = getCachedDNI(discordId, timestamp);
      if (cached.found) {
        console.log(`[DNI PROXY] Usando DNI del cache para ${discordId}`);
        res.set('Content-Type', 'image/png');
        res.set('Content-Length', cached.buffer.length);
        res.set('Cache-Control', 'public, max-age=3600'); // Cache por 1 hora
        res.set('X-Cache', 'HIT');
        return res.send(cached.buffer);
      }
    }
    
    const fetchDNI = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
    
    // Añadir timeout y headers
    const response = await fetchDNI(`${DNI_BOT_URL}/api/bolsa/dni/${encodeURIComponent(discordId)}/exportar`, {
      method: req.method,
      timeout: 10000, // 10 segundos timeout
      headers: {
        'User-Agent': 'SpainRP-Web/1.0',
        'Accept': 'image/png,image/*,*/*'
      }
    });
    
    console.log(`[DNI PROXY] Respuesta del bot: ${response.status} ${response.statusText}`);
    console.log(`[DNI PROXY] Content-Type: ${response.headers.get('content-type')}`);
    console.log(`[DNI PROXY] Content-Length: ${response.headers.get('content-length')}`);
    
    if (!response.ok) {
      console.error(`[DNI PROXY] Bot respondió con error: ${response.status}`);
      
      // Intentar obtener el mensaje de error del bot
      try {
        const errorText = await response.text();
        console.error(`[DNI PROXY] Error del bot: ${errorText}`);
      } catch (e) {
        console.error(`[DNI PROXY] No se pudo leer el error del bot`);
      }
      
      return res.status(response.status).json({ 
        error: 'No existe ese DNI o error en el bot externo',
        status: response.status,
        discordId: discordId
      });
    }
    
    // Para HEAD, solo enviar headers
    if (isHeadRequest) {
      console.log(`[DNI PROXY] Enviando headers para HEAD request`);
    res.set('Content-Type', response.headers.get('content-type') || 'image/png');
      res.set('Content-Length', response.headers.get('content-length') || '0');
      res.set('Cache-Control', 'public, max-age=3600');
      res.set('X-Cache', 'MISS');
      return res.status(200).end();
    }
    
    // Para GET, enviar la imagen completa
    console.log(`[DNI PROXY] Obteniendo buffer de imagen...`);
    const buffer = await response.buffer();
    const contentType = response.headers.get('content-type') || 'image/png';
    
    console.log(`[DNI PROXY] Imagen recibida (${buffer.length} bytes) para ${discordId}`);
    console.log(`[DNI PROXY] Content-Type final: ${contentType}`);
    
    // Guardar en cache (asíncrono, no bloquear respuesta)
    cacheDNI(discordId, buffer, timestamp).then(result => {
      if (result.success) {
        console.log(`[DNI PROXY] DNI cacheado exitosamente: ${result.size} bytes`);
      }
    }).catch(err => {
      console.error(`[DNI PROXY] Error cacheando DNI:`, err);
    });
    
    res.set('Content-Type', contentType);
    res.set('Content-Length', buffer.length);
    res.set('Cache-Control', 'public, max-age=3600'); // Cache por 1 hora
    res.set('X-Cache', 'MISS');
    res.send(buffer);
    
    console.log(`[DNI PROXY] Exportación exitosa para ${discordId}`);
    console.log(`[DNI PROXY] ===== FIN DNI EXPORT =====`);
  } catch (e) {
    console.error(`[DNI PROXY] Error de conexión:`, e.message);
    console.error(`[DNI PROXY] Stack trace:`, e.stack);
    console.log(`[DNI PROXY] ===== FIN DNI EXPORT (ERROR) =====`);
    res.status(502).json({ 
      error: 'Error conectando con el bot de DNI', 
      details: e.message,
      discordId: discordId,
      botUrl: DNI_BOT_URL
    });
  }
};

app.get('/api/proxy/dni/:discordId/exportar', handleDNIExport);
app.head('/api/proxy/dni/:discordId/exportar', handleDNIExport);

// Endpoint de prueba para verificar conectividad con el bot de DNI
app.get('/api/proxy/dni/test/:discordId', async (req, res) => {
  const { discordId } = req.params;
  const DNI_BOT_URL = process.env.DNI_BOT_URL || 'http://37.27.21.91:5021';
  
  console.log(`[DNI TEST] Probando conectividad con bot para DiscordID: ${discordId}`);
  console.log(`[DNI TEST] URL del bot: ${DNI_BOT_URL}/api/bolsa/dni/${discordId}/exportar`);
  
  try {
    const fetchDNI = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
    
    const response = await fetchDNI(`${DNI_BOT_URL}/api/bolsa/dni/${encodeURIComponent(discordId)}/exportar`, {
      method: 'HEAD',
      timeout: 5000,
      headers: {
        'User-Agent': 'SpainRP-Web/1.0',
        'Accept': 'image/png,image/*,*/*'
      }
    });
    
    console.log(`[DNI TEST] Respuesta del bot: ${response.status} ${response.statusText}`);
    
    res.json({
      success: response.ok,
      status: response.status,
      statusText: response.statusText,
      contentType: response.headers.get('content-type'),
      contentLength: response.headers.get('content-length'),
      discordId: discordId,
      botUrl: DNI_BOT_URL,
      timestamp: new Date().toISOString()
    });
  } catch (e) {
    console.error(`[DNI TEST] Error de conexión:`, e.message);
    res.status(502).json({
      success: false,
      error: e.message,
      discordId: discordId,
      botUrl: DNI_BOT_URL,
      timestamp: new Date().toISOString()
    });
  }
});

// Endpoint para estadísticas del cache de DNI
app.get('/api/proxy/dni/cache/stats', (req, res) => {
  try {
    const { getCacheStats, cleanExpiredCache } = require('./utils/dniCache');
    
    const stats = getCacheStats();
    const cleaned = cleanExpiredCache();
    
    res.json({
      success: true,
      cache: stats,
      cleanedFiles: cleaned,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('[DNI CACHE STATS] Error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Endpoint para crear un DNI de prueba (solo para desarrollo)
app.get('/api/proxy/dni/demo/:discordId', async (req, res) => {
  const { discordId } = req.params;
  
  console.log(`[DNI DEMO] Generando DNI de demostración para DiscordID: ${discordId}`);
  
  try {
    // Crear un DNI de demostración simple
    const canvas = require('canvas');
    const { createCanvas } = canvas;
    
    const canvasWidth = 700;
    const canvasHeight = 420;
    const canvasElement = createCanvas(canvasWidth, canvasHeight);
    const ctx = canvasElement.getContext('2d');
    
    // Fondo
    ctx.fillStyle = '#cbe6f7';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    
    // Marco blanco
    ctx.fillStyle = '#fff';
    ctx.fillRect(20, 20, canvasWidth - 40, canvasHeight - 40);
    
    // Borde
    ctx.strokeStyle = '#bdbdbd';
    ctx.lineWidth = 2;
    ctx.strokeRect(40, 60, canvasWidth - 80, canvasHeight - 120);
    
    // Fondo interior
    ctx.fillStyle = '#fbe3c2';
    ctx.fillRect(41, 61, canvasWidth - 82, canvasHeight - 122);
    
    // Título
    ctx.font = 'bold 26px Arial';
    ctx.fillStyle = '#3a3a3a';
    ctx.textAlign = 'center';
    ctx.fillText('DOCUMENTO NACIONAL DE IDENTIDAD', canvasWidth / 2, 50);
    
    // Texto de demostración
    ctx.font = 'bold 18px Arial';
    ctx.fillStyle = '#1a237e';
    ctx.textAlign = 'left';
    ctx.fillText('REINO DE ESPAÑA', 105, 90);
    
    // Campos de demostración
    ctx.font = 'bold 14px Arial';
    ctx.fillStyle = '#222';
    ctx.textAlign = 'left';
    
    const campos = [
      { label: 'DNI:', value: '12345678A', x: 170, y: 130 },
      { label: 'APELLIDOS:', value: 'GARCIA LOPEZ', x: 170, y: 155 },
      { label: 'NOMBRE:', value: 'JUAN CARLOS', x: 170, y: 180 },
      { label: 'SEXO:', value: 'H', x: 170, y: 205 },
      { label: 'NACIONALIDAD:', value: 'ESPAÑOLA', x: 170, y: 230 },
      { label: 'NACIMIENTO:', value: '01/01/1990', x: 170, y: 255 },
      { label: 'ALTURA:', value: '175 cm', x: 170, y: 280 },
      { label: 'TRABAJO:', value: 'DESARROLLADOR', x: 400, y: 130 },
      { label: 'COLOR PELO:', value: 'CASTANO', x: 400, y: 155 },
      { label: 'DIRECCIÓN:', value: 'C/ MAYOR 123, MADRID', x: 400, y: 180 },
      { label: 'ROBLOX:', value: 'UsuarioRoblox', x: 400, y: 205 },
      { label: 'EMISIÓN:', value: new Date().toLocaleDateString(), x: 400, y: 230 },
      { label: 'CADUCIDAD:', value: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toLocaleDateString(), x: 400, y: 255 }
    ];
    
    campos.forEach(campo => {
      ctx.font = 'bold 14px Arial';
      ctx.fillText(campo.label, campo.x, campo.y);
      ctx.font = '14px Arial';
      ctx.fillText(campo.value, campo.x + 100, campo.y);
    });
    
    // Firma digital
    ctx.font = 'italic 15px Arial';
    ctx.fillStyle = '#222';
    ctx.fillText('Firma: JUAN CARLOS GARCIA LOPEZ', 400, 310);
    
    // Pie de página
    ctx.font = '12px Arial';
    ctx.fillStyle = '#888';
    ctx.textAlign = 'center';
    ctx.fillText('DOCUMENTO NACIONAL DE IDENTIDAD - DEMOSTRACIÓN', canvasWidth / 2, 410);
    
    // Convertir a buffer
    const buffer = canvasElement.toBuffer('image/png');
    
    console.log(`[DNI DEMO] DNI de demostración generado (${buffer.length} bytes) para ${discordId}`);
    
    res.set('Content-Type', 'image/png');
    res.set('Content-Length', buffer.length);
    res.send(buffer);
    
  } catch (e) {
    console.error(`[DNI DEMO] Error generando DNI de demostración:`, e.message);
    res.status(500).json({
      error: 'Error generando DNI de demostración',
      details: e.message,
      discordId: discordId
    });
  }
});

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
    
    // Usar cache directamente para evitar timeout en servidores grandes
    let member = guild.members.cache.get(userId);
    if (!member) {
      // Solo hacer fetch si no está en cache
      try {
        await guild.members.fetch(userId);
        member = guild.members.cache.get(userId);
      } catch (fetchError) {
        console.warn(`[DISCORD PROXY] ⚠️ No se pudo hacer fetch del usuario ${userId}:`, fetchError.message);
      }
    }
    
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
    
    // Usar cache directamente para evitar timeout en servidores grandes
    let member = guild.members.cache.get(userId);
    if (!member) {
      // Solo hacer fetch si no está en cache
      try {
        await guild.members.fetch(userId);
        member = guild.members.cache.get(userId);
      } catch (fetchError) {
        console.warn(`[ADMIN PROXY] ⚠️ No se pudo hacer fetch del usuario ${userId}:`, fetchError.message);
      }
    }
    
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
// ===== SISTEMA DE BANS =====
// Función para obtener IP real
function getRealIP(req) {
  return req.headers['cf-connecting-ip'] || 
         req.headers['x-forwarded-for']?.split(',')[0]?.trim() || 
         req.headers['x-real-ip'] || 
         req.connection?.remoteAddress || 
         req.socket?.remoteAddress || 
         req.ip || 
         '127.0.0.1';
}

// Función para verificar si una IP está baneada
async function isIPBanned(ip) {
  try {
    const { getQuery } = require('./db/database');
    const ban = await getQuery(
      'SELECT * FROM web_bans WHERE type = ? AND value = ? AND isActive = 1 AND (expiresAt IS NULL OR expiresAt > ?)',
      ['ip', ip, new Date().toISOString()]
    );
    return ban || null;
  } catch (error) {
    console.error('[BAN SYSTEM] Error checking IP ban:', error);
    return null;
  }
}

// Función para verificar si un usuario de Discord está baneado
async function isDiscordUserBanned(userId) {
  try {
    const { getQuery } = require('./db/database');
    const ban = await getQuery(
      'SELECT * FROM web_bans WHERE type = ? AND value = ? AND isActive = 1 AND (expiresAt IS NULL OR expiresAt > ?)',
      ['discord', userId, new Date().toISOString()]
    );
    return ban || null;
  } catch (error) {
    console.error('[BAN SYSTEM] Error checking Discord ban:', error);
    return null;
  }
}

// Función para limpiar bans expirados
async function cleanupExpiredBans() {
  try {
    const { runQuery } = require('./db/database');
    const now = new Date().toISOString();
    
    const result = await runQuery(
      'UPDATE web_bans SET isActive = 0 WHERE isActive = 1 AND expiresAt IS NOT NULL AND expiresAt <= ?',
      [now]
    );
    
    if (result.changes > 0) {
      console.log(`[BAN CLEANUP] ${result.changes} bans expirados desactivados`);
    }
  } catch (error) {
    console.error('[BAN CLEANUP] Error limpiando bans expirados:', error);
  }
}

// Función para enviar mensaje DM sobre unban
async function sendUnbanNotification(userId, banType, unbannedBy) {
  try {
    if (!discordClient || !discordClient.readyAt) {
      console.warn('[UNBAN DM] Bot de Discord no disponible para enviar notificación');
      return false;
    }

    // Obtener información del usuario
    const user = await discordClient.users.fetch(userId).catch(err => {
      console.error('[UNBAN DM] Error obteniendo usuario:', err.message);
      return null;
    });

    if (!user) {
      console.warn(`[UNBAN DM] Usuario ${userId} no encontrado`);
      return false;
    }

    // Crear embed del mensaje
    const embed = {
      color: 0x2ecc71, // Verde
      title: '✅ Has sido desbaneado de SpainRP Web',
      description: `Tu acceso al sitio web de SpainRP ha sido restaurado completamente.`,
      fields: [
        {
          name: '📋 Tipo de Ban Removido',
          value: banType === 'ip' ? '🌐 Dirección IP' : '👤 Usuario de Discord',
          inline: true
        },
        {
          name: '👮 Desbaneado por',
          value: `<@${unbannedBy}>`,
          inline: true
        },
        {
          name: '⏰ Fecha de Restauración',
          value: `<t:${Math.floor(Date.now() / 1000)}:F>\n<t:${Math.floor(Date.now() / 1000)}:R>`,
          inline: true
        }
      ],
      footer: {
        text: 'SpainRP - Sistema de Moderación Web',
        icon_url: 'https://cdn.discordapp.com/icons/1212556680911650866/a_1234567890abcdef1234567890abcdef.webp'
      },
      timestamp: new Date().toISOString(),
      thumbnail: {
        url: 'https://cdn.discordapp.com/icons/1212556680911650866/a_1234567890abcdef1234567890abcdef.webp'
      }
    };

    // Agregar información de bienvenida
    embed.fields.push({
      name: '🎉 ¡Bienvenido de vuelta!',
      value: 'Ya puedes acceder nuevamente al sitio web. Esperamos que tengas una mejor experiencia esta vez.\n\n**📋 Recuerda:**\n• Cumple con las normas y términos de uso\n• Respeta a otros usuarios y el staff\n• Disfruta de tu experiencia en SpainRP',
      inline: false
    });

    // Agregar información de contacto
    embed.fields.push({
      name: '📞 Soporte y Ayuda',
      value: `Si necesitas ayuda o tienes preguntas:\n\n**👑 BijjouPro08** (<@710112055985963090>)\n**📧 Email:** spainrpoficial@proton.me`,
      inline: false
    });

    // Crear componentes de interacción (botones)
    const components = [
      {
        type: 1, // ACTION_ROW
        components: [
          {
            type: 2, // BUTTON
            style: 5, // LINK
            label: '🌐 Acceder al Sitio Web',
            url: 'https://spainrp-web.onrender.com',
            emoji: {
              name: '🚀'
            }
          },
          {
            type: 2, // BUTTON
            style: 5, // LINK
            label: '📞 Contactar Soporte',
            url: 'https://discord.com/users/710112055985963090',
            emoji: {
              name: '💬'
            }
          }
        ]
      }
    ];

    // Enviar mensaje DM con embed y botones
    await user.send({ 
      embeds: [embed],
      components: components
    });
    
    console.log(`[UNBAN DM] ✅ Notificación de unban enviada a ${user.tag} (${userId})`);
    return true;
  } catch (error) {
    console.error('[UNBAN DM] Error enviando notificación:', error);
    return false;
  }
}

// Función para enviar mensaje DM sobre baneo
async function sendBanNotification(userId, banType, reason, expiresAt, bannedBy) {
  try {
    if (!discordClient || !discordClient.readyAt) {
      console.warn('[BAN DM] Bot de Discord no disponible para enviar notificación');
      return false;
    }

    // Obtener información del usuario
    const user = await discordClient.users.fetch(userId).catch(err => {
      console.error('[BAN DM] Error obteniendo usuario:', err.message);
      return null;
    });

    if (!user) {
      console.warn(`[BAN DM] Usuario ${userId} no encontrado`);
      return false;
    }

    // Crear embed del mensaje
    const embed = {
      color: 0xe74c3c, // Rojo
      title: '🚫 Has sido baneado de SpainRP Web',
      description: `Tu acceso al sitio web de SpainRP ha sido restringido temporalmente.`,
      fields: [
        {
          name: '📋 Tipo de Ban',
          value: banType === 'ip' ? '🌐 Dirección IP' : '👤 Usuario de Discord',
          inline: true
        },
        {
          name: '📝 Motivo',
          value: reason || 'No especificado',
          inline: true
        },
        {
          name: '👮 Baneado por',
          value: `<@${bannedBy}>`,
          inline: true
        }
      ],
      footer: {
        text: 'SpainRP - Sistema de Moderación Web',
        icon_url: 'https://cdn.discordapp.com/icons/1212556680911650866/a_1234567890abcdef1234567890abcdef.webp'
      },
      timestamp: new Date().toISOString(),
      thumbnail: {
        url: 'https://cdn.discordapp.com/icons/1212556680911650866/a_1234567890abcdef1234567890abcdef.webp'
      }
    };

    // Agregar información de expiración si aplica
    if (expiresAt) {
      const expirationDate = new Date(expiresAt);
      const timeLeft = Math.max(0, expirationDate.getTime() - Date.now());
      const daysLeft = Math.ceil(timeLeft / (1000 * 60 * 60 * 24));
      
      embed.fields.push({
        name: '⏰ Expira',
        value: `<t:${Math.floor(expirationDate.getTime() / 1000)}:F>\n<t:${Math.floor(expirationDate.getTime() / 1000)}:R>`,
        inline: true
      });
      
      embed.fields.push({
        name: '📅 Tiempo Restante',
        value: `${daysLeft} día${daysLeft !== 1 ? 's' : ''}`,
        inline: true
      });
    } else {
      embed.fields.push({
        name: '⏰ Duración',
        value: 'Permanente',
        inline: true
      });
      
      embed.fields.push({
        name: '📅 Tiempo Restante',
        value: 'Indefinido',
        inline: true
      });
    }

    // Agregar información de apelación mejorada
    embed.fields.push({
      name: '📞 Apelación y Contacto',
      value: `Si crees que este ban es injusto, puedes apelar contactando a:\n\n**👑 BijjouPro08** (<@710112055985963090>)\n**📧 Email:** spainrpoficial@proton.me\n\n*Las apelaciones se revisan en un plazo de 7 días hábiles.*`,
      inline: false
    });

    // Agregar información sobre verificación de estado
    embed.fields.push({
      name: '🔍 Verificar Estado del Ban',
      value: `Puedes verificar si tu ban ha expirado visitando el sitio web. Si el ban ha caducado, podrás acceder normalmente.`,
      inline: false
    });

    // Crear componentes de interacción (botones)
    const components = [
      {
        type: 1, // ACTION_ROW
        components: [
          {
            type: 2, // BUTTON
            style: 5, // LINK
            label: '🌐 Verificar Estado del Ban',
            url: 'https://spainrp-oficial.onrender.com',
            emoji: {
              name: '🔍'
            }
          },
          {
            type: 2, // BUTTON
            style: 5, // LINK
            label: '📞 Contactar Soporte',
            url: 'https://discord.com/users/710112055985963090',
            emoji: {
              name: '💬'
            }
          }
        ]
      }
    ];

    // Enviar mensaje DM con embed y botones
    await user.send({ 
      embeds: [embed],
      components: components
    });
    
    console.log(`[BAN DM] ✅ Notificación enviada a ${user.tag} (${userId})`);
    return true;
  } catch (error) {
    console.error('[BAN DM] Error enviando notificación:', error);
    return false;
  }
}

// Función para trackear IP
async function trackIP(req, userId = null) {
  try {
    const { getQuery, runQuery } = require('./db/database');
    const ip = getRealIP(req);
    const userAgent = req.headers['user-agent'] || 'Unknown';
    const now = new Date().toISOString();
    
    // Extraer información del dispositivo del User-Agent
    const deviceInfo = parseUserAgent(userAgent, req);
    
    // Obtener información adicional del usuario si está disponible
    let userInfo = null;
    if (userId) {
      // Intentar obtener información del usuario desde la base de datos o sesión
      if (req.user && req.user.username) {
        userInfo = {
          username: req.user.username,
          discriminator: req.user.discriminator || '0000',
          avatar: req.user.avatar
        };
      } else {
        // Si no hay información en req.user, intentar obtenerla de la base de datos
        try {
          const userData = await getQuery(
            'SELECT username, discriminator, avatar FROM users WHERE id = ?',
            [userId]
          );
          if (userData) {
            userInfo = {
              username: userData.username,
              discriminator: userData.discriminator || '0000',
              avatar: userData.avatar
            };
          }
        } catch (dbError) {
          console.log('[IP TRACKING] No se pudo obtener info del usuario desde DB:', dbError.message);
        }
      }
    }
    
    console.log('[IP TRACKING] Registrando IP:', { 
      ip, 
      userId, 
      userInfo,
      userAgent: userAgent.substring(0, 50) + '...',
      device: deviceInfo
    });
    
    // Verificar si la IP ya existe
    const existing = await getQuery(
      'SELECT * FROM ip_tracking WHERE ip = ?',
      [ip]
    );
    
    if (existing) {
      // Actualizar IP existente
      await runQuery(
        'UPDATE ip_tracking SET lastSeen = ?, visitCount = visitCount + 1, userId = COALESCE(?, userId), username = COALESCE(?, username), discriminator = COALESCE(?, discriminator), avatar = COALESCE(?, avatar), isActive = 1, userAgent = ?, country = ?, city = ? WHERE ip = ?',
        [now, userId, userInfo?.username, userInfo?.discriminator, userInfo?.avatar, userAgent, deviceInfo.country, deviceInfo.city, ip]
      );
      console.log('[IP TRACKING] IP actualizada:', ip);
    } else {
      // Crear nueva entrada de IP
      await runQuery(
        'INSERT INTO ip_tracking (ip, userId, username, discriminator, avatar, userAgent, country, city, firstSeen, lastSeen, visitCount, isActive) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 1)',
        [ip, userId, userInfo?.username, userInfo?.discriminator, userInfo?.avatar, userAgent, deviceInfo.country, deviceInfo.city, now, now]
      );
      console.log('[IP TRACKING] Nueva IP registrada:', ip);
    }
  } catch (error) {
    console.error('[IP TRACKING] Error tracking IP:', error);
  }
}

// Función para parsear User-Agent y extraer información del dispositivo
function parseUserAgent(userAgent, req = null) {
  const info = {
    browser: 'Unknown',
    os: 'Unknown',
    device: 'Unknown',
    country: req?.headers['cf-ipcountry'] || 'Unknown',
    city: req?.headers['cf-ipcity'] || 'Unknown'
  };
  
  // Detectar navegador
  if (userAgent.includes('Chrome')) info.browser = 'Chrome';
  else if (userAgent.includes('Firefox')) info.browser = 'Firefox';
  else if (userAgent.includes('Safari')) info.browser = 'Safari';
  else if (userAgent.includes('Edge')) info.browser = 'Edge';
  else if (userAgent.includes('Opera')) info.browser = 'Opera';
  
  // Detectar sistema operativo
  if (userAgent.includes('Windows')) info.os = 'Windows';
  else if (userAgent.includes('Mac OS')) info.os = 'macOS';
  else if (userAgent.includes('Linux')) info.os = 'Linux';
  else if (userAgent.includes('Android')) info.os = 'Android';
  else if (userAgent.includes('iOS')) info.os = 'iOS';
  
  // Detectar tipo de dispositivo
  if (userAgent.includes('Mobile')) info.device = 'Mobile';
  else if (userAgent.includes('Tablet')) info.device = 'Tablet';
  else if (userAgent.includes('Desktop')) info.device = 'Desktop';
  else if (userAgent.includes('Bot')) info.device = 'Bot';
  else info.device = 'Desktop';
  
  return info;
}

// Middleware de verificación de bans
async function banCheckMiddleware(req, res, next) {
  try {
    // Limpiar bans expirados periódicamente
    if (Math.random() < 0.01) { // 1% de probabilidad de ejecutar limpieza
      await cleanupExpiredBans();
    }
    
    const ip = getRealIP(req);
    
    console.log('[BAN CHECK] Verificando IP:', ip);
    
    // Verificar ban de IP
    const ipBan = await isIPBanned(ip);
    if (ipBan) {
      console.log(`[BAN SYSTEM] IP ${ip} is banned:`, ipBan.reason);
      return res.status(403).json({
        error: 'Banned',
        type: 'ip',
        message: 'Tu IP ha sido baneada de este sitio web.',
        reason: ipBan.reason,
        bannedAt: ipBan.bannedAt,
        expiresAt: ipBan.expiresAt
      });
    }
    
    // Extraer userId si está disponible (JWT o sesión)
    let userId = null;
    
    // Intentar obtener userId del JWT
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.substring(7);
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'spainrp_secret_key');
        userId = decoded.userId;
        console.log(`[BAN CHECK] Usuario JWT detectado: ${userId}`);
      } catch (jwtError) {
        // JWT inválido, continuar sin userId
      }
    }
    
    // Si no hay JWT, intentar obtener de la sesión Passport
    if (!userId && req.user && req.user.id) {
      userId = req.user.id;
      console.log(`[BAN CHECK] Usuario de sesión detectado: ${userId}`);
    }
    
    // Trackear IP con userId si está disponible
    await trackIP(req, userId);
    
    next();
  } catch (error) {
    console.error('[BAN SYSTEM] Error in ban check middleware:', error);
    next();
  }
}

// Middleware de verificación de bans para usuarios autenticados
async function authenticatedBanCheckMiddleware(req, res, next) {
  try {
    // Verificar si hay usuario autenticado (Passport o JWT)
    let userId = null;
    
    // Primero intentar con sesión de Passport
    if (req.isAuthenticated && req.isAuthenticated() && req.user && req.user.id) {
      userId = req.user.id;
      console.log(`[BAN CHECK] Usuario Passport detectado: ${userId}`);
    }
    // Si no hay sesión Passport, intentar con JWT
    else {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        try {
          const { verifyToken } = require('./middleware/jwt');
          // Verificar JWT de forma síncrona para obtener el usuario
          const token = authHeader.split(' ')[1];
          const jwt = require('jsonwebtoken');
          const decoded = jwt.verify(token, process.env.JWT_SECRET || 'spainrp_secret_key');
          userId = decoded.userId || decoded.id;
          console.log(`[BAN CHECK] Usuario JWT detectado: ${userId}`);
        } catch (jwtError) {
          // Token JWT inválido, continuar sin usuario
          console.log('[BAN CHECK] Token JWT inválido o no presente');
        }
      }
    }
    
    // Si hay usuario autenticado, verificar ban de Discord
    if (userId) {
      console.log(`[BAN CHECK] Verificando usuario Discord: ${userId}`);
      
      const discordBan = await isDiscordUserBanned(userId);
      if (discordBan) {
        console.log(`[BAN SYSTEM] Discord user ${userId} is banned:`, discordBan.reason);
        return res.status(403).json({
          error: 'Banned',
          type: 'discord',
          message: 'Tu cuenta de Discord ha sido baneada de este sitio web.',
          reason: discordBan.reason,
          bannedAt: discordBan.bannedAt,
          expiresAt: discordBan.expiresAt
        });
      }
    }
    
    next();
  } catch (error) {
    console.error('[BAN SYSTEM] Error in authenticated ban check middleware:', error);
    next();
  }
}

// Endpoint para buscar usuarios de Discord (SIN AUTENTICACIÓN - debe ir ANTES de middlewares de ban)
app.get('/api/discord/search-users', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.length < 3) {
      return res.json([]);
    }

    console.log('[DISCORD SEARCH] Buscando usuarios:', q);

    // Verificar si hay token de bot disponible
    if (!process.env.DISCORD_BOT_TOKEN) {
      console.warn('[DISCORD SEARCH] No hay token de bot disponible');
      return res.json([]);
    }

    const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
    
    // Buscar usuarios en el servidor Discord usando la API
    const guildId = '1212556680911650866';
    const response = await fetch(`https://discord.com/api/guilds/${guildId}/members/search?query=${encodeURIComponent(q)}&limit=10`, {
      headers: {
        'Authorization': `Bot ${process.env.DISCORD_BOT_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      const users = await response.json();
      const formattedUsers = users.map(user => ({
        id: user.user.id,
        username: user.user.username,
        discriminator: user.user.discriminator,
        avatar: user.user.avatar,
        displayName: user.nick || user.user.username
      }));
      
      console.log('[DISCORD SEARCH] Usuarios encontrados:', formattedUsers.length);
      res.json(formattedUsers);
    } else {
      console.warn('[DISCORD SEARCH] Error en API de Discord:', response.status);
      // Fallback: buscar en la base de datos local si existe
      try {
        const { allQuery } = require('./db/database');
        const searchQuery = `
          SELECT DISTINCT discord_id, username, avatar 
          FROM user_data 
          WHERE username LIKE ? OR discord_id LIKE ?
          LIMIT 10
        `;
        const users = await allQuery(searchQuery, [`%${q}%`, `%${q}%`]);
        
        const formattedUsers = users.map(user => ({
          id: user.discord_id,
          username: user.username,
          avatar: user.avatar,
          displayName: user.username
        }));
        
        console.log('[DISCORD SEARCH] Usuarios encontrados en BD:', formattedUsers.length);
        res.json(formattedUsers);
      } catch (dbError) {
        console.error('[DISCORD SEARCH] Error en BD:', dbError);
        res.json([]);
      }
    }
  } catch (error) {
    console.error('[DISCORD SEARCH] Error general:', error);
    res.json([]);
  }
});

// Middleware global de ban - APLICAR NUEVO SISTEMA DE BANS
app.use(banCheckMiddleware);

// Middleware de verificación de bans para usuarios autenticados - APLICAR GLOBALMENTE
app.use(authenticatedBanCheckMiddleware);

app.get('/', (req, res) => {
  const uptime = process.uptime();
  const uptimeFormatted = Math.floor(uptime / 3600) + 'h ' + Math.floor((uptime % 3600) / 60) + 'm ' + Math.floor(uptime % 60) + 's';
  
  res.json({
    status: 'online',
    message: 'Backend SpainRP funcionando correctamente',
    version: '2.0.0',
    uptime: uptimeFormatted,
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    features: [
      'Discord Bot Integration',
      'JWT Authentication',
      'TinderRP App',
      'Roblox API Integration',
      'Admin Panel',
      'WebSocket Support',
      'Database Management',
      'File Upload System'
    ],
    endpoints: {
      auth: '/auth/*',
      api: '/api/*',
      tinder: '/api/tinder/*',
      roblox: '/api/roblox/*',
      admin: '/api/admin/*',
      websocket: '/socket.io/'
    },
    health: {
      memory: process.memoryUsage(),
      platform: process.platform,
      nodeVersion: process.version,
      pid: process.pid
    }
  });
});

// Endpoint de salud para monitoreo
app.get('/health', (req, res) => {
  const uptime = process.uptime();
  const memoryUsage = process.memoryUsage();
  
  res.json({
    status: 'healthy',
    uptime: Math.floor(uptime),
    memory: {
      used: Math.round(memoryUsage.heapUsed / 1024 / 1024) + ' MB',
      total: Math.round(memoryUsage.heapTotal / 1024 / 1024) + ' MB',
      external: Math.round(memoryUsage.external / 1024 / 1024) + ' MB'
    },
    timestamp: new Date().toISOString(),
    version: '2.0.0'
  });
});

// Endpoint de información del sistema
app.get('/info', (req, res) => {
  res.json({
    name: 'SpainRP Backend API',
    description: 'Backend API para el servidor de roleplay SpainRP',
    version: '2.0.0',
    author: 'SpainRP Development Team',
    repository: 'https://github.com/Bijjouspnrp/spainrp-web',
    documentation: 'https://spainrp-oficial.onrender.com/docs',
    support: 'https://discord.gg/spainrp',
    features: {
      authentication: 'JWT + Discord OAuth2',
      database: 'SQLite + MongoDB',
      realtime: 'Socket.IO WebSockets',
      integrations: ['Discord Bot', 'Roblox API', 'SendGrid Email'],
      apps: ['TinderRP', 'Admin Panel', 'Stock Market', 'Black Market']
    },
    stats: {
      uptime: process.uptime(),
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
      pid: process.pid
    }
  });
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

// Middleware JWT para administradores
const { verifyToken } = require('./middleware/jwt');
function ensureJWTAdmin(req, res, next) {
  // Verificar token JWT
  verifyToken(req, res, (err) => {
    if (err) return; // verifyToken ya envió la respuesta de error
    
    // Verificar si es administrador
    const userId = req.user?.id;
    const adminUserIds = [
      '710112055985963090', // bijjoupro08
      // Añade más IDs de administradores aquí
    ];
    
    if (!adminUserIds.includes(userId)) {
      console.log(`[JWT ADMIN] Usuario ${userId} no está en la lista de administradores`);
      return res.status(403).json({ error: 'No tienes permisos de administrador' });
    }
    
    next();
  });
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
    
    // Usar cache directamente para evitar timeout en servidores grandes
    let member = guild.members.cache.get(userId);
    if (!member) {
      // Solo hacer fetch si no está en cache
      try {
        await guild.members.fetch(userId);
        member = guild.members.cache.get(userId);
      } catch (fetchError) {
        console.warn(`[DISCORD PROXY] ⚠️ No se pudo hacer fetch del usuario ${userId}:`, fetchError.message);
      }
    }
    
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

// Proxy: agregar item al inventario de un usuario (solo administradores)
async function proxyAddAdminItem(userId, itemId, amount) {
    const response = await fetch(`${process.env.ECONOMIA_API_URL || 'http://37.27.21.91:5021'}/api/blackmarket/admin/additem`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, itemId, amount })
  });
  return await response.json();
}

// Proxy: retirar item del inventario de un usuario (solo administradores)
async function proxyRemoveAdminItem(userId, itemId, amount) {
    const response = await fetch(`${process.env.ECONOMIA_API_URL || 'http://37.27.21.91:5021'}/api/blackmarket/admin/removeitem`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, itemId, amount })
  });
  return await response.json();
}

// Proxy: consultar saldo de un usuario
async function proxyGetUserBalance(userId) {
    const response = await fetch(`${process.env.ECONOMIA_API_URL || 'http://37.27.21.91:5021'}/api/proxy/admin/balance/${encodeURIComponent(userId)}`);
    return await response.json();
}

// Proxy: consultar saldo de varios usuarios
async function proxyGetUserBalances(userIds) {
    const response = await fetch(`${process.env.ECONOMIA_API_URL || 'http://37.27.21.91:5021'}/api/proxy/admin/balances`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userIds })
    });
    return await response.json();
}

// Proxy: transferir dinero entre usuarios
async function proxyTransferMoney(fromId, toId, amount, origen) {
    const response = await fetch(`${process.env.ECONOMIA_API_URL || 'http://37.27.21.91:5021'}/api/proxy/admin/transfer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fromId, toId, amount, origen })
    });
    return await response.json();
}

// Proxy: realizar trabajo
async function proxyWork(userId, username) {
    const response = await fetch(`${process.env.ECONOMIA_API_URL || 'http://37.27.21.91:5021'}/api/proxy/admin/trabajar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, username })
    });
    return await response.json();
}

// Proxy: cobrar nómina
async function proxyCollectSalary(userId, roles) {
    const response = await fetch(`${process.env.ECONOMIA_API_URL || 'http://37.27.21.91:5021'}/api/proxy/admin/cobrar-nomina`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, roles })
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
    const response = await fetch(`${process.env.ECONOMIA_API_URL || 'http://37.27.21.91:5021'}/api/blackmarket/admin/additem`, {
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
    const response = await fetch(`${process.env.ECONOMIA_API_URL || 'http://37.27.21.91:5021'}/api/blackmarket/admin/removeitem`, {
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

// Consultar saldo de un usuario (POST)
app.post('/api/proxy/admin/balance', express.json(), async (req, res) => {
  try {
    const { userId } = req.body;
    console.log(`[PROXY] [balance] POST request for userId: ${userId}`);
    
    if (!userId) {
      return res.status(400).json({ error: 'userId requerido' });
    }
    
    const data = await proxyGetUserBalance(userId);
    console.log(`[PROXY] [balance] Response:`, data);
    res.json(data);
  } catch (error) {
    console.error('[PROXY] [balance] Exception:', error);
    res.status(500).json({ error: 'Error al consultar saldo', details: String(error) });
  }
});

// Consultar saldo de varios usuarios
app.post('/api/proxy/admin/balances', express.json(), async (req, res) => {
  try {
    const { userIds } = req.body;
    console.log(`[PROXY] [balances] POST request for userIds:`, userIds);
    
    if (!Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ error: 'userIds array requerido' });
    }
    
    const data = await proxyGetUserBalances(userIds);
    console.log(`[PROXY] [balances] Response:`, data);
    res.json(data);
  } catch (error) {
    console.error('[PROXY] [balances] Exception:', error);
    res.status(500).json({ error: 'Error al consultar saldos', details: String(error) });
  }
});

// Transferir dinero entre usuarios
app.post('/api/proxy/admin/transfer', express.json(), async (req, res) => {
  try {
    const { fromId, toId, amount, origen } = req.body;
    console.log(`[PROXY] [transfer] POST request:`, { fromId, toId, amount, origen });
    
    if (!fromId || !toId || !amount || amount <= 0) {
      return res.status(400).json({ error: 'fromId, toId y amount válidos requeridos' });
    }
    
    const data = await proxyTransferMoney(fromId, toId, amount, origen || 'banco');
    console.log(`[PROXY] [transfer] Response:`, data);
    res.json(data);
  } catch (error) {
    console.error('[PROXY] [transfer] Exception:', error);
    res.status(500).json({ error: 'Error al transferir dinero', details: String(error) });
  }
});

// Realizar trabajo
app.post('/api/proxy/admin/trabajar', express.json(), async (req, res) => {
  try {
    const { userId, username } = req.body;
    console.log(`[PROXY] [trabajar] POST request:`, { userId, username });
    
    if (!userId) {
      return res.status(400).json({ error: 'userId requerido' });
    }
    
    const data = await proxyWork(userId, username);
    console.log(`[PROXY] [trabajar] Response:`, data);
    res.json(data);
  } catch (error) {
    console.error('[PROXY] [trabajar] Exception:', error);
    res.status(500).json({ error: 'Error al realizar trabajo', details: String(error) });
  }
});

// Cobrar nómina
app.post('/api/proxy/admin/cobrar-nomina', express.json(), async (req, res) => {
  try {
    const { userId, roles } = req.body;
    console.log(`[PROXY] [cobrar-nomina] POST request:`, { userId, roles });
    
    if (!userId || !Array.isArray(roles)) {
      return res.status(400).json({ error: 'userId y roles array requeridos' });
    }
    
    const data = await proxyCollectSalary(userId, roles);
    console.log(`[PROXY] [cobrar-nomina] Response:`, data);
    res.json(data);
  } catch (error) {
    console.error('[PROXY] [cobrar-nomina] Exception:', error);
    res.status(500).json({ error: 'Error al cobrar nómina', details: String(error) });
  }
});

// ===== ENDPOINTS PARA USUARIOS NORMALES (NO ADMIN) =====

// Consultar saldo propio (GET)
app.get('/api/proxy/balance/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    console.log(`[BANCO] [balance-user] GET request for userId: ${userId}`);
    
    const data = await proxyGetUserBalance(userId);
    console.log(`[BANCO] [balance-user] Response:`, data);
    res.json(data);
  } catch (error) {
    console.error('[BANCO] [balance-user] Exception:', error);
    console.error('[BANCO] [balance-user] Error stack:', error.stack);
    
    // Fallback: devolver datos simulados si la API de economía no está disponible
    console.log(`[BANCO] [balance-user] Using fallback data for userId: ${userId}`);
    const fallbackData = {
      success: true,
      userId: userId,
      balance: { cash: 1000, bank: 5000 },
      total: 6000,
      message: 'Datos simulados - API de economía no disponible'
    };
    res.json(fallbackData);
  }
});

// Consultar saldo propio (POST)
app.post('/api/proxy/balance', express.json(), async (req, res) => {
  try {
    const { userId } = req.body;
    console.log(`[BANCO] [balance-user] POST request for userId: ${userId}`);
    
    if (!userId) {
      return res.status(400).json({ error: 'userId requerido' });
    }
    
    const data = await proxyGetUserBalance(userId);
    console.log(`[BANCO] [balance-user] Response:`, data);
    res.json(data);
  } catch (error) {
    console.error('[BANCO] [balance-user] Exception:', error);
    console.error('[BANCO] [balance-user] Error stack:', error.stack);
    
    // Fallback: devolver datos simulados si la API de economía no está disponible
    console.log(`[BANCO] [balance-user] Using fallback data for userId: ${userId}`);
    const fallbackData = {
      success: true,
      userId: userId,
      balance: { cash: 1000, bank: 5000 },
      total: 6000,
      message: 'Datos simulados - API de economía no disponible'
    };
    res.json(fallbackData);
  }
});

// Consultar inventario propio (GET)
app.get('/api/proxy/inventory/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    console.log(`[PROXY] [inventory-user] GET request for userId: ${userId}`);
    
    const response = await fetch(`${process.env.ECONOMIA_API_URL || 'http://37.27.21.91:5021'}/api/proxy/inventory/${encodeURIComponent(userId)}`);
    const data = await response.json();
    console.log(`[PROXY] [inventory-user] Response:`, data);
    res.json(data);
  } catch (error) {
    console.error('[PROXY] [inventory-user] Exception:', error);
    res.status(500).json({ error: 'Error al consultar inventario', details: String(error) });
  }
});

// Consultar inventario propio (POST)
app.post('/api/proxy/inventory', express.json(), async (req, res) => {
  try {
    const { userId } = req.body;
    console.log(`[PROXY] [inventory-user] POST request for userId: ${userId}`);
    
    if (!userId) {
      return res.status(400).json({ error: 'userId requerido' });
    }
    
    const response = await fetch(`${process.env.ECONOMIA_API_URL || 'http://37.27.21.91:5021'}/api/proxy/inventory`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId })
    });
    const data = await response.json();
    console.log(`[PROXY] [inventory-user] Response:`, data);
    res.json(data);
  } catch (error) {
    console.error('[PROXY] [inventory-user] Exception:', error);
    res.status(500).json({ error: 'Error al consultar inventario', details: String(error) });
  }
});

// Trabajar (usuarios normales)
app.post('/api/proxy/trabajar', express.json(), async (req, res) => {
  try {
    const { userId, username } = req.body;
    console.log(`[BANCO] [trabajar-user] POST request:`, { userId, username });
    
    if (!userId) {
      return res.status(400).json({ error: 'userId requerido' });
    }
    
    const data = await proxyWork(userId, username);
    console.log(`[BANCO] [trabajar-user] Response:`, data);
    res.json(data);
  } catch (error) {
    console.error('[BANCO] [trabajar-user] Exception:', error);
    res.status(500).json({ error: 'Error al realizar trabajo', details: String(error) });
  }
});

// Cobrar nómina (usuarios normales)
app.post('/api/proxy/cobrar-nomina', express.json(), async (req, res) => {
  try {
    const { userId, roles } = req.body;
    console.log(`[BANCO] [cobrar-nomina-user] POST request:`, { userId, roles });
    
    if (!userId || !Array.isArray(roles)) {
      return res.status(400).json({ error: 'userId y roles array requeridos' });
    }
    
    // Asegurar que todos los roles sean strings para evitar problemas de comparación
    const rolesAsStrings = roles.map(role => String(role));
    console.log(`[BANCO] [cobrar-nomina-user] Roles normalizados:`, rolesAsStrings);
    
    const data = await proxyCollectSalary(userId, rolesAsStrings);
    console.log(`[BANCO] [cobrar-nomina-user] Response:`, data);
    res.json(data);
  } catch (error) {
    console.error('[BANCO] [cobrar-nomina-user] Exception:', error);
    res.status(500).json({ error: 'Error al cobrar nómina', details: String(error) });
  }
});

// Transferir dinero (usuarios normales)
app.post('/api/proxy/transfer', express.json(), async (req, res) => {
  try {
    const { fromId, toId, amount, origen } = req.body;
    console.log(`[BANCO] [transfer-user] POST request:`, { fromId, toId, amount, origen });
    
    if (!fromId || !toId || !amount || amount <= 0) {
      return res.status(400).json({ error: 'fromId, toId y amount válidos requeridos' });
    }
    
    const data = await proxyTransferMoney(fromId, toId, amount, origen || 'banco');
    console.log(`[BANCO] [transfer-user] Response:`, data);
    res.json(data);
  } catch (error) {
    console.error('[BANCO] [transfer-user] Exception:', error);
    res.status(500).json({ error: 'Error al transferir dinero', details: String(error) });
  }
});

// Depositar dinero (usuarios normales)
app.post('/api/proxy/deposit', express.json(), async (req, res) => {
  try {
    const { userId, amount } = req.body;
    console.log(`[BANCO] [deposit-user] POST request:`, { userId, amount });
    
    if (!userId || !amount || amount <= 0) {
      console.error(`[BANCO] [deposit-user] Invalid parameters:`, { userId, amount });
      return res.status(400).json({ error: 'userId y amount válidos requeridos' });
    }
    
    // Usar el endpoint correcto de la API de economía
    const economiaUrl = `${process.env.ECONOMIA_API_URL || 'http://37.27.21.91:5021'}/api/proxy/admin/deposit`;
    const requestBody = {
      userId: userId,
      amount: parseInt(amount)
    };
    
    console.log(`[BANCO] [deposit-user] Calling economia API: ${economiaUrl}`);
    console.log(`[BANCO] [deposit-user] Request body:`, requestBody);
    
    const response = await fetch(economiaUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });
    
    console.log(`[BANCO] [deposit-user] Economia API response status: ${response.status}`);
    
    const data = await response.json();
    console.log(`[BANCO] [deposit-user] Economia API response data:`, data);
    
    if (!response.ok) {
      console.error(`[BANCO] [deposit-user] Economia API error: ${response.status} - ${data.error || 'Unknown error'}`);
      return res.status(response.status).json(data);
    }
    
    console.log(`[BANCO] [deposit-user] Sending response to frontend:`, data);
    res.json(data);
  } catch (error) {
    console.error('[BANCO] [deposit-user] Exception:', error);
    console.error('[BANCO] [deposit-user] Error stack:', error.stack);
    
    // Fallback: devolver datos simulados si la API de economía no está disponible
    console.log(`[BANCO] [deposit-user] Using fallback data for userId: ${userId}`);
    const fallbackData = {
      success: true,
      userId: userId,
      message: 'Depósito simulado - API de economía no disponible',
      newBalance: { cash: 1000, bank: 5500 }
    };
    res.json(fallbackData);
  }
});

// Retirar dinero (usuarios normales)
app.post('/api/proxy/withdraw', express.json(), async (req, res) => {
  try {
    const { userId, amount } = req.body;
    console.log(`[BANCO] [withdraw-user] POST request:`, { userId, amount });
    
    if (!userId || !amount || amount <= 0) {
      return res.status(400).json({ error: 'userId y amount válidos requeridos' });
    }
    
    // Usar el endpoint correcto de la API de economía
    const economiaUrl = `${process.env.ECONOMIA_API_URL || 'http://37.27.21.91:5021'}/api/proxy/admin/withdraw`;
    const requestBody = {
      userId: userId,
      amount: parseInt(amount)
    };
    
    console.log(`[BANCO] [withdraw-user] Calling economia API: ${economiaUrl}`);
    console.log(`[BANCO] [withdraw-user] Request body:`, requestBody);
    
    const response = await fetch(economiaUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });
    
    console.log(`[BANCO] [withdraw-user] Economia API response status: ${response.status}`);
    
    const data = await response.json();
    console.log(`[BANCO] [withdraw-user] Economia API response data:`, data);
    
    if (!response.ok) {
      console.error(`[BANCO] [withdraw-user] Economia API error: ${response.status} - ${data.error || 'Unknown error'}`);
      return res.status(response.status).json(data);
    }
    
    console.log(`[BANCO] [withdraw-user] Sending response to frontend:`, data);
    res.json(data);
  } catch (error) {
    console.error('[BANCO] [withdraw-user] Exception:', error);
    console.error('[BANCO] [withdraw-user] Error stack:', error.stack);
    
    // Fallback: devolver datos simulados si la API de economía no está disponible
    console.log(`[BANCO] [withdraw-user] Using fallback data for userId: ${userId}`);
    const fallbackData = {
      success: true,
      userId: userId,
      message: 'Retiro simulado - API de economía no disponible',
      newBalance: { cash: 1500, bank: 4500 }
    };
    res.json(fallbackData);
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

// =============================================================================
// SISTEMA DE MODO MANTENIMIENTO
// =============================================================================

// Endpoint para obtener estado del mantenimiento
app.get('/api/maintenance/status', (req, res) => {
  try {
    const isMaintenance = fs.existsSync(MAINTENANCE_FILE);
    const maintenanceData = isMaintenance ? {
      maintenance: true,
      startedAt: fs.statSync(MAINTENANCE_FILE).mtime,
      message: 'El servidor está en mantenimiento. Volveremos pronto.'
    } : {
      maintenance: false,
      startedAt: null,
      message: 'El servidor está funcionando normalmente.'
    };
    
    res.json(maintenanceData);
  } catch (error) {
    console.error('[MAINTENANCE STATUS] Error:', error);
    res.status(500).json({ error: 'Error obteniendo estado de mantenimiento' });
  }
});

// Endpoint para activar/desactivar mantenimiento (solo para administradores)
app.post('/api/maintenance/toggle', ensureJWTAdmin, (req, res) => {
  try {
    const { action, message } = req.body;
    const userId = req.user?.id;
    
    console.log(`[MAINTENANCE TOGGLE] Usuario ${userId} intentando ${action} mantenimiento`);
    
    if (action === 'on') {
      // Activar mantenimiento
      const maintenanceData = {
        activatedBy: userId,
        activatedAt: new Date().toISOString(),
        message: message || 'El servidor está en mantenimiento. Volveremos pronto.',
        estimatedDuration: '30 minutos'
      };
      
      fs.writeFileSync(MAINTENANCE_FILE, JSON.stringify(maintenanceData, null, 2));
      console.log('[MAINTENANCE] Modo mantenimiento ACTIVADO por:', userId);
      
      // Emitir evento a todos los clientes conectados
      if (io) {
        io.emit('maintenance', { maintenance: true, data: maintenanceData });
      }
      
      res.json({ 
        success: true, 
        message: 'Modo mantenimiento activado correctamente',
        data: maintenanceData
      });
      
    } else if (action === 'off') {
      // Desactivar mantenimiento
      if (fs.existsSync(MAINTENANCE_FILE)) {
        const maintenanceData = JSON.parse(fs.readFileSync(MAINTENANCE_FILE, 'utf8'));
        fs.unlinkSync(MAINTENANCE_FILE);
        console.log('[MAINTENANCE] Modo mantenimiento DESACTIVADO por:', userId);
        
        // Emitir evento a todos los clientes conectados
        if (io) {
          io.emit('maintenance', { maintenance: false, data: null });
        }
        
        res.json({ 
          success: true, 
          message: 'Modo mantenimiento desactivado correctamente',
          data: maintenanceData
        });
      } else {
        res.json({ 
          success: true, 
          message: 'El servidor ya estaba funcionando normalmente'
        });
      }
    } else {
      res.status(400).json({ error: 'Acción inválida. Use "on" o "off"' });
    }
  } catch (error) {
    console.error('[MAINTENANCE TOGGLE] Error:', error);
    res.status(500).json({ error: 'Error al cambiar modo mantenimiento' });
  }
});

// Endpoint para obtener suscriptores de mantenimiento
app.get('/api/maintenance/subscribers', ensureJWTAdmin, (req, res) => {
  try {
    const subscribers = readMaintSubs();
    res.json({ subscribers });
  } catch (error) {
    console.error('[MAINTENANCE SUBSCRIBERS] Error:', error);
    res.status(500).json({ error: 'Error obteniendo suscriptores' });
  }
});

// Endpoint para obtener perfil de Roblox
app.get('/api/roblox/profile/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    console.log(`[ROBLOX PROFILE] Obteniendo perfil para: ${userId}`);
    
    // Buscar en la base de datos si el usuario está verificado
    const robloxData = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM roblox_verifications WHERE discordId = ?', [userId], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    
    if (robloxData) {
      // Usuario verificado, devolver datos reales
    res.json({
      success: true,
      profile: {
          userId: robloxData.robloxId,
          username: robloxData.username,
          displayName: robloxData.displayName,
          avatar: robloxData.avatarUrl,
          verified: true,
          verifiedAt: robloxData.verifiedAt
        }
      });
    } else {
      // Usuario no verificado
      res.status(404).json({ 
        success: false,
        error: 'Usuario no verificado en Roblox',
        profile: null
      });
    }
  } catch (error) {
    console.error('[ROBLOX PROFILE] Error:', error);
    res.status(500).json({ error: 'Error obteniendo perfil de Roblox' });
  }
});

// Endpoint para obtener canales de Discord
app.get('/api/discord/channels', ensureAuthAndAdmin, (req, res) => {
  try {
    if (!discordClient || !discordClient.readyAt) {
      return res.status(503).json({ error: 'Bot de Discord no disponible' });
    }
    
    const guildId = process.env.DISCORD_GUILD_ID || '1212556680911650866';
    const guild = discordClient.guilds.cache.get(guildId);
    
    if (!guild) {
      return res.status(404).json({ error: 'Servidor no encontrado' });
    }
    
    const channels = guild.channels.cache.map(channel => ({
      id: channel.id,
      name: channel.name,
      type: channel.type,
      position: channel.position
    }));
    
    res.json({ channels });
  } catch (error) {
    console.error('[DISCORD CHANNELS] Error:', error);
    res.status(500).json({ error: 'Error obteniendo canales' });
  }
});

// Endpoint para obtener permisos de Discord
app.get('/api/discord/permissions', ensureAuthAndAdmin, (req, res) => {
  try {
    if (!discordClient || !discordClient.readyAt) {
      return res.status(503).json({ error: 'Bot de Discord no disponible' });
    }
    
    const guildId = process.env.DISCORD_GUILD_ID || '1212556680911650866';
    const guild = discordClient.guilds.cache.get(guildId);
    
    if (!guild) {
      return res.status(404).json({ error: 'Servidor no encontrado' });
    }
    
    const permissions = {
      guild: {
        id: guild.id,
        name: guild.name,
        permissions: guild.members.me.permissions.toArray()
      },
      roles: guild.roles.cache.map(role => ({
        id: role.id,
        name: role.name,
        permissions: role.permissions.toArray(),
        position: role.position
      }))
    };
    
    res.json(permissions);
  } catch (error) {
    console.error('[DISCORD PERMISSIONS] Error:', error);
    res.status(500).json({ error: 'Error obteniendo permisos' });
  }
});

// Endpoint para miembros activos (widget)
app.get('/api/widget', async (req, res) => {
  try {
    const guildId = process.env.DISCORD_GUILD_ID || '1212556680911650866';
    const guild = discordClient.guilds.cache.get(guildId);
    if (!guild) return res.status(404).json({ error: 'Servidor no encontrado' });
    
    // ✅ Usar miembros ya en cache (sin fetch que causa timeout)
    // Filtra miembros con estado online, idle, dnd solo de los que ya están en cache
    const presence_count = guild.members.cache.filter(m => m.presence && ['online','idle','dnd'].includes(m.presence.status)).size;
    
    console.log(`[BOT API] ✅ Widget presence_count obtenido desde cache: ${presence_count}`);
    res.json({ presence_count });
  } catch (err) {
    console.error('[BOT API] Error en widget:', err);
    res.status(500).json({ error: 'Error al obtener widget', details: err.message });
  }
});

// Endpoint de prueba para verificar que el backend esté funcionando
app.get('/api/erlc/test', (req, res) => {
  console.log('[ERLC API] 🧪 Endpoint de prueba llamado');
  res.json({ 
    message: 'Backend ERLC funcionando correctamente',
    timestamp: new Date().toISOString(),
    status: 'ok'
  });
});

// Endpoint simple para verificar que la ruta base funcione
app.get('/api/erlc', (req, res) => {
  console.log('[ERLC API] 📍 Endpoint base ERLC llamado');
  res.json({ 
    message: 'ERLC API base endpoint funcionando',
    availableEndpoints: ['/api/erlc/test', '/api/erlc/server-status'],
    timestamp: new Date().toISOString()
  });
});

// Endpoint para obtener estado del servidor ERLC
app.get('/api/erlc/server-status', async (req, res) => {
  console.log('[ERLC API] 🚀 Endpoint /api/erlc/server-status llamado');
  const startTime = Date.now();
  const requestId = Math.random().toString(36).substr(2, 9);
  
  try {
    const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
    
    const API_URL = 'https://api.policeroleplay.community/v1';
    const SERVER_KEY = 'vgNwEFZzjbtMhsxvLPlp-TmDsImkTdeynQPbxlHANzllQUkSHvbSStOsRPrJN';
    
    console.log(`[ERLC API] 🔍 [${requestId}] Iniciando consulta a la API...`);
    console.log(`[ERLC API] 📋 [${requestId}] Configuración:`, {
      apiUrl: API_URL,
      serverKeyLength: SERVER_KEY.length,
      serverKeyPreview: SERVER_KEY.substring(0, 10) + '...',
      timestamp: new Date().toISOString()
    });
    
    // Obtener información básica del servidor
    console.log(`[ERLC API] 🌐 [${requestId}] Haciendo petición a /server...`);
    const serverResponse = await fetch(`${API_URL}/server`, {
      headers: {
        'server-key': SERVER_KEY,
        'Accept': '*/*',
        'User-Agent': 'SpainRP-Web/1.0'
      }
    });
    
    const serverResponseTime = Date.now() - startTime;
    console.log(`[ERLC API] 📡 [${requestId}] Respuesta del servidor (${serverResponseTime}ms):`, {
      status: serverResponse.status,
      ok: serverResponse.ok,
      statusText: serverResponse.statusText,
      contentType: serverResponse.headers.get('content-type'),
      contentLength: serverResponse.headers.get('content-length'),
      date: serverResponse.headers.get('date'),
      server: serverResponse.headers.get('server')
    });
    
    if (!serverResponse.ok) {
      const errorText = await serverResponse.text();
      console.error(`[ERLC API] ❌ [${requestId}] Error en respuesta del servidor:`, {
        status: serverResponse.status,
        statusText: serverResponse.statusText,
        errorText: errorText.substring(0, 500),
        fullErrorText: errorText
      });
      throw new Error(`Error de API: ${serverResponse.status} - ${errorText}`);
    }
    
    const serverData = await serverResponse.json();
    console.log(`[ERLC API] 📊 [${requestId}] Datos del servidor recibidos:`, {
      name: serverData.Name,
      currentPlayers: serverData.CurrentPlayers,
      maxPlayers: serverData.MaxPlayers,
      joinKey: serverData.JoinKey,
      accVerifiedReq: serverData.AccVerifiedReq,
      teamBalance: serverData.TeamBalance,
      ownerId: serverData.OwnerId,
      coOwnerIds: serverData.CoOwnerIds,
      fullData: serverData
    });
    
    // Obtener jugadores en cola
    let queueCount = 0;
    let queueData = null;
    try {
      console.log(`[ERLC API] 🚶 [${requestId}] Obteniendo cola de jugadores...`);
      const queueStartTime = Date.now();
      
      const queueResponse = await fetch(`${API_URL}/server/queue`, {
        headers: {
          'server-key': SERVER_KEY,
          'Accept': '*/*',
          'User-Agent': 'SpainRP-Web/1.0'
        }
      });
      
      const queueResponseTime = Date.now() - queueStartTime;
      console.log(`[ERLC API] 🚶 [${requestId}] Respuesta de cola (${queueResponseTime}ms):`, {
        status: queueResponse.status,
        ok: queueResponse.ok,
        contentType: queueResponse.headers.get('content-type')
      });
      
      if (queueResponse.ok) {
        queueData = await queueResponse.json();
        queueCount = Array.isArray(queueData) ? queueData.length : 0;
        console.log(`[ERLC API] 🚶 [${requestId}] Cola de jugadores:`, {
          count: queueCount,
          data: queueData,
          isArray: Array.isArray(queueData)
        });
      } else {
        console.warn(`[ERLC API] ⚠️ [${requestId}] Error en respuesta de cola:`, {
          status: queueResponse.status,
          statusText: queueResponse.statusText
        });
      }
    } catch (queueError) {
      console.warn(`[ERLC API] ⚠️ [${requestId}] Error obteniendo cola:`, {
        message: queueError.message,
        stack: queueError.stack,
        name: queueError.name
      });
    }
    
    // Obtener jugadores actuales en el servidor
    let currentPlayers = 0;
    let playersData = null;
    try {
      console.log(`[ERLC API] 👥 [${requestId}] Obteniendo jugadores actuales...`);
      const playersStartTime = Date.now();
      
      const playersResponse = await fetch(`${API_URL}/server/players`, {
        headers: {
          'server-key': SERVER_KEY,
          'Accept': '*/*',
          'User-Agent': 'SpainRP-Web/1.0'
        }
      });
      
      const playersResponseTime = Date.now() - playersStartTime;
      console.log(`[ERLC API] 👥 [${requestId}] Respuesta de jugadores (${playersResponseTime}ms):`, {
        status: playersResponse.status,
        ok: playersResponse.ok,
        contentType: playersResponse.headers.get('content-type')
      });
      
      if (playersResponse.ok) {
        playersData = await playersResponse.json();
        currentPlayers = Array.isArray(playersData) ? playersData.length : 0;
        console.log(`[ERLC API] 👥 [${requestId}] Jugadores actuales:`, {
          count: currentPlayers,
          isArray: Array.isArray(playersData),
          sampleData: Array.isArray(playersData) ? playersData.slice(0, 3) : playersData
        });
      } else {
        console.warn(`[ERLC API] ⚠️ [${requestId}] Error en respuesta de jugadores:`, {
          status: playersResponse.status,
          statusText: playersResponse.statusText
        });
        // Usar datos del servidor si falla la consulta de jugadores
        currentPlayers = serverData.CurrentPlayers || 0;
        console.log(`[ERLC API] 🔄 [${requestId}] Usando datos del servidor para jugadores:`, currentPlayers);
      }
    } catch (playersError) {
      console.warn(`[ERLC API] ⚠️ [${requestId}] Error obteniendo jugadores:`, {
        message: playersError.message,
        stack: playersError.stack,
        name: playersError.name
      });
      // Usar datos del servidor si falla la consulta de jugadores
      currentPlayers = serverData.CurrentPlayers || 0;
      console.log(`[ERLC API] 🔄 [${requestId}] Usando datos del servidor para jugadores:`, currentPlayers);
    }
    
    // Construir respuesta con datos reales de la API
    const responseData = {
      serverName: serverData.Name || 'SpainRP Official',
      players: currentPlayers,
      maxPlayers: serverData.MaxPlayers || 32,
      queue: queueCount,
      online: true, // Si llegamos aquí, el servidor está online
      map: 'Liberty City', // No disponible en la API, usar valor por defecto
      version: 'Latest', // No disponible en la API, usar valor por defecto
      joinKey: serverData.JoinKey || 'SpainRP',
      accVerifiedReq: serverData.AccVerifiedReq || 'Disabled',
      teamBalance: serverData.TeamBalance || false,
      ownerId: serverData.OwnerId,
      coOwnerIds: serverData.CoOwnerIds || []
    };
    
    const totalTime = Date.now() - startTime;
    console.log(`[ERLC API] ✅ [${requestId}] Datos finales del servidor (${totalTime}ms):`, {
      ...responseData,
      processingTime: totalTime,
      queueDataReceived: !!queueData,
      playersDataReceived: !!playersData
    });
    
    res.json(responseData);
    
  } catch (error) {
    const totalTime = Date.now() - startTime;
    console.error(`[ERLC API] ❌ [${requestId}] Error obteniendo datos del servidor (${totalTime}ms):`, {
      message: error.message,
      stack: error.stack,
      name: error.name,
      processingTime: totalTime
    });
    
    // Datos de fallback en caso de error
    const fallbackData = {
      serverName: 'SpainRP Official',
      players: 0,
      maxPlayers: 32,
      queue: 0,
      online: false,
      map: 'Liberty City',
      version: 'Latest',
      joinKey: 'SpainRP',
      accVerifiedReq: 'Disabled',
      teamBalance: false,
      ownerId: null,
      coOwnerIds: []
    };
    
    console.log(`[ERLC API] 🔄 [${requestId}] Usando datos de fallback:`, {
      ...fallbackData,
      processingTime: totalTime,
      errorOccurred: true
    });
    
    res.json(fallbackData);
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
    
    // ✅ Usar guild.memberCount directamente (instantáneo, sin timeout)
    // No usar guild.members.fetch() que causa GuildMembersTimeout en servidores grandes
    const memberCount = guild.memberCount;
    
    console.log(`[BOT API] ✅ Membercount obtenido instantáneamente: ${memberCount}`);
    res.json({ memberCount });
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
    
    console.log(`[DISCORD BAN] Intentando banear usuario: ${userId}, motivo: ${reason}`);
    
    if (!userId) {
      return res.status(400).json({ error: 'Falta userId' });
    }
    
    if (!discordClient || !discordClient.readyAt) {
      return res.status(503).json({ error: 'Bot de Discord no disponible' });
    }
    
    const guild = discordClient.guilds.cache.get(guildId);
    if (!guild) {
      console.error(`[DISCORD BAN] Servidor no encontrado: ${guildId}`);
      return res.status(404).json({ error: 'Servidor no encontrado' });
    }
    
    // Buscar el usuario en el servidor
    await guild.members.fetch();
    const member = guild.members.cache.get(userId);
    
    if (!member) {
      console.error(`[DISCORD BAN] Usuario no encontrado en el servidor: ${userId}`);
      return res.status(404).json({ error: 'Usuario no encontrado en el servidor' });
    }
    
    // Banear el usuario
    await member.ban({ 
      reason: reason || 'Baneado desde panel admin',
      deleteMessageDays: 7 // Eliminar mensajes de los últimos 7 días
    });
    
    console.log(`[DISCORD BAN] Usuario baneado exitosamente: ${userId}`);
    res.json({ 
      success: true, 
      message: `Usuario ${member.user.username} (${userId}) baneado exitosamente.`,
      user: {
        id: member.user.id,
        username: member.user.username,
        discriminator: member.user.discriminator
      }
    });
  } catch (err) {
    console.error('[DISCORD BAN] Error:', err);
    res.status(500).json({ 
      error: 'Error al banear usuario', 
      details: err.message,
      userId: req.body.userId
    });
  }
});

// Endpoint para desbanear usuario
app.post('/api/discord/unban', express.json(), async (req, res) => {
  try {
    const guildId = process.env.DISCORD_GUILD_ID || '1212556680911650866';
    const { userId } = req.body;
    
    console.log(`[DISCORD UNBAN] Intentando desbanear usuario: ${userId}`);
    
    if (!userId) {
      return res.status(400).json({ error: 'Falta userId' });
    }
    
    if (!discordClient || !discordClient.readyAt) {
      return res.status(503).json({ error: 'Bot de Discord no disponible' });
    }
    
    const guild = discordClient.guilds.cache.get(guildId);
    if (!guild) {
      console.error(`[DISCORD UNBAN] Servidor no encontrado: ${guildId}`);
      return res.status(404).json({ error: 'Servidor no encontrado' });
    }
    
    // Obtener lista de baneados
    await guild.bans.fetch();
    const ban = guild.bans.cache.get(userId);
    
    if (!ban) {
      console.error(`[DISCORD UNBAN] Usuario no está baneado: ${userId}`);
      return res.status(404).json({ error: 'Usuario no está baneado' });
    }
    
    // Desbanear el usuario
    await guild.members.unban(userId, 'Desbaneado desde panel admin');
    
    console.log(`[DISCORD UNBAN] Usuario desbaneado exitosamente: ${userId}`);
    res.json({ 
      success: true, 
      message: `Usuario ${ban.user.username} (${userId}) desbaneado exitosamente.`,
      user: {
        id: ban.user.id,
        username: ban.user.username,
        discriminator: ban.user.discriminator
      }
    });
  } catch (err) {
    console.error('[DISCORD UNBAN] Error:', err);
    res.status(500).json({ 
      error: 'Error al desbanear usuario', 
      details: err.message,
      userId: req.body.userId
    });
  }
});

// Endpoint para kickear usuario
app.post('/api/discord/kick', express.json(), async (req, res) => {
  try {
    const guildId = process.env.DISCORD_GUILD_ID || '1212556680911650866';
    const { userId, reason } = req.body;
    
    console.log(`[DISCORD KICK] Intentando kickear usuario: ${userId}, motivo: ${reason}`);
    
    if (!userId) {
      return res.status(400).json({ error: 'Falta userId' });
    }
    
    if (!discordClient || !discordClient.readyAt) {
      return res.status(503).json({ error: 'Bot de Discord no disponible' });
    }
    
    const guild = discordClient.guilds.cache.get(guildId);
    if (!guild) {
      console.error(`[DISCORD KICK] Servidor no encontrado: ${guildId}`);
      return res.status(404).json({ error: 'Servidor no encontrado' });
    }
    
    // Buscar el usuario en el servidor
    await guild.members.fetch();
    const member = guild.members.cache.get(userId);
    
    if (!member) {
      console.error(`[DISCORD KICK] Usuario no encontrado en el servidor: ${userId}`);
      return res.status(404).json({ error: 'Usuario no encontrado en el servidor' });
    }
    
    // Kickear el usuario
    await member.kick(reason || 'Kickeado desde panel admin');
    
    console.log(`[DISCORD KICK] Usuario kickeado exitosamente: ${userId}`);
    res.json({ 
      success: true, 
      message: `Usuario ${member.user.username} (${userId}) kickeado exitosamente.`,
      user: {
        id: member.user.id,
        username: member.user.username,
        discriminator: member.user.discriminator
      }
    });
  } catch (err) {
    console.error('[DISCORD KICK] Error:', err);
    res.status(500).json({ 
      error: 'Error al kickear usuario', 
      details: err.message,
      userId: req.body.userId
    });
  }
});

// Endpoint para mutear usuario (requiere rol mute)
app.post('/api/discord/mute', express.json(), async (req, res) => {
  try {
    const guildId = process.env.DISCORD_GUILD_ID || '1212556680911650866';
    const { userId, time, reason } = req.body;
    
    console.log(`[DISCORD MUTE] Intentando mutear usuario: ${userId}, tiempo: ${time} minutos, motivo: ${reason}`);
    
    if (!userId) {
      return res.status(400).json({ error: 'Falta userId' });
    }
    
    if (!discordClient || !discordClient.readyAt) {
      return res.status(503).json({ error: 'Bot de Discord no disponible' });
    }
    
    const guild = discordClient.guilds.cache.get(guildId);
    if (!guild) {
      console.error(`[DISCORD MUTE] Servidor no encontrado: ${guildId}`);
      return res.status(404).json({ error: 'Servidor no encontrado' });
    }
    
    // Buscar el usuario en el servidor
    await guild.members.fetch();
    const member = guild.members.cache.get(userId);
    
    if (!member) {
      console.error(`[DISCORD MUTE] Usuario no encontrado en el servidor: ${userId}`);
      return res.status(404).json({ error: 'Usuario no encontrado en el servidor' });
    }

    // Buscar rol mute por nombre o ID
    let muteRoleId = process.env.DISCORD_MUTE_ROLE_ID;
    let muteRole = muteRoleId ? guild.roles.cache.get(muteRoleId) : guild.roles.cache.find(r => 
      r.name.toLowerCase().includes('mute') || 
      r.name.toLowerCase().includes('silenciado') ||
      r.name.toLowerCase() === 'muted'
    );

    // Si no existe, créalo
    if (!muteRole) {
      console.log(`[DISCORD MUTE] Creando rol de mute...`);
      muteRole = await guild.roles.create({
        name: 'Muted',
        color: '#888',
        reason: 'Rol para silenciar usuarios',
        permissions: []
      });
      muteRoleId = muteRole.id;
      
      // Configurar permisos en todos los canales
      for (const channel of guild.channels.cache.values()) {
        if (channel.type === 0 || channel.type === 2) { // 0: GUILD_TEXT, 2: GUILD_VOICE
          try {
          await channel.permissionOverwrites.edit(muteRole, {
            SendMessages: false,
            Speak: false,
            Connect: false,
            AddReactions: false
          });
          } catch (e) {
            console.warn(`[DISCORD MUTE] No se pudo configurar permisos en canal ${channel.name}:`, e.message);
          }
        }
      }
    } else {
      muteRoleId = muteRole.id;
    }

    // Verificar si ya está muteado
    if (member.roles.cache.has(muteRoleId)) {
      return res.status(400).json({ error: 'El usuario ya está muteado' });
    }

    // Aplicar mute
    await member.roles.add(muteRoleId, reason || 'Muteado desde panel admin');
    
    console.log(`[DISCORD MUTE] Usuario muteado exitosamente: ${userId}`);
    
    // Programar desmute si hay tiempo especificado
    let timeoutId = null;
    if (time && parseInt(time) > 0) {
      timeoutId = setTimeout(async () => {
        try {
          await member.roles.remove(muteRoleId, 'Desmute automático');
          console.log(`[DISCORD MUTE] Desmute automático para ${userId}`);
        } catch (e) {
          console.error('[DISCORD MUTE] Error en desmute automático:', e);
        }
    }, parseInt(time) * 60000);
    }

    res.json({ 
      success: true, 
      message: `Usuario ${member.user.username} (${userId}) muteado por ${time || 'indefinido'} minutos.`,
      user: {
        id: member.user.id,
        username: member.user.username,
        discriminator: member.user.discriminator
      },
      muteTime: time || 'indefinido',
      timeoutId: timeoutId ? 'programado' : null
    });
  } catch (err) {
    console.error('[DISCORD MUTE] Error:', err);
    res.status(500).json({ 
      error: 'Error al mutear usuario', 
      details: err.message,
      userId: req.body.userId
    });
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
    
    console.log(`[DISCORD BANNED] Obteniendo lista de baneados del servidor: ${guildId}`);
    
    if (!discordClient || !discordClient.readyAt) {
      return res.status(503).json({ error: 'Bot de Discord no disponible' });
    }
    
    const guild = discordClient.guilds.cache.get(guildId);
    if (!guild) {
      console.error(`[DISCORD BANNED] Servidor no encontrado: ${guildId}`);
      return res.status(404).json({ error: 'Servidor no encontrado' });
    }
    
    const bans = await guild.bans.fetch();
    const bannedUsers = Array.from(bans.values()).map(ban => ({
      id: ban.user.id,
      username: ban.user.username,
      discriminator: ban.user.discriminator,
      avatar: ban.user.displayAvatarURL(),
      reason: ban.reason || 'Sin motivo especificado',
      bannedAt: ban.createdAt || new Date()
    }));
    
    console.log(`[DISCORD BANNED] Encontrados ${bannedUsers.length} usuarios baneados`);
    
    res.json({ 
      success: true,
      count: bannedUsers.length,
      bans: bannedUsers,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error('[DISCORD BANNED] Error:', err);
    res.status(500).json({ 
      error: 'Error al obtener baneados', 
      details: err.message 
    });
  }
});

// Endpoint para acciones masivas
app.post('/api/discord/mass-action', express.json(), async (req, res) => {
  try {
    const guildId = process.env.DISCORD_GUILD_ID || '1212556680911650866';
    const { userIds, action, reason } = req.body;
    
    console.log(`[DISCORD MASS] Acción masiva: ${action} para ${userIds.length} usuarios`);
    
    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ error: 'Falta lista de userIds' });
    }
    
    if (!action || !['kick', 'ban', 'mute'].includes(action)) {
      return res.status(400).json({ error: 'Acción no válida. Usa: kick, ban, mute' });
    }
    
    if (!discordClient || !discordClient.readyAt) {
      return res.status(503).json({ error: 'Bot de Discord no disponible' });
    }
    
    const guild = discordClient.guilds.cache.get(guildId);
    if (!guild) {
      return res.status(404).json({ error: 'Servidor no encontrado' });
    }
    
    await guild.members.fetch();
    
    const results = [];
    const errors = [];
    
    for (const userId of userIds) {
      try {
        const member = guild.members.cache.get(userId);
        
        if (!member) {
          errors.push({ userId, error: 'Usuario no encontrado en el servidor' });
          continue;
        }
        
        switch (action) {
          case 'kick':
            await member.kick(reason || 'Acción masiva desde panel admin');
            results.push({ userId, username: member.user.username, action: 'kicked' });
            break;
            
          case 'ban':
            await member.ban({ 
              reason: reason || 'Acción masiva desde panel admin',
              deleteMessageDays: 7
            });
            results.push({ userId, username: member.user.username, action: 'banned' });
            break;
            
          case 'mute':
            // Buscar rol de mute
            let muteRole = guild.roles.cache.find(r => 
              r.name.toLowerCase().includes('mute') || 
              r.name.toLowerCase().includes('silenciado') ||
              r.name.toLowerCase() === 'muted'
            );
            
            if (!muteRole) {
              muteRole = await guild.roles.create({
                name: 'Muted',
                color: '#888',
                reason: 'Rol para silenciar usuarios',
                permissions: []
              });
            }
            
            if (!member.roles.cache.has(muteRole.id)) {
              await member.roles.add(muteRole.id, reason || 'Acción masiva desde panel admin');
              results.push({ userId, username: member.user.username, action: 'muted' });
            } else {
              errors.push({ userId, error: 'Usuario ya está muteado' });
            }
            break;
        }
      } catch (err) {
        console.error(`[DISCORD MASS] Error con usuario ${userId}:`, err);
        errors.push({ userId, error: err.message });
      }
    }
    
    console.log(`[DISCORD MASS] Completado: ${results.length} exitosos, ${errors.length} errores`);
    
    res.json({
      success: true,
      action,
      total: userIds.length,
      successful: results.length,
      failed: errors.length,
      results,
      errors,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error('[DISCORD MASS] Error:', err);
    res.status(500).json({ 
      error: 'Error en acción masiva', 
      details: err.message 
    });
  }
});

// Endpoint para logs de staff reales
app.get('/api/discord/logs', async (req, res) => {
  res.json({ logs: staffLogs.slice(-50).reverse() }); // últimos 50 logs, ordenados recientes primero
});

// ===== ENDPOINTS ESPECÍFICOS PARA ADMINPANEL =====

// Endpoint para moderación usando cliente Discord local
app.post('/api/admin/moderate', express.json(), async (req, res) => {
  try {
    const guildId = process.env.DISCORD_GUILD_ID || '1212556680911650866';
    const { action, userId, reason, time } = req.body;
    
    console.log(`[ADMIN MODERATE] Acción: ${action}, Usuario: ${userId}, Motivo: ${reason}`);
    
    if (!discordClient || !discordClient.readyAt) {
      return res.status(503).json({ error: 'Bot de Discord no disponible' });
    }
    
    const guild = discordClient.guilds.cache.get(guildId);
    if (!guild) {
      return res.status(404).json({ error: 'Servidor no encontrado' });
    }
    
    await guild.members.fetch();
    const member = guild.members.cache.get(userId);
    
    if (!member) {
      return res.status(404).json({ error: 'Usuario no encontrado en el servidor' });
    }
    
    let result;
    
    switch (action) {
      case 'ban':
        await member.ban({ 
          reason: reason || 'Baneado desde panel admin',
          deleteMessageDays: 7
        });
        result = `Usuario ${member.user.username} (${userId}) baneado exitosamente.`;
        break;
        
      case 'kick':
        await member.kick(reason || 'Kickeado desde panel admin');
        result = `Usuario ${member.user.username} (${userId}) kickeado exitosamente.`;
        break;
        
      case 'mute':
        // Buscar rol de mute
        let muteRole = guild.roles.cache.find(r => 
          r.name.toLowerCase().includes('mute') || 
          r.name.toLowerCase().includes('silenciado') ||
          r.name.toLowerCase() === 'muted'
        );
        
        if (!muteRole) {
          muteRole = await guild.roles.create({
            name: 'Muted',
            color: '#888',
            reason: 'Rol para silenciar usuarios',
            permissions: []
          });
          
          // Configurar permisos en todos los canales
          for (const channel of guild.channels.cache.values()) {
            if (channel.type === 0 || channel.type === 2) {
              try {
                await channel.permissionOverwrites.edit(muteRole, {
                  SendMessages: false,
                  Speak: false,
                  Connect: false,
                  AddReactions: false
                });
              } catch (e) {
                console.warn(`[ADMIN MODERATE] No se pudo configurar permisos en canal ${channel.name}:`, e.message);
              }
            }
          }
        }
        
        if (member.roles.cache.has(muteRole.id)) {
          return res.status(400).json({ error: 'El usuario ya está muteado' });
        }
        
        await member.roles.add(muteRole.id, reason || 'Muteado desde panel admin');
        
        // Programar desmute si hay tiempo especificado
        if (time && parseInt(time) > 0) {
          setTimeout(async () => {
            try {
              await member.roles.remove(muteRole.id, 'Desmute automático');
              console.log(`[ADMIN MODERATE] Desmute automático para ${userId}`);
            } catch (e) {
              console.error('[ADMIN MODERATE] Error en desmute automático:', e);
            }
          }, parseInt(time) * 60000);
        }
        
        result = `Usuario ${member.user.username} (${userId}) muteado exitosamente.`;
        break;
        
      case 'unban':
        await guild.members.unban(userId, reason || 'Desbaneado desde panel admin');
        result = `Usuario ${userId} desbaneado exitosamente.`;
        break;
        
      default:
        return res.status(400).json({ error: 'Acción no válida' });
    }
    
    // Registrar en logs
    staffLogs.push({
      action: action.charAt(0).toUpperCase() + action.slice(1),
      user: 'Admin Panel',
      target: member ? member.user.username : userId,
      reason: reason || 'Sin motivo especificado',
      timestamp: new Date().toISOString()
    });
    
    res.json({ 
      success: true, 
      message: result,
      user: member ? {
        id: member.user.id,
        username: member.user.username,
        discriminator: member.user.discriminator
      } : { id: userId }
    });
    
  } catch (err) {
    console.error('[ADMIN MODERATE] Error:', err);
    res.status(500).json({ 
      error: 'Error al ejecutar acción de moderación', 
      details: err.message 
    });
  }
});

// Endpoint para acciones masivas usando cliente Discord local
app.post('/api/admin/mass-action', express.json(), async (req, res) => {
  try {
    const guildId = process.env.DISCORD_GUILD_ID || '1212556680911650866';
    const { userIds, action, reason } = req.body;
    
    console.log(`[ADMIN MASS] Acción: ${action}, Usuarios: ${userIds.length}, Motivo: ${reason}`);
    
    if (!discordClient || !discordClient.readyAt) {
      return res.status(503).json({ error: 'Bot de Discord no disponible' });
    }
    
    const guild = discordClient.guilds.cache.get(guildId);
    if (!guild) {
      return res.status(404).json({ error: 'Servidor no encontrado' });
    }
    
    await guild.members.fetch();
    
    const results = [];
    const errors = [];
    
    for (const userId of userIds) {
      try {
        const member = guild.members.cache.get(userId);
        
        if (!member) {
          errors.push({ userId, error: 'Usuario no encontrado en el servidor' });
          continue;
        }
        
        switch (action) {
          case 'kick':
            await member.kick(reason || 'Acción masiva desde panel admin');
            results.push({ userId, username: member.user.username, action: 'kicked' });
            break;
            
          case 'ban':
            await member.ban({ 
              reason: reason || 'Acción masiva desde panel admin',
              deleteMessageDays: 7
            });
            results.push({ userId, username: member.user.username, action: 'banned' });
            break;
            
          case 'mute':
            let muteRole = guild.roles.cache.find(r => 
              r.name.toLowerCase().includes('mute') || 
              r.name.toLowerCase().includes('silenciado') ||
              r.name.toLowerCase() === 'muted'
            );
            
            if (!muteRole) {
              muteRole = await guild.roles.create({
                name: 'Muted',
                color: '#888',
                reason: 'Rol para silenciar usuarios',
                permissions: []
              });
            }
            
            if (!member.roles.cache.has(muteRole.id)) {
              await member.roles.add(muteRole.id, reason || 'Acción masiva desde panel admin');
              results.push({ userId, username: member.user.username, action: 'muted' });
            } else {
              errors.push({ userId, error: 'Usuario ya está muteado' });
            }
            break;
        }
      } catch (err) {
        console.error(`[ADMIN MASS] Error con usuario ${userId}:`, err);
        errors.push({ userId, error: err.message });
      }
    }
    
    // Registrar en logs
    staffLogs.push({
      action: `Mass ${action.charAt(0).toUpperCase() + action.slice(1)}`,
      user: 'Admin Panel',
      target: `${results.length} usuarios`,
      reason: reason || 'Acción masiva',
      timestamp: new Date().toISOString()
    });
    
    res.json({
      success: true,
      message: `Acción masiva completada: ${results.length} exitosos, ${errors.length} errores`,
      results: results,
      errors: errors,
      total: userIds.length,
      successful: results.length,
      failed: errors.length
    });
    
  } catch (err) {
    console.error('[ADMIN MASS] Error:', err);
    res.status(500).json({ 
      error: 'Error en acción masiva', 
      details: err.message 
    });
  }
});

// Endpoint para gestión de roles usando cliente Discord local
app.post('/api/admin/role', express.json(), async (req, res) => {
  try {
    const guildId = process.env.DISCORD_GUILD_ID || '1212556680911650866';
    const { userId, roleId, action, time } = req.body;
    
    console.log(`[ADMIN ROLE] Usuario: ${userId}, Rol: ${roleId}, Acción: ${action}`);
    
    if (!discordClient || !discordClient.readyAt) {
      return res.status(503).json({ error: 'Bot de Discord no disponible' });
    }
    
    const guild = discordClient.guilds.cache.get(guildId);
    if (!guild) {
      return res.status(404).json({ error: 'Servidor no encontrado' });
    }
    
    await guild.members.fetch();
    const member = guild.members.cache.get(userId);
    
    if (!member) {
      return res.status(404).json({ error: 'Usuario no encontrado en el servidor' });
    }
    
    const role = guild.roles.cache.get(roleId);
    if (!role) {
      return res.status(404).json({ error: 'Rol no encontrado' });
    }
    
    let result;
    
    if (action === 'add') {
      if (member.roles.cache.has(roleId)) {
        return res.status(400).json({ error: 'El usuario ya tiene este rol' });
      }
      await member.roles.add(roleId);
      result = `Rol ${role.name} añadido a ${member.user.username}`;
    } else if (action === 'remove') {
      if (!member.roles.cache.has(roleId)) {
        return res.status(400).json({ error: 'El usuario no tiene este rol' });
      }
      await member.roles.remove(roleId);
      result = `Rol ${role.name} removido de ${member.user.username}`;
    } else {
      return res.status(400).json({ error: 'Acción no válida' });
    }
    
    // Programar remoción automática si es rol temporal
    if (time && parseInt(time) > 0 && action === 'add') {
      setTimeout(async () => {
        try {
          await member.roles.remove(roleId, 'Remoción automática de rol temporal');
          console.log(`[ADMIN ROLE] Remoción automática de rol ${roleId} para ${userId}`);
        } catch (e) {
          console.error('[ADMIN ROLE] Error en remoción automática:', e);
        }
      }, parseInt(time) * 60000);
    }
    
    // Registrar en logs
    staffLogs.push({
      action: `Role ${action.charAt(0).toUpperCase() + action.slice(1)}`,
      user: 'Admin Panel',
      target: `${member.user.username} - ${role.name}`,
      reason: time ? `Temporal (${time} min)` : 'Manual',
      timestamp: new Date().toISOString()
    });
    
    res.json({ 
      success: true, 
      message: result,
      user: {
        id: member.user.id,
        username: member.user.username,
        discriminator: member.user.discriminator
      },
      role: {
        id: role.id,
        name: role.name
      }
    });
    
  } catch (err) {
    console.error('[ADMIN ROLE] Error:', err);
    res.status(500).json({ 
      error: 'Error al gestionar rol', 
      details: err.message 
    });
  }
});

// Endpoint para roles múltiples usando cliente Discord local
app.post('/api/admin/multi-role', express.json(), async (req, res) => {
  try {
    const guildId = process.env.DISCORD_GUILD_ID || '1212556680911650866';
    const { userId, roleIds, action } = req.body;
    
    console.log(`[ADMIN MULTI-ROLE] Usuario: ${userId}, Roles: ${roleIds.length}, Acción: ${action}`);
    
    if (!discordClient || !discordClient.readyAt) {
      return res.status(503).json({ error: 'Bot de Discord no disponible' });
    }
    
    const guild = discordClient.guilds.cache.get(guildId);
    if (!guild) {
      return res.status(404).json({ error: 'Servidor no encontrado' });
    }
    
    await guild.members.fetch();
    const member = guild.members.cache.get(userId);
    
    if (!member) {
      return res.status(404).json({ error: 'Usuario no encontrado en el servidor' });
    }
    
    const results = [];
    const errors = [];
    
    for (const roleId of roleIds) {
      try {
        const role = guild.roles.cache.get(roleId);
        if (!role) {
          errors.push({ roleId, error: 'Rol no encontrado' });
          continue;
        }
        
        if (action === 'add') {
          if (!member.roles.cache.has(roleId)) {
            await member.roles.add(roleId);
            results.push({ roleId, roleName: role.name, action: 'added' });
          } else {
            errors.push({ roleId, error: 'Usuario ya tiene este rol' });
          }
        } else if (action === 'remove') {
          if (member.roles.cache.has(roleId)) {
            await member.roles.remove(roleId);
            results.push({ roleId, roleName: role.name, action: 'removed' });
          } else {
            errors.push({ roleId, error: 'Usuario no tiene este rol' });
          }
        }
      } catch (err) {
        console.error(`[ADMIN MULTI-ROLE] Error con rol ${roleId}:`, err);
        errors.push({ roleId, error: err.message });
      }
    }
    
    // Registrar en logs
    staffLogs.push({
      action: `Multi-Role ${action.charAt(0).toUpperCase() + action.slice(1)}`,
      user: 'Admin Panel',
      target: `${member.user.username} - ${results.length} roles`,
      reason: `${results.length} exitosos, ${errors.length} errores`,
      timestamp: new Date().toISOString()
    });
    
    res.json({
      success: true,
      message: `Gestión de roles múltiples completada: ${results.length} exitosos, ${errors.length} errores`,
      results: results,
      errors: errors,
      total: roleIds.length,
      successful: results.length,
      failed: errors.length
    });
    
  } catch (err) {
    console.error('[ADMIN MULTI-ROLE] Error:', err);
    res.status(500).json({ 
      error: 'Error en gestión de roles múltiples', 
      details: err.message 
    });
  }
});

// ===== ENDPOINTS DE CALENDARIO =====
// Verificar y crear tablas del calendario si no existen
app.get('/api/calendar/init', async (req, res) => {
  try {
    const { runQuery } = require('./db/database');
    
    // Crear tabla calendar_claims si no existe
    await runQuery(`
      CREATE TABLE IF NOT EXISTS calendar_claims (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId TEXT NOT NULL,
        year INTEGER NOT NULL,
        month INTEGER NOT NULL,
        day INTEGER NOT NULL,
        claimedAt TEXT NOT NULL,
        reward TEXT,
        UNIQUE(userId, year, month, day)
      )
    `);
    
    // Crear tabla calendar_streaks si no existe
    await runQuery(`
      CREATE TABLE IF NOT EXISTS calendar_streaks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId TEXT UNIQUE NOT NULL,
        currentStreak INTEGER DEFAULT 0,
        longestStreak INTEGER DEFAULT 0,
        lastClaimedDate TEXT,
        totalClaims INTEGER DEFAULT 0
      )
    `);
    
    res.json({ success: true, message: 'Tablas del calendario inicializadas correctamente' });
  } catch (err) {
    console.error('[CALENDAR INIT] Error:', err);
    res.status(500).json({ error: 'Error inicializando tablas del calendario' });
  }
});
// Obtener progreso del calendario
app.get('/api/calendar', verifyToken, async (req, res) => {
  try {
    const { year, month } = req.query;
    const userId = req.user?.id;
    
    if (!year || !month) {
      return res.status(400).json({ error: 'Año y mes son requeridos' });
    }

    const { getQuery, allQuery } = require('./db/database');
    
    // Obtener días reclamados del mes
    const claimedDaysQuery = `
      SELECT day FROM calendar_claims 
      WHERE userId = ? AND year = ? AND month = ?
      ORDER BY day ASC
    `;
    const claimedDaysRows = await allQuery(claimedDaysQuery, [userId, parseInt(year), parseInt(month)]);
    const claimedDays = claimedDaysRows.map(row => row.day);
    
    // Obtener información de racha
    const streakQuery = `
      SELECT currentStreak, longestStreak, totalClaims, lastClaimedDate 
      FROM calendar_streaks 
      WHERE userId = ?
    `;
    const streakData = await getQuery(streakQuery, [userId]);
    
    const currentStreak = streakData ? streakData.currentStreak : 0;
    const longestStreak = streakData ? streakData.longestStreak : 0;
    const totalClaims = streakData ? streakData.totalClaims : 0;
    
    // Calcular progreso del mes
    const daysInMonth = new Date(parseInt(year), parseInt(month), 0).getDate();
    const progress = Math.round((claimedDays.length / daysInMonth) * 100);
    
    res.json({
      success: true,
      claimedDays,
      streak: currentStreak,
      longestStreak,
      totalClaims,
      progress
    });
  } catch (err) {
    console.error('[CALENDAR] Error obteniendo progreso:', err);
    res.status(500).json({ error: 'Error obteniendo progreso del calendario' });
  }
});

// Reclamar día del calendario
app.post('/api/calendar/claim', verifyToken, async (req, res) => {
  try {
    const { year, month, day } = req.body;
    const userId = req.user?.id;
    
    console.log('[CALENDAR] Request body:', { year, month, day });
    console.log('[CALENDAR] User from JWT:', req.user);
    console.log('[CALENDAR] Extracted userId:', userId);
    
    if (!year || !month || !day) {
      return res.status(400).json({ error: 'Año, mes y día son requeridos' });
    }
    
    if (!userId) {
      console.error('[CALENDAR] Error: userId is undefined');
      return res.status(401).json({ error: 'Usuario no autenticado correctamente' });
    }

    const { getQuery, runQuery, allQuery } = require('./db/database');

// === SISTEMA DE BANS Y TRACKING ===
const ADMIN_USER_ID = '710112055985963090';


    
    // Verificar si el día ya fue reclamado
    const existingClaim = await getQuery(
      'SELECT id FROM calendar_claims WHERE userId = ? AND year = ? AND month = ? AND day = ?',
      [userId, parseInt(year), parseInt(month), parseInt(day)]
    );
    
    if (existingClaim) {
      return res.status(400).json({ error: 'Este día ya fue reclamado' });
    }
    
    // Verificar que sea el día actual
    const today = new Date();
    const isToday = today.getFullYear() === parseInt(year) && 
                   today.getMonth() + 1 === parseInt(month) && 
                   today.getDate() === parseInt(day);
    
    if (!isToday) {
      return res.status(400).json({ error: 'Solo puedes reclamar el día actual' });
    }
    
    const claimedAt = new Date().toISOString();
    
    // Generar recompensa aleatoria
    const rewards = [
      'Monedas extra',
      'Badge especial',
      'Acceso VIP',
      'Rol Discord',
      'Minijuego desbloqueado',
      'Sorteo mensual',
      'Multiplicador de XP',
      'Caja misteriosa'
    ];
    const reward = rewards[Math.floor(Math.random() * rewards.length)];
    
    // Insertar reclamación
    console.log('[CALENDAR] Insertando reclamación:', { userId, year: parseInt(year), month: parseInt(month), day: parseInt(day), claimedAt, reward });
    await runQuery(
      'INSERT INTO calendar_claims (userId, year, month, day, claimedAt, reward) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, parseInt(year), parseInt(month), parseInt(day), claimedAt, reward]
    );
    
    // Actualizar o crear racha
    const streakData = await getQuery(
      'SELECT * FROM calendar_streaks WHERE userId = ?',
      [userId]
    );
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    const todayStr = today.toISOString().split('T')[0];
    
    let newStreak = 1;
    let newLongestStreak = 1;
    let newTotalClaims = 1;
    
    if (streakData) {
      newTotalClaims = streakData.totalClaims + 1;
      
      // Verificar si la racha continúa
      if (streakData.lastClaimedDate === yesterdayStr) {
        newStreak = streakData.currentStreak + 1;
        newLongestStreak = Math.max(streakData.longestStreak, newStreak);
      } else if (streakData.lastClaimedDate !== todayStr) {
        newStreak = 1; // Racha rota
        newLongestStreak = streakData.longestStreak;
      } else {
        newStreak = streakData.currentStreak;
        newLongestStreak = streakData.longestStreak;
      }
      
      await runQuery(
        'UPDATE calendar_streaks SET currentStreak = ?, longestStreak = ?, lastClaimedDate = ?, totalClaims = ? WHERE userId = ?',
        [newStreak, newLongestStreak, todayStr, newTotalClaims, userId]
      );
    } else {
      await runQuery(
        'INSERT INTO calendar_streaks (userId, currentStreak, longestStreak, lastClaimedDate, totalClaims) VALUES (?, ?, ?, ?, ?)',
        [userId, newStreak, newLongestStreak, todayStr, newTotalClaims]
      );
    }
    
    // Obtener días reclamados actualizados
    const claimedDaysQuery = `
      SELECT day FROM calendar_claims 
      WHERE userId = ? AND year = ? AND month = ?
      ORDER BY day ASC
    `;
    const claimedDaysRows = await allQuery(claimedDaysQuery, [userId, parseInt(year), parseInt(month)]);
    const claimedDays = claimedDaysRows.map(row => row.day);
    
    // Calcular progreso actualizado
    const daysInMonth = new Date(parseInt(year), parseInt(month), 0).getDate();
    const progress = Math.round((claimedDays.length / daysInMonth) * 100);
    
    res.json({
      success: true,
      claimedDays,
      streak: newStreak,
      longestStreak: newLongestStreak,
      totalClaims: newTotalClaims,
      progress,
      reward,
      message: `¡Día reclamado! Recompensa: ${reward}`
    });
  } catch (err) {
    console.error('[CALENDAR] Error reclamando día:', err);
    res.status(500).json({ error: 'Error reclamando día del calendario' });
  }
});

// ===== ENDPOINTS MDT POLICIAL =====

// Verificar si usuario tiene rol de policía
app.get('/api/discord/rolecheck/:userId/:roleId', async (req, res) => {
  try {
    const { userId, roleId } = req.params;
    
    if (!discordClient || !discordClient.readyAt) {
      return res.status(503).json({ error: 'Bot de Discord no disponible' });
    }
    
    const guildId = process.env.DISCORD_GUILD_ID || '1212556680911650866';
    const guild = discordClient.guilds.cache.get(guildId);
    
    if (!guild) {
      return res.status(404).json({ error: 'Servidor no encontrado' });
    }
    
    await guild.members.fetch();
    const member = guild.members.cache.get(userId);
    
    if (!member) {
      return res.json({ hasRole: false });
    }
    
    const hasRole = member.roles.cache.has(roleId);
    res.json({ hasRole });
    
  } catch (err) {
    console.error('[MDT] Error verificando rol:', err);
    res.status(500).json({ error: 'Error verificando rol' });
  }
});

// Proxy para MDT Policial - Ver antecedentes por Discord ID
app.get('/api/proxy/admin/antecedentes/:discordId', async (req, res) => {
  try {
    const { discordId } = req.params;
    const proxyUrl = `http://37.27.21.91:5021/api/proxy/admin/antecedentes/${discordId}`;
    
    const response = await fetch(proxyUrl);
    const data = await response.json();
    
    res.json(data);
  } catch (err) {
    console.error('[MDT PROXY] Error obteniendo antecedentes:', err);
    res.status(500).json({ error: 'Error obteniendo antecedentes' });
  }
});

// Proxy para MDT Policial - Ver antecedentes por DNI
app.get('/api/proxy/admin/antecedentes/dni/:dni', async (req, res) => {
  try {
    const { dni } = req.params;
    const proxyUrl = `http://37.27.21.91:5021/api/proxy/admin/antecedentes/dni/${dni}`;
    
    const response = await fetch(proxyUrl);
    const data = await response.json();
    
    res.json(data);
  } catch (err) {
    console.error('[MDT PROXY] Error obteniendo antecedentes por DNI:', err);
    res.status(500).json({ error: 'Error obteniendo antecedentes por DNI' });
  }
});

// Proxy para MDT Policial - Ver datos de DNI por Discord ID
app.get('/api/proxy/admin/dni/ver/:discordId', async (req, res) => {
  try {
    const { discordId } = req.params;
    const proxyUrl = `http://37.27.21.91:5021/api/proxy/admin/dni/ver/${discordId}`;
    
    const response = await fetch(proxyUrl);
    const data = await response.json();
    
    // Si tenemos datos del DNI, obtener la foto de Roblox
    if (data.success && data.dni && data.dni.robloxId) {
      try {
        const robloxResponse = await fetch(`https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${data.dni.robloxId}&size=150x150&format=Png&isCircular=false`);
        const robloxData = await robloxResponse.json();
        
        if (robloxData.data && robloxData.data[0] && robloxData.data[0].imageUrl) {
          data.dni.robloxAvatar = robloxData.data[0].imageUrl;
        }
      } catch (robloxErr) {
        console.warn('[MDT PROXY] Error obteniendo avatar de Roblox:', robloxErr.message);
        // Continuar sin la foto si hay error
      }
    }
    
    res.json(data);
  } catch (err) {
    console.error('[MDT PROXY] Error obteniendo DNI:', err);
    res.status(500).json({ error: 'Error obteniendo DNI' });
  }
});

// Proxy para MDT Policial - Marcar DNI como arrestado
app.post('/api/proxy/admin/dni/arrestar/:discordId', async (req, res) => {
  try {
    const { discordId } = req.params;
    const proxyUrl = `http://37.27.21.91:5021/api/proxy/admin/dni/arrestar/${discordId}`;
    
    const response = await fetch(proxyUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    const data = await response.json();
    
    res.json(data);
  } catch (err) {
    console.error('[MDT PROXY] Error arrestando:', err);
    res.status(500).json({ error: 'Error arrestando' });
  }
});

// Proxy para MDT Policial - Ver inventario de usuario
app.get('/api/proxy/admin/inventario/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const proxyUrl = `http://37.27.21.91:5021/api/proxy/admin/inventario/${userId}`;
    
    const response = await fetch(proxyUrl);
    const data = await response.json();
    
    res.json(data);
  } catch (err) {
    console.error('[MDT PROXY] Error obteniendo inventario:', err);
    res.status(500).json({ error: 'Error obteniendo inventario' });
  }
});

// Proxy para MDT Policial - Poner multa
app.post('/api/proxy/admin/multar', express.json(), async (req, res) => {
  try {
    const proxyUrl = 'http://37.27.21.91:5021/api/proxy/admin/multar';
    
    const response = await fetch(proxyUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body)
    });
    const data = await response.json();
    
    res.json(data);
  } catch (err) {
    console.error('[MDT PROXY] Error multando:', err);
    res.status(500).json({ error: 'Error multando' });
  }
});

// Proxy para MDT Policial - Pagar multa
app.post('/api/proxy/admin/pagar-multa', express.json(), async (req, res) => {
  try {
    const proxyUrl = 'http://37.27.21.91:5021/api/proxy/admin/pagar-multa';
    
    // Mapear userId a discordId si es necesario
    const body = { ...req.body };
    if (body.userId && !body.discordId) {
      body.discordId = body.userId;
      delete body.userId;
    }
    
    console.log('[MDT PROXY] Pagando multa:', body);
    
    const response = await fetch(proxyUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const data = await response.json();
    
    res.json(data);
  } catch (err) {
    console.error('[MDT PROXY] Error pagando multa:', err);
    res.status(500).json({ error: 'Error pagando multa' });
  }
});

// Proxy para MDT Policial - Arresto completo con cargos
app.post('/api/proxy/admin/arrestar', express.json(), async (req, res) => {
  try {
    const proxyUrl = 'http://37.27.21.91:5021/api/proxy/admin/arrestar';
    
    console.log('[MDT PROXY] Realizando arresto:', req.body);
    
    const response = await fetch(proxyUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body)
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('[MDT PROXY] Arresto exitoso:', data);
    } else {
      console.error('[MDT PROXY] Error en arresto:', data);
    }
    
    res.json(data);
  } catch (err) {
    console.error('[MDT PROXY] Error realizando arresto:', err);
    res.status(500).json({ 
      success: false, 
      error: 'Error de conexión realizando arresto',
      details: err.message 
    });
  }
});

// Proxy para MDT Policial - Eliminar multa
app.delete('/api/proxy/admin/borrar-multa', express.json(), async (req, res) => {
  try {
    const proxyUrl = 'http://37.27.21.91:5021/api/proxy/admin/borrar-multa';
    
    const response = await fetch(proxyUrl, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body)
    });
    const data = await response.json();
    
    res.json(data);
  } catch (err) {
    console.error('[MDT PROXY] Error eliminando multa:', err);
    res.status(500).json({ error: 'Error eliminando multa' });
  }
});

// Proxy para MDT Policial - Ver multas de usuario
app.get('/api/proxy/admin/ver-multas/:discordId', async (req, res) => {
  try {
    const { discordId } = req.params;
    const proxyUrl = `http://37.27.21.91:5021/api/proxy/admin/ver-multas/${discordId}`;
    
    const response = await fetch(proxyUrl);
    const data = await response.json();
    
    res.json(data);
  } catch (err) {
    console.error('[MDT PROXY] Error obteniendo multas:', err);
    res.status(500).json({ error: 'Error obteniendo multas' });
  }
});

// Proxy para MDT Policial - Ranking de multas
app.get('/api/proxy/admin/top-multas', async (req, res) => {
  try {
    const proxyUrl = 'http://37.27.21.91:5021/api/proxy/admin/top-multas';
    
    const response = await fetch(proxyUrl);
    
    // Verificar si la respuesta es HTML (error)
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('text/html')) {
      console.warn('[MDT PROXY] El servidor proxy devolvió HTML en lugar de JSON');
      return res.json({ 
        success: true, 
        top: [],
        message: 'Ranking no disponible temporalmente'
      });
    }
    
    const data = await response.json();
    
    // Si tenemos datos del ranking, obtener información de Discord para cada usuario
    if (data.success && data.top && Array.isArray(data.top)) {
      try {
        const enrichedTop = await Promise.all(data.top.map(async (user, index) => {
          try {
            // Obtener información del usuario de Discord
            const guild = discordClient.guilds.cache.get(process.env.DISCORD_GUILD_ID);
            if (guild) {
              await guild.members.fetch();
              const member = guild.members.cache.get(user.discordId);
              
              if (member) {
                return {
                  ...user,
                  position: index + 1,
                  username: member.user.username,
                  discriminator: member.user.discriminator,
                  avatar: member.user.avatar,
                  displayAvatarURL: member.user.displayAvatarURL({ size: 64 }),
                  totalMultas: user.total || user.totalMultas || 0,
                  totalCantidad: user.totalCantidad || 0
                };
              }
            }
            
            // Si no se encuentra en Discord, usar datos básicos
            return {
              ...user,
              position: index + 1,
              username: `Usuario ${user.discordId.slice(-4)}`,
              discriminator: '0000',
              avatar: null,
              displayAvatarURL: null,
              totalMultas: user.total || user.totalMultas || 0,
              totalCantidad: user.totalCantidad || 0
            };
          } catch (memberErr) {
            console.warn(`[MDT PROXY] Error obteniendo info de Discord para ${user.discordId}:`, memberErr.message);
            return {
              ...user,
              position: index + 1,
              username: `Usuario ${user.discordId.slice(-4)}`,
              discriminator: '0000',
              avatar: null,
              displayAvatarURL: null,
              totalMultas: user.total || user.totalMultas || 0,
              totalCantidad: user.totalCantidad || 0
            };
          }
        }));
        
        data.top = enrichedTop;
      } catch (enrichErr) {
        console.warn('[MDT PROXY] Error enriqueciendo datos del ranking:', enrichErr.message);
        // Continuar con los datos originales si hay error
      }
    }
    
    res.json(data);
  } catch (err) {
    console.error('[MDT PROXY] Error obteniendo ranking:', err);
    // Devolver respuesta de respaldo en lugar de error
    res.json({ 
      success: true, 
      top: [],
      message: 'Ranking no disponible temporalmente',
      error: err.message
    });
  }
});

// Proxy para MDT Policial - Búsqueda de ciudadanos por nombre/DNI
app.get('/api/proxy/admin/dni/search', async (req, res) => {
  try {
    const query = req.query.q;
    if (!query || query.trim().length < 2) {
      return res.status(400).json({ error: 'Parámetro q requerido (mínimo 2 caracteres)' });
    }

    const proxyUrl = `http://37.27.21.91:5021/api/proxy/admin/dni/search?q=${encodeURIComponent(query)}`;
    
    console.log('[MDT PROXY] Buscando ciudadanos:', query);
    
    const response = await fetch(proxyUrl);
    
    // Verificar si la respuesta es HTML (error)
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('text/html')) {
      console.warn('[MDT PROXY] El servidor proxy devolvió HTML en lugar de JSON');
      return res.json({ 
        success: true, 
        query: query,
        dniPorNombre: [],
        discordUsers: [],
        message: 'Búsqueda no disponible temporalmente'
      });
    }
    
    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error('[MDT PROXY] Error buscando ciudadanos:', err);
    // Devolver respuesta de respaldo en lugar de error
    res.json({ 
      success: true, 
      query: req.query.q || '',
      dniPorNombre: [],
      discordUsers: [],
      message: 'Error de conexión en la búsqueda',
      error: err.message
    });
  }
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
    console.log(`[ADMIN PROXY] ===== INICIO SETBALANCE =====`);
    console.log(`[ADMIN PROXY] Raw body:`, req.body);
    console.log(`[ADMIN PROXY] Body type:`, typeof req.body);
    console.log(`[ADMIN PROXY] Body keys:`, Object.keys(req.body || {}));
    
    const { targetUserId, userId, cash, bank, adminUserId } = req.body;
    const actualTargetUserId = targetUserId || userId;
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
    
    const botRequestData = { userId: targetUserId, cash, bank };
    console.log(`[ADMIN PROXY] Datos enviados al bot:`, botRequestData);
    
    const response = await fetch(botUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(botRequestData)
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
// === ENDPOINTS DE GESTIÓN DE BANS (SOLO ADMIN EXCLUSIVO) ===

// Middleware que acepta tanto sesión Passport como JWT token
function ensureAuthOrJWT(req, res, next) {
  // Primero intentar con sesión de Passport
  if (req.isAuthenticated && req.isAuthenticated() && req.user) {
    return next();
  }
  
  // Si no hay sesión, intentar con JWT token
  verifyToken(req, res, (err) => {
    if (err) {
      return res.status(401).json({ error: 'No autenticado' });
    }
    next();
  });
}

// Middleware para verificar que es el admin exclusivo
function ensureExclusiveAdmin(req, res, next) {
  const ADMIN_USER_ID = '710112055985963090';
  if (!req.user || req.user.id !== ADMIN_USER_ID) {
    return res.status(403).json({
      error: 'Forbidden',
      message: 'Solo el administrador principal puede acceder a esta función.'
    });
  }
  next();
}

// Limpiar bans expirados manualmente
app.post('/api/admin/ban/cleanup', ensureAuthOrJWT, ensureExclusiveAdmin, async (req, res) => {
  try {
    await cleanupExpiredBans();
    res.json({ success: true, message: 'Bans expirados limpiados correctamente' });
  } catch (error) {
    console.error('[BAN CLEANUP] Error:', error);
    res.status(500).json({ error: 'Error limpiando bans expirados' });
  }
});

// Obtener todas las IPs trackeadas
app.get('/api/admin/ban/ips', ensureAuthOrJWT, ensureExclusiveAdmin, async (req, res) => {
  try {
    const { getQuery, allQuery } = require('./db/database');
    const { page = 1, limit = 50, active = 'true' } = req.query;
    const offset = (page - 1) * limit;
    
    console.log('[BAN ADMIN] Obteniendo IPs - Parámetros:', { page, limit, active, offset });
    
    let query = 'SELECT * FROM ip_tracking';
    let params = [];
    
    if (active === 'true') {
      query += ' WHERE isActive = 1';
    }
    
    query += ' ORDER BY lastSeen DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));
    
    console.log('[BAN ADMIN] Query SQL:', query);
    console.log('[BAN ADMIN] Parámetros:', params);
    
    const ips = await allQuery(query, params);
    console.log('[BAN ADMIN] IPs encontradas:', ips.length);
    
    // Obtener total de IPs
    const totalQuery = active === 'true' ? 
      'SELECT COUNT(*) as total FROM ip_tracking WHERE isActive = 1' :
      'SELECT COUNT(*) as total FROM ip_tracking';
    const totalResult = await getQuery(totalQuery);
    
    res.json({
      ips,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalResult.total,
        pages: Math.ceil(totalResult.total / limit)
      }
    });
  } catch (error) {
    console.error('[BAN ADMIN] Error obteniendo IPs:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Obtener todos los bans
app.get('/api/admin/ban/bans', ensureAuthOrJWT, ensureExclusiveAdmin, async (req, res) => {
  try {
    const { allQuery } = require('./db/database');
    const { type, active = 'true' } = req.query;
    
    let query = 'SELECT * FROM web_bans';
    let params = [];
    
    const conditions = [];
    if (active === 'true') {
      conditions.push('isActive = 1');
    }
    if (type) {
      conditions.push('type = ?');
      params.push(type);
    }
    
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    
    query += ' ORDER BY bannedAt DESC';
    
    const bans = await allQuery(query, params);
    res.json(bans);
  } catch (error) {
    console.error('[BAN ADMIN] Error obteniendo bans:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Banear IP
app.post('/api/admin/ban/ip', ensureAuthOrJWT, ensureExclusiveAdmin, express.json(), async (req, res) => {
  try {
    const { getQuery, runQuery } = require('./db/database');
    const { ip, reason, expiresAt } = req.body;
    
    if (!ip) {
      return res.status(400).json({ error: 'IP es requerida' });
    }
    
    // Obtener la IP del administrador actual
    const adminIP = getRealIP(req);
    
    // Verificar que no se esté baneando a sí mismo
    if (ip === adminIP) {
      console.log(`[BAN ADMIN] Intento de auto-ban bloqueado: ${req.user.id} intentó banear su propia IP ${adminIP}`);
      return res.status(400).json({ 
        error: 'No puedes banearte a ti mismo',
        message: 'No puedes banear tu propia IP. Esto te bloquearía el acceso al panel de administración.'
      });
    }
    
    const now = new Date().toISOString();
    
    // Verificar si ya está baneada
    const existing = await getQuery(
      'SELECT id FROM web_bans WHERE type = ? AND value = ?',
      ['ip', ip]
    );
    
    if (existing) {
      // Reactivar ban existente
      await runQuery(
        'UPDATE web_bans SET isActive = 1, reason = ?, bannedBy = ?, bannedAt = ?, expiresAt = ? WHERE type = ? AND value = ?',
        [reason, req.user.id, now, expiresAt || null, 'ip', ip]
      );
    } else {
      // Crear nuevo ban
      await runQuery(
        'INSERT INTO web_bans (type, value, reason, bannedBy, bannedAt, expiresAt, isActive) VALUES (?, ?, ?, ?, ?, ?, 1)',
        ['ip', ip, reason, req.user.id, now, expiresAt || null]
      );
    }
    
    console.log(`[BAN ADMIN] IP ${ip} banned by ${req.user.id}: ${reason}`);
    
    // Intentar enviar notificación DM si hay un usuario asociado a esta IP
    try {
      const { getQuery } = require('./db/database');
      const ipData = await getQuery(
        'SELECT userId FROM ip_tracking WHERE ip = ? AND userId IS NOT NULL ORDER BY lastSeen DESC LIMIT 1',
        [ip]
      );
      
      if (ipData && ipData.userId) {
        await sendBanNotification(ipData.userId, 'ip', reason, expiresAt, req.user.id);
      } else {
        console.log(`[BAN ADMIN] No se encontró usuario asociado a la IP ${ip} para enviar DM`);
      }
    } catch (dmError) {
      console.error('[BAN ADMIN] Error enviando DM para IP ban:', dmError);
      // No fallar el ban si no se puede enviar el DM
    }
    
    res.json({ success: true, message: 'IP baneada correctamente' });
  } catch (error) {
    console.error('[BAN ADMIN] Error baneando IP:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Banear usuario de Discord
app.post('/api/admin/ban/discord', ensureAuthOrJWT, ensureExclusiveAdmin, express.json(), async (req, res) => {
  try {
    const { getQuery, runQuery } = require('./db/database');
    const { userId, reason, expiresAt } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID es requerido' });
    }
    
    // Verificar que no se esté baneando a sí mismo
    if (userId === req.user.id) {
      console.log(`[BAN ADMIN] Intento de auto-ban bloqueado: ${req.user.id} intentó banear su propia cuenta de Discord`);
      return res.status(400).json({ 
        error: 'No puedes banearte a ti mismo',
        message: 'No puedes banear tu propia cuenta de Discord. Esto te bloquearía el acceso al panel de administración.'
      });
    }
    
    const now = new Date().toISOString();
    
    // Verificar si ya está baneado
    const existing = await getQuery(
      'SELECT id FROM web_bans WHERE type = ? AND value = ?',
      ['discord', userId]
    );
    
    if (existing) {
      // Reactivar ban existente
      await runQuery(
        'UPDATE web_bans SET isActive = 1, reason = ?, bannedBy = ?, bannedAt = ?, expiresAt = ? WHERE type = ? AND value = ?',
        [reason, req.user.id, now, expiresAt || null, 'discord', userId]
      );
    } else {
      // Crear nuevo ban
      await runQuery(
        'INSERT INTO web_bans (type, value, reason, bannedBy, bannedAt, expiresAt, isActive) VALUES (?, ?, ?, ?, ?, ?, 1)',
        ['discord', userId, reason, req.user.id, now, expiresAt || null]
      );
    }
    
    console.log(`[BAN ADMIN] Discord user ${userId} banned by ${req.user.id}: ${reason}`);
    
    // Enviar notificación DM al usuario baneado
    try {
      await sendBanNotification(userId, 'discord', reason, expiresAt, req.user.id);
    } catch (dmError) {
      console.error('[BAN ADMIN] Error enviando DM:', dmError);
      // No fallar el ban si no se puede enviar el DM
    }
    
    res.json({ success: true, message: 'Usuario de Discord baneado correctamente' });
  } catch (error) {
    console.error('[BAN ADMIN] Error baneando usuario Discord:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Desbanear IP o usuario
app.delete('/api/admin/ban/:type/:value', ensureAuthOrJWT, ensureExclusiveAdmin, async (req, res) => {
  try {
    const { runQuery } = require('./db/database');
    const { type, value } = req.params;
    
    if (!['ip', 'discord'].includes(type)) {
      return res.status(400).json({ error: 'Tipo de ban inválido' });
    }
    
    await runQuery(
      'UPDATE web_bans SET isActive = 0 WHERE type = ? AND value = ?',
      [type, value]
    );
    
    console.log(`[BAN ADMIN] ${type} ${value} unbanned by ${req.user.id}`);
    
    // Enviar notificación DM si es un ban de Discord o si hay usuario asociado a la IP
    try {
      if (type === 'discord') {
        await sendUnbanNotification(value, 'discord', req.user.id);
      } else if (type === 'ip') {
        // Buscar usuario asociado a la IP
        const { getQuery } = require('./db/database');
        const ipData = await getQuery(
          'SELECT userId FROM ip_tracking WHERE ip = ? AND userId IS NOT NULL ORDER BY lastSeen DESC LIMIT 1',
          [value]
        );
        
        if (ipData && ipData.userId) {
          await sendUnbanNotification(ipData.userId, 'ip', req.user.id);
        } else {
          console.log(`[BAN ADMIN] No se encontró usuario asociado a la IP ${value} para enviar DM de unban`);
        }
      }
    } catch (dmError) {
      console.error('[BAN ADMIN] Error enviando DM de unban:', dmError);
      // No fallar el unban si no se puede enviar el DM
    }
    
    res.json({ success: true, message: 'Ban removido correctamente' });
  } catch (error) {
    console.error('[BAN ADMIN] Error removiendo ban:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Obtener estadísticas de bans
app.get('/api/admin/ban/stats', ensureAuthOrJWT, ensureExclusiveAdmin, async (req, res) => {
  try {
    const { getQuery } = require('./db/database');
    const [ipBans, discordBans, totalIPs, activeIPs] = await Promise.all([
      getQuery('SELECT COUNT(*) as count FROM web_bans WHERE type = ? AND isActive = 1', ['ip']),
      getQuery('SELECT COUNT(*) as count FROM web_bans WHERE type = ? AND isActive = 1', ['discord']),
      getQuery('SELECT COUNT(*) as count FROM ip_tracking'),
      getQuery('SELECT COUNT(*) as count FROM ip_tracking WHERE isActive = 1')
    ]);
    
    res.json({
      ipBans: ipBans.count,
      discordBans: discordBans.count,
      totalIPs: totalIPs.count,
      activeIPs: activeIPs.count
    });
  } catch (error) {
    console.error('[BAN ADMIN] Error obteniendo estadísticas:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

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
