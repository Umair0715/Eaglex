const router = require('express').Router();
const { register, login, getProfile, updateProfile, updatePassword, logout, getAllUsers, editUser, deleteUser , getSingleUser, getDashboardDetails, getMyTeamDetails, getSingleUserTeam, searchUser, sendForgotPasswordOtp, verifyOtp, resetPassword, blockUser, addUserDescription } = require('../controllers/userController');
const { protect } = require('../middlewares/protect');
const User = require('../models/userModel');
const Admin = require('../models/adminModel');


router.post('/register' , register);
router.post('/login' , login);
router.route('/profile')
    .get(protect(User) , getProfile)
    .put(protect(User) , updateProfile);

router.put('/update-password' , protect(User) , updatePassword);
router.get('/logout' , logout);

router.get('/all' , protect(Admin) , getAllUsers);
router.put('/edit/:id' , protect(Admin) , editUser );
router.delete('/delete/:id' , protect(Admin) , deleteUser);
router.get('/details/:id' , protect(Admin) , getSingleUser);

router.get('/dashboard-details', protect(User) , getDashboardDetails);
router.get('/my-team-details', protect(User) , getMyTeamDetails);
router.get('/team/:id' , protect(Admin) , getSingleUserTeam)
router.get('/search' , protect(Admin) , searchUser);
router.post('/forgot-password' , sendForgotPasswordOtp);
router.post('/verify-otp' , verifyOtp);
router.post('/reset-password' , resetPassword);

router.put('/block/:id' , protect(Admin) , blockUser);
router.put('/description/:id' , protect(Admin) , addUserDescription);



module.exports = router;