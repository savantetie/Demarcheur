const router = require('express').Router();
const ctrl = require('../controllers/listingController');
const { proteger, autoriser } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/', ctrl.getAnnonces);
router.get('/mes-annonces', proteger, ctrl.mesAnnonces);
router.get('/:id', ctrl.getAnnonce);

const handleUpload = (req, res, next) => {
  upload.array('photos', 8)(req, res, (err) => {
    if (err) {
      console.error('Erreur upload:', err);
      return res.status(500).json({ message: 'Erreur upload photo: ' + err.message });
    }
    next();
  });
};

router.post('/', proteger, autoriser('proprietaire', 'admin'), handleUpload, ctrl.creerAnnonce);
router.put('/:id', proteger, handleUpload, ctrl.modifierAnnonce);
router.patch('/:id/statut', proteger, ctrl.changerStatut);
router.delete('/:id', proteger, ctrl.supprimerAnnonce);

module.exports = router;
