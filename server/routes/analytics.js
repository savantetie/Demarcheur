const router = require('express').Router();
const ctrl = require('../controllers/analyticsController');
const { proteger, autoriser } = require('../middleware/auth');

// Public (tracking)
router.patch('/listings/:id/vue', ctrl.incrementerVue);
router.patch('/listings/:id/contact', ctrl.incrementerContact);

// Agence
router.get('/agence', proteger, autoriser('agency', 'admin'), ctrl.statsAgence);

// Admin
router.get('/admin', proteger, autoriser('admin'), ctrl.statsAdmin);

module.exports = router;
