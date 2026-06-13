'use strict';

/**
 * دالة لتوليد slug نظيف من نص عربي أو إنجليزي أو مختلط
 * - تحول الإنجليزي لـ lowercase
 * - تستبدل المسافات والرموز بشرطة -
 * - تحتفظ بالأحرف العربية والإنجليزية والأرقام فقط
 *
 * @param {string} text - النص المراد تحويله
 * @returns {string} - الـ slug الجاهز
 *
 * مثال:
 *   slugify('Look Back!! Part 1') => 'look-back-part-1'
 *   slugify('ون بيس 123!')        => 'ون-بيس-123'
 *   slugify('Boku no Hero Academia') => 'boku-no-hero-academia'
 */
const slugify = (text) => {
  return text
    .toLowerCase()
    .trim()
    // استبدال المسافات والرموز الخاصة بشرطة
    .replace(/[\s_]+/g, '-')
    // إزالة كل حرف مش عربي أو إنجليزي أو رقم أو شرطة
    // الـ Range العربي في Unicode هو \u0600-\u06FF
    .replace(/[^\u0600-\u06FFa-z0-9-]/g, '')
    // إزالة الشرطات المتكررة
    .replace(/-+/g, '-')
    // إزالة الشرطة من البداية والنهاية
    .replace(/^-+|-+$/g, '');
};

/**
 * توليد slug فريد في حالة وجود تعارض (collision)
 * بيضيف رقم تصاعدي في آخر الـ slug
 *
 * @param {string}   baseSlug    - الـ slug الأساسي
 * @param {Function} checkExists - دالة async ترجع true لو الـ slug موجود مسبقاً
 * @param {string}   [excludeId] - معرف الصف الحالي لاستثنائه من البحث (عند التعديل)
 * @returns {Promise<string>}    - الـ slug الفريد
 */
const uniqueSlug = async (baseSlug, checkExists, excludeId = null) => {
  let slug = baseSlug;
  let counter = 1;

  while (await checkExists(slug, excludeId)) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
};

module.exports = { slugify, uniqueSlug };
