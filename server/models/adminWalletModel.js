const mongoose = require('mongoose');

const AdminWalletSchema = new mongoose.Schema({
    admin : {
        type : mongoose.Schema.Types.ObjectId ,
        ref : 'Admin' ,
        required : [true , 'Admin is required.'] ,
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


const AdminWallet = mongoose.model('AdminWallet' , AdminWalletSchema);
module.exports = AdminWallet;