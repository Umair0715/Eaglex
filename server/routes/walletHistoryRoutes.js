const router = require('express').Router();
const { protect } = require('../middlewares/protect');
const User = require('../models/userModel');
const Admin = require('../models/adminModel');
const { getAllWalletHistory , getMyWalletHistory , getSingleUserWalletHistory } = require('../controllers/walletHistoryController')

router.get('/' , protect(Admin) , getAllWalletHistory)
router.get('/my' , protect(User) , getMyWalletHistory);
router.get('/:id' , protect(Admin) , getSingleUserWalletHistory)

module.exports = router;