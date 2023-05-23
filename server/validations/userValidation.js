const joi = require('joi'); 

const userValidation = joi.object().keys({
    firstName : joi.string().required().min(3) ,
    lastName : joi.string().required().min(3) ,
    phone : joi.string().required().min(11).max(11) ,
    password : joi.string().optional() , 
});

module.exports = userValidation;