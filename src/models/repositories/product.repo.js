'use strict';

const { product, clothing, electronic, furniture } = require('../product.model');
const { Types } = require('mongoose');

const findAllDraftsForShop = async ({ query, limit, skip }) => {
  return await queryProduct({ query, limit, skip });
};

const findAllPublishForShop = async ({ query, limit, skip }) => {
  return await queryProduct({ query, limit, skip });
};

const searchProductByUser = async ({ searchKey }) => {
  // https://anonystick.com/blog-developer/full-text-search-mongodb-chi-mot-bai-viet-khong-can-nhieu-2022012063033379
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

module.exports = {
  findAllDraftsForShop,
  searchProductByUser,
  publishProductByShop,
  findAllPublishForShop,
  unPublishProductByShop,
};
