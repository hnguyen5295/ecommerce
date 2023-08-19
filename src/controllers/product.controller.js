'use strict';

const ProductService = require('../services/product.service');
const { SuccessResponse } = require('../core/success.response');

class ProductController {
  createProduct = async (req, res, next) => {
    new SuccessResponse({
      message: 'createProduct success!',
      metadata: await ProductService.createProduct(req.body.product_type, {
        ...req.body,
        product_shop: req.userId,
      }),
    }).send(res);
  };

  updateProduct = async (req, res, next) => {
    new SuccessResponse({
      message: 'updateProduct success!',
      metadata: await ProductService.updateProduct(req.body.product_type, req.params.productId, {
        ...req.body,
        product_shop: req.userId,
      }),
    }).send(res);
  };

  publishProductByShop = async (req, res, next) => {
    new SuccessResponse({
      message: 'publishProductByShop success!',
      metadata: await ProductService.publishProductByShop({
        product_shop: req.userId,
        product_id: req.params.id,
      }),
    }).send(res);
  };

  unPublishProductByShop = async (req, res, next) => {
    new SuccessResponse({
      message: 'unpublish success!',
      metadata: await ProductService.unPublishProductByShop({
        product_shop: req.userId,
        product_id: req.params.id,
      }),
    }).send(res);
  };

  // QUERY //
  /**
   * @desc Get all drafts for shop
   * @param { Number } limit
   * @param { Number } skip
   * @return { JSON }
   */
  getAllDrafsForShop = async (req, res, next) => {
    new SuccessResponse({
      message: 'getAllDrafsForShop success!',
      metadata: await ProductService.findAllDraftsForShop({
        product_shop: req.userId,
      }),
    }).send(res);
  };

  getAllPublishForShop = async (req, res, next) => {
    new SuccessResponse({
      message: 'getAllPublishForShop success!',
      metadata: await ProductService.findAllPublishForShop({
        product_shop: req.userId,
      }),
    }).send(res);
  };

  searchProducts = async (req, res, next) => {
    new SuccessResponse({
      message: 'searchProducts success!',
      metadata: await ProductService.searchProducts(req.params),
    }).send(res);
  };

  findAllProducts = async (req, res, next) => {
    new SuccessResponse({
      message: 'findAllProducts success!',
      metadata: await ProductService.findAllProducts(req.query),
    }).send(res);
  };

  findProduct = async (req, res, next) => {
    new SuccessResponse({
      message: 'findProduct success!',
      metadata: await ProductService.findProduct({ product_id: req.params.product_id }),
    }).send(res);
  };

  // END QUERY //
}

module.exports = new ProductController();
