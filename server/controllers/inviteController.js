const handlerFactory = require('./factories/handlerFactory');
const Invite = require('../models/inviteModel');

exports.createInvite = handlerFactory.createOne(Invite);
exports.getAllInvites = handlerFactory.getAll(Invite);
exports.getMyInvites = handlerFactory.getMy(Invite);
exports.deleteInvite = handlerFactory.deleteOne(Invite);