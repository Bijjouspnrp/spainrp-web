const express = require('express');
const router = express.Router();
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const API_BASE = 'http://37.27.21.91:5021';

// Base de datos SQLite para antecedentes y multas
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.join(__dirname, '../spainrp.db');
const db = new sqlite3.Database(dbPath);

// Inicializar tablas si no existen
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS antecedentes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    discord_id TEXT NOT NULL,
    dni TEXT,
    delito TEXT NOT NULL,
    fecha TEXT NOT NULL,
    policia TEXT NOT NULL,
    descripcion TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
  
  db.run(`CREATE TABLE IF NOT EXISTS multas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    discord_id TEXT NOT NULL,
    dni TEXT,
    motivo TEXT NOT NULL,
    cantidad INTEGER NOT NULL,
    fecha TEXT NOT NULL,
    policia TEXT NOT NULL,
    pagada BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
  
  db.run(`CREATE TABLE IF NOT EXISTS arrestos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    discord_id TEXT NOT NULL,
    dni TEXT,
    motivo TEXT NOT NULL,
    fecha TEXT NOT NULL,
    policia TEXT NOT NULL,
    duracion TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
});

// Antecedentes por Discord ID
router.get('/antecedentes/:discordId', async (req, res) => {
  try {
    const { discordId } = req.params;
    console.log(`[ADMIN-RECORDS] Consultando antecedentes para Discord ID: ${discordId}`);
    
    // Intentar primero con el bot externo
    try {
      const response = await fetch(`${API_BASE}/antecedentes/${discordId}`);
      if (response.ok) {
        const data = await response.json();
        console.log(`[ADMIN-RECORDS] Respuesta del bot externo:`, data);
        return res.json({ total: data?.total || 0, registros: data?.registros || [] });
      }
    } catch (err) {
      console.log(`[ADMIN-RECORDS] Bot externo no disponible, usando base de datos local`);
    }
    
    // Si el bot externo no está disponible, usar base de datos local
    db.all('SELECT * FROM antecedentes WHERE discord_id = ?', [discordId], (err, rows) => {
      if (err) {
        console.error(`[ADMIN-RECORDS] Error consultando antecedentes:`, err);
        return res.json({ total: 0, registros: [] });
      }
      console.log(`[ADMIN-RECORDS] Antecedentes encontrados: ${rows.length}`);
      res.json({ total: rows.length, registros: rows });
    });
  } catch (err) {
    console.error(`[ADMIN-RECORDS] Error general:`, err);
    res.json({ total: 0, registros: [] });
  }
});

// Antecedentes por DNI
router.get('/antecedentes/dni/:dni', async (req, res) => {
  try {
    const { dni } = req.params;
    console.log(`[ADMIN-RECORDS] Consultando antecedentes por DNI: ${dni}`);
    
    // Intentar primero con el bot externo
    try {
      const response = await fetch(`${API_BASE}/antecedentes/dni/${dni}`);
      if (response.ok) {
        const data = await response.json();
        return res.json(data);
      }
    } catch (err) {
      console.log(`[ADMIN-RECORDS] Bot externo no disponible para DNI, usando base de datos local`);
    }
    
    // Si el bot externo no está disponible, usar base de datos local
    db.all('SELECT * FROM antecedentes WHERE dni = ?', [dni], (err, rows) => {
      if (err) {
        console.error(`[ADMIN-RECORDS] Error consultando antecedentes por DNI:`, err);
        return res.status(500).json({ error: 'Error consultando antecedentes por DNI' });
      }
      res.json({ total: rows.length, registros: rows });
    });
  } catch (err) {
    console.error(`[ADMIN-RECORDS] Error general DNI:`, err);
    res.status(500).json({ error: 'Error consultando antecedentes por DNI' });
  }
});

// Multas por Discord ID
router.get('/multas/:discordId', async (req, res) => {
  try {
    const { discordId } = req.params;
    console.log(`[ADMIN-RECORDS] Consultando multas para Discord ID: ${discordId}`);
    
    // Intentar primero con el bot externo
    try {
      const response = await fetch(`${API_BASE}/multas/${discordId}`);
      if (response.ok) {
        const data = await response.json();
        console.log(`[ADMIN-RECORDS] Respuesta del bot externo para multas:`, data);
        return res.json({
          total: data?.total || 0,
          pendientes: data?.pendientes || 0,
          multas: data?.multas || []
        });
      }
    } catch (err) {
      console.log(`[ADMIN-RECORDS] Bot externo no disponible para multas, usando base de datos local`);
    }
    
    // Si el bot externo no está disponible, usar base de datos local
    db.all('SELECT * FROM multas WHERE discord_id = ?', [discordId], (err, rows) => {
      if (err) {
        console.error(`[ADMIN-RECORDS] Error consultando multas:`, err);
        return res.json({ total: 0, pendientes: 0, multas: [] });
      }
      
      const total = rows.length;
      const pendientes = rows.filter(row => !row.pagada).length;
      console.log(`[ADMIN-RECORDS] Multas encontradas: ${total}, Pendientes: ${pendientes}`);
      
      res.json({
        total: total,
        pendientes: pendientes,
        multas: rows
      });
    });
  } catch (err) {
    console.error(`[ADMIN-RECORDS] Error general multas:`, err);
    res.json({ total: 0, pendientes: 0, multas: [] });
  }
});

// Totales generales para el panel
router.get('/stats/records', async (req, res) => {
  try {
    console.log(`[ADMIN-RECORDS] Consultando estadísticas generales`);
    
    // Intentar primero con el bot externo
    try {
      const response = await fetch(`${API_BASE}/stats/records`);
      if (response.ok) {
        const data = await response.json();
        console.log(`[ADMIN-RECORDS] Respuesta del bot externo para stats:`, data);
        return res.json({
          antecedentes: data?.antecedentes || 0,
          arrestos: data?.arrestos || 0,
          multasPendientes: data?.multasPendientes || 0
        });
      }
    } catch (err) {
      console.log(`[ADMIN-RECORDS] Bot externo no disponible para stats, usando base de datos local`);
    }
    
    // Si el bot externo no está disponible, usar base de datos local
    db.all('SELECT COUNT(*) as total FROM antecedentes', (err1, antecedentesRows) => {
      if (err1) {
        console.error(`[ADMIN-RECORDS] Error consultando antecedentes totales:`, err1);
        return res.json({ antecedentes: 0, arrestos: 0, multasPendientes: 0 });
      }
      
      db.all('SELECT COUNT(*) as total FROM arrestos', (err2, arrestosRows) => {
        if (err2) {
          console.error(`[ADMIN-RECORDS] Error consultando arrestos totales:`, err2);
          return res.json({ antecedentes: antecedentesRows[0]?.total || 0, arrestos: 0, multasPendientes: 0 });
        }
        
        db.all('SELECT COUNT(*) as total FROM multas WHERE pagada = 0', (err3, multasRows) => {
          if (err3) {
            console.error(`[ADMIN-RECORDS] Error consultando multas pendientes:`, err3);
            return res.json({ 
              antecedentes: antecedentesRows[0]?.total || 0, 
              arrestos: arrestosRows[0]?.total || 0, 
              multasPendientes: 0 
            });
          }
          
          const stats = {
            antecedentes: antecedentesRows[0]?.total || 0,
            arrestos: arrestosRows[0]?.total || 0,
            multasPendientes: multasRows[0]?.total || 0
          };
          
          console.log(`[ADMIN-RECORDS] Estadísticas calculadas:`, stats);
          res.json(stats);
        });
      });
    });
  } catch (err) {
    console.error(`[ADMIN-RECORDS] Error general stats:`, err);
    res.json({ antecedentes: 0, arrestos: 0, multasPendientes: 0 });
  }
});

module.exports = router;
