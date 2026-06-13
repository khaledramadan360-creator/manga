'use strict';

const { DataTypes } = require('sequelize');
const { sequelize } = require('../../core/config/db');

const Manga = sequelize.define('Manga', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: { notEmpty: { msg: 'العنوان مش ممكن يكون فاضي' } },
  },
  title_alt: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  slug: {
    type: DataTypes.STRING(255),
    allowNull: true,  // null مؤقتاً — سيُعيَّن NOT NULL بعد الهجرة
    unique: false,    // الـ UNIQUE INDEX بيتضاف يدوياً بعد الهجرة (TiDB لا يدعم ADD COLUMN UNIQUE)
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  cover_url: {
    type: DataTypes.STRING(500),
    allowNull: true,
  },
  cover_key: {
    type: DataTypes.STRING(500),
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('ongoing', 'completed', 'hiatus', 'cancelled'),
    allowNull: false,
    defaultValue: 'ongoing',
  },
  type: {
    type: DataTypes.ENUM('manga', 'manhwa', 'manhua'),
    allowNull: false,
    defaultValue: 'manga',
  },
  author: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  artist: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  release_year: {
    type: DataTypes.SMALLINT,
    allowNull: true,
  },
  views: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
}, {
  tableName: 'manga',
  underscored: true,
  timestamps: true,
});

module.exports = Manga;
