'use strict';

const express = require('express');
const checkoutController = require('../../controllers/checkout.controller');
const asyncHandler = require('../../helpers/asyncHandler');
const router = express.Router();

router.post('/preview', asyncHandler(checkoutController.checkoutPreview));

module.exports = router;
