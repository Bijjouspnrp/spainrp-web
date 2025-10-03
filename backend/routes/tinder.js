// backend/routes/tinder.js
const express = require('express');
const router = express.Router();
// Middleware para parsear JSON en todas las rutas de este router
router.use(express.json());
const { getDatabase } = require('../db/database');
const { verifyToken } = require('../middleware/jwt');

// Usar conexión centralizada de base de datos
const db = getDatabase();
db.run(`CREATE TABLE IF NOT EXISTS tinder_profiles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  discord_id TEXT NOT NULL UNIQUE,
  roblox_user TEXT NOT NULL,
  nombre TEXT NOT NULL,
  edad INTEGER NOT NULL,
  bio TEXT,
  ubicacion TEXT,
  intereses TEXT,
  genero TEXT,
  busco TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)`);

db.run(`CREATE TABLE IF NOT EXISTS tinder_matches (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user1_id INTEGER NOT NULL,
  user2_id INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user1_id, user2_id)
)`);

// Aplicar middleware JWT a todas las rutas
router.use(verifyToken);

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
  const { roblox_user, nombre, edad, bio, ubicacion, intereses, genero, busco } = req.body;
  if (!roblox_user || !nombre || !edad) return res.status(400).json({ error: 'Faltan datos' });
  
  // Convertir intereses de array a string si es necesario
  const interesesStr = Array.isArray(intereses) ? intereses.join(',') : (intereses || '');
  
  db.run(
    `INSERT INTO tinder_profiles (discord_id, roblox_user, nombre, edad, bio, ubicacion, intereses, genero, busco) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(discord_id) DO UPDATE SET 
       roblox_user=excluded.roblox_user, 
       nombre=excluded.nombre, 
       edad=excluded.edad, 
       bio=excluded.bio,
       ubicacion=excluded.ubicacion,
       intereses=excluded.intereses,
       genero=excluded.genero,
       busco=excluded.busco`,
    [req.user.id, roblox_user, nombre, edad, bio || '', ubicacion || '', interesesStr, genero || '', busco || ''],
    function (err) {
      if (err) {
        console.error('Error guardando perfil TinderRP:', err);
        return res.status(500).json({ error: 'DB error' });
      }
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

// Super like
router.post('/superlike', (req, res) => {
  if (!req.user || !req.user.id) return res.status(401).json({ error: 'No auth' });
  const { other_id } = req.body;
  if (!other_id) return res.status(400).json({ error: 'Faltan datos' });
  
  // Por ahora, super like funciona igual que match
  // En el futuro se puede implementar lógica específica para super likes
  db.get('SELECT id FROM tinder_profiles WHERE discord_id = ?', [other_id], (err, other) => {
    if (err || !other) return res.status(404).json({ error: 'No encontrado' });
    db.get('SELECT id FROM tinder_profiles WHERE discord_id = ?', [req.user.id], (err2, me) => {
      if (err2 || !me) return res.status(404).json({ error: 'No encontrado' });
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

module.exports = router;
