const User = require('../models/userModel');
const Deposit = require('../models/depositModel');
const createWalletHistory = require('../utils/CreateWalletHistory');
const Wallet = require('../models/walletModel');
const Setting = require('../models/settingsModel');
const shortNumberFormat = require('../utils/ShortNumberFormat');


const addExtraBonus = async () => {
    console.log('running');
  
    const users = await User.find({});
    const settings = await Setting.findOne({});
  
    for (let user of users) {
        let levelOneMembers = await User.find({ referrer: user.referralCode })
            .select('-password -__v -resetPasswordToken -resetPasswordTokenExpire -updatedAt -isActive')
            .exec();
    
        let levelTwoMembers = await User.find({ referrer: { $in: levelOneMembers.map(member => member.referralCode ) } })
            .select('-password -__v -resetPasswordToken -resetPasswordTokenExpire -updatedAt -isActive')
            .exec();
    
        let levelThreeMembers = await User.find({ referrer: { $in: levelTwoMembers.map(member => member.referralCode ) } })
            .select('-password -__v -resetPasswordToken -resetPasswordTokenExpire -updatedAt -isActive')
            .exec();
    
        let teamMembers = [...levelOneMembers, ...levelTwoMembers, ...levelThreeMembers];
    
        totalDeposit = teamMembers.reduce((acc, i) => acc + i.totalDepositAmount, 0);
        
        // Check if the user has reached a new milestone
        let milestoneReached = false;
        if (totalDeposit >= user.depositMilestone + 100000) {
            milestoneReached = true;
        }
       
        if (milestoneReached) {
            let bonusPercent = settings.extraCommission; // Extra commission percentage
            let bonusAmount = Math.floor((totalDeposit - user.depositMilestone) / 100000) * (100000 * bonusPercent / 100);
            const newDepositMilestone = Math.floor((totalDeposit - user.depositMilestone) / 100000) * 100000;
            user.depositMilestone += newDepositMilestone;

            // Add the bonus amount to the sponsor's wallet
            user.extraCommission += bonusAmount;
            const userWallet = await Wallet.findById(user.wallet);
    
            userWallet.totalBalance += bonusAmount;
            userWallet.save();
            user.save();
    
            createWalletHistory(bonusAmount, '+', userWallet._id, user._id, `Extra Commission on ${shortNumberFormat(newDepositMilestone)} team deposit`);
        }
    }
  };


module.exports = addExtraBonus;