const mongoose = require('mongoose');

const withdrawSchema = new mongoose.Schema({
    user : {
        type : mongoose.Schema.Types.Object ,
        ref : 'User' ,
        required : [true , 'User is required.']
    } ,
    bankDetails : {
        type : mongoose.Schema.Types.ObjectId ,
        ref : 'Bank' ,
        required : [true , 'Bank details is required.']
    } ,
    withdrawAmount : {
        type : Number , 
        required : [true , 'Withdrawal amount is required.']
    } ,
    status : {
        type : String ,
        enum : ['pending' , 'declined' , 'completed'] ,
        default : 'pending'
    } ,
    proof : {
        type : String ,
        default : null
    } ,
    description : {
        type : String ,
        default : null
    } ,
    withdrawFee : {
        type : Number ,
        required : [true , 'Withdraw fee is required.']
    } ,
    receivedAmount : {
        type : Number ,
        required : [true , 'Received amount is required.']
    } , 
    username : {
        type : String ,
        default : null 
    }
} , { timestamps : true });

const moment = require('moment-timezone')
withdrawSchema.pre('save', function (next) {
    if (this.isNew) {
      this.createdAt = moment().tz('Asia/Karachi');
    }
    next();
});

const Withdraw = mongoose.model('Withdraw' , withdrawSchema);
module.exports = Withdraw;