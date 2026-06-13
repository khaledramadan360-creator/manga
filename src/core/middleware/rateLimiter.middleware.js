'use strict';

const rateLimit = require('express-rate-limit');

/**
 * Rate limiter عام لكل الـ API
 * 100 طلب كل 15 دقيقة لكل IP
 */
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'كتير أوي — استنى شوية وحاول تاني',
  },
});

/**
 * Rate limiter صارم للـ write operations (Admin)
 * 30 طلب كل 15 دقيقة
 */
const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'تجاوزت الحد المسموح لعمليات الأدمن',
  },
});

module.exports = { generalLimiter, adminLimiter };
