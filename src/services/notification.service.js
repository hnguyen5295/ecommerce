'use strict';

const { notification } = require('../models/notification.model');
const { Messages } = require('../helpers/messages');

class NotificationService {
  static pushNotifyToSystem = async ({ type, receiverId, senderId, options = {} }) => {
    let notifyContent;
    if (type === 'SHOP-001') {
      notifyContent = Messages.ADD_NEW_PRODUCT;
    } else if (type === 'SHOP-002') {
      notifyContent = Messages.ADD_NEW_VOUCHER;
    }

    return await notification.create({
      notify_type: type,
      notify_receiverId: receiverId,
      notify_senderId: senderId,
      notify_content: notifyContent,
      notify_options: options,
    });
  };

  static getListNotifyByUser = async ({ userId = 1, type = 'ALL', isRead = 0 }) => {
    const match = { notify_receiverId: `${userId}` };
    if (type !== 'ALL') {
      match['notify_type'] = type;
    }
    console.log(match);
    return await notification.aggregate([
      { $match: match },
      {
        $project: {
          notify_type: 1,
          notify_senderId: 1,
          notify_receiverId: 1,
          notify_content: 1,
          notify_options: 1,
          createdAt: 1,
        },
      },
    ]);
  };
}

module.exports = NotificationService;
