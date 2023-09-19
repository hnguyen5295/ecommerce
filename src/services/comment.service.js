'use strict';

const Comment = require('../models/comment.model');
const { convertToObjectId } = require('../utils/index');
const { NotFoundError } = require('../core/error.response');

/*
  key features: Comment Service
  - add comment [User, Shop]
  - get a list of comments [User, Shop]
  - delete a comment [User, Shop, Admin]
 */

class CommentService {
  static async createComment({ productId, userId, content, parentCommentId = null }) {
    const comment = new Comment({
      comment_productId: productId,
      comment_userId: userId,
      comment_content: content,
      comment_parentId: parentCommentId,
    });

    let rightValue;
    if (parentCommentId) {
      // reply comment
      const parentComment = await Comment.findById(parentCommentId);
      if (!parentComment) throw new NotFoundError(`parent comment not found!`);

      rightValue = parentComment.comment_right;
      // updateMany comments
      await Comment.updateMany(
        {
          comment_productId: convertToObjectId(productId),
          comment_right: { $gte: rightValue },
        },
        { $inc: { comment_right: 2 } }
      );

      await Comment.updateMany(
        {
          comment_productId: convertToObjectId(productId),
          comment_left: { $gt: rightValue },
        },
        { $inc: { comment_left: 2 } }
      );
    } else {
      const maxRightValue = await Comment.findOne(
        { comment_productId: convertToObjectId(productId) },
        'comment_right',
        { sort: { comment_right: -1 } }
      );
      if (maxRightValue) {
        rightValue = maxRightValue.comment_right + 1;
      } else {
        rightValue = 1;
      }
    }

    // insert comment
    comment.comment_left = rightValue;
    comment.comment_right = rightValue + 1;

    await comment.save();
    return comment;
  }

  static async getCommentsByParentId({ productId, parentCommentId = null, limit = 50, offset = 0 }) {
    let comments = null;
    const select = {
      comment_left: 1,
      comment_right: 1,
      comment_content: 1,
      comment_parentId: 1,
    };
    const sort = { comment_left: 1 };

    const findComments = async (query) => {
      return await Comment.find(query).select(select).sort(sort);
    };

    if (parentCommentId) {
      const parent = await Comment.findById(parentCommentId);
      if (!parent) throw new NotFoundError(`Not found comment for product!`);

      const query = {
        comment_productId: convertToObjectId(productId),
        comment_left: { $gt: parent.comment_left },
        comment_right: { $lte: parent.comment_right },
      };
      comments = await findComments(query);
    } else {
      const query = {
        comment_productId: convertToObjectId(productId),
        comment_parentId: null,
      };
      comments = await findComments(query);
    }

    return comments;
  }
}

module.exports = CommentService;
