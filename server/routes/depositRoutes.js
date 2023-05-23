const router = require('express').Router();
const { protect } = require('../middlewares/protect');
const User = require('../models/userModel');
const Admin = require('../models/adminModel');
const { createDepositRequest, getAllDepositRequests, getSingleDepositRequest, updateDepositRequest, deleteDepositRequest, getUserDepositRequests, getMyDepositRequests } = require('../controllers/depositController');


router.route('/')
    .post(protect(User) , createDepositRequest)
    .get(protect(Admin) , getAllDepositRequests)

router.get('/my' , protect(User) , getMyDepositRequests);

router.route('/:id')
    .get(getSingleDepositRequest)
    .put(protect(Admin) , updateDepositRequest)
    .delete(protect(Admin) , deleteDepositRequest)

router.get('/user/:id' , protect(Admin) , getUserDepositRequests)

module.exports = router;