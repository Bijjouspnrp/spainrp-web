// backend/routes/tinder.js
const express = require('express');
const router = express.Router();
// Middleware para parsear JSON en todas las rutas de este router
router.use(express.json());
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.join(__dirname, '../spainrp.db');

// Crear tabla si no existe
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('[TINDER] Error abriendo base de datos:', err);
  } else {
    console.log('[TINDER] Base de datos conectada correctamente');
  }
});

// Configurar timeout y modo WAL para mejor rendimiento
db.configure("busy_timeout", 30000);
db.run("PRAGMA journal_mode=WAL");
db.run("PRAGMA synchronous=NORMAL");
db.run("PRAGMA cache_size=1000");
db.run("PRAGMA temp_store=MEMORY");
db.run(`CREATE TABLE IF NOT EXISTS tinder_profiles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  discord_id TEXT NOT NULL,
  roblox_user TEXT NOT NULL,
  nombre TEXT NOT NULL,
  edad INTEGER NOT NULL,
  bio TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)`);

db.run(`CREATE TABLE IF NOT EXISTS tinder_matches (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user1_id INTEGER NOT NULL,
  user2_id INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)`);

// Obtener perfil propio
router.get('/me', (req, res) => {
  if (!req.user || !req.user.id) return res.status(401).json({ error: 'No auth' });
  db.get('SELECT * FROM tinder_profiles WHERE discord_id = ?', [req.user.id], (err, row) => {
    if (err) return res.status(500).json({ error: 'DB error' });
    res.json({ profile: row });
  });
});

// Crear o actualizar perfil
router.post('/me', (req, res) => {
  if (!req.user || !req.user.id) return res.status(401).json({ error: 'No auth' });
  const { roblox_user, nombre, edad, bio } = req.body;
  if (!roblox_user || !nombre || !edad) return res.status(400).json({ error: 'Faltan datos' });
  db.run(
    `INSERT INTO tinder_profiles (discord_id, roblox_user, nombre, edad, bio) VALUES (?, ?, ?, ?, ?)
     ON CONFLICT(discord_id) DO UPDATE SET roblox_user=excluded.roblox_user, nombre=excluded.nombre, edad=excluded.edad, bio=excluded.bio`,
    [req.user.id, roblox_user, nombre, edad, bio || ''],
    function (err) {
      if (err) return res.status(500).json({ error: 'DB error' });
      res.json({ ok: true });
    }
  );
});

// Listar perfiles (menos el propio)
router.get('/all', (req, res) => {
  if (!req.user || !req.user.id) return res.status(401).json({ error: 'No auth' });
  db.all('SELECT * FROM tinder_profiles WHERE discord_id != ?', [req.user.id], (err, rows) => {
    if (err) return res.status(500).json({ error: 'DB error' });
    res.json({ profiles: rows });
  });
});

// Hacer match
router.post('/match', (req, res) => {
  if (!req.user || !req.user.id) return res.status(401).json({ error: 'No auth' });
  const { other_id } = req.body;
  if (!other_id) return res.status(400).json({ error: 'Faltan datos' });
  // Buscar el perfil del otro usuario
  db.get('SELECT id FROM tinder_profiles WHERE discord_id = ?', [other_id], (err, other) => {
    if (err || !other) return res.status(404).json({ error: 'No encontrado' });
    // Buscar el propio perfil
    db.get('SELECT id FROM tinder_profiles WHERE discord_id = ?', [req.user.id], (err2, me) => {
      if (err2 || !me) return res.status(404).json({ error: 'No encontrado' });
      // Insertar match si no existe
      db.get('SELECT * FROM tinder_matches WHERE (user1_id=? AND user2_id=?) OR (user1_id=? AND user2_id=?)', [me.id, other.id, other.id, me.id], (err3, match) => {
        if (match) return res.json({ already: true });
        db.run('INSERT INTO tinder_matches (user1_id, user2_id) VALUES (?, ?)', [me.id, other.id], function (err4) {
          if (err4) return res.status(500).json({ error: 'DB error' });
          res.json({ ok: true });
        });
      });
    });
  });
});

// Listar matches propios
router.get('/matches', (req, res) => {
  if (!req.user || !req.user.id) return res.status(401).json({ error: 'No auth' });
  db.get('SELECT id FROM tinder_profiles WHERE discord_id = ?', [req.user.id], (err, me) => {
    if (err || !me) return res.status(404).json({ error: 'No encontrado' });
    db.all(`SELECT tp.* FROM tinder_matches tm
      JOIN tinder_profiles tp ON (tp.id = tm.user1_id OR tp.id = tm.user2_id)
      WHERE (tm.user1_id = ? OR tm.user2_id = ?) AND tp.id != ?`, [me.id, me.id, me.id], (err2, rows) => {
      if (err2) return res.status(500).json({ error: 'DB error' });
      res.json({ matches: rows });
    });
  });
});

module.exports = router;
