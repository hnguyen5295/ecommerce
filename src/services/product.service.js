'use strict';
const { product, clothing, electronic, furniture } = require('../models/product.model');
const { BadRequestError } = require('../core/error.response');
const {
  findAllDraftsForShop,
  findAllPublishForShop,
  publishProductByShop,
  searchProductByUser,
  findAllProducts,
  findProduct,
  updateProductById,
} = require('../models/repositories/product.repo');
const { insertInventory } = require('../models/repositories/inventory.repo');
const { removeUndefinedObject, updateNestedObjectParser } = require('../utils');
const { pushNotifyToSystem } = require('./notification.service');
const { findById } = require('./shop.service');
class ProductFactory {
  static productRegistry = {}; // key-class

  static registerProductType(type, classRef) {
    ProductFactory.productRegistry[type] = classRef;
  }

  /**
   * @param {string} type - Clothing / Electronic / Furniture
   * @param {string} payload
   */
  static createProduct(type, payload) {
    const productClass = ProductFactory.productRegistry[type];
    if (!productClass) throw new BadRequestError(`Invalid product type: ${type}`);

    return new productClass(payload).createProduct();
  }

  static updateProduct(type, productId, payload) {
    const productClass = ProductFactory.productRegistry[type];
    if (!productClass) throw new BadRequestError(`Invalid product type: ${type}`);

    return new productClass(payload).updateProduct(productId);
  }

  static async publishProductByShop({ product_shop, product_id }) {
    return await publishProductByShop({ product_shop, product_id });
  }

  static async unPublishProductByShop({ product_shop, product_id }) {
    return await unPublishProductByShop({ product_shop, product_id });
  }

  // QUERY //
  static async findAllDraftsForShop({ product_shop, limit = 50, skip = 0 }) {
    const query = { product_shop, isDraft: true };
    return await findAllDraftsForShop({ query, limit, skip });
  }

  static async findAllPublishForShop({ product_shop, limit = 50, skip = 0 }) {
    const query = { product_shop, isPublished: true };
    return await findAllPublishForShop({ query, limit, skip });
  }

  static async searchProducts({ searchKey }) {
    return await searchProductByUser({ searchKey });
  }

  static async findAllProducts({ limit = 50, sort = 'ctime', page = 1, filter = { isPublished: true } }) {
    return await findAllProducts({
      limit,
      sort,
      page,
      filter,
      select: ['product_name', 'product_price', 'product_thumb', 'product_shop'],
    });
  }

  static async findProduct({ product_id }) {
    return findProduct({ product_id, unSelect: ['__v'] });
  }

  // END QUERY //
}

class Product {
  constructor({
    product_name,
    product_shop,
    product_type,
    product_thumb,
    product_price,
    product_quantity,
    product_attributes,
    product_description,
  }) {
    this.product_name = product_name;
    this.product_thumb = product_thumb;
    this.product_description = product_description;
    this.product_price = product_price;
    this.product_quantity = product_quantity;
    this.product_type = product_type;
    this.product_shop = product_shop;
    this.product_attributes = product_attributes;
  }

  async createProduct(product_id) {
    const newProduct = await product.create({ ...this, _id: product_id });
    if (newProduct) {
      // add newProduct into inventory_stock
      await insertInventory({
        productId: newProduct._id,
        shopId: this.product_shop,
        stock: this.product_quantity,
      });

      // push notify to system collection
      pushNotifyToSystem({
        type: 'SHOP-001',
        receiverId: 1,
        senderId: this.product_shop,
        options: {
          product_name: this.product_name,
          shop_name: (await findById({ id: this.product_shop, select: { name: 1 } })).name,
        },
      })
        .then((rs) => console.log(rs))
        .catch(console.error);
    }

    return newProduct;
  }

  async updateProduct(productId, payload) {
    return await updateProductById({ productId, payload, model: product });
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

  async updateProduct(productId) {
    const objectParam = removeUndefinedObject(this);

    if (objectParam.product_attributes) {
      await updateProductById({
        productId,
        payload: updateNestedObjectParser(objectParam.product_attributes),
        model: clothing,
      });
    }

    return await super.updateProduct(productId, updateNestedObjectParser(objectParam));
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

class Furniture extends Product {
  async createProduct() {
    const newFurniture = await furniture.create({
      ...this.product_attributes,
      product_shop: this.product_shop,
    });
    if (!newFurniture) throw new BadRequestError('create Furniture error!');

    const newProduct = await super.createProduct(newFurniture._id);
    if (!newProduct) throw new BadRequestError('create Product error!');

    return newProduct;
  }
}

// Register product type
ProductFactory.registerProductType('Electronic', Electronic);
ProductFactory.registerProductType('Clothing', Clothing);
ProductFactory.registerProductType('Furniture', Furniture);

module.exports = ProductFactory;
