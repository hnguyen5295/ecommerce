'use strict';

const ProductService = require('../services/product.service');
const { SuccessResponse } = require('../core/success.response');

class ProductController {
  createProduct = async (req, res, next) => {
    console.log('ProductController', req);
    new SuccessResponse({
      message: 'A new Product is created successfully!',
      metadata: await ProductService.createProduct(req.body.product_type, {
        ...req.body,
        product_shop: req.userId,
      }),
    }).send(res);
  };
}

module.exports = new ProductController();
