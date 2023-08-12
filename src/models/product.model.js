'use strict';
const { model, Schema } = require('mongoose');
const { SHOP_DOCUMENT } = require('./shop.model');

const DOCUMENT_NAME = 'Product';
const COLLECTION_NAME = 'Products';

const ELECTRONIC_DOCUMENT = 'Electronic';
const ELECTRONIC_COLLECTION = 'Electronics';

const CLOTHING_DOCUMENT = 'Clothing';
const CLOTHING_COLLECTION = 'Clothes';

const productSchema = new Schema(
  {
    product_name: {
      type: String,
      required: true,
    },
    product_thump: {
      type: String,
      required: true,
    },
    product_description: String,
    product_price: {
      type: Number,
      required: true,
    },
    product_quantity: {
      type: Number,
      required: true,
    },
    product_type: {
      type: String,
      required: true,
      enum: ['Electronics', 'Clothing', 'Furniture'],
    },
    product_shop: {
      type: Schema.Types.Mixed,
      ref: SHOP_DOCUMENT,
    },
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME,
  }
);

// define the product type = Clothing
const clothingSchema = new Schema(
  {
    brand: {
      type: String,
      required: true,
    },
    size: String,
    material: String,
  },
  {
    timestamps: true,
    collection: CLOTHING_COLLECTION,
  }
);

// define the product type = Electronic
const electronicSchema = new Schema(
  {
    manufacturer: {
      type: String,
      required: true,
    },
    model: String,
    color: String,
  },
  {
    timestamps: true,
    collection: ELECTRONIC_COLLECTION,
  }
);
//Export the model
module.exports = {
  product: model(DOCUMENT_NAME, productSchema),
  electronic: model(ELECTRONIC_DOCUMENT, electronicSchema),
  clothing: model(CLOTHING_DOCUMENT, clothingSchema),
};
