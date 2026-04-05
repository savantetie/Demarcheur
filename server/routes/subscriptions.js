const router = require('express').Router();
const ctrl = require('../controllers/subscriptionController');
const { proteger, autoriser } = require('../middleware/auth');

// Public
router.get('/plans', ctrl.getPlans);

// Agence connectée
router.get('/mon-abonnement', proteger, ctrl.monAbonnement);
router.post('/souscrire', proteger, autoriser('agency'), ctrl.souscrire);
router.post('/simuler-paiement/:id', proteger, autoriser('agency'), ctrl.simulerPaiement);
router.get('/historique', proteger, ctrl.historique);

// Admin
router.get('/admin/all', proteger, autoriser('admin'), ctrl.adminAll);
router.patch('/admin/:id/confirmer', proteger, autoriser('admin'), ctrl.adminConfirmer);

module.exports = router;
