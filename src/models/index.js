'use strict';

const { sequelize } = require('../core/config/db');

// ─── Import Models ────────────────────────────────────────────────────────────
const Manga           = require('../modules/manga/manga.model');
const Genre           = require('../modules/genres/genre.model');
const Chapter         = require('../modules/chapters/chapter.model');
const Page            = require('../modules/chapters/page.model');
const Comment         = require('../modules/comments/comment.model');
const ReadingProgress = require('../modules/reading-progress/progress.model');

// ─── Associations ─────────────────────────────────────────────────────────────

// Manga ↔ Genre (Many-to-Many عبر جدول manga_genres)
Manga.belongsToMany(Genre, {
  through: 'manga_genres',
  foreignKey: 'manga_id',
  otherKey: 'genre_id',
  as: 'genres',
});
Genre.belongsToMany(Manga, {
  through: 'manga_genres',
  foreignKey: 'genre_id',
  otherKey: 'manga_id',
  as: 'mangas',
});

// Manga → Chapter (One-to-Many)
Manga.hasMany(Chapter, {
  foreignKey: 'manga_id',
  as: 'chapters',
  onDelete: 'CASCADE',
});
Chapter.belongsTo(Manga, {
  foreignKey: 'manga_id',
  as: 'manga',
});

// Chapter → Page (One-to-Many)
Chapter.hasMany(Page, {
  foreignKey: 'chapter_id',
  as: 'pages',
  onDelete: 'CASCADE',
});
Page.belongsTo(Chapter, {
  foreignKey: 'chapter_id',
  as: 'chapter',
});

// Manga → Comment (One-to-Many) — nullable
Manga.hasMany(Comment, {
  foreignKey: 'manga_id',
  as: 'comments',
  onDelete: 'CASCADE',
});
Comment.belongsTo(Manga, {
  foreignKey: 'manga_id',
  as: 'manga',
});

// Chapter → Comment (One-to-Many) — nullable
Chapter.hasMany(Comment, {
  foreignKey: 'chapter_id',
  as: 'comments',
  onDelete: 'CASCADE',
});
Comment.belongsTo(Chapter, {
  foreignKey: 'chapter_id',
  as: 'chapter',
});

// Manga → ReadingProgress (One-to-Many)
Manga.hasMany(ReadingProgress, {
  foreignKey: 'manga_id',
  as: 'progress',
  onDelete: 'CASCADE',
});
ReadingProgress.belongsTo(Manga, {
  foreignKey: 'manga_id',
  as: 'manga',
});

// ─── Sync ─────────────────────────────────────────────────────────────────────

/**
 * بيعمل sync لكل الجداول مع قاعدة البيانات
 * alter: true → بيعدل الجداول الموجودة بدون ما يمسحها
 */
const syncDB = async () => {
  try {
    await sequelize.sync({ alter: true });
    console.log('✅ All tables synced successfully');
  } catch (error) {
    console.error('❌ DB sync failed:', error.message);
    throw error;
  }
};

module.exports = {
  sequelize,
  syncDB,
  Manga,
  Genre,
  Chapter,
  Page,
  Comment,
  ReadingProgress,
};
