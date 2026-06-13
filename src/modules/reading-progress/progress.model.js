'use strict';

const { DataTypes } = require('sequelize');
const { sequelize } = require('../../core/config/db');

const ReadingProgress = sequelize.define('ReadingProgress', {
  session_id: {
    type: DataTypes.STRING(255),
    allowNull: false,
    primaryKey: true,
  },
  manga_id: {
    type: DataTypes.UUID,
    allowNull: false,
    primaryKey: true,
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
}, {
  tableName: 'reading_progress',
  underscored: true,
  timestamps: true,
  createdAt: false,
  updatedAt: 'updated_at',
});

module.exports = ReadingProgress;
