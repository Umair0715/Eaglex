const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const Withdraw = require('../models/withdrawModel');
const handlerFactory = require('./factories/handlerFactory');
const Wallet = require('../models/walletModel');
const Bank = require('../models/bankModel');
const { sendSuccessResponse } = require('../utils/helpers');
const AdminWallet = require('../models/adminWalletModel');
const Admin = require('../models/adminModel');
const Setting = require('../models/settingsModel');
const uploadImage = require('../utils/uploadImage');
const User = require('../models/userModel')
const createWalletHistory = require('../utils/CreateWalletHistory');


exports.createWithdrawRequest = catchAsync(async(req , res , next) => {
    const { bankDetails , amount } = req.body;
    if(!amount) {
        return next(new AppError('withdrawal amount is required credentials.' , 400));
    }
    if(!bankDetails) {
        return next(new AppError('Bank details id is required.'))
    }
    const userBank = await Bank.findOne({ _id : bankDetails });
    if(!userBank) { 
        return next(new AppError('Invalid bank details. Bank account not found.' , 404))
    } 
    const userWallet = await Wallet.findOne({ user : req.user._id });
    if(userWallet.totalBalance < amount) {
        return next(new AppError('You have insufficient balance to withdraw this amount.' , 400))
    }
    const settings = await Setting.findOne({});
    if(amount < settings.minWithdraw){
        return next(new AppError(`Minimum Withdraw amount is ${settings.minWithdraw}` , 400))
    }

    // Set the time zone to Pakistan
    const moment = require('moment-timezone');

    const currentTime = moment().tz('Asia/Karachi');
    const startTime = moment().tz('Asia/Karachi').set({ hour: 10, minute: 0, second: 0, millisecond: 0 });
    const endTime = moment().tz('Asia/Karachi').set({ hour: 17, minute: 0, second: 0, millisecond: 0 });

    if (currentTime.isBefore(startTime) || currentTime.isAfter(endTime)) {
        return next(new AppError('Withdrawals can only be made between 10:00 AM to 5:00 PM Pakistan time.', 400));
    }

    // Check if the user has already made a withdrawal request today
    const today = moment().startOf('day');
    const userWithdrawals = await Withdraw.find({
        user: req.user._id,
        createdAt: { $gte: today.toDate() },
    });

    if (userWithdrawals.length > 0) {
        return next(new AppError('You can create only one withdrawal request per day. Please try again tomorrow.', 400));
    }

    userWallet.totalBalance -= Number(amount);
    await userWallet.save();

    const admin = await Admin.findOne({ isSuperAdmin : true })
    const adminWallet = await AdminWallet.findOne({ admin : admin._id });
    const withdrawFee = (amount/100) * settings.platformFee;
    adminWallet.totalBalance += withdrawFee;
    await adminWallet.save();

    const newRequest = await Withdraw.create({
        user : req.user._id ,
        bankDetails ,
        withdrawAmount : amount ,
        withdrawFee ,
        receivedAmount : amount ,
        username : req.user.firstName + ' ' + req.user.lastName ,
        receivedAmount : amount - withdrawFee
    });
    console.log({ withdrawRequest : newRequest });

    createWalletHistory(amount , '-' , userWallet._id , req.user._id , 'withdrawn');

    sendSuccessResponse(res , 200 , { 
        message : 'Withdraw request created successfully.' ,
        doc : newRequest
    })
});

const fetchWithdrawRequests = async (req , res , query) => {
    try {
        const pageSize = 10;
        const page = parseInt(req.query.page) || 1;
        let filter = {};
        const status = req.query.status;
        if(status === 'pending') {
            filter = { status : 'pending' }
        }else if (status === 'completed') {
            filter = { status : 'completed' }
        }else if (status === 'declined'){
            filter = { status : 'declined' }
        }

        const range = req.query.range;

        const start = new Date();
        start.setHours(0, 0, 0, 0);
        const end = new Date();
        end.setHours(23, 59, 59, 999);
        if (range === 'today') {
            filter = {...filter , createdAt: { $gte: start, $lte: end } };
        } else if (range === 'week') {
            start.setDate(start.getDate() - 7);
            filter = {...filter , createdAt: { $gte: start, $lte: end } };
        }else if (range === 'yesterday') {
            const yesterdayStart = new Date(start);
            yesterdayStart.setDate(start.getDate() - 1);
            const yesterdayEnd = new Date(end);
            yesterdayEnd.setDate(end.getDate() - 1);
            filter = { ...filter, createdAt: { $gte: yesterdayStart, $lte: yesterdayEnd } };
        }

        const keyword = req.query.keyword ?
        {
            username : {
                $regex : req.query.keyword ,
                $options : 'i'
            }
        } : {} ;  
        const docCount = await Withdraw.countDocuments({
            ...keyword , ...filter , ...query
        });
        const docs = await Withdraw.find({...keyword , ...filter , ...query})
        .populate([
            {
                path : 'bankDetails' ,
                select : '-__v'
            } ,
            {
                path : 'user' ,
                select : 'firstName lastName wallet phone isActive'
            }
        ])
        .limit(pageSize)
        .skip(pageSize * (page - 1))
        .sort({ createdAt : -1 });
        const pages = Math.ceil(docCount/pageSize);
        sendSuccessResponse(res , 200 , {
            docs , page , pages , docCount 
        })
    } catch (error) {
        throw Error(error);
    }
} 

exports.getAllWithdrawRequests = catchAsync(async(req ,res ) => {
    await fetchWithdrawRequests(req , res , {})
});
exports.getSingleUserWithdrawRequests = catchAsync(async(req ,res ) => {
    await fetchWithdrawRequests(req , res , { user : req.params.id })
}); 
exports.getMyWithdrawRequests = catchAsync(async(req ,res ) => {
    await fetchWithdrawRequests(req , res , { user : req.user._id })
}); 

exports.updateWithdrawRequest = catchAsync(async(req , res , next) => {
    const { id } = req.params;
    if(!id) {
        return next(new AppError('Withdraw request id is required.' , 400))
    }
    const { proof } = req.body;
    if(proof) {
        const { fileName } = uploadImage(proof , 'withdraw');
        req.body.proof = '/withdraw/' + fileName ;
    }
    const updatedRequest = await Withdraw.findByIdAndUpdate(id , req.body , {
        new : true ,
        runValidators : true 
    }).populate('user');
    
    if(req.body.status === 'declined') {
        const userWallet = await Wallet.findOne({ user : updatedRequest.user._id  });
        userWallet.totalBalance += updatedRequest.withdrawAmount;
        await userWallet.save();
         
        const admin = await Admin.findOne({ isSuperAdmin : true });
        const adminWallet = await AdminWallet.findOne({ admin : admin._id });
        adminWallet.totalBalance -= updatedRequest.withdrawFee;
        await adminWallet.save();
    }
    sendSuccessResponse(res , 200 , {
        message : "Withdraw request updated successfully." ,
        doc : updatedRequest
    })
});

exports.getSingleWithdrawRequest = handlerFactory.getOne(Withdraw , ['bankDetails' , 'user'])