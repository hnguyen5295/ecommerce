'use strict';

const Comment = require('../models/comment.model');
const { convertToObjectId } = require('../utils/index');
const { NotFoundError } = require('../core/error.response');
const { findProduct } = require('../models/repositories/product.repo');

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

  static async deleteComment({ commentId, productId }) {
    // check the product exists in the database
    const foundProduct = await findProduct({ product_id: productId });
    if (!foundProduct) throw new NotFoundError(`Product not found!`);

    // 1. Identify the left and right comments
    const comment = await Comment.findById(commentId);
    if (!comment) throw new NotFoundError(`Comment not found!`);

    const leftValue = comment.comment_left;
    const rightValue = comment.comment_right;
    // 2. Calculate the width
    const width = rightValue - leftValue + 1;
    // 3. Delete all children comments
    await Comment.deleteMany({
      comment_productId: convertToObjectId(productId),
      comment_left: { $gte: leftValue, $lte: rightValue },
    });
    // 4. Update all remaining left and right comments (> rightValue)
    await Comment.updateMany(
      {
        comment_productId: convertToObjectId(productId),
        comment_right: { $gt: rightValue },
      },
      {
        comment_right: { $inc: -width },
      }
    );

    await Comment.updateMany(
      {
        comment_productId: convertToObjectId(productId),
        comment_left: { $gt: rightValue },
      },
      {
        comment_left: { $inc: -width },
      }
    );

    return true;
  }
}

module.exports = CommentService;
