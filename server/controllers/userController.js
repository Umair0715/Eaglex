const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const User = require('../models/userModel');
const Wallet = require('../models/walletModel');
const userValidation = require('../validations/userValidation');
const generateReferralCode = require('../utils/generateReferralCode');
const sendCookie = require('../utils/sendCookies');
const signToken = require('../utils/signToken');
const { sendSuccessResponse } = require('../utils/helpers');
const userFactory = require('./factories/userFactory');
const uploadImage = require('../utils/uploadImage');
const handlerFactory = require('./factories/handlerFactory');
const Offer = require('../models/offerModel');
const Setting = require('../models/settingsModel');
const { default: axios } = require('axios');
const moment = require('moment');
const Deposit = require('../models/depositModel')

exports.register = catchAsync(async(req , res , next) => {
    const { phone } = req.body;
    const { error } = userValidation.validate(req.body);
    if(error){
        return next(new AppError(error.details[0].message , 400))
    }
    const userExist = await User.findOne({ phone });
    if(userExist){
        return next(new AppError('Phone no already taken. Please try another.' , 400));
    }
    const referralCode = 'EX-' + await generateReferralCode();
    if(req.body.referrer){
        const referrerExist = await User.findOne({ referralCode : req.body.referrer });
        if(!referrerExist) {
            return next(new AppError('Invalid sponser code.' , 400))
        }
    }
    const newUser = await User.create({...req.body , referralCode });
    const wallet = await Wallet.create({
        user : newUser._id ,
    });
    newUser.wallet = wallet._id;
    await newUser.save();
    const token = signToken({ _id : newUser._id })
    sendCookie(res , token);
    newUser.password = '';
    newUser.wallet = wallet;
    sendSuccessResponse(res , 201 , {
        message : 'Registered Successfully.' ,
        doc : {...newUser._doc , token }
    })
});

exports.login = userFactory.login(User , 'wallet');
exports.getProfile = userFactory.profile(User , 'wallet');
exports.logout = userFactory.logout(User);
exports.updateProfile = userFactory.updateProfile(User , 'users');
exports.updatePassword = userFactory.updatePassword(User);

exports.getAllUsers = catchAsync(async(req , res , next) => {
    const page = Number(req.query.page) || 1 ;
    const sort = req.query.sort || -1;
    const pageSize = req.query.pageSize || 10;
    if(req.query.pageSize && req.query.pageSize > 40){
        return next(new AppError('pageSize should be less than or equal to 25' , 400));
    }
    const searchType = req.query.searchType;
    let keyword ;
    if(req.query.keyword) {
        if(searchType === 'phone') {
            keyword = { phone : {
                $regex : req.query.keyword,
                $options : 'i'
            } }
        }else if(searchType === 'name') {
            keyword =  req.query.keyword.split(' ').length > 1
            ?
            {
                $and : [
                    {
                        firstName : {
                            $regex : req.query.keyword.split(' ')[0] || req.query.keyword,
                            $options : 'i'
                        } 
                    } ,
                    {
                        lastName : {
                            $regex : req.query.keyword.split(' ')[1] || req.query.keyword ,
                            $options : 'i'
                        }
                    }
                ]
            }
            :
            {
                $or : [
                    {
                        firstName : {
                            $regex : req.query.keyword.split(' ')[0] || req.query.keyword,
                            $options : 'i'
                        } 
                    } ,
                    {
                        lastName : {
                            $regex : req.query.keyword.split(' ')[1] || req.query.keyword ,
                            $options : 'i'
                        }
                    } , 
                    
                ]
            }  ;   
        }
    }

    const range = req.query.range;

    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    let filter = {};
    if (range === 'today') {
        filter = { createdAt: { $gte: start, $lte: end } };
    } else if (range === 'week') {
        start.setDate(start.getDate() - 7);
        filter = { createdAt: { $gte: start, $lte: end } };
    } else if (range === 'month') {
        start.setMonth(start.getMonth() - 1);
        filter = { createdAt: { $gte: start, $lte: end } };
    } else if (range === 'year') {
        start.setFullYear(start.getFullYear() - 1);
        filter = { createdAt: { $gte: start, $lte: end } };
    }
    
    const docCount = await User.countDocuments({...keyword , ...filter});
    const docs = await User.find({...keyword , ...filter})
    .populate('wallet')
    .skip(pageSize * (page - 1))
    .limit(pageSize)
    .sort({ createdAt : sort })
    const pages = Math.ceil(docCount/pageSize);
    sendSuccessResponse(res , 200 , {
        docs , page , pages , docCount 
    });
});

exports.deleteUser = handlerFactory.deleteOne(User);
exports.editUser = handlerFactory.updateOne(User);
exports.getSingleUser = handlerFactory.getOne(User , 'wallet');
exports.blockUser = userFactory.block(User);


exports.getUserDetails = catchAsync(async (req , res , next) => {
    const userId = req.params.id;
    const user = await User.findById(userId);
    if (!user) {
        return next(new AppError('Invalid id. User not found.' , 400))
    }
    // Recursively fetch team members up to three levels deep
    const levelOneMembers = await getTeamMembers(user, 1 , 3);

    const result = {
        levelOneMembers,
        levelTwoMembers: [],
        levelThreeMembers: []
    };

    if (levelOneCount > 0) {
        for (const member of levelOneMembers) {
            if (member.teamMembers.length > 0) {
            result.levelTwoMembers.push(...member.teamMembers);
                for (const nestedMember of member.teamMembers) {
                    if (nestedMember.teamMembers.length > 0) {
                        result.levelThreeMembers.push(...nestedMember.teamMembers);
                    }
                }
            }
        }
    }
    result.totalTeamMembers = result.levelOneMembers.length + result.levelTwoMembers.length + result.levelThreeMembers.length;
    sendSuccessResponse(res , 200 , { doc : result})
});

async function getTeamMembers(user, currentLevel, maxLevel) {
    if (currentLevel > maxLevel) {
        return [];
    }
    
    const teamMembers = await User.find({ referrer: user.referralCode });
    
    const nestedTeamMembers = [];
    for (const member of teamMembers) {
        const nestedMembers = await getTeamMembers(member , currentLevel + 1 , maxLevel);
        nestedTeamMembers.push({
            user: member,
            teamMembers: nestedMembers,
        });
    }
    return nestedTeamMembers;
}

const getMembersTotalDeposit = async (memberIds) => {
    let totalDeposit = 0;
    for (let memberId of memberIds) {
        const deposits = await Deposit.find({ user : memberId , status : 'approved'});
        if(deposits.length === 0 ) continue;
        for (let deposit of deposits) {
            totalDeposit += deposit.transferAmount;
        }
    }
    return totalDeposit;
}

exports.getMyTeamDetails = catchAsync(async(req , res , next) => {
    let levelOneMembers = await User.find({ referrer: req.user.referralCode })
    .select('-password -__v -resetPasswordToken -resetPasswordTokenExpire -updatedAt -isActive')
    .exec();

    let levelTwoMembers = await User.find({ referrer: { $in: levelOneMembers.map(member => member.referralCode ) } })
    .select('-password -__v -resetPasswordToken -resetPasswordTokenExpire -updatedAt -isActive')
    .exec();

    let levelThreeMembers = await User.find({ referrer: { $in: levelTwoMembers.map(member => member.referralCode ) } })
    .select('-password -__v -resetPasswordToken -resetPasswordTokenExpire -updatedAt -isActive')
    .exec();
    
    const settings = await Setting.findOne({});
    
    // Calculate Total Deposit
    const levelOneMemberIds = levelOneMembers.map(member => member._id);
    const levelTwoMemberIds = levelTwoMembers.map(member => member._id);
    const levelThreeMemberIds = levelThreeMembers.map(member => member._id);

    const levelOneMembersDeposit = await getMembersTotalDeposit(levelOneMemberIds)
    const levelTwoMembersDeposit = await getMembersTotalDeposit(levelTwoMemberIds)
    const levelThreeMembersDeposit = await getMembersTotalDeposit(levelThreeMemberIds);
    const totalTeamDeposit = levelOneMembersDeposit + levelTwoMembersDeposit + levelThreeMembersDeposit; 

    // calculate user commission
    const levelOneCommission = (levelOneMembersDeposit / 100) * settings.levelOneProfit; 
    const levelTwoCommission = (levelTwoMembersDeposit / 100) * settings.levelTwoProfit;
    const levelThreeCommission = (levelThreeMembersDeposit / 100) * settings.levelThreeProfit;
    const totalTeamCommission = levelOneCommission + levelTwoCommission + levelThreeCommission;

    const totalTeamMembers = levelOneMembers.length + levelTwoMembers.length + levelThreeMembers.length;

    // Calculate totalInvestAmount
    const levelOneInvestAmount = levelOneMembers.reduce((total, member) => total + member.totalInvestAmount, 0);
    const levelTwoInvestAmount = levelTwoMembers.reduce((total, member) => total + member.totalInvestAmount, 0);
    const levelThreeInvestAmount = levelThreeMembers.reduce((total, member) => total + member.totalInvestAmount , 0);

    const totalInvestAmount = levelOneInvestAmount + levelTwoInvestAmount + levelThreeInvestAmount;


    // Team Members with filter
    let teamMembers = [];
    const level  = parseInt(req.query.level);
    if (level === 1) {
        levelOneMembers.forEach(item => teamMembers.push({...item._doc , level : 1 }))
    }else if (level === 2) {
        levelTwoMembers.forEach(item => teamMembers.push({...item._doc , level : 2 }))
    }else if (level === 3){
        levelThreeMembers.forEach(item => teamMembers.push({...item._doc , level : 3 })) 
    }else {
        levelOneMembers.forEach(item => teamMembers.push({...item._doc , level : 1 }))
        levelTwoMembers.forEach(item => teamMembers.push({...item._doc , level : 2 }))
        levelThreeMembers.forEach(item => teamMembers.push({...item._doc , level : 3 })) 
    }

    sendSuccessResponse(res , 200 , {
        totalInvestAmount ,
        totalTeamMembers ,
        levelOneMembers : levelOneMembers.length ,
        levelTwoMembers : levelTwoMembers.length ,
        levelThreeMembers : levelThreeMembers.length ,
        levelOneCommission : settings.levelOneProfit ,
        levelTwoCommission : settings.levelTwoProfit ,
        levelThreeCommission : settings.levelThreeProfit ,
        levelOneMembersDeposit , 
        levelTwoMembersDeposit ,
        levelThreeMembersDeposit ,
        totalTeamDeposit , 
        levelOneCommissionAmount : levelOneCommission.toFixed(2) ,
        levelTwoCommissionAmount : levelTwoCommission.toFixed(2) ,
        levelThreeCommissionAmount : levelThreeCommission.toFixed(2) ,
        totalTeamCommissionAmount : (totalTeamCommission + req.user.extraCommission).toFixed(2) , 
        teamMembers ,
        settings
    });
});

exports.getDashboardDetails = catchAsync(async(req , res , next) => {
    const user = await User.findById(req.user._id)
    .populate('wallet');
    const offers = await Offer.find().populate('company').limit(10).sort({ createdAt : -1 })
    sendSuccessResponse(res , 200 , {
        user , offers
    })
});

exports.getSingleUserTeam = catchAsync(async(req , res , next) => {
    const { id } = req.params;
    const user = await User.findById(id);
    const levelOneMembers = await User.find({ referrer : user.referralCode })
    .select('firstName lastName phone isActive createdAt referrer referralCode')
    .exec();
    
    const levelTwoMembers = await User.find({ referrer : { $in: levelOneMembers.map(member => member.referralCode ) } })
    .select('firstName lastName phone isActive createdAt referrer referralCode')
    .exec();
    
    const levelThreeMembers = await User.find({ referrer : { $in: levelTwoMembers.map(member => member.referralCode ) } })
    .select('firstName lastName phone isActive createdAt referrer referralCode')
    .exec();

    // Calculate Level Members and their deposit
    const levelOneMemberIds = levelOneMembers.map(member => member._id);
    const levelTwoMemberIds = levelTwoMembers.map(member => member._id);
    const levelThreeMemberIds = levelThreeMembers.map(member => member._id);

    // Calculate Total Deposit
    const levelOneMembersDeposit = await getMembersTotalDeposit(levelOneMemberIds)
    const levelTwoMembersDeposit = await getMembersTotalDeposit(levelTwoMemberIds)
    const levelThreeMembersDeposit = await getMembersTotalDeposit(levelThreeMemberIds);
    const totalTeamDeposit = levelOneMembersDeposit + levelTwoMembersDeposit + levelThreeMembersDeposit;

    const settings = await Setting.findOne({});
    const levelOneCommission = (levelOneMembersDeposit / 100) * settings.levelOneProfit; 
    const levelTwoCommission = (levelTwoMembersDeposit / 100) * settings.levelTwoProfit;
    const levelThreeCommission = (levelThreeMembersDeposit / 100) * settings.levelThreeProfit;
    const totalTeamCommission = levelOneCommission + levelTwoCommission + levelThreeCommission;
    
    // Team Members with filter
    let teamMembers = [];
    const level  = parseInt(req.query.level);
    if (level === 1) {
        levelOneMembers.forEach(item => teamMembers.push({...item._doc , level : 1 }))
    }else if (level === 2) {
        levelTwoMembers.forEach(item => teamMembers.push({...item._doc , level : 2 }))
    }else if (level === 3){
        levelThreeMembers.forEach(item => teamMembers.push({...item._doc , level : 3 })) 
    }else {
        levelOneMembers.forEach(item => teamMembers.push({...item._doc , level : 1 }))
        levelTwoMembers.forEach(item => teamMembers.push({...item._doc , level : 2 }))
        levelThreeMembers.forEach(item => teamMembers.push({...item._doc , level : 3 })) 
    }

    const totalTeamMembers = levelOneMembers.length + levelTwoMembers.length + levelThreeMembers.length;

    const levelOneMembersCount = levelOneMembers.length;
    const levelTwoMembersCount = levelTwoMembers.length;
    const levelThreeMembersCount = levelThreeMembers.length;

    sendSuccessResponse(res , 200 , {
        teamMembers , 
        totalTeamMembers ,
        levelOneMembersCount ,
        levelTwoMembersCount , 
        levelThreeMembersCount ,
        levelOneMembersDeposit ,
        levelTwoMembersDeposit ,
        levelThreeMembersDeposit ,
        totalTeamDeposit ,
        levelOneCommission : levelOneCommission.toFixed(2) ,
        levelTwoCommission : levelTwoCommission.toFixed(2) ,
        levelThreeCommission : levelThreeCommission.toFixed(2) ,
        totalTeamCommission : totalTeamCommission.toFixed(2)
    }); 
});

exports.searchUser = catchAsync(async(req , res , next) => {
    const page = Number(req.query.page) || 1 ;
    const pageSize = 150;

    const keyword = req.query.keyword ?
    {
        $or : [
            {
                firstName : {
                    $regex : req.query.keyword ,
                    $options : 'i'
                } 
            } ,
            {
                lastName : {
                    $regex : req.query.keyword ,
                    $options : 'i'
                }
            }
        ]
    } : {} ;   

    const docCount = await User.countDocuments(keyword)
    const docs = await User.find(keyword)
    .select('firstName lastName image phone')
    .skip(pageSize * (page - 1))
    .limit(pageSize)
    const pages = Math.ceil(docCount/pageSize);

    sendSuccessResponse(res , 200 , {
        docs , page , pages , docCount 
    });
});

const generateOtp = async () => {
    var ID = require("nodejs-unique-numeric-id-generator")
    const otp = ID.generate(new Date().toJSON());
    const user = await User.findOne({ resetPasswordToken : otp , resetPasswordTokenExpire : { $gt : new Date() } })

    if(otp.toString().length < 6 || user) {
        return await generateOtp();
    }
    return otp;
}

exports.sendForgotPasswordOtp = catchAsync(async(req , res , next) => {
    const { phone } = req.body;
    const user = await User.findOne({ phone });
    if(!user) {
        return next(new AppError('This Phone number is not registered.' , 400))
    }
    const otp = await generateOtp()
    const message = `Thank you for choosing Eaglex Group.
    %0a%0aYour OTP for verification is ${otp}.
    %0aPlease enter this code to complete the verification process. Thank you.`;
    const url = `http://api.veevotech.com/sendsms?hash=${process.env.OTP_API_KEY}&receivenum=${phone}&sendernum=8583&textmessage=${message}`;
    try {
        const resp = await axios.get(url);
        const currentDate = moment();
        user.resetPasswordToken = otp;
        user.resetPasswordTokenExpire = moment(currentDate).add(10, 'minutes');
        await user.save();
        
        return sendSuccessResponse(res , 200 , {
            message : 'Check your phone for the OTP and enter it below to reset your password.'
        })
    } catch (error) {
        console.log({ otpError : error });
        return next(new AppError('Internal server error' , 500))
    }
});

exports.verifyOtp = catchAsync(async(req , res , next) => {
    const { otp } = req.body;
    if(!otp) return next(new AppError('Otp is required.' , 400))
    const user = await User.findOne({ resetPasswordToken : otp });
    if(!user) {
        return next(new AppError("Invalid otp." , 400))
    }
    if(new Date(user.resetPasswordTokenExpire) < new Date()) {
        return next(new AppError('Otp has been expired. Please try again with new otp.' , 400))
    }
    sendSuccessResponse(res , 200 , {
        message : 'Otp Verified.' , 
        doc : {
            otp ,
            verified : true 
        }
    })
}); 

exports.resetPassword = catchAsync(async(req , res , next) => {
    const { otp , newPassword , confirmPassword } = req.body;
    const user = await User.findOne({ resetPasswordToken : otp });
    if(confirmPassword && newPassword !== confirmPassword) {
        return next(new AppError('Passwords are incorrect.' , 400))
    }
    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordTokenExpire = undefined;
    await user.save();
    sendSuccessResponse(res , 200 , {
        message : 'Password changed successfully.' ,
    });
});

