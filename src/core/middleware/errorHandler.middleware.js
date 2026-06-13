'use strict';

const ApiError = require('../utils/ApiError');
const env      = require('../config/env');

/**
 * Global error handler — آخر middleware في app.js
 * بيمسك كل الأخطاء اللي بتيجي من next(error)
 */
const errorHandler = (err, req, res, next) => {
  // لو الخطأ operational (ApiError) → بنبعت رسالة واضحة
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      ...(err.errors.length > 0 && { errors: err.errors }),
    });
  }

  // Sequelize validation errors
  if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
    const errors = err.errors?.map((e) => ({ field: e.path, message: e.message })) || [];
    return res.status(400).json({
      success: false,
      message: 'خطأ في البيانات',
      errors,
    });
  }

  // Multer errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      message: 'حجم الملف أكبر من المسموح',
    });
  }

  // Unknown errors — مش بنبعت تفاصيل في production
  console.error('💥 Unhandled Error:', err);

  return res.status(500).json({
    success: false,
    message: 'خطأ داخلي في السيرفر',
    ...(env.isDev && { stack: err.stack }),
  });
};

module.exports = errorHandler;
