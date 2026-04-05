const router = require('express').Router();
const ctrl = require('../controllers/authController');
const alertCtrl = require('../controllers/alertController');
const { proteger } = require('../middleware/auth');
const uploadDoc = require('../middleware/uploadDoc');
const uploadAvatar = require('../middleware/uploadAvatar');
const { validerInscriptionUser, validerInscriptionAgence, validerConnexion } = require('../middleware/validate');
const { limiteAuth, limiteInscription } = require('../middleware/rateLimit');

// Inscription
router.post('/inscription/user', limiteInscription, validerInscriptionUser, ctrl.inscriptionUser);
router.post('/inscription/agence', limiteInscription, validerInscriptionAgence, ctrl.inscriptionAgence);

// Connexion / session
router.post('/connexion', limiteAuth, validerConnexion, ctrl.connexion);
router.get('/moi', proteger, ctrl.moi);
router.put('/profil', proteger, ctrl.modifierProfil);

// Vérification email
router.get('/verifier-email/:token', ctrl.verifierEmail);

// Avatar
router.post('/avatar', proteger, uploadAvatar.single('avatar'), ctrl.uploadAvatar);
router.delete('/avatar', proteger, ctrl.supprimerAvatar);

// Document RCCM agence
router.post('/agence/document', proteger, uploadDoc.single('document'), ctrl.uploadDocumentAgence);

// Favoris
router.post('/favoris/:id', proteger, ctrl.toggleFavori);
router.get('/favoris', proteger, ctrl.mesFavoris);

// Alertes
router.get('/alertes', proteger, alertCtrl.mesAlertes);
router.post('/alertes', proteger, alertCtrl.creerAlerte);
router.delete('/alertes/:id', proteger, alertCtrl.supprimerAlerte);
router.patch('/alertes/:id/toggle', proteger, alertCtrl.toggleAlerte);

module.exports = router;
