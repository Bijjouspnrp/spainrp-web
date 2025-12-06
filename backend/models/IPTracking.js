const mongoose = require('mongoose');

// Modelo para tracking de IPs con datos enriquecidos
const ipTrackingSchema = new mongoose.Schema({
  ip: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  // Información del usuario Discord
  userId: {
    type: String,
    index: true,
    default: null
  },
  username: {
    type: String,
    default: null
  },
  discriminator: {
    type: String,
    default: null
  },
  avatar: {
    type: String,
    default: null
  },
  // Información del dispositivo
  userAgent: {
    type: String,
    default: 'Unknown'
  },
  browser: {
    type: String,
    default: 'Unknown'
  },
  browserVersion: {
    type: String,
    default: 'Unknown'
  },
  os: {
    type: String,
    default: 'Unknown'
  },
  osVersion: {
    type: String,
    default: 'Unknown'
  },
  device: {
    type: String,
    default: 'Unknown'
  },
  deviceType: {
    type: String,
    default: 'Unknown'
  },
  screenResolution: {
    type: String,
    default: 'Unknown'
  },
  language: {
    type: String,
    default: 'Unknown'
  },
  // Información de geolocalización
  country: {
    type: String,
    default: 'Unknown',
    index: true
  },
  countryCode: {
    type: String,
    default: 'Unknown'
  },
  city: {
    type: String,
    default: 'Unknown',
    index: true
  },
  region: {
    type: String,
    default: 'Unknown'
  },
  timezone: {
    type: String,
    default: 'Unknown'
  },
  latitude: {
    type: Number,
    default: null
  },
  longitude: {
    type: Number,
    default: null
  },
  isp: {
    type: String,
    default: 'Unknown'
  },
  accuracy: {
    type: String,
    default: 'Unknown'
  },
  // Estadísticas
  firstSeen: {
    type: Date,
    default: Date.now,
    index: true
  },
  lastSeen: {
    type: Date,
    default: Date.now,
    index: true
  },
  visitCount: {
    type: Number,
    default: 1
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  }
}, {
  timestamps: true
});

// Índices compuestos para búsquedas rápidas
ipTrackingSchema.index({ isActive: 1, lastSeen: -1 });
ipTrackingSchema.index({ userId: 1, isActive: 1 });
ipTrackingSchema.index({ country: 1, city: 1 });

const IPTracking = mongoose.models.IPTracking || mongoose.model('IPTracking', ipTrackingSchema);

module.exports = IPTracking;

