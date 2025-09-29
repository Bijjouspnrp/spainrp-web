const express = require('express');
const passport = require('passport');
const DiscordStrategy = require('passport-discord').Strategy;
const { generateToken } = require('./middleware/jwt');
require('dotenv').config();

const router = express.Router();

// En producción, usar variables de entorno
const CLIENT_ID = process.env.DISCORD_CLIENT_ID || '1387150250334097624';
const CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET || 'i5vVTN3rl757mW5dMFkwV8nwAnkbVk1B';
const CALLBACK_URL = process.env.DISCORD_CALLBACK_URL || 'https://spainrp-web.onrender.com/auth/discord/callback';
const GUILD_ID = process.env.DISCORD_GUILD_ID || '1351991000903004241';
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://spainrp-oficial.onrender.com';

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
console.log('FRONTEND_URL:', FRONTEND_URL);
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
  console.log('[DISCORD STRATEGY] User authenticated:', {
    userId: profile.id,
    username: profile.username,
    discriminator: profile.discriminator,
    hasAccessToken: !!accessToken,
    timestamp: new Date().toISOString()
  });
  
  process.nextTick(() => done(null, { ...profile, accessToken }));
}));

// Ruta para iniciar sesión
router.get('/login', (req, res, next) => {
  const provided = req.query.redirect;
  const referer = req.get('referer') || '';
  
  console.log('[AUTH /login] start', {
    sessionID: req.sessionID,
    providedRedirect: provided,
    referer
  });
  
  if (provided) {
    req.session.returnTo = provided;
  } else if (referer && /\/blackmarket(\b|\/|\?|#)/.test(referer)) {
    req.session.returnTo = referer;
  }
  
  req.session.save(() => {
    console.log('[AUTH /login] session saved; redirecting to Discord auth', {
      sessionID: req.sessionID,
      returnTo: req.session.returnTo
    });
    passport.authenticate('discord')(req, res, next);
  });
});

// Callback de Discord
router.get('/discord/callback', 
  passport.authenticate('discord', {
    failureRedirect: '/auth/failure'
  }),
  (req, res) => {
    const token = generateToken(req.user);
    
    console.log('[AUTH callback] Session debug:', {
      sessionID: req.sessionID,
      returnTo: req.session?.returnTo,
      userId: req.user?.id
    });
    
    const returnTo = req.session?.returnTo || FRONTEND_URL;
    delete req.session.returnTo;
    
    console.log('[AUTH callback] success', {
      sessionID: req.sessionID,
      userId: req.user?.id,
      username: req.user?.username,
      tokenGenerated: !!token,
      willRedirectTo: returnTo,
      timestamp: new Date().toISOString()
    });
    
    const redirectUrl = `${returnTo}?token=${encodeURIComponent(token)}`;
    console.log('[AUTH callback] Final redirect URL:', redirectUrl);
    res.redirect(redirectUrl);
  }
);

// Ruta para fallos de Discord OAuth
router.get('/failure', (req, res) => {
  console.log('[AUTH failure] Discord OAuth failed:', {
    sessionID: req.sessionID,
    query: req.query,
    referer: req.get('referer'),
    timestamp: new Date().toISOString()
  });
  
  res.status(403).json({
    error: 'Discord OAuth failed',
    message: 'No se pudo autenticar con Discord',
    code: 'DISCORD_AUTH_FAILED'
  });
});

// Ruta JWT para verificar token
router.get('/me', (req, res) => {
  const authHeader = req.headers.authorization;
  
  console.log('[AUTH /me] Request received:', {
    hasAuthHeader: !!authHeader,
    timestamp: new Date().toISOString()
  });
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log('[AUTH /me] No valid authorization header');
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
      timestamp: new Date().toISOString()
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

// Ruta para cerrar sesión (API endpoint)
router.post('/logout', (req, res) => {
  console.log('[AUTH /logout] start', { 
    sessionID: req.sessionID, 
    userId: req.user?.id 
  });
  
  req.logout((err) => {
    if (err) {
      console.error('Error durante logout:', err);
      return res.status(500).json({ error: 'Error cerrando sesión' });
    }
    req.session.destroy((err) => {
      if (err) {
        console.error('Error destruyendo sesión:', err);
      }
      console.log('[AUTH /logout] finished successfully');
      res.json({ success: true, message: 'Sesión cerrada correctamente' });
    });
  });
});

// Ruta para obtener información detallada del usuario con roles
router.get('/user-info', (req, res) => {
  if (!req.isAuthenticated() || !req.user) {
    return res.status(401).json({ error: 'No autenticado' });
  }
  
  const userInfo = {
    id: req.user.id,
    username: req.user.username,
    avatar: req.user.avatar,
    discriminator: req.user.discriminator,
    email: req.user.email,
    guilds: req.user.guilds || [],
    roles: [],
    permissions: []
  };

  const spainrpGuild = userInfo.guilds.find(g => g.id === GUILD_ID);
  
  if (spainrpGuild) {
    if (spainrpGuild.owner) {
      userInfo.roles.push('Owner');
      userInfo.permissions.push('ADMINISTRATOR');
    } else if (spainrpGuild.permissions & 0x8) {
      userInfo.roles.push('Administrator');
      userInfo.permissions.push('ADMINISTRATOR');
    } else if (spainrpGuild.permissions & 0x4) {
      userInfo.roles.push('Manager');
      userInfo.permissions.push('MANAGE_SERVER');
    } else if (spainrpGuild.permissions & 0x2) {
      userInfo.roles.push('Moderator');
      userInfo.permissions.push('MANAGE_CHANNELS');
    } else {
      userInfo.roles.push('Member');
      userInfo.permissions.push('SEND_MESSAGES');
    }
  }

  if (ADMIN_USER_IDS.includes(userInfo.id)) {
    if (!userInfo.roles.includes('WhitelistedAdmin')) {
      userInfo.roles.push('WhitelistedAdmin');
    }
    if (!userInfo.permissions.includes('ADMINISTRATOR')) {
      userInfo.permissions.push('ADMINISTRATOR');
    }
  }

  res.json({ user: userInfo });
});

module.exports = router;