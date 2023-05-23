const User = require('../models/userModel');
const ROIWallet = require('../models/ROIWalletModel');
const RoiWalletHistory = require('../models/roiWalletHistoryModel');

const getReferrer = require('../utils/getReferrer');
const TeamWallet = require('../models/teamWalletModel');
const TeamWalletHistory = require('../models/teamWalletHistoryModel');
const Subscription = require('../models/subscriptionModel');
const checkLimitAddProfit = require('../utils/checkLimitAddProfit')


const calculateRoiScheduler = async () => {
    console.log('running');
    try {
        // Fetch all users and their subscriptions
        const users = await User.find().populate({
            path: 'activePackage',
            populate: { path: 'package' }
        });
        
        for (const user of users) {
            if (!user.activePackage || !user.isActive || user.activePackage.expireDate < new Date() ) continue;
            // Get user's ROI wallet
            const wallet = await ROIWallet.findOne({ user: user._id });
            const monthlyProfit = (user.activePackage.depositAmount / 100) * user.activePackage.package.monthlyProfit;
            const dailyProfit = monthlyProfit / 30;
            if(user.activePackage?.package?.type === 1){
                const result = await checkLimitAddProfit(user , dailyProfit , wallet);
               
                if(result.added) {
                    await RoiWalletHistory.create({
                        user : user._id ,
                        wallet : wallet._id ,
                        ROI : result.amount ,
                        activeDeposit : user.activePackage.depositAmount
                    });
                }
                 // Add Salary profit to user referrer. if Exist
                if (user.referrer) {
                    const userReferrer = await getReferrer(user);
                    sendRoiToTeamMembers(userReferrer , dailyProfit , 1 , user)
                }
                continue;
            }else {
                continue;
            }
        }
    } catch (error) {
        console.error( 'ROI calculate error' , error);
    }
};

async function sendRoiToTeamMembers (referrer , profit , level , from) {

    if(level > 7){
        return;
    }

    const activePackage = referrer?.activePackage;
    if(!activePackage){
        if(referrer.referrer){
            const nextReferrer = await getReferrer(referrer);
            return sendRoiToTeamMembers(nextReferrer , profit , level + 1 , from)
        }else{
            return;
        }
    }
    const profitShare = activePackage.package[getSponserProfitLevel(level)];
    if(referrer.isActive){
        const referrerTeamWallet = await TeamWallet.findOne({
            user : referrer._id
        });
        const referrerProfitShare = (profit/100) * profitShare;
        const result = await checkLimitAddProfit(referrer , referrerProfitShare , referrerTeamWallet);
        console.log({
            user : referrer.username ,
            result ,
            desc : 'salary',
            level 
        })
        if(result.added){
            TeamWalletHistory.create({
                to : referrer._id ,
                wallet : referrerTeamWallet._id ,
                from : from._id ,
                fromUsername : from?.username ,
                amount : result.amount , 
                type : 2 ,
                description : 'Sponser Profit' ,
                teamLevel : level 
            })
        }
    }

    
    if(!referrer.referrer){
        return;
    }

    const nextReferrer = await getReferrer(referrer);
    return sendRoiToTeamMembers(nextReferrer , profit , level + 1 , from);
}

module.exports = calculateRoiScheduler;


const getSponserProfitLevel = (level) => {
    switch (level) {
        case 1:
            return 'sponserLevelOneProfit';
        case 2:
            return 'sponserLevelTwoProfit';
        case 3:
            return 'sponserLevelThreeProfit';
        case 4:
            return 'sponserLevelFourProfit';
        case 5:
            return 'sponserLevelFiveProfit';
        case 6:
            return 'sponserLevelSixProfit';
        case 7:
            return 'sponserLevelSevenProfit';
        default:
            break;
    }
}