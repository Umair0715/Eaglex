const { createInvite , getAllInvites , getMyInvites , deleteInvite } = require('../controllers/inviteController');
const { protect } = require('../middlewares/protect');
const Admin = require('../models/adminModel');
const router = require('express').Router();
const User = require('../models/userModel');

router.route('/')
    .post(protect(User), createInvite)
    .get(protect(Admin) , getAllInvites)
router.get('/my' , getMyInvites);

router.route('/:id')
    .delete(protect(User) , deleteInvite)

module.exports = router;