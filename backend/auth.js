const express = require('express');
const passport = require('passport');
const DiscordStrategy = require('passport-discord').Strategy;
const { generateToken } = require('./middleware/jwt');
require('dotenv').config();

const router = express.Router();

// En producción, usar variables de entorno. Aquí se mantienen por simplicidad local
const CLIENT_ID = process.env.DISCORD_CLIENT_ID || '1387150250334097624';
const CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET || 'i5vVTN3rl757mW5dMFkwV8nwAnkbVk1B';
const CALLBACK_URL = process.env.DISCORD_CALLBACK_URL || 'https://spainrp-web.onrender.com/auth/discord/callback';

// Debug: Verificar si está usando la variable de entorno
console.log('=== CALLBACK URL DEBUG ===');
console.log('DISCORD_CALLBACK_URL env var:', process.env.DISCORD_CALLBACK_URL);
console.log('Final CALLBACK_URL:', CALLBACK_URL);
console.log('========================');
const GUILD_ID = process.env.DISCORD_GUILD_ID || '1351991000903004241';

const scopes = ['identify', 'guilds'];
const ADMIN_USER_IDS = (process.env.ADMIN_USER_IDS || '710112055985963090')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);

console.log('=== DISCORD AUTH CONFIG ===');
console.log('CLIENT_ID:', CLIENT_ID);
console.log('CLIENT_SECRET:', CLIENT_SECRET ? 'OK' : 'FALTA');
console.log('CALLBACK_URL:', CALLBACK_URL);
console.log('GUILD_ID:', GUILD_ID);
console.log('SCOPES:', scopes);
console.log('========================');

if (!CLIENT_ID || !CLIENT_SECRET || !CALLBACK_URL || !GUILD_ID) {
  throw new Error('Falta una variable de entorno crítica para la autenticación de Discord. Revisa tu .env');
}

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((obj, done) => {
  done(null, obj);
});

passport.use(new DiscordStrategy({
  clientID: CLIENT_ID,
  clientSecret: CLIENT_SECRET,
  callbackURL: CALLBACK_URL,
  scope: scopes
}, (accessToken, refreshToken, profile, done) => {
  process.nextTick(() => done(null, { ...profile, accessToken }));
}));

// Ruta para iniciar sesión
router.get('/login', (req, res, next) => {
  // Guardar la URL de redirección si se proporciona o inferir desde el referer
  const provided = req.query.redirect;
  const referer = req.get('referer') || '';
  console.log('[AUTH /login] start', {
    sessionID: req.sessionID,
    providedRedirect: provided,
    referer
  });
  if (provided) {
    req.session.returnTo = provided;
    console.log('[AUTH /login] set returnTo from provided', { returnTo: req.session.returnTo });
  } else if (referer && /\/blackmarket(\b|\/|\?|#)/.test(referer)) {
    req.session.returnTo = referer;
    console.log('[AUTH /login] set returnTo from referer', { returnTo: req.session.returnTo });
  }
  // Asegurar que la sesión se guarde antes de redirigir a Discord
  req.session.save(() => {
    console.log('[AUTH /login] session saved; redirecting to Discord auth', {
      sessionID: req.sessionID,
      returnTo: req.session.returnTo
    });
    passport.authenticate('discord')(req, res, next);
  });
});

// Callback de Discord
router.get('/discord/callback', passport.authenticate('discord', {
  failureRedirect: '/auth/forbidden'
}), (req, res) => {
  // Extender explícitamente la sesión al éxito de login (renovado por rolling cookie)
  // Generar JWT token
  const token = generateToken(req.user);
  const returnTo = req.session.returnTo || 'https://spainrp-oficial.onrender.com/';
  
  // Limpiar returnTo para evitar redirecciones persistentes
  delete req.session.returnTo;
  
  console.log('[AUTH callback] success', {
    sessionID: req.sessionID,
    userId: req.user?.id,
    username: req.user?.username,
    tokenGenerated: !!token,
    willRedirectTo: returnTo
  });
  
  // Redirigir con el token en la URL (temporal, el frontend lo guardará)
  const redirectUrl = `${returnTo}?token=${encodeURIComponent(token)}`;
  res.redirect(redirectUrl);
});

// Ruta JWT para verificar token
router.get('/me', (req, res) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ 
      error: 'Token requerido',
      code: 'NO_TOKEN'
    });
  }
  
  const token = authHeader.substring(7);
  
  try {
    const jwt = require('jsonwebtoken');
    const JWT_SECRET = process.env.JWT_SECRET || 'spainrp_jwt_secret_key_2024';
    
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: 'spainrp',
      audience: 'spainrp-users'
    });
    
    console.log('[AUTH /me] JWT success', {
      userId: decoded.id,
      username: decoded.username,
      isAdmin: decoded.isAdmin
    });
    
    res.json({ 
      user: decoded,
      authenticated: true 
    });
  } catch (error) {
    console.log('[AUTH /me] JWT error:', error.message);
    res.status(401).json({ 
      error: 'Token inválido o expirado',
      code: 'INVALID_TOKEN'
    });
  }
});

// Ruta para cerrar sesión
router.get('/logout', (req, res) => {
  console.log('[AUTH /logout] start', { sessionID: req.sessionID, userId: req.user?.id });
  req.logout((err) => {
    if (err) {
      console.error('Error durante logout:', err);
    }
    req.session.destroy((err) => {
      if (err) {
        console.error('Error destruyendo sesión:', err);
      }
      console.log('[AUTH /logout] finished, redirecting to frontpage');
      res.redirect('https://spainrp-oficial.onrender.com/');
    });
  });
});

// Ruta para obtener información detallada del usuario con roles
router.get('/user-info', (req, res) => {
  if (!req.isAuthenticated() || !req.user) {
    return res.status(401).json({ error: 'No autenticado' });
  }
  
  // Obtener información del usuario con roles
  const userInfo = {
    id: req.user.id,
    username: req.user.username,
    avatar: req.user.avatar,
    discriminator: req.user.discriminator,
    email: req.user.email,
    guilds: req.user.guilds || [],
    roles: [], // Se llenará con los roles del servidor
    permissions: []
  };

  // Buscar el servidor SpainRP en los guilds del usuario
  const spainrpGuild = userInfo.guilds.find(g => g.id === GUILD_ID);
  
  if (spainrpGuild) {
    // Aquí podrías hacer una llamada a la API de Discord para obtener roles específicos
    // Por ahora, simulamos algunos roles basados en permisos
    if (spainrpGuild.owner) {
      userInfo.roles.push('Owner');
      userInfo.permissions.push('ADMINISTRATOR');
    } else if (spainrpGuild.permissions & 0x8) { // Administrator permission
      userInfo.roles.push('Administrator');
      userInfo.permissions.push('ADMINISTRATOR');
    } else if (spainrpGuild.permissions & 0x4) { // Manage Server permission
      userInfo.roles.push('Manager');
      userInfo.permissions.push('MANAGE_SERVER');
    } else if (spainrpGuild.permissions & 0x2) { // Manage Channels permission
      userInfo.roles.push('Moderator');
      userInfo.permissions.push('MANAGE_CHANNELS');
    } else {
      userInfo.roles.push('Member');
      userInfo.permissions.push('SEND_MESSAGES');
    }
  }

  // Whitelist de administradores por ID
  if (ADMIN_USER_IDS.includes(userInfo.id)) {
    if (!userInfo.roles.includes('WhitelistedAdmin')) userInfo.roles.push('WhitelistedAdmin');
    if (!userInfo.permissions.includes('ADMINISTRATOR')) userInfo.permissions.push('ADMINISTRATOR');
  }

  res.json({ user: userInfo });
});

// Ruta para comprobar si el usuario está autenticado y en el servidor
router.get('/me', (req, res) => {
  if (!req.isAuthenticated() || !req.user) {
    return res.status(401).json({ error: 'No autenticado' });
  }
  // No forzamos pertenencia al servidor aquí para no romper la UX del sitio;
  // la autorización específica se valida en endpoints admin.
  res.json({ user: req.user });
});

// Ruta para acceso denegado
router.get('/forbidden', (req, res) => {
  res.status(403).send(`
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Acceso Denegado | SpainRP</title>
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@700;400&display=swap" rel="stylesheet">
      <style>
        body {
          background: linear-gradient(135deg,#23272a 0,#181818 100%);
          color: #fff;
          font-family: 'Montserrat', Arial, sans-serif;
          min-height: 100vh;
          margin: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }
        .forbidden-card {
          background: #181818;
          border: 2.5px solid #7289da;
          border-radius: 18px;
          box-shadow: 0 4px 24px #7289da33;
          padding: 2.2rem 2.2rem 1.5rem 2.2rem;
          max-width: 380px;
          width: 95vw;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          animation: popIn 0.7s cubic-bezier(.2,.9,.2,1);
        }
        @keyframes popIn {
          0% { opacity: 0; transform: scale(0.95) translateY(20px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        .forbidden-emoji {
          font-size: 3.2rem;
          margin-bottom: 0.7rem;
          animation: bounce 1.2s infinite alternate cubic-bezier(.2,.9,.2,1);
        }
        @keyframes bounce {
          0% { transform: translateY(0); }
          100% { transform: translateY(-8px) scale(1.08); }
        }
        .forbidden-title {
          font-size: 1.5rem;
          font-weight: 800;
          color: #7289da;
          margin-bottom: 0.7rem;
        }
        .forbidden-msg {
          font-size: 1.08rem;
          margin-bottom: 1.2rem;
          color: #FFD700;
        }
        .forbidden-btn {
          background: #7289da;
          color: #fff;
          border: none;
          border-radius: 8px;
          padding: 0.7rem 1.5rem;
          font-size: 1.1rem;
          font-weight: 700;
          cursor: pointer;
          box-shadow: 0 2px 8px #7289da33;
          transition: background 0.2s, color 0.2s, transform 0.15s;
          margin-bottom: 0.5rem;
        }
        .forbidden-btn:hover {
          background: #00ff99;
          color: #181818;
          transform: scale(1.04);
        }
        .forbidden-footer {
          margin-top: 1.5rem;
          font-size: 1.01rem;
          color: #7289da;
          opacity: 0.8;
        }
        @media (max-width: 600px) {
          .forbidden-card { padding: 1.2rem 0.7rem; max-width: 99vw; }
          .forbidden-title { font-size: 1.1rem; }
        }
      </style>
    </head>
    <body>
      <div class="forbidden-card">
        <div class="forbidden-emoji">🚫</div>
        <div class="forbidden-title">Acceso Denegado</div>
        <div class="forbidden-msg">Debes estar en el servidor de Discord para acceder a esta función.</div>
        <a href="https://discord.gg/spainrp" target="_blank" rel="noopener noreferrer">
          <button class="forbidden-btn">Unirme al Discord</button>
        </a>
        <div class="forbidden-footer">SpainRP | Sistema de Autenticación</div>
      </div>
    </body>
    </html>
  `);
});

module.exports = router; 