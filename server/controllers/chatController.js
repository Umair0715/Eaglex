const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const Chat = require('../models/chatModel');
const { sendSuccessResponse } = require('../utils/helpers');
const User = require('../models/userModel');
const Admin = require('../models/adminModel');
const Message = require('../models/messageModel');


exports.createChat= catchAsync(async( req , res , next) => {
    const { userId } = req.body;
    if (!userId) {
        return next(new AppError('User id is required.' , 400))
    }
    const admin = await Admin.findOne({ isSuperAdmin : true })
    var chatExist = await Chat.findOne({
        user : userId ,
        admin : admin._id 
    })
    .populate("user", "firstName lastName phone image")
    .populate({
        path : "latestMessage" ,
        populate : {
            path : 'sender' ,
            select : 'firstName lastName phone image'
        }
    })
    .populate('admin' , 'firstName lastName phone')
   
    if (chatExist) {
        return sendSuccessResponse(res, 200 , { 
            doc :  chatExist 
        })
    } else {
        const chatUser = await User.findById(userId).select('firstName lastName')

        let newChat = await Chat.create({ 
            ...req.body ,
            user : userId ,
            admin : admin._id ,
            chatName : chatUser?.firstName + " " + chatUser?.lastName 
        });
        newChat = await Chat.findById(newChat._id).populate(
            "user",
            "firstName lastName phone image"
        ).populate('admin' , 'firstName lastName phone');

        return sendSuccessResponse(res , 201 , {
            message : 'Chat created successfully.' ,
            doc : newChat 
        })
    }
});

exports.getMyChat = catchAsync(async( req , res , next) => {
    let chat = await Chat.findOne({ user : req.user._id })
    .populate('user' , 'firstName lastName phone image')
    .populate({ 
        path : 'latestMessage',
        populate : { 
            path : 'sender', 
            select : 'firstName lastName phone image'
        }
    }).populate('admin' , 'firstName lastName phone')
    if(chat){
        const messages = await Message.find({ chat : chat._id })
        .populate('sender' , 'firstName lastName phone');
        return sendSuccessResponse(res , 200 , {
            chatExist : true ,
            chat , 
            messages 
        })
    }else {
        sendSuccessResponse(res , 200 , { 
            chatExist : false ,
            chat : null ,
            messages : null  
        });
    }
});

exports.getAdminChats = catchAsync(async( req , res , next) => {
    const page = Number(req.query.page) || 1 ;
    const pageSize = 15;

    const keyword = req.query.keyword ? {
        chatName : {
            $regex : req.query.keyword ,
            $options : 'i'
        }
    } 
    : {};
    
    const docCount = await Chat.countDocuments();
    let chats = await Chat.find({...keyword , admin : req.user._id , latestMessage: { $exists: true } })
    .populate('user' , 'firstName lastName phone image')
    .populate({ 
        path : 'latestMessage',
        populate : { 
            path : 'sender', 
            select : 'firstName lastName phone image'
        }
    })
    .populate('admin' , 'firstName lastName phone')
    .skip(pageSize * (page - 1))
    .limit(pageSize)
    .sort({ updatedAt : -1 })

    const pages = Math.ceil(docCount/pageSize);
    console.log({ page , pages , docCount })
    sendSuccessResponse(res , 200 , { 
        docs : chats ,
        page , pages , docCount  
    });
});


exports.deleteChat = catchAsync(async(req ,res, next) => {
    const { id } = req.params;
    if(!id){
        return next(new AppError('Chat id is required.' , 400))
    }
    await Chat.findByIdAndDelete(id);
    return sendSuccessResponse(res , 200 , { 
        message : 'Chat deleted successfully.'
    });
});

exports.getSingleChat = catchAsync(async (req , res , next) => {
    const { userId } = req.body;
    if (!userId) {
        return next(new AppError('User id is required.' , 400))
    }
    var chat = await Chat.findOne({ user : userId , admin : req.user._id })
    .populate("users", "firstName lastName phone image")
    .populate({
        path : 'latestMessage',
        populate : {
            path : 'sender' ,
            select : 'firstName lastName phone image'
        }
    })
    .populate('admin' , 'firstName lastName phone');
   
   
    return sendSuccessResponse(res, 200 , { 
        doc : chat  
    })
});