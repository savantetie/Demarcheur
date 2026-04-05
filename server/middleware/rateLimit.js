const rateLimit = require('express-rate-limit');

/** Limite générale : 100 requêtes / 15 min par IP */
exports.limiteGlobale = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Trop de requêtes, veuillez réessayer dans 15 minutes.' },
});

/** Limite stricte pour l'auth : 10 tentatives / 15 min */
exports.limiteAuth = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Trop de tentatives de connexion. Réessayez dans 15 minutes.' },
  skipSuccessfulRequests: true,
});

/** Limite inscription : 5 comptes / heure par IP */
exports.limiteInscription = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Trop de comptes créés depuis cette IP. Réessayez dans une heure.' },
});
