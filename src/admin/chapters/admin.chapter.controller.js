'use strict';

const { Manga, Chapter, Page } = require('../../models/index');
const storage     = require('../../core/services/storage.service');
const ApiResponse = require('../../core/utils/ApiResponse');
const ApiError    = require('../../core/utils/ApiError');

/**
 * POST /api/admin/chapters/manga/:mangaId
 * إضافة فصل جديد لمانجا معينة
 */
const create = async (req, res, next) => {
  try {
    const { mangaId } = req.params;
    const manga = await Manga.findByPk(mangaId, { attributes: ['id', 'title'] });
    if (!manga) return next(ApiError.notFound('المانجا مش موجودة'));

    const { chapter_number, title, meta_title, meta_description } = req.body;

    const chapter = await Chapter.create({
      manga_id: mangaId,
      chapter_number,
      title,
      meta_title:       meta_title       || null,
      meta_description: meta_description || null,
    });
    ApiResponse.created(res, `تم إضافة الفصل ${chapter_number} بنجاح`, chapter);
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      return next(ApiError.conflict('الفصل ده موجود بالفعل في المانجا دي'));
    }
    next(err);
  }
};

/**
 * PUT /api/admin/chapters/:id
 * تعديل رقم أو عنوان فصل
 */
const update = async (req, res, next) => {
  try {
    const chapter = await Chapter.findByPk(req.params.id);
    if (!chapter) return next(ApiError.notFound('الفصل مش موجود'));

    const { chapter_number, title, meta_title, meta_description } = req.body;

    // بنحدث بس الـ fields اللي اتبعتت
    const updates = {};
    if (chapter_number   !== undefined) updates.chapter_number   = chapter_number;
    if (title            !== undefined) updates.title            = title;
    if (meta_title       !== undefined) updates.meta_title       = meta_title || null;
    if (meta_description !== undefined) updates.meta_description = meta_description || null;

    await chapter.update(updates);
    ApiResponse.ok(res, 'تم تعديل الفصل بنجاح', chapter);
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      return next(ApiError.conflict('رقم الفصل ده موجود بالفعل في المانجا دي'));
    }
    next(err);
  }
};

/**
 * DELETE /api/admin/chapters/:id
 * حذف فصل + مسح صوره من التخزين
 */
const remove = async (req, res, next) => {
  try {
    const chapter = await Chapter.findByPk(req.params.id, {
      attributes: ['id', 'manga_id'],
    });
    if (!chapter) return next(ApiError.notFound('الفصل مش موجود'));

    // حذف مجلد الفصل من التخزين
    await storage.deleteChapterFolder(chapter.manga_id, chapter.id);

    // حذف الفصل من DB (الـ CASCADE بيحذف الصفحات)
    await chapter.destroy();

    ApiResponse.noContent(res);
  } catch (err) { next(err); }
};

module.exports = { create, update, remove };
