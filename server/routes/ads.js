const router = require('express').Router();
const ctrl = require('../controllers/adController');
const { proteger, autoriser } = require('../middleware/auth');

// Public
router.get('/', ctrl.getAds);
router.post('/:id/clic', ctrl.enregistrerClic);

// Agence connectée
router.post('/', proteger, autoriser('agency', 'admin'), ctrl.creerAd);
router.get('/mes-pubs', proteger, ctrl.mesPubs);

// Admin
router.get('/admin/all', proteger, autoriser('admin'), ctrl.adminAll);
router.patch('/admin/:id/statut', proteger, autoriser('admin'), ctrl.adminChangerStatut);

module.exports = router;
