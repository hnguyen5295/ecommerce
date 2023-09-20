'use strict';

const { createComment, getCommentsByParentId, deleteComment } = require('../services/comment.service');
const { SuccessResponse } = require('../core/success.response');

class CommentController {
  createComment = async (req, res, next) => {
    new SuccessResponse({
      message: 'createComment success!',
      metadata: await createComment(req.body),
    }).send(res);
  };

  getCommentsByParentId = async (req, res, next) => {
    new SuccessResponse({
      message: 'getCommentsByParentId created!',
      metadata: await getCommentsByParentId(req.query),
    }).send(res);
  };

  deleteComment = async (req, res, next) => {
    new SuccessResponse({
      message: 'deleteComment success!',
      metadata: await deleteComment(req.body),
    }).send(res);
  };
}

module.exports = new CommentController();
