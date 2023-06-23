// var ID = require("nodejs-unique-numeric-id-generator")
const User = require('../models/userModel');
const { nanoid } = require('nanoid')


async function generateReferralCode() {
    const code = nanoid()
    const userExist = await User.findOne({ referralCode : code });
    if(userExist) {
        return await generateReferralCode();
    }
    return code;
}

module.exports = generateReferralCode;