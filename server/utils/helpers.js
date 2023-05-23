exports.sendSuccessResponse = ( res , statusCode = 200 , data ) => {
    res.status(statusCode).json({
        status : 'success' ,
        success : true ,
        data 
    })
}

exports.sendErrorResponse = ( res , statusCode = 400 , data ) => {
    res.status(statusCode).json({
        status : 'failed' ,
        success : false ,
        data 
    })
}








