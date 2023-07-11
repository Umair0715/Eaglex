const Wallet = require('../models/walletModel');
const getReferrer = require("./getReferrer");
const Setting = require('../models/settingsModel');
const createWalletHistory = require('./CreateWalletHistory');

const getLevelProfit = async (level) => {
    const settings = await Setting.findOne({});
    switch (level) {
        case 1:
            return settings.reInvestLevelOneProfit;
        case 2: 
            return settings.reInvestLevelTwoProfit;
        case 3:
            return settings.reInvestLevelThreeProfit;
        default:
            break;
    }
}

const sendBonusToReferrer = async (referrer, reInvestedAmount, level, from) => {
    if (level > 3) {
        return;
    }
  
    const levelProfit = await getLevelProfit(level);
    if(referrer && referrer.isActive){
        const referrerProfit = (reInvestedAmount / 100) * levelProfit;
        const referrerWallet = await Wallet.findOne({ user: referrer._id });
        referrerWallet.totalBalance += referrerProfit;
        await referrerWallet.save();
        referrer.totalProfit += referrerProfit;
        referrer.reInvestCommission += referrerProfit;
        referrer.save();

        createWalletHistory(referrerProfit , '+' , referrerWallet._id , referrer._id , `Re-invest Profit from level ${level} team member. `)
    }
    if(!referrer.referrer){
        return;
    }
    const nextReferrer = await getReferrer(referrer)
    return sendBonusToReferrer(nextReferrer, reInvestedAmount, level + 1, from);
};
  
const sendReInvestProfit = async (user, reInvestedAmount) => {
    const levelOneReferrer = await getReferrer(user);
    await sendBonusToReferrer(levelOneReferrer, reInvestedAmount, 1, user);
}

module.exports = sendReInvestProfit;