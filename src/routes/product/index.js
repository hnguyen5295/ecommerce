'use strict';

const express = require('express');
const productController = require('../../controllers/product.controller');
const asyncHandler = require('../../helpers/asyncHandler');
const { authentication } = require('../../auth/authUtils');
const router = express.Router();

router.get('/search/:searchKey', asyncHandler(productController.searchProducts));
router.get('', asyncHandler(productController.findAllProducts));
router.get('/:product_id', asyncHandler(productController.findProduct));

// authentication //
router.use(authentication);
// authentication //
router.post('', asyncHandler(productController.createProduct));
router.post('/publish/:id', asyncHandler(productController.publishProductByShop));
router.post('/unpublish/:id', asyncHandler(productController.unPublishProductByShop));

// QUERY //
router.get('/drafts/all', asyncHandler(productController.getAllDrafsForShop));
router.get('/published/all', asyncHandler(productController.getAllPublishForShop));

module.exports = router;
