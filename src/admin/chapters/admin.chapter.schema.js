'use strict';

const { z } = require('zod');

const createChapterSchema = z.object({
  chapter_number:   z.coerce.number().positive('رقم الفصل لازم يكون أكبر من 0'),
  title:            z.string().max(255).or(z.literal('')).nullable().optional(),
  // ─── SEO ────────────────────────────────────────────────────────────────
  meta_title:       z.string().max(255).or(z.literal('')).nullable().optional(),
  meta_description: z.string().max(500).or(z.literal('')).nullable().optional(),
});

const updateChapterSchema = createChapterSchema.partial();

module.exports = { createChapterSchema, updateChapterSchema };
