'use strict';

const NotificationService = require('../services/notification.service');
const { SuccessResponse } = require('../core/success.response');

class NotificationController {
  getListNotifyByUser = async (req, res, next) => {
    new SuccessResponse({
      message: 'getListNotifyByUser Success!',
      metadata: await NotificationService.getListNotifyByUser(req.query),
    }).send(res);
  };
}

module.exports = new NotificationController();
