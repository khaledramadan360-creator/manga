'use strict';

const { Manga, Chapter, Comment, Page } = require('../../models/index');
const { sequelize } = require('../../models/index');
const ApiResponse = require('../../core/utils/ApiResponse');

/**
 * GET /api/admin/stats
 * إحصائيات لوحة التحكم
 */
const getStats = async (req, res, next) => {
  try {
    const [
      totalManga,
      totalChapters,
      totalPages,
      totalComments,
      totalViews,
    ] = await Promise.all([
      Manga.count(),
      Chapter.count(),
      Page.count(),
      Comment.count(),
      Manga.sum('views'),
    ]);

    ApiResponse.ok(res, 'إحصائيات لوحة التحكم', {
      total_manga:    totalManga    ?? 0,
      total_chapters: totalChapters ?? 0,
      total_pages:    totalPages    ?? 0,
      total_comments: totalComments ?? 0,
      total_views:    totalViews    ?? 0,
    });
  } catch (err) { next(err); }
};

module.exports = { getStats };
