const { Schema, model } = require('mongoose');
const { PRODUCT_DOCUMENT } = require('./product.model');
const { SHOP_DOCUMENT } = require('./shop.model');

const DOCUMENT_NAME = 'Inventory';
const COLLECTION_NAME = 'Inventories';

const inventorySchema = new Schema(
  {
    inventory_productId: { type: Schema.Types.ObjectId, ref: PRODUCT_DOCUMENT },
    inventory_location: { type: String, default: 'unknown' },
    inventory_stock: { type: Number, required: true },
    inventory_shopId: { type: Schema.Types.ObjectId, ref: SHOP_DOCUMENT },
    inventory_reservations: { type: Array, default: [] },
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME,
  }
);

//Export the model
module.exports = {
  inventory: model(DOCUMENT_NAME, inventorySchema),
};
