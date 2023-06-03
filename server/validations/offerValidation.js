const joi = require('joi');

const offerValidation = joi.object().keys({
    name : joi.string().required().messages({
        'any.required' : 'Offer Name is required.'
    }) ,
    depositRange : joi.array().required() ,
    timePeriod : joi.number().required() ,
    profit : joi.number().required().messages({
        'any.required' : "Profit percentage is required."
    }) ,
    image : joi.string().required().messages({
        'any.required' : "Image is required."
    }) ,
    company : joi.string().required().messages({
        'any.required' : "Company is required."
    }) ,
    isActive : joi.boolean().required() ,
    status : joi.string().optional() ,
});

module.exports = offerValidation;