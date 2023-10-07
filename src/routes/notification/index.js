'use strict';

const express = require('express');
const notificationController = require('../../controllers/notification.controller');
const asyncHandler = require('../../helpers/asyncHandler');
const { authentication } = require('../../auth/authUtils');
const router = express.Router();

// authentication //
router.use(authentication);
// authentication //

router.get('', asyncHandler(notificationController.getListNotifyByUser));

module.exports = router;
