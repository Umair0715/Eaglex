const router = require('express').Router();
const { addBankAccount, getAllbankAccounts , deleteBankAccount, updateBankAccount, getMyBankAccount, getSpecificUserBankAccount , getSingleBank } = require('../controllers/bankController');
const { protect } = require('../middlewares/protect');
const Admin = require('../models/adminModel');
const User = require('../models/userModel');


router.route('/')
    .post(protect(User) , addBankAccount)
    .get(getAllbankAccounts);
    // .get(protect(Admin) , getAllbankAccounts);

router.get('/my' , protect(User) , getMyBankAccount);
router.get('/user/:id' , getSpecificUserBankAccount);

router.route('/:id')
    .delete(protect(Admin) , deleteBankAccount)
    .put(protect(Admin) , updateBankAccount)
    .get(getSingleBank)


module.exports= router;