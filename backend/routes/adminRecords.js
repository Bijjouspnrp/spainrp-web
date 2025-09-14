const express = require('express');
const router = express.Router();
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const API_BASE = 'http://37.27.21.91:5021';

// Antecedentes por Discord ID
router.get('/antecedentes/:discordId', async (req, res) => {
  try {
    const { discordId } = req.params;
    const response = await fetch(`${API_BASE}/antecedentes/${discordId}`);
    if (response.status === 404) {
      return res.json({ total: 0, registros: [] });
    }
    const data = await response.json();
    // Si la respuesta no tiene total, devolver 0
    res.json({ total: data?.total || 0, registros: data?.registros || [] });
  } catch (err) {
    res.json({ total: 0, registros: [] });
  }
});

// Antecedentes por DNI
router.get('/antecedentes/dni/:dni', async (req, res) => {
  try {
    const { dni } = req.params;
    const response = await fetch(`${API_BASE}/antecedentes/dni/${dni}`);
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Error consultando antecedentes por DNI' });
  }
});

// Multas por Discord ID
router.get('/multas/:discordId', async (req, res) => {
  try {
    const { discordId } = req.params;
    const response = await fetch(`${API_BASE}/multas/${discordId}`);
    if (response.status === 404) {
      return res.json({ total: 0, pendientes: 0, multas: [] });
    }
    const data = await response.json();
    res.json({
      total: data?.total || 0,
      pendientes: data?.pendientes || 0,
      multas: data?.multas || []
    });
  } catch (err) {
    res.json({ total: 0, pendientes: 0, multas: [] });
  }
});

// Totales generales para el panel
router.get('/stats/records', async (req, res) => {
  try {
    const response = await fetch(`${API_BASE}/stats/records`);
    if (!response.ok) {
      // Si la API externa no responde correctamente, devolver datos por defecto
      return res.json({ antecedentes: 0, arrestos: 0, multasPendientes: 0 });
    }
    const data = await response.json();
    // Si la respuesta no tiene los campos esperados, devolver por defecto
    res.json({
      antecedentes: data?.antecedentes || 0,
      arrestos: data?.arrestos || 0,
      multasPendientes: data?.multasPendientes || 0
    });
  } catch (err) {
    res.json({ antecedentes: 0, arrestos: 0, multasPendientes: 0 });
  }
});

module.exports = router;
