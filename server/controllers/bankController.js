const catchAsync = require('../utils/catchAsync');
const handlerFactory = require('./factories/handlerFactory');
const Bank = require('../models/bankModel');
const AppError = require('../utils/appError');
const { sendSuccessResponse } = require('../utils/helpers');
const User = require('../models/userModel');
const addBankValidation = require('../validations/addBankValidation');

exports.addBankAccount = catchAsync(async(req , res , next) => {
    const { error } = addBankValidation.validate(req.body);
    if(error){
        return next(new AppError(error.details[0].message , 400))
    }
    const bankExist = await Bank.findOne({ user : req.user._id });
    if(bankExist) {
        return next(new AppError('You have already added your bank account. To change your bank details please contact with support.' , 400))
    }
    const newBank = await Bank.create({...req.body , user : req.user._id });
    sendSuccessResponse(res , 200 , {
        message : 'bank account added successfully.' , 
        doc : newBank 
    })
});

exports.getMyBankAccount = catchAsync(async(req , res) => {
    const bank = await Bank.findOne({ user : req.user._id  });
    sendSuccessResponse(res , 200 , { 
        doc : bank 
    })
});
exports.getAllbankAccounts = handlerFactory.getAll(Bank);
exports.getSpecificUserBankAccount = catchAsync(async(req , res) => {
    const doc = await Bank.findOne({ user : req.params.id });
    sendSuccessResponse(res , 200 , { doc })
});
exports.deleteBankAccount = handlerFactory.deleteOne(Bank);
exports.updateBankAccount = handlerFactory.updateOne(Bank);
exports.getSingleBank = handlerFactory.getOne(Bank);

exports.changeBank = catchAsync(async(req , res , next) => {
    const { id } = req.params;
    const { newBankName , newBankAccountHolder , newBankAccountNo } = req.body;
    if(!newBankName || !newBankAccountHolder || !newBankAccountNo) {
        return next(new AppError('All fields are required.' , 400))
    }
    const prevBank = await Bank.findById(id);
    if(!prevBank) {
        return next(new AppError('Invalid request. Bank account not found.' , 400))
    }
    const updatedBank = await Bank.findByIdAndUpdate(prevBank._id , {
        bankName : newBankName ,
        accountHolder : newBankAccountHolder ,
        accountNo : newBankAccountNo
    } , { 
        new : true ,
        runValidators : true 
    });
    
    sendSuccessResponse(res , 200 , {
        message : 'Your bank details changed successfully.' ,
        doc : updatedBank 
    })
})