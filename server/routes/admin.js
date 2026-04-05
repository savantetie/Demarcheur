const router = require('express').Router();
const ctrl = require('../controllers/adminController');
const { proteger, autoriser } = require('../middleware/auth');

router.use(proteger, autoriser('admin'));

router.get('/tableau', ctrl.tableau);

// Annonces
router.get('/annonces', ctrl.toutesAnnonces);
router.get('/annonces/en-attente', ctrl.annonceEnAttente);
router.patch('/annonces/:id/valider', ctrl.validerAnnonce);

// Utilisateurs
router.get('/utilisateurs', ctrl.gererUtilisateurs);
router.patch('/utilisateurs/:id/toggle', ctrl.toggleUtilisateur);

// Agences
router.get('/agences/en-attente', ctrl.agencesEnAttente);
router.patch('/agences/:id/valider', ctrl.validerAgence);
router.get('/agences/:id/document', ctrl.voirDocumentAgence);

module.exports = router;
