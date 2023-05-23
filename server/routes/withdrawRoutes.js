const { createWithdrawRequest, getAllWithdrawRequests, getSingleUserWithdrawRequests, updateWithdrawRequest, getMyWithdrawRequests , getSingleWithdrawRequest } = require('../controllers/withdrawController');
const { protect } = require('../middlewares/protect');
const User = require('../models/userModel');
const Admin = require('../models/adminModel');
const router = require('express').Router();

router.route('/')
    .post(protect(User) , createWithdrawRequest)
    .get(getAllWithdrawRequests)

router.get('/user/:id' , getSingleUserWithdrawRequests);
router.get('/my' , protect(User) , getMyWithdrawRequests);

router.route('/:id')
    .put(protect(Admin) , updateWithdrawRequest)
    .get(getSingleWithdrawRequest)


module.exports = router;