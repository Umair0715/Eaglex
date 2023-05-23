const mongoose = require('mongoose');

const walletHistorySchema = new mongoose.Schema({
    amount : {
        type : Number ,
        required : [true , 'Amount is required.']
    } ,
    action : {
        type : String ,
        enum : ['+', '-'],
        required : [true , 'Action is required.']
    } ,
    wallet : {
        type : mongoose.Schema.Types.ObjectId ,
        ref : 'Wallet',
        required : [true , "Wallet id is required."]
    } ,
    user : {
        type : mongoose.Schema.Types.ObjectId ,
        ref : 'User' ,
        required : [true , 'User is required.']
    } ,
    description : {
        type : String ,
        required : [true , 'Description is required.']
    }
} , { timestamps : true });

const WalletHistory = mongoose.model('WalletHistory', walletHistorySchema);
module.exports = WalletHistory;