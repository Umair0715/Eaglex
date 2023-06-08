const mongoose= require('mongoose');

const companySchema = new mongoose.Schema({
    name : {
        type : String ,
        required : [true , 'Company name is required']
    } ,
    registrationId : {
        type : String ,
        default : null
    } ,
    location : {
        type : String ,
        required : [true , 'Location is required']
    } ,
    annualTurnover : {
        type : String ,
        required : [true , 'Company Turnover is required']
    } ,
    since : {
        type : String ,
        required : [true , 'Established year is required']
    } ,
    owner : {
        type : String ,
        required : [true , 'Owner name is required']
    } ,
    description : {
        type : String ,
        default : null 
    } , 
    logo : {
        type : String ,
        required : [true , 'Company Logo is required.']
    } ,
    isActive : {
        type : Boolean ,
        default : true 
    }
});

const Company = mongoose.model('Company' , companySchema);
module.exports = Company;