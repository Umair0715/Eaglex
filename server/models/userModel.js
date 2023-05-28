const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    firstName : {
        type : String ,
        trim : true ,
        required : [true , 'FirstName is required.']
    } ,
    lastName : {
        type : String ,
        trim : true ,
        required : [true , 'LastName is required.']
    } ,
    phone : {
        type : String ,
        trim : true , 
        unique : true , 
        index : true ,
        required : [true , 'Phone no is required.']
    } ,
    image : {
        type : String ,
        default : 'default.png' 
    } ,
    password : {
        type : String ,
        required : [true , 'Password is required.']
    } ,
    isActive : {
        type : Boolean ,
        default : true 
    } ,
    wallet : {
        type : mongoose.Schema.ObjectId ,
        ref : 'Wallet' ,
        default : null 
    } ,
    totalProfit : {
        type : Number ,
        default : 0 
    } ,
    referralCode : {
        type : String ,
        index : true ,
        required : [true , 'ReferralCode is required.']
    } ,
    referrer : {
        type : String ,
        default : null 
    } ,
    totalInvestAmount : {
        type : Number ,
        default : null
    }

} , { timestamps : true });

userSchema.pre('save' , async function(next) {
    if(!this.isModified('password')) return;
    this.password = await bcrypt.hash(this.password , 10);
    next();
});

userSchema.methods.comparePassword = async function (givenPassword) {
    return await bcrypt.compare(givenPassword , this.password)
}

const User = mongoose.model('User' , userSchema);
module.exports = User;