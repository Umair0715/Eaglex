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
const Setting = require('../models/settingsModel')

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
    const referralCode = 'EX-' + generateReferralCode();
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

exports.login = userFactory.login(User , 'wallet')
exports.getProfile = userFactory.profile(User , 'wallet');
exports.logout = userFactory.logout(User);
exports.updateProfile = userFactory.updateProfile(User , 'users')
exports.updatePassword = userFactory.updatePassword(User);

exports.getAllUsers = catchAsync(async(req , res , next) => {
    const page = Number(req.query.page) || 1 ;
    const sort = req.query.sort || -1;
    const pageSize = req.query.pageSize || 10;
    if(req.query.pageSize && req.query.pageSize > 40){
        return next(new AppError('pageSize should be less than or equal to 25' , 400));
    }
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
exports.getSingleUser = handlerFactory.getOne(User);
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

exports.getMyTeamDetails = catchAsync(async(req , res , next) => {
    const levelOneMembers = await User.find({ referrer: req.user.referralCode }).exec();
    const levelTwoMembers = await User.find({ referrer: { $in: levelOneMembers.map(member => member.referralCode ) } }).exec();
    const levelThreeMembers = await User.find({ referrer: { $in: levelTwoMembers.map(member => member.referralCode ) } }).exec();
    const settings = await Setting.findOne({});

    const totalTeamMembers = levelOneMembers.length + levelTwoMembers.length + levelThreeMembers.length;

    // Calculate totalInvestAmount
    const levelOneInvestAmount = levelOneMembers.reduce((total, member) => total + member.totalInvestAmount, 0);
    const levelTwoInvestAmount = levelTwoMembers.reduce((total, member) => total + member.totalInvestAmount, 0);
    const levelThreeInvestAmount = levelThreeMembers.reduce((total, member) => total + member.totalInvestAmount , 0);

    const totalInvestAmount = levelOneInvestAmount + levelTwoInvestAmount + levelThreeInvestAmount;

    sendSuccessResponse(res , 200 , {
        totalInvestAmount ,
        totalTeamMembers,
        levelOneMembers : levelOneMembers.length ,
        levelTwoMembers : levelTwoMembers.length ,
        levelThreeMembers : levelThreeMembers.length ,
        levelOneCommission : settings.levelOneProfit ,
        levelTwoCommission : settings.levelTwoProfit ,
        levelThreeCommission : settings.levelThreeProfit ,
    })
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
    const levelOneMembers = await User.find({ referrer: user.referralCode })
    .select('firstName lastName phone isActive createdAt')
    .exec();
    const levelTwoMembers = await User.find({ referrer: { $in: levelOneMembers.map(member => member.referralCode ) } })
    .select('firstName lastName phone isActive createdAt')
    .exec();
    const levelThreeMembers = await User.find({ referrer: { $in: levelTwoMembers.map(member => member.referralCode ) } })
    .select('firstName lastName phone isActive createdAt')
    .exec();
    
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
        levelThreeMembersCount
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