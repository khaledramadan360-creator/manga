'use strict';

const { Router }               = require('express');
const controller               = require('./genre.controller');
const validate                 = require('../../core/middleware/validate.middleware');
const { genreMangaQuerySchema } = require('./genre.schema');

const router = Router();

// GET /api/genres — كل الأنواع
router.get('/', controller.getAll);

// GET /api/genres/:id/manga — مانجا جونر معين مع pagination
router.get('/:id/manga', validate(genreMangaQuerySchema, 'query'), controller.getMangaByGenre);

module.exports = router;
