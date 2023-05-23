const { createInvest, getAllInvestments, getMyInvestments, getSingleUserInvestments , getSingleInvestment } = require('../controllers/investController');
const { protect } = require('../middlewares/protect');
const User = require('../models/userModel');
const Admin = require('../models/adminModel');  
const router = require('express').Router();

router.route('/')
    .post(protect(User) , createInvest)
    .get(protect(Admin) , getAllInvestments)

router.get('/my' , protect(User) , getMyInvestments)
router.get('/user/:id' , protect(Admin) , getSingleUserInvestments);

router.get('/:id' , getSingleInvestment)

module.exports = router;