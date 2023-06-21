const mongoose = require('mongoose');

const DB = process.env.DATABASE_URI;
// const DB = 'mongodb://203.161.32.12/eaglex'
// const DB = 'mongodb://203.161.32.12:27017';

const connectDB = () => {
   mongoose.connect(DB , {
      useNewUrlParser : true , 
      useUnifiedTopology : true 
   })
   .then(() => console.log('Database connected.'))
   .catch(err => console.log(`Database connection failed. ${err}`))
}
module.exports = connectDB ;