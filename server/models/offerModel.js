const mongoose = require('mongoose');

const offerSchema = new mongoose.Schema({
    name : {
        type : String ,
        trim : true ,
        required : [true , 'Offer name is required.']
    } ,
    depositRange : {
        type : Array ,
        required : [true , 'Deposit range is required.']
    } ,
    timePeriod : { // in days , EX : 2 , 3 , 4
        type : Number ,
        required : [true , 'Offer time period is required']
    } ,
    profit : { // in %
        type : Number ,
        required : [true , 'Profit percentage is required.'] 
    } ,
    image : {
        type : String ,
        required : [true , 'Image is required.']
    } ,
    company : {
        type : mongoose.Schema.Types.ObjectId ,
        ref : 'Company' ,
        required : [true , 'Company is required']
    } ,
    isActive : {
        type : Boolean ,
        default : true 
    } ,
    status : {
        type : String ,
        default : null 
    } 
} , { timestamps : true });

const Offer = mongoose.model('Offer' , offerSchema);
module.exports = Offer;