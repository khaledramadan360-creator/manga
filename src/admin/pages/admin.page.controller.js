'use strict';

const { Chapter, Page } = require('../../models/index');
const storage     = require('../../core/services/storage.service');
const ApiResponse = require('../../core/utils/ApiResponse');
const ApiError    = require('../../core/utils/ApiError');

/**
 * POST /api/admin/pages/chapter/:chapterId/bulk
 * رفع صفحات الفصل دفعة واحدة (multipart/form-data)
 * الصور ترفع بنفس ترتيبها في الـ form
 */
const bulkUpload = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return next(ApiError.badRequest('لازم ترفع صورة واحدة على الأقل'));
    }

    const chapter = await Chapter.findByPk(req.params.chapterId, {
      attributes: ['id', 'manga_id'],
    });
    if (!chapter) return next(ApiError.notFound('الفصل مش موجود'));

    // تحديد رقم الصفحة اللي هنبدأ منها (بعد آخر صفحة موجودة)
    const lastPage = await Page.findOne({
      where: { chapter_id: chapter.id },
      order: [['page_number', 'DESC']],
      attributes: ['page_number'],
    });
    const startFrom = lastPage ? lastPage.page_number + 1 : 1;

    // رفع الصور على التخزين
    const uploaded = await storage.uploadBulkPages(
      req.files,
      chapter.manga_id,
      chapter.id,
      startFrom,
    );

    // حفظ الصفحات في DB
    const pages = await Page.bulkCreate(
      uploaded.map(({ url, key, page_number }) => ({
        chapter_id: chapter.id,
        page_number,
        image_url: url,
        image_key: key,
      })),
    );

    ApiResponse.created(res, `تم رفع ${pages.length} صفحة بنجاح`, pages);
  } catch (err) { next(err); }
};

/**
 * DELETE /api/admin/pages/:id
 * حذف صفحة واحدة + مسح ملفها من التخزين
 */
const remove = async (req, res, next) => {
  try {
    const page = await Page.findByPk(req.params.id, {
      attributes: ['id', 'image_key'],
    });
    if (!page) return next(ApiError.notFound('الصفحة مش موجودة'));

    // حذف الملف من التخزين
    await storage.deleteFile(page.image_key);

    // حذف الصفحة من DB
    await page.destroy();

    ApiResponse.noContent(res);
  } catch (err) { next(err); }
};

module.exports = { bulkUpload, remove };
