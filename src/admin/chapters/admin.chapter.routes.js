'use strict';

const { Router } = require('express');
const controller = require('./admin.chapter.controller');
const validate   = require('../../core/middleware/validate.middleware');
const { createChapterSchema, updateChapterSchema } = require('./admin.chapter.schema');

const router = Router();

// POST   /api/admin/chapters/manga/:mangaId — إضافة فصل
router.post('/manga/:mangaId', validate(createChapterSchema), controller.create);

// PUT    /api/admin/chapters/:id — تعديل فصل
router.put('/:id', validate(updateChapterSchema), controller.update);

// DELETE /api/admin/chapters/:id — حذف فصل + صوره
router.delete('/:id', controller.remove);

module.exports = router;
