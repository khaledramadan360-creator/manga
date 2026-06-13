'use strict';

const { Op }              = require('sequelize');
const { Genre, Manga }    = require('../../models/index');
const paginate            = require('../../core/utils/pagination');
const ApiError            = require('../../core/utils/ApiError');

/**
 * كل الـ genres مع عدد المانجا لكل genre
 */
const getAll = async () => {
  const genres = await Genre.findAll({
    attributes: ['id', 'name', 'slug'],
    include: [
      {
        model: Manga,
        as: 'mangas',
        attributes: [],          // مش محتاج بيانات المانجا هنا
        through: { attributes: [] },
      },
    ],
    order: [['name', 'ASC']],
  });

  // بنضيف mangaCount لكل genre
  const data = genres.map((g) => ({
    id:         g.id,
    name:       g.name,
    slug:       g.slug,
    mangaCount: g.mangas?.length ?? 0,
  }));

  return data;
};

/**
 * المانجا اللي تحت genre معين مع pagination
 */
const getMangaByGenre = async (id, query) => {
  // نتأكد إن الـ genre موجود
  const genre = await Genre.findByPk(id, { attributes: ['id', 'name', 'slug'] });
  if (!genre) throw ApiError.notFound('الجونر ده مش موجود');

  const { sort, page, limit } = query;

  // ترتيب
  const orderMap = {
    latest:  [['created_at', 'DESC']],
    popular: [['views',      'DESC']],
    'a-z':   [['title',      'ASC']],
  };
  const order = orderMap[sort] || orderMap.latest;

  // عدد المانجا الكلي في الجونر ده
  const total = await Manga.count({
    include: [
      {
        model:    Genre,
        as:       'genres',
        where:    { id },
        through:  { attributes: [] },
        required: true,
      },
    ],
  });

  const { limit: lim, offset, meta } = paginate({ page, limit }, total);

  const rows = await Manga.findAll({
    include: [
      {
        model:    Genre,
        as:       'genres',
        where:    { id },
        through:  { attributes: [] },
        required: true,
        attributes: ['id', 'name', 'slug'],
      },
    ],
    order,
    limit: lim,
    offset,
    attributes: { exclude: ['cover_key'] },
  });

  return { genre, data: rows, meta };
};

module.exports = { getAll, getMangaByGenre };
