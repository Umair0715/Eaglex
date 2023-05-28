const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
    title : {
        type : String ,
        required : [true , 'Title is required.']
    } ,
    description : {
        type : String ,
        required : [true , 'Description is required']
    } ,
    image : {
        type : String ,
        required : [true , 'Image is required.']
    } ,
    isActive : {
        type : Boolean ,
        default : true 
    }
} , { timestamps : true });

const Notification = mongoose.model('Notification' , notificationSchema);
module.exports = Notification;