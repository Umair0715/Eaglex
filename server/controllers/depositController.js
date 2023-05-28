const hanlderFactory = require('./factories/handlerFactory');
const Deposit = require('../models/depositModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const { sendSuccessResponse } = require('../utils/helpers');
const uploadImage = require('../utils/uploadImage');
const depositValidation = require('../validations/depositValidation');
const Wallet = require('../models/walletModel');
const User = require('../models/userModel');
const createWalletHistory = require('../utils/CreateWalletHistory');
const sendTeamBonus = require('../utils/sendTeamBonus');

const imgDirectory = 'deposits';

exports.createDepositRequest = catchAsync(async(req , res , next) => {
    const { proof } = req.body;
    const { error } = depositValidation.validate(req.body);
    if(error){
        return next(new AppError(error.details[0].message , 400))
    }
    const { fileName } = uploadImage(proof , imgDirectory);
    req.body.proof = `/${imgDirectory}/` + fileName;
    const newRequest = await Deposit.create({...req.body , user : req.user._id });
    sendSuccessResponse(res , 201 , {
        message : 'Deposit request created successfully.' ,
        doc : newRequest
    })
});

const populateObj = {
    path : 'user' ,
}

const fetchDeposits = async (req , res , query) => {
    const page = Number(req.query.page) || 1 ;
    const sort = req.query.sort || -1;
    const pageSize = req.query.pageSize || 10;
   
    let filter = {};
    const status = req.query.status;
    if(status === 'approved')  {
        filter = { status : 'approved'}
    } else if(status === 'declined')  {
        filter = { status : 'declined' }
    } else if (status === 'pending') {
        filter = { status : 'pending' }
    }
    const docCount = await Deposit.countDocuments({...filter , ...query});
    const docs = await Deposit.find({...filter , ...query})
    .populate(populateObj)
    .skip(pageSize * (page - 1))
    .limit(pageSize)
    .sort({ createdAt : sort })
    const pages = Math.ceil(docCount/pageSize);
    sendSuccessResponse(res , 200 , {
        docs , page , pages , docCount 
    });
}

exports.getAllDepositRequests = catchAsync(async(req ,res , next) => {
    await fetchDeposits(req , res , {});
})
exports.getMyDepositRequests = catchAsync(async(req ,res , next) => {
    await fetchDeposits(req , res , { user : req.user._id });
}) 
exports.getUserDepositRequests = catchAsync(async(req ,res , next) => {
    await fetchDeposits(req , res , { user : req.params.id });
});

exports.getSingleDepositRequest = hanlderFactory.getOne(Deposit , populateObj);
exports.deleteDepositRequest = hanlderFactory.deleteOne(Deposit);

exports.updateDepositRequest = catchAsync(async(req , res ,next) => {
    const { id } = req.params;
    const request = await Deposit.findById(id)
    .populate(populateObj);
    if(!request) {
        return next(new AppError('Invalid id. Document not found.' , 404))
    }
    if(request.status === 'approved'){
        return next(new AppError('This request is already approved. Now you cannot update its status.' , 400))
    }
    const { status } = req.body;
    if(status === 'declined'){
        const updatedRequest = await Deposit.findByIdAndUpdate(id , req.body , {
            new : true , 
            runValidators : true 
        }).populate(populateObj);
        return sendSuccessResponse(res , 200 , {
            message : 'Request Declined successfully.' ,
            doc : updatedRequest
        });
    }else if (status === 'approved'){
        const userWallet = await Wallet.findOne({ user : request.user._id });
        userWallet.totalBalance += parseInt(req.body.transferAmount);
        await userWallet.save();
        const updatedRequest = await Deposit.findByIdAndUpdate(id , req.body , {
            new : true , 
            runValidators : true 
        }).populate(populateObj);

        createWalletHistory(req.body.transferAmount , '+' , userWallet._id , request.user._id , 'Deposit amount');

        if(request.user.referrer){
            sendTeamBonus(request.user , req.body.transferAmount);
        }

        return sendSuccessResponse(res , 200 , {
            message : 'Request Approved successfully.' ,
            doc : updatedRequest
        });
    }else {
        return next(new AppError('Invalid status.' , 400))
    }
});
