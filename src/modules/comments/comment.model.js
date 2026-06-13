'use strict';

const { DataTypes } = require('sequelize');
const { sequelize } = require('../../core/config/db');

const Comment = sequelize.define('Comment', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  manga_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: { model: 'manga', key: 'id' },
    onDelete: 'CASCADE',
  },
  chapter_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: { model: 'chapters', key: 'id' },
    onDelete: 'CASCADE',
  },
  author_name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    defaultValue: 'زائر',
    validate: {
      notEmpty: { msg: 'اسم الكاتب مش ممكن يكون فاضي' },
      len: { args: [1, 100], msg: 'الاسم بين 1 و100 حرف' },
    },
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'التعليق مش ممكن يكون فاضي' },
      len: { args: [1, 2000], msg: 'التعليق بين 1 و2000 حرف' },
    },
  },
  is_deleted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
}, {
  tableName: 'comments',
  underscored: true,
  timestamps: true,
  updatedAt: false,
});

module.exports = Comment;
