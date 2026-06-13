'use strict';

const multer = require('multer');
const ApiError = require('../utils/ApiError');

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(ApiError.badRequest('نوع الملف مش مدعوم — بس JPEG / PNG / WebP / GIF'), false);
  }
};

/**
 * رفع صورة واحدة (غلاف المانجا، أفاتار، إلخ)
 * الاستخدام: router.post('/', uploadSingle('cover'), controller)
 */
const uploadSingle = (fieldName) =>
  multer({ storage, fileFilter, limits: { fileSize: MAX_FILE_SIZE } }).single(fieldName);

/**
 * رفع صفحات متعددة دفعة واحدة (Bulk Upload)
 * الاستخدام: router.post('/', uploadBulk('pages'), controller)
 */
const uploadBulk = (fieldName, maxCount = 200) =>
  multer({ storage, fileFilter, limits: { fileSize: MAX_FILE_SIZE } }).array(fieldName, maxCount);

module.exports = { uploadSingle, uploadBulk };
