'use strict';

const mangaService  = require('./manga.service');
const ApiResponse   = require('../../core/utils/ApiResponse');

const getAll = async (req, res, next) => {
  try {
    const { data, meta } = await mangaService.getAll(req.query);
    ApiResponse.ok(res, 'تم جلب قايمة المانجا', data, meta);
  } catch (err) { next(err); }
};

const getBySlug = async (req, res, next) => {
  try {
    const manga = await mangaService.getBySlug(req.params.slug);
    ApiResponse.ok(res, 'تم جلب بيانات المانجا', manga);
  } catch (err) { next(err); }
};

const getLatest = async (req, res, next) => {
  try {
    const data = await mangaService.getLatest();
    ApiResponse.ok(res, 'آخر التحديثات', data);
  } catch (err) { next(err); }
};

const getPopular = async (req, res, next) => {
  try {
    const data = await mangaService.getPopular();
    ApiResponse.ok(res, 'الأكثر مشاهدة', data);
  } catch (err) { next(err); }
};

module.exports = { getAll, getBySlug, getLatest, getPopular };
