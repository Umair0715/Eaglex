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


cron.schedule('0 * * * *', updateInvestmentProgress); // every hour 
// cron.schedule('*/1 * * * * *', updateInvestmentProgress); // every second
// cron.schedule('* * * * *', updateInvestmentProgress); // every minute

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
    console.log({ all : chats })
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

// const deleteInvestRecordsWithDeletedOffers = async () => {
//     try {
//         const Invest = require('./models/investModel');
//         const Offer = require('./models/offerModel');
//       // Find all invest records
//         const investRecords = await Invest.find({});
  
//       // Array to store deleted offer IDs
//         const deletedOfferIds = [];
  
//       // Iterate through each invest record
//         for (const record of investRecords) {
//             // Check if the offer exists
//             const offerExists = await Offer.exists({ _id: record.offer });
    
//             // If the offer doesn't exist, add its ID to the deletedOfferIds array
//             if (!offerExists) {
//                 deletedOfferIds.push(record.offer);
//             }
//         }
  
//         // Delete invest records with deleted offer IDs
//         // await Invest.deleteMany({ offer: { $in: deletedOfferIds } });
//         console.log({ deletedOfferIds })
//         // console.log('Invest records with deleted offers have been deleted successfully.');
//     } catch (error) {
//         console.error('Error deleting invest records:', error);
//     }
// };
// deleteInvestRecordsWithDeletedOffers();

const PORT = process.env.PORT || 5500;
httpServer.listen(PORT , () => console.log(`server is listening on port ${PORT}`))