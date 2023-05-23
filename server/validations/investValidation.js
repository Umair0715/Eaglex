const joi = require('joi');

const investValidation = joi.object().keys({
    offer : joi.string().required().messages({
        'any.required' : 'Offer id is required.'
    }) ,
    amount : joi.number().required().messages({
        'any.required' : 'Deposit amount is required.'
    }) 
});

module.exports = investValidation;