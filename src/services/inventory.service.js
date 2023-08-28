'use strict';

const { updateInventory } = require('../models/repositories/inventory.repo');

class InventoryService {
  async addStockToInventory({ stock, productId, shopId, location = 'HCM City' }) {
    return await updateInventory({ productId, shopId, stock, location });
  }
}

module.exports = InventoryService;
