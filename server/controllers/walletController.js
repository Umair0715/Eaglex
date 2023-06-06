const handlerFactory = require('./factories/handlerFactory');
const Wallet = require('../models/walletModel');

exports.updateWalletBalance = handlerFactory.updateOne(Wallet);