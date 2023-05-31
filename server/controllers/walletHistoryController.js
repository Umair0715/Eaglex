const handlerFactory = require('./factories/handlerFactory');
const WalletHistory = require('../models/walletHistoryModel');

exports.getAllWalletHistory = handlerFactory.getAll(WalletHistory);
exports.getMyWalletHistory = handlerFactory.getMy(WalletHistory);
exports.getSingleUserWalletHistory = handlerFactory.getMy(WalletHistory);