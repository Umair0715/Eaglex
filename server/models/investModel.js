const mongoose = require('mongoose');

const investSchema = new mongoose.Schema({
    offer : {
        type : mongoose.Schema.Types.ObjectId ,
        ref : 'Offer' ,
        required : [true , 'Offer is required']
    } ,
    user : {
        type : mongoose.Schema.Types.ObjectId , 
        ref : 'User' , 
        required : [true , 'User is required.']
    } , 
    amount : {
        type : Number ,
        required : [true , 'Invest amount is required.']
    } ,
    progress : {
        type : Number ,
        default : 0 
    } ,
    profitEarnedInPer : { // in %
        type : Number ,
        default : 0 , 
    } , 
    profitEarnedInAmount : {
        type : Number ,
        default : 0
    } , 
    totalProfitReturnInPer : { // in %
        type : Number ,
        required : [true , 'Total Profit returned is required.']
    } ,
    totalProfitReturnInAmount : { // in %
        type : Number ,
        required : [true , 'Total Profit returned is required.']
    } ,
    offerProfit : { // %
        type : Number ,
        required : [true , 'Offer profit is required.']
    } , 
    returnProfitAmount : { // numbers
        type : Number ,
        required : [true , 'Return profit amount is required.']
    } ,
    startDate : {
        type : Date ,
        default : null 
    } ,
    endDate : {
        type : Date ,
        default : null 
    } ,
    status : {
        type : String ,
        enum : ['running' , 'completed' , 'claimed'], // jb wo complete hony k bad apni amount wallet my ly ly ga tw claimed kr deingy
        default : 'running'
    } , 
    isActive : {
        type : Boolean ,
        default : true 
    } ,
    profitClaimed : {
        type : Boolean ,
        default : false 
    }
} , { timestamps : true });

const Invest = mongoose.model('Invest' , investSchema);
module.exports = Invest;