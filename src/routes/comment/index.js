'use strict';

const express = require('express');
const commentController = require('../../controllers/comment.controller');
const asyncHandler = require('../../helpers/asyncHandler');
const { authentication } = require('../../auth/authUtils');
const router = express.Router();

// authentication //
router.use(authentication);
// authentication //

router.post('', asyncHandler(commentController.createComment));
router.get('', asyncHandler(commentController.getCommentsByParentId));
router.delete('', asyncHandler(commentController.deleteComment));

module.exports = router;
