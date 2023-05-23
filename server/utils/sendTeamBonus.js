const Wallet = require('../models/walletModel');
const getReferrer = require("./getReferrer");
const Setting = require('../models/settingsModel');
const createWalletHistory = require('./CreateWalletHistory');

const getLevelProfit = async (level) => {
    const settings = await Setting.findOne({});
    switch (level) {
        case 1:
            return settings.levelOneProfit;
        case 2: 
            return settings.levelTwoProfit;
        case 3:
            return settings.levelThreeProfit;
        default:
            break;
    }
}

const sendBonusToReferrer = async (referrer, depositAmount, level, from) => {
    if (level > 3) {
        return;
    }
  
    const levelProfit = await getLevelProfit(level);
    if(referrer.isActive){
        const referrerProfit = (depositAmount / 100) * levelProfit;
        const referrerWallet = await Wallet.findOne({ user: referrer._id });
        referrerWallet.totalBalance += referrerProfit;
        await referrerWallet.save();

        createWalletHistory(referrerProfit , '+' , referrerWallet._id , referrer._id , `Profit from level ${level} team member. `)
    }
    if(!referrer.referrer){
        return;
    }
    const nextReferrer = await getReferrer(referrer)
    return sendBonusToReferrer(nextReferrer, depositAmount, level + 1, from);
};
  
const sendTeamBonus = async (user, depositAmount) => {
    const levelOneReferrer = await getReferrer(user);
    await sendBonusToReferrer(levelOneReferrer, depositAmount, 1, user);
}

module.exports = sendTeamBonus;