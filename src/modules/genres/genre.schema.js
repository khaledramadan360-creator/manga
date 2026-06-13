'use strict';

const { z } = require('zod');

// Schema للـ GET /api/genres/:id/manga — query params
const genreMangaQuerySchema = z.object({
  sort:  z.enum(['latest', 'popular', 'a-z']).optional().default('latest'),
  page:  z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});

module.exports = { genreMangaQuerySchema };
