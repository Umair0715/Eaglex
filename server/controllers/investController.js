const hanlderFactory = require('./factories/handlerFactory');
const Invest = require('../models/investModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const { sendSuccessResponse } = require('../utils/helpers');
const investValidation = require('../validations/investValidation');
const Offer = require('../models/offerModel');
const Wallet = require('../models/walletModel');
const moment = require('moment-timezone');
const createWalletHistory = require('../utils/CreateWalletHistory');
const User = require('../models/userModel');
const sendReInvestProfit = require('../utils/sendReInvestProfit');

exports.createInvest = catchAsync(async(req , res , next) => {
    let { amount } = req.body;
    amount = Number(amount);
    const { error } = investValidation.validate(req.body);
    if(error) {
        return next(new AppError(error.details[0].message , 400))
    }
    const offer = await Offer.findById(req.body.offer);
    if(!offer) {
        return next(new AppError('Invalid id. offer not found.' , 404))
    }
    if(!offer.isActive){
        return next(new AppError('This offer is not active for investment.' ,400))
    }
    const userWallet = await Wallet.findById(req.user.wallet);
    if(userWallet.totalBalance < amount) {
        return next(new AppError('You have insufficient balance in your wallet to invest this amount.' , 400))
    }
    if(amount < offer.depositRange[0] || amount > offer.depositRange[1]){
        return next(new AppError(`Invalid invest amount. To invest in this offer please enter amount between ${offer.depositRange[0]}-${offer.depositRange[1]} ` , 400))
    }
    const investExist = await Invest.findOne({ 
        user : req.user._id , 
        offer : offer._id , 
        status : 'running' 
    });
    if(investExist) {
        return next(new AppError('You already invested in this offer. to re-invest please wait until this offer is completed.' , 400))
    }
    if(offer.timePeriod === 1) {
        const isInvested = await Invest.findOne({ 
            user : req.user._id , 
            offer : offer._id , 
        });
        if(isInvested) {
            return next(new AppError(`Please note that you can invest in the ${offer.name} offer only one time. To proceed with another investment, please select a different offer.`, 400))
        }
    }else if (offer.timePeriod === 3) {
        const investsCount = await Invest.countDocuments({
            user : req.user._id , 
            offer : offer._id , 
        });
        if(investsCount >= 2) {
            return next(new AppError(`Please note that you can invest in the ${offer.name} offer only two times. To proceed with another investment, please select a different offer.`, 400))
        }
    }
    userWallet.totalBalance -= amount;
    const newWallet = await userWallet.save();
    const totalOfferProfit = offer.profit * offer.timePeriod;
    const newInvest = await Invest.create({
        ...req.body ,
        offerProfit : offer.profit , // daily profit in %
        totalProfit : totalOfferProfit , // total Offer Profit in %
        totalProfitReturnInPer : 100 + totalOfferProfit ,
        totalProfitReturnInAmount : ((amount / 100 ) * totalOfferProfit ) + amount,
        returnProfitAmount : (amount / 100 ) * totalOfferProfit ,
        user : req.user._id ,
        startDate : moment().tz('Asia/Karachi') ,
        // endDate : moment().add(offer.timePeriod, 'days').tz('Asia/Karachi')
        endDate : moment().add(offer.timePeriod, 'days').add(1, 'hours').tz('Asia/Karachi')
    });

    const user = await User.findById(req.user._id);
    user.totalInvestAmount += amount;
    user.save();

    createWalletHistory(amount , '-' , userWallet._id , req.user._id , `Invested in ${offer.name} offer`)

    const lastClaimedInvest = await Invest.findOne({ user : req.user._id , status : 'claimed' })
    .sort({ createdAt : -1 });
    
    
    if (user.referrer && lastClaimedInvest ) {
        const lastClaimAmount = Number(lastClaimedInvest.totalProfitReturnInAmount);

        const isReInvestedAfterLastClaim = await Invest.findOne({ 
            createdAt :  { 
                $gt : new Date(lastClaimedInvest.updatedAt) , 
                $lt : new Date(newInvest.createdAt )
            }
        });

        if(isReInvestedAfterLastClaim) {
            return sendSuccessResponse(res , 200 , {
                message : `You have successfully invested in offer ${offer.name}` ,
                doc : newInvest 
            });
        }
       
        if(amount > lastClaimAmount) {
            sendReInvestProfit(user , lastClaimAmount)
        }else {
            sendReInvestProfit(user , amount);
        }
    }

    sendSuccessResponse(res , 200 , {
        message : `You have successfully invested in offer ${offer.name}` ,
        doc : newInvest 
    });
});

const fetchInvests = async (req , res , query) => {
    try {
        const pageSize = 20;
        const page = parseInt(req.query.page) || 1;
        let filter = {};
        const status = req.query.status;

        if(status === 'running') {
            filter = { status : 'running' }
        }else if (status === 'completed') {
            filter = { status : 'completed' }
        } else if (status === 'claimed') {
            filter = { status : 'claimed' }
        }
        const docCount = await Invest.countDocuments({...filter , ...query})
        const docs = await Invest.find({...filter , ...query})
        .populate([
            {
                path : 'offer' ,
                select : '-__v' , 
                populate : {
                    path : 'company' ,
                    select : 'name'
                }
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

exports.getAllInvestments = catchAsync(async(req , res) => {
    await fetchInvests(req , res , {});
});
exports.getSingleUserInvestments = catchAsync(async(req , res) => {
    await fetchInvests(req , res , { user : req.params.id });
});
exports.getMyInvestments = catchAsync(async(req , res) => {
    let filter = {};
    const status = req.query.status;

    if(status === 'running') {
        filter = { status : 'running' }
    }else if (status === 'completed') {
        filter = { status : 'completed' }
    } else if (status === 'claimed') {
        filter = { status : 'claimed' }
    }
    const docCount = await Invest.countDocuments({...filter , user : req.user._id })
    const docs = await Invest.find({...filter , user : req.user._id })
    .populate([
        {
            path : 'offer' ,
            select : '-__v' , 
            populate : {
                path : 'company' ,
                select : 'name'
            }
        } ,
        {
            path : 'user' ,
            select : 'firstName lastName wallet phone isActive'
        }
    ])
    .sort({ createdAt : -1 });
    sendSuccessResponse(res , 200 , {
        docs , docCount 
    })
});

exports.getMyProgress = catchAsync(async(req , res) => {
    await fetchInvests(req , res , { user : req.user._id , status : { $ne : 'claimed'} })
})

exports.getSingleInvestment = hanlderFactory.getOne(Invest , ['user' , 'offer']);

exports.claimInvestProfit = catchAsync(async(req , res , next) => {
    const { id } = req.params;
    if(!id) return next(new AppError('Invalid Request. Invest id is required.' , 400));
    const invest = await Invest.findById(id)
    .populate([
        {
            path : 'offer' ,
            select : '-__v' , 
            populate : {
                path : 'company' ,
            }
        } ,
        {
            path : 'user' ,
            select : 'firstName lastName wallet phone isActive'
        }
    ]);
    if(!invest) {
        return next(new AppError('Invalid id. Document not found.' , 400))
    }
    if(invest.status !== 'completed') {
        return next(new AppError("can't process this request." , 400))
    }
    const userWallet = await Wallet.findOne({ user : invest.user._id });
    const userProfit = Number(invest.amount) + Number(invest.returnProfitAmount);
    userWallet.totalBalance += userProfit ;
    await userWallet.save();

    const user = await User.findById(req.user._id);
    user.totalProfit += Number(invest?.returnProfitAmount);
    user.save();

    createWalletHistory(userProfit , '+' , userWallet._id , invest.user._id , `Claimed ${invest?.offer?.name} offer profit`);

    invest.status = 'claimed';
    invest.profitClaimed = true ;
    const updatedInvest = await invest.save();

    sendSuccessResponse(res , 200 , {
        message : 'Profit claimed successfully.' ,
        doc : updatedInvest
    })
})