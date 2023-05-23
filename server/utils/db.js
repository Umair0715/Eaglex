const mongoose = require('mongoose');

// const DB = 'mongodb://localhost:27017/markaz';
const DB = process.env.DATABASE_URI;

const connectDB = () => {
   mongoose.connect(DB , {
      useNewUrlParser : true , 
      useUnifiedTopology : true 
   })
   .then(() => console.log('Database connected.'))
   .catch(err => console.log(`Database connection failed. ${err}`))
}
module.exports = connectDB ;