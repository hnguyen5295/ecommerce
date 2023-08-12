'use strict';
const { model, Schema } = require('mongoose');

export const SHOP_DOCUMENT = 'Shop';
const SHOP_COLLECTION = 'Shops';
// !dmbg: snippet
// Declare the Schema of the Mongo model
var shopSchema = new Schema(
  {
    name: {
      type: String,
      trim: true,
      maxLength: 150,
    },
    email: {
      type: String,
      trim: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'inactive',
    },
    verify: {
      type: Schema.Types.Boolean,
      default: false,
    },
    roles: {
      type: Array,
      default: [],
    },
  },
  {
    timestamps: true,
    collection: SHOP_COLLECTION,
  }
);

//Export the model
module.exports = model(SHOP_DOCUMENT, shopSchema);
