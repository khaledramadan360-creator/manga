'use strict';

const { Comment }  = require('../../models/index');
const ApiResponse  = require('../../core/utils/ApiResponse');
const ApiError     = require('../../core/utils/ApiError');

/**
 * DELETE /api/admin/comments/:id
 * حذف تعليق مسيء (Hard Delete)
 */
const remove = async (req, res, next) => {
  try {
    const comment = await Comment.findByPk(req.params.id);
    if (!comment) return next(ApiError.notFound('التعليق مش موجود'));

    await comment.destroy();
    ApiResponse.noContent(res);
  } catch (err) { next(err); }
};

module.exports = { remove };
