'use strict';

const ApiError = require('../utils/ApiError');
const env = require('../config/env');

/**
 * يتحقق من X-Admin-Key header
 * بيتركب على /api/admin router بس
 */
const adminKeyMiddleware = (req, res, next) => {
  const key = req.headers['x-admin-key'];

  if (!key) {
    return next(ApiError.unauthorized('مفيش Admin Key في الـ Header'));
  }

  if (key !== env.admin.apiKey) {
    return next(ApiError.unauthorized('Admin Key غلط'));
  }

  next();
};

module.exports = adminKeyMiddleware;
