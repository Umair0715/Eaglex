const joi = require('joi'); 

const addBankValidation = joi.object().keys({
    bankName : joi.string().required().messages({
        'any.required' : "bank name is required."
    }) ,
    accountHolder : joi.string().required().messages({
        'any.required' : "Account holder name is required."
    }) ,
    accountNo : joi.string().required().messages({
        'any.required' : "bank account number is required."
    }) ,
});

module.exports = addBankValidation;