'use strict';

const { Op }       = require('sequelize');
const { Manga, Genre, Chapter } = require('../../models/index');
const storage      = require('../../core/services/storage.service');
const ApiResponse  = require('../../core/utils/ApiResponse');
const ApiError     = require('../../core/utils/ApiError');
const paginate     = require('../../core/utils/pagination');
const { slugify, uniqueSlug } = require('../../core/utils/slugify');

// ─── Helper: ربط الجونرات بالمانجا ───────────────────────────────────────────
const syncGenres = async (manga, genresStr) => {
  if (genresStr === undefined) return;

  const ids = genresStr
    ? genresStr.split(',').map((s) => parseInt(s.trim(), 10)).filter(Boolean)
    : [];

  const genres = ids.length ? await Genre.findAll({ where: { id: ids } }) : [];
  await manga.setGenres(genres);
};

// ─── Helper: استخرج الـ fields الخاصة بالمانجا من الـ body ───────────────────
const pickMangaFields = (body) => {
  const allowed = [
    'title', 'title_alt', 'description',
    'meta_title', 'meta_description',          // ← SEO fields
    'status', 'type', 'author', 'artist', 'release_year',
  ];
  return Object.fromEntries(
    Object.entries(body).filter(([key]) => allowed.includes(key))
  );
};

// ─── Helper: التحقق من وجود slug مسبقاً (لضمان الفرادة) ─────────────────────
const slugExists = async (slug, excludeId = null) => {
  const where = { slug };
  if (excludeId) where.id = { [Op.ne]: excludeId };
  const count = await Manga.count({ where });
  return count > 0;
};

// ─── Helper: توليد slug فريد للمانجا ──────────────────────────────────────────
const buildSlug = (title, excludeId = null) =>
  uniqueSlug(slugify(title), slugExists, excludeId);

// ─── Controllers ─────────────────────────────────────────────────────────────

/**
 * GET /api/admin/manga/:id
 * جلب بيانات مانجا واحدة بالـ ID للعرض في لوحة التحكم
 */
const isUUID = (str) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);

const getById = async (req, res, next) => {
  try {
    const param = req.params.id;
    const where = isUUID(param) ? { id: param } : { slug: param };

    const manga = await Manga.findOne({
      where,
      include: [
        { model: Genre,   as: 'genres',   attributes: ['id', 'name', 'slug'], through: { attributes: [] } },
        { model: Chapter, as: 'chapters', attributes: ['id', 'chapter_number', 'title', 'views', 'created_at'],
          order: [['chapter_number', 'ASC']] },
      ],
    });
    if (!manga) return next(ApiError.notFound('المانجا مش موجودة'));

    ApiResponse.ok(res, 'تم جلب بيانات المانجا', manga);
  } catch (err) { next(err); }
};

/**
 * GET /api/admin/manga
 * قايمة المانجا بالبيانات الإدارية مع بحث وفلترة وترتيب وصفحات
 */
const getAll = async (req, res, next) => {
  try {
    const { search, status, type, sort, page, limit } = req.query;

    const where = {};
    if (search) {
      where[Op.or] = [
        { title:     { [Op.like]: `%${search}%` } },
        { title_alt: { [Op.like]: `%${search}%` } },
      ];
    }
    if (status) where.status = status;
    if (type)   where.type   = type;

    const orderMap = {
      latest:  [['created_at', 'DESC']],
      oldest:  [['created_at', 'ASC']],
      popular: [['views',      'DESC']],
      'a-z':   [['title',      'ASC']],
    };
    const order = orderMap[sort] || orderMap.latest;

    const total = await Manga.count({ where });
    const { limit: lim, offset, meta } = paginate({ page, limit }, total);

    const rows = await Manga.findAll({
      where,
      order,
      limit: lim,
      offset,
      attributes: { exclude: ['cover_key'] },
      include: [
        { model: Genre,   as: 'genres',   attributes: ['id', 'name', 'slug'], through: { attributes: [] } },
        { model: Chapter, as: 'chapters', attributes: ['id'], required: false },
      ],
    });

    const data = rows.map((m) => ({
      ...m.toJSON(),
      chapters_count: m.chapters?.length ?? 0,
      chapters: undefined,
    }));

    ApiResponse.ok(res, 'قايمة المانجا الإدارية', data, meta);
  } catch (err) { next(err); }
};

/**
 * POST /api/admin/manga
 * إضافة مانجا جديدة مع رفع الغلاف (multipart/form-data)
 */
const create = async (req, res, next) => {
  try {
    const fields = pickMangaFields(req.body);

    // توليد slug فريد من العنوان تلقائياً
    const slug = await buildSlug(fields.title);

    // رفع الغلاف لو موجود
    let coverData = {};
    if (req.file) {
      const manga_temp_id = require('uuid').v4();
      const { url, key } = await storage.uploadCover(req.file.buffer, req.file.mimetype, manga_temp_id);
      coverData = { cover_url: url, cover_key: key };
    }

    const manga = await Manga.create({ ...fields, slug, ...coverData });

    // لو عندنا غلاف اترفع بـ temp_id نحدثه بالـ id الفعلي للمانجا
    if (req.file) {
      const { url, key } = await storage.uploadCover(req.file.buffer, req.file.mimetype, manga.id);
      // احذف الملف المؤقت وحدث الـ record
      await storage.deleteFile(coverData.cover_key);
      await manga.update({ cover_url: url, cover_key: key });
    }

    // ربط الجونرات
    await syncGenres(manga, req.body.genres);

    // جلب المانجا بالجونرات عشان الـ response يكون كامل
    const result = await Manga.findByPk(manga.id, {
      attributes: { exclude: ['cover_key'] },
      include: [{ model: Genre, as: 'genres', attributes: ['id', 'name', 'slug'], through: { attributes: [] } }],
    });

    ApiResponse.created(res, 'تم إضافة المانجا بنجاح', result);
  } catch (err) { next(err); }
};

/**
 * PUT /api/admin/manga/:id
 * تعديل بيانات مانجا (بدون الغلاف)
 */
const update = async (req, res, next) => {
  try {
    const param = req.params.id;
    const where = isUUID(param) ? { id: param } : { slug: param };
    const manga = await Manga.findOne({ where });
    if (!manga) return next(ApiError.notFound('المانجا مش موجودة'));

    const fields = pickMangaFields(req.body);

    // لو العنوان اتغير، ولّد slug جديد فريد باستثناء نفس المانجا
    if (fields.title && fields.title !== manga.title) {
      fields.slug = await buildSlug(fields.title, manga.id);
    }

    await manga.update(fields);

    // تحديث الجونرات لو بعت genres في الـ body
    await syncGenres(manga, req.body.genres);

    const result = await Manga.findByPk(manga.id, {
      attributes: { exclude: ['cover_key'] },
      include: [{ model: Genre, as: 'genres', attributes: ['id', 'name', 'slug'], through: { attributes: [] } }],
    });

    ApiResponse.ok(res, 'تم تعديل المانجا بنجاح', result);
  } catch (err) { next(err); }
};

/**
 * PATCH /api/admin/manga/:id/cover
 * تحديث غلاف المانجا فقط (multipart/form-data)
 */
const updateCover = async (req, res, next) => {
  try {
    if (!req.file) return next(ApiError.badRequest('لازم ترفع صورة الغلاف'));

    const param = req.params.id;
    const where = isUUID(param) ? { id: param } : { slug: param };
    const manga = await Manga.findOne({ where, attributes: ['id', 'cover_key', 'cover_url'] });
    if (!manga) return next(ApiError.notFound('المانجا مش موجودة'));

    // حذف الغلاف القديم
    if (manga.cover_key) await storage.deleteCover(manga.cover_key);

    // رفع الغلاف الجديد
    const { url, key } = await storage.uploadCover(req.file.buffer, req.file.mimetype, manga.id);
    await manga.update({ cover_url: url, cover_key: key });

    ApiResponse.ok(res, 'تم تحديث الغلاف بنجاح', { cover_url: url });
  } catch (err) { next(err); }
};

/**
 * DELETE /api/admin/manga/:id
 * حذف مانجا + فصولها + صورها من التخزين
 */
const remove = async (req, res, next) => {
  try {
    const param = req.params.id;
    const where = isUUID(param) ? { id: param } : { slug: param };
    const manga = await Manga.findOne({
      where,
      include: [{ model: Chapter, as: 'chapters', attributes: ['id'] }],
    });
    if (!manga) return next(ApiError.notFound('المانجا مش موجودة'));

    // حذف صور كل الفصول من التخزين
    for (const chapter of manga.chapters ?? []) {
      await storage.deleteChapterFolder(manga.id, chapter.id);
    }

    // حذف الغلاف من التخزين
    if (manga.cover_key) await storage.deleteCover(manga.cover_key);

    // حذف المانجا من DB (الـ CASCADE بيعمل باقي الحذف)
    await manga.destroy();

    ApiResponse.noContent(res);
  } catch (err) { next(err); }
};

module.exports = { getAll, getById, create, update, updateCover, remove };
