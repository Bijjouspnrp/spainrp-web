const express = require('express');
const router = express.Router();
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

// Middleware para proteger la ruta
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated && req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({ error: 'No autenticado' });
}

// Endpoint para roles avanzados (multi-role)
router.post('/multirole', ensureAuthenticated, async (req, res) => {
  const { userId, roleIds, action } = req.body;
  if (!userId || !Array.isArray(roleIds) || roleIds.length === 0 || !['add','remove'].includes(action)) {
    return res.status(400).json({ error: 'Datos inválidos' });
  }
  try {
    // Llama al bot local para aplicar los roles
    const botRes = await fetch('https://tu-bot.onrender.com/api/multirole', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, roleIds, action })
    });
    const data = await botRes.json();
    if (!botRes.ok) {
      return res.status(botRes.status).json({ error: 'Error en bot', details: data });
    }
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Error al aplicar roles', details: err.message });
  }
});

module.exports = router;
