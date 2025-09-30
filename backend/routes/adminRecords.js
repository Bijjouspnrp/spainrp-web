const express = require('express');
const router = express.Router();
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const API_BASE = 'http://37.27.21.91:5021';

// Antecedentes por Discord ID
router.get('/antecedentes/:discordId', async (req, res) => {
  try {
    const { discordId } = req.params;
    console.log(`[ADMIN-RECORDS] Consultando antecedentes para ${discordId} en ${API_BASE}`);
    
    const response = await fetch(`${API_BASE}/antecedentes/${discordId}`, {
      method: 'GET',
      timeout: 5000
    });
    
    if (response.status === 404) {
      console.log(`[ADMIN-RECORDS] No se encontraron antecedentes para ${discordId}`);
      return res.json({ total: 0, registros: [] });
    }
    
    if (!response.ok) {
      console.log(`[ADMIN-RECORDS] Error del servidor externo: ${response.status}`);
      return res.json({ total: 0, registros: [] });
    }
    
    const data = await response.json();
    console.log(`[ADMIN-RECORDS] Antecedentes encontrados para ${discordId}:`, data);
    res.json({ total: data?.total || 0, registros: data?.registros || [] });
  } catch (err) {
    console.log(`[ADMIN-RECORDS] Error consultando antecedentes para ${discordId}:`, err.message);
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
    console.log(`[ADMIN-RECORDS] Consultando multas para ${discordId} en ${API_BASE}`);
    
    const response = await fetch(`${API_BASE}/multas/${discordId}`, {
      method: 'GET',
      timeout: 5000
    });
    
    if (response.status === 404) {
      console.log(`[ADMIN-RECORDS] No se encontraron multas para ${discordId}`);
      return res.json({ total: 0, pendientes: 0, multas: [] });
    }
    
    if (!response.ok) {
      console.log(`[ADMIN-RECORDS] Error del servidor externo: ${response.status}`);
      return res.json({ total: 0, pendientes: 0, multas: [] });
    }
    
    const data = await response.json();
    console.log(`[ADMIN-RECORDS] Multas encontradas para ${discordId}:`, data);
    res.json({
      total: data?.total || 0,
      pendientes: data?.pendientes || 0,
      multas: data?.multas || []
    });
  } catch (err) {
    console.log(`[ADMIN-RECORDS] Error consultando multas para ${discordId}:`, err.message);
    res.json({ total: 0, pendientes: 0, multas: [] });
  }
});

// Totales generales para el panel
router.get('/stats/records', async (req, res) => {
  try {
    console.log(`[ADMIN-RECORDS] Consultando estadísticas en ${API_BASE}`);
    
    const response = await fetch(`${API_BASE}/stats/records`, {
      method: 'GET',
      timeout: 5000
    });
    
    if (!response.ok) {
      console.log(`[ADMIN-RECORDS] Error del servidor externo: ${response.status}`);
      // Si la API externa no responde correctamente, devolver datos por defecto
      return res.json({ antecedentes: 0, arrestos: 0, multasPendientes: 0 });
    }
    
    const data = await response.json();
    console.log(`[ADMIN-RECORDS] Estadísticas obtenidas:`, data);
    
    // Si la respuesta no tiene los campos esperados, devolver por defecto
    res.json({
      antecedentes: data?.antecedentes || 0,
      arrestos: data?.arrestos || 0,
      multasPendientes: data?.multasPendientes || 0
    });
  } catch (err) {
    console.log(`[ADMIN-RECORDS] Error consultando estadísticas:`, err.message);
    res.json({ antecedentes: 0, arrestos: 0, multasPendientes: 0 });
  }
});

module.exports = router;
