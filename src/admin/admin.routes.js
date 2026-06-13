'use strict';

const { Router } = require('express');
const statsController = require('./stats/admin.stats.controller');

const router = Router();

// ─── Stats ─────────────────────────────────────────────────────────────────
// GET /api/admin/stats
router.get('/stats', statsController.getStats);

// ─── Sub-modules ───────────────────────────────────────────────────────────
router.use('/genres',   require('./genres/admin.genre.routes'));
router.use('/manga',    require('./manga/admin.manga.routes'));
router.use('/chapters', require('./chapters/admin.chapter.routes'));
router.use('/pages',    require('./pages/admin.page.routes'));
router.use('/comments', require('./comments/admin.comment.routes'));

module.exports = router;
