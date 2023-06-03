const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    senderType : {
        type : String ,
        enum : ['User' , 'Admin'] ,
        required : [true , 'Sender type is required.']
    } ,
    sender: { 
        type : mongoose.Schema.ObjectId, 
        refPath: "senderType"  ,
    },
    message : { 
        type : String, 
        trim : true 
    },
    chat: { 
        type : mongoose.Schema.ObjectId ,
        ref: "Chat" ,
        required : [true , 'Chat is required.'] 
    },
    status : {
        type : String ,
        enum : ['read' , 'unread'] , 
        default : 'unread'
    } ,
    type : {
        type : String ,
        enum : ['text' , 'file'],
        required : [true , 'Message type is required.']
    } ,
    isActive : { 
        type : Boolean ,
        default : true 
    }
} , { timestamps : true });

const Message = mongoose.model('Message' , messageSchema);
module.exports = Message;