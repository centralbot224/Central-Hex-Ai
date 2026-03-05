const express = require('express');
const router = express.Router();

// Route d'inscription
router.post('/register', (req, res) => {
  res.json({ message: "Route d'inscription - À implémenter" });
});

// Route de connexion
router.post('/login', (req, res) => {
  res.json({ message: "Route de connexion - À implémenter" });
});

// Route de déconnexion
router.post('/logout', (req, res) => {
  res.json({ message: "Déconnexion réussie" });
});

// Route pour vérifier le token
router.get('/verify', (req, res) => {
  res.json({ message: "Token valide" });
});

module.exports = router;
