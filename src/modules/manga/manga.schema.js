'use strict';

const { z } = require('zod');

const mangaQuerySchema = z.object({
  search: z.string().optional(),
  genre:  z.string().optional(),          // "action,fantasy"
  status: z.enum(['ongoing', 'completed', 'hiatus', 'cancelled']).optional(),
  type:   z.enum(['manga', 'manhwa', 'manhua']).optional(),
  sort:   z.enum(['latest', 'popular', 'a-z']).optional().default('latest'),
  page:   z.coerce.number().int().min(1).optional().default(1),
  limit:  z.coerce.number().int().min(1).max(100).optional().default(20),
});

module.exports = { mangaQuerySchema };
