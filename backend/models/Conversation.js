const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['user', 'assistant', 'system'],
    required: true
  },
  content: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  tokens: {
    type: Number
  }
});

const conversationSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  sessionId: {
    type: String,
    required: true,
    unique: true
  },
  messages: [messageSchema],
  title: {
    type: String,
    default: 'Nouvelle conversation'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  metadata: {
    totalMessages: { type: Number, default: 0 },
    totalTokens: { type: Number, default: 0 },
    favorite: { type: Boolean, default: false },
    tags: [String]
  }
});

// Middleware pour mettre à jour lastUpdated et les métadonnées
conversationSchema.pre('save', function(next) {
  this.lastUpdated = new Date();
  this.metadata.totalMessages = this.messages.length;
  this.metadata.totalTokens = this.messages.reduce((acc, msg) => acc + (msg.tokens || 0), 0);
  next();
});

// Index pour recherche rapide
conversationSchema.index({ userId: 1, lastUpdated: -1 });
conversationSchema.index({ 'messages.content': 'text' });

module.exports = mongoose.model('Conversation', conversationSchema);
