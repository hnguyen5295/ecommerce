'use strict';

const { BadRequestError, NotFoundError } = require('../core/error.response');
const { findCartById } = require('../models/repositories/cart.repo');
const { checkProductByServer } = require('../models/repositories/product.repo');
const { getDiscountAmount } = require('./discount.service');

class CheckoutService {
  /*
    {
      cartId,
      userId,
      shop_order_ids: [
        {
          shopId,
          shop_discounts: [
            {
              shopId,
              discountId,
              codeId
            }
          ],
          item_products: [
            {
              price,
              quantity,
              productId
            }
          ]
        }
      ]
    }
   */

  static async checkoutPreview({ cartId, userId, shop_order_ids }) {
    const foundCart = findCartById(cartId);
    if (!foundCart) throw new NotFoundError('Cart not exists!');

    const checkoutOrder = {
        totalPrice: 0,
        totalDiscount: 0,
        totalCheckout: 0,
        shipmentFee: 0,
      },
      shop_order_ids_new = [];

    for (let i = 0; i < shop_order_ids.length; i++) {
      const { shopId, shop_discounts = [], item_products = [] } = shop_order_ids[i];
      const checkoutProduct = await checkProductByServer(item_products);
      if (checkoutProduct.length === 0) throw new BadRequestError('Wrong order!');

      const checkoutPrice = checkoutProduct.reduce((acc, product) => {
        return acc + product.price * product.quantity;
      }, 0);

      checkoutOrder.totalPrice += checkoutPrice;

      const checkoutItem = {
        shopId,
        shop_discounts,
        rawPrice: checkoutPrice,
        priceAfterDiscount: checkoutPrice,
        item_products: checkoutProduct,
      };

      for (let j = 0; j < shop_discounts.length; j++) {
        const { discount = 0 } = await getDiscountAmount({
          codeId: shop_discounts[j].codeId,
          userId,
          shopId,
          products: checkoutProduct,
        });

        checkoutOrder.totalDiscount += discount;
        if (discount > 0) {
          checkoutItem.priceAfterDiscount = checkoutPrice - discount;
        }

        checkoutOrder.totalCheckout += checkoutItem.priceAfterDiscount;
      }

      shop_order_ids_new.push(checkoutItem);
    }

    return {
      shop_order_ids,
      shop_order_ids_new,
      checkoutOrder,
    };
  }
}

module.exports = CheckoutService;
