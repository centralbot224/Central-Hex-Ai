// ============================================
// MIDDLEWARE D'AUTHENTIFICATION
// ============================================

const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  try {
    // Récupérer le token du header
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        error: 'Accès non autorisé' 
      });
    }

    // Vérifier le token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    
    next();
  } catch (error) {
    res.status(401).json({ 
      success: false, 
      error: 'Token invalide' 
    });
  }
};

module.exports = authMiddleware;
