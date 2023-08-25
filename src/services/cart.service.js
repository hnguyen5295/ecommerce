'use strict';

const { BadRequestError, NotFoundError } = require('../core/error.response');
const { cart } = require('../models/cart.model');
const { createUserCart, updateUserCartQuantity, deleteItemInCart } = require('../models/repositories/cart.repo');
const { getProductById } = require('../models/repositories/product.repo');

/*
  Cart Service
  - add product to cart [User]
  - decrease product quantity by one [User]
  - increase product quantity by one [User]
  - get cart [User]
  - delete cart [User]
  - delete cart item [User]
*/

class CartService {
  static async addToCart({ userId, product = {} }) {
    const { productId, shopId } = product;

    // check product
    const foundProduct = await getProductById({ productId });
    if (!foundProduct) throw new NotFoundError('Not found');

    // compare
    if (foundProduct.product_shop.toString() !== shopId) {
      throw new NotFoundError('Product is not belong to this shop');
    }

    // check cart exist or not
    const userCart = await cart.findOne({ cart_userId: userId });
    console.log('userCart', userCart);
    if (!userCart) {
      const { product_name, product_price } = foundProduct;
      return await createUserCart({
        userId,
        product: {
          ...product,
          name: product_name,
          price: product_price,
        },
      });
    }

    // Cart exist, product is empty
    if (!userCart.cart_products.length) {
      userCart.cart_products.push(product);
      return await userCart.save();
    }

    // Cart exist, product exist
    return await updateUserCartQuantity({ userId, product });
  }

  /*
    userId,
    shop_order_ids: [
      {
        shopId,
        item_products: [
          {
            quantity,
            price,
            shopId,
            old_quantity,
            productId
          }
        ],
        version
      }
    ]
   */
  static async addToCartV2({ userId, shop_order_ids }) {
    const { productId, quantity, old_quantity } = shop_order_ids[0]?.item_products[0];
    // check product
    const foundProduct = await getProductById({ productId });
    if (!foundProduct) throw new NotFoundError('Not found');

    // compare
    if (foundProduct.product_shop.toString() !== shop_order_ids[0]?.shopId) {
      throw new NotFoundError('Product is not belong to this shop');
    }

    if (quantity === 0) {
      return await deleteItemInCart({ userId, productId });
    }

    return await updateUserCartQuantity({
      userId,
      product: {
        productId,
        quantity: quantity - old_quantity,
      },
    });
  }

  static async deleteItemInCart({ userId, productId }) {
    return await deleteItemInCart({ userId, productId });
  }

  static async getListUserCart({ userId }) {
    return await cart.findOne({ cart_userId: +userId }).lean();
  }
}

module.exports = CartService;
