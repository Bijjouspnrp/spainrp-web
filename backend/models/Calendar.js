const mongoose = require('mongoose');

// Modelo para reclamaciones del calendario
const calendarClaimSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  year: {
    type: Number,
    required: true,
    index: true
  },
  month: {
    type: Number,
    required: true,
    index: true
  },
  day: {
    type: Number,
    required: true
  },
  claimedAt: {
    type: Date,
    default: Date.now
  },
  reward: {
    type: String,
    default: 'Recompensa diaria'
  }
}, {
  timestamps: true
});

// Índice compuesto para búsquedas rápidas
calendarClaimSchema.index({ userId: 1, year: 1, month: 1, day: 1 }, { unique: true });

// Modelo para rachas del calendario
const calendarStreakSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  currentStreak: {
    type: Number,
    default: 0
  },
  longestStreak: {
    type: Number,
    default: 0
  },
  lastClaimedDate: {
    type: String,
    default: null
  },
  totalClaims: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

const CalendarClaim = mongoose.models.CalendarClaim || mongoose.model('CalendarClaim', calendarClaimSchema);
const CalendarStreak = mongoose.models.CalendarStreak || mongoose.model('CalendarStreak', calendarStreakSchema);

module.exports = {
  CalendarClaim,
  CalendarStreak
};

