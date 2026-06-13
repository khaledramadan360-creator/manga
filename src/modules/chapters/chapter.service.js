'use strict';

const { Op }                     = require('sequelize');
const { Chapter, Page, Manga }   = require('../../models/index');
const paginate                   = require('../../core/utils/pagination');
const ApiError                   = require('../../core/utils/ApiError');
const { shouldCount }            = require('../../core/utils/viewTracker');

/**
 * جلب فصول مانجا معينة بالـ slug مع pagination وترتيب
 */
const getChaptersByManga = async (mangaSlug, query) => {
  // البحث عن المانجا بالـ slug
  const manga = await Manga.findOne({
    where: { slug: mangaSlug },
    attributes: ['id', 'slug', 'title'],
  });
  if (!manga) throw ApiError.notFound('المانجا دي مش موجودة');

  const { sort, page, limit } = query;

  // تحديد الترتيب
  const order = [['chapter_number', sort.toUpperCase()]];

  // العد الكلي للفصول
  const total = await Chapter.count({ where: { manga_id: manga.id } });
  const { limit: lim, offset, meta } = paginate({ page, limit }, total);

  const rows = await Chapter.findAll({
    where:  { manga_id: manga.id },
    order,
    limit:  lim,
    offset,
    attributes: ['id', 'chapter_number', 'title', 'views', 'created_at'],
  });

  return { manga, data: rows, meta };
};

/**
 * جلب تفاصيل فصل معين + صفحاته + رقم الفصل السابق والتالي
 *
 * @param {string}           mangaSlug     — slug المانجا
 * @param {number}           chapterNumber — رقم الفصل (مثل 1 أو 1.5)
 * @param {string|undefined} sessionId     — الـ device/session ID من الفرونت (اختياري)
 */
const getChapterBySlugAndNumber = async (mangaSlug, chapterNumber, sessionId) => {
  // نجيب المانجا بالـ slug أولاً
  const manga = await Manga.findOne({
    where: { slug: mangaSlug },
    attributes: ['id', 'slug', 'title', 'cover_url'],
  });
  if (!manga) throw ApiError.notFound('المانجا دي مش موجودة');

  // نجيب الفصل برقمه ومانجاه
  const chapter = await Chapter.findOne({
    where: {
      manga_id:       manga.id,
      chapter_number: chapterNumber,
    },
    include: [
      {
        model:      Page,
        as:         'pages',
        attributes: ['id', 'page_number', 'image_url'],
      },
      {
        model:      Manga,
        as:         'manga',
        attributes: ['id', 'slug', 'title', 'cover_url'],
      },
    ],
  });
  if (!chapter) throw ApiError.notFound(`الفصل رقم ${chapterNumber} مش موجود`);

  // ترتيب الصفحات تصاعدياً
  if (chapter.pages) {
    chapter.pages.sort((a, b) => a.page_number - b.page_number);
  }

  // ─── عد المشاهدات بالـ Session Tracking ────────────────────────────────────
  // بنعد بس لو نفس الجهاز مشافش الفصل ده في آخر 24 ساعة
  if (shouldCount(sessionId, chapter.id)) {
    await chapter.increment('views');
  }

  // ─── جلب رقم الفصل السابق والتالي ──────────────────────────────────────────
  // بنرجع الأرقام بدل الـ UUIDs عشان الفرونت يبني المسار بنفسه
  const prevChapter = await Chapter.findOne({
    where: {
      manga_id:       manga.id,
      chapter_number: { [Op.lt]: chapterNumber },
    },
    order:      [['chapter_number', 'DESC']],
    attributes: ['chapter_number'],
  });

  const nextChapter = await Chapter.findOne({
    where: {
      manga_id:       manga.id,
      chapter_number: { [Op.gt]: chapterNumber },
    },
    order:      [['chapter_number', 'ASC']],
    attributes: ['chapter_number'],
  });

  return {
    chapter,
    prev_chapter_number: prevChapter?.chapter_number ?? null,
    next_chapter_number: nextChapter?.chapter_number ?? null,
  };
};

module.exports = { getChaptersByManga, getChapterBySlugAndNumber };
