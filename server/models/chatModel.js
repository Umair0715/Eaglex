const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({ 
    user : {
        type : mongoose.Schema.Types.ObjectId ,
        ref : 'User' ,
        required : [true , 'User is required.'] ,
        index : true 
    } ,
    admin : {
        type : mongoose.Schema.Types.ObjectId ,
        ref : 'Admin' ,
        required : [true , 'Admin is required.'] ,
        index : true 
    } ,
    latestMessage : {
        type : mongoose.Schema.ObjectId ,
        ref : 'Message',
    } ,
    isActive : {
        type : Boolean ,
        default : true 
    },
    chatName : {
        type : String ,
    } , 
    isAdminChat : {
        type : Boolean ,
        default : false 
    }
}, { timestamps : true } );

const Chat = mongoose.model('Chat' , chatSchema);
module.exports = Chat;