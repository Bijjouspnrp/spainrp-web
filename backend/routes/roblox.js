// backend/routes/roblox.js
const express = require('express');
const router = express.Router();
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

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

module.exports = router;
