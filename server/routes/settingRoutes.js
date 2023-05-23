const { createSettings, getSettings, updateSettings, deleteSettings } = require('../controllers/settingsController');
const { protect } = require('../middlewares/protect');
const Admin = require('../models/adminModel');
const router = require('express').Router();

router.route('/')
    .post(protect(Admin) , createSettings)
    .get(getSettings)

router.route('/:id')
    .put(protect(Admin), updateSettings)
    .delete(protect(Admin) , deleteSettings)

module.exports= router;