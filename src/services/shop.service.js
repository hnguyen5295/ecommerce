'use strict';

const { shopModel } = require('../models/shop.model');
const { convertToObjectId } = require('../utils/index');

const findByEmail = async ({ email, select = { email: 1, password: 2, name: 1, status: 1, roles: 1 } }) => {
  return await shopModel.findOne({ email }).select(select).lean();
};

const findById = async ({ id, select = { email: 1, password: 2, name: 1, status: 1, roles: 1 } }) => {
  return await shopModel
    .findById({ _id: convertToObjectId(id) })
    .select(select)
    .lean();
};

module.exports = {
  findByEmail,
  findById,
};
