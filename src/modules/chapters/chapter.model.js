'use strict';

const { DataTypes } = require('sequelize');
const { sequelize } = require('../../core/config/db');

const Chapter = sequelize.define('Chapter', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  manga_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'manga', key: 'id' },
    onDelete: 'CASCADE',
  },
  chapter_number: {
    type: DataTypes.DECIMAL(6, 1),
    allowNull: false,
    validate: {
      min: { args: [0], msg: 'رقم الفصل لازم يكون أكبر من 0' },
    },
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  views: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
}, {
  tableName: 'chapters',
  underscored: true,
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['manga_id', 'chapter_number'],
      name: 'unique_manga_chapter',
    },
  ],
});

module.exports = Chapter;
