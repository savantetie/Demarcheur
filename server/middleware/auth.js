const jwt = require('jsonwebtoken');
const User = require('../models/User');

/** Vérifie le token JWT et charge l'utilisateur */
exports.proteger = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Accès refusé. Connectez-vous.' });
  }
  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user || !user.actif || user.banniere) {
      return res.status(401).json({ message: 'Compte introuvable ou suspendu.' });
    }
    req.user = user;
    next();
  } catch {
    res.status(401).json({ message: 'Token invalide ou expiré.' });
  }
};

/** Vérifie que l'utilisateur a l'un des rôles autorisés */
exports.autoriser = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ message: 'Accès interdit. Permissions insuffisantes.' });
  }
  next();
};

/** Vérifie qu'une agence est validée par l'admin */
exports.agenceValidee = (req, res, next) => {
  if (req.user.role === 'admin') return next();
  if (req.user.role === 'agency' && !req.user.agence?.valide) {
    return res.status(403).json({ message: 'Votre compte agence est en attente de validation.' });
  }
  next();
};

/** Vérifie la limite d'annonces selon le rôle */
exports.verifierLimiteAnnonces = async (req, res, next) => {
  try {
    if (req.user.role === 'admin') return next();
    if (req.user.role === 'agency') {
      if (!req.user.agence?.valide) {
        return res.status(403).json({ message: 'Votre compte agence est en attente de validation.' });
      }
      return next();
    }
    // Utilisateur standard : max 3 annonces
    const Listing = require('../models/Listing');
    const count = await Listing.countDocuments({ proprietaire: req.user._id });
    if (count >= 3) {
      return res.status(403).json({
        message: 'Limite atteinte. Les particuliers peuvent publier 3 annonces maximum. Créez un compte agence pour plus.',
      });
    }
    next();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
