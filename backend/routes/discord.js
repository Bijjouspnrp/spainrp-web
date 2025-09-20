const express = require('express');
const router = express.Router();
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

// Configuración
const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
const GUILD_ID = '1212556680911650866'; // SpainRP

// Middleware para proteger la ruta
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated && req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({ error: 'No autenticado' });
}

// Utilidad para obtener los datos del miembro
// Proxy para /api/discord/widget (miembros activos)
router.get('/widget', async (req, res) => {
  try {
    // Proxy al bot
    const botRes = await fetch('https://tu-bot.onrender.com/api/widget');
    const text = await botRes.text();
    let botData;
    try {
      botData = JSON.parse(text);
      res.status(200).json(botData);
    } catch (e) {
      res.status(200).json({ presence_count: 0 });
    }
  } catch (err) {
    res.status(200).json({ presence_count: 0 });
  }
});

// Proxy para /api/discord/membercount (miembros totales)
router.get('/membercount', async (req, res) => {
  try {
    // Proxy al bot
    const botRes = await fetch('https://tu-bot.onrender.com/api/membercount');
    const text = await botRes.text();
    let botData;
    try {
      botData = JSON.parse(text);
      res.status(200).json(botData);
    } catch (e) {
      res.status(200).json({ memberCount: 0 });
    }
  } catch (err) {
    res.status(200).json({ memberCount: 0 });
  }
});
router.get('/member/:guildId/:userId', ensureAuthenticated, async (req, res) => {
  // Log para depuración
  console.log('[DISCORD MEMBER] req.user.id:', req.user?.id, 'URL userId:', req.params.userId);
  // Permite admins consultar cualquier usuario, usuarios normales solo el propio
  const isAdmin = req.user?.roles?.includes('Administrator') || req.user?.roles?.includes('Owner');
  if (!req.user || (!isAdmin && req.user.id !== req.params.userId)) {
    return res.status(401).json({ error: 'No autorizado: solo puedes consultar tus propios datos.', sessionUserId: req.user?.id, urlUserId: req.params.userId });
  }
  const { guildId, userId } = req.params;
  try {
    console.log(`[DISCORD] Consulta miembro: guildId=${guildId}, userId=${userId}`);
    // Consultar al bot local en vez de la API REST de Discord
    const botRes = await fetch(`https://tu-bot.onrender.com/api/member/${guildId}/${userId}`);
    let botData;
    try {
      botData = await botRes.json();
    } catch (e) {
      console.error('[DISCORD] Error parseando respuesta del bot:', e);
      return res.status(502).json({ error: 'Respuesta inválida del bot', details: e.message });
    }
    if (!botRes.ok) {
      console.warn('[DISCORD] Bot respondió error:', botData);
      // Si el bot responde 404, usuario no está en la guild
      if (botRes.status === 404) {
        return res.json({
          error: 'No estás en SpainRP',
          notInGuild: true,
          invite: 'https://discord.gg/sMzFgFQHXA',
          details: botData
        });
      }
      // Otros errores
      return res.status(502).json({ error: 'Error consultando bot', details: botData });
    }
    // Validaciones extra de datos
    if (!botData.id || !botData.username) {
      console.warn('[DISCORD] Datos incompletos recibidos del bot:', botData);
      return res.status(500).json({ error: 'Datos incompletos recibidos del bot', details: botData });
    }
    if (!Array.isArray(botData.roles)) {
      botData.roles = [];
    }
    // Validar avatar
    if (!botData.avatar) {
      botData.avatar = null;
    }
    // Validar fecha de ingreso
    if (!botData.joined_at) {
      botData.joined_at = null;
    }
    res.json(botData);
  } catch (err) {
    console.error('[DISCORD] Error al consultar:', err);
    res.status(500).json({ error: 'Error al consultar Discord', details: err.message });
  }
});

module.exports = router;
