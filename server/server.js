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
const http = require('http')
const fs = require('fs');
const addExtraBonus = require('./croneJobs/addExtraBonus');


cron.schedule('0 * * * *', updateInvestmentProgress); // every hour 
// cron.schedule('*/1 * * * * *', updateInvestmentProgress); // every second
// cron.schedule('* * * * *', updateInvestmentProgress); // every minute

cron.schedule('30 4 * * *', addExtraBonus , {
    timezone: 'Asia/Karachi' // Set the timezone to Pakistan
});

connectDB();

// const allowedOrigins = ['https://admin.eaglexgroup.com' , 'https://eaglexgroup.com'];

//dev
const allowedOrigins = ['https://admin.eaglexgroup.com' , 'https://eaglexgroup.com' , 'http://localhost:3001' , 'http://localhost:3000' , "127.0.0.1:3001" , '127.0.0.1:3001'];  

const corsOptions = {
    origin: function (origin, callback) {
        if (allowedOrigins.includes(origin) || !origin) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    }
};

app.use(cors(corsOptions));
app.use(morgan('dev'));
app.use(cookieParser());
app.use(express.json({ limit : '15mb' }));
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
app.use('/api/chat' , require('./routes/chatRoutes'));
app.use('/api/message' , require('./routes/messageRoutes'));
app.use('/api/wallet' , require('./routes/walletRoutes'));
app.use('/api/notification' , require('./routes/notificationRoutes'));

app.use(require('./middlewares/errorHandler'));


const { Server } = require('socket.io');


const httpServer = http.createServer(app);
const io = new Server(httpServer , {
    cors : {
        // origin : ['https://eaglexgroup.com' , 'https://admin.eaglexgroup.com']
        origin : ['https://admin.eaglexgroup.com' , 'https://eaglexgroup.com' , 'http://localhost:3001' , 'http://localhost:3000' , "127.0.0.1:3001" , '127.0.0.1:3001']
    }
});


let chats = [];

const addToChats = (chat) => {
    if(!chats.find(ch => ch._id === chat._id)){
        chats.push(chat);
    }
}

const removeFromChats = (chat) => {
    chats = chats.filter(ch => ch._id !== chat._id );
}

io.on('connection' , (socket) => {

    socket.on('join-chat' , (chat) => {
        addToChats(chat);
        socket.join(chat._id)
    });
    
    socket.on('new-message' , (message) => {
        socket.broadcast.to(message.chat._id).emit('new-message-recieved' , message);
    });

    socket.on('start-typing' , (roomId) => {
        socket.broadcast.to(roomId).emit('start-typing')
    });
    
    socket.on('stop-typing' , (roomId) => {
        socket.broadcast.to(roomId).emit('stop-typing')
    });

    socket.on('send-notification' , (message) => {
        socket.broadcast.emit('new-notification' , message);
    });

    socket.on('leave-chat' , (chat) => {
        removeFromChats(chat);
    })
});

const PORT = process.env.PORT || 5500;
httpServer.listen(PORT , () => console.log(`server is listening on port ${PORT}`))


// const User = require('./models/userModel');
// const Deposit = require('./models/depositModel');

// const calcUserDeposit = async () => {
//     try {
//         const users = await User.find({});
//         for (let user of users) {
//             const deposits = await Deposit.find({ user : user._id , status : 'approved' });
//             if(deposits.length > 0 ) {
//                 const totalDepositAmount = deposits.reduce((acc , i) => acc + i.transferAmount , 0);
//                 user.totalDepositAmount = Number(totalDepositAmount);
//                 await user.save()
//             }
//         }
//     } catch (error) {
//         console.log({ calDepositError : error })
//     }
// }
// calcUserDeposit();
