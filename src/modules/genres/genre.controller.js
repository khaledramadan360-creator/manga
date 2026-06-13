'use strict';

const genreService  = require('./genre.service');
const ApiResponse   = require('../../core/utils/ApiResponse');

/**
 * GET /api/genres
 * كل الأنواع + عدد المانجا لكل نوع
 */
const getAll = async (req, res, next) => {
  try {
    const data = await genreService.getAll();
    ApiResponse.ok(res, 'تم جلب قائمة الأنواع', data);
  } catch (err) { next(err); }
};

/**
 * GET /api/genres/:id/manga
 * المانجا اللي تحت genre معين مع pagination
 */
const getMangaByGenre = async (req, res, next) => {
  try {
    const { genre, data, meta } = await genreService.getMangaByGenre(
      req.params.id,
      req.query,
    );
    ApiResponse.ok(res, `مانجا جونر "${genre.name}"`, data, meta);
  } catch (err) { next(err); }
};

module.exports = { getAll, getMangaByGenre };
