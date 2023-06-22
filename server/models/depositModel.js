const mongoose = require('mongoose');

const depositSchema = new mongoose.Schema({
    user :{
        type : mongoose.Schema.Types.ObjectId ,
        ref : 'User' ,
        required : [true , 'User is required.'] , 
        index : true 
    } ,
    bankName : {
        type : String ,
        required : [true , 'Bank name is required.']
    } ,
    accountNo : {
        type : String ,
        required : [true , 'Account no is required.']
    } ,
    accountHolder : {
        type : String ,
        required : [true , 'Account holder is required.']
    } ,
    amount : {
        type : Number ,
        required : [true , 'Deposit amount is required.']
    } ,
    proof : {
        type : String ,
        required : [true , 'Deposit receipt image is required.']
    } ,
    transactionId : {
        type : String ,
        default : null 
    } ,
    isActive : {
        type : Boolean ,
        default : true 
    } ,
    status : {
        type : String ,
        enum : ['pending' , 'approved' , 'declined'] ,
        default : 'pending' ,
        index : true
    } , 
    description : {
        type : String ,
        default : null 
    } , 
    transferAmount : {
        type : Number ,
        default : null 
    } , 
    username : {
        type : String ,
        default : null 
    }
}, { timestamps : true });

const moment = require('moment-timezone')
depositSchema.pre('save', function (next) {
    if (this.isNew) {
      this.createdAt = moment().tz('Asia/Karachi');
    }
    next();
});

const Deposit = mongoose.model('Deposit' , depositSchema);
module.exports = Deposit;