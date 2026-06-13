'use strict';

const { Op }     = require('sequelize');
const { Manga, Genre, Chapter } = require('../../models/index');
const paginate   = require('../../core/utils/pagination');
const ApiError   = require('../../core/utils/ApiError');

/**
 * قايمة المانجا مع بحث + فلترة + pagination
 */
const getAll = async (query) => {
  const { search, genre, status, type, sort, page, limit } = query;

  const where  = {};
  const include = [
    { model: Genre, as: 'genres', attributes: ['id', 'name', 'slug'], through: { attributes: [] } },
    { model: Chapter, as: 'chapters', attributes: ['id'], required: false },
  ];

  // ─── فلترة ────────────────────────────────────────────────────────────────
  if (search) {
    where[Op.or] = [
      { title:     { [Op.like]: `%${search}%` } },
      { title_alt: { [Op.like]: `%${search}%` } },
      { author:    { [Op.like]: `%${search}%` } },
    ];
  }
  if (status) where.status = status;
  if (type)   where.type   = type;

  // ─── فلترة بالجونر ────────────────────────────────────────────────────────
  if (genre) {
    const slugs = genre.split(',').map((s) => s.trim());
    include[0].where  = { slug: { [Op.in]: slugs } };
    include[0].required = true;
  }

  // ─── الترتيب ──────────────────────────────────────────────────────────────
  const orderMap = {
    latest:  [['created_at', 'DESC']],
    popular: [['views', 'DESC']],
    'a-z':   [['title', 'ASC']],
  };
  const order = orderMap[sort] || orderMap.latest;

  // ─── Pagination ───────────────────────────────────────────────────────────
  const total = await Manga.count({ where, include: genre ? [include[0]] : [] });
  const { limit: lim, offset, meta } = paginate({ page, limit }, total);

  const rows = await Manga.findAll({
    where,
    include,
    order,
    limit: lim,
    offset,
    attributes: { exclude: ['cover_key'] },
  });

  // بنضيف عدد الفصول لكل مانجا
  const data = rows.map((m) => ({
    ...m.toJSON(),
    chapters_count: m.chapters?.length ?? 0,
    chapters: undefined,
  }));

  return { data, meta };
};

/**
 * تفاصيل مانجا واحدة بالـ slug + جونراتها + عدد فصولها
 */
const getBySlug = async (slug) => {
  const manga = await Manga.findOne({
    where: { slug },
    include: [
      { model: Genre,   as: 'genres',   attributes: ['id', 'name', 'slug'], through: { attributes: [] } },
      { model: Chapter, as: 'chapters', attributes: ['id', 'chapter_number', 'title', 'views', 'created_at'], order: [['chapter_number', 'ASC']] },
    ],
    attributes: { exclude: ['cover_key'] },
  });

  if (!manga) throw ApiError.notFound('المانجا دي مش موجودة');

  // زيادة المشاهدات
  await manga.increment('views');

  return manga;
};

/**
 * آخر 20 فصل اتضاف (للـ home page)
 */
const getLatest = async () => {
  const chapters = await Chapter.findAll({
    order: [['created_at', 'DESC']],
    limit: 20,
    attributes: ['id', 'chapter_number', 'title', 'created_at'],
    include: [
      {
        model: Manga,
        as: 'manga',
        attributes: ['id', 'slug', 'title', 'cover_url', 'type', 'status'],
      },
    ],
  });
  return chapters;
};

/**
 * الأكثر مشاهدة
 */
const getPopular = async () => {
  const mangas = await Manga.findAll({
    order:  [['views', 'DESC']],
    limit:  20,
    attributes: { exclude: ['cover_key', 'description'] },
    include: [
      { model: Genre, as: 'genres', attributes: ['id', 'name', 'slug'], through: { attributes: [] } },
    ],
  });
  return mangas;
};

module.exports = { getAll, getBySlug, getLatest, getPopular };
