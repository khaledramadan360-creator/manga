'use strict';

const { z } = require('zod');

const CURRENT_YEAR = new Date().getFullYear();

// Schema لإضافة مانجا جديدة (كلها ترسل كـ multipart/form-data)
const createMangaSchema = z.object({
  title:            z.string().min(1, 'العنوان مطلوب').max(255),
  title_alt:        z.string().max(255).or(z.literal('')).nullable().optional(),
  description:      z.string().or(z.literal('')).nullable().optional(),
  // ─── SEO ──────────────────────────────────────────────────────────────────
  meta_title:       z.string().max(255).or(z.literal('')).nullable().optional(),
  meta_description: z.string().max(500).or(z.literal('')).nullable().optional(),
  // ──────────────────────────────────────────────────────────────────────────
  status:       z.enum(['ongoing', 'completed', 'hiatus', 'cancelled']).optional().default('ongoing'),
  type:         z.enum(['manga', 'manhwa', 'manhua']).optional().default('manga'),
  author:       z.string().max(100).or(z.literal('')).nullable().optional(),
  artist:       z.string().max(100).or(z.literal('')).nullable().optional(),
  release_year: z.preprocess(
    (val) => (val === '' || val === null || val === undefined ? undefined : val),
    z.coerce.number().int().min(1900).max(CURRENT_YEAR + 1).optional()
  ),
  genres:       z.string().or(z.literal('')).nullable().optional(),  // "1,2,3" — معرفات الجونرات مفصولة بفاصلة
});

// Schema لتعديل مانجا — كل الحقول اختيارية
const updateMangaSchema = createMangaSchema.partial().omit({ genres: true }).extend({
  genres: z.string().optional(),
});

// Schema للـ query params في قايمة الأدمن
const adminMangaListSchema = z.object({
  search: z.string().optional(),
  status: z.enum(['ongoing', 'completed', 'hiatus', 'cancelled']).optional(),
  type:   z.enum(['manga', 'manhwa', 'manhua']).optional(),
  sort:   z.enum(['latest', 'oldest', 'popular', 'a-z']).optional().default('latest'),
  page:   z.coerce.number().int().min(1).optional().default(1),
  limit:  z.coerce.number().int().min(1).max(100).optional().default(20),
});

module.exports = { createMangaSchema, updateMangaSchema, adminMangaListSchema };
