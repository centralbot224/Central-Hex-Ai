// ============================================
// SERVEUR PRINCIPAL CENTRAL-HEX IA
// ============================================

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Import des routes
const chatRoutes = require('./routes/chat');
const imageRoutes = require('./routes/image');
const authRoutes = require('./routes/auth');

dotenv.config();

const app = express();

// ============================================
// MIDDLEWARES DE SÉCURITÉ
// ============================================

app.use(helmet()); // Sécurise les en-têtes HTTP

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limite chaque IP à 100 requêtes
  message: '🚫 Trop de requêtes, réessaie dans 15 minutes'
});
app.use('/api/', limiter);

app.use(cors({
  origin: ['http://localhost:3000', 'https://central-hex-ia.com'],
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ============================================
// CONNEXION MONGODB
// ============================================

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/central-hex', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ Connecté à MongoDB'))
.catch(err => console.error('❌ Erreur MongoDB:', err));

// ============================================
// ROUTES
// ============================================

app.use('/api/chat', chatRoutes);
app.use('/api/image', imageRoutes);
app.use('/api/auth', authRoutes);

// Route de test
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: '🚀 CENTRAL-HEX IA est opérationnel',
    timestamp: new Date()
  });
});

// ============================================
// GESTION DES ERREURS
// ============================================

app.use((err, req, res, next) => {
  console.error('❌ Erreur:', err.stack);
  res.status(err.status || 500).json({
    error: 'Une erreur est survenue',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// ============================================
// DÉMARRAGE DU SERVEUR
// ============================================

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`
  ╔══════════════════════════════════════╗
  ║   🚀 CENTRAL-HEX IA - BACKEND       ║
  ║   📡 Serveur démarré sur port ${PORT}    ║
  ║   🔗 http://localhost:${PORT}            ║
  ╚══════════════════════════════════════╝
  `);
});
