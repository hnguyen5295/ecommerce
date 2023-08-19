'use strict';

const { product } = require('../product.model');
const { Types } = require('mongoose');
const { getSelectData, unGetSelectData } = require('../../utils/index');

const findAllDraftsForShop = async ({ query, limit, skip }) => {
  return await queryProduct({ query, limit, skip });
};

const findAllPublishForShop = async ({ query, limit, skip }) => {
  return await queryProduct({ query, limit, skip });
};

const searchProductByUser = async ({ searchKey }) => {
  const searchKeyRegex = new RegExp(searchKey);
  const result = await product
    .find(
      {
        isPublished: true,
        $text: { $search: searchKeyRegex },
      },
      { score: { $meta: 'textScore' } }
    )
    .sort({ score: { $meta: 'textScore' } })
    .lean();

  return result;
};

const publishProductByShop = async ({ product_shop, product_id }) => {
  return await updateProduct({ product_shop, product_id, isDraft: false, isPublished: true });
};

const unPublishProductByShop = async ({ product_shop, product_id }) => {
  return await updateProduct({ product_shop, product_id, isDraft: true, isPublished: false });
};

const updateProductById = async ({ productId, payload, model, isNew = true }) => {
  return await model.findByIdAndUpdate(productId, payload, {
    new: isNew,
  });
};

const updateProduct = async ({ product_shop, product_id, isDraft, isPublished }) => {
  const shop = product.findOne({
    product: new Types.ObjectId(product_shop),
    _id: new Types.ObjectId(product_id),
  });
  if (!shop) return null;

  const { modifiedCount } = await product.updateOne({ _id: product_id }, { isDraft, isPublished });

  return modifiedCount;
};

const queryProduct = async ({ query, limit, skip }) => {
  return await product
    .find(query)
    .populate('product_shop', 'name email -_id')
    .sort({ updatedAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean()
    .exec();
};

const findAllProducts = async ({ limit, sort, page, filter, select }) => {
  const skip = (page - 1) * limit;
  const sortBy = sort === 'ctime' ? { _id: -1 } : { id: 1 };
  return await product.find(filter).sort(sortBy).skip(skip).limit(limit).select(getSelectData(select)).lean();
};

const findProduct = async ({ product_id, unSelect }) => {
  return await product.findById(product_id).select(unGetSelectData(unSelect));
};

module.exports = {
  findAllDraftsForShop,
  searchProductByUser,
  publishProductByShop,
  findAllPublishForShop,
  unPublishProductByShop,
  findAllProducts,
  findProduct,
  updateProductById,
};
