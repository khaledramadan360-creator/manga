'use strict';

const { Router } = require('express');
const controller = require('./admin.genre.controller');
const validate   = require('../../core/middleware/validate.middleware');
const { createGenreSchema, updateGenreSchema } = require('./admin.genre.schema');

const router = Router();

// POST   /api/admin/genres
router.post('/',    validate(createGenreSchema), controller.create);

// PUT    /api/admin/genres/:id
router.put('/:id',  validate(updateGenreSchema), controller.update);

// DELETE /api/admin/genres/:id
router.delete('/:id', controller.remove);

module.exports = router;
