const router = require('express').Router();
const { protect } = require('../middlewares/protect');
const Admin = require('../models/adminModel');
const { updateWalletBalance } = require('../controllers/walletController');

router.put('/update-balance/:id' , protect(Admin) , updateWalletBalance );

module.exports = router;