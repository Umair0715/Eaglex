const hanlderFactory = require('./factories/handlerFactory');
const Company = require('../models/companyModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const { sendSuccessResponse } = require('../utils/helpers');
const uploadImage = require('../utils/uploadImage');
const companyValidation = require('../validations/companyValidation');

exports.createCompany = catchAsync(async(req , res ,next) => {
    const { logo } = req.body;
    const { error } = companyValidation.validate(req.body);
    if(error){
        return next(new AppError(error.details[0].message , 400))
    }
    const { fileName } = uploadImage(logo , 'companyLogos');
    req.body.logo = '/companyLogos/' + fileName;
    const newCompany = await Company.create(req.body);
    sendSuccessResponse(res , 201 , {
        message : 'New company added successfully.',
        doc : newCompany
    })
});

exports.getAllCompanies = hanlderFactory.getAll(Company);
exports.deleteCompany = hanlderFactory.deleteOne(Company);
exports.getSingleCompany = hanlderFactory.getOne(Company);

exports.editCompany = catchAsync(async(req , res , next) => {
    const { id } = req.params;
    const { logo } = req.body;
    if(logo) {
        const { fileName } = uploadImage(logo , 'companyLogos');
        req.body.logo = `/companyLogos/` + fileName;
    }
    const updatedDoc = await Company.findByIdAndUpdate(id , req.body , {
        new : true ,
        runValidators : true 
    });
    if(!updatedDoc) return next(new AppError('Invalid id provided.' , 404))
    return sendSuccessResponse(res , 200 , {
        message : 'Document updated successfully.',
        doc : updatedDoc
    })
})

exports.getTotalCompanies = catchAsync(async(req , res ) => {
    const docs = await Company.find().select('name');
    sendSuccessResponse(res , 200 , { docs })
})