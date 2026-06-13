'use strict';

const express  = require('express');
const path     = require('path');
const helmet   = require('helmet');
const cors     = require('cors');
const env      = require('./core/config/env');
const { generalLimiter } = require('./core/middleware/rateLimiter.middleware');
const adminKeyMiddleware  = require('./core/middleware/adminKey.middleware');
const errorHandler        = require('./core/middleware/errorHandler.middleware');

const app = express();

// ─── Trust Proxy (For express-rate-limit behind proxies like Render/Vercel) ───
app.set('trust proxy', 1);

// ─── Static Files (For Local Storage) ─────────────────────────────────────────
app.use('/uploads', express.static(path.resolve(process.cwd(), 'uploads')));

// ─── Security ─────────────────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({ origin: env.frontendUrl, credentials: true }));

// ─── Body Parsing ─────────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Rate Limiting ────────────────────────────────────────────────────────────
app.use(generalLimiter);

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ success: true, message: '✅ السيرفر شغال', env: env.nodeEnv });
});

// ─── Public Routes (Read Only) ────────────────────────────────────────────────
app.use('/api/manga',    require('./modules/manga/manga.routes'));
app.use('/api/genres',   require('./modules/genres/genre.routes'));
app.use('/api/chapters', require('./modules/chapters/chapter.routes'));
// app.use('/api/comments', require('./modules/comments/comment.routes'));
// app.use('/api/progress', require('./modules/reading-progress/progress.routes'));

// ─── Admin Routes (Protected by X-Admin-Key) ─────────────────────────────────
const { adminLimiter } = require('./core/middleware/rateLimiter.middleware');
app.use('/api/admin', adminLimiter, adminKeyMiddleware, require('./admin/admin.routes'));

// ─── 404 Handler ──────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'المسار مش موجود' });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use(errorHandler);

module.exports = app;
