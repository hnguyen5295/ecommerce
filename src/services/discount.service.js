'use strict';

const { BadRequestError, NotFoundError } = require('../core/error.response');
const discount = require('../models/discount.model');
const { convertToObjectId } = require('../utils');
const { findAllProducts } = require('../models/repositories/product.repo');
const {
  findAllDiscountCodesSelect,
  findAllDiscountCodesUnSelect,
  checkDiscountExists,
} = require('../models/repositories/discount.repo');

/*
  Discount Service
  1 - Generate discount code [Shop | Admin]
  2 - Get discount amount [User]
  3 - Get all discount codes [Shop | User]
  4 - Verify discount code [User]
  5 - Delete discount code [Shop | Admin]
  6 - Cancel discount code [User]
*/

class DiscountService {
  static async createDiscountCode(payload) {
    const {
      value,
      code,
      start_date,
      end_date,
      is_active,
      shopId,
      min_order_value,
      product_ids,
      applies_to,
      name,
      description,
      type,
      max_value,
      max_uses,
      used_count,
      max_uses_per_user,
      users_used,
    } = payload;

    if (new Date(start_date) >= new Date(end_date)) {
      throw new BadRequestError('Start date must be before end date');
    }

    const foundDiscount = await discount
      .findOne({
        discount_code: code,
        discount_shopId: convertToObjectId(shopId),
      })
      .lean();
    if (foundDiscount && foundDiscount.discount_is_active) {
      throw new BadRequestError('Discount exists!');
    }

    return await discount.create({
      discount_name: name,
      discount_description: description,
      discount_type: type,
      discount_value: value, // missing
      discount_max_value: max_value,
      discount_code: code,
      discount_start_date: new Date(start_date),
      discount_end_date: new Date(end_date),
      discount_max_uses: max_uses,
      discount_used_count: used_count,
      discount_users_used: users_used,
      discount_max_uses_per_user: max_uses_per_user,
      discount_min_order_value: min_order_value || 0,
      discount_shopId: shopId,
      discount_is_active: is_active,
      discount_applies_to: applies_to,
      discount_product_ids: applies_to === 'all' ? [] : product_ids,
    });
  }

  static async getAllDiscountCodesWithProduct({ code, shopId, userId, limit, page }) {
    const foundDiscount = await discount
      .findOne({
        discount_code: code,
        discount_shopId: convertToObjectId(shopId),
      })
      .lean();
    if (!foundDiscount || !foundDiscount.discount_is_active) {
      throw new BadRequestError('Discount not exists!');
    }

    const { discount_applies_to, discount_product_ids } = foundDiscount;
    const filter = {
      isPublished: true,
    };

    if (discount_applies_to === 'all') {
      filter['product_shop'] = convertToObjectId(shopId);
    }

    if (discount_applies_to === 'specific') {
      filter['_id'] = { $in: discount_product_ids };
    }

    return await findAllProducts({
      filter,
      limit: +limit,
      page: +page,
      sort: 'ctime',
      select: ['product_name'],
    });
  }

  static async getAllDiscountCodesByShop({ limit, page, shopId }) {
    return await findAllDiscountCodesSelect({
      limit: +limit,
      page: +page,
      filter: {
        discount_shopId: convertToObjectId(shopId),
        discount_is_active: true,
      },
      select: ['discount_code', 'discount_name'],
      model: discount,
    });
  }

  static async getDiscountAmount({ codeId, userId, shopId, products }) {
    const foundDiscount = await checkDiscountExists({
      model: discount,
      filter: {
        discount_code: codeId,
        discount_shopId: convertToObjectId(shopId),
      },
    });
    if (!foundDiscount) throw new NotFoundError(`Discount doesn't exits!`);

    const {
      discount_is_active,
      discount_max_uses,
      discount_min_order_value,
      discount_max_uses_per_user,
      discount_users_used,
      discount_type,
      discount_value,
      discount_end_date,
    } = foundDiscount;
    if (!discount_is_active) throw new NotFoundError(`Discount expired!`);
    if (!discount_max_uses) throw new NotFoundError(`Discount are out!`);

    if (new Date() > new Date(discount_end_date)) {
      throw new NotFoundError(`Discount code has expired!`);
    }

    // Is totalOrder value meet the discount_min_order_value?
    let totalOrder = 0;
    if (discount_min_order_value > 0) {
      // get total
      totalOrder = products.reduce((acc, product) => {
        return acc + product.quantity * product.price;
      }, 0);

      if (totalOrder < discount_min_order_value)
        throw new NotFoundError(`Discount requires a minimum order value of ${discount_min_order_value}!`);
    }

    if (discount_max_uses_per_user > 0) {
      const usedDiscountPerUser = discount_users_used.find((user) => user.userId === userId);
      if (usedDiscountPerUser) {
        if (usedDiscountPerUser === discount_max_uses_per_user) {
          throw new NotFoundError(`Discount are out!`);
        }
      }
    }

    // check type of discount: fixed_amout / specific / percentage
    const amount = discount_type === 'fixed_amout' ? discount_value : totalOrder * (discount_value / 100);

    return {
      totalOrder,
      discount: amount,
      totalPrice: totalOrder - amount,
    };
  }

  static async deleteDiscountCode({ shopId, codeId }) {
    // Should store deleted discount_code into another Collection, ex: DiscountHistory
    return await discount.findOneAndDelete({
      discount_code: codeId,
      discount_shopId: convertToObjectId(shopId),
    });
  }

  static async cancelDiscountCode({ shopId, codeId, userId }) {
    const foundDiscount = checkDiscountExists({
      model: discount,
      filter: {
        discount_code: codeId,
        discount_shopId: convertToObjectId(shopId),
      },
    });

    if (!foundDiscount) throw new NotFoundError(`Discount doesn't exist!`);

    const result = await discount.findByIdAndUpdate(foundDiscount._id, {
      $pull: {
        discount_users_used: userId,
      },
      $inc: {
        discount_max_uses: 1,
        discount_used_count: -1,
      },
    });
  }
}

module.exports = DiscountService;
