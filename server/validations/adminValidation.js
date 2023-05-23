const joi = require('joi'); 

const adminValidation = joi.object().keys({
    firstName : joi.string().required().min(3) ,
    lastName : joi.string().required().min(3) ,
    phone : joi.string().required().min(11).max(11) ,
    password : joi.string().optional() , 
    isSuperAdmin : joi.optional()
});

module.exports = adminValidation;