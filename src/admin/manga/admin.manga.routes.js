'use strict';

const { Router } = require('express');
const controller = require('./admin.manga.controller');
const validate   = require('../../core/middleware/validate.middleware');
const { uploadSingle } = require('../../core/middleware/upload.middleware');
const { createMangaSchema, updateMangaSchema, adminMangaListSchema } = require('./admin.manga.schema');

const router = Router();

// GET    /api/admin/manga — قايمة المانجا مع بيانات إدارية
router.get('/', validate(adminMangaListSchema, 'query'), controller.getAll);

// POST   /api/admin/manga — إضافة مانجا + رفع غلاف
router.post('/', uploadSingle('cover'), validate(createMangaSchema), controller.create);

// GET    /api/admin/manga/:id — جلب بيانات مانجا واحدة (للعرض في لوحة التحكم)
router.get('/:id', controller.getById);

// PUT    /api/admin/manga/:id — تعديل بيانات مانجا
router.put('/:id', validate(updateMangaSchema), controller.update);

// PATCH  /api/admin/manga/:id/cover — تحديث الغلاف فقط
router.patch('/:id/cover', uploadSingle('cover'), controller.updateCover);

// DELETE /api/admin/manga/:id — حذف مانجا + صورها
router.delete('/:id', controller.remove);

module.exports = router;
