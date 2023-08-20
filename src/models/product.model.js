'use strict';
const { model, Schema } = require('mongoose');
const { SHOP_DOCUMENT } = require('./shop.model');
const slugify = require('slugify');

const PRODUCT_DOCUMENT = 'Product';
const PRODUCT_COLLECTION = 'Products';

const ELECTRONIC_DOCUMENT = 'Electronic';
const ELECTRONIC_COLLECTION = 'Electronics';

const CLOTHING_DOCUMENT = 'Clothing';
const CLOTHING_COLLECTION = 'Clothes';

const FURNITURE_DOCUMENT = 'Furniture';
const FURNITURE_COLLECTION = 'Furnitures';

const productSchema = new Schema(
  {
    product_name: { type: String, required: true },
    product_thumb: { type: String, required: true },
    product_description: String,
    product_slug: String,
    product_price: { type: Number, required: true },
    product_quantity: { type: Number, required: true },
    product_type: { type: String, required: true, enum: ['Electronic', 'Clothing', 'Furniture'] },
    product_shop: { type: Schema.Types.ObjectId, ref: SHOP_DOCUMENT },
    product_attributes: { type: Schema.Types.Mixed, required: true },
    product_ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must above 1'],
      max: [5, 'Rating maximum is 5'],
      set: (val) => Math.round(val * 10) / 10,
    },
    product_variations: { type: Array, default: [] },
    isDraft: { type: Boolean, default: true, index: true, select: false },
    isPublished: { type: Boolean, default: false, index: true, select: false },
  },
  {
    timestamps: true,
    collection: PRODUCT_COLLECTION,
  }
);
// create index for search
productSchema.index({ product_name: 'text', product_description: 'text' });

// Document middleware: runs before .save, .create,...
productSchema.pre('save', function (next) {
  this.product_slug = slugify(this.product_name, { lower: true });
  next();
});

// define the product type = Clothing
const clothingSchema = new Schema(
  {
    brand: { type: String, required: true },
    size: String,
    material: String,
    product_shop: { type: Schema.Types.ObjectId, ref: SHOP_DOCUMENT },
  },
  {
    timestamps: true,
    collection: CLOTHING_COLLECTION,
  }
);

// define the product type = Electronic
const electronicSchema = new Schema(
  {
    manufacturer: { type: String, required: true },
    model: String,
    color: String,
    product_shop: { type: Schema.Types.ObjectId, ref: SHOP_DOCUMENT },
  },
  {
    timestamps: true,
    collection: ELECTRONIC_COLLECTION,
  }
);

// define the product type = Furniture
const furnitureSchema = new Schema(
  {
    brand: { type: String, required: true },
    size: String,
    material: String,
    product_shop: { type: Schema.Types.ObjectId, ref: SHOP_DOCUMENT },
  },
  {
    timestamps: true,
    collection: FURNITURE_COLLECTION,
  }
);

//Export the model
module.exports = {
  PRODUCT_DOCUMENT,
  product: model(PRODUCT_DOCUMENT, productSchema),
  electronic: model(ELECTRONIC_DOCUMENT, electronicSchema),
  clothing: model(CLOTHING_DOCUMENT, clothingSchema),
  furniture: model(FURNITURE_DOCUMENT, furnitureSchema),
};
