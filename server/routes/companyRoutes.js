const { createCompany, getAllCompanies, editCompany, getSingleCompany, deleteCompany, getTotalCompanies } = require('../controllers/companyController');
const { protect } = require('../middlewares/protect');
const Admin = require('../models/adminModel');
const router = require('express').Router();

router.route('/')
    .post(protect(Admin) , createCompany)
    .get(getAllCompanies)

router.route('/:id')
    .put(protect(Admin) , editCompany)
    .get(getSingleCompany)
    .delete(protect(Admin) , deleteCompany)

router.get('/get/total' , getTotalCompanies)

module.exports = router;