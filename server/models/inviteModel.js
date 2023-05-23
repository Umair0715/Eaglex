const mongoose = require('mongoose');

const inviteSchema = new mongoose.Schema({
    user : {
        type : mongoose.Schema.Types.ObjectId ,
        ref : 'User' ,
        required : [true , 'User id is required.']
    } ,
    invitedUser : {
        type : mongoose.Schema.Types.ObjectId ,
        ref : 'User' ,
        required : [true , 'User id is required.'] 
    }
} , { timestamps : true });

const Invite = mongoose.model('Invite' , inviteSchema);
module.exports = Invite;