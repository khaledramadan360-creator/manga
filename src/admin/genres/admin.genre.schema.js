'use strict';

const { z } = require('zod');

const createGenreSchema = z.object({
  name: z.string().min(1, 'اسم الجونر مطلوب').max(50, 'الاسم طويل جداً'),
});

const updateGenreSchema = createGenreSchema;

module.exports = { createGenreSchema, updateGenreSchema };
