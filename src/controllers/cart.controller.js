'use strict';

const { SuccessResponse } = require('../core/success.response');
const CartService = require('../services/cart.service');

class CartController {
  /**
   * @desc add to cart for user
   * @param {int} userId
   * @param {*} res
   * @param {*} next
   * @method POST
   */
  async addToCart(req, res, next) {
    new SuccessResponse({
      message: 'addToCart success!',
      metadata: await CartService.addToCart(req.body),
    }).send(res);
  }

  // update + -
  async update(req, res, next) {
    new SuccessResponse({
      message: 'update success!',
      metadata: await CartService.addToCartV2(req.body),
    }).send(res);
  }

  // delete
  async delete(req, res, next) {
    new SuccessResponse({
      message: 'delete success!',
      metadata: await CartService.deleteItemInCart(req.body),
    }).send(res);
  }

  // cart list
  async listToCart(req, res, next) {
    new SuccessResponse({
      message: 'getListUserCart success!',
      metadata: await CartService.getListUserCart(req.query),
    }).send(res);
  }
}

module.exports = new CartController();
