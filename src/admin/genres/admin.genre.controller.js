'use strict';

const { Genre, Manga } = require('../../models/index');
const ApiResponse      = require('../../core/utils/ApiResponse');
const ApiError         = require('../../core/utils/ApiError');

// ─── Helper: توليد slug من الاسم ─────────────────────────────────────────────
const toSlug = (name) =>
  name.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

/**
 * POST /api/admin/genres
 * إضافة جونر جديد
 */
const create = async (req, res, next) => {
  try {
    const { name } = req.body;
    const slug = toSlug(name);

    const genre = await Genre.create({ name, slug });
    ApiResponse.created(res, 'تم إضافة الجونر بنجاح', genre);
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      return next(ApiError.conflict('الجونر ده موجود بالفعل'));
    }
    next(err);
  }
};

/**
 * PUT /api/admin/genres/:id
 * تعديل اسم جونر
 */
const update = async (req, res, next) => {
  try {
    const genre = await Genre.findByPk(req.params.id);
    if (!genre) return next(ApiError.notFound('الجونر مش موجود'));

    const { name } = req.body;
    await genre.update({ name, slug: toSlug(name) });
    ApiResponse.ok(res, 'تم تعديل الجونر بنجاح', genre);
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      return next(ApiError.conflict('الاسم ده موجود بالفعل'));
    }
    next(err);
  }
};

/**
 * DELETE /api/admin/genres/:id
 * حذف جونر
 */
const remove = async (req, res, next) => {
  try {
    const genre = await Genre.findByPk(req.params.id);
    if (!genre) return next(ApiError.notFound('الجونر مش موجود'));

    await genre.destroy();
    ApiResponse.noContent(res);
  } catch (err) { next(err); }
};

module.exports = { create, update, remove };
