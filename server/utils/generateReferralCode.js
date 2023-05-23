var ID = require("nodejs-unique-numeric-id-generator")

function generateReferralCode() {
    let code = ID.generate(new Date().toJSON());
    if (code.toString().length < 6) {
        return generateReferralCode();
    }
    return code;
}

module.exports = generateReferralCode;