'use strict';

const { Sequelize } = require('sequelize');
const env = require('./env');

const sequelize = new Sequelize(env.db.name, env.db.user, env.db.pass, {
  host: env.db.host,
  port: env.db.port,
  dialect: env.db.dialect,
  logging: env.isDev ? (msg) => console.log(`[DB] ${msg}`) : false,
  dialectOptions: process.env.DB_SSL === 'true' ? {
    ssl: {
      rejectUnauthorized: false // can be set to true if Node has trusted certificates, false is safer for varying server envs
    }
  } : {},
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
  define: {
    timestamps: true,
    underscored: true,
  },
});

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected successfully');
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB };
