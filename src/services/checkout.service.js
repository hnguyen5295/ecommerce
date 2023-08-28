'use strict';

const { BadRequestError, NotFoundError } = require('../core/error.response');
const { findCartById } = require('../models/repositories/cart.repo');
const { checkProductByServer } = require('../models/repositories/product.repo');
const { order } = require('../models/order.model');
const { getDiscountAmount } = require('./discount.service');
const { acquireLock, releaseLock } = require('./redis.service');

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

  static async orderByUser({ shop_order_ids, cartId, userId, user_address = {}, user_payment = {} }) {
    const { shop_order_ids_new, checkoutOrder } = await this.checkoutPreview({ cartId, userId, shop_order_ids });
    const products = shop_order_ids_new.flatMap((order) => order.item_products);
    console.log(`[1]::`, products);

    const acquireProducts = [];
    for (let i = 0; i < products.length; i++) {
      const { productId, quantity } = products[i];
      const keyLock = await acquireLock(productId, quantity, cartId);
      acquireProducts.push(keyLock ? true : false);
      if (keyLock) {
        releaseLock(keyLock);
      }
    }

    // If has a product is out of stock
    if (acquireProducts.includes(false))
      throw new BadRequestError(`Some products has been modified, please back to your Cart!`);

    const newOrder = await order.create({
      order_userId: userId,
      order_checkout: checkoutOrder,
      order_shipment: user_address,
      order_payment: user_payment,
      order_products: shop_order_ids_new,
    });
    // If order is success, then remove all product in the cart
    if (newOrder) {
    }

    return newOrder;
  }
}

module.exports = CheckoutService;
