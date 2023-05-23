const mongoose = require('mongoose');

const walletSchema = new mongoose.Schema({
    user : {
        type : mongoose.Schema.Types.ObjectId ,
        ref : 'User' ,
        required : [true , 'User is required.'] ,
        index : true 
    } ,
    totalBalance : {
        type : Number ,
        default : 0 
    } ,
    totalWithdraw : {
        tpye : Number ,
        default : 0
    } 
}, { timestamps : true } );


const Wallet = mongoose.model('Wallet' , walletSchema);
module.exports = Wallet;