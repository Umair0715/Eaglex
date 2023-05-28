const joi = require('joi');

const depositValidation = joi.object().keys({
    bankName : joi.string().required().messages({
        'any.required' : 'Bank name is required.'
    }) ,
    accountNo : joi.string().required().messages({
        'any.required' : 'Bank account number is required.'
    }) ,
    accountHolder : joi.string().required().messages({
        'any.required' : 'Account holder name is required.'
    }) ,
    amount : joi.number().required().messages({
        'any.required' : 'Deposit amount is required.'
    }) ,
    proof : joi.string().required().messages({
        'any.required' : 'Transaction receipt image is required.'
    }) ,
    transactionId : joi.string().optional()
});

module.exports = depositValidation;