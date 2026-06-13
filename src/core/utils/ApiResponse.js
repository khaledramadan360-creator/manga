'use strict';

class ApiResponse {
  /**
   * @param {import('express').Response} res
   * @param {number} statusCode
   * @param {string} message
   * @param {*} data
   * @param {object|null} pagination
   */
  static send(res, statusCode, message, data = null, pagination = null) {
    const body = {
      success: statusCode < 400,
      message,
    };

    if (data !== null) body.data = data;
    if (pagination !== null) body.pagination = pagination;

    return res.status(statusCode).json(body);
  }

  static ok(res, message, data = null, pagination = null) {
    return ApiResponse.send(res, 200, message, data, pagination);
  }

  static created(res, message, data = null) {
    return ApiResponse.send(res, 201, message, data);
  }

  static noContent(res) {
    return res.status(204).send();
  }
}

module.exports = ApiResponse;
