'use strict';

const ApiError = require('../utils/ApiError');

/**
 * Zod validation middleware
 * الاستخدام: router.post('/', validate(myZodSchema), controller)
 * @param {import('zod').ZodSchema} schema
 * @param {'body'|'query'|'params'} source
 */
const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      const errors = result.error.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      }));
      return next(ApiError.badRequest('بيانات غير صحيحة', errors));
    }

    // بنستبدل الـ data بالنسخة الـ parsed (نظيفة ومتحققة)
    if (source === 'query') {
      Object.defineProperty(req, 'query', {
        value: result.data,
        writable: true,
        configurable: true,
        enumerable: true
      });
    } else {
      req[source] = result.data;
    }
    next();
  };
};

module.exports = validate;
