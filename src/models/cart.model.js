const { Schema, model } = require('mongoose');

const DOCUMENT_NAME = 'Cart';
const COLLECTION_NAME = 'Carts';

const cartSchema = new Schema(
  {
    cart_state: { type: String, required: true, enum: ['active', 'completed', 'failed', 'pending'], default: 'active' },
    cart_products: { type: Array, required: true, default: [] },
    cart_product_count: { type: Number, default: 0 },
    cart_userId: { type: Number, required: true },
  },
  {
    collection: COLLECTION_NAME,
    timestamps: {
      createdAt: 'createdOn',
      updatedAt: 'modifiedOn',
    },
  }
);

//Export the model
module.exports = {
  cart: model(DOCUMENT_NAME, cartSchema),
};
