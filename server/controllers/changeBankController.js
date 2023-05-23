const handlerFactory = require('./factories/handlerFactory');
const ChangeBank = require('../models/changebankModel');
const catchAsync = require('../utils/catchAsync');
const { sendSuccessResponse } = require('../utils/helpers');
const Bank = require('../models/bankModel');
const AppError = require('../utils/appError');


exports.createChangeBankRequest = catchAsync(async (req , res , next) => {
    const { prevBankDetails , newBankName , newBankAccountHolder , newBankAccountNo } = req.body;
    if(!prevBankDetails || !newBankName || !newBankAccountHolder || !newBankAccountNo) {
        return next(new AppError('Missing required credentials.' , 400))
    }
    const newRequest = await ChangeBank.create({...req.body , user : req.user._id  });
    sendSuccessResponse(res , 200 , {
        message : 'Request created successfully.' ,
        doc : newRequest
    })
});

const populateObj = ['user' , 'prevBankDetails']

exports.getAllChangeBankRequests = handlerFactory.getAll(ChangeBank , populateObj);
exports.getMyChangeBankRequest = handlerFactory.getMy(ChangeBank , populateObj);

exports.updateChangeBankRequest = catchAsync(async(req , res , next) => {
    const { status } = req.body;
    if(status === 'declined') {
        const updatedRequest = await ChangeBank.findByIdAndUpdate(req.params.id , { status } , {
            new : true , 
            runValidators : true 
        });
        return sendSuccessResponse(res , 200 , {
            message : 'Changes saved successfully.' ,
            doc : updatedRequest 
        })
    }else if (status === 'approved') {
        const request = await ChangeBank.findById(req.params.id)
        .populate(['user' , 'prevBankDetails']);
        await Bank.findByIdAndUpdate(request.prevBankDetails._id , {
            isActive : false 
        } , {
            new : true ,
            runValidators : true 
        });

        await Bank.create({
            bankName : request.newBankName ,
            accountHolder : request.newBankAccountHolder ,
            accountNo : request.newBankAccountNo ,
            user : request.user._id ,
        })

        const updatedChangeBankRequest = await ChangeBank.findByIdAndUpdate(request._id , {
            status : 'approved'
        } , {
            new : true , 
            runValidators : true 
        });
        return sendSuccessResponse(res , 200 , {
            message : 'Request approved successfully.' ,
            doc : updatedChangeBankRequest
        })
    }
})