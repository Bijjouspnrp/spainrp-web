// backend/routes/roblox.js
const express = require('express');
const router = express.Router();
router.use(express.json());
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const { getDatabase } = require('../db/database');

// Usar conexión centralizada de base de datos
const db = getDatabase();

// Crear tabla al inicializar el módulo
db.run(`CREATE TABLE IF NOT EXISTS roblox_verifications (
  discordId TEXT PRIMARY KEY,
  robloxUserId TEXT,
  robloxUsername TEXT,
  robloxDisplayName TEXT,
  robloxAvatarUrl TEXT,
  verifiedAt TEXT
)`, (err) => {
  if (err) {
    console.error('[ROBLOX] Error creando tabla roblox_verifications:', err);
  } else {
    console.log('[ROBLOX] Tabla roblox_verifications lista');
  }
});

// Guardar userId Roblox verificado en la base de datos
router.post('/save', async (req, res) => {
  const { discordId, robloxUserId, robloxUsername, robloxDisplayName, robloxAvatarUrl } = req.body;
  if (!discordId || !robloxUserId) return res.status(400).json({ error: 'Faltan datos.' });
  
  try {
    db.run(`INSERT INTO roblox_verifications (discordId, robloxUserId, robloxUsername, robloxDisplayName, robloxAvatarUrl, verifiedAt)
      VALUES (?, ?, ?, ?, ?, ?)
      ON CONFLICT(discordId) DO UPDATE SET
        robloxUserId=excluded.robloxUserId,
        robloxUsername=excluded.robloxUsername,
        robloxDisplayName=excluded.robloxDisplayName,
        robloxAvatarUrl=excluded.robloxAvatarUrl,
        verifiedAt=excluded.verifiedAt
    `, [discordId, robloxUserId, robloxUsername, robloxDisplayName, robloxAvatarUrl, new Date().toISOString()], function(err) {
      if (err) return res.status(500).json({ error: 'DB error', details: err.message });
      res.json({ success: true });
    });
  } catch (e) {
    res.status(500).json({ error: 'Error guardando verificación.', details: e.message });
  }
});

// Obtener avatar de Roblox por username
router.get('/avatar/:username', async (req, res) => {
  const { username } = req.params;
  if (!username) return res.status(400).json({ error: 'Falta username' });
  try {
    // 1. Buscar userId por username
    const userRes = await fetch(`https://users.roblox.com/v1/usernames/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usernames: [username], excludeBannedUsers: true })
    });
    const userData = await userRes.json();
    if (!userData.data || !userData.data[0] || !userData.data[0].id) return res.status(404).json({ error: 'No encontrado' });
    const userId = userData.data[0].id;
    // 2. Obtener avatar headshot
    const avatarRes = await fetch(`https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${userId}&size=150x150&format=Png&isCircular=true`);
    const avatarData = await avatarRes.json();
    const img = avatarData.data && avatarData.data[0] && avatarData.data[0].imageUrl;
    if (!img) return res.status(404).json({ error: 'No avatar' });
    res.json({ userId, img });
  } catch (e) {
    res.status(500).json({ error: 'Roblox API error', details: String(e) });
  }
});

// GET /api/roblox/profile/:discordId
router.get('/profile/:discordId', async (req, res) => {
  const { discordId } = req.params;
  if (!discordId) return res.status(400).json({ error: 'Falta discordId' });
  db.get('SELECT * FROM roblox_verifications WHERE discordId = ?', [discordId], (err, row) => {
    if (err) return res.status(500).json({ error: 'DB error', details: err.message });
    if (!row) return res.status(404).json({ error: 'No verificado' });
    res.json(row);
  });
});
// DELETE /api/roblox/unlink/:discordId
router.delete('/unlink/:discordId', async (req, res) => {
  const { discordId } = req.params;
  if (!discordId) return res.status(400).json({ error: 'Falta discordId' });
  db.run('DELETE FROM roblox_verifications WHERE discordId = ?', [discordId], function(err) {
    if (err) return res.status(500).json({ error: 'DB error', details: err.message });
    res.json({ success: true });
  });
});

// POST /api/roblox/verify
router.post('/verify', async (req, res) => {
  const { username, discordId } = req.body;
  if (!username || !discordId) return res.status(400).json({ error: 'Faltan datos.' });
  try {
    // Consulta a la API oficial de Roblox
    const robloxRes = await fetch('https://users.roblox.com/v1/usernames/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usernames: [username], excludeBannedUsers: true })
    });
    const robloxData = await robloxRes.json();
    if (!robloxData?.data?.length || !robloxData.data[0]?.id) {
      return res.status(404).json({ error: 'Usuario no encontrado en Roblox.' });
    }
    const userId = robloxData.data[0].id;
    // Obtener más datos del perfil
    const profileRes = await fetch(`https://users.roblox.com/v1/users/${userId}`);
    const profile = await profileRes.json();
    // Avatar
    const avatarRes = await fetch(`https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${userId}&size=150x150&format=Png&isCircular=true`);
    const avatarData = await avatarRes.json();
    const avatarUrl = avatarData?.data?.[0]?.imageUrl || null;
    // No guardar aún, solo devolver datos para confirmación
    res.json({
      userId,
      username: profile.name,
      displayName: profile.displayName,
      avatarUrl
    });
  } catch (e) {
    res.status(500).json({ error: 'Error consultando Roblox.' });
  }
});

module.exports = router;
