const { createChat, getAdminChats, deleteChat, getMyChat, getSingleChat } = require('../controllers/chatController');
const Admin = require('../models/adminModel');
const { protect } = require('../middlewares/protect');
const User = require('../models/userModel');

const router = require('express').Router();

router.route('/')
    .post(createChat)
    
router.get('/admin', protect(Admin) , getAdminChats);
router.get('/my' , protect(User) , getMyChat)
router.delete('/:id' , protect(Admin) , deleteChat)
router.get('/:id' , protect(Admin) , getSingleChat) // ye route protected h only for admin bcz user ki sirf ek hi chat hogi or wo /my endpoint sy hi get kr skta h , isliye multiple chats sirf admin ki hongi or wahi get kr skta h single chat
module.exports = router;