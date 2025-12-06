const mongoose = require('mongoose');

// Modelo para bans de IPs y usuarios Discord
const webBansSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ['ip', 'discord'],
    index: true
  },
  value: {
    type: String,
    required: true,
    index: true
  },
  reason: {
    type: String,
    default: null
  },
  bannedBy: {
    type: String,
    required: true
  },
  bannedAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  expiresAt: {
    type: Date,
    default: null,
    index: true
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  }
}, {
  timestamps: true
});

// Índice compuesto para búsquedas rápidas
webBansSchema.index({ type: 1, value: 1 }, { unique: true });
webBansSchema.index({ isActive: 1, expiresAt: 1 });
webBansSchema.index({ type: 1, isActive: 1 });

const WebBans = mongoose.models.WebBans || mongoose.model('WebBans', webBansSchema);

module.exports = WebBans;

