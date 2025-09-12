// ...existing code...

const { Client, GatewayIntentBits, ChannelType, PermissionsBitField } = require('discord.js');
const express = require('express');
require('dotenv').config();

const TOKEN = process.env.DISCORD_BOT_TOKEN || 'MTM4NzE1MDI1MDMzNDA5NzYyNA.GembfZ.AEm24X2ojV3whxVwOKO_4xsMtySTFA1bbbercU';
const PORT = process.env.BOT_API_PORT || 3020;

const { Partials } = require('discord.js');
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessageReactions,
    GatewayIntentBits.DirectMessageTyping,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildMessageTyping,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildInvites,
    GatewayIntentBits.GuildIntegrations,
    GatewayIntentBits.GuildWebhooks,
    GatewayIntentBits.GuildEmojisAndStickers,
    GatewayIntentBits.GuildScheduledEvents
  ],
  partials: [Partials.Channel]
});

const app = express();

client.once('ready', () => {
  // Endpoint para verificar si un usuario puede publicar noticias (rol reportero)
  app.get('/api/discord/canpostnews/:userId', async (req, res) => {
    try {
      const guildId = process.env.DISCORD_GUILD_ID || '1212556680911650866';
      const reporteroRoleId = process.env.REPORTERO_ROLE_ID || '1384340819590512700';
      const { userId } = req.params;
      const guild = client.guilds.cache.get(guildId);
      if (!guild) return res.status(404).json({ error: 'Servidor no encontrado' });
      await guild.members.fetch();
      const member = guild.members.cache.get(userId);
      if (!member) return res.status(404).json({ error: 'Usuario no encontrado en el servidor' });
      const canPost = member.roles.cache.has(reporteroRoleId);
      res.json({ canPost });
    } catch (err) {
      res.status(500).json({ error: 'Error al verificar permisos para publicar', details: err.message });
    }
  });
    // Endpoint para verificar si el usuario puede eliminar noticias (rol especial)
    app.get('/api/discord/candeletenews/:userId', async (req, res) => {
      try {
        const guildId = process.env.DISCORD_GUILD_ID || '1212556680911650866';
        const deleteRoleId = '1384340649205301359';
        const { userId } = req.params;
        const guild = client.guilds.cache.get(guildId);
        if (!guild) return res.status(404).json({ error: 'Servidor no encontrado' });
        await guild.members.fetch();
        const member = guild.members.cache.get(userId);
        if (!member) return res.status(404).json({ error: 'Usuario no encontrado en el servidor' });
        const canDelete = member.roles.cache.has(deleteRoleId);
        res.json({ canDelete });
      } catch (err) {
        res.status(500).json({ error: 'Error al verificar permisos para eliminar', details: err.message });
      }
    });
  // Exponer el cliente globalmente para otros módulos (backend)
  global.discordClient = client;
  console.log(`Bot iniciado como ${client.user.tag}`);
  console.log('Intents activos:', client.options.intents.bitfield.toString());
  // Endpoint para miembros activos (widget)
  app.get('/api/widget', async (req, res) => {
    try {
      const guildId = process.env.DISCORD_GUILD_ID || '1212556680911650866';
      const guild = client.guilds.cache.get(guildId);
      if (!guild) return res.status(404).json({ error: 'Servidor no encontrado' });
      await guild.members.fetch();
      // Filtra miembros con estado online, idle, dnd
      const presence_count = guild.members.cache.filter(m => m.presence && ['online','idle','dnd'].includes(m.presence.status)).size;
      res.json({ presence_count });
    } catch (err) {
      res.status(500).json({ error: 'Error al obtener widget', details: err.message });
    }
  });
  // Endpoint para verificar si el usuario es admin
  app.get('/api/discord/isadmin/:userId', async (req, res) => {
    try {
      const guildId = process.env.DISCORD_GUILD_ID || '1212556680911650866';
      const adminRoleId = process.env.DISCORD_ADMIN_ROLE_ID || 'ADMIN_ROLE_ID';
      const { userId } = req.params;
      const guild = client.guilds.cache.get(guildId);
      if (!guild) return res.status(404).json({ error: 'Servidor no encontrado' });
      await guild.members.fetch();
      const member = guild.members.cache.get(userId);
      if (!member) return res.status(404).json({ error: 'Usuario no encontrado en el servidor' });
      const isAdmin = member.roles.cache.has(adminRoleId);
      res.json({ isAdmin });
    } catch (err) {
      res.status(500).json({ error: 'Error al verificar admin', details: err.message });
    }
  });

  // Endpoint: verificar si un usuario es miembro del servidor
  app.get('/api/discord/ismember/:userId', async (req, res) => {
    try {
      const guildId = process.env.DISCORD_GUILD_ID || '1212556680911650866';
      const { userId } = req.params;
      console.log('[BOT API][ISMEMBER] Query', { guildId, userId });
      const guild = client.guilds.cache.get(guildId);
      if (!guild) return res.status(404).json({ error: 'Servidor no encontrado' });
      await guild.members.fetch();
      const member = guild.members.cache.get(userId);
      const payload = { isMember: Boolean(member) };
      console.log('[BOT API][ISMEMBER] Result', payload);
      res.json(payload);
    } catch (err) {
      console.error('[BOT API][ISMEMBER] Error', err);
      res.status(500).json({ error: 'Error al verificar membresía', details: err.message });
    }
  });

  // Endpoint: verificar si un usuario tiene un rol concreto
  app.get('/api/discord/hasrole/:userId/:roleId', async (req, res) => {
    try {
      const guildId = process.env.DISCORD_GUILD_ID || '1212556680911650866';
      const { userId, roleId } = req.params;
      console.log('[BOT API][HASROLE] Query', { guildId, userId, roleId });
      const guild = client.guilds.cache.get(guildId);
      if (!guild) return res.status(404).json({ error: 'Servidor no encontrado' });
      await guild.members.fetch();
      const member = guild.members.cache.get(userId);
      if (!member) return res.json({ hasRole: false, isMember: false });
      const hasRole = member.roles.cache.has(roleId);
      const payload = { hasRole, isMember: true };
      console.log('[BOT API][HASROLE] Result', payload);
      res.json(payload);
    } catch (err) {
      console.error('[BOT API][HASROLE] Error', err);
      res.status(500).json({ error: 'Error al verificar rol', details: err.message });
    }
  });
  console.log(`Bot SpainRP encendido como ${client.user.tag}`);
  app.listen(PORT, () => {
    console.log(`Bot API escuchando en puerto ${PORT}`);
  });

  // Endpoint para obtener el número total de miembros de la guild
  app.get('/api/membercount', async (req, res) => {
    try {
      const guildId = process.env.DISCORD_GUILD_ID || '1212556680911650866';
      const guild = client.guilds.cache.get(guildId);
      if (!guild) return res.status(404).json({ error: 'Servidor no encontrado' });
      await guild.members.fetch(); // Asegura que la caché esté poblada
      res.json({ memberCount: guild.memberCount });
    } catch (err) {
      console.error('[BOT API] Error en membercount:', err);
      res.status(500).json({ error: 'Error interno en el bot', details: err.message });
    }
  });

  // Endpoint para banear usuario
  app.post('/api/discord/ban', express.json(), async (req, res) => {
    try {
      const guildId = process.env.DISCORD_GUILD_ID || '1212556680911650866';
      const { userId, reason } = req.body;
      if (!userId) return res.status(400).json({ error: 'Falta userId' });
      const guild = client.guilds.cache.get(guildId);
      if (!guild) return res.status(404).json({ error: 'Servidor no encontrado' });
      await guild.members.fetch();
      const member = guild.members.cache.get(userId);
      if (!member) return res.status(404).json({ error: 'Usuario no encontrado en el servidor' });
      await member.ban({ reason: reason || 'Baneado desde panel admin' });
      res.json({ success: true, message: `Usuario ${userId} baneado.` });
    } catch (err) {
      console.error('[BOT API] Error en ban:', err);
      res.status(500).json({ error: 'Error al banear usuario', details: err.message });
    }
  });

  // Endpoint para desbanear usuario
  app.post('/api/discord/unban', express.json(), async (req, res) => {
    try {
      const guildId = process.env.DISCORD_GUILD_ID || '1212556680911650866';
      const { userId } = req.body;
      if (!userId) return res.status(400).json({ error: 'Falta userId' });
      const guild = client.guilds.cache.get(guildId);
      if (!guild) return res.status(404).json({ error: 'Servidor no encontrado' });
      await guild.bans.fetch();
      await guild.members.unban(userId);
      res.json({ success: true, message: `Usuario ${userId} desbaneado.` });
    } catch (err) {
      console.error('[BOT API] Error en unban:', err);
      res.status(500).json({ error: 'Error al desbanear usuario', details: err.message });
    }
  });

  // Endpoint para kickear usuario
  app.post('/api/discord/kick', express.json(), async (req, res) => {
    try {
      const guildId = process.env.DISCORD_GUILD_ID || '1212556680911650866';
      const { userId } = req.body;
      if (!userId) return res.status(400).json({ error: 'Falta userId' });
      const guild = client.guilds.cache.get(guildId);
      if (!guild) return res.status(404).json({ error: 'Servidor no encontrado' });
      await guild.members.fetch();
      const member = guild.members.cache.get(userId);
      if (!member) return res.status(404).json({ error: 'Usuario no encontrado en el servidor' });
      await member.kick('Kickeado desde panel admin');
      res.json({ success: true, message: `Usuario ${userId} kickeado.` });
    } catch (err) {
      console.error('[BOT API] Error en kick:', err);
      res.status(500).json({ error: 'Error al kickear usuario', details: err.message });
    }
  });

  // Endpoint para mutear usuario (requiere rol mute)
  app.post('/api/discord/mute', express.json(), async (req, res) => {
    try {
      const guildId = process.env.DISCORD_GUILD_ID || '1212556680911650866';
      const { userId, time } = req.body;
      if (!userId || !time) return res.status(400).json({ error: 'Faltan datos' });
      const guild = client.guilds.cache.get(guildId);
      if (!guild) return res.status(404).json({ error: 'Servidor no encontrado' });
      await guild.members.fetch();
      const member = guild.members.cache.get(userId);
      if (!member) return res.status(404).json({ error: 'Usuario no encontrado en el servidor' });

      // Buscar rol mute por nombre o ID
      let muteRoleId = process.env.DISCORD_MUTE_ROLE_ID;
      let muteRole = muteRoleId ? guild.roles.cache.get(muteRoleId) : guild.roles.cache.find(r => r.name.toLowerCase() === 'muted');

      // Si no existe, créalo
      if (!muteRole) {
        muteRole = await guild.roles.create({
          name: 'Muted',
          color: '#888',
          reason: 'Rol para silenciar usuarios',
          permissions: []
        });
        muteRoleId = muteRole.id;
        // Opcional: poner permisos en todos los canales
        for (const channel of guild.channels.cache.values()) {
          if (channel.type === 0 || channel.type === 2) { // 0: GUILD_TEXT, 2: GUILD_VOICE
            await channel.permissionOverwrites.edit(muteRole, {
              SendMessages: false,
              Speak: false,
              Connect: false,
              AddReactions: false
            });
          }
        }
      } else {
        muteRoleId = muteRole.id;
      }

      await member.roles.add(muteRoleId);
      setTimeout(async () => {
        try { await member.roles.remove(muteRoleId); } catch {}
      }, parseInt(time) * 60000);
      res.json({ success: true, message: `Usuario ${userId} muteado por ${time} minutos.` });
    } catch (err) {
      console.error('[BOT API] Error en mute:', err);
      res.status(500).json({ error: 'Error al mutear usuario', details: err.message });
    }
  });

  // Endpoint para cambiar roles
  app.post('/api/discord/role', express.json(), async (req, res) => {
    try {
      const guildId = process.env.DISCORD_GUILD_ID || '1212556680911650866';
      const { userId, roleId, action } = req.body;
      if (!userId || !roleId || !action) return res.status(400).json({ error: 'Faltan datos' });
      const guild = client.guilds.cache.get(guildId);
      if (!guild) return res.status(404).json({ error: 'Servidor no encontrado' });
      await guild.members.fetch();
      const member = guild.members.cache.get(userId);
      if (!member) return res.status(404).json({ error: 'Usuario no encontrado en el servidor' });
      if (action === 'add') await member.roles.add(roleId);
      else if (action === 'remove') await member.roles.remove(roleId);
      else return res.status(400).json({ error: 'Acción inválida' });
      res.json({ success: true, message: `Rol actualizado para usuario ${userId}.` });
    } catch (err) {
      console.error('[BOT API] Error en role:', err);
      res.status(500).json({ error: 'Error al cambiar rol', details: err.message });
    }
  });

  // Endpoint para obtener lista de roles del servidor
  app.get('/api/discord/roles', async (req, res) => {
    try {
      const guildId = process.env.DISCORD_GUILD_ID || '1212556680911650866';
      const guild = client.guilds.cache.get(guildId);
      if (!guild) return res.status(404).json({ error: 'Servidor no encontrado' });
      await guild.roles.fetch();
      const roles = guild.roles.cache.map(role => ({ id: role.id, name: role.name }));
      res.json({ roles });
    } catch (err) {
      res.status(500).json({ error: 'Error al obtener roles', details: err.message });
    }
  });

  // Endpoint para ver lista de baneados
  app.get('/api/discord/banned', async (req, res) => {
    try {
      const guildId = process.env.DISCORD_GUILD_ID || '1212556680911650866';
      const guild = client.guilds.cache.get(guildId);
      if (!guild) return res.status(404).json({ error: 'Servidor no encontrado' });
      const bans = await guild.bans.fetch();
      res.json({ bans: Array.from(bans.values()) });
    } catch (err) {
      console.error('[BOT API] Error en banned:', err);
      res.status(500).json({ error: 'Error al obtener baneados', details: err.message });
    }
  });

  // Endpoint para logs de staff reales
  const staffLogs = [];
  app.get('/api/discord/logs', async (req, res) => {
    res.json({ logs: staffLogs.slice(-50).reverse() }); // últimos 50 logs, ordenados recientes primero
  });

  // Registrar eventos reales
  client.on('guildBanAdd', async (ban) => {
    staffLogs.push({ action: 'Ban', user: ban.executor?.tag || 'Desconocido', target: ban.user.id, timestamp: new Date().toISOString() });
  });

  client.on('guildMemberRemove', async (member) => {
    staffLogs.push({ action: 'Kick/Leave', user: member.user.tag, target: member.user.id, timestamp: new Date().toISOString() });
  });

  client.on('guildMemberUpdate', async (oldMember, newMember) => {
    // Detecta cambios de roles
    const added = newMember.roles.cache.filter(r => !oldMember.roles.cache.has(r.id));
    const removed = oldMember.roles.cache.filter(r => !newMember.roles.cache.has(r.id));
    added.forEach(role => staffLogs.push({ action: 'Role Added', user: newMember.user.tag, target: role.name, timestamp: new Date().toISOString() }));
    removed.forEach(role => staffLogs.push({ action: 'Role Removed', user: newMember.user.tag, target: role.name, timestamp: new Date().toISOString() }));
  });

  client.on('guildMemberUpdate', async (oldMember, newMember) => {
    // Detecta mute/desmute por rol
    const muteRoleId = process.env.DISCORD_MUTE_ROLE_ID || 'MUTE_ROLE_ID';
    if (!oldMember.roles.cache.has(muteRoleId) && newMember.roles.cache.has(muteRoleId)) {
      staffLogs.push({ action: 'Mute', user: newMember.user.tag, target: newMember.user.id, timestamp: new Date().toISOString() });
    }
    if (oldMember.roles.cache.has(muteRoleId) && !newMember.roles.cache.has(muteRoleId)) {
      staffLogs.push({ action: 'Unmute', user: newMember.user.tag, target: newMember.user.id, timestamp: new Date().toISOString() });
    }
  });

  // Endpoint para obtener datos de miembro y roles
  app.get('/api/member/:guildId/:userId', async (req, res) => {
    try {
      const { guildId, userId } = req.params;
      const guild = client.guilds.cache.get(guildId);
      if (!guild) return res.status(404).json({ error: 'Servidor no encontrado' });
      await guild.members.fetch(); // Asegura que la caché esté poblada
      const member = guild.members.cache.get(userId);
      if (!member) return res.status(404).json({ error: 'Usuario no encontrado en el servidor' });
      const roles = member.roles.cache.map(r => ({ id: r.id, name: r.name }));
      res.json({
        id: member.user.id,
        username: member.user.username,
        discriminator: member.user.discriminator,
        avatar: member.user.avatar,
        joined_at: member.joinedAt,
        roles
      });
    } catch (err) {
      console.error('[BOT API] Error:', err);
      res.status(500).json({ error: 'Error interno en el bot', details: err.message });
    }
  });

    // Expulsión masiva (kick/ban)
    app.post('/api/discord/mass', express.json(), async (req, res) => {
      try {
        const guildId = process.env.DISCORD_GUILD_ID || '1212556680911650866';
        const { userIds, action } = req.body;
        if (!userIds || !Array.isArray(userIds) || !action) return res.status(400).json({ error: 'Faltan datos' });
        const guild = client.guilds.cache.get(guildId);
        if (!guild) return res.status(404).json({ error: 'Servidor no encontrado' });
        await guild.members.fetch();
        const results = [];
        for (const id of userIds) {
          const member = guild.members.cache.get(id);
          if (!member) {
            results.push({ userId: id, error: 'No encontrado' });
            continue;
          }
          try {
            if (action === 'kick') {
              await member.kick('Expulsión masiva desde panel admin');
              results.push({ userId: id, success: true, action: 'kick' });
            } else if (action === 'ban') {
              await member.ban({ reason: 'Expulsión masiva desde panel admin' });
              results.push({ userId: id, success: true, action: 'ban' });
            } else {
              results.push({ userId: id, error: 'Acción inválida' });
            }
          } catch (err) {
            results.push({ userId: id, error: err.message });
          }
        }
        res.json({ results });
      } catch (err) {
        res.status(500).json({ error: 'Error en expulsión masiva', details: err.message });
      }
    });

    // Notas internas (solo en memoria)
    const internalNotes = {};
    app.post('/api/discord/note', express.json(), async (req, res) => {
      try {
        const { userId, note } = req.body;
        if (!userId || !note) return res.status(400).json({ error: 'Faltan datos' });
        if (!internalNotes[userId]) internalNotes[userId] = [];
        internalNotes[userId].push({ note, timestamp: new Date().toISOString() });
        res.json({ success: true });
      } catch (err) {
        res.status(500).json({ error: 'Error al guardar nota', details: err.message });
      }
    });
    app.get('/api/discord/note/:userId', async (req, res) => {
      try {
        const { userId } = req.params;
        res.json({ notes: internalNotes[userId] || [] });
      } catch (err) {
        res.status(500).json({ error: 'Error al obtener notas', details: err.message });
      }
    });

    // Roles avanzados (multi-role add/remove)
    app.post('/api/discord/multirole', express.json(), async (req, res) => {
      try {
        const guildId = process.env.DISCORD_GUILD_ID || '1212556680911650866';
        const { userId, roleIds, action } = req.body;
        if (!userId || !Array.isArray(roleIds) || !action) return res.status(400).json({ error: 'Faltan datos' });
        const guild = client.guilds.cache.get(guildId);
        if (!guild) return res.status(404).json({ error: 'Servidor no encontrado' });
        await guild.members.fetch();
        const member = guild.members.cache.get(userId);
        if (!member) return res.status(404).json({ error: 'Usuario no encontrado en el servidor' });
        const results = [];
        for (const roleId of roleIds) {
          try {
            if (action === 'add') await member.roles.add(roleId);
            else if (action === 'remove') await member.roles.remove(roleId);
            else throw new Error('Acción inválida');
            results.push({ roleId, success: true });
          } catch (err) {
            results.push({ roleId, error: err.message });
          }
        }
        res.json({ results });
      } catch (err) {
        res.status(500).json({ error: 'Error en roles avanzados', details: err.message });
      }
    });

    // Logs de comandos (solo en memoria)
    const commandLogs = [];
    app.post('/api/discord/commandlog', express.json(), async (req, res) => {
      try {
        const { command, user } = req.body;
        if (!command || !user) return res.status(400).json({ error: 'Faltan datos' });
        commandLogs.push({ command, user, timestamp: new Date().toISOString() });
        res.json({ success: true });
      } catch (err) {
        res.status(500).json({ error: 'Error al guardar log', details: err.message });
      }
    });
    app.get('/api/discord/commandlog', async (req, res) => {
      res.json({ logs: commandLogs.slice(-50).reverse() });
    });

    // Bloqueo/desbloqueo de canales
    app.post('/api/discord/blockchannel', express.json(), async (req, res) => {
      try {
        const guildId = process.env.DISCORD_GUILD_ID || '1212556680911650866';
        const { channelId, roleId, action } = req.body;
        if (!channelId || !roleId || !action) return res.status(400).json({ error: 'Faltan datos' });
        const guild = client.guilds.cache.get(guildId);
        if (!guild) return res.status(404).json({ error: 'Servidor no encontrado' });
        const channel = guild.channels.cache.get(channelId);
        if (!channel) return res.status(404).json({ error: 'Canal no encontrado' });
        if (action === 'block') {
          await channel.permissionOverwrites.edit(roleId, { SendMessages: false });
          res.json({ success: true, message: 'Canal bloqueado' });
        } else if (action === 'unblock') {
          await channel.permissionOverwrites.edit(roleId, { SendMessages: null });
          res.json({ success: true, message: 'Canal desbloqueado' });
        } else {
          res.status(400).json({ error: 'Acción inválida' });
        }
      } catch (err) {
        res.status(500).json({ error: 'Error en bloqueo de canal', details: err.message });
      }
    });

    // Roles temporales
    app.post('/api/discord/temprole', express.json(), async (req, res) => {
      try {
        const guildId = process.env.DISCORD_GUILD_ID || '1212556680911650866';
        const { userId, roleId, time } = req.body;
        if (!userId || !roleId || !time) return res.status(400).json({ error: 'Faltan datos' });
        const guild = client.guilds.cache.get(guildId);
        if (!guild) return res.status(404).json({ error: 'Servidor no encontrado' });
        await guild.members.fetch();
        const member = guild.members.cache.get(userId);
        if (!member) return res.status(404).json({ error: 'Usuario no encontrado en el servidor' });
        await member.roles.add(roleId);
        setTimeout(async () => {
          try { await member.roles.remove(roleId); } catch {}
        }, parseInt(time) * 60000);
        res.json({ success: true, message: `Rol temporal asignado por ${time} minutos.` });
      } catch (err) {
        res.status(500).json({ error: 'Error en rol temporal', details: err.message });
      }
    });

  // Endpoint para enviar MD privado por el bot (corrigiendo uso de multer)
  const multer = require('multer');
  const upload = multer();
  app.post('/api/discord/senddm', upload.single('file'), async (req, res) => {
    try {
      console.log('[SENDDM] Content-Type:', req.headers['content-type']);
      if (!req.body) {
        console.error('[SENDDM] req.body es undefined');
        return res.status(400).json({ error: 'Cuerpo de la petición vacío o malformado' });
      }
      // Si viene como string (por ejemplo, desde FormData), intenta parsear
      let body = req.body;
      if (typeof req.body === 'string') {
        try {
          body = JSON.parse(req.body);
        } catch (e) {
          console.error('[SENDDM] Error al parsear req.body string:', e);
          return res.status(400).json({ error: 'Body malformado (no es JSON válido)' });
        }
      }
      const { userId, type, message, embed, imageUrl } = body;
      console.log('[SENDDM] body:', body);
      console.log('[SENDDM] file:', req.file);
      if (!userId || !type) {
        console.error('[SENDDM] Faltan datos: userId o type');
        return res.status(400).json({ error: 'Faltan datos' });
      }
      await client.users.fetch(userId).catch(err => {
        console.error('[SENDDM] Error al hacer fetch del usuario:', err);
        throw err;
      });
      const user = client.users.cache.get(userId);
      if (!user) {
        console.error('[SENDDM] Usuario no encontrado:', userId);
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }
      let files = [];
      if (imageUrl) files.push(imageUrl);
      if (req.file) files.push({
        attachment: req.file.buffer,
        name: req.file.originalname
      });
      if (type === 'text') {
        if (!message) {
          console.error('[SENDDM] Faltan datos: message');
          return res.status(400).json({ error: 'Falta mensaje de texto' });
        }
        const options = { content: message };
        if (files.length > 0) options.files = files;
        await user.send(options).catch(err => {
          console.error('[SENDDM] Error al enviar DM de texto:', err);
          throw err;
        });
        res.json({ success: true });
      } else if (type === 'embed') {
        if (!embed || !embed.title || !embed.description) {
          console.error('[SENDDM] Faltan datos del embed:', embed);
          return res.status(400).json({ error: 'Faltan datos del embed' });
        }
        const options = { embeds: [{ title: embed.title, description: embed.description, color: 0x7289da }] };
        if (files.length > 0) options.files = files;
        await user.send(options).catch(err => {
          console.error('[SENDDM] Error al enviar DM embed:', err);
          throw err;
        });
        res.json({ success: true });
      } else {
        console.error('[SENDDM] Tipo de mensaje inválido:', type);
        res.status(400).json({ error: 'Tipo de mensaje inválido' });
      }
    } catch (err) {
      console.error('[SENDDM] Error general:', err);
      res.status(500).json({ error: 'Error al enviar MD', details: err.message });
    }
  });

  // Historial de respuestas a MDs
  const dmReplies = {};
  const dmCollector = [];

  client.on('messageCreate', (msg) => {
    if (msg.channel.type === ChannelType.DM && !msg.author.bot) {
      console.log(`📩 DM recibido de ${msg.author.tag}: ${msg.content}`);
      dmCollector.push({
        authorId: msg.author.id,
        authorTag: msg.author.tag,
        content: msg.content,
        messageId: msg.id,
        createdTimestamp: msg.createdTimestamp,
        receivedAt: new Date().toISOString()
      });
      if (!dmReplies[msg.author.id]) dmReplies[msg.author.id] = [];
      dmReplies[msg.author.id].push({
        content: msg.content,
        timestamp: new Date().toISOString(),
        messageId: msg.id
      });
    }
  });

  // Endpoint para ver respuestas a MDs
    app.get('/api/discord/dmreplies/:userId', async (req, res) => {
      const { userId } = req.params;
      console.log('[DMREPLIES] [QUERY] Consulta de respuestas para userId:', userId);
      if (!userId || typeof userId !== 'string' || userId.length < 5) {
        console.log('[DMREPLIES] [QUERY] userId inválido:', userId);
        return res.status(200).json({ replies: [] });
      }
      const replies = Array.isArray(dmReplies[userId]) ? dmReplies[userId] : [];
      console.log(`[DMREPLIES] [QUERY] Respuestas encontradas para userId ${userId}:`, replies.length);
      if (replies.length > 0) {
        console.log('[DMREPLIES] [QUERY] Primer mensaje:', replies[0]);
      }
      res.status(200).json({ replies });
    });

    // Endpoint para listar todos los userId con mensajes DM guardados
    app.get('/api/discord/dmreplies', async (req, res) => {
      const userIds = Object.keys(dmReplies);
      console.log('[DMREPLIES] [QUERY] Consulta de todos los userId con mensajes DM:', userIds);
      res.status(200).json({ userIds });
    });

  // Endpoint para ver todos los mensajes DM recibidos (recolector global)
  app.get('/api/discord/dmcollector', async (req, res) => {
    console.log('[DMREPLIES] [COLLECTOR] Consulta de todos los mensajes DM recibidos. Total:', dmCollector.length);
    res.status(200).json({ messages: dmCollector });
  });

  // APIs del calendario diario
  const calendarData = {}; // Almacenar datos del calendario en memoria

  // Obtener datos del calendario
  app.get('/api/calendar', async (req, res) => {
    try {
      const { year, month } = req.query;
      const key = `${year}-${month}`;
      const data = calendarData[key] || { claimedDays: [], streak: 0 };
      res.json(data);
    } catch (err) {
      console.error('[BOT API] Error en calendar:', err);
      res.status(500).json({ error: 'Error al obtener datos del calendario', details: err.message });
    }
  });

  // ===== ADMINISTRADORES TOTALES (ROL: 1384340649205301359) =====
  
  // Verificar si un usuario es administrador total
  app.get('/api/admin/isadmin/:userId', async (req, res) => {
    try {
      const guildId = process.env.DISCORD_GUILD_ID || '1212556680911650866';
      const adminRoleId = '1384340649205301359';
      const { userId } = req.params;
      console.log('[ADMIN API][ISADMIN] Query', { guildId, userId, adminRoleId });
      
      const guild = client.guilds.cache.get(guildId);
      if (!guild) return res.status(404).json({ error: 'Servidor no encontrado' });
      
      await guild.members.fetch();
      const member = guild.members.cache.get(userId);
      if (!member) return res.json({ isAdmin: false, isMember: false });
      
      const hasAdminRole = member.roles.cache.has(adminRoleId);
  const { PermissionsBitField } = require('discord.js');
  const hasAdminPerms = member.permissions.has(PermissionsBitField.Flags.Administrator);
      const isAdmin = hasAdminRole || hasAdminPerms;
      
      const payload = { isAdmin, isMember: true, hasAdminRole, hasAdminPerms };
      console.log('[ADMIN API][ISADMIN] Result', payload);
      res.json(payload);
    } catch (err) {
      console.error('[ADMIN API][ISADMIN] Error', err);
      res.status(500).json({ error: 'Error al verificar admin', details: err.message });
    }
  });

  // Buscar usuarios por nombre (solo administradores)
  app.get('/api/admin/search/:query', async (req, res) => {
    try {
      const guildId = process.env.DISCORD_GUILD_ID || '1212556680911650866';
      const { query } = req.params;
      const { adminUserId } = req.query;
      
      console.log('[ADMIN API][SEARCH] Query', { guildId, query, adminUserId });
      
      // Verificar que el que hace la consulta sea admin
      const guild = client.guilds.cache.get(guildId);
      if (!guild) return res.status(404).json({ error: 'Servidor no encontrado' });
      
      await guild.members.fetch();
      const adminMember = guild.members.cache.get(adminUserId);
      if (!adminMember) return res.status(404).json({ error: 'Admin no encontrado' });
      
      const hasAdminRole = adminMember.roles.cache.has('1384340649205301359');
  const hasAdminPerms = adminMember.permissions.has(PermissionsBitField.Flags.Administrator);
      if (!hasAdminRole && !hasAdminPerms) {
        return res.status(403).json({ error: 'No tienes permisos de administrador' });
      }
      
      // Buscar usuarios por nombre de usuario o display name
      const members = guild.members.cache.filter(member => 
        member.user.username.toLowerCase().includes(query.toLowerCase()) ||
        (member.displayName && member.displayName.toLowerCase().includes(query.toLowerCase()))
      );
      
      const results = members.map(member => ({
        id: member.user.id,
        username: member.user.username,
        displayName: member.displayName,
        discriminator: member.user.discriminator,
        avatar: member.user.avatar,
        joinedAt: member.joinedAt
      })).slice(0, 20); // Limitar a 20 resultados
      
      console.log('[ADMIN API][SEARCH] Results', { found: results.length });
      res.json({ users: results });
    } catch (err) {
      console.error('[ADMIN API][SEARCH] Error', err);
      res.status(500).json({ error: 'Error al buscar usuarios', details: err.message });
    }
  });

  // Ver inventario de cualquier usuario (solo administradores)
  app.get('/api/admin/inventory/:targetUserId', async (req, res) => {
    try {
      const { targetUserId } = req.params;
      const { adminUserId } = req.query;
      console.log('[ADMIN API][INVENTORY] Proxy', { targetUserId, adminUserId });
      // Verificar permisos de admin
      const guildId = process.env.DISCORD_GUILD_ID || '1212556680911650866';
      const guild = client.guilds.cache.get(guildId);
      if (!guild) return res.status(404).json({ error: 'Servidor no encontrado' });
      await guild.members.fetch();
      const adminMember = guild.members.cache.get(adminUserId);
      if (!adminMember) return res.status(404).json({ error: 'Admin no encontrado' });
      const hasAdminRole = adminMember.roles.cache.has('1384340649205301359');
      const hasAdminPerms = adminMember.permissions.has(PermissionsBitField.Flags.Administrator);
      if (!hasAdminRole && !hasAdminPerms) {
        return res.status(403).json({ error: 'No tienes permisos de administrador' });
      }
      // Proxy a la API externa
      const response = await fetch(`http://localhost:3010/api/admin/inventory/${targetUserId}`);
      const data = await response.json();
      res.status(response.status).json(data);
    } catch (err) {
      console.error('[ADMIN API][INVENTORY] Error', err);
      res.status(500).json({ error: 'Error al obtener inventario', details: err.message });
    }
  });

  // Agregar items al inventario de un usuario (solo administradores)
  app.post('/api/admin/additem', express.json(), async (req, res) => {
    try {
      const { targetUserId, itemId, amount, adminUserId } = req.body;
      console.log('[ADMIN API][ADDITEM] Proxy', { targetUserId, itemId, amount, adminUserId });
      // Verificar permisos de admin
      const guildId = process.env.DISCORD_GUILD_ID || '1212556680911650866';
      const guild = client.guilds.cache.get(guildId);
      if (!guild) return res.status(404).json({ error: 'Servidor no encontrado' });
      await guild.members.fetch();
      const adminMember = guild.members.cache.get(adminUserId);
      if (!adminMember) return res.status(404).json({ error: 'Admin no encontrado' });
      const hasAdminRole = adminMember.roles.cache.has('1384340649205301359');
      const hasAdminPerms = adminMember.permissions.has(PermissionsBitField.Flags.Administrator);
      if (!hasAdminRole && !hasAdminPerms) {
        return res.status(403).json({ error: 'No tienes permisos de administrador' });
      }
      // Proxy a la API externa
      const response = await fetch(`http://localhost:3010/api/admin/additem`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: targetUserId, itemId, amount })
      });
      const data = await response.json();
      res.status(response.status).json(data);
    } catch (err) {
      console.error('[ADMIN API][ADDITEM] Error', err);
      res.status(500).json({ error: 'Error al agregar item', details: err.message });
    }
  });

  // Retirar items del inventario de un usuario (solo administradores)
  app.post('/api/admin/removeitem', express.json(), async (req, res) => {
    try {
      const { targetUserId, itemId, amount, adminUserId } = req.body;
      console.log('[ADMIN API][REMOVEITEM] Proxy', { targetUserId, itemId, amount, adminUserId });
      // Verificar permisos de admin
      const guildId = process.env.DISCORD_GUILD_ID || '1212556680911650866';
      const guild = client.guilds.cache.get(guildId);
      if (!guild) return res.status(404).json({ error: 'Servidor no encontrado' });
      await guild.members.fetch();
      const adminMember = guild.members.cache.get(adminUserId);
      if (!adminMember) return res.status(404).json({ error: 'Admin no encontrado' });
      const hasAdminRole = adminMember.roles.cache.has('1384340649205301359');
      const hasAdminPerms = adminMember.permissions.has(PermissionsBitField.Flags.Administrator);
      if (!hasAdminRole && !hasAdminPerms) {
        return res.status(403).json({ error: 'No tienes permisos de administrador' });
      }
      // Proxy a la API externa
      const response = await fetch(`http://localhost:3010/api/admin/removeitem`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: targetUserId, itemId, amount })
      });
      const data = await response.json();
      res.status(response.status).json(data);
    } catch (err) {
      console.error('[ADMIN API][REMOVEITEM] Error', err);
      res.status(500).json({ error: 'Error al retirar item', details: err.message });
    }
  });

  // Ver saldo de cualquier usuario (solo administradores)
  app.get('/api/admin/balance/:targetUserId', async (req, res) => {
    try {
      const { targetUserId } = req.params;
      const { adminUserId } = req.query;
      console.log('[ADMIN API][BALANCE] Proxy', { targetUserId, adminUserId });
      // Verificar permisos de admin
      const guildId = process.env.DISCORD_GUILD_ID || '1212556680911650866';
      const guild = client.guilds.cache.get(guildId);
      if (!guild) return res.status(404).json({ error: 'Servidor no encontrado' });
      await guild.members.fetch();
      const adminMember = guild.members.cache.get(adminUserId);
      if (!adminMember) return res.status(404).json({ error: 'Admin no encontrado' });
      const hasAdminRole = adminMember.roles.cache.has('1384340649205301359');
      const hasAdminPerms = adminMember.permissions.has(PermissionsBitField.Flags.Administrator);
      if (!hasAdminRole && !hasAdminPerms) {
        return res.status(403).json({ error: 'No tienes permisos de administrador' });
      }
      // Proxy a la API externa
      const response = await fetch(`http://localhost:3010/api/admin/balance/${targetUserId}`);
      const data = await response.json();
      res.status(response.status).json(data);
    } catch (err) {
      console.error('[ADMIN API][BALANCE] Error', err);
      res.status(500).json({ error: 'Error al obtener saldo', details: err.message });
    }
  });

  // Modificar saldo de un usuario (solo administradores)
  app.post('/api/admin/setbalance', express.json(), async (req, res) => {
    try {
      const { targetUserId, cash, bank, adminUserId } = req.body;
      console.log('[ADMIN API][SETBALANCE] Proxy', { targetUserId, cash, bank, adminUserId });
      // Verificar permisos de admin
      const guildId = process.env.DISCORD_GUILD_ID || '1212556680911650866';
      const guild = client.guilds.cache.get(guildId);
      if (!guild) return res.status(404).json({ error: 'Servidor no encontrado' });
      await guild.members.fetch();
      const adminMember = guild.members.cache.get(adminUserId);
      if (!adminMember) return res.status(404).json({ error: 'Admin no encontrado' });
      const hasAdminRole = adminMember.roles.cache.has('1384340649205301359');
      const hasAdminPerms = adminMember.permissions.has(PermissionsBitField.Flags.Administrator);
      if (!hasAdminRole && !hasAdminPerms) {
        return res.status(403).json({ error: 'No tienes permisos de administrador' });
      }
      // Proxy a la API externa
      const response = await fetch(`http://localhost:3010/api/admin/setbalance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: targetUserId, cash, bank })
      });
      const data = await response.json();
      res.status(response.status).json(data);
    } catch (err) {
      console.error('[ADMIN API][SETBALANCE] Error', err);
      res.status(500).json({ error: 'Error al modificar saldo', details: err.message });
    }
  });

  // Reclamar día del calendario
  app.post('/api/calendar/claim', express.json(), async (req, res) => {
    try {
      const { year, month, day } = req.body;
      const key = `${year}-${month}`;
      
      if (!calendarData[key]) {
        calendarData[key] = { claimedDays: [], streak: 0 };
      }
      
      // Verificar si el día ya fue reclamado
      if (calendarData[key].claimedDays.includes(day)) {
        return res.status(400).json({ error: 'Día ya reclamado' });
      }
      
      // Agregar el día reclamado
      calendarData[key].claimedDays.push(day);
      
      // Calcular racha (días consecutivos reclamados)
      const sortedDays = calendarData[key].claimedDays.sort((a, b) => a - b);
      let streak = 0;
      for (let i = 0; i < sortedDays.length; i++) {
        if (i === 0 || sortedDays[i] === sortedDays[i-1] + 1) {
          streak++;
        } else {
          streak = 1;
        }
      }
      calendarData[key].streak = streak;
      
      res.json(calendarData[key]);
    } catch (err) {
      console.error('[BOT API] Error en calendar/claim:', err);
      res.status(500).json({ error: 'Error al reclamar día', details: err.message });
    }
  });
})

client.login(TOKEN);
