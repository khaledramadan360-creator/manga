'use strict';

require('dotenv').config();

const required = [
  'PORT',
  'DB_DIALECT',
  'DB_HOST',
  'DB_PORT',
  'DB_NAME',
  'DB_USER',
  'DB_PASS',
  'ADMIN_API_KEY',
];

const storageProvider = process.env.STORAGE_PROVIDER || 'supabase';
if (storageProvider === 'supabase') {
  required.push('SUPABASE_URL', 'SUPABASE_KEY', 'SUPABASE_BUCKET');
}

const missing = required.filter((key) => !process.env[key]);
if (missing.length > 0) {
  console.error(`❌ Missing env variables: ${missing.join(', ')}`);
  process.exit(1);
}

const env = {
  port: parseInt(process.env.PORT, 10) || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  isDev: process.env.NODE_ENV !== 'production',
  storageProvider: process.env.STORAGE_PROVIDER || 'supabase',

  db: {
    dialect: process.env.DB_DIALECT,
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT, 10),
    name: process.env.DB_NAME,
    user: process.env.DB_USER,
    pass: process.env.DB_PASS,
  },

  admin: {
    apiKey: process.env.ADMIN_API_KEY,
  },

  supabase: {
    url: process.env.SUPABASE_URL,
    key: process.env.SUPABASE_KEY,
    bucket: process.env.SUPABASE_BUCKET,
  },

  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
};

module.exports = env;
