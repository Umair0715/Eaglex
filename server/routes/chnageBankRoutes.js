const { createChangeBankRequest, getAllChangeBankRequests, getMyChangeBankRequest, updateChangeBankRequest } = require('../controllers/changeBankController');
const { protect } = require('../middlewares/protect');
const User = require('../models/userModel');
const Admin = require('../models/adminModel');
const router = require('express').Router();

router.route('/')
    .post(protect(User) , createChangeBankRequest)
    .get(protect(Admin) , getAllChangeBankRequests)

router.get('/my' , protect(User) , getMyChangeBankRequest)

router.put('/:id' , protect(Admin) , updateChangeBankRequest)

module.exports = router;