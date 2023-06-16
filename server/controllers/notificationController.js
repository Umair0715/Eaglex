const Notification = require('../models/notificationModel');
const handlerFactory = require('./factories/handlerFactory');

exports.createNotification = handlerFactory.createOne(Notification);
exports.getAllNotifications = handlerFactory.getAll(Notification);
exports.getSingleNotification = handlerFactory.getOne(Notification);
exports.updateNotification = handlerFactory.updateOne(Notification);
exports.deleteNotification = handlerFactory.deleteOne(Notification);

