'use strict';

class ApiError extends Error {
  /**
   * @param {string} message
   * @param {number} statusCode
   * @param {Array} errors
   */
  constructor(message, statusCode = 500, errors = []) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message, errors = []) {
    return new ApiError(message, 400, errors);
  }

  static unauthorized(message = 'غير مصرح') {
    return new ApiError(message, 401);
  }

  static forbidden(message = 'ممنوع') {
    return new ApiError(message, 403);
  }

  static notFound(message = 'غير موجود') {
    return new ApiError(message, 404);
  }

  static conflict(message) {
    return new ApiError(message, 409);
  }

  static internal(message = 'خطأ في السيرفر') {
    return new ApiError(message, 500);
  }
}

module.exports = ApiError;
