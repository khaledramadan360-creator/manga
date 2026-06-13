'use strict';

const { Router }                 = require('express');
const controller                 = require('./chapter.controller');
const validate                   = require('../../core/middleware/validate.middleware');
const { chapterListQuerySchema } = require('./chapter.schema');

const router = Router();

// GET /api/chapters/manga/:mangaSlug — فصول مانجا معينة بالـ slug مع pagination وترتيب
router.get('/manga/:mangaSlug', validate(chapterListQuerySchema, 'query'), controller.getChaptersByManga);

// GET /api/chapters/:mangaSlug/:chapterNumber — تفاصيل فصل معين بالـ slug ورقم الفصل
// مثال: GET /api/chapters/one-piece/1  أو  /api/chapters/look-back/1.5
router.get('/:mangaSlug/:chapterNumber', controller.getChapterBySlugAndNumber);

module.exports = router;
