const { createOffer, getAllOffers, updateOffer, getSingleOffer, deleteOffer } = require('../controllers/offerController');
const { protect } = require('../middlewares/protect');
const Admin = require('../models/adminModel');
const router = require('express').Router();

router.route('/')
    .post(protect(Admin), createOffer)
    .get(getAllOffers)

router.route('/:id')
    .put(protect(Admin) , updateOffer)
    .get(getSingleOffer)
    .delete(protect(Admin) , deleteOffer)

module.exports = router;