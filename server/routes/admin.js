const router = require('express').Router();
const ctrl = require('../controllers/adminController');
const { proteger, autoriser } = require('../middleware/auth');

router.use(proteger, autoriser('admin'));

router.get('/tableau', ctrl.tableau);
router.get('/annonces', ctrl.toutesAnnonces);
router.get('/annonces/en-attente', ctrl.annonceEnAttente);
router.patch('/annonces/:id/valider', ctrl.validerAnnonce);
router.get('/utilisateurs', ctrl.gererUtilisateurs);
router.patch('/utilisateurs/:id/toggle', ctrl.toggleUtilisateur);

module.exports = router;
