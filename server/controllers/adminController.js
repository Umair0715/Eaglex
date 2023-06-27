const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const User = require('../models/userModel');
const Wallet = require('../models/walletModel');
const adminValidation = require('../validations/adminValidation');
const generateReferralCode = require('../utils/generateReferralCode');
const sendCookie = require('../utils/sendCookies');
const signToken = require('../utils/signToken');
const { sendSuccessResponse } = require('../utils/helpers');
const userFactory = require('./factories/userFactory');
const handlerFactory = require('./factories/handlerFactory');
const Admin = require('../models/adminModel');
const AdminWallet = require('../models/adminWalletModel');
const Invest = require('../models/investModel');
const Deposit = require('../models/depositModel');
const Withdraw = require('../models/withdrawModel');

exports.register = catchAsync(async(req , res , next) => {
    const { phone } = req.body;
    const { error } = adminValidation.validate(req.body);
    if(error){
        return next(new AppError(error.details[0].message , 400))
    }
    const adminExist = await Admin.findOne({ phone });
    if(adminExist){
        return next(new AppError('Phone no already taken. Please try another.' , 400));
    }
    const newAdmin = await Admin.create(req.body);
    const wallet = await AdminWallet.create({
        admin : newAdmin._id ,
    });
    newAdmin.wallet = wallet._id;
    await newAdmin.save();
    const token = signToken({ _id : newAdmin._id })
    sendCookie(res , token);
    newAdmin.password = '';
    sendSuccessResponse(res , 201 , {
        message : 'Admin Registered Successfully.' ,
        doc : {...newAdmin._doc , token }
    })
});

exports.login = userFactory.login(Admin)
exports.getProfile = userFactory.profile(Admin);
exports.logout = userFactory.logout(Admin);
exports.updatePassword = userFactory.updatePassword(Admin);
exports.updateProfile = userFactory.updateProfile(Admin , 'admins');



exports.getDashboardStats = catchAsync(async (req, res) => {
    const totalInvestedAmount = await Invest.aggregate([
        {
            $group: {
                _id: null,
                totalAmount: { $sum: '$amount' },
            },
        },
    ]);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayInvestedAmount = await Invest.aggregate([
        {
            $match: {
                createdAt: { $gte: today },
            },
        },
        {
            $group: {
                _id: null,
                todayAmount: { $sum: '$amount' },
            },
        },
    ]);

    const recentInvestors = await Invest.find()
        .sort({ createdAt: -1 })
        .limit(10)
        .populate(['user', 'offer']);

    const usersCount = await User.countDocuments({});

    const todayApprovedDepositAmount = await Deposit.aggregate([
        {
            $match: {
                createdAt: { $gte: today },
                status: 'approved',
            },
        },
        {
            $group: {
                _id: null,
                todayAmount: { $sum: '$transferAmount' },
            },
        },
    ]);

     const totalApprovedDepositAmount = await Deposit.aggregate([
        {
            $match: {
                status: 'approved',
            },
        },
        {
            $group: {
                _id: null,
                totalAmount: { $sum: '$transferAmount' },
            },
        },
    ]);

    const todayPendingDepositAmount = await Deposit.aggregate([
        {
            $match: {
                createdAt: { $gte: today },
                status: 'pending',
            },
        },
        {
            $group: {
                _id: null,
                todayAmount: { $sum: '$amount' },
            },
        },
    ]);

    const todayTotalDepositAmount = await Deposit.aggregate([
        {
            $match: {
                createdAt: { $gte: today },
            },
        },
        {
            $group: {
                _id: null,
                todayAmount: { $sum: '$amount' },
            },
        },
    ]);

    const todayApprovedWithdrawAmount = await Withdraw.aggregate([
        {
            $match: {
                createdAt: { $gte: today },
                status: 'completed',
            },
        },
        {
            $group: {
                _id: null,
                todayAmount: { $sum: '$withdrawAmount' },
            },
        },
    ]);

    const totalApprovedWithdrawAmount = await Withdraw.aggregate([
        {
            $match: {
                status: 'completed',
            },
        },
        {
            $group: {
                _id: null,
                totalAmount: { $sum: '$withdrawAmount' },
            },
        },
    ]);

    const todayPendingWithdrawAmount = await Withdraw.aggregate([
        {
            $match: {
                createdAt: { $gte: today },
                status: 'pending',
            },
        },
        {
            $group: {
                _id: null,
                todayAmount: { $sum: '$withdrawAmount' },
            },
        },
    ]);
    const todayTotalWithdrawAmount = await Withdraw.aggregate([
        {
            $match: {
                createdAt: { $gte: today },
            },
        },
        {
            $group: {
                _id: null,
                todayAmount: { $sum: '$withdrawAmount' },
            },
        },
    ]);

  sendSuccessResponse(res, 200, {
    totalInvestedAmount: totalInvestedAmount[0]?.totalAmount || 0,
    todayInvestedAmount: todayInvestedAmount[0]?.todayAmount || 0,
    recentInvestors,
    totalUsers: usersCount,
    todayApprovedDepositAmount: todayApprovedDepositAmount[0]?.todayAmount || 0,
    totalApprovedDepositAmount: totalApprovedDepositAmount[0]?.totalAmount || 0,
    todayPendingDepositAmount: todayPendingDepositAmount[0]?.todayAmount || 0,
    todayApprovedWithdrawAmount: todayApprovedWithdrawAmount[0]?.todayAmount || 0,
    totalApprovedWithdrawAmount: totalApprovedWithdrawAmount[0]?.totalAmount || 0,
    todayPendingWithdrawAmount: todayPendingWithdrawAmount[0]?.todayAmount || 0,
    todayTotalWithdrawAmount: todayTotalWithdrawAmount[0]?.todayAmount || 0,
    todayTotalDepositAmount: todayTotalDepositAmount[0]?.todayAmount || 0,
  });
});








// exports.getDashboardStats = catchAsync(async(req , res) => {
//     const totalInvestedAmount = await Invest.aggregate([
//         {
//             $group: {
//                 _id: null,
//                 totalAmount: { $sum: '$amount' },
//             },
//         },
//     ]);

//     const today = new Date();
//     today.setHours(0, 0, 0, 0);

//     const todayInvestedAmount = await Invest.aggregate([
//         {
//             $match: {
//                 createdAt: { $gte: today },
//             },
//         },
//         {
//             $group: {
//                 _id: null,
//                 todayAmount: { $sum: '$amount' },
//             },
//         },
//     ]);

//     const recentInvestors = await Invest.find()
//         .sort({ createdAt: -1 })
//         .limit(10)
//         .populate(['user' , 'offer'])

//     const usersCount = await User.countDocuments({});

//     sendSuccessResponse(res , 200 , {
//         totalInvestedAmount: totalInvestedAmount[0]?.totalAmount || 0,
//         todayInvestedAmount: todayInvestedAmount[0]?.todayAmount || 0,
//         recentInvestors ,
//         totalUsers : usersCount
//     });
// });