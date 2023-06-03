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

exports.createWithdrawRequest = catchAsync(async(req , res , next) => {
    const { bankDetails , amount } = req.body;
    if(!amount) {
        return next(new AppError('withdrawal amount is required credentials.' , 400));
    }
    if(!bankDetails) {
        return next(new AppError('Bank details id is required.'))
    }
    const userBank = await Bank.findOne({ _id : bankDetails , isActive : true });
    if(!userBank) { 
        return next(new AppError('Invalid bank details. Bank account not found.' , 404))
    } 
    const userWallet = await Wallet.findOne({ user : req.user._id });
    if(userWallet.totalBalance < amount) {
        return next(new AppError('You have insufficient balance to withdraw this amount.' , 400))
    }
    userWallet.totalBalance -= Number(amount);
    await userWallet.save();

    const admin = await Admin.findOne({ isSuperAdmin : true })
    const adminWallet = await AdminWallet.findOne({ admin : admin._id });
    const settings = await Setting.findOne({});
    const withdrawFee = (amount/100) * (settings.govtFee + settings.platformFee);
    adminWallet.totalBalance += withdrawFee;
    await adminWallet.save();

    const newRequest = await Withdraw.create({
        user : req.user._id ,
        bankDetails ,
        withdrawAmount : amount ,
        withdrawFee ,
        receivedAmount : amount - withdrawFee
    });
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
        const docCount = await Withdraw.countDocuments({...filter , ...query})
        const docs = await Withdraw.find({...filter , ...query})
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

        console.log({ docs })

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
    await fetchWithdrawRequests(req , res , { user : req.params._id })
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