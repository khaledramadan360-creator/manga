'use strict';

const { DataTypes } = require('sequelize');
const { sequelize } = require('../../core/config/db');

const Page = sequelize.define('Page', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  chapter_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'chapters', key: 'id' },
    onDelete: 'CASCADE',
  },
  page_number: {
    type: DataTypes.SMALLINT,
    allowNull: false,
    validate: {
      min: { args: [1], msg: 'رقم الصفحة لازم يبدأ من 1' },
    },
  },
  image_url: {
    type: DataTypes.STRING(500),
    allowNull: false,
  },
  image_key: {
    type: DataTypes.STRING(500),
    allowNull: false,
  },
}, {
  tableName: 'pages',
  underscored: true,
  timestamps: false,
  indexes: [
    {
      unique: true,
      fields: ['chapter_id', 'page_number'],
      name: 'unique_chapter_page',
    },
  ],
});

module.exports = Page;
