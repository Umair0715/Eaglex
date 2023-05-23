const mongoose = require('mongoose');

const changeBankSchema = new mongoose.Schema({
    user : {
        type : mongoose.Schema.Types.ObjectId ,
        ref : 'User' ,
        required : [true , 'User is required.']
    } ,
    prevBankDetails : {
        type : mongoose.Schema.Types.ObjectId ,
        ref : 'Bank' ,
        required : [true , 'Prev bank id is required']
    } , 
    newBankName : {
        type : String ,
        required : [true ,'New Bank name is required.']
    } ,
    newBankAccountHolder : {
        type : String ,
        required : [true , 'New bank account holder is required.']
    } ,
    newBankAccountNo : {
        type : String ,
        required : [true , 'New Bank account number is required.']
    } ,
    status : {
        type : String ,
        enum : ['pending' , 'approved' , 'declined'] ,
        default : 'pending'
    } ,
    description : {
        type : String ,
        default : null
    }

});

const ChangeBank = mongoose.model('ChangeBank' , changeBankSchema);
module.exports = ChangeBank;