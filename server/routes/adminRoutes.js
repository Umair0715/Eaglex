const router = require('express').Router();
const { register, login, getProfile , logout, updatePassword, updateProfile , getDashboardStats } = require('../controllers/adminController');
const { protect } = require('../middlewares/protect');
const Admin = require('../models/adminModel');

router.post('/register' , register);
router.post('/login' , login);
router.route('/profile')
    .get(protect(Admin) , getProfile)
    .put(protect(Admin) , updateProfile);

router.get('/logout' , logout);
router.put('/update-password' , protect(Admin) , updatePassword);
router.get('/dashboard-stats' , protect(Admin) , getDashboardStats)


module.exports = router;