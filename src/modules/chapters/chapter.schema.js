'use strict';

const { z } = require('zod');

// Schema للـ GET /api/chapters/manga/:mangaId — query params
const chapterListQuerySchema = z.object({
  sort:  z.enum(['asc', 'desc']).optional().default('desc'),
  page:  z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(250).optional().default(100),
});

module.exports = { chapterListQuerySchema };
