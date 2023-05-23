const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const adminSchema = new mongoose.Schema({
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
        required : [true , 'Phone no is required.']
    } ,
    password : {
        type : String ,
        required : [true , 'Password is required.']
    } ,
    isSuperAdmin : {
        type : Boolean ,
        default : false 
    } ,
    wallet : {
        type : mongoose.Schema.ObjectId ,
        ref : 'Wallet' ,
        default : null 
    } ,
    isActive : {
        type : Boolean ,
        default : true 
    }
} , { timestamps : true });

adminSchema.pre('save' , async function(next) {
    if(!this.isModified('password')) return;
    this.password = await bcrypt.hash(this.password , 10);
    next();
});

adminSchema.methods.comparePassword = async function (givenPassword) {
    return await bcrypt.compare(givenPassword , this.password)
}

const Admin = mongoose.model('Admin' , adminSchema);
module.exports = Admin;