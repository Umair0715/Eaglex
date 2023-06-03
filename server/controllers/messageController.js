const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const { sendSuccessResponse }= require('../utils/helpers');
const Message = require('../models/messageModel');
const Chat = require('../models/chatModel');
const uploadImage = require('../utils/uploadImage');



exports.sendMessage = catchAsync( async( req , res , next) => {
    const { message , chatId , sender } = req.body;
    if(!message || !chatId || !sender){
        return next(new AppError('Missing required credentails.' ,400))
    }
    if(req.body.type === 'file') {
        const { fileName } = uploadImage(message , 'messages');
        req.body.message = '/messages/' + fileName;
    }
    req.body.chat = chatId;
    let newMessage = await Message.create(req.body);

    newMessage = await Message.findById(newMessage._id)
    .populate('sender')
    .populate({ 
        path : 'chat' ,
    });
    await Chat.findByIdAndUpdate(chatId , { latestMessage : newMessage?._id });
    return sendSuccessResponse(res , 200 , { 
        doc : newMessage 
    })
});

exports.getMessages = catchAsync( async ( req , res ) => {
    const { id } = req.params;
    const messages = await Message.find({ chat : id })
    .populate('sender');
    try {
        await Message.updateMany({ chat: id, status: 'unread' }, { $set: { status: 'read' }});
    } catch (error) {
        console.log({error})
    }

    return sendSuccessResponse(res , 200 , { 
        docs : messages 
    })
});


// exports.markAsReadMessages = catchAsync(async(req , res) => {
//     const { id } = req.params;
//     await Message.updateMany({ chat : id , status : 'unread'} , { $Set : { status : 'read'}});
//     sendSuccessResponse(res , 200 , { message : 'done' })
// })
