const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const app = express();
const cors = require('cors');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const path = require('path');
const connectDB = require('./utils/db');
const cron = require('node-cron');
const updateInvestmentProgress = require('./croneJobs/updateInvestProgress');
const https = require('https');
const fs = require('fs');

cron.schedule('0 * * * *', updateInvestmentProgress);



connectDB();

app.use(cors({ origin : '*' }));
app.use(morgan('dev'));
app.use(cookieParser());
app.use(express.json({ limit : '10mb' }));
app.use(express.static(path.join(__dirname , 'uploads')));

app.use('/api/user' , require('./routes/userRoutes'));
app.use('/api/admin' , require('./routes/adminRoutes'));
app.use('/api/company' , require('./routes/companyRoutes'));
app.use('/api/offer' , require('./routes/offerRoutes'));
app.use('/api/setting' , require('./routes/settingRoutes'));
app.use('/api/deposit' , require('./routes/depositRoutes'));
app.use('/api/invest' , require('./routes/investRoutes'));
app.use('/api/invite' , require('./routes/inviteRoutes'));
app.use('/api/bank' , require('./routes/bankRoutes'));
app.use('/api/withdraw' , require('./routes/withdrawRoutes'));
app.use('/api/change-bank' , require('./routes/chnageBankRoutes'));
app.use('/api/wallet-history' , require('./routes/walletHistoryRoutes'));

app.use(require('./middlewares/errorHandler'));

// const options = {
//     key: fs.readFileSync('eaglex.key', 'utf8').trim(),
//     cert: fs.readFileSync('eaglex.crt', 'utf8').trim()
// };
  
// const server = https.createServer(options, app);

const PORT = process.env.PORT || 5500;
app.listen(PORT , () => console.log(`server is listening on port ${PORT}`))