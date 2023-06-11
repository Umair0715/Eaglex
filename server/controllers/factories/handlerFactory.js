const catchAsync = require('../../utils/catchAsync');
const AppError = require('../../utils/appError');
const { sendSuccessResponse } = require('../../utils/helpers');
const uploadImage = require('../../utils/uploadImage');


exports.createOne = (Model , docValidation = null) => catchAsync(async(req , res , next) => {
    if(docValidation){
        const { error } = docValidation.validate(req.body);
        if(error){
            return next(new AppError(error.details[0].message , 400))
        }
    } 
    const newDoc = await Model.create(req.body);
    return sendSuccessResponse(res , 200 , {
        message : 'Created successfully.' ,
        doc : newDoc 
    })
});

exports.getAll = (Model, populateItems = '') => catchAsync(async(req , res , next) => {
    const page = Number(req.query.page) || 1 ;
    const sort = req.query.sort || -1;
    const pageSize = req.query.pageSize || 10;
    if(req.query.pageSize && req.query.pageSize > 25){
        return next(new AppError('pageSize should be less than or equal to 25' , 400));
    }
    const keyword = req.query.keyword ?
    {
        name : {
            $regex : req.query.keyword ,
            $options : 'i'
        }
    } : {} ;    
    const docCount = await Model.countDocuments();
    const docs = await Model.find(keyword)
    .populate(populateItems)
    .skip(pageSize * (page - 1))
    .limit(pageSize)
    .sort({ createdAt : sort })
    const pages = Math.ceil(docCount/pageSize);
    sendSuccessResponse(res , 200 , {
        docs , page , pages , docCount 
    });
});

exports.getTotal = (Model, populateItems = '') => catchAsync(async(req , res , next) => {
    const sort = req.query.sort || -1;
    const keyword = req.query.keyword ?
    {
        name : {
            $regex : req.query.keyword ,
            $options : 'i'
        }
    } : {} ;    
    const docCount = await Model.countDocuments();
    const docs = await Model.find(keyword)
    .populate(populateItems)
    .sort({ createdAt : sort })
    sendSuccessResponse(res , 200 , {
        docs , docCount 
    });
});

exports.getAllActive = (Model, populateItems = '') => catchAsync(async(req , res , next) => {
    const page = Number(req.query.page) || 1 ;
    const sort = req.query.sort || -1;
    const pageSize = req.query.pageSize || 10;
    if(req.query.pageSize && req.query.pageSize > 25){
        return next(new AppError('pageSize should be less than or equal to 25' , 400));
    }
    const keyword = req.query.keyword ?
    {
        name : {
            $regex : req.query.keyword ,
            $options : 'i'
        }
    } : {} ;    
    const docCount = await Model.countDocuments({...keyword ,  isActive : true });
    const docs = await Model.find({...keyword , isActive : true })
    .populate(populateItems)
    .skip(pageSize * (page - 1))
    .limit(pageSize)
    .sort({ createdAt : sort })
    const pages = Math.ceil(docCount/pageSize);
    sendSuccessResponse(res , 200 , {
        docs , page , pages , docCount 
    });
});

exports.getActive = (Model, populateItems = '') => catchAsync(async(req , res , next) => {
    const page = Number(req.query.page) || 1 ;
    const sort = req.query.sort || -1;
    const pageSize = req.query.pageSize || 10;
    if(req.query.pageSize && req.query.pageSize > 25){
        return next(new AppError('pageSize should be less than or equal to 25' , 400));
    }
    const keyword = req.query.keyword ?
    {
        name : {
            $regex : req.query.keyword ,
            $options : 'i'
        }
    } : {} ;    
    const docCount = await Model.countDocuments({...keyword , isActive : true });
    const docs = await Model.find({...keyword , isActive : true })
    .populate(populateItems)
    .skip(pageSize * (page - 1))
    .limit(pageSize)
    .sort({ createdAt : sort })
    const pages = Math.ceil(docCount/pageSize);
    sendSuccessResponse(res , 200 , {
        docs , page , pages , docCount 
    });
});

exports.getOne = (Model, populateItems) => catchAsync(async(req , res , next) => {
    const { id } = req.params;
    const doc = await Model.findById(id)
    .populate(populateItems)
    if(!doc) return next(new AppError('Invalid id. Document not found.' , 404))
    sendSuccessResponse(res , 200 , { doc })
})

exports.updateOne = (Model , imgDirectory) => catchAsync(async(req , res , next) => {
    const { id } = req.params;
    const { image } = req.body;
    if(image) {
        const { fileName } = uploadImage(image , imgDirectory);
        req.body.image = `/${imgDirectory}/` + fileName;
    }
    const updatedDoc = await Model.findByIdAndUpdate(id , req.body , {
        new : true ,
        runValidators : true 
    });
    if(!updatedDoc) return next(new AppError('Invalid id provided.' , 404))
    return sendSuccessResponse(res , 200 , {
        message : 'Document updated successfully.',
        doc : updatedDoc
    })
})

exports.deleteOne = Model => catchAsync(async( req , res , next) => {
    const doc = await Model.findById(req.params.id);
    if(!doc){
        return next(new AppError('Document not found.' , 404))
    }
    await Model.findByIdAndDelete(req.params.id);
    sendSuccessResponse(res , 200 , {
        message : 'Document deleted successfully.' 
    })
});

exports.getMy = (Model , populateItems) => catchAsync(async(req , res , next) => {
    const page = req.query.page || 1 ;
    const sort = req.query.sort || -1;
    const pageSize = req.query.pageSize || 10 ;
    if(req.query.pageSize && req.query.pageSize > 25){
        return next(new AppError('pageSize should be less than or equal to 25' , 400))
    }
    const keyword = req.query.keyword ?
    {
        name : {
            $regex : req.query.keyword ,
            $options : 'i'
        }
    } : {} ;
    const docCount = await Model.countDocuments({...keyword , user : req.user._id });
    const docs = await Model.find({...keyword , user : req.user._id })
    .populate(populateItems)
    .skip(pageSize * (page - 1))
    .limit(pageSize)
    .sort({ createdAt : sort })
    const pages = Math.ceil(docCount/pageSize);
    sendSuccessResponse(res , 200 , {
        docs , page , pages , docCount 
    })
});

exports.getSpecific = (Model , populateItems) => catchAsync(async(req , res , next) => {
    const page = req.query.page || 1 ;
    const sort = req.query.sort || -1;
    const pageSize = req.query.pageSize || 10 ;
    if(req.query.pageSize && req.query.pageSize > 25){
        return next(new AppError('pageSize should be less than or equal to 25' , 400))
    }
    const keyword = req.query.keyword ?
    {
        name : {
            $regex : req.query.keyword ,
            $options : 'i'
        }
    } : {} ;
    const docCount = await Model.countDocuments({...keyword , user : req.params.id });
    const docs = await Model.find({...keyword , user : req.params.id })
    .populate(populateItems)
    .skip(pageSize * (page - 1))
    .limit(pageSize)
    .sort({ createdAt : sort })
    const pages = Math.ceil(docCount/pageSize);
    sendSuccessResponse(res , 200 , {
        docs , page , pages , docCount 
    })
}); 

