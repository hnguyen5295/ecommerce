'use strict';
const { product, clothing, electronic } = require('../models/product.model');
const { BadRequestError } = require('../core/error.response');

class ProductFactory {
  /**
   * @param {string} type - Clothing / Electronic
   * @param {string} payload
   */
  static createProduct(type, payload) {
    switch (type) {
      case 'Clothing':
        return new Clothing(payload).createProduct();
      case 'Electronic':
        return new Electronic(payload).createProduct();
      default:
        throw new BadRequestError(`Invalid product type: ${type}`);
    }
  }
}

class Product {
  constructor({
    product_name,
    product_shop,
    product_type,
    product_thump,
    product_price,
    product_quantity,
    product_attributes,
    product_description,
  }) {
    this.product_name = product_name;
    this.product_thump = product_thump;
    this.product_description = product_description;
    this.product_price = product_price;
    this.product_quantity = product_quantity;
    this.product_type = product_type;
    this.product_shop = product_shop;
    this.product_attributes = product_attributes;
  }

  async createProduct(product_id) {
    return await product.create({ ...this, _id: product_id });
  }
}

class Clothing extends Product {
  async createProduct() {
    const newClothing = await clothing.create({
      ...this.product_attributes,
      product_shop: this.product_shop,
    });
    if (!newClothing) throw new BadRequestError('create Clothing error!');

    const newProduct = await super.createProduct(newClothing._id);
    if (!newProduct) throw new BadRequestError('create Product error!');

    return newProduct;
  }
}

class Electronic extends Product {
  async createProduct() {
    const newElectronic = await electronic.create({
      ...this.product_attributes,
      product_shop: this.product_shop,
    });
    if (!newElectronic) throw new BadRequestError('create Electronic error!');

    const newProduct = await super.createProduct(newElectronic._id);
    if (!newProduct) throw new BadRequestError('create Product error!');

    return newProduct;
  }
}

module.exports = ProductFactory;
