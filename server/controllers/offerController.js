const hanlderFactory = require('./factories/handlerFactory');
const Offer = require('../models/offerModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const { sendSuccessResponse } = require('../utils/helpers');
const uploadImage = require('../utils/uploadImage');
const offerValidation = require('../validations/offerValidation');

const imgDirectory = 'offers'

exports.createOffer = catchAsync(async(req , res , next) => {
    const { image } = req.body;
    const { error } = offerValidation.validate(req.body);
    if(error){
        return next(new AppError(error.details[0].message , 400))
    }
    const { fileName } = uploadImage(image , imgDirectory);
    req.body.image = `/${imgDirectory}/` + fileName;
    const newOffer = await Offer.create(req.body);
    sendSuccessResponse(res , 201 , {
        message : 'Offer created successfully.' ,
        doc : newOffer
    })
});

exports.getAllOffers = hanlderFactory.getAll(Offer , 'company');
exports.getTotalOffers = hanlderFactory.getTotal(Offer , 'company')
exports.updateOffer = hanlderFactory.updateOne(Offer , imgDirectory);
exports.getSingleOffer = hanlderFactory.getOne(Offer , 'company');
exports.deleteOffer = hanlderFactory.deleteOne(Offer);