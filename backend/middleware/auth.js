const jwt = require('jsonwebtoken');
const Student = require('../models/Student');
const Company = require('../models/Company');

// 🔐 Protéger les routes
const protect = async (req, res, next) => {
  let token;

  // Vérifier le header Authorization
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    try {
      // Extraire le token
      token = req.headers.authorization.split(' ')[1];

      // Vérifier le token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Récupérer l'utilisateur selon le rôle
      if (decoded.role === 'student') {
        req.user = await Student.findById(decoded.id).select('-password');
      } else if (decoded.role === 'company') {
        req.user = await Company.findById(decoded.id).select('-password');
      }

      // Sécurité : stocker le rôle
      req.user.role = decoded.role;

      if (!req.user) {
        return res.status(404).json({ message: 'Utilisateur introuvable' });
      }

      next();
      return; // ⚠️ IMPORTANT pour éviter la suite du code
    } catch (error) {
      return res.status(401).json({
        message: 'Token invalide ou expiré'
      });
    }
  }

  // Aucun token
  return res.status(401).json({
    message: 'Pas de token, accès refusé'
  });
};

// 🔑 Vérifier les rôles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Accès refusé pour le rôle ${req.user?.role || 'inconnu'}`
      });
    }
    next();
  };
};

module.exports = {
  protect,
  authorize
};
