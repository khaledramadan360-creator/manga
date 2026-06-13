'use strict';

const fs       = require('fs/promises');
const path     = require('path');
const supabase = require('../config/supabase');
const env      = require('../config/env');
const ApiError = require('../utils/ApiError');

const BUCKET = env.supabase.bucket;
const UPLOADS_DIR = path.resolve(process.cwd(), 'uploads');

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getExt = (mimetype) => {
  const map = {
    'image/jpeg': 'jpg',
    'image/png':  'png',
    'image/webp': 'webp',
    'image/gif':  'gif',
  };
  return map[mimetype] || 'jpg';
};

const getPublicUrl = (key) => {
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(key);
  return data.publicUrl;
};

const getLocalPublicUrl = (key) => {
  const baseUrl = process.env.APP_URL || `http://localhost:${env.port}`;
  // بنستبدل الـ backslashes بـ forward slashes للـ URL
  return `${baseUrl}/uploads/${key.replace(/\\/g, '/')}`;
};

// ─── Upload ───────────────────────────────────────────────────────────────────

/**
 * رفع غلاف المانجا
 * المسار: covers/{mangaId}.jpg
 *
 * @param {Buffer} buffer
 * @param {string} mimetype
 * @param {string} mangaId
 * @returns {Promise<{ url: string, key: string }>}
 */
const uploadCover = async (buffer, mimetype, mangaId) => {
  const ext = getExt(mimetype);
  const key = `covers/${mangaId}.${ext}`;

  if (env.storageProvider === 'local') {
    try {
      const filePath = path.join(UPLOADS_DIR, key);
      await fs.mkdir(path.dirname(filePath), { recursive: true });
      await fs.writeFile(filePath, buffer);
      return { url: getLocalPublicUrl(key), key };
    } catch (error) {
      console.error('[Storage] Local cover upload error:', error.message);
      throw ApiError.internal('فشل حفظ الغلاف محلياً');
    }
  }

  // Supabase
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(key, buffer, { contentType: mimetype, upsert: true });

  if (error) {
    console.error('[Storage] Supabase Cover upload error:', error.message);
    throw ApiError.internal('فشل رفع الغلاف على Supabase');
  }

  return { url: getPublicUrl(key), key };
};

/**
 * رفع صفحة واحدة
 * المسار: chapters/{mangaId}/{chapterId}/{pageNumber}.jpg
 *
 * @param {Buffer} buffer
 * @param {string} mimetype
 * @param {string} mangaId
 * @param {string} chapterId
 * @param {number} pageNumber
 * @returns {Promise<{ url: string, key: string }>}
 */
const uploadPage = async (buffer, mimetype, mangaId, chapterId, pageNumber) => {
  const ext = getExt(mimetype);
  const key = `chapters/${mangaId}/${chapterId}/${pageNumber}.${ext}`;

  if (env.storageProvider === 'local') {
    try {
      const filePath = path.join(UPLOADS_DIR, key);
      await fs.mkdir(path.dirname(filePath), { recursive: true });
      await fs.writeFile(filePath, buffer);
      return { url: getLocalPublicUrl(key), key };
    } catch (error) {
      console.error('[Storage] Local page upload error:', error.message);
      throw ApiError.internal(`فشل حفظ الصفحة ${pageNumber} محلياً`);
    }
  }

  // Supabase
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(key, buffer, { contentType: mimetype, upsert: true });

  if (error) {
    console.error('[Storage] Supabase Page upload error:', error.message);
    throw ApiError.internal(`فشل رفع الصفحة ${pageNumber} على Supabase`);
  }

  return { url: getPublicUrl(key), key };
};

/**
 * رفع صفحات كتير دفعة واحدة (Bulk Upload)
 * المسار: chapters/{mangaId}/{chapterId}/1.jpg, 2.jpg, ...
 *
 * @param {Express.Multer.File[]} files
 * @param {string} mangaId
 * @param {string} chapterId
 * @param {number} startFrom  - رقم الصفحة اللي هنبدأ منها (default: 1)
 * @returns {Promise<Array<{ url: string, key: string, page_number: number }>>}
 */
const uploadBulkPages = async (files, mangaId, chapterId, startFrom = 1) => {
  const results = await Promise.all(
    files.map((file, index) => {
      const pageNumber = startFrom + index;
      return uploadPage(file.buffer, file.mimetype, mangaId, chapterId, pageNumber)
        .then(({ url, key }) => ({ url, key, page_number: pageNumber }));
    })
  );
  return results;
};

// ─── Delete ───────────────────────────────────────────────────────────────────

/**
 * حذف ملف واحد
 * @param {string} key
 */
const deleteFile = async (key) => {
  if (!key) return;

  if (env.storageProvider === 'local') {
    try {
      const filePath = path.join(UPLOADS_DIR, key);
      await fs.unlink(filePath);
    } catch (err) {
      if (err.code !== 'ENOENT') {
        console.error('[Storage] Local Delete error:', err.message);
      }
    }
    return;
  }

  // Supabase
  const { error } = await supabase.storage.from(BUCKET).remove([key]);
  if (error) console.error('[Storage] Supabase Delete error:', error.message);
};

/**
 * حذف كل صفحات فصل كامل
 * المسار: chapters/{mangaId}/{chapterId}/
 *
 * @param {string} mangaId
 * @param {string} chapterId
 */
const deleteChapterFolder = async (mangaId, chapterId) => {
  const folder = `chapters/${mangaId}/${chapterId}`;

  if (env.storageProvider === 'local') {
    try {
      const folderPath = path.join(UPLOADS_DIR, folder);
      await fs.rm(folderPath, { recursive: true, force: true });
    } catch (err) {
      console.error('[Storage] Local delete folder error:', err.message);
    }
    return;
  }

  // Supabase
  const { data: files, error: listError } = await supabase.storage
    .from(BUCKET)
    .list(folder);

  if (listError) {
    console.error('[Storage] Supabase List error:', listError.message);
    return;
  }

  if (!files || files.length === 0) return;

  const keys = files.map((f) => `${folder}/${f.name}`);
  const { error } = await supabase.storage.from(BUCKET).remove(keys);
  if (error) console.error('[Storage] Supabase Delete folder error:', error.message);
};

/**
 * حذف غلاف المانجا
 * @param {string} coverKey
 */
const deleteCover = async (coverKey) => {
  await deleteFile(coverKey);
};

module.exports = {
  uploadCover,
  uploadPage,
  uploadBulkPages,
  deleteFile,
  deleteChapterFolder,
  deleteCover,
};
