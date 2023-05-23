const User = require('../models/userModel');

const getReferrer = async (user) => {
    return User.findOne({ referralCode : user.referrer })
}

module.exports = getReferrer;