'use strict';

const { SuccessResponse } = require('../core/success.response');
const DiscountService = require('../services/discount.service');

class DiscountController {
  async createDiscountCode(req, res, next) {
    new SuccessResponse({
      message: 'createDiscountCode success!',
      metadata: await DiscountService.createDiscountCode({ ...req.body, shopId: req.user.userId }),
    }).send(res);
  }

  async getAllDiscountCodes(req, res, next) {
    new SuccessResponse({
      message: 'getAllDiscountCodes success!',
      metadata: await DiscountService.getAllDiscountCodesByShop({ ...req.query }),
    }).send(res);
  }

  async getDiscountAmount(req, res, next) {
    new SuccessResponse({
      message: 'getDiscountAmount success!',
      metadata: await DiscountService.getDiscountAmount({ ...req.body }),
    }).send(res);
  }

  async getAllDiscountCodesWithProduct(req, res, next) {
    new SuccessResponse({
      message: 'getAllDiscountCodesWithProduct success!',
      metadata: await DiscountService.getAllDiscountCodesWithProduct({ ...req.query }),
    }).send(res);
  }
}

module.exports = new DiscountController();
