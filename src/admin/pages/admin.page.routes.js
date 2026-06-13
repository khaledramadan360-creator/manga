'use strict';

const { Router } = require('express');
const controller = require('./admin.page.controller');
const { uploadBulk } = require('../../core/middleware/upload.middleware');

const router = Router();

// POST   /api/admin/pages/chapter/:chapterId/bulk — رفع صفحات
router.post('/chapter/:chapterId/bulk', uploadBulk('pages', 300), controller.bulkUpload);

// DELETE /api/admin/pages/:id — حذف صفحة واحدة
router.delete('/:id', controller.remove);

module.exports = router;
