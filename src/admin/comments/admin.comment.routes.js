'use strict';

const { Router } = require('express');
const controller = require('./admin.comment.controller');

const router = Router();

// DELETE /api/admin/comments/:id — حذف تعليق
router.delete('/:id', controller.remove);

module.exports = router;
