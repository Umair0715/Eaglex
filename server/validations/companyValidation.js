const joi = require('joi');

const companyValidation = joi.object().keys({
    name : joi.string().required().messages({
        'any.required' : 'Company Name is required.'
    }) ,
    registrationId : joi.string().optional() ,
    location : joi.string().required() ,
    annualTurnover : joi.string().required().messages({
        'any.required' : "Company Annual turnover is required."
    }) ,
    since : joi.required().messages({
        'any.required' : "Company Established date is required."
    }) ,
    owner : joi.string().required().messages({
        'any.required' : "Company owner name is required."
    }) ,
    description : joi.string().required() ,
    logo : joi.string().required() ,
});

module.exports = companyValidation;