const mongoose= require('mongoose');

const bankSchema = new mongoose.Schema({
    user : {
        type : mongoose.Schema.Types.ObjectId , 
        ref : 'User' , 
        required : [true , 'User is required.'] ,
        index : true
    } ,
    bankName : {
        type : String ,
        required : [true , 'Bank name is required.']
    } , 
    accountHolder : {
        type : String ,
        required : [true , 'Account holder is required.']
    } ,
    accountNo : {
        type : String ,
        required : [true , 'account number is required.']
    } , 
    isActive : {
        type : Boolean ,
        default : true ,
        index : true
    }
} , { timestamps : true });


bankSchema.pre(/^find/ , function(next) {
    this.populate('user' , 'firstName lastName isActive phone wallet');
    next();
})

const Bank = mongoose.model('Bank' , bankSchema);
module.exports = Bank;