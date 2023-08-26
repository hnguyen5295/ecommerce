'use strict';

const { SuccessResponse } = require('../core/success.response');
const CheckoutService = require('../services/checkout.service');

class CheckoutController {
  async checkoutPreview(req, res, next) {
    new SuccessResponse({
      message: 'checkoutPreview success!',
      metadata: await CheckoutService.checkoutPreview(req.body),
    }).send(res);
  }
}

module.exports = new CheckoutController();
