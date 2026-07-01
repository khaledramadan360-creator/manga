'use strict';

const chapterService = require('./chapter.service');
const ApiResponse    = require('../../core/utils/ApiResponse');

/**
 * GET /api/chapters/manga/:mangaSlug
 * فصول مانجا معينة بالـ slug مع pagination وترتيب
 */
const getChaptersByManga = async (req, res, next) => {
  try {
    const { manga, data, meta } = await chapterService.getChaptersByManga(
      req.params.mangaSlug,
      req.query,
    );
    ApiResponse.ok(res, `فصول مانجا "${manga.title}"`, data, meta);
  } catch (err) { next(err); }
};

/**
 * GET /api/chapters/:mangaSlug/:chapterNumber
 * تفاصيل الفصل وصفحاته مع أرقام الفصول المجاورة (prev/next)
 *
 * Query: ?session_id=abc123  (اختياري — لتتبع المشاهدات)
 * مثال: GET /api/chapters/one-piece/1?session_id=xyz
 */
const getChapterBySlugAndNumber = async (req, res, next) => {
  try {
    const sessionId     = req.query.session_id || undefined;
    const chapterNumber = parseFloat(req.params.chapterNumber);

    if (isNaN(chapterNumber)) {
      return res.status(400).json({ success: false, message: 'رقم الفصل غير صحيح' });
    }

    const { chapter, prev_chapter_number, next_chapter_number } =
      await chapterService.getChapterBySlugAndNumber(
        req.params.mangaSlug,
        chapterNumber,
        sessionId,
      );

    const data = {
      ...(typeof chapter.toJSON === 'function' ? chapter.toJSON() : chapter),
      prev_chapter_number,
      next_chapter_number,
    };

    ApiResponse.ok(res, `تفاصيل الفصل رقم ${chapter.chapter_number}`, data);
  } catch (err) { next(err); }
};

/**
 * GET /api/chapters/:id
 * تفاصيل الفصل وصفحاته بالـ ID (UUID)
 *
 * Query: ?session_id=abc123  (اختياري — لتتبع المشاهدات)
 */
const getChapterById = async (req, res, next) => {
  try {
    const sessionId = req.query.session_id || undefined;
    const { chapter, prev_chapter_number, next_chapter_number } =
      await chapterService.getChapterById(req.params.id, sessionId);

    const data = {
      ...(typeof chapter.toJSON === 'function' ? chapter.toJSON() : chapter),
      prev_chapter_number,
      next_chapter_number,
    };

    ApiResponse.ok(res, `تفاصيل الفصل رقم ${chapter.chapter_number}`, data);
  } catch (err) { next(err); }
};

module.exports = { getChaptersByManga, getChapterBySlugAndNumber, getChapterById };
