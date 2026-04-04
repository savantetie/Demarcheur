const router = require('express').Router();
const { inscription, connexion, moi } = require('../controllers/authController');
const { proteger } = require('../middleware/auth');

router.post('/inscription', inscription);
router.post('/connexion', connexion);
router.get('/moi', proteger, moi);

module.exports = router;
