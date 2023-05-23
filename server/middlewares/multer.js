const multer = require('multer');
const path = require('path')

const storage = multer.diskStorage({
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, uniqueSuffix + '.mp3')
    },
    destination: function (req, file, cb) {
        console.log('storage')
        cb(null, path.resolve('server/uploads/songs'))
    },
})

const upload = multer({ storage })
module.exports = upload;