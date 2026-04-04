const router = require('express').Router();
const ctrl = require('../controllers/messageController');
const { proteger } = require('../middleware/auth');

router.post('/annonce/:id', ctrl.envoyerMessage);
router.get('/recus', proteger, ctrl.messagesRecus);
router.patch('/:msgId/lu', proteger, ctrl.marquerLu);

module.exports = router;
