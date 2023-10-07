'use strict';

const { model, Schema } = require('mongoose');
const { SHOP_DOCUMENT } = require('./shop.model.js');

const DOCUMENT_NAME = 'Notification';
const COLLECTION_NAME = 'Notifications';

// ORDER-001: order successfully
// ORDER-002: order failed
// PROMOTION-001: new promotion
// SHOP-001: new product by User following

const notificationSchema = new Schema(
  {
    notify_type: { type: String, enum: ['ORDER-001', 'ORDER-002', 'SHOP-001', 'PROMOTION-001'], required: true },
    notify_senderId: { type: Schema.Types.ObjectId, required: true, ref: SHOP_DOCUMENT },
    notify_receiverId: { type: String, required: true },
    notify_content: { type: String, required: true },
    notify_options: { type: Object, default: {} },
  },
  {
    collection: COLLECTION_NAME,
    timestamps: true,
  }
);

//Export the model
module.exports = {
  notification: model(DOCUMENT_NAME, notificationSchema),
};
