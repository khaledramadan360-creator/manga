'use strict';

const { DataTypes } = require('sequelize');
const { sequelize } = require('../../core/config/db');

const Genre = sequelize.define('Genre', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: { msg: 'الجونر ده موجود بالفعل' },
    validate: { notEmpty: { msg: 'اسم الجونر مش ممكن يكون فاضي' } },
  },
  slug: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: { msg: 'الـ slug ده موجود بالفعل' },
    validate: { notEmpty: true },
  },
}, {
  tableName: 'genres',
  underscored: true,
  timestamps: false,
});

module.exports = Genre;
