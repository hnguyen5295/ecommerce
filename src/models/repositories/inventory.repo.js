'use strict';

const { inventory } = require('../inventory.model');
const { convertToObjectId } = require('../../utils/index');

const insertInventory = async ({ productId, shopId, stock, location = 'unknown' }) => {
  return await inventory.create({
    inventory_productId: productId,
    inventory_location: location,
    inventory_stock: stock,
    inventory_shopId: shopId,
  });
};

const updateInventory = async ({ productId, shopId, stock, location = 'unknown' }) => {
  const query = { inventory_productId: convertToObjectId(productId), inventory_shopId: convertToObjectId(shopId) },
    updateSet = {
      $inc: {
        inventory_stock: stock,
      },
      $set: {
        inventory_location: location,
      },
    },
    options = { new: true, upsert: true };

  return await inventory.findOneAndUpdate(query, updateSet, options);
};

const reserveInventory = async ({ productId, quantity, cartId }) => {
  const query = { inventory_productId: convertToObjectId(productId), inventory_stock: { $gte: quantity } },
    updateSet = {
      $inc: {
        inventory_stock: -quantity,
      },
      $push: {
        inventory_reservations: {
          quantity,
          cartId,
          createdOn: new Date(),
        },
      },
    },
    options = { new: true, upsert: true };

  return await inventory.updateOne(query, updateSet, options);
};

module.exports = {
  insertInventory,
  updateInventory,
  reserveInventory,
};
