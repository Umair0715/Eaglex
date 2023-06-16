const router = require('express').Router();
const { createNotification, getAllNotifications, deleteNotification, updateNotification, getSingleNotification } = require('../controllers/notificationController');
const { protect } = require('../middlewares/protect');
const Admin = require('../models/adminModel');

router.route('/')
    .post(protect(Admin) , createNotification)
    .get(getAllNotifications);


router.route('/:id')
    .delete(protect(Admin) , deleteNotification)
    .put(protect(Admin) , updateNotification)
    .get(getSingleNotification)
    

module.exports = router;