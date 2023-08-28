const { Schema, model } = require('mongoose');

const DOCUMENT_NAME = 'Order';
const COLLECTION_NAME = 'Orders';

const orderSchema = new Schema(
  {
    order_userId: { type: Number, required: true },
    order_checkout: { type: Object, default: {} },
    /*
      order_checkout = {
        totalPrice,
        totalDiscount,
        totalCheckout,
        shipmentFee
      }
     */

    order_shipment: { type: Object, default: {} },
    /*
      street,
      city,
      state,
      country
     */

    order_payment: { type: Object, default: {} },
    order_products: { type: Array, required: true },
    order_trackingNumber: { type: String, default: '#00001127082022' },
    order_status: {
      type: String,
      enum: ['pending', 'confirmed', 'shipped', 'cancelled', 'delivered'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME,
  }
);

//Export the model
module.exports = {
  order: model(DOCUMENT_NAME, orderSchema),
};
