'use strict';

const HEADER = {
  API_KEY: 'x-api-key',
  AUTHORIZATION: 'authorization',
  CLIENT_ID: 'x-client-id',
  REFRESH_TOKEN: 'x-rtoken-id',
};

const { findById } = require('../services/apiKey.service');

const apiKey = async (req, res, next) => {
  try {
    const key = req.headers[HEADER.API_KEY]?.toString();

    if (!key) {
      return res.status(403).json({
        message: 'Forbidden Error',
      });
    }

    // check objKey
    const objKey = await findById(key);
    if (!objKey) {
      return res.status(403).json({
        message: 'Forbidden Error',
      });
    }

    req.objKey = objKey;
    return next();
  } catch (error) {
    return error;
  }
};

const permission = (permission) => {
  return (req, res, next) => {
    if (!req.objKey.permissions) {
      return res.status(403).json({
        message: 'Permission denied',
      });
    }

    console.log('permissions::', req.objKey.permissions);
    const validPermission = req.objKey.permissions.includes(permission);
    if (!validPermission) {
      return res.status(403).json({
        message: 'Permission denied',
      });
    }

    return next();
  };
};

module.exports = {
  HEADER,
  apiKey,
  permission,
};
