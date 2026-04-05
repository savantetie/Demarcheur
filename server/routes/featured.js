const router = require('express').Router();
const ctrl = require('../controllers/featuredController');
const { proteger, autoriser } = require('../middleware/auth');

// Public
router.get('/', ctrl.getAnnoncesBoostees);

// Agence / propriétaire
router.post('/:id/booster', proteger, ctrl.boosterAnnonce);
router.delete('/:id/booster', proteger, ctrl.retirerBoost);

module.exports = router;
