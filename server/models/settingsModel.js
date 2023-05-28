const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
    minWithdraw : {
        type : Number ,
        default : 50 ,
    } ,
    withdrawFee : { // in %
        type : Number ,
        default : 5
    } ,
    minDeposit : {
        type : Number ,
        default : 1000 
    } ,
    bankName : {
        type : String ,
        default : null 
    } ,
    accountNo : {
        type : String , 
        default : null 
    } ,
    accountHolder : {
        type : String ,
        default : null 
    } ,
    levelOneProfit : {
        type : Number ,
        default : 4.1 
    } ,
    levelTwoProfit : {
        type : Number ,
        default : 3.1 
    } ,
    levelThreeProfit : {
        type : Number ,
        default : 2.1 
    } , 
    govtFee : {
        type : Number ,
        default : 3
    } ,
    platformFee : {
        type : Number ,
        default : 2
    }
} , { timestamps : true });

const Setting = mongoose.model('Setting' , settingsSchema);
module.exports = Setting;