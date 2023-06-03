const router = require('express').Router();
const messageController = require('../controllers/messageController');

router.route('/:id')
    .get(messageController.getMessages)
    
router.post('/' , messageController.sendMessage);
// router.put('/mark-read/:id' , messageController.markAsReadMessages);

module.exports = router;