const Invest = require('../models/investModel');

const updateInvestmentProgress = async () => {
  try {
        console.log(`running`)
        const investments = await Invest.find({ status: 'running' })
        .populate(['user' , 'offer'])

    // Iterate through each investment
        for (const investment of investments) {
            const timePeriod = investment.offer.timePeriod
            const perHourPercentage = 100 / (timePeriod * 24);
            investment.progress += perHourPercentage;
            if (investment.progress >= 100) {
                investment.status = 'completed';
                investment.progress = 100;
            }
            await investment.save();
        }
    } catch (error) {
        console.error('Error updating investment progress:', error);
    }
};

module.exports = updateInvestmentProgress;

// Schedule the cron job to run every hour

