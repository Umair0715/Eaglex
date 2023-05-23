const WalletHistory = require('../models/walletHistoryModel');

const createWalletHistory = (amount , action , wallet , user , desc) => {
    WalletHistory.create({
        amount , action , wallet , user , description : desc 
    })
}

module.exports = createWalletHistory;