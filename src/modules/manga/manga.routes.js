'use strict';

const { Router }          = require('express');
const controller          = require('./manga.controller');
const validate            = require('../../core/middleware/validate.middleware');
const { mangaQuerySchema } = require('./manga.schema');

const router = Router();

// GET /api/manga
router.get('/', validate(mangaQuerySchema, 'query'), controller.getAll);

// GET /api/manga/latest  — لازم تيجي قبل /:id
router.get('/latest',  controller.getLatest);

// GET /api/manga/popular
router.get('/popular', controller.getPopular);

// GET /api/manga/:slug
router.get('/:slug', controller.getBySlug);

module.exports = router;
