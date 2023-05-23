const handlerFactory = require('./factories/handlerFactory');
const Setting = require('../models/settingsModel');
const catchAsync = require('../utils/catchAsync');
const { sendSuccessResponse } = require('../utils/helpers');


exports.createSettings = catchAsync(async(req, res ) => {
    const settingsExist = await Setting.findOne({});
    if(settingsExist) {
        const updatedSettings = await Setting.findByIdAndUpdate(settingsExist._id , req.body , {
            new : true , 
            runValidators : true 
        });
        return sendSuccessResponse(res , 200 , {
            message : 'Changes saved successfully.' , 
            doc : updatedSettings 
        })
    }else {
        const newSetting = await Setting.create(req.body);
        sendSuccessResponse(res , 200 , {
            message : 'Saved successfully.' , 
            doc : newSetting
        })
    }
});
exports.getSettings = catchAsync(async(req , res ) => {
    const settings = await Setting.findOne({});
    sendSuccessResponse(res , 200 , { doc : settings })
});
exports.updateSettings = handlerFactory.updateOne(Setting);
exports.deleteSettings = handlerFactory.deleteOne(Setting);