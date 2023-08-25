'use strict';

const { cart } = require('../cart.model');

const createUserCart = async ({ userId, product }) => {
  const query = { cart_userId: userId, cart_state: 'active' },
    updateOrInsert = {
      $addToSet: { cart_products: product },
    },
    options = { upsert: true, new: true };

  return await cart.findOneAndUpdate(query, updateOrInsert, options);
};

const updateUserCartQuantity = async ({ userId, product }) => {
  const { productId, quantity } = product;
  const query = { cart_userId: userId, cart_state: 'active', 'cart_products.productId': productId },
    updateSet = {
      $inc: { 'cart_products.$.quantity': quantity },
    },
    options = { upsert: true, new: true };

  return await cart.findOneAndUpdate(query, updateSet, options);
};

const deleteItemInCart = async ({ userId, productId }) => {
  const query = { cart_userId: userId, cart_state: 'active' },
    updateSet = {
      $pull: { cart_products: { productId } },
    };

  return await cart.updateOne(query, updateSet);
};

module.exports = {
  deleteItemInCart,
  createUserCart,
  updateUserCartQuantity,
};
